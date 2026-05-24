import { test, expect } from '@playwright/test'
import { NghiPhepPage } from '../pages/admin/nghi-phep.page'

test.describe('Nghỉ phép', () => {
  let nghiPhepPage: NghiPhepPage

  test.beforeEach(async ({ page }) => {
    nghiPhepPage = new NghiPhepPage(page)
    await nghiPhepPage.goto()
  })

  test('duyệt đơn nghỉ phép', async ({ page }) => {
    await nghiPhepPage.filterByStatus('Chờ duyệt')

    const hasPending = page.getByRole('row').filter({ hasText: 'Chờ duyệt' }).first()
    const eyeButton = hasPending.getByRole('button', { name: /eye/i })
    if (await eyeButton.isVisible()) {
      await eyeButton.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText('Chi tiết đơn nghỉ phép')).toBeVisible()
      await nghiPhepPage.approve(dialog as any)
    }
  })
})
