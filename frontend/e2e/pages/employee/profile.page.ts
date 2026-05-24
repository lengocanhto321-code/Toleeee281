import { Page, expect } from '@playwright/test'

export class EmployeeProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/profile')
    await expect(this.page.getByText('Thông tin cá nhân')).toBeVisible()
  }

  async editPhone(newPhone: string) {
    await this.page.getByRole('button', { name: 'Sửa' }).click()
    // "Số điện thoại" label is a <p> element, not a <label>, so use label filter pattern
    const phoneInput = this.page.locator('p').filter({ hasText: 'Số điện thoại' }).locator('..').getByRole('textbox')
    await phoneInput.clear()
    await phoneInput.fill(newPhone)
    await this.page.getByRole('button', { name: 'Lưu' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }
}
