import { Page, expect } from '@playwright/test'

export class LuongPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/luong')
    await expect(this.page.locator('[data-slot="breadcrumb-page"]')).toHaveText('Lương')
  }

  async openConfigDialog() {
    await this.page.getByRole('button', { name: 'Cấu hình' }).first().click()
    await expect(this.page.getByRole('heading', { name: 'Cấu hình hệ thống lương' })).toBeVisible({ timeout: 5000 })
    await this.page.waitForTimeout(500)
  }

  async fillConfig(thang?: number, nam?: number) {
    const firstOfMonth = nam
      ? `${nam}-${String(thang ?? 1).padStart(2, '0')}-01`
      : '2026-01-01'
    await this.page.getByLabel('Ghi chú').fill('Cấu hình test', { timeout: 5000 })
    await this.page.getByLabel('Ngày áp dụng').fill(firstOfMonth, { timeout: 5000 })
    await this.page.getByLabel('Lương cơ sở (VNĐ)').fill('2340000', { timeout: 5000 })
    await this.page.getByLabel('Hệ số đặc thù').fill('1.0', { timeout: 5000 })
    await this.page.getByLabel('BHXH').fill('8', { timeout: 5000 })
    await this.page.getByLabel('BHYT').fill('1.5', { timeout: 5000 })
    await this.page.getByLabel('BHTN').fill('1', { timeout: 5000 })
    await this.page.getByLabel('Giảm trừ bản thân').fill('11000000', { timeout: 5000 })
    await this.page.getByLabel('Người phụ thuộc').fill('4400000', { timeout: 5000 })
  }

  async saveConfig() {
    await this.page.getByRole('button', { name: 'Lưu cấu hình' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async clickChayLuong() {
    await this.page.getByRole('button', { name: 'Chạy lương' }).first().click()
  }

  async clickKyLuongTab() {
    await this.page.getByRole('button', { name: 'Kỳ lương' }).click()
  }

  async clickPhieuLuongTab() {
    await this.page.getByRole('button', { name: 'Phiếu lương' }).click()
  }

  async openChayLuongDialog() {
    await this.clickChayLuong()
    await expect(this.page.getByRole('heading', { name: /Chạy lương tháng|Tính lại lương/ })).toBeVisible({ timeout: 5000 })
    await this.page.waitForTimeout(300)
  }

  async selectChayLuongMonthYear(thang: number, nam: number) {
    // Month selector (use combobox role to avoid matching the dialog label)
    const monthSelect = this.page.getByRole('combobox', { name: 'Tháng' })
    await monthSelect.click()
    await this.page.getByRole('option', { name: `Tháng ${thang}` }).click()

    // Year selector
    const yearSelect = this.page.getByRole('combobox', { name: 'Năm' })
    await yearSelect.click()
    await this.page.getByRole('option', { name: `${nam}` }).click()
  }

  async runChayLuong() {
    await this.page.getByRole('button', { name: /Chạy lương|Tính lại/ }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 15000 })
    await this.page.waitForTimeout(500)
  }

  async duyetKyLuong() {
    await this.page.getByRole('button', { name: 'Duyệt' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async chotKyLuong() {
    await this.page.getByRole('button', { name: 'Chốt' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async clickPhieuLuongChiTiet() {
    await this.page.getByRole('button', { name: 'Chi tiết' }).first().click()
  }
}
