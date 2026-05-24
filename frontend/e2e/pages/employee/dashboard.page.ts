import { Page, expect } from '@playwright/test'

export class EmployeeDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee')
    await expect(this.page.getByText('Xin chào')).toBeVisible()
  }

  async assertBentoCardsVisible() {
    await expect(this.page.getByText('Phép còn lại')).toBeVisible()
    await expect(this.page.getByText('Công tháng này')).toBeVisible()
    await expect(this.page.getByText('Đơn chờ duyệt')).toBeVisible()
  }

  async clickXinNghi() {
    await this.page.getByRole('button', { name: 'Xin nghỉ' }).click()
    await expect(this.page).toHaveURL(/\/employee\/nghi-phep/)
  }

  async clickQR() {
    await this.page.getByRole('button', { name: 'QR của tôi' }).click()
    await expect(this.page).toHaveURL(/\/employee\/my-qr/)
  }

  async clickXemLuong() {
    await this.page.getByRole('button', { name: 'Xem lương' }).click()
    await expect(this.page).toHaveURL(/\/employee\/luong/)
  }
}
