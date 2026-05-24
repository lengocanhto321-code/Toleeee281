# Playwright E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build comprehensive Playwright E2E test suite covering all Admin and Employee UI flows.

**Architecture:** Page Object Model with 7 spec files, each self-contained (creates test data → tests flow → cleans up). Admin auth state saved to `.auth/admin.json` and reused across admin specs. Employee spec does its own login flow.

**Tech Stack:** Playwright 1.60+, TypeScript, Next.js 16, shadcn/ui (Radix)

**Pre-requisites:** Backend running on `localhost:8000`, frontend dev server on `localhost:3000`

---

## File Structure

```
frontend/e2e/
├── playwright.config.ts          # Playwright configuration (headless, baseURL, projects)
├── .auth/                        # Saved auth states (gitignored)
├── data/
│   └── test-data.ts              # Test data factory: unique names, employee fields
├── pages/
│   ├── login.page.ts             # Login page object
│   └── admin/
│       ├── nhan-vien-list.page.ts      # Employee list: create/edit/delete employee
│       ├── nhan-vien-detail.page.ts    # Employee detail tabs: sub-module CRUD
│       ├── phong-ban.page.ts           # Department CRUD
│       ├── chuc-vu.page.ts             # Position CRUD
│       ├── luong.page.ts               # Salary config + run payroll
│       └── nghi-phep.page.ts           # Leave approval
├── specs/
│   ├── auth.setup.ts             # Global setup: admin login, save auth state
│   ├── 01-phong-ban.spec.ts
│   ├── 02-chuc-vu.spec.ts
│   ├── 03-nhan-vien.spec.ts
│   ├── 04-luong.spec.ts
│   ├── 05-nghi-phep.spec.ts
│   └── 06-employee.spec.ts
└── helpers/
    └── cleanup.ts                # API calls to delete test data
```

### Task 1: Install Playwright & Scaffold Config

**Files:**
- Create: `frontend/e2e/playwright.config.ts`

**Steps:**

- [ ] **Step 1: Install Playwright**

Run:
```bash
cd /mnt/newhome/code/hr_management/frontend
npm install -D @playwright/test
npx playwright install chromium
npx playwright install-deps chromium
```

- [ ] **Step 2: Create `e2e/` directory and `.gitignore` entry**

Run:
```bash
mkdir -p e2e/.auth e2e/specs e2e/pages/admin e2e/data e2e/helpers
echo ".auth/" >> e2e/.gitignore
```

- [ ] **Step 3: Create `playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
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

- [ ] **Step 4: Commit**

```bash
git add frontend/e2e/playwright.config.ts frontend/e2e/.gitignore frontend/package.json frontend/package-lock.json
git commit -m "test(e2e): add Playwright config with headless Chromium"
```

---

### Task 2: Create Test Data Factory

**Files:**
- Create: `frontend/e2e/data/test-data.ts`

- [ ] **Step 1: Create test data factory**

```typescript
let counter = Date.now()

