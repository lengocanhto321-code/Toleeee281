# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-employee.spec.ts >> Employee self-service >> employee login, dashboard, profile, leave request
- Location: e2e/specs/06-employee.spec.ts:12:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByRole('button', { name: 'Tiếp tục' })
    - locator resolved to <button disabled type="button" data-size="default" data-state="closed" data-variant="default" data-slot="tooltip-trigger" class="group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border…>…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - list:
                - listitem:
                  - link:
                    - /url: /dashboard
                    - generic:
                      - img
            - generic:
              - generic:
                - generic:
                  - list:
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
                    - listitem:
                      - button:
                        - img
            - generic:
              - list:
                - listitem:
                  - button:
                    - generic:
                      - generic: AD
                    - img
          - generic:
            - generic:
              - generic:
                - heading [level=2]: Nhân viên
              - generic:
                - button:
                  - img
                  - text: Thêm nhân viên
                - button:
                  - img
                  - text: Xuất Excel
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - img
                        - generic: Đang làm
                      - generic: "6"
                    - generic:
                      - generic:
                        - img
                        - generic: Sinh nhật
                      - generic: "4"
                    - generic:
                      - generic:
                        - img
                        - generic: Kỷ niệm
                      - generic: "0"
                    - generic:
                      - generic:
                        - img
                        - generic: NV mới
                      - generic: "6"
    - main:
      - generic:
        - button:
          - img
          - generic: Toggle Sidebar
        - navigation:
          - list:
            - generic:
              - listitem:
                - link [disabled]: Nhân viên
        - generic: Chủ nhật, 24/05/2026 — 17:38:08
      - generic:
        - generic:
          - generic:
            - paragraph: 6 nhân viên
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - img
                    - textbox:
                      - /placeholder: Tìm tên, mã NV, email, CCCD, SĐT...
                  - generic:
                    - button: Tất cả
                    - button: Đang làm
                    - button: Nghỉ việc
                    - button: Nghỉ hưu
                - generic:
                  - combobox:
                    - img
                    - generic: Họ tên (A→Z)
                    - img
                  - button:
                    - img
                    - text: Lọc nâng cao
          - generic:
            - generic:
              - generic:
                - table:
                  - rowgroup:
                    - row:
                      - columnheader:
                        - generic:
                          - checkbox
                      - columnheader:
                        - button:
                          - text: Nhân viên
                          - img
                      - columnheader:
                        - button:
                          - text: Loại
                          - img
                      - columnheader:
                        - button:
                          - text: Cấp học
                          - img
                      - columnheader:
                        - button:
                          - text: Phòng ban
                          - img
                      - columnheader:
                        - button:
                          - text: Chức vụ
                          - img
                      - columnheader:
                        - button:
                          - text: Ngày vào
                          - img
                      - columnheader:
                        - button:
                          - text: Thâm niên
                          - img
                      - columnheader:
                        - button:
                          - text: Trạng thái
                          - img
                      - columnheader: Lương
                      - columnheader:
                        - generic: Thao tác
                  - rowgroup:
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/NV-4uabsc
                          - generic: LP
                          - generic:
                            - generic: Lê Hữu Phước
                            - generic: NV-4uabsc
                            - generic: colourful.treek@gmail.com
                      - cell:
                        - generic:
                          - img
                          - text: Giáo viên
                      - cell:
                        - generic:
                          - img
                          - text: THPT
                      - cell:
                        - generic: To Am nhac - My thuat
                      - cell:
                        - generic: Giao vien
                      - cell: 14/05/2026
                      - cell: Mới vào
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/NV-OBUJVS
                          - generic: NT
                          - generic:
                            - generic: Nguyễn Flow Test
                            - generic: NV-OBUJVS
                            - generic: flow1779269714@thpt.edu.vn
                      - cell:
                        - generic:
                          - img
                          - text: Nhân viên
                      - cell:
                        - generic:
                          - img
                          - text: THPT
                      - cell:
                        - generic: Flow 1779269714
                      - cell:
                        - generic: Flow CV
                      - cell: 01/01/2024
                      - cell: 2n 4th
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/NV-K7MN4A
                          - generic: NU
                          - generic:
                            - generic: Nguyễn Test Updated
                            - generic: NV-K7MN4A
                            - generic: test1779269583@thpt.edu.vn
                      - cell:
                        - generic:
                          - img
                          - text: Nhân viên
                      - cell:
                        - generic:
                          - img
                          - text: THPT
                      - cell:
                        - generic: Phòng Test 1779269583
                      - cell:
                        - generic: Chức vụ Test 1779269583
                      - cell: 01/01/2024
                      - cell: 2n 4th
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/NV002
                          - generic: NM
                          - generic:
                            - generic: Nguyễn Thị Mai
                            - generic: NV002
                      - cell:
                        - generic:
                          - img
                          - text: Giáo viên
                      - cell: —
                      - cell:
                        - generic: Tổ Toán
                      - cell:
                        - generic: Giao vien tap su
                      - cell: 01/02/2025
                      - cell: 1n 3th
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/ADMIN001
                          - generic: QV
                          - generic:
                            - generic: Quản trị viên
                            - generic: ADMIN001
                            - generic: admin@thpt-thanglong.edu.vn
                      - cell:
                        - generic:
                          - img
                          - text: chuyen_mon
                      - cell: —
                      - cell:
                        - generic: Chưa phân bổ
                      - cell: —
                      - cell: —
                      - cell: —
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
                    - row:
                      - cell:
                        - generic:
                          - checkbox
                      - cell:
                        - link:
                          - /url: /nhan-vien/NV001
                          - generic: TH
                          - generic:
                            - generic: Trần Văn Hùng
                            - generic: NV001
                      - cell:
                        - generic:
                          - img
                          - text: Giáo viên
                      - cell: —
                      - cell:
                        - generic: Tổ Toán
                      - cell: —
                      - cell: 01/01/2025
                      - cell: 1n 4th
                      - cell:
                        - generic:
                          - img
                          - text: Đang làm
                      - cell:
                        - generic:
                          - generic: Chưa setup
                      - cell:
                        - button:
                          - img
              - generic:
                - generic:
                  - generic:
                    - combobox:
                      - generic: 20 / trang
                      - img
                    - generic: 1–6 / 6
  - region "Notifications alt+T"
  - generic:
    - generic:
      - img
    - button:
      - img
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "Thêm nhân viên mới" [ref=e11]:
    - generic [ref=e13]:
      - img [ref=e15]
      - generic [ref=e19]:
        - heading "Thêm nhân viên mới" [level=2] [ref=e20]
        - paragraph [ref=e21]: Điền đầy đủ thông tin bên dưới
    - generic [ref=e22]:
      - generic [ref=e24]:
        - tablist [ref=e25]:
          - tab "Cá nhân" [selected] [ref=e26] [cursor=pointer]:
            - img
            - text: Cá nhân
          - tab "CCCD" [disabled]:
            - img
            - text: CCCD
          - tab "Công tác" [disabled]:
            - img
            - text: Công tác
          - tab "Hợp đồng" [disabled]:
            - img
            - text: Hợp đồng
          - tab "Đảng/Đoàn" [disabled]:
            - img
            - text: Đảng/Đoàn
          - tab "Khác" [disabled]:
            - img
            - text: Khác
        - generic [ref=e27]:
          - img [ref=e28]
          - generic [ref=e30]: Thông tin cá nhân
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - img [ref=e36]
            - text: Loại nhân viên
            - generic [ref=e39]: "*"
          - generic [ref=e40]:
            - button "Giáo viên" [ref=e41]:
              - img [ref=e42]
              - generic [ref=e47]: Giáo viên
            - button "Nhân viên" [ref=e48]:
              - img [ref=e49]
              - generic [ref=e54]: Nhân viên
            - button "Cán bộ" [ref=e55]:
              - img [ref=e56]
              - generic [ref=e59]: Cán bộ
        - generic [ref=e60]:
          - heading "Thông tin cơ bản" [level=3] [ref=e61]:
            - img [ref=e62]
            - text: Thông tin cơ bản
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]:
                - text: Họ và tên
                - generic [ref=e68]: "*"
              - textbox "Họ và tên *" [ref=e69]:
                - /placeholder: Nguyễn Văn A
                - text: Nguyễn Văn Test 1779619070748
            - generic [ref=e70]:
              - generic [ref=e71]:
                - text: Giới tính
                - generic [ref=e72]: "*"
              - combobox "Giới tính *" [ref=e73]:
                - generic: 👨 Nam
                - img
              - combobox [ref=e74]
            - generic [ref=e75]:
              - generic [ref=e76]:
                - text: Ngày sinh
                - generic [ref=e77]: "*"
              - combobox [ref=e78]:
                - img
                - text: 15/05/2026
            - generic [ref=e79]:
              - generic [ref=e80]:
                - text: Nơi sinh
                - generic [ref=e81]: "*"
              - textbox "Nơi sinh *" [ref=e82]:
                - /placeholder: TP. Hồ Chí Minh
                - text: Hà Nội
            - generic [ref=e83]:
              - generic [ref=e84]:
                - text: Dân tộc
                - generic [ref=e85]: "*"
              - textbox "Dân tộc *" [ref=e86]:
                - /placeholder: Kinh
                - text: Kinh
            - generic [ref=e87]:
              - generic [ref=e88]: Tôn giáo
              - textbox "Tôn giáo" [ref=e89]:
                - /placeholder: Không
        - generic [ref=e90]:
          - heading "Liên lạc" [level=3] [ref=e91]:
            - img [ref=e92]
            - text: Liên lạc
          - generic [ref=e94]:
            - generic [ref=e95]:
              - generic [ref=e96]:
                - text: Số điện thoại
                - generic [ref=e97]: "*"
              - textbox "Số điện thoại *" [ref=e98]:
                - /placeholder: 0912 345 678
                - text: "09121779619070748"
            - generic [ref=e99]:
              - generic [ref=e100]:
                - text: Email trường
                - generic [ref=e101]: "*"
              - textbox "Email trường *" [ref=e102]:
                - /placeholder: ten@thanglong.edu.vn
                - text: test1779619070748@thanglong.edu.vn
            - generic [ref=e103]:
              - generic [ref=e104]: Email cá nhân
              - textbox "Email cá nhân" [ref=e105]:
                - /placeholder: ten@gmail.com
            - generic [ref=e106]:
              - generic [ref=e107]:
                - text: Tình trạng hôn nhân
                - generic [ref=e108]: "*"
              - combobox "Tình trạng hôn nhân *" [ref=e109]:
                - generic: Độc thân
                - img
              - combobox [ref=e110]
        - generic [ref=e111]:
          - heading "Địa chỉ" [level=3] [ref=e112]:
            - img [ref=e113]
            - text: Địa chỉ
          - generic [ref=e116]:
            - generic [ref=e117]:
              - text: Quê quán
              - generic [ref=e118]: "*"
            - textbox "Quê quán *" [ref=e119]:
              - /placeholder: Quận 1, TP. Hồ Chí Minh
              - text: Hà Nội
          - generic [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]:
                - text: Địa chỉ thường trú
                - generic [ref=e123]: "*"
              - textbox "Địa chỉ thường trú *" [active] [ref=e124]:
                - /placeholder: 123 Đường ABC, Quận 1
                - text: Hà Nội
            - generic [ref=e125]:
              - generic [ref=e126]: Địa chỉ tạm trú
              - textbox "Địa chỉ tạm trú" [ref=e127]:
                - /placeholder: 456 Đường XYZ, Quận 2
      - generic [ref=e129]:
        - generic [ref=e131]:
          - img [ref=e132]
          - text: Có thay đổi chưa lưu
        - generic [ref=e134]:
          - button "Hủy" [ref=e135]
          - button "Tiếp tục" [disabled]:
            - text: Tiếp tục
            - img
    - button "Close" [ref=e136]:
      - img
      - generic [ref=e137]: Close
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { LoginPage } from '../pages/login.page'
  3  | import { EmployeeDashboardPage } from '../pages/employee/dashboard.page'
  4  | import { EmployeeProfilePage } from '../pages/employee/profile.page'
  5  | import { EmployeeNghiPhepPage } from '../pages/employee/nghi-phep.page'
  6  | import { NhanVienListPage } from '../pages/admin/nhan-vien-list.page'
  7  | import { testData } from '../data/test-data'
  8  | 
  9  | test.describe('Employee self-service', () => {
  10 |   const nvData = testData.nhanVien
  11 | 
  12 |   test('employee login, dashboard, profile, leave request', async ({ page }) => {
  13 |     // Step 1: Login as admin to create an employee
  14 |     const loginPage = new LoginPage(page)
  15 |     await loginPage.goto()
  16 |     await loginPage.login('admin', 'Admin123!')
  17 | 
  18 |     // Step 2: Create a minimal employee
  19 |     const listPage = new NhanVienListPage(page)
  20 |     await listPage.goto()
  21 | 
  22 |     await page.getByRole('button', { name: 'Thêm nhân viên' }).click()
  23 |     const dialog = page.getByRole('dialog')
  24 |     await dialog.getByRole('button', { name: 'Giáo viên' }).click()
  25 |     await dialog.getByLabel('Họ và tên').fill(nvData.hoTen)
  26 |     await dialog.getByLabel('Giới tính').click()
  27 |     await page.getByRole('option', { name: 'Nam' }).click()
  28 |     await dialog.locator('button').filter({ hasText: 'Chọn ngày sinh' }).click()
  29 |     await page.getByRole('button', { name: '15' }).last().click()
  30 |     await dialog.getByLabel('Nơi sinh').fill('Hà Nội')
  31 |     await dialog.getByLabel('Dân tộc').fill('Kinh')
  32 |     await dialog.getByLabel('Số điện thoại').fill(nvData.soDienThoai)
  33 |     await dialog.getByLabel('Email trường').fill(nvData.emailTruong)
  34 |     await dialog.getByLabel('Tình trạng hôn nhân').click()
  35 |     await page.getByRole('option', { name: 'Độc thân' }).click()
  36 |     await dialog.getByLabel('Quê quán').fill('Hà Nội')
  37 |     await dialog.getByLabel('Địa chỉ thường trú').fill('Hà Nội')
> 38 |     await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
     |                                                            ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  39 | 
  40 |     // Tab 2: CCCD
  41 |     await dialog.getByLabel('Số CCCD/CMND').fill(nvData.soCCCD)
  42 |     await dialog.locator('button').filter({ hasText: 'Ngày cấp CCCD' }).click()
  43 |     await page.getByRole('gridcell', { name: '1' }).first().click()
  44 |     await dialog.getByLabel('Nơi cấp').fill('CA Hà Nội')
  45 |     await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
  46 | 
  47 |     // Tab 3: Công tác
  48 |     await dialog.getByLabel('Trạng thái').click()
  49 |     await page.getByRole('option', { name: 'Đang làm' }).click()
  50 |     await dialog.getByLabel('Cấp học').click()
  51 |     await page.getByRole('option', { name: 'THPT' }).click()
  52 |     await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
  53 | 
  54 |     // Tab 4: Hợp đồng
  55 |     await dialog.getByLabel('Loại hợp đồng').click()
  56 |     await page.getByRole('option', { name: 'Vien chuc' }).click()
  57 |     await dialog.locator('button').filter({ hasText: 'Ngày vào làm' }).click()
  58 |     await page.getByRole('gridcell', { name: '1' }).first().click()
  59 |     await dialog.getByLabel('Hệ số lương').fill('2.34')
  60 |     await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
  61 |     await dialog.getByRole('button', { name: 'Tiếp tục' }).click()
  62 |     await dialog.getByRole('button', { name: 'Tạo nhân viên' }).click()
  63 |     await expect(page.getByText('thành công')).toBeVisible({ timeout: 15000 })
  64 | 
  65 |     // Extract the employee code from the table row
  66 |     const employeeRow = page.getByRole('row').filter({ hasText: nvData.hoTen })
  67 |     const rowText = await employeeRow.textContent()
  68 |     const maNhanVien = rowText?.match(/NV-\d+|GV-\d+|NV\w+/)?.[0] || nvData.hoTen
  69 | 
  70 |     // Logout admin
  71 |     await page.getByRole('button', { name: /admin/i }).click()
  72 |     await page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
  73 |     await expect(page).toHaveURL('/login')
  74 | 
  75 |     // Login as employee
  76 |     await loginPage.login(maNhanVien, nvData.soDienThoai)
  77 | 
  78 |     // Dashboard
  79 |     const dashboardPage = new EmployeeDashboardPage(page)
  80 |     await dashboardPage.assertBentoCardsVisible()
  81 | 
  82 |     // Profile
  83 |     const profilePage = new EmployeeProfilePage(page)
  84 |     await profilePage.goto()
  85 |     await profilePage.editPhone('0988888888')
  86 | 
  87 |     // Leave request
  88 |     const nghiPhepPage = new EmployeeNghiPhepPage(page)
  89 |     await nghiPhepPage.goto()
  90 |     await nghiPhepPage.createLeaveRequest()
  91 |     await nghiPhepPage.assertLeaveInList()
  92 |   })
  93 | })
  94 | 
```