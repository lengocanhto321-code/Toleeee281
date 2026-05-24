import { Page, expect } from '@playwright/test'

export class ChamCongPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/cham-cong')
    await expect(this.page.getByText('Chấm công tháng').first()).toBeVisible()
  }

  async selectMonthYear(thang: number, nam: number) {
    // Month/year selectors use shadcn/ui Select with <SelectTrigger>
    const monthSelect = this.page.locator('[data-slot="select-trigger"]').filter({ hasText: /Tháng/i }).first()
    await monthSelect.click()
    await this.page.getByRole('option', { name: `Tháng ${thang}` }).click()

    const yearSelect = this.page.locator('[data-slot="select-trigger"]').filter({ hasText: /^\d{4}$/ }).first()
    await yearSelect.click()
    await this.page.getByRole('option', { name: `${nam}` }).click()
  }

  async getFirstChamCongRow() {
    const rows = this.page.locator('[data-slot="table"] tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 10000 })
    return rows.first()
  }

  async openFirstEmployeeDetail() {
    await this.page.getByRole('button', { name: 'Chi tiết' }).first().click()
    await expect(this.page.getByRole('heading', { name: 'Chỉnh sửa chấm công' })).toBeVisible({ timeout: 5000 })
  }

  async editCoMat(value: number) {
    // "Có mặt" is a number input rendered inside a Field with FieldLabel
    const input = this.page.locator('label').filter({ hasText: 'Có mặt' }).locator('..').getByRole('spinbutton')
    await input.clear()
    await input.fill(String(value))
  }

  async saveChanges() {
    await this.page.getByRole('button', { name: 'Lưu thay đổi' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async xacNhan() {
    await this.page.getByRole('button', { name: 'Xác nhận chấm công' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async duyet() {
    await this.page.getByRole('button', { name: 'Duyệt chấm công' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async chot() {
    await this.page.getByRole('button', { name: 'Chốt chấm công' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async closeDialog() {
    await this.page.getByRole('button', { name: 'Đóng' }).click()
    await expect(this.page.getByRole('heading', { name: 'Chỉnh sửa chấm công' })).not.toBeVisible()
  }
}
