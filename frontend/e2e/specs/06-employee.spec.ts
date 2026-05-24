import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { EmployeeDashboardPage } from '../pages/employee/dashboard.page'
import { EmployeeProfilePage } from '../pages/employee/profile.page'
import { EmployeeNghiPhepPage } from '../pages/employee/nghi-phep.page'
import { NhanVienListPage } from '../pages/admin/nhan-vien-list.page'
import { testData } from '../data/test-data'

test.describe('Employee self-service', () => {
  const nvData = testData.nhanVien

  test('employee login, dashboard, profile, leave request', async ({ page }) => {
    // Step 1: Login as admin to create an employee
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('admin', 'Admin123!')

    // Step 2: Create a minimal employee
    const listPage = new NhanVienListPage(page)
    await listPage.goto()

    await page.getByRole('button', { name: 'Thêm nhân viên' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Giáo viên' }).click()
    await dialog.getByLabel('Họ và tên').fill(nvData.hoTen)
    await dialog.getByLabel('Giới tính').click()
    await page.getByRole('option', { name: 'Nam' }).click()
    await dialog.getByLabel('Ngày sinh').click()
    await page.getByRole('gridcell', { name: '15' }).first().click()
    await dialog.getByLabel('Nơi sinh').fill('Hà Nội')
    await dialog.getByLabel('Dân tộc').fill('Kinh')
    await dialog.getByLabel('Số điện thoại').fill(nvData.soDienThoai)
    await dialog.getByLabel('Email trường').fill(nvData.emailTruong)
    await dialog.getByLabel('Tình trạng hôn nhân').click()
    await page.getByRole('option', { name: 'Độc thân' }).click()
    await dialog.getByLabel('Quê quán').fill('Hà Nội')
    await dialog.getByLabel('Địa chỉ thường trú').fill('Hà Nội')
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // Tab 2: CCCD
    await dialog.getByLabel('Số CCCD/CMND').fill(nvData.soCCCD)
    await dialog.getByLabel('Ngày cấp').click()
    await page.getByRole('gridcell', { name: '1' }).first().click()
    await dialog.getByLabel('Nơi cấp').fill('CA Hà Nội')
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // Tab 3: Công tác
    await dialog.getByLabel('Trạng thái').click()
    await page.getByRole('option', { name: 'Đang làm' }).click()
    await dialog.getByLabel('Cấp học').click()
    await page.getByRole('option', { name: 'THPT' }).click()
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // Tab 4: Hợp đồng
    await dialog.getByLabel('Loại hợp đồng').click()
    await page.getByRole('option', { name: 'Vien chuc' }).click()
    await dialog.getByLabel('Ngày vào làm').click()
    await page.getByRole('gridcell', { name: '1' }).first().click()
    await dialog.getByLabel('Hệ số lương').fill('2.34')
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
    await dialog.getByRole('button', { name: 'Tạo nhân viên' }).click()
    await expect(page.getByText('thành công')).toBeVisible({ timeout: 15000 })

    // Extract the employee code from the table row
    const employeeRow = page.getByRole('row').filter({ hasText: nvData.hoTen })
    const rowText = await employeeRow.textContent()
    const maNhanVien = rowText?.match(/NV-\d+|GV-\d+|NV\w+/)?.[0] || nvData.hoTen

    // Logout admin
    await page.getByRole('button', { name: /admin/i }).click()
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(page).toHaveURL('/login')

    // Login as employee
    await loginPage.login(maNhanVien, nvData.soDienThoai)

    // Dashboard
    const dashboardPage = new EmployeeDashboardPage(page)
    await dashboardPage.assertBentoCardsVisible()

    // Profile
    const profilePage = new EmployeeProfilePage(page)
    await profilePage.goto()
    await profilePage.editPhone('0988888888')

    // Leave request
    const nghiPhepPage = new EmployeeNghiPhepPage(page)
    await nghiPhepPage.goto()
    await nghiPhepPage.createLeaveRequest()
    await nghiPhepPage.assertLeaveInList()
  })
})
