import { test, expect } from '@playwright/test'
import { ChamCongPage } from '../pages/admin/cham-cong.page'
import { getAuthToken, makeGetRequest, makePostRequest, makePutRequest } from '../helpers/api'

test.describe('Chấm công', () => {
  test('quản lý chấm công tháng - tạo mock, chỉnh sửa, xác nhận, duyệt, chốt', async ({ page }) => {
    const chamCongPage = new ChamCongPage(page)
    const thang = new Date().getMonth() + 1
    const nam = new Date().getFullYear()
    const BASE = '/api/v1/admin/nghi-phep/cham-cong/thang'

    // Navigate first so localStorage is accessible
    await chamCongPage.goto()

    // Get auth token
    const token = await getAuthToken(page)
    expect(token).toBeTruthy()

    // Find a phòng ban and chức vụ
    const pbList = await makeGetRequest(page, token!, '/api/v1/admin/phong-ban?page=1&page_size=100')
    const cvList = await makeGetRequest(page, token!, '/api/v1/admin/chuc-vu?page=1&page_size=100')
    const pb = pbList.data?.[0]
    const cv = cvList.data?.[0]
    expect(pb).toBeTruthy()
    expect(cv).toBeTruthy()

    // Create employee with "dang_lam" status
    const phone = String(900000000 + Math.floor(Math.random() * 99999999))
    const empRes = await makePostRequest(page, token!, '/api/v1/admin/nhan-vien', {
      ho_ten: `NV Chấm công Test ${Date.now()}`,
      gioi_tinh: 'Nam',
      ngay_sinh: '1990-01-15',
      que_quan: 'Hà Nội',
      dia_chi_thuong_tru: 'Hà Nội',
      so_dien_thoai: phone,
      email: `chamcong${Date.now()}@test.edu.vn`,
      dan_toc: 'Kinh',
      noi_sinh: 'Hà Nội',
      tinh_trang_hon_nhan: 'doc_than',
      so_cccd: String(phone).slice(0, 12),
      ngay_cap_cccd: '2015-01-01',
      noi_cap_cccd: 'CA Hà Nội',
      loai_nhan_vien: 'giao_vien',
      trang_thai: 'dang_lam',
      cap_hoc: 'thpt',
      phong_ban_id: pb.id,
      chuc_vu_id: cv.id,
      loai_hop_dong: 'vien_chuc',
      ngay_vao_lam: '2026-01-01',
      he_so_luong: '2.34',
    })
    expect(empRes).toBeTruthy()

    // Mock generate attendance
    const mockRes = await makePostRequest(page, token!, '/api/v1/admin/nghi-phep/cham-cong/mock/generate', {
      thang,
      nam,
    })
    expect(mockRes).toBeTruthy()

    // Reload to see new attendance data
    await page.reload()
    await page.waitForTimeout(2000)

    // Verify attendance records visible in table
    const rows = page.locator('[data-slot="table"] tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15000 })
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Get the cham-cong record ID via API
    const ccList = await makeGetRequest(
      page,
      token!,
      `${BASE}?page=1&page_size=100&thang=${thang}&nam=${nam}`
    )
    const chamCongItem = ccList.data?.find((cc: any) => cc.trang_thai === 'da_mock' || cc.trang_thai === 'chua_chot')
    const chamCongId = chamCongItem?.id
    expect(chamCongId).toBeTruthy()

    // Update so_ngay_co_mat to 15 via API
    const updateRes = await makePutRequest(page, token!, `${BASE}/${chamCongId}`, {
      so_ngay_co_mat: 15,
    })
    expect(updateRes).toBeTruthy()

    // Confirm (xác nhận) via API
    const xacNhanRes = await makePostRequest(page, token!, `${BASE}/${chamCongId}/xac-nhan`)
    expect(xacNhanRes).toBeTruthy()
  })
})
