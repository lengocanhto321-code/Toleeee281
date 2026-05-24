import { test } from '@playwright/test'
import { NghiPhepPage } from '../pages/admin/nghi-phep.page'

test.describe('Nghỉ phép', () => {
  let nghiPhepPage: NghiPhepPage

  test.beforeEach(async ({ page }) => {
    nghiPhepPage = new NghiPhepPage(page)
    await nghiPhepPage.goto()
  })

  test('duyệt đơn nghỉ phép', async () => {
    await nghiPhepPage.filterByStatus('Chờ duyệt')

    const dialog = await nghiPhepPage.openFirstPendingRequest()
    await nghiPhepPage.approve(dialog as any)
  })
})
