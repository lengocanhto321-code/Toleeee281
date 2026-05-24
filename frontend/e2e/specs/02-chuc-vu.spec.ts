import { test } from '@playwright/test'
import { ChucVuPage } from '../pages/admin/chuc-vu.page'
import { testData } from '../data/test-data'

test.describe('Chức vụ', () => {
  let chucVuPage: ChucVuPage
  const data = testData.chucVu

  test.beforeEach(async ({ page }) => {
    chucVuPage = new ChucVuPage(page)
    await chucVuPage.goto()
  })

  test('CRUD chức vụ - create, read, update, delete', async () => {
    await chucVuPage.create(data)
    await chucVuPage.assertInTable(data.ten)

    await chucVuPage.edit(data.ten, data.tenSua)
    await chucVuPage.assertInTable(data.tenSua)

    await chucVuPage.delete(data.tenSua)
    await chucVuPage.assertNotInTable(data.tenSua)
  })
})
