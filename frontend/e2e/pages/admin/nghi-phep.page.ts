import { Page, expect } from '@playwright/test'

export class NghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/nghi-phep')
    await expect(this.page.getByText('nghỉ phép').first()).toBeVisible()
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('tab', { name: status }).click()
  }

  async openFirstPendingRequest() {
    const row = this.page.getByRole('row').filter({ hasText: 'Chờ duyệt' }).first()
    await row.getByRole('button', { name: /detail|chi tiết|eye/i }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chi tiết đơn nghỉ phép' })).toBeVisible()
    return dialog
  }

  async approve(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Duyệt' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async reject(dialog: ReturnType<Page['getByRole']>, reason: string) {
    await dialog.getByPlaceholder('Nhap ly do tu choi...').fill(reason)
    await dialog.getByRole('button', { name: 'Từ chối' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
