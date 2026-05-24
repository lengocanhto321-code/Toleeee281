# E2E Test Suite Design — Playwright

## Overview

Full end-to-end test suite covering **Admin UI** and **Employee UI** using Playwright (headless Chromium). Each spec file is self-contained: creates its own test data, tests the complete flow, and cleans up.

## Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin123!` |
| Employee | auto-created via admin UI | mã nhân viên (auto-generated) |

## Test Flow

```
Admin Login → Phòng ban → Chức vụ → Nhân viên (full CRUD + sub-modules) → Lương → Nghỉ phép → Employee Login → Self-service
```

## Project Structure

```
frontend/e2e/
├── playwright.config.ts
├── .auth/
│   └── admin.json           # Saved auth state after login
├── data/
│   └── test-data.ts         # Test data factory
├── pages/
│   ├── login.page.ts
│   ├── admin/
│   │   ├── dashboard.page.ts
│   │   ├── nhan-vien-list.page.ts
│   │   ├── nhan-vien-detail.page.ts
│   │   ├── phong-ban.page.ts
│   │   ├── chuc-vu.page.ts
│   │   ├── luong.page.ts
│   │   └── nghi-phep.page.ts
│   └── employee/
│       ├── dashboard.page.ts
│       ├── profile.page.ts
│       ├── cham-cong.page.ts
│       └── nghi-phep.page.ts
├── specs/
│   ├── 01-auth.spec.ts
│   ├── 02-phong-ban.spec.ts
│   ├── 03-chuc-vu.spec.ts
│   ├── 04-nhan-vien.spec.ts
│   ├── 05-luong.spec.ts
│   ├── 06-nghi-phep.spec.ts
│   └── 07-employee.spec.ts
└── helpers/
    └── cleanup.ts
```

## Locator Strategy

Follows the `label → parent → button` pattern for shadcn/ui components:

```typescript
// Dialog locators
const dialog = page.getByRole('dialog')

// Form fields by label (shadcn/ui uses Label + Input pairing)
await dialog.getByLabel('Tên nhân viên').fill('Nguyễn Văn A')

// Select fields (shadcn/ui Select)
await dialog.getByLabel('Giới tính').click()
await page.getByRole('option', { name: 'Nam' }).click()

// Combobox (shadcn/ui Command/Combobox)
await dialog.getByPlaceholder('Chọn phòng ban...').click()
await page.getByRole('option', { name: 'Phòng A' }).click()

// Date picker
await dialog.getByPlaceholder('Chọn ngày sinh').click()
await page.getByRole('gridcell', { name: '15' }).first().click()

// Buttons
await dialog.getByRole('button', { name: 'Lưu' }).click()
await dialog.getByRole('button', { name: 'Hủy' }).click()

// Tables
await page.getByRole('row').filter({ hasText: 'Nguyễn Văn A' })

// Toasts
await expect(page.getByText('Tạo nhân viên thành công')).toBeVisible()
```

## Spec Details

### 01-auth.spec.ts — Authentication

**Admin login:**
1. Navigate to `/login`
2. Fill "Tên đăng nhập" with `admin`
3. Fill "Mật khẩu" with `Admin123!`
4. Click "Đăng nhập"
5. Assert redirect to `/dashboard`
6. Assert sidebar visible with navigation items

**Admin logout:**
1. Click user avatar in sidebar footer
2. Click "Đăng xuất"
3. Assert redirect to `/login`

**Invalid login:**
1. Enter wrong credentials
2. Assert error toast

### 02-phong-ban.spec.ts — Phòng ban (Department)

**Create:**
1. Navigate to `/phong-ban`
2. Click "Thêm" in sidebar → "Thêm phòng ban mới" dialog
3. Select loại: "Tổ chuyên môn"
4. Fill "Tên phòng ban": `Phòng Test E2E`
5. Click "Thêm mới"
6. Assert success toast
7. Assert new department in table

**Edit:**
1. Click edit icon on the new department
2. Change name to `Phòng Test E2E (Đã sửa)`
3. Click "Cập nhật"
4. Assert updated name in table

