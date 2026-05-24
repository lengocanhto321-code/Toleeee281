import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class NhanVienDetailPage {
  constructor(private page: Page) {}

  // ======= NGƯỜI THÂN =======
  async addNguoiThan(data: ReturnType<typeof testData.nguoiThan>) {
    await this.page.getByRole('tab', { name: 'Gia đình' }).click()
    await this.page.getByRole('button', { name: 'Thêm người thân' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm người thân' })).toBeVisible()

    await dialog.getByLabel('Họ tên').fill(data.hoTen)
    await dialog.getByLabel('Quan hệ').click()
    await this.page.getByRole('option', { name: data.quanHe }).click()
    await dialog.getByLabel('Năm sinh').fill(data.namSinh)
    await dialog.getByLabel('Nghề nghiệp').fill(data.ngheNghiep)
    await dialog.getByLabel('Số điện thoại').fill(data.soDienThoai)

    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async deleteNguoiThan(name: string) {
    const card = this.page.getByText(name).first()
    await card.hover()
    await this.page.getByRole('button', { name: /delete|xóa|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= BẰNG CẤP =======
  async addBangCap(data: ReturnType<typeof testData.bangCap>) {
    await this.page.getByRole('tab', { name: 'Đào tạo' }).click()
    await this.page.getByRole('button', { name: 'Thêm bằng cấp' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm bằng cấp' })).toBeVisible()

    await dialog.getByLabel('Loại bằng').click()
    await this.page.getByRole('option', { name: data.loaiBang }).click()
    await dialog.getByLabel('Tên bằng').fill(data.tenBang)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  async deleteBangCap(name: string) {
    await this.page.getByRole('tab', { name: 'Đào tạo' }).click()
    const item = this.page.getByText(name).first()
    await item.hover()
    await this.page.getByRole('button', { name: /delete|xóa|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Xóa' }).click()
  }

  // ======= KHEN THƯỞNG =======
  async addKhenThuong(data: ReturnType<typeof testData.khenThuong>) {
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).click()
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).first().click()
    await this.page.getByRole('button', { name: 'Thêm khen thưởng' }).click()

    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Hình thức').click()
    await this.page.getByRole('option', { name: data.hinhThuc }).click()
    await dialog.getByLabel('Lý do').fill(data.lyDo)
    await dialog.getByLabel('Ngày quyết định').fill(data.ngayQuyetDinh)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= KỶ LUẬT =======
  async addKyLuat(data: ReturnType<typeof testData.kyLuat>) {
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).click()
    await this.page.getByRole('tab', { name: 'Kỷ luật' }).click()
    await this.page.getByRole('button', { name: 'Thêm kỷ luật' }).click()

    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Hình thức').click()
    await this.page.getByRole('option', { name: data.hinhThuc }).click()
    await dialog.getByLabel('Lý do').fill(data.lyDo)
    await dialog.getByLabel('Ngày quyết định').fill(data.ngayQuyetDinh)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= HỢP ĐỒNG =======
  async addHopDong(data: ReturnType<typeof testData.hopDong>) {
    await this.page.getByRole('tab', { name: 'Hợp đồng' }).click()
    await this.page.getByRole('button', { name: 'Ký hợp đồng mới' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm hợp đồng mới' })).toBeVisible()

    await dialog.getByLabel('Số hợp đồng').fill(data.soHopDong)
    await dialog.getByLabel('Loại hợp đồng').click()
    await this.page.getByRole('option', { name: data.loaiHopDong }).click()
    await dialog.getByLabel('Ngày bắt đầu').fill(data.ngayBatDau)
    await dialog.getByLabel('Ngày kết thúc').fill(data.ngayKetThuc)
    await dialog.getByLabel('Lương cơ bản').fill(data.luongCoBan)
    await dialog.getByLabel('Hình thức tuyển dụng').click()
    await this.page.getByRole('option', { name: data.hinhThucTuyenDung }).click()

    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async deleteHopDong(soHopDong: string) {
    await this.page.getByRole('tab', { name: 'Hợp đồng' }).click()
    const contractSection = this.page.getByText(soHopDong).first()
    await contractSection.hover()
    await this.page.getByRole('button', { name: /delete|cancel|hủy|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Hủy hợp đồng' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // Edit employee name
  async editEmployeeName(newName: string) {
    await this.page.getByRole('button', { name: 'Sửa thông tin' }).click()
    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Họ và tên').clear()
    await dialog.getByLabel('Họ và tên').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