export const testData = {
  get phongBan() {
    return {
      ten: `Phòng Test ${counter++}`,
      tenSua: `Phòng Test ${counter++} (Đã sửa)`,
      loai: 'Tổ chuyên môn',
    }
  },

  get chucVu() {
    return {
      ten: `Chức vụ Test ${counter++}`,
      tenSua: `Chức vụ Test ${counter++} (Đã sửa)`,
      loai: 'Quản lý',
      capBac: 'Cấp 1',
      heSoPhuCap: '0.5',
    }
  },

  get nhanVien() {
    const id = counter++
    return {
      hoTen: `Nguyễn Văn Test ${id}`,
      hoTenSua: `Nguyễn Văn Test ${id} (Đã sửa)`,
      gioiTinh: 'Nam',
      ngaySinh: '15/05/1990',
      noiSinh: 'TP. Hồ Chí Minh',
      danToc: 'Kinh',
      tonGiao: 'Không',
      soDienThoai: `0912${String(id).padStart(6, '0')}`,
      emailTruong: `test${id}@thanglong.edu.vn`,
      emailCaNhan: `test${id}@gmail.com`,
      tinhTrangHonNhan: 'Độc thân',
      queQuan: 'Quận 1, TP. Hồ Chí Minh',
      diaChiThuongTru: '123 Đường ABC, Quận 1',
      soCCCD: `${String(id).padStart(12, '0')}`,
      ngayCapCCCD: '01/01/2015',
      noiCapCCCD: 'CA TP. Hồ Chí Minh',
      trangThai: 'Đang làm',
      monDay: 'Toán',
      capHoc: 'THPT',
      loaiHopDong: 'Vien chuc',
      soHopDong: `HD-TEST-${id}`,
      ngayVaoLam: '01/01/2026',
      hinhThucTuyenDung: 'Thi tuyển',
      noiKyHopDong: 'TP. Hồ Chí Minh',
      heSoLuong: '2.34',
      bacLuong: 'Bậc 1',
      // Login credentials (ma_nhan_vien = auto-generated, password = sdt)
      username: '', // will be set after creation
      password: '', // will use soDienThoai
    }
  },

  get nguoiThan() {
    return {
      hoTen: `Nguyễn Thị Test ${counter++}`,
      quanHe: 'Vợ',
      namSinh: '1993',
      ngheNghiep: 'Giáo viên',
      soDienThoai: '0909123456',
    }
  },

  get bangCap() {
    return {
      loaiBang: 'Đại học',
      tenBang: `Cử nhân Toán ${counter++}`,
      namCap: '2015',
      chuyenNganh: 'Toán học',
      truongCap: 'ĐH Sư phạm Hà Nội',
      xepLoai: 'Giỏi',
    }
  },

  get khenThuong() {
    return {
      loai: 'Khen thưởng',
      hinhThuc: 'Bằng khen',
      lyDo: 'Thành tích xuất sắc trong giảng dạy',
      ngayQuyetDinh: '2026-03-15',
    }
  },

  get kyLuat() {
    return {
      loai: 'Kỷ luật',
      hinhThuc: 'Khiển trách',
      lyDo: 'Vi phạm nội quy nhà trường',
      ngayQuyetDinh: '2026-03-20',
    }
  },

  get hopDong() {
    const id = counter++
    return {
      soHopDong: `HC-E2E-${id}`,
      loaiHopDong: 'Hợp đồng',
      ngayBatDau: '2026-06-01',
      ngayKetThuc: '2027-06-01',
      luongCoBan: '5000000',
      hinhThucTuyenDung: 'Thi tuyển',
    }
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/e2e/data/test-data.ts
git commit -m "test(e2e): add test data factory"
```

---

### Task 3: Create Login Page Object & Auth Setup

**Files:**
- Create: `frontend/e2e/pages/login.page.ts`
- Create: `frontend/e2e/specs/auth.setup.ts`

- [ ] **Step 1: Create `login.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
    await expect(this.page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Tên đăng nhập').fill(username)
    await this.page.getByLabel('Mật khẩp').fill(password)
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click()
  }

  async assertLoggedIn() {
    await expect(this.page).toHaveURL(/\/dashboard|\/employee/)
  }

  async logout() {
    // Click sidebar user avatar to open dropdown
    await this.page.getByRole('button', { name: /admin/i }).click()
    await this.page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(this.page).toHaveURL('/login')
  }
}
```

Wait, the password label might be "Mật khẩu" not "Mật khẩp". Let me fix that.

- [ ] **Step 2: Fix login page and create auth.setup.ts**

```typescript
// frontend/e2e/pages/login.page.ts
import { Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
    await expect(this.page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Tên đăng nhập').fill(username)
    await this.page.getByLabel('Mật khẩu').fill(password)
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click()
  }

  async assertLoggedIn() {
    await expect(this.page).toHaveURL(/\/dashboard|\/employee/)
  }

  async logout() {
    await this.page.getByRole('button', { name: /admin/i }).click()
    await this.page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(this.page).toHaveURL('/login')
  }
}
```

```typescript
// frontend/e2e/specs/auth.setup.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/login.page.ts frontend/e2e/specs/auth.setup.ts
git commit -m "test(e2e): add login page object and auth setup"
```

---

### Task 4: Create Phòng Ban Page Object & Spec

**Files:**
- Create: `frontend/e2e/pages/admin/phong-ban.page.ts`
- Create: `frontend/e2e/specs/01-phong-ban.spec.ts`

- [ ] **Step 1: Create `phong-ban.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class PhongBanPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/phong-ban')
    await expect(this.page.getByText('phòng ban').first()).toBeVisible()
  }

  async create(data: ReturnType<typeof testData.phongBan>) {
    // Click "Thêm" in sidebar
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm phòng ban mới' })).toBeVisible()

    // Select loại phòng ban
    await dialog.getByRole('button', { name: data.loai }).click()

    // Fill name
    await dialog.getByLabel('Tên phòng ban').fill(data.ten)

    // Submit
    await dialog.getByRole('button', { name: 'Thêm mới' }).click()

    // Wait for success toast
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async edit(oldName: string, newName: string) {
    // Find the row and click edit button
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /edit|sửa|pencil/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chỉnh sửa phòng ban' })).toBeVisible()

    await dialog.getByLabel('Tên phòng ban').clear()
    await dialog.getByLabel('Tên phòng ban').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()

    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async delete(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /delete|xóa|trash/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()

    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async assertInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async assertNotInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
```

- [ ] **Step 2: Create `01-phong-ban.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
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
    // CREATE
    await phongBanPage.create(data)
    await phongBanPage.assertInTable(data.ten)

    // READ (verify in table)
    await expect(phongBanPage['page'].getByRole('row').filter({ hasText: data.ten })).toBeVisible()

    // UPDATE
    await phongBanPage.edit(data.ten, data.tenSua)
    await phongBanPage.assertInTable(data.tenSua)

    // DELETE
    await phongBanPage.delete(data.tenSua)
    await phongBanPage.assertNotInTable(data.tenSua)
  })
})
```

Actually, let me avoid accessing private `page` from the test directly. The PhongBanPage already has `assertInTable` and `assertNotInTable` methods.

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/admin/phong-ban.page.ts frontend/e2e/specs/01-phong-ban.spec.ts
git commit -m "test(e2e): add phòng ban CRUD spec"
```

