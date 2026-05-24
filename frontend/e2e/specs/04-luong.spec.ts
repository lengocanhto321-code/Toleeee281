import { test, expect } from '@playwright/test'
import { LuongPage } from '../pages/admin/luong.page'

test.describe('Lương', () => {
  let luongPage: LuongPage

  test.beforeEach(async ({ page }) => {
    luongPage = new LuongPage(page)
  })

  test('cấu hình lương', async ({ page }) => {
    await luongPage.goto()
    await luongPage.openConfigDialog()
    await luongPage.fillConfig()
    await luongPage.saveConfig()
  })
})
