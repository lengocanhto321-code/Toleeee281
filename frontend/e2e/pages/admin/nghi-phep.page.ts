import { Page, expect } from '@playwright/test'

export class NghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/nghi-phep')
    await expect(this.page.locator('[data-slot="breadcrumb-page"]')).toHaveText('nghi-phep')
  }

  async filterByStatus(status: string) {
    await this.page.locator('button').filter({ hasText: 'Trạng thái' }).first().click()
    await this.page.getByRole('option', { name: status }).click()
  }

  async openFirstPendingRequest() {
    const row = this.page.getByRole('row').filter({ hasText: 'Chờ duyệt' }).first()
    await row.getByRole('button', { name: /eye/i }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByText('Chi tiết đơn nghỉ phép')).toBeVisible()
    return dialog
  }

  async approve(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Duyệt' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async reject(dialog: ReturnType<Page['getByRole']>, reason: string) {
    await dialog.getByPlaceholder('Nhập lý do từ chối...').fill(reason)
    await dialog.getByRole('button', { name: 'Từ chối' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }
}
