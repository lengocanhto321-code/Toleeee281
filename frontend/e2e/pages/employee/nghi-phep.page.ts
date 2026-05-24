import { Page, expect } from '@playwright/test'

export class EmployeeNghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/nghi-phep')
    await expect(this.page.getByText('Nghỉ phép')).toBeVisible()
  }

  async createLeaveRequest() {
    await this.page.getByRole('button', { name: 'Xin nghỉ' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Tạo đơn nghỉ phép mới' })).toBeVisible()

    await dialog.getByLabel('Loại nghỉ phép').click()
    await this.page.getByRole('option', { name: 'Phép năm' }).click()

    await dialog.getByLabel('Từ ngày').click()
    await this.page.getByRole('gridcell', { name: '15' }).first().click()

    await dialog.getByLabel('Đến ngày').click()
    await this.page.getByRole('gridcell', { name: '16' }).first().click()

    await dialog.getByRole('button', { name: 'Tạo đơn' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async assertLeaveInList() {
    await expect(this.page.getByText('Chờ duyệt').first()).toBeVisible()
  }

  async cancelLeave() {
    await this.page.getByRole('button', { name: 'Hủy' }).first().click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }
}
