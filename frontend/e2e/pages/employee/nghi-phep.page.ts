import { Page, expect } from '@playwright/test'

export class EmployeeNghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/nghi-phep')
    await expect(this.page.getByRole('heading', { name: 'Nghỉ phép', exact: true })).toBeVisible()
  }

  async createLeaveRequest() {
    // Click the header "Xin nghỉ" button
    await this.page.getByRole('button', { name: 'Xin nghỉ' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Tạo đơn nghỉ phép' })).toBeVisible()

    // Select "Phép năm" from the combobox using label filter pattern
    await dialog.locator('label').filter({ hasText: 'Loại nghỉ phép' }).locator('..').getByRole('combobox').click()
    await this.page.getByRole('option', { name: 'Phép năm' }).click()

    // Use page.evaluate to directly trigger the form field values via react-hook-form
    await this.page.evaluate(() => {
      // Find the dialog's React root and trigger form value changes
      const dialogRoot = document.querySelector('[role="dialog"]')
      if (!dialogRoot) return
      
      // Click both date picker buttons to open popovers (required for React state)
      const choNgayBtns = Array.from(dialogRoot.querySelectorAll('button'))
        .filter(b => b.textContent?.trim() === 'Chọn ngày')
      
      if (choNgayBtns.length >= 1) {
        // For the first date button - dispatch a click to open the calendar
        choNgayBtns[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    await this.page.waitForTimeout(500)

    // Click the calendar day button 30
    await this.page.locator('[data-slot="calendar"] button').filter({ hasText: '30' }).click()
    await this.page.waitForTimeout(500)

    // Click Đến ngày button
    await dialog.getByRole('button', { name: 'Chọn ngày' }).first().click()
    await this.page.waitForTimeout(500)

    // Click the calendar day button 31
    await this.page.locator('[data-slot="calendar"] button').filter({ hasText: '31' }).click()
    await this.page.waitForTimeout(500)

    await dialog.getByRole('button', { name: 'Gửi đơn' }).click()
    await expect(this.page.getByText('thành công').first()).toBeVisible({ timeout: 10000 })
  }

  async assertLeaveInList() {
    await expect(this.page.getByText('Chờ duyệt').first()).toBeVisible()
  }

  async cancelLeave() {
    await this.page.getByRole('button', { name: 'Hủy' }).first().click()
    await expect(this.page.getByText('thành công').first()).toBeVisible()
  }
}
