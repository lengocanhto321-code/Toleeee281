import { test, expect } from '@playwright/test'
import { tinhLuongExpected, type AttendanceData } from '../helpers/salary-assertions'

function uniqueMonthYear(): { thang: number; nam: number } {
  const now = Date.now()
  const startOf2026 = new Date(2026, 0, 1).getTime()
  const secondsSince2026 = Math.floor((now - startOf2026) / 1000)
  const maxOffset = (2100 - 2026 + 1) * 12
  const offset = secondsSince2026 % maxOffset
  const baseMonths = 2026 * 12
  const totalMonths = baseMonths + offset
  const thang = ((totalMonths - 1) % 12) + 1
  const nam = Math.floor((totalMonths - 1) / 12)
  return { thang, nam }
}

test.describe('Sync chấm công - lương', () => {
  test('thay đổi chấm công ảnh hưởng đến lương đúng tỷ lệ', async ({ page }) => {
    const { thang, nam } = uniqueMonthYear()
    const firstOfMonth = `${nam}-${String(thang).padStart(2, '0')}-01`

    await page.goto('/luong')
    await expect(page.locator('[data-slot="breadcrumb-page"]')).toHaveText('Lương')

    // ================================================
    // SETUP
    // ================================================
    const setupResult = await page.evaluate(async (opts: { firstOfMonth: string; thang: number; nam: number }) => {
      const raw = localStorage.getItem('auth-storage')
      let p = JSON.parse(raw)
      if (typeof p === 'string') p = JSON.parse(p)
      const token = (p.state || p).accessToken
      const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const api = 'http://localhost:8000'

      // 1. Get first existing employee
      const empList = await fetch(`${api}/api/v1/admin/nhan-vien?page=1&page_size=10`, { headers: h })
      const empData = await empList.json()
      const emp = (empData.data || [])[0]
      if (!emp) return 'no_employee'
      const empId = emp.id

      // 2. Create salary config & activate
      const cfgRes = await fetch(`${api}/api/v1/admin/luong/cau-hinh`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          ngay_ap_dung: opts.firstOfMonth, luong_co_so: 2340000, he_so_dac_thu: 1.0,
          ty_le_bhxh: 8, ty_le_bhyt: 1.5, ty_le_bhtn: 1,
          muc_giam_tru_ban_than: 11000000, muc_giam_tru_nguoi_phu_thuoc: 4400000,
          ghi_chu: 'Cấu hình test sync',
        }),
      })
      if (!cfgRes.ok) return `create_cfg_failed:${await cfgRes.text()}`
      const cfgData = await cfgRes.json()
      const cfgId = cfgData.data?.id
      if (!cfgId) return 'no_cfg_id'

      const actRes = await fetch(`${api}/api/v1/admin/luong/cau-hinh/${cfgId}/activate`, {
        method: 'PUT', headers: h,
      })
      if (!actRes.ok) return `activate_cfg_failed:${await actRes.text()}`

      // 3. Create salary record (CreateLuongUseCase will close any existing one)
      const luongRes = await fetch(`${api}/api/v1/admin/luong`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          nhan_vien_id: empId, he_so_luong: 2.34, so_nam_tham_nien: 0,
          ty_le_pc_uu_dai: 0, he_so_khu_vuc: 0, phu_cap_chuc_vu: 0,
          phu_cap_tham_nien_vuot_khung: 0, phu_cap_khac: 0, khau_tru_khac: 0,
          hieu_luc_tu: opts.firstOfMonth, ghi_chu: 'Lương test sync',
        }),
      })
      if (!luongRes.ok) return `create_luong_failed:${await luongRes.text()}`

      // 4. Mock generate attendance
      const mockRes = await fetch(`${api}/api/v1/admin/nghi-phep/cham-cong/mock/generate`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ thang: opts.thang, nam: opts.nam }),
      })
      if (!mockRes.ok) return `mock_failed:${await mockRes.text()}`

      // 5. Get the cham_cong id
      const ccList = await fetch(
        `${api}/api/v1/admin/nghi-phep/cham-cong/thang?page=1&page_size=10&nhan_vien_id=${empId}&thang=${opts.thang}&nam=${opts.nam}`,
        { headers: h }
      )
      const ccData = await ccList.json()
      const ccItem = (ccData.data || [])[0]
      if (!ccItem) return 'no_cham_cong_for_emp'

      return JSON.stringify({ empId, chamCongId: ccItem.id, empName: emp.ho_ten })
    }, { firstOfMonth, thang, nam })
    expect(setupResult).not.toMatch(/failed|no_/)

    const parsed = JSON.parse(setupResult as string)
    const empId: string = parsed.empId
    const chamCongId: string = parsed.chamCongId
    console.log(`Employee: ${parsed.empName} (${empId}), chamCongId: ${chamCongId}`)

    // ================================================
    // RUN SCENARIOS
    // ================================================
    interface CCUpdate {
      so_ngay_co_mat: number
      so_ngay_vang_co_phep: number
      so_ngay_vang_khong_phep: number
    }

    const scenarios: { name: string; update: CCUpdate; expectedAtt: AttendanceData }[] = [
      {
        name: 'Full công (26/26)',
        update: { so_ngay_co_mat: 26, so_ngay_vang_co_phep: 0, so_ngay_vang_khong_phep: 0 },
        expectedAtt: { soNgayCoMat: 26, soNgayVangCoPhep: 0, soNgayVangKhongPhep: 0, soNgayNghiLeTet: 0, soNgayCongTac: 0, soNgayLamChuan: 26 },
      },
      {
        name: 'Giảm công (20/26)',
        update: { so_ngay_co_mat: 20, so_ngay_vang_co_phep: 0, so_ngay_vang_khong_phep: 0 },
        expectedAtt: { soNgayCoMat: 20, soNgayVangCoPhep: 0, soNgayVangKhongPhep: 0, soNgayNghiLeTet: 0, soNgayCongTac: 0, soNgayLamChuan: 26 },
      },
      {
        name: 'Nghỉ phép có lương (20 + 3 phép)',
        update: { so_ngay_co_mat: 20, so_ngay_vang_co_phep: 3, so_ngay_vang_khong_phep: 0 },
        expectedAtt: { soNgayCoMat: 20, soNgayVangCoPhep: 3, soNgayVangKhongPhep: 0, soNgayNghiLeTet: 0, soNgayCongTac: 0, soNgayLamChuan: 26 },
      },
      {
        name: 'Nghỉ không phép (20 - 3 không phép)',
        update: { so_ngay_co_mat: 20, so_ngay_vang_co_phep: 0, so_ngay_vang_khong_phep: 3 },
        expectedAtt: { soNgayCoMat: 20, soNgayVangCoPhep: 0, soNgayVangKhongPhep: 3, soNgayNghiLeTet: 0, soNgayCongTac: 0, soNgayLamChuan: 26 },
      },
    ]

    const params = { heSoLuong: 2.34, luongCoSo: 2340000, heSoDacThu: 1.0 }
    const BASE_CC = '/api/v1/admin/nghi-phep/cham-cong/thang'

    for (const sc of scenarios) {
      const result = await page.evaluate(
        async (opts: { chamCongId: string; thang: number; nam: number; empId: string; update: CCUpdate }) => {
          const raw = localStorage.getItem('auth-storage')
          let p = JSON.parse(raw)
          if (typeof p === 'string') p = JSON.parse(p)
          const token = (p.state || p).accessToken
          const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          const api = 'http://localhost:8000'

          // 1. Update cham_cong
          const updateRes = await fetch(`${api}/api/v1/admin/nghi-phep/cham-cong/thang/${opts.chamCongId}`, {
            method: 'PUT', headers: h,
            body: JSON.stringify(opts.update),
          })
          if (!updateRes.ok) return `update_cc_failed:${await updateRes.text()}`

          // 2. Run chay-luong (with specific employee IDs to ensure our emp is processed)
          const chayRes = await fetch(`${api}/api/v1/admin/luong/chay-luong`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ thang: opts.thang, nam: opts.nam, danh_sach_nhan_vien_ids: [opts.empId] }),
          })
          if (!chayRes.ok) return `chay_failed:${await chayRes.text()}`
          const chayData = await chayRes.json()
          const kyLuongId = chayData.data?.ky_luong_id
          if (!kyLuongId) return 'no_ky_luong_id'

          // 3. Get tra_luong for this employee
          const tlRes = await fetch(`${api}/api/v1/admin/luong/ky-luong/${kyLuongId}/tra-luong?page=1&page_size=50`, { headers: h })
          const tlData = await tlRes.json()
          const tlItems = (tlData.data || [])
          const myTraLuong = tlItems.find((tl: any) => tl.nhan_vien_id === opts.empId)
          if (!myTraLuong) return `no_tra_luong_items_${tlItems.length}_found_ids_${tlItems.map((t: any) => t.nhan_vien_id).join(',')}`

          return {
            kyLuongId,
            traLuong: {
              luong_co_ban: myTraLuong.luong_co_ban,
              so_ngay_cong_chuan: myTraLuong.so_ngay_cong_chuan,
              so_ngay_cong_thuc_te: myTraLuong.so_ngay_cong_thuc_te,
              phu_cap_uu_dai: myTraLuong.phu_cap_uu_dai,
              tong_thu_nhap: myTraLuong.tong_thu_nhap,
              bhxh: myTraLuong.bhxh,
              bhyt: myTraLuong.bhyt,
              bhtn: myTraLuong.bhtn,
              luong_thuc_nhan: myTraLuong.luong_thuc_nhan,
            },
          }
        },
        { chamCongId, thang, nam, empId, update: sc.update }
      )

      if (typeof result === 'string') {
        throw new Error(`Scenario "${sc.name}" failed: ${result}`)
      }

      const r = result as any
      console.log(sc.name, JSON.stringify(r.traLuong))

      expect(r.traLuong.so_ngay_cong_chuan).toBe(sc.expectedAtt.soNgayLamChuan)
      expect(r.traLuong.so_ngay_cong_thuc_te).toBe(sc.update.so_ngay_co_mat)

      const expected = tinhLuongExpected(params, sc.expectedAtt)

      const closeTo = (actual: number, expected: number) => {
        expect(Math.abs(actual - expected)).toBeLessThanOrEqual(2)
      }

      closeTo(r.traLuong.luong_co_ban, expected.luongCoBan)
      closeTo(r.traLuong.tong_thu_nhap, expected.tongThuNhap)
      closeTo(r.traLuong.bhxh, expected.bhxh)
      closeTo(r.traLuong.bhyt, expected.bhyt)
      closeTo(r.traLuong.bhtn, expected.bhtn)
      closeTo(r.traLuong.luong_thuc_nhan, expected.luongThucNhan)
    }

    // ================================================
    // DUYỆT + CHỐT + UI VERIFY
    // ================================================
    const finalizeResult = await page.evaluate(async (opts: { thang: number; nam: number }) => {
      const raw = localStorage.getItem('auth-storage')
      let p = JSON.parse(raw)
      if (typeof p === 'string') p = JSON.parse(p)
      const token = (p.state || p).accessToken
      const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const api = 'http://localhost:8000'

      const klRes = await fetch(`${api}/api/v1/admin/luong/ky-luong?thang=${opts.thang}&nam=${opts.nam}`, { headers: h })
      const klData = await klRes.json()
      const kl = (klData.data || [])[0]
      if (!kl) return 'no_ky_luong'

      const duyetRes = await fetch(`${api}/api/v1/admin/luong/ky-luong/${kl.id}/duyet`, { method: 'PUT', headers: h })
      if (!duyetRes.ok) return `duyet_failed:${await duyetRes.text()}`

      const chotRes = await fetch(`${api}/api/v1/admin/luong/ky-luong/${kl.id}/chot`, { method: 'PUT', headers: h })
      if (!chotRes.ok) return `chot_failed:${await chotRes.text()}`

      return kl.id
    }, { thang, nam })
    expect(finalizeResult).not.toMatch(/failed|no_/)

    // UI verify
    await page.reload()
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'Chi tiết' }).first().click()
    await page.waitForTimeout(500)

    await expect(page.getByText(/Phiếu lương - Kỳ:/)).toBeVisible({ timeout: 10000 })
    const tlRows = page.locator('[data-slot="table"] tbody tr')
    await expect(tlRows.first()).toBeVisible({ timeout: 10000 })
    const tlCount = await tlRows.count()
    expect(tlCount).toBeGreaterThan(0)
  })
})
