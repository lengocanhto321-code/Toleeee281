import { Page, expect } from '@playwright/test'

export class EmployeeProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/profile')
    await expect(this.page.getByText('Thông tin cá nhân')).toBeVisible()
  }

  async editPhone(newPhone: string) {
    await this.page.getByRole('button', { name: 'Sửa' }).click()
    await this.page.getByLabel('Số điện thoại').clear()
    await this.page.getByLabel('Số điện thoại').fill(newPhone)
    await this.page.getByRole('button', { name: 'Lưu' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
