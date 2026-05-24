import { test, expect } from '@playwright/test'
import { NhanVienListPage } from '../pages/admin/nhan-vien-list.page'
import { NhanVienDetailPage } from '../pages/admin/nhan-vien-detail.page'
import { PhongBanPage } from '../pages/admin/phong-ban.page'
import { ChucVuPage } from '../pages/admin/chuc-vu.page'
import { testData } from '../data/test-data'

test.describe('Nhân viên', () => {
  const phongBanData = testData.phongBan
  const chucVuData = testData.chucVu
  const nhanVienData = testData.nhanVien
  const nguoiThanData = testData.nguoiThan
  const bangCapData = testData.bangCap
  const khenThuongData = testData.khenThuong
  const kyLuatData = testData.kyLuat
  const hopDongData = testData.hopDong

  test('CRUD nhân viên + sub-modules - create, tabs, edit, delete', async ({ page }) => {
    // Setup: create department and position first
    const phongBanPage = new PhongBanPage(page)
    await phongBanPage.goto()
    await phongBanPage.create(phongBanData)

    const chucVuPage = new ChucVuPage(page)
    await chucVuPage.goto()
    await chucVuPage.create(chucVuData)

    // CREATE employee
    const listPage = new NhanVienListPage(page)
    await listPage.goto()
    await listPage.create(nhanVienData, phongBanData.ten, chucVuData.ten)

    // VERIFY in list
    await expect(page.getByRole('row').filter({ hasText: nhanVienData.hoTen })).toBeVisible()

    // OPEN detail and test sub-modules
    await listPage.openDetail(nhanVienData.hoTen)
    const detailPage = new NhanVienDetailPage(page)

    // SUB-MODULE: Người thân
    await detailPage.addNguoiThan(nguoiThanData)
    await detailPage.deleteNguoiThan(nguoiThanData.hoTen)

    // SUB-MODULE: Bằng cấp
    await detailPage.addBangCap(bangCapData)
    await detailPage.deleteBangCap(bangCapData.tenBang)

    // SUB-MODULE: Khen thưởng
    await detailPage.addKhenThuong(khenThuongData)

    // SUB-MODULE: Kỷ luật
    await detailPage.addKyLuat(kyLuatData)

    // SUB-MODULE: Hợp đồng
    await detailPage.addHopDong(hopDongData)
    await detailPage.deleteHopDong(hopDongData.soHopDong)

    // EDIT employee name
    await detailPage.editEmployeeName(nhanVienData.hoTenSua)

    // DELETE employee
    await listPage.goto()
    await listPage.delete(nhanVienData.hoTenSua)
    await expect(page.getByRole('row').filter({ hasText: nhanVienData.hoTenSua })).toHaveCount(0)

    // Cleanup: delete position and department
    await chucVuPage.goto()
    await chucVuPage.delete(chucVuData.ten)

    await phongBanPage.goto()
    await phongBanPage.delete(phongBanData.ten)
  })
})