**Delete:**
1. Click delete icon
2. Assert "Xác nhận xóa" dialog
3. Click "Xóa"
4. Assert success toast
5. Assert department removed from table

### 03-chuc-vu.spec.ts — Chức vụ (Position)

**Create:**
1. Navigate to `/chuc-vu`
2. Click "Thêm" → "Thêm chức vụ mới" dialog
3. Fill "Tên chức vụ": `Chức vụ Test E2E`
4. Select "Loại chức vụ": `Quản lý`
5. Select "Cấp bậc": `Cấp 1`
6. Fill "Hệ số phụ cấp": `0.5`
7. Click "Thêm mới"
8. Assert success

**Edit:**
1. Click edit → change name
2. Click "Cập nhật"
3. Assert updated

**Delete:**
1. Click delete
2. Confirm in dialog
3. Assert deleted

### 04-nhan-vien.spec.ts — Nhân viên (Employee) — Full CRUD + Sub-modules

**Create employee (full form, all 6 tabs):**
1. Navigate to `/nhan-vien`
2. Click "Thêm nhân viên"
3. **Tab 1 - Cá nhân:**
   - Select loại: "Giáo viên"
   - Fill "Họ và tên": `Nguyễn Văn Test`
   - Select "Giới tính": `Nam`
   - Pick "Ngày sinh": `15/05/1990`
   - Fill "Nơi sinh": `TP. Hồ Chí Minh`
   - Fill "Dân tộc": `Kinh`
   - Fill "Số điện thoại": `0912345678`
   - Fill "Email trường": `test@thanglong.edu.vn`
   - Select "Tình trạng hôn nhân": `Độc thân`
   - Fill "Quê quán": `Quận 1, TP. HCM`
   - Fill "Địa chỉ thường trú": `123 Đường ABC`
4. Click "Tiếp tục"
5. **Tab 2 - CCCD:**
   - Fill "Số CCCD/CMND": `012345678901`
   - Pick "Ngày cấp": `01/01/2015`
   - Fill "Nơi cấp": `CA TP. HCM`
6. Click "Tiếp tục"
7. **Tab 3 - Công tác:**
   - Select "Trạng thái": `Đang làm`
   - Select "Môn dạy": `Toán` (if Giáo viên)
   - Select "Cấp học": `THPT`
   - Select "Phòng ban/Tổ bộ môn": (created Phòng ban)
   - Select "Chức vụ": (created Chức vụ)
8. Click "Tiếp tục"
9. **Tab 4 - Hợp đồng:**
   - Select "Loại hợp đồng": `Vien chuc`
   - Fill "Số hợp đồng": `HD-TEST-001`
   - Pick "Ngày vào làm": `01/01/2026`
   - Fill "Hình thức tuyển dụng": `Thi tuyển`
   - Fill "Nơi ký hợp đồng": `TP. HCM`
   - Fill "Hệ số lương": `2.34`
   - Select "Bậc lương": `Bậc 1`
10. Click "Tiếp tục"
11. **Tab 5 - Đang/Đoàn:** (skip or fill)
12. Click "Tiếp tục"
13. **Tab 6 - Khác:** (optional fields)
14. Click "Tạo nhân viên"
15. Assert success toast: "Tạo nhân viên thành công"
16. Assert new employee in table

**View employee detail:**
1. Click on employee row
2. Assert detail sidebar panel opens with "Chi tiết nhân viên"
3. Verify tabs: Cá nhân, CCCD, Công tác, Hợp đồng, Lương, Gia đình, Khen thưởng/Kỷ luật, Đào tạo, Chấm công, Nghỉ phép

**Sub-module: Người thân (Family)**
1. From detail, go to "Gia đình" tab
2. Click "Thêm người thân"
3. Fill "Họ tên": `Nguyễn Thị Test`
4. Select "Quan hệ": `Vợ`
5. Fill "Năm sinh": `1993`
6. Click "Thêm"
7. Assert relative in list
8. Click edit → change name → "Cập nhật"
9. Click delete → confirm → assert removed

