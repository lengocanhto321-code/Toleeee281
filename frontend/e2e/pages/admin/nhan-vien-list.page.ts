import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class NhanVienListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/nhan-vien')
    await expect(this.page.locator('[data-slot="breadcrumb-page"]')).toHaveText('Nhân viên')
  }

  async search(keyword: string) {
    await this.page.getByPlaceholder('Tìm tên, mã NV, email, CCCD, SĐT...').fill(keyword)
    await this.page.waitForTimeout(500)
  }

  async create(data: ReturnType<typeof testData.nhanVien>, phongBanName: string, chucVuName: string) {
    await this.page.getByRole('button', { name: 'Thêm nhân viên' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm nhân viên mới' })).toBeVisible({ timeout: 10000 })

    // === Tab 1: Cá nhân ===
    await dialog.getByRole('button', { name: 'Giáo viên' }).click()

    await dialog.getByLabel('Họ và tên').fill(data.hoTen)
    await dialog.getByLabel('Giới tính').click()
    await this.page.getByRole('option', { name: data.gioiTinh }).click()
    await dialog.locator('button').filter({ hasText: 'Chọn ngày sinh' }).click()
    await this.page.getByRole('button', { name: '15' }).first().click()
    await dialog.getByLabel('Nơi sinh').fill(data.noiSinh)
    await dialog.getByLabel('Dân tộc').fill(data.danToc)
    await dialog.getByLabel('Tôn giáo').fill(data.tonGiao)

    await dialog.getByLabel('Số điện thoại').fill(data.soDienThoai)
    await dialog.getByLabel('Email trường').fill(data.emailTruong)
    await dialog.getByLabel('Email cá nhân').fill(data.emailCaNhan)
    await dialog.getByLabel('Tình trạng hôn nhân').click()
    await this.page.getByRole('option', { name: data.tinhTrangHonNhan }).click()

    await dialog.getByLabel('Quê quán').fill(data.queQuan)
    await dialog.getByLabel('Địa chỉ thường trú').fill(data.diaChiThuongTru)

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 2: CCCD ===
    await dialog.getByLabel('Số CCCD/CMND').fill(data.soCCCD)
    await dialog.locator('button').filter({ hasText: 'Ngày cấp CCCD' }).click()
    await this.page.getByRole('button', { name: '1' }).last().click()
    await dialog.getByLabel('Nơi cấp').fill(data.noiCapCCCD)

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 3: Công tác ===
    await dialog.getByLabel('Trạng thái').click()
    await this.page.getByRole('option', { name: data.trangThai }).click()
    await dialog.getByRole('combobox').filter({ hasText: 'Chọn môn dạy...' }).click()
    await this.page.getByRole('button').filter({ hasText: data.monDay }).last().click()
    await dialog.getByLabel('Cấp học').click()
    await this.page.getByRole('option', { name: data.capHoc }).click()
    await dialog.getByRole('combobox').filter({ hasText: 'Chọn phòng ban...' }).click()
    await this.page.getByRole('button').filter({ hasText: phongBanName }).last().click()
    await dialog.getByRole('combobox').filter({ hasText: 'Chọn chức vụ...' }).click()
    await this.page.getByRole('button').filter({ hasText: chucVuName }).last().click()

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 4: Hợp đồng ===
    await dialog.getByLabel('Loại hợp đồng').click()
    await this.page.getByRole('option', { name: data.loaiHopDong }).click()
    await dialog.getByLabel('Số hợp đồng').fill(data.soHopDong)
    await dialog.locator('button').filter({ hasText: 'Ngày vào làm' }).click()
    await this.page.getByRole('button', { name: '1' }).last().click()
    await dialog.getByLabel('Hình thức tuyển dụng').fill(data.hinhThucTuyenDung)
    await dialog.getByLabel('Nơi ký hợp đồng').fill(data.noiKyHopDong)
    await dialog.getByLabel('Hệ số lương').fill(data.heSoLuong)
    await dialog.getByLabel('Bậc lương').click()
    await this.page.getByRole('option', { name: data.bacLuong, exact: true }).click()

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 5: Đảng/Đoàn ===
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 6: Khác ===

    // Submit
    await dialog.getByRole('button', { name: 'Tạo nhân viên' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 15000 })

    data.username = data.hoTen
    data.password = data.soDienThoai
  }

  async delete(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /delete|xóa|trash/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async openDetail(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('link').first().click()
    await expect(this.page.getByText('Chi tiết nhân viên')).toBeVisible()
  }

  async clickEdit() {
    await this.page.getByRole('button', { name: 'Sửa thông tin' }).click()
    await expect(this.page.getByRole('dialog').getByRole('heading', { name: 'Chỉnh sửa nhân viên' })).toBeVisible()
  }
}
