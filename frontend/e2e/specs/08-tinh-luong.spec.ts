import { test, expect } from '@playwright/test'
import { LuongPage } from '../pages/admin/luong.page'
import { getAuthToken, makeGetRequest } from '../helpers/api'

/**
 * Use a fixed month that won't collide with previously-created locked ky_luongs.
 * Append seconds since midnight to ensure uniqueness within a day.
 */
function uniqueMonthYear(): { thang: number; nam: number } {
  const now = Date.now()
  const startOf2026 = new Date(2026, 0, 1).getTime()
  const secondsSince2026 = Math.floor((now - startOf2026) / 1000)
  // Cap at year 2100 (backend validates nam <= 2100)
  const maxOffset = (2100 - 2026 + 1) * 12 // 900 months
  const offset = secondsSince2026 % maxOffset
  const baseMonths = 2026 * 12
  const totalMonths = baseMonths + offset
  const thang = ((totalMonths - 1) % 12) + 1
  const nam = Math.floor((totalMonths - 1) / 12)
  return { thang, nam }
}

test.describe('Tính lương', () => {
  test('chạy lương tháng - cấu hình, tạo lương, chạy lương, duyệt, chốt, xem phiếu lương', async ({ page }) => {
    const luongPage = new LuongPage(page)
    const { thang, nam } = uniqueMonthYear()

    await luongPage.goto()

    const result = await page.evaluate(async (opts: { thang: number; nam: number }) => {
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return 'no_auth'
      let p = JSON.parse(raw)
      if (typeof p === 'string') p = JSON.parse(p)
      const s = p.state || p
      const token = s.accessToken
      if (!token) return 'no_token'
      const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const api = 'http://localhost:8000'

      const firstOfMonth = `${opts.nam}-${String(opts.thang).padStart(2, '0')}-01`

      // 1. Create config
      const cfgRes = await fetch(`${api}/api/v1/admin/luong/cau-hinh`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          ngay_ap_dung: firstOfMonth, luong_co_so: 2340000, he_so_dac_thu: 1.0,
          ty_le_bhxh: 8, ty_le_bhyt: 1.5, ty_le_bhtn: 1,
          muc_giam_tru_ban_than: 11000000, muc_giam_tru_nguoi_phu_thuoc: 4400000,
          ghi_chu: 'Cấu hình test E2E',
        }),
      })
      if (!cfgRes.ok) return `create_config_failed:${await cfgRes.text()}`
      const cfgData = await cfgRes.json()
      const cfgId = cfgData.data?.id
      if (!cfgId) return 'no_config_id'

      // 2. Activate config
      const actRes = await fetch(`${api}/api/v1/admin/luong/cau-hinh/${cfgId}/activate`, {
        method: 'PUT', headers: h,
      })
      if (!actRes.ok) return `activate_config_failed:${await actRes.text()}`

      // 3. Find employee and create salary record
      const empListRes = await fetch(`${api}/api/v1/admin/nhan-vien?page=1&page_size=10`, { headers: h })
      const empData = await empListRes.json()
      const emp = (empData.data || [])[0]
      if (!emp) return 'no_employees'

      // Check if ky_luong already exists for this month (from a previous test run)
      const klCheck = await fetch(`${api}/api/v1/admin/luong/ky-luong?thang=${opts.thang}&nam=${opts.nam}`, { headers: h })
      const klCheckData = await klCheck.json()
      const existingKl = (klCheckData.data || [])[0]
      if (existingKl && existingKl.trang_thai === 'da_chot') {
        return existingKl.id
      }

      const luongRes = await fetch(`${api}/api/v1/admin/luong`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          nhan_vien_id: emp.id, he_so_luong: 2.34, so_nam_tham_nien: 0,
          ty_le_pc_uu_dai: 30, he_so_khu_vuc: 0, phu_cap_chuc_vu: 0,
          phu_cap_tham_nien_vuot_khung: 0, phu_cap_khac: 0, khau_tru_khac: 0,
          hieu_luc_tu: firstOfMonth, ghi_chu: 'Lương test E2E',
        }),
      })
      if (!luongRes.ok) return `create_luong_failed:${await luongRes.text()}`

      // 4. Mock generate attendance
      const mockRes = await fetch(`${api}/api/v1/admin/nghi-phep/cham-cong/mock/generate`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ thang: opts.thang, nam: opts.nam }),
      })
      if (!mockRes.ok) return `mock_failed:${await mockRes.text()}`

      // 5. Run salary calculation
      const chayRes = await fetch(`${api}/api/v1/admin/luong/chay-luong`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ thang: opts.thang, nam: opts.nam }),
      })
      if (!chayRes.ok) return `chay_luong_failed:${await chayRes.text()}`
      const chayData = await chayRes.json()
      const kyLuongId = chayData.data?.ky_luong_id
      if (!kyLuongId) return 'no_ky_luong_id'

      // 6. Approve (duyệt)
      const duyetRes = await fetch(`${api}/api/v1/admin/luong/ky-luong/${kyLuongId}/duyet`, {
        method: 'PUT', headers: h,
      })
      if (!duyetRes.ok) return `duyet_failed:${await duyetRes.text()}`

      // 7. Finalize (chốt)
      const chotRes = await fetch(`${api}/api/v1/admin/luong/ky-luong/${kyLuongId}/chot`, {
        method: 'PUT', headers: h,
      })
      if (!chotRes.ok) return `chot_failed:${await chotRes.text()}`

      return kyLuongId
    }, { thang, nam })
    expect(result).not.toMatch(/failed|no_/)
    const kyLuongId = result as string

    // Step 8: Verify via API that tra_luong records exist
    const token = await getAuthToken(page)
    const traLuongList = await makeGetRequest(page, token!, `/api/v1/admin/luong/ky-luong/${kyLuongId}/tra-luong`)
    expect(traLuongList.data?.length).toBeGreaterThan(0)

    // Step 9: View payslips via UI
    await page.reload()
    await page.waitForTimeout(2000)

    // Click chi tiết on the first ky_luong row to navigate to payslips
    await luongPage.clickPhieuLuongChiTiet()
    await page.waitForTimeout(500)

    // Wait for payslip tab content to load
    await expect(page.getByText(/Phiếu lương - Kỳ:/)).toBeVisible({ timeout: 10000 })
    const phieuLuongRows = page.locator('[data-slot="table"] tbody tr')
    await expect(phieuLuongRows.first()).toBeVisible({ timeout: 10000 })
    const phieuCount = await phieuLuongRows.count()
    expect(phieuCount).toBeGreaterThan(0)
  })
})
