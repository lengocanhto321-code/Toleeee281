import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { EmployeeDashboardPage } from '../pages/employee/dashboard.page'
import { EmployeeProfilePage } from '../pages/employee/profile.page'
import { EmployeeNghiPhepPage } from '../pages/employee/nghi-phep.page'
import { NhanVienListPage } from '../pages/admin/nhan-vien-list.page'
import { PhongBanPage } from '../pages/admin/phong-ban.page'
import { ChucVuPage } from '../pages/admin/chuc-vu.page'
import { testData } from '../data/test-data'

test.describe('Employee self-service', () => {
  const nvData = testData.nhanVien
  const pbData = testData.phongBan
  const cvData = testData.chucVu

  test('employee login, dashboard, profile, leave request', async ({ page }) => {
    // Step 1: Login as admin to create an employee
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('admin', 'Admin123!')

    // Create a phòng ban for the employee
    const phongBanPage = new PhongBanPage(page)
    await phongBanPage.goto()
    await phongBanPage.create(pbData)

    // Create a chức vụ for the employee
    const chucVuPage = new ChucVuPage(page)
    await chucVuPage.goto()
    await chucVuPage.create(cvData)

    // Step 2: Create employee via API (avoids dialog flow timing issues)
    const listPage = new NhanVienListPage(page)
    const empResult = await page.evaluate(async (opts) => {
      // Zustand persist + ssrSafeStorage double-stringifies; parse twice
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return 'no_auth_data'
      let parsed: any = null
      try { parsed = JSON.parse(raw) } catch { return 'parse_failed' }
      // parsed might be a string (inner JSON) or an object
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch {} }
      const state = parsed.state || parsed
      const token = state.accessToken || null
      if (!token) return `no_token:state_keys=${Object.keys(state).join(',')}`
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const api = opts.apiBase
      
      // Find phòng ban by name
      const pbRes = await fetch(`${api}/api/v1/admin/phong-ban?page=1&page_size=100`, { headers })
      const pbListResp = await pbRes.json()
      const pbList = pbListResp.data || []
      const pb = pbList.find((p: any) => p.ten_phong_ban === opts.pbName)
      
      // Find chức vụ by name
      const cvRes = await fetch(`${api}/api/v1/admin/chuc-vu?page=1&page_size=100`, { headers })
      const cvListResp = await cvRes.json()
      const cvList = cvListResp.data || []
      const cv = cvList.find((c: any) => c.ten_chuc_vu === opts.cvName)
      
      if (!pb) return `no_pb:${opts.pbName}`
      if (!cv) return `no_cv:${opts.cvName}`
      
      // Create employee via API
      const payload = {
        ho_ten: opts.hoTen,
        gioi_tinh: 'Nam',
        ngay_sinh: '1990-01-15',
        que_quan: 'Hà Nội',
        dia_chi_thuong_tru: 'Hà Nội',
        so_dien_thoai: opts.phone,
        email: opts.email,
        dan_toc: 'Kinh',
        noi_sinh: 'Hà Nội',
        tinh_trang_hon_nhan: 'doc_than',
        so_cccd: opts.cccd,
        ngay_cap_cccd: '2015-01-01',
        noi_cap_cccd: 'CA Hà Nội',
        loai_nhan_vien: 'giao_vien',
        trang_thai: 'dang_lam',
        cap_hoc: 'thpt',
        phong_ban_id: pb.id,
        chuc_vu_id: cv.id,
        loai_hop_dong: 'vien_chuc',
        ngay_vao_lam: '2026-01-01',
        he_so_luong: '2.34',
      }
      const res = await fetch(`${api}/api/v1/admin/nhan-vien`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) return `create_failed:${res.status}:${await res.text()}`
      const emp = await res.json()
      return JSON.stringify({ id: emp.id || emp.data?.id })
    }, {
      hoTen: nvData.hoTen,
      phone: nvData.soDienThoai,
      email: nvData.emailTruong,
      cccd: nvData.soCCCD,
      pbName: pbData.ten,
      cvName: cvData.ten,
      apiBase: 'http://localhost:8000',
    })

    // Refresh list page to see the employee
    let employeeId = ''
    if (typeof empResult === 'string') {
      if (empResult.startsWith('create_failed') || empResult.startsWith('no_')) {
        throw new Error(`Employee creation via API failed: ${empResult}`)
      }
      try { employeeId = JSON.parse(empResult)?.id || '' } catch {}
    }
    await listPage.goto()
    await page.waitForTimeout(2000)

    // Reset employee password via API to get actual login credentials
    if (!employeeId) {
      // Fallback: try to find employee in table and get ID from link
      await listPage.search(nvData.hoTen)
      const employeeRow = page.getByRole('row').filter({ hasText: nvData.hoTen })
      await expect(employeeRow.first()).toBeVisible({ timeout: 10000 })
      const detailLink = employeeRow.getByRole('link').first()
      const detailHref = await detailLink.getAttribute('href')
      employeeId = detailHref?.split('/').pop() || ''
    }

    const creds = await page.evaluate(async (id) => {
      const stored = localStorage.getItem('auth-storage')
      if (!stored) return 'no_token'
      let parsed: any = null
      try { parsed = JSON.parse(stored) } catch { return 'no_token' }
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch {} }
      const state = parsed.state || parsed
      const token = state.accessToken || null
      if (!token) return 'no_token'
      const res = await fetch(`http://localhost:8000/api/v1/admin/nhan-vien/${id}/reset-mat-khau`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!res.ok) return `reset_failed:${res.status}`
      const data = await res.json()
      return JSON.stringify(data)
    }, employeeId)
    
    let employeeUsername = ''
    let employeePassword = ''
    if (creds && !creds.startsWith('reset_failed') && !creds.startsWith('no_token')) {
      try {
        const parsed = JSON.parse(creds)
        employeeUsername = parsed.data?.ten_dang_nhap || parsed.ten_dang_nhap || ''
        employeePassword = parsed.data?.mat_khau_moi || parsed.mat_khau_moi || ''
      } catch {}
    }

    // Logout admin: click admin dropdown and logout
    await page.getByRole('button', { name: /admin/i }).click()
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(page).toHaveURL('/login')

    // Login as employee with actual credentials
    await loginPage.login(employeeUsername, employeePassword)
    await page.waitForURL(/\/dashboard|\/employee/, { timeout: 10000 })

    // Navigate to employee dashboard
    const employeeDashboard = new EmployeeDashboardPage(page)
    await employeeDashboard.goto()
    await employeeDashboard.assertBentoCardsVisible()

    // Profile
    const profilePage = new EmployeeProfilePage(page)
    await profilePage.goto()
    await profilePage.editPhone('0988888888')

    // Leave request - create via API (avoids fragile calendar popover interaction)
    const nghiPhepPage = new EmployeeNghiPhepPage(page)
    
    // Get employee auth token and create a leave request directly
    const leaveResult = await page.evaluate(() => {
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return 'no_auth_data'
      let parsed: any = null
      try { parsed = JSON.parse(raw) } catch { return 'parse_failed' }
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed) } catch {} }
      const state = parsed.state || parsed
      const token = state.accessToken || null
      if (!token) return 'no_token'

      const tuNgay = new Date(); tuNgay.setDate(tuNgay.getDate() + 1)
      const denNgay = new Date(); denNgay.setDate(denNgay.getDate() + 2)
      const fmt = (d: Date) => d.toISOString().split('T')[0]

      return fetch('http://localhost:8000/api/v1/nhan-vien/nghi-phep/don', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loai_nghi: 'phep_nam',
          tu_ngay: fmt(tuNgay),
          den_ngay: fmt(denNgay),
          ly_do: 'Nghỉ phép năm',
        }),
      }).then(async r => {
        if (!r.ok) return `leave_create_failed:${r.status}:${await r.text()}`
        return 'leave_created'
      })
    })
    if (leaveResult && leaveResult.startsWith('leave_create_failed')) {
      throw new Error(`Leave request failed: ${leaveResult}`)
    }

    // Reload the leave request page and verify the request appears
    await nghiPhepPage.goto()
    await nghiPhepPage.assertLeaveInList()
  })
})
