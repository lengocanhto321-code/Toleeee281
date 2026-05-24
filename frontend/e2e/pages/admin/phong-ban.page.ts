import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class PhongBanPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/phong-ban')
    await expect(this.page.locator('[data-slot="breadcrumb-page"]')).toHaveText('Phòng ban')
  }

  async create(data: typeof testData.phongBan) {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm phòng ban mới' })).toBeVisible()

    await dialog.getByRole('button', { name: data.loai }).click()
    await dialog.getByPlaceholder('Tổ Toán').fill(data.ten)
    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async edit(oldName: string, newName: string) {
    await this.page.getByPlaceholder('Tìm tên, mã phòng ban...').fill(oldName)
    await this.page.waitForTimeout(1000)
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').click()
    await this.page.getByRole('menuitem', { name: 'Chỉnh sửa' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chỉnh sửa phòng ban' })).toBeVisible()
    await dialog.getByPlaceholder('Tổ Toán').clear()
    await dialog.getByPlaceholder('Tổ Toán').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async delete(name: string) {
    await this.page.getByPlaceholder('Tìm tên, mã phòng ban...').fill(name)
    await this.page.waitForTimeout(1000)
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').click()
    await this.page.getByRole('menuitem', { name: 'Xóa' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async assertInTable(name: string) {
    const searchInput = this.page.getByPlaceholder('Tìm tên, mã phòng ban...')
    await searchInput.click()
    await searchInput.fill(name)
    await this.page.waitForTimeout(1500)
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible({ timeout: 8000 })
  }

  async assertNotInTable(name: string) {
    const searchInput = this.page.getByPlaceholder('Tìm tên, mã phòng ban...')
    await searchInput.click()
    await searchInput.fill(name)
    await this.page.waitForTimeout(1500)
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
