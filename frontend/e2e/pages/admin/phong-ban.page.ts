import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class PhongBanPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/phong-ban')
    await expect(this.page.getByText('phòng ban').first()).toBeVisible()
  }

  async create(data: typeof testData.phongBan) {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm phòng ban mới' })).toBeVisible()

    await dialog.getByRole('button', { name: data.loai }).click()
    await dialog.getByLabel('Tên phòng ban').fill(data.ten)
    await dialog.getByRole('button', { name: 'Thêm mới' }).click()

    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async edit(oldName: string, newName: string) {
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /edit|sửa|pencil/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chỉnh sửa phòng ban' })).toBeVisible()

    await dialog.getByLabel('Tên phòng ban').clear()
    await dialog.getByLabel('Tên phòng ban').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()

    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async delete(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /delete|xóa|trash/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()

    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async assertInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async assertNotInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