---

### Task 5: Create Chức Vụ Page Object & Spec

**Files:**
- Create: `frontend/e2e/pages/admin/chuc-vu.page.ts`
- Create: `frontend/e2e/specs/02-chuc-vu.spec.ts`

- [ ] **Step 1: Create `chuc-vu.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class ChucVuPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/chuc-vu')
    await expect(this.page.getByText('chức vụ').first()).toBeVisible()
  }

  async create(data: ReturnType<typeof testData.chucVu>) {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm chức vụ mới' })).toBeVisible()

    await dialog.getByLabel('Tên chức vụ').fill(data.ten)
    await dialog.getByLabel('Loại chức vụ').click()
    await this.page.getByRole('option', { name: data.loai }).click()
    await dialog.getByLabel('Cấp bậc').click()
    await this.page.getByRole('option', { name: data.capBac }).click()
    await dialog.getByLabel('Hệ số phụ cấp').fill(data.heSoPhuCap)
    await dialog.getByRole('checkbox', { name: 'Đang hoạt động' }).check()

    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async edit(oldName: string, newName: string) {
    const row = this.page.getByRole('row').filter({ hasText: oldName })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /edit|sửa|pencil/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Cập nhật chức vụ' })).toBeVisible()

    await dialog.getByLabel('Tên chức vụ').clear()
    await dialog.getByLabel('Tên chức vụ').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async delete(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /delete|xóa|trash/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async assertInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  async assertNotInTable(name: string) {
    await expect(this.page.getByRole('row').filter({ hasText: name })).toHaveCount(0)
  }
}
```