**Sub-module: Bằng cấp (Degree)**
1. Go to "Đào tạo" tab
2. Click "Thêm bằng cấp"
3. Select "Loại bằng": `Đại học`
4. Fill "Tên bằng": `Cử nhân Toán`
5. Click "Thêm"
6. Assert degree in list
7. Delete → confirm

**Sub-module: Khen thưởng/Kỷ luật (Reward/Discipline)**
1. Go to "Khen thưởng/Kỷ luật" tab
2. Add a reward: select "Khen thưởng", fill form, submit
3. Assert reward in list
4. Add a discipline: select "Kỷ luật", fill form, submit
5. Delete both

**Sub-module: Hợp đồng (Contract)**
1. Go to "Hợp đồng" tab
2. Click "Ký hợp đồng mới"
3. Fill contract form fields
4. Click "Thêm mới"
5. Assert contract in list
6. Edit contract
7. Delete contract (cancel/hủy)

**Edit employee:**
1. Click "Sửa thông tin" from detail sidebar
2. Change "Họ và tên" to `Nguyễn Văn Test (Đã sửa)`
3. Click "Cập nhật"
4. Assert updated name

**Delete employee:**
1. From list, click delete
2. Assert "Xác nhận xóa" dialog with employee name
3. Click "Xóa"
4. Assert success
5. Assert employee removed from list

### 05-luong.spec.ts — Lương (Salary)

**Cấu hình lương:**
1. Navigate to `/luong`
2. Go to "Cấu hình" tab
3. Click "Thêm" → "Cấu hình hệ thống lương"
4. Set "Lương cơ sở (VND)": `2340000`
5. Set "Hệ số đặc thù": `1.0`
6. Set "BHXH": `8`, "BHYT": `1.5`, "BHTN": `1`
7. Set "Giảm trừ bản thân": `11000000`
8. Set "Người phụ thuộc": `4400000`
9. Click "Lưu cấu hình"
10. Assert success

**Chạy lương:**
1. Click "Chạy lương"
2. Select month/year
3. Click "Chạy lương"
4. Assert success

### 06-nghi-phep.spec.ts — Nghỉ phép (Leave) — Admin

1. Navigate to `/nghi-phep`
2. Filter by "Chờ duyệt"
3. Click on a pending leave request
4. View detail dialog
5. Click "Duyệt" or "Từ chối"
6. Assert success toast

### 07-employee.spec.ts — Employee Self-Service

**Employee login:**
1. Navigate to `/login`
2. Login with employee code + phone
3. Assert redirect to `/employee`

**Employee dashboard:**
1. Assert greeting: `Xin chào, {name}`
2. Assert bento cards: Phép còn lại, Công tháng này, Đơn chờ duyệt, Hệ số CC
3. Assert quick actions: Xin nghỉ, QR của tôi, Xem lương

**Employee profile:**
1. Navigate to `/employee/profile`
2. Assert profile info displays correctly
3. Edit phone number → "Lưu" → assert updated
4. Test "Đổi mật khẩu" flow

**Employee QR/Attendance:**
1. Navigate to `/employee/my-qr`
2. Assert QR scanner section visible
3. Assert check-in button visible

**Employee leave request:**
1. Navigate to `/employee/nghi-phep`
2. Click "Xin nghỉ"
3. Select "Loại nghỉ phép": `Phép năm`
4. Pick dates
5. Click "Tạo đơn"
6. Assert success
7. Assert new leave in list with "Chờ duyệt" status

**Employee salary view:**
1. Navigate to `/employee/luong`
2. Assert salary cards visible
3. Assert payslip details

## Data Cleanup

Each spec is responsible for cleaning up its test data:
- Delete created employees
- Delete created departments
- Delete created positions
- Run in `afterAll` hook

## Playwright Config

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,        // Sequential: admin → employee flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                  // Single worker for stateful tests
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
    },
  ],
})
```

## Dependencies

```bash
npm install -D @playwright/test
npx playwright install chromium
```
