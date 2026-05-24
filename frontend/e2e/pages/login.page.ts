import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
    await expect(this.page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Tên đăng nhập').fill(username)
    await this.page.getByLabel('Mật khẩu').fill(password)
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click()
  }

  async assertLoggedIn() {
    await expect(this.page).toHaveURL(/\/dashboard|\/employee/)
  }

  async logout() {
    await this.page.getByRole('button', { name: /admin/i }).click()
    await this.page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(this.page).toHaveURL('/login')
  }
}
