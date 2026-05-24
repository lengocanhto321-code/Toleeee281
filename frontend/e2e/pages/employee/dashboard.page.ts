import { Page, expect } from '@playwright/test'

export class EmployeeDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee')
    // Wait for data to load (loading shows "Đang tải...", then shows dashboard content)
    await this.page.waitForTimeout(2000)
  }

  async assertBentoCardsVisible() {
    await expect(this.page.getByText('Xin chào')).toBeVisible({ timeout: 20000 })
    await expect(this.page.getByText('Phép còn lại')).toBeVisible({ timeout: 5000 })
    await expect(this.page.getByText('Công tháng này')).toBeVisible({ timeout: 5000 })
    await expect(this.page.getByText('Đơn chờ duyệt')).toBeVisible({ timeout: 5000 })
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
