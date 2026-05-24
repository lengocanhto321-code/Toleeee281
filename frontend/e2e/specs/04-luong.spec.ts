import { test, expect } from '@playwright/test'
import { LuongPage } from '../pages/admin/luong.page'

test.describe('Lương', () => {
  let luongPage: LuongPage

  test.beforeEach(async ({ page }) => {
    luongPage = new LuongPage(page)
  })

  test('cấu hình lương và chạy lương', async () => {
    await luongPage.goto()
    await luongPage.goToConfigTab()

    const configDialog = await luongPage.addConfig()
    await luongPage.fillConfig(configDialog as any)
    await luongPage.saveConfig(configDialog as any)

    // Chạy lương
    await luongPage.goto()
    await luongPage.goToKyLuongTab()
    const chayLuongDialog = await luongPage.clickChayLuong()
    await luongPage.fillChayLuong(chayLuongDialog as any)
  })
})
