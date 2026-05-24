import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class ChucVuPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/chuc-vu')
    await expect(this.page.getByText('chức vụ').first()).toBeVisible()
  }

  async create(data: typeof testData.chucVu) {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm chức vụ mới' })).toBeVisible()

    await dialog.getByLabel('Tên chức vụ').fill(data.ten)
    await dialog.getByLabel('Loại chức vụ').click()
    await this.page.getByRole('option', { name: data.loai }).click()
    await dialog.getByLabel('Cấp bậc').click()
    await this.page.getByRole('option', { name: data.capBac }).click()
    await dialog.getByLabel('Hệ số phụ cấp').fill(data.heSoPhuCap)
    await dialog.getByRole('checkbox', { name: 'Đang hoạt động' }).check()

    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async edit(oldName: string, newName: string) {
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /edit|sửa|pencil/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Cập nhật chức vụ' })).toBeVisible()

    await dialog.getByLabel('Tên chức vụ').clear()
    await dialog.getByLabel('Tên chức vụ').fill(newName)
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
