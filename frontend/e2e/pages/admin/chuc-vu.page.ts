import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class ChucVuPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/chuc-vu')
    await expect(this.page.locator('[data-slot="breadcrumb-page"]')).toHaveText('Chức vụ')
  }

  async create(data: typeof testData.chucVu) {
    await this.page.getByRole('button', { name: 'Thêm chức vụ' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm chức vụ mới' })).toBeVisible()
    await dialog.getByLabel('Tên chức vụ').fill(data.ten)
    await dialog.locator('label').filter({ hasText: 'Loại chức vụ' }).locator('..').getByRole('combobox').click()
    await this.page.getByRole('option', { name: data.loai }).click()
    await dialog.locator('label').filter({ hasText: 'Cấp bậc' }).locator('..').getByRole('combobox').click()
    await this.page.getByRole('option', { name: 'Cấp 1 (Thấp nhất)' }).click()
    await dialog.getByLabel('Hệ số phụ cấp').fill(data.heSoPhuCap)
    await dialog.getByLabel('Đang hoạt động').check()
    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async search(name: string) {
    await this.page.getByPlaceholder('Tìm tên, mã chức vụ...').fill(name)
    await this.page.waitForTimeout(300)
  }

  async edit(oldName: string, newName: string) {
    await this.search(oldName)
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').click()
    await this.page.getByRole('menuitem', { name: 'Chỉnh sửa' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Cập nhật chức vụ' })).toBeVisible()
    await dialog.getByLabel('Tên chức vụ').clear()
    await dialog.getByLabel('Tên chức vụ').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async delete(name: string) {
    await this.search(name)
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').click()
    await this.page.getByRole('menuitem', { name: 'Xóa' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async assertInTable(name: string) {
    await this.search(name)
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async assertNotInTable(name: string) {
    await this.page.getByPlaceholder('Tìm tên, mã chức vụ...').fill(name)
    await this.page.waitForTimeout(300)
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
