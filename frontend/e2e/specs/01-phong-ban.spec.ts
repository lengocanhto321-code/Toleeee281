import { test } from '@playwright/test'
import { PhongBanPage } from '../pages/admin/phong-ban.page'
import { testData } from '../data/test-data'

test.describe('Phòng ban', () => {
  let phongBanPage: PhongBanPage
  const data = testData.phongBan

  test.beforeEach(async ({ page }) => {
    phongBanPage = new PhongBanPage(page)
    await phongBanPage.goto()
  })

  test('CRUD phòng ban - create, read, update, delete', async () => {
    await phongBanPage.create(data)
    await phongBanPage.assertInTable(data.ten)

    await phongBanPage.edit(data.ten, data.tenSua)
    await phongBanPage.assertInTable(data.tenSua)

    await phongBanPage.delete(data.tenSua)
    await phongBanPage.assertNotInTable(data.tenSua)
  })
})
