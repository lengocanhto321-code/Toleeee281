import { Page, expect } from '@playwright/test'

export class LuongPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/luong')
    await expect(this.page.getByText('lương').first()).toBeVisible()
  }

  async goToConfigTab() {
    await this.page.getByRole('tab', { name: 'Cấu hình' }).click()
  }

  async addConfig() {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Cấu hình hệ thống lương' })).toBeVisible()
    return dialog
  }

  async fillConfig(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByLabel('Lương cơ sở (VND)').fill('2340000')
    await dialog.getByLabel('Hệ số đặc thù').fill('1.0')
    await dialog.getByLabel('BHXH').fill('8')
    await dialog.getByLabel('BHYT').fill('1.5')
    await dialog.getByLabel('BHTN').fill('1')
    await dialog.getByLabel('Giảm trừ bản thân').fill('11000000')
    await dialog.getByLabel('Người phụ thuộc').fill('4400000')
  }

  async saveConfig(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Lưu cấu hình' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async clickChayLuong() {
    await this.page.getByRole('button', { name: 'Chạy lương' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chạy lương tháng' })).toBeVisible()
    return dialog
  }

  async fillChayLuong(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Chạy lương' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 15000 })
  }

  async goToKyLuongTab() {
    await this.page.getByRole('tab', { name: 'Kỳ lương' }).click()
  }

  async goToPhieuLuongTab() {
    await this.page.getByRole('tab', { name: 'Phiếu lương' }).click()
  }
}