- [ ] **Step 2: Create `02-chuc-vu.spec.ts`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/admin/chuc-vu.page.ts frontend/e2e/specs/02-chuc-vu.spec.ts
git commit -m "test(e2e): add chức vụ CRUD spec"
```

---

### Task 6: Create Nhân Viên Page Objects (List + Detail)

**Files:**
- Create: `frontend/e2e/pages/admin/nhan-vien-list.page.ts`
- Create: `frontend/e2e/pages/admin/nhan-vien-detail.page.ts`

- [ ] **Step 1: Create `nhan-vien-list.page.ts`** — handles create, delete employee (list page)

```typescript
import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class NhanVienListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/nhan-vien')
    await expect(this.page.getByText('nhân viên').first()).toBeVisible()
  }

  async create(data: ReturnType<typeof testData.nhanVien>, phongBanName: string, chucVuName: string) {
    // Click Thêm nhân viên
    await this.page.getByRole('button', { name: 'Thêm nhân viên' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm nhân viên mới' })).toBeVisible()

    // === Tab 1: Cá nhân ===
    // Select loại nhân viên
    await dialog.getByRole('button', { name: 'Giáo viên' }).click()

    // Basic info
    await dialog.getByLabel('Họ và tên').fill(data.hoTen)
    await dialog.getByLabel('Giới tính').click()
    await this.page.getByRole('option', { name: data.gioiTinh }).click()
    await dialog.getByLabel('Ngày sinh').click()
    // Pick a day from date picker
    await this.page.getByRole('gridcell', { name: '15' }).first().click()
    await dialog.getByLabel('Nơi sinh').fill(data.noiSinh)
    await dialog.getByLabel('Dân tộc').fill(data.danToc)
    await dialog.getByLabel('Tôn giáo').fill(data.tonGiao)

    // Contact
    await dialog.getByLabel('Số điện thoại').fill(data.soDienThoai)
    await dialog.getByLabel('Email trường').fill(data.emailTruong)
    await dialog.getByLabel('Email cá nhân').fill(data.emailCaNhan)
    await dialog.getByLabel('Tình trạng hôn nhân').click()
    await this.page.getByRole('option', { name: data.tinhTrangHonNhan }).click()

    // Address
    await dialog.getByLabel('Quê quán').fill(data.queQuan)
    await dialog.getByLabel('Địa chỉ thường trú').fill(data.diaChiThuongTru)

    // Next tab
    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 2: CCCD ===
    await dialog.getByLabel('Số CCCD/CMND').fill(data.soCCCD)
    await dialog.getByLabel('Ngày cấp').click()
    await this.page.getByRole('gridcell', { name: '1' }).first().click()
    await dialog.getByLabel('Nơi cấp').fill(data.noiCapCCCD)

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 3: Công tác ===
    await dialog.getByLabel('Trạng thái').click()
    await this.page.getByRole('option', { name: data.trangThai }).click()
    // Môn dạy (for Giáo viên)
    await dialog.getByPlaceholder('Chọn môn dạy...').click()
    await this.page.getByRole('option', { name: data.monDay }).click()
    await dialog.getByLabel('Cấp học').click()
    await this.page.getByRole('option', { name: data.capHoc }).click()
    // Phòng ban
    await dialog.getByPlaceholder('Chọn phòng ban...').click()
    await this.page.getByRole('option', { name: phongBanName }).click()
    // Chức vụ
    await dialog.getByPlaceholder('Chọn chức vụ...').click()
    await this.page.getByRole('option', { name: chucVuName }).click()

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 4: Hợp đồng ===
    await dialog.getByLabel('Loại hợp đồng').click()
    await this.page.getByRole('option', { name: data.loaiHopDong }).click()
    await dialog.getByLabel('Số hợp đồng').fill(data.soHopDong)
    await dialog.getByLabel('Ngày vào làm').click()
    await this.page.getByRole('gridcell', { name: '1' }).first().click()
    await dialog.getByLabel('Hình thức tuyển dụng').fill(data.hinhThucTuyenDung)
    await dialog.getByLabel('Nơi ký hợp đồng').fill(data.noiKyHopDong)
    await dialog.getByLabel('Hệ số lương').fill(data.heSoLuong)
    await dialog.getByLabel('Bậc lương').click()
    await this.page.getByRole('option', { name: data.bacLuong }).click()

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 5: Đảng/Đoàn === (skip - no required fields)

    await dialog.getByRole('button', { name: 'Tiếp tục' }).click()

    // === Tab 6: Khác === (optional fields)

    // Submit
    await dialog.getByRole('button', { name: 'Tạo nhân viên' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 15000 })

    // Store login credentials
    data.username = data.hoTen // ma_nhan_vien will be auto-generated by backend
    data.password = data.soDienThoai
  }

  async delete(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name })
    await row.getByRole('button').first().hover()
    await row.getByRole('button', { name: /delete|xóa|trash/i }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Xác nhận xóa' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async openDetail(name: string) {
    await this.page.getByRole('row').filter({ hasText: name }).click()
    await expect(this.page.getByText('Chi tiết nhân viên')).toBeVisible()
  }

  async clickEdit() {
    await this.page.getByRole('button', { name: 'Sửa thông tin' }).click()
    await expect(this.page.getByRole('dialog').getByRole('heading', { name: 'Chỉnh sửa nhân viên' })).toBeVisible()
  }
}
```

- [ ] **Step 2: Create `nhan-vien-detail.page.ts`** — handles sub-module CRUD in tabs

```typescript
import { Page, expect } from '@playwright/test'
import { testData } from '../../data/test-data'

export class NhanVienDetailPage {
  constructor(private page: Page) {}

