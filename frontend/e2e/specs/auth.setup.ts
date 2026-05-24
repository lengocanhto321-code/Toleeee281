import { test as setup } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '../.auth/admin.json')

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('admin', 'Admin123!')
  await loginPage.assertLoggedIn()
  await page.context().storageState({ path: AUTH_FILE })
})