  // ======= NGƯỜI THÂN =======
  async addNguoiThan(data: ReturnType<typeof testData.nguoiThan>) {
    await this.page.getByRole('tab', { name: 'Gia đình' }).click()
    await this.page.getByRole('button', { name: 'Thêm người thân' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm người thân' })).toBeVisible()

    await dialog.getByLabel('Họ tên').fill(data.hoTen)
    await dialog.getByLabel('Quan hệ').click()
    await this.page.getByRole('option', { name: data.quanHe }).click()
    await dialog.getByLabel('Năm sinh').fill(data.namSinh)
    await dialog.getByLabel('Nghề nghiệp').fill(data.ngheNghiep)
    await dialog.getByLabel('Số điện thoại').fill(data.soDienThoai)

    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async deleteNguoiThan(name: string) {
    const card = this.page.getByText(name).first()
    await card.hover()
    await this.page.getByRole('button', { name: /delete|xóa|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Xóa' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= BẰNG CẤP =======
  async addBangCap(data: ReturnType<typeof testData.bangCap>) {
    await this.page.getByRole('tab', { name: 'Đào tạo' }).click()
    await this.page.getByRole('button', { name: 'Thêm bằng cấp' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm bằng cấp' })).toBeVisible()

    await dialog.getByLabel('Loại bằng').click()
    await this.page.getByRole('option', { name: data.loaiBang }).click()
    await dialog.getByLabel('Tên bằng').fill(data.tenBang)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  async deleteBangCap(name: string) {
    await this.page.getByRole('tab', { name: 'Đào tạo' }).click()
    const item = this.page.getByText(name).first()
    await item.hover()
    await this.page.getByRole('button', { name: /delete|xóa|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Xóa' }).click()
  }

  // ======= KHEN THƯỞNG =======
  async addKhenThuong(data: ReturnType<typeof testData.khenThuong>) {
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).click()
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).first().click()
    await this.page.getByRole('button', { name: 'Thêm khen thưởng' }).click()

    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Hình thức').click()
    await this.page.getByRole('option', { name: data.hinhThuc }).click()
    await dialog.getByLabel('Lý do').fill(data.lyDo)
    await dialog.getByLabel('Ngày quyết định').fill(data.ngayQuyetDinh)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= KỶ LUẬT =======
  async addKyLuat(data: ReturnType<typeof testData.kyLuat>) {
    await this.page.getByRole('tab', { name: 'Khen thưởng' }).click()
    await this.page.getByRole('tab', { name: 'Kỷ luật' }).click()
    await this.page.getByRole('button', { name: 'Thêm kỷ luật' }).click()

    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Hình thức').click()
    await this.page.getByRole('option', { name: data.hinhThuc }).click()
    await dialog.getByLabel('Lý do').fill(data.lyDo)
    await dialog.getByLabel('Ngày quyết định').fill(data.ngayQuyetDinh)
    await dialog.getByRole('button', { name: 'Thêm' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // ======= HỢP ĐỒNG =======
  async addHopDong(data: ReturnType<typeof testData.hopDong>) {
    await this.page.getByRole('tab', { name: 'Hợp đồng' }).click()
    await this.page.getByRole('button', { name: 'Ký hợp đồng mới' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Thêm hợp đồng mới' })).toBeVisible()

    await dialog.getByLabel('Số hợp đồng').fill(data.soHopDong)
    await dialog.getByLabel('Loại hợp đồng').click()
    await this.page.getByRole('option', { name: data.loaiHopDong }).click()
    await dialog.getByLabel('Ngày bắt đầu').fill(data.ngayBatDau)
    await dialog.getByLabel('Ngày kết thúc').fill(data.ngayKetThuc)
    await dialog.getByLabel('Lương cơ bản').fill(data.luongCoBan)
    await dialog.getByLabel('Hình thức tuyển dụng').click()
    await this.page.getByRole('option', { name: data.hinhThucTuyenDung }).click()

    await dialog.getByRole('button', { name: 'Thêm mới' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async deleteHopDong(soHopDong: string) {
    await this.page.getByRole('tab', { name: 'Hợp đồng' }).click()
    // In the contract card, find the delete/cancel button
    const contractSection = this.page.getByText(soHopDong).first()
    await contractSection.hover()
    await this.page.getByRole('button', { name: /delete|cancel|hủy|trash/i }).first().click()
    await this.page.getByRole('button', { name: 'Hủy hợp đồng' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }

  // Edit employee name
  async editEmployeeName(newName: string) {
    await this.page.getByRole('button', { name: 'Sửa thông tin' }).click()
    const dialog = this.page.getByRole('dialog')
    await dialog.getByLabel('Họ và tên').clear()
    await dialog.getByLabel('Họ và tên').fill(newName)
    await dialog.getByRole('button', { name: 'Cập nhật' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/admin/nhan-vien-list.page.ts frontend/e2e/pages/admin/nhan-vien-detail.page.ts
git commit -m "test(e2e): add nhân viên page objects (list + detail tabs)"
```

---

### Task 7: Create Employee Spec (Full CRUD + Sub-modules)

**Files:**
- Create: `frontend/e2e/specs/03-nhan-vien.spec.ts`
- Modify: `frontend/e2e/playwright.config.ts`

- [ ] **Step 1: Create `03-nhan-vien.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'
import { NhanVienListPage } from '../pages/admin/nhan-vien-list.page'
import { NhanVienDetailPage } from '../pages/admin/nhan-vien-detail.page'
import { PhongBanPage } from '../pages/admin/phong-ban.page'
import { ChucVuPage } from '../pages/admin/chuc-vu.page'
import { testData } from '../data/test-data'

test.describe('Nhân viên', () => {
  const phongBanData = testData.phongBan
  const chucVuData = testData.chucVu
  const nhanVienData = testData.nhanVien
  const nguoiThanData = testData.nguoiThan
  const bangCapData = testData.bangCap
  const khenThuongData = testData.khenThuong
  const kyLuatData = testData.kyLuat
  const hopDongData = testData.hopDong

  test('CRUD nhân viên + sub-modules - create, tabs, edit, delete', async ({ page }) => {
    // Setup: create department and position first
    const phongBanPage = new PhongBanPage(page)
    await phongBanPage.goto()
    await phongBanPage.create(phongBanData)

    const chucVuPage = new ChucVuPage(page)
    await chucVuPage.goto()
    await chucVuPage.create(chucVuData)

    // CREATE employee
    const listPage = new NhanVienListPage(page)
    await listPage.goto()
    await listPage.create(nhanVienData, phongBanData.ten, chucVuData.ten)

    // VERIFY in list
    await expect(page.getByRole('row').filter({ hasText: nhanVienData.hoTen })).toBeVisible()

    // OPEN detail and test sub-modules
    await listPage.openDetail(nhanVienData.hoTen)
    const detailPage = new NhanVienDetailPage(page)

    // SUB-MODULE: Người thân
    await detailPage.addNguoiThan(nguoiThanData)
    await detailPage.deleteNguoiThan(nguoiThanData.hoTen)

    // SUB-MODULE: Bằng cấp
    await detailPage.addBangCap(bangCapData)
    await detailPage.deleteBangCap(bangCapData.tenBang)

    // SUB-MODULE: Khen thưởng
    await detailPage.addKhenThuong(khenThuongData)

    // SUB-MODULE: Kỷ luật
    await detailPage.addKyLuat(kyLuatData)

    // SUB-MODULE: Hợp đồng
    await detailPage.addHopDong(hopDongData)
    await detailPage.deleteHopDong(hopDongData.soHopDong)

    // EDIT employee name
    await detailPage.editEmployeeName(nhanVienData.hoTenSua)

    // DELETE employee
    await listPage.goto()
    await listPage.delete(nhanVienData.hoTenSua)
    await expect(page.getByRole('row').filter({ hasText: nhanVienData.hoTenSua })).toHaveCount(0)

    // Cleanup: delete position and department
    await chucVuPage.goto()
    await chucVuPage.delete(chucVuData.ten)

    await phongBanPage.goto()
    await phongBanPage.delete(phongBanData.ten)
  })
})
```

- [ ] **Step 2: Update Playwright config to use admin auth state**

Edit `frontend/e2e/playwright.config.ts` to add storageState for admin specs:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
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
      use: {
        storageState: '.auth/admin.json',
      },
    },
  ],
})
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/specs/03-nhan-vien.spec.ts frontend/e2e/playwright.config.ts
git commit -m "test(e2e): add nhân viên full CRUD + sub-modules spec"
```

---

### Task 8: Create Lương Page Object & Spec

**Files:**
- Create: `frontend/e2e/pages/admin/luong.page.ts`
- Create: `frontend/e2e/specs/04-luong.spec.ts`

- [ ] **Step 1: Create `luong.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'

export class LuongPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/luong')
    await expect(this.page.getByText('lương').first()).toBeVisible()
  }

  async goToConfigTab() {
    await this.page.getByRole('tab', { name: 'Cấu hình' }).click()
  }

  async addConfig() {
    await this.page.getByRole('button', { name: 'Thêm' }).first().click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Cấu hình hệ thống lương' })).toBeVisible()
    return dialog
  }

  async fillConfig(dialog: ReturnType<Page['getByRole']>) {
    // Luong cơ sở
    await dialog.getByLabel('Lương cơ sở (VND)').fill('2340000')
    // Hệ số đặc thù
    await dialog.getByLabel('Hệ số đặc thù').fill('1.0')
    // Bảo hiểm
    await dialog.getByLabel('BHXH').fill('8')
    await dialog.getByLabel('BHYT').fill('1.5')
    await dialog.getByLabel('BHTN').fill('1')
    // Giảm trừ
    await dialog.getByLabel('Giảm trừ bản thân').fill('11000000')
    await dialog.getByLabel('Người phụ thuộc').fill('4400000')
  }

  async saveConfig(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Lưu cấu hình' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async clickChayLuong() {
    await this.page.getByRole('button', { name: 'Chạy lương' }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chạy lương tháng' })).toBeVisible()
    return dialog
  }

  async fillChayLuong(dialog: ReturnType<Page['getByRole']>) {
    // Default month and year should be current
    await dialog.getByRole('button', { name: 'Chạy lương' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 15000 })
  }

  async goToKyLuongTab() {
    await this.page.getByRole('tab', { name: 'Kỳ lương' }).click()
  }

  async goToPhieuLuongTab() {
    await this.page.getByRole('tab', { name: 'Phiếu lương' }).click()
  }
}
```

- [ ] **Step 2: Create `04-luong.spec.ts`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/admin/luong.page.ts frontend/e2e/specs/04-luong.spec.ts
git commit -m "test(e2e): add lương config + run payroll spec"
```

---

### Task 9: Create Nghỉ Phép Page Object & Spec

**Files:**
- Create: `frontend/e2e/pages/admin/nghi-phep.page.ts`
- Create: `frontend/e2e/specs/05-nghi-phep.spec.ts`

- [ ] **Step 1: Create `nghi-phep.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'

export class NghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/nghi-phep')
    await expect(this.page.getByText('nghỉ phép').first()).toBeVisible()
  }

  async filterByStatus(status: string) {
    await this.page.getByRole('tab', { name: status }).click()
  }

  async openFirstPendingRequest() {
    // Find first pending leave row
    const row = this.page.getByRole('row').filter({ hasText: 'Chờ duyệt' }).first()
    await row.getByRole('button', { name: /detail|chi tiết|eye/i }).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Chi tiết đơn nghỉ phép' })).toBeVisible()
    return dialog
  }

  async approve(dialog: ReturnType<Page['getByRole']>) {
    await dialog.getByRole('button', { name: 'Duyệt' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async reject(dialog: ReturnType<Page['getByRole']>, reason: string) {
    await dialog.getByPlaceholder('Nhap ly do tu choi...').fill(reason)
    await dialog.getByRole('button', { name: 'Từ chối' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
```

- [ ] **Step 2: Create `05-nghi-phep.spec.ts`**

```typescript
import { test } from '@playwright/test'
import { NghiPhepPage } from '../pages/admin/nghi-phep.page'

test.describe('Nghỉ phép', () => {
  let nghiPhepPage: NghiPhepPage

  test.beforeEach(async ({ page }) => {
    nghiPhepPage = new NghiPhepPage(page)
    await nghiPhepPage.goto()
  })

  test('duyệt đơn nghỉ phép', async () => {
    // Filter pending requests
    await nghiPhepPage.filterByStatus('Chờ duyệt')

    // Open first pending request
    const dialog = await nghiPhepPage.openFirstPendingRequest()
    await nghiPhepPage.approve(dialog as any)
  })
})
```

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/pages/admin/nghi-phep.page.ts frontend/e2e/specs/05-nghi-phep.spec.ts
git commit -m "test(e2e): add nghỉ phép approval spec"
```

---

### Task 10: Create Employee Self-Service Pages & Spec

**Files:**
- Create: `frontend/e2e/pages/employee/dashboard.page.ts`
- Create: `frontend/e2e/pages/employee/profile.page.ts`
- Create: `frontend/e2e/pages/employee/cham-cong.page.ts`
- Create: `frontend/e2e/pages/employee/nghi-phep.page.ts`
- Create: `frontend/e2e/specs/06-employee.spec.ts`

- [ ] **Step 1: Create `dashboard.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'

export class EmployeeDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee')
    await expect(this.page.getByText('Xin chào')).toBeVisible()
  }

  async assertBentoCardsVisible() {
    await expect(this.page.getByText('Phép còn lại')).toBeVisible()
    await expect(this.page.getByText('Công tháng này')).toBeVisible()
    await expect(this.page.getByText('Đơn chờ duyệt')).toBeVisible()
  }

  async clickXinNghi() {
    await this.page.getByRole('button', { name: 'Xin nghỉ' }).click()
    await expect(this.page).toHaveURL(/\/employee\/nghi-phep/)
  }

  async clickQR() {
    await this.page.getByRole('button', { name: 'QR của tôi' }).click()
    await expect(this.page).toHaveURL(/\/employee\/my-qr/)
  }

  async clickXemLuong() {
    await this.page.getByRole('button', { name: 'Xem lương' }).click()
    await expect(this.page).toHaveURL(/\/employee\/luong/)
  }

  async logout() {
    await this.page.getByRole('button', { name: /employee/i }).click()
    await this.page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(this.page).toHaveURL('/login')
  }
}
```

- [ ] **Step 2: Create `profile.page.ts`**

```typescript
import { Page, expect } from '@playwright/test'

export class EmployeeProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/profile')
    await expect(this.page.getByText('Thông tin cá nhân')).toBeVisible()
  }

  async editPhone(newPhone: string) {
    await this.page.getByRole('button', { name: 'Sửa' }).click()
    await this.page.getByLabel('Số điện thoại').clear()
    await this.page.getByLabel('Số điện thoại').fill(newPhone)
    await this.page.getByRole('button', { name: 'Lưu' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }
}
```

- [ ] **Step 3: Create `nghi-phep.page.ts`** (employee leave request)

```typescript
import { Page, expect } from '@playwright/test'

export class EmployeeNghiPhepPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/employee/nghi-phep')
    await expect(this.page.getByText('Nghỉ phép')).toBeVisible()
  }

  async createLeaveRequest() {
    await this.page.getByRole('button', { name: 'Xin nghỉ' }).click()

    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Tạo đơn nghỉ phép mới' })).toBeVisible()

    // Select loại nghỉ phép
    await dialog.getByLabel('Loại nghỉ phép').click()
    await this.page.getByRole('option', { name: 'Phép năm' }).click()

    // Pick dates (next Monday and Tuesday)
    await dialog.getByLabel('Từ ngày').click()
    // Navigate to next month if needed
    await this.page.getByRole('gridcell', { name: '15' }).first().click()

    await dialog.getByLabel('Đến ngày').click()
    await this.page.getByRole('gridcell', { name: '16' }).first().click()

    // Submit
    await dialog.getByRole('button', { name: 'Tạo đơn' }).click()
    await expect(this.page.getByText('thành công')).toBeVisible({ timeout: 10000 })
  }

  async assertLeaveInList() {
    await expect(this.page.getByText('Chờ duyệt').first()).toBeVisible()
  }

  async cancelLeave() {
    await this.page.getByRole('button', { name: 'Hủy' }).first().click()
    await expect(this.page.getByText('thành công')).toBeVisible()
  }
}
```

- [ ] **Step 4: Create `06-employee.spec.ts`**

The employee spec logs in as admin first, creates an employee via `NhanVienListPage`, captures the employee code from the list, then logs in as that employee.

```typescript
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

    // Step 2: Create a minimal employee (no phongBan/chucVu dependency for employee spec)
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

    // Extract the employee code (ma_nhan_vien) from the table
    const employeeRow = page.getByRole('row').filter({ hasText: nvData.hoTen })
    // The employee code is likely in the table — we extract it for login
    const rowText = await employeeRow.textContent()
    // ma_nhan_vien is typically like "NV-XXXX" or similar
    const maNhanVien = rowText?.match(/NV-\d+|GV-\d+|NV\w+/)?.[0] || nvData.hoTen

    // Logout admin
    await page.getByRole('button', { name: /admin/i }).click()
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click()
    await expect(page).toHaveURL('/login')

    // Login as employee (username = ma_nhan_vien, password = sdt)
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
```

- [ ] **Step 5: Commit**

```bash
git add frontend/e2e/pages/employee/ frontend/e2e/specs/06-employee.spec.ts
git commit -m "test(e2e): add employee self-service spec"
```

---

### Task 11: Create Cleanup Helper

**Files:**
- Create: `frontend/e2e/helpers/cleanup.ts`

- [ ] **Step 1: Create `cleanup.ts`**

```typescript
import { APIRequestContext } from '@playwright/test'

export class CleanupHelper {
  constructor(private request: APIRequestContext) {}

  async loginAsAdmin() {
    await this.request.post('/api/v1/login', {
      data: { username: 'admin', password: 'Admin123!' },
    })
  }

  async deleteEmployee(name: string) {
    // Search for employee by name, then delete via API
    const searchRes = await this.request.get(`/api/v1/nhan-vien?search=${encodeURIComponent(name)}`)
    if (searchRes.ok()) {
      const body = await searchRes.json()
      const employees = body.data || body
      if (Array.isArray(employees)) {
        for (const emp of employees) {
          if (emp.ho_ten === name || emp.hoTen === name) {
            await this.request.delete(`/api/v1/nhan-vien/${emp.id || emp.ma_nhan_vien}`)
          }
        }
      }
    }
  }

  async deletePhongBan(name: string) {
    const res = await this.request.get(`/api/v1/phong-ban`)
    if (res.ok()) {
      const body = await res.json()
      const items = body.data || body
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.ten_phong_ban === name || item.ten === name) {
            await this.request.delete(`/api/v1/phong-ban/${item.id || item.ma_phong_ban}`)
          }
        }
      }
    }
  }

  async deleteChucVu(name: string) {
    const res = await this.request.get(`/api/v1/chuc-vu`)
    if (res.ok()) {
      const body = await res.json()
      const items = body.data || body
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.ten_chuc_vu === name || item.ten === name) {
            await this.request.delete(`/api/v1/chuc-vu/${item.id || item.ma_chuc_vu}`)
          }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/e2e/helpers/cleanup.ts
git commit -m "test(e2e): add cleanup helper"
```

---

### Task 12: First Run — Verify Tests Execute

- [ ] **Step 1: Run the full test suite**

Run:
```bash
cd /mnt/newhome/code/hr_management/frontend
npx playwright test
```

Expected: All tests pass or at least start executing.

- [ ] **Step 2: View HTML report**

Run:
```bash
npx playwright show-report
```

- [ ] **Step 3: Fix any failures and re-run**

Iteratively fix flaky locators, timeout issues, or missing elements.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "test(e2e): finalize Playwright E2E test suite"
```
