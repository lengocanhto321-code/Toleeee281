# HR Management System - Implementation Status

> Document này tổng hợp toàn bộ chức năng đã triển khai và cần triển khai, tổ chức theo **Actor (Tác nhân)** và **Module nghiệp vụ**.

---

## Tài liệu nghiệp vụ

| Document | Mô tả |
|----------|--------|
| [BUSINESS_LOGIC.md](./docs/BUSINESS_LOGIC.md) | Tổng hợp toàn bộ nghiệp vụ, schema, relationships của hệ thống |
| [BUSINESS_LOGIC_NHAN_VIEN.md](./docs/BUSINESS_LOGIC_NHAN_VIEN.md) | Logic nghiệp vụ chi tiết về mối quan hệ Nhân viên - Phòng ban - Chức vụ |
| [BUSINESS_LOGIC_NGHI_PHEP.md](./docs/BUSINESS_LOGIC_NGHI_PHEP.md) | Logic nghiệp vụ chi tiết về Nghỉ phép, Chấm công, Lương |

---

## 1. Actors & Roles

| Role | Code | Mô tả |
|------|------|--------|
| Quản trị viên | `ADMIN` | Toàn quyền hệ thống |
| Hiệu trưởng | `HIEU_TRUONG` | Quản lý cấp cao |
| Phó hiệu trưởng | `HIEU_PHO` | Phó hiệu trưởng |
| Trưởng phòng | `TO_TRUONG` | Trưởng phòng ban |
| Giáo viên | `GIAO_VIEN` | Giáo viên |
| Nhân viên | `NHAN_VIEN` | Nhân viên (bảo vệ, vệ sinh...) |

---

## 2. Employee Self-Service (Nhân viên/Giáo viên)

### 2.1. Trang Dashboard cá nhân

**Route:** `/employee`

**Mô tả:** Trang tổng quan cho nhân viên

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/employee/dashboard` | GET | ✅ Implemented | Lấy dashboard |

**Frontend:**
| Component | Status |
|-----------|--------|
| `employee/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Hiển thị thông tin tổng quan
- [ ] Thống kê ngày nghỉ phép
- [ ] Lịch sử lương gần đây
- [ ] Thông báo

---

### 2.2. Xem/Sửa Hồ sơ cá nhân

**Route:** `/employee/profile`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/employee/profile` | GET | ✅ Implemented | Lấy hồ sơ |
| `/api/v1/employee/profile` | PUT | ✅ Implemented | Cập nhật hồ sơ |

**Frontend:**
| Component | Status |
|-----------|--------|
| `employee/profile/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Xem thông tin cá nhân (read-only fields)
- [ ] Chỉnh sửa một số trường cho phép
- [ ] Upload ảnh đại diện
- [ ] Xem lịch sử công tác

**Fields được phép sửa:**
- [ ] Thông tin liên lạc (SĐT, email)
- [ ] Địa chỉ
- [ ] Thông tin CCCD (không được sửa số CCCD)

---

### 2.3. Xem Lương

**Route:** `/employee/luong`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/employee/luong/me` | GET | ✅ Implemented | Lấy lương cá nhân |

**Frontend:**
| Component | Status |
|-----------|--------|
| `employee/luong/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Xem lịch sử lương theo tháng
- [ ] Xem chi tiết lương 1 tháng
- [ ] Export phiếu lương (PDF)
- [ ] So sánh lương các tháng

**Chi tiết lương hiển thị:**
- [ ] Lương cơ bản
- [ ] Các khoản phụ cấp
- [ ] Các khoản khấu trừ
- [ ] Lương thực nhận

---

### 2.4. Xem Chấm công

**Route:** `/employee/cham-cong`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/employee/cham-cong/me` | GET | ✅ Implemented | Lấy chấm công cá nhân |

**Frontend:**
| Component | Status |
|-----------|--------|
| `employee/cham-cong/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Xem bảng chấm công theo tháng
- [ ] Lịch/tháng view
- [ ] Danh sách ngày công
- [ ] Số ngày làm việc / ngày nghỉ

---

### 2.5. Nghỉ phép

**Route:** `/employee/nghi-phep`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/nghi-phep/don` | POST | ✅ Implemented | Tạo đơn xin nghỉ |
| `/api/v1/nghi-phep/don` | GET | ✅ Implemented | Danh sách đơn |
| `/api/v1/nghi-phep/don/{id}` | GET | ✅ Implemented | Chi tiết đơn |
| `/api/v1/nghi-phep/me` | GET | ✅ Implemented | Đơn của tôi |
| `/api/v1/nghi-phep/so-ngay-phep/{nhan_vien_id}` | GET | ✅ Implemented | Số ngày phép còn lại |

**Frontend:**
| Component | Status |
|-----------|--------|
| `employee/nghi-phep/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Xem số ngày phép còn lại
- [ ] Tạo đơn xin nghỉ phép
  - [ ] Chọn loại nghỉ phép
  - [ ] Chọn ngày bắt đầu/kết thúc
  - [ ] Nhập lý do
  - [ ] Đính kèm file (nếu cần)
- [ ] Xem danh sách đơn đã gửi
- [ ] Xem trạng thái đơn (đang chờ, đã duyệt, từ chối)
- [ ] Hủy đơn (nếu chưa được duyệt)

**Loại nghỉ phép:**
- [ ] Nghỉ phép năm
- [ ] Nghỉ không lương
- [ ] Nghỉ ốm
- [ ] Nghỉ thai sản
- [ ] Nghỉ họp phụ huynh
- [ ] Nghỉ khác

---

## 3. Admin Management (Quản lý)

### 3.1. Dashboard

**Route:** `/dashboard`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/thong-ke/dashboard` | GET | ✅ Implemented | Admin dashboard stats (11 counters + department summary + recent activities) |

**Frontend:**
| Component | Status |
|-----------|--------|
| `dashboard/page.tsx` | ✅ Implemented (all real data) |

**Chức năng:**
- [x] Thống kê tổng quan (tổng NV, phòng ban, chức vụ, đơn nghỉ chờ duyệt)
- [x] Phân loại nhân viên (giáo viên / cán bộ / nhân viên) - real data with percentage bars
- [x] Phòng ban summary (top 5 departments with employee counts) - real data
- [x] Hoạt động gần đây (5 recent audit logs) - real data from audit_log table
- [x] Thao tác nhanh + liên kết nhanh
- [x] Nhân viên mới trong tháng

**Backend Implementation:**
| Component | File | Purpose |
|-----------|------|---------|
| `GetAdminDashboardUseCase` | `dashboard/admin_dashboard_uc.py` | 11 stat queries + department summary + recent audit logs |
| `AuditLogRepository.get_recent` | `audit_log_repository.py` | Query last N audit logs with JOIN on TaiKhoan |
| Route | `thong_ke.py` | `GET /thong-ke/dashboard` with `dashboard:view_admin` permission |

**Frontend Implementation:**
| Component | File | Purpose |
|-----------|------|---------|
| `useAdminDashboard` hook | `use-admin-dashboard.ts` | TanStack Query hook with full types |
| Dashboard page | `dashboard/page.tsx` | All sections use real API data |
| Time formatting | `timeAgo()` helper | Relative time display for activities |

---

### 3.2. Quản lý Nhân viên

**Route:** `/nhan-vien`

#### 3.2.1. Backend Implementation

**API Endpoints:**
| Endpoint | Method | Status | Permission | Description |
|----------|--------|--------|------------|-------------|
| `/api/v1/nhan-vien` | POST | ✅ | `nhan_vien:create` | Tạo nhân viên |
| `/api/v1/nhan-vien` | GET | ✅ | `nhan_vien:read` | Danh sách (phân trang) |
| `/api/v1/nhan-vien/{id}` | GET | ✅ | `nhan_vien:read` | Chi tiết |
| `/api/v1/nhan-vien/{id}` | PUT | ✅ | `nhan_vien:update` | Cập nhật |
| `/api/v1/nhan-vien/{id}` | DELETE | ✅ | `nhan_vien:delete` | Xóa mềm |
| `/api/v1/nhan-vien/{id}/restore` | POST | ✅ | `nhan_vien:update` | Restore deleted employee |
| `/api/v1/nhan-vien/{id}/nguoi-than` | GET/POST/PUT/DELETE | ✅ | `nhan_vien:read/update` | Family members CRUD |
| `/api/v1/nhan-vien/{id}/bang-cap` | GET/POST/PUT/DELETE | ✅ | `nhan_vien:read/update` | Degrees CRUD |
| `/api/v1/nhan-vien/{id}/khen-thuong-ky-luat` | GET/POST/PUT/DELETE | ✅ | `nhan_vien:read/update` | Rewards/Disciplines CRUD |

**Use Cases:**
| Use Case | File | Features |
|----------|------|----------|
| `CreateNhanVienUseCase` | `create_nhan_vien_uc.py` | Validate email/CCCD uniqueness, auto-generate ma_nhan_vien, audit log |
| `GetNhanVienUseCase` | `get_nhan_vien_uc.py` | get_list (paginated, searchable), get_detail |
| `UpdateNhanVienUseCase` | `update_nhan_vien_uc.py` | Validate email/CCCD uniqueness on update, audit log |
| `DeleteNhanVienUseCase` | `delete_nhan_vien_uc.py` | Soft delete, prevent deletion of active employees |
| `RestoreNhanVienUseCase` | `restore_nhan_vien_uc.py` | Restore soft-deleted employee, validate not already active, audit log |
| `NguoiThanUseCase` | `sub_module/nguoi_than_uc.py` | CRUD family members, ownership validation, audit log |
| `BangCapUseCase` | `sub_module/bang_cap_uc.py` | CRUD degrees/certificates, ownership validation, audit log |
| `KhenThuongKyLuatUseCase` | `sub_module/khen_thuong_ky_luat_uc.py` | CRUD rewards/disciplines, date parsing, ownership validation, audit log |
| `ImportNhanVienUseCase` | `import_nhan_vien_uc.py` | Bulk import from Excel rows, per-row validation (email/CCCD uniqueness), auto-generate ma_nhan_vien, audit log per row, row-level error collection |

**Repository Methods:**
| Method | Purpose |
|--------|---------|
| `generate_ma_nhan_vien()` | Auto-generates: GV/CB/NV + 3-digit number |
| `create()` | Create new employee |
| `find_by_id()` | Find by ID (with soft-delete support) |
| `find_by_ma()` | Find by employee code |
| `find_by_email()` | Find by email |
| `find_by_cccd()` | Find by CCCD number |
| `get_paginated()` | Paginated list with filters |
| `update()` | Update employee |
| `delete()` | Soft delete (sets deleted_at) |

**Database Model Fields (NhanVien):**

| Category | Fields |
|----------|--------|
| **Basic Info** | `id`, `ma_nhan_vien`, `ho_ten`, `gioi_tinh`, `ngay_sinh` |
| **Address** | `que_quan`, `noi_sinh`, `dia_chi_thuong_tru`, `dia_chi_tam_tru` |
| **Contact** | `so_dien_thoai`, `email`, `email_ca_nhan` |
| **Identity** | `so_cccd`, `ngay_cap_cccd`, `noi_cap_cccd`, `cccd_front`, `cccd_back` |
| **Photo** | `anh_dai_dien` |
| **Demographics** | `dan_toc`, `ton_giao` |
| **Classification** | `loai_nhan_vien`, `cap_hoc`, `mon_day` |
| **Salary Info** | `hang_chuc_danh`, `ngach_luong`, `bac_luong`, `he_so_luong`, `so_nam_tham_nien` |
| **Department** | `phong_ban_id`, `chuc_vu_id` |
| **Contract** | `loai_hop_dong`, `so_hop_dong`, `ngay_vao_lam`, `ngay_het_hop_dong`, `hinh_thuc_tuyen_dung`, `noi_ky_hop_dong` |
| **Allowance** | `phu_cap_chuc_vu`, `ngay_bo_nhiem_chuc_vu` |
| **Party** | `la_dang_vien`, `la_doan_vien`, `ngay_vao_dang`, `ngay_vao_doan` |
| **Other** | `tinh_trang_hon_nhan`, `trang_thai`, `ghi_chu` |
| **Timestamps** | `created_at`, `updated_at`, `deleted_at` |

**Database Relationships:**
| Relationship | Type | Model |
|-------------|------|-------|
| `phong_ban_rel` | FK 1:1 | `PhongBan` |
| `chuc_vu` | FK 1:1 | `ChucVu` |
| `cong_tac` | 1:N | `CongTac` (work history) |
| `bang_caps` | 1:N | `BangCapChungChi` |
| `tai_lieus` | 1:N | `TaiLieuNhanVien` |

**Validation Rules:**
- `ho_ten`: min 2, max 100 chars
- `gioi_tinh`: Nam/Nữ/Khác
- `ngay_sinh`: Required date
- `email/email_ca_nhan`: Valid EmailStr
- `so_cccd`: max 12 chars
- `bac_luong`: 1-10
- `ngay_het_hop_dong`: Must be after ngay_vao_lam
- `loai_nhan_vien`: giao_vien|nhan_vien|can_bo
- `trang_thai`: dang_lam|nghi_viec|nghi_huu|da_xoa

#### 3.2.2. Frontend Implementation

**Pages:**
| Route | Component | Status |
|-------|-----------|--------|
| `/nhan-vien` | `nhan-vien/page.tsx` | ✅ Employee list with stats, filters, search |
| `/nhan-vien/[id]` | `nhan-vien/[id]/page.tsx` | ✅ Employee detail view |

**Components:**
| Component | Purpose |
|-----------|---------|
| `nhan-vien-form-dialog.tsx` | Create/Edit form with 6 tabs |
| `nhan-vien-columns.tsx` | DataTable columns |
| `nhan-vien-toolbar.tsx` | Search, filters, export buttons |
| `nhan-vien-detail-info.tsx` | Detail view with tabs |
| `nhan-vien-delete-dialog.tsx` | Delete confirmation |
| `nhan-vien-quick-actions.tsx` | Quick action buttons |
| `nhan-vien-sidebar-panel.tsx` | Side panel |
| `nhan-vien-grid-view.tsx` | Grid view alternative |
| `nhan-vien-family-tab.tsx` | Family info tab |
| `nhan-vien-training-tab.tsx` | Training/certificates tab |
| `nhan-vien-contract-tab.tsx` | Contract tab |
| `nhan-vien-salary-tab.tsx` | Salary tab |
| `nhan-vien-reward-tab.tsx` | Rewards/discipline tab |
| `nhan-vien-tai-lieu-tab.tsx` | Documents tab |

**Hooks:**
| Hook | Purpose |
|------|---------|
| `useNhanVienList` | Fetch paginated list |
| `useNhanVienDetail` | Fetch single employee |
| `useCreateNhanVien` | Create mutation |
| `useUpdateNhanVien` | Update mutation |
| `useDeleteNhanVien` | Delete mutation |
| `useRestoreNhanVien` | Restore deleted employee |
| `useNguoiThanList/Create/Update/Delete` | Family members CRUD |
| `useBangCapList/Create/Update/Delete` | Degrees/Certificates CRUD |
| `useKhenThuongKyLuatList/Create/Update/Delete` | Rewards/Disciplines CRUD |

**Zod Schemas:**
| Schema | Fields |
|--------|--------|
| `nhanVienPersonalSchema` | ho_ten, gioi_tinh, ngay_sinh, que_quan, dia_chi, SĐT, email |
| `nhanVienIdentitySchema` | so_cccd, ngay_cap_cccd, noi_cap_cccd |
| `nhanVienWorkSchema` | loai_nhan_vien, trang_thai, mon_day, cap_hoc, phong_ban_id, chuc_vu_id |
| `nhanVienContractSchema` | loai_hop_dong, so_hop_dong, ngay_vao_lam, ngay_het_hop_dong, hinh_thuc_tuyen_dung, hang_chuc_danh, ngach_luong, bac_luong, he_so_luong, so_nam_tham_nien |
| `nhanVienPartySchema` | la_dang_vien, ngay_vao_dang, la_doan_vien, ngay_vao_doan |
| `nhanVienOtherSchema` | ghi_chu |

#### 3.2.3. Employee Types (Loại nhân viên)

| Type | Code | Required Fields | Description |
|------|------|----------------|-------------|
| **Giáo viên** | `giao_vien` | `mon_day`, `cap_hoc` | Giáo viên bộ môn |
| **Cán bộ** | `can_bo` | `cap_hoc`, `chuc_vu_id`, `phong_ban_id` | Cán bộ quản lý |
| **Nhân viên** | `nhan_vien` | `chuc_vu_id`, `phong_ban_id` | Bảo vệ, vệ sinh |

#### 3.2.4. Current Features Status

**List Page (`/nhan-vien`):**
- [x] Danh sách nhân viên (table view)
- [x] Tìm kiếm theo mã, tên, email, SĐT
- [x] Filter theo trạng thái, loại nhân viên, phòng ban
- [x] Sort theo các cột
- [x] Phân trang
- [x] Export danh sách ra Excel ✅ Implemented (xlsx + file-saver)
- [x] Import nhân viên từ Excel ✅ Implemented (frontend parse + backend bulk create)

**Form Tạo/Sửa Nhân viên - 6 Tabs:**
- [x] Tab 1: Cá nhân (họ tên, giới tính, ngày sinh, quê quán, địa chỉ, SĐT, email)
- [x] Tab 2: CCCD (số CCCD, ngày cấp, nơi cấp)
- [x] Tab 3: Công tác (loại NV, phòng ban, chức vụ, trạng thái)
- [x] Tab 4: Hợp đồng (loại HĐ, số HĐ, ngày vào làm, ngày hết HĐ, hình thức tuyển dụng)
- [x] Tab 5: Đảng/Đoàn (đảng viên, đoàn viên, ngày vào)
- [x] Tab 6: Khác (BHXH, ngân hàng, ghi chú) ✅ BHXH & Bank Added

**Missing Form Fields:**
- [x] Các trường BHXH (số BHXH, ngày tham gia) ✅ Added
- [x] Thông tin ngân hàng (số TK, tên ngân hàng) ✅ Added
- [x] Nơi sinh ✅ Added (was already in form)
- [x] Dân tộc ✅ Added (was already in form)
- [x] Tôn giáo ✅ Added (was already in form)
- [x] Tình trạng hôn nhân ✅ Added (was already in form)
- [x] Upload ảnh CCCD front/back ✅ Added (upload in form tab 2)
- [ ] Cân nặng, chiều cao
- [ ] Tình trạng sức khỏe

#### 3.2.5. Missing Features

**Sub-module API Endpoints:**
| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `GET /nhan-vien/{id}/nguoi-than` | GET | ✅ | Get family members |
| `POST /nhan-vien/{id}/nguoi-than` | POST | ✅ | Add family member |
| `PUT /nhan-vien/{id}/nguoi-than/{item_id}` | PUT | ✅ | Update family member |
| `DELETE /nhan-vien/{id}/nguoi-than/{item_id}` | DELETE | ✅ | Delete family member |
| `GET /nhan-vien/{id}/bang-cap` | GET | ✅ | Get degrees |
| `POST /nhan-vien/{id}/bang-cap` | POST | ✅ | Add degree |
| `PUT /nhan-vien/{id}/bang-cap/{item_id}` | PUT | ✅ | Update degree |
| `DELETE /nhan-vien/{id}/bang-cap/{item_id}` | DELETE | ✅ | Delete degree |
| `GET /nhan-vien/{id}/khen-thuong-ky-luat` | GET | ✅ | Get rewards/disciplines |
| `POST /nhan-vien/{id}/khen-thuong-ky-luat` | POST | ✅ | Add reward/discipline |
| `PUT /nhan-vien/{id}/khen-thuong-ky-luat/{item_id}` | PUT | ✅ | Update |
| `DELETE /nhan-vien/{id}/khen-thuong-ky-luat/{item_id}` | DELETE | ✅ | Delete |

**Still Missing API Endpoints:**
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `GET /nhan-vien/{id}/contracts` | Get contract history | High |
| `POST /nhan-vien/{id}/contracts` | Add new contract | High |
| `PUT /nhan-vien/{id}/contracts/{id}` | Renew contract | High |
| `POST /nhan-vien/{id}/transfer` | Transfer department | Low |
| `GET /nhan-vien/statistics` | Employee statistics | Medium |

**HopDong API Endpoints (NEW):**
| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/nhan-vien/{id}/hop-dong` | GET | ✅ | Get contract history |
| `/nhan-vien/{id}/hop-dong/{hd_id}` | GET | ✅ | Get contract detail |
| `/nhan-vien/{id}/hop-dong` | POST | ✅ | Create contract |
| `/nhan-vien/{id}/hop-dong/{hd_id}` | PUT | ✅ | Update contract |
| `/nhan-vien/{id}/hop-dong/{hd_id}` | DELETE | ✅ | Delete contract |

**New API Endpoints Added:**
| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `POST /nhan-vien/{id}/restore` | POST | ✅ | Restore deleted employee |
| `POST /nhan-vien/import` | POST | ✅ | Import employees from Excel (JSON rows) |

**Missing Database Fields:**
| Field | Type | Purpose | Priority | Status |
|-------|------|---------|----------|--------|
| `ma_so_thue` | String | Tax ID | Medium | ❌ Pending |
| `hinh_anh_3x4` | String | 3x4 photo URL | Medium | ❌ Pending |
| `chieu_cao` | Integer | Height (cm) | Low | ❌ Pending |
| `can_nang` | Integer | Weight (kg) | Low | ❌ Pending |
| `tinh_trang_suc_khoe` | String | Health status | Medium | ❌ Pending |
| `nguoi_than_id` | FK | Primary emergency contact | High | ❌ Pending |

**Completed Frontend Features:**
- [x] Employee form với BHXH fields (so_bao_hiem, ngay_tham_gia_bhxh)
- [x] Employee form với Bank fields (ten_ngan_hang, so_tai_khoan_ngan_hang)
- [x] Form đã có: nơi sinh, dân tộc, tôn giáo, tình trạng hôn nhân
- [x] Export danh sách ra Excel (xlsx + file-saver)
- [x] Sub-module API hooks (NguoiThan, BangCap, KhenThuongKyLuat CRUD)
- [x] Detail page fetches sub-module data từ API
- [x] CRUD UI dialogs cho sub-modules (NguoiThan, BangCap, KhenThuongKyLuat) ✅ Add/Edit/Delete buttons in tabs

**Missing Frontend Features:**
- [x] Import nhân viên từ Excel ✅ Implemented (NhanVienImportDialog with file upload + preview + template download)
- [x] Upload ảnh đại diện (avatar) ✅ Implemented (click avatar to upload, saves to anh_dai_dien field)
- [x] Upload ảnh CCCD front/back ✅ Implemented (upload in form tab 2)
- [ ] Contract history management (lịch sử hợp đồng)
- [x] Restore deleted employee ✅ Implemented (useRestoreNhanVien hook)
- [ ] Bulk operations (multi-select delete/export)
- [ ] Employee card/ID generation
- [x] In phiếu thông tin nhân viên ✅ Implemented (window.print())

**Missing Validations:**
| Validation | Current | Needed | Priority |
|------------|---------|--------|----------|
| Age validation (18-65) | ❌ | ✅ | Medium |
| Phone format (+84) | Basic regex | Enhanced | Medium |
| CCCD checksum | ❌ | ✅ | Low |
| Required fields per type | ❌ | ✅ | High |
| Contract date logic | Partial | Full | Medium |

---

### 3.2.6. Employee Management Summary

#### Đã hoàn thành ✅
- CRUD cơ bản (Create, Read, Update, Soft Delete)
- Phân trang, tìm kiếm, lọc
- Form tạo/sửa với 6 tabs (đầy đủ fields: BHXH, ngân hàng, dân tộc, tôn giáo, hôn nhân)
- Upload ảnh CCCD front/back trong form
- Chi tiết nhân viên với UI tabs + sub-module data từ API
- Edit dialog từ detail page
- Restore nhân viên đã xóa (backend + frontend)
- Print button (window.print())
- Validation cơ bản (email, CCCD, required fields)
- Auto-generate mã nhân viên
- Audit log
- Export Excel (frontend xlsx + file-saver)
- Import Excel từ file .xlsx (frontend SheetJS parse + backend bulk create với validation)
- Sub-module CRUD API: NguoiThan, BangCap, KhenThuongKyLuat (12 endpoints)
- Sub-module CRUD UI dialogs (NguoiThan, BangCap, KhenThuongKyLuat) với Add/Edit/Delete
- Frontend hooks cho sub-module CRUD
- Backend model NguoiThan + relationship
- Detail page: Đảng đoàn, CCCD images, BHXH, bank info sections

#### Cần hoàn thiện 🔄
1. **Form Fields**
    - [x] Thông tin BHXH, ngân hàng ✅ Done
    - [x] Nơi sinh, dân tộc, tôn giáo, tình trạng hôn nhân ✅ Done
    - [x] Upload ảnh CCCD front/back ✅ Done
    - [x] Upload ảnh đại diện (avatar) ✅ Done

  2. **Sub-modules (cần CRUD riêng)**
    - [x] Gia đình (người thân) ✅ API CRUD + Frontend hooks
    - [x] Bằng cấp/Chứng chỉ ✅ API CRUD + Frontend hooks
    - [x] Khen thưởng/Kỷ luật ✅ API CRUD + Frontend hooks
    - [ ] Lịch sử hợp đồng (cần DB table mới)

  3. **Import/Export**
     - [x] Export Excel ✅ Done (xlsx + file-saver)
     - [x] Import từ Excel ✅ Done (SheetJS parse + backend ImportNhanVienUseCase)

  4. **UI/UX**
    - [ ] Xem lịch sử thay đổi (audit)
    - [x] In phiếu nhân viên ✅ Done (window.print())
    - [x] Restore nhân viên đã xóa ✅ Done (useRestoreNhanVien)

#### Thứ tự ưu tiên triển khai
1. **P0 - Critical**: Fix form, thêm fields còn thiếu
2. **P1 - High**: Upload ảnh, CRUD gia đình
3. **P2 - Medium**: CRUD bằng cấp, khen thưởng, export
4. **P3 - Low**: Import Excel, restore, in phiếu

---

### 3.3. Chi tiết Nhân viên

**Route:** `/nhan-vien/[id]`

**Chức năng đã có:**
- [x] Header: Avatar, mã NV, họ tên, chức vụ, phòng ban
- [x] Tabs thông tin (UI structure)

**Tab Cá nhân:**
- [x] Hồ sơ cá nhân đầy đủ ✅
- [x] Ảnh đại diện ✅ (click avatar to upload)
- [x] Thông tin CCCD (front/back) ✅ Hiển thị ảnh CCCD
- [x] Thông tin đảng đoàn ✅
- [x] Nơi sinh, dân tộc, tôn giáo ✅
- [x] Tình trạng hôn nhân ✅
- [x] In phiếu nhân viên ✅ (print button)

**Tab Công tác:**
- [x] Thông tin phòng ban, chức vụ hiện tại
- [x] Thông tin BHXH (số BHXH, ngày tham gia) ✅
- [x] Thông tin ngân hàng (số TK, tên ngân hàng) ✅
- [x] Edit dialog (mở form chỉnh sửa từ detail page) ✅
- [x] Restore button (cho nhân viên đã xóa) ✅
- [x] Lịch sử phòng ban (qua bảng cong_tac) ✅
- [x] Lịch sử chức vụ ✅ (LichSuChucVu tab)
- [x] Phân công giảng dạy (giáo viên) ✅
- [x] Môn dạy, cấp học ✅

**Tab Hợp đồng:**
- [x] Thông tin hợp đồng hiện tại
- [x] Lịch sử hợp đồng (HopDong table + API + UI) ✅
- [ ] Upload hợp đồng scan

**Tab Lương:**
- [x] Lương hiện tại (từ bảng luong) ✅
- [x] Lịch sử lương ✅
- [ ] Các khoản phụ cấp chi tiết

**Tab Đào tạo:**
- [x] Bằng cấp (từ bang_cap_chung_chi) ✅ API CRUD + UI dialog
- [x] Chứng chỉ ✅
- [ ] Khóa học đã tham gia

**Tab Khen thưởng:**
- [x] Khen thưởng (từ khen_thuong_ky_luat) ✅ API CRUD + UI dialog
- [x] Kỷ luật ✅ + UI dialog

**Tab Gia đình:**
- [x] Thông tin vợ/chồng ✅ API CRUD + UI dialog
- [x] Thông tin con cái ✅
- [x] Người liên hệ khẩn cấp ✅

**Tab Tài liệu:**
- [x] Danh sách tài liệu (từ tai_lieu_nhan_vien)
- [ ] Upload tài liệu mới
- [x] Xem/tải tài liệu ✅

---

### 3.4. Quản lý Phòng ban

> 📋 Xem chi tiết: [BUSINESS_LOGIC_NHAN_VIEN.md](./docs/BUSINESS_LOGIC_NHAN_VIEN.md)

**Route:** `/phong-ban`

#### 3.4.1. Backend Implementation

**Database Model Fields (PhongBan):**

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String(32) | PK | UUID |
| `ma_phong_ban` | String(20) | UNIQUE, NOT NULL | Department code |
| `ten_phong_ban` | String(100) | NOT NULL | Name |
| `loai` | String(20) | NOT NULL, default="chuyen_mon" | Type: "chuyen_mon" / "hanh_chinh" / "khac" |
| `mo_ta` | Text | NULLABLE | Description |
| `truong_phong` | String(100) | NULLABLE | Department head name |
| `so_dien_thoai` | String(15) | NULLABLE | Phone |
| `email` | String(100) | NULLABLE | Email |
| `trang_thai` | Boolean | NOT NULL, default=True | Active status |
| `cha_id` | String(32) | FK -> phong_ban.id | Parent department (hierarchy) |
| `deleted_at` | DateTime | NULLABLE | Soft delete |
| `created_at` | DateTime | NOT NULL | Creation time |
| `updated_at` | DateTime | NOT NULL | Update time |

**Relationships:**
- Self-referential parent-child (`cha` / `children`)
- One-to-Many with `CongTac` (work assignments)
- One-to-Many with `NhanVien` (direct FK)

**API Endpoints:**
| Endpoint | Method | Status | Permission | Description |
|----------|--------|--------|------------|-------------|
| `/api/v1/phong-ban` | POST | ✅ | `phong_ban:create` | Tạo phòng ban |
| `/api/v1/phong-ban` | GET | ✅ | `phong_ban:read` | Danh sách (phân trang) |
| `/api/v1/phong-ban/{id}` | GET | ✅ | `phong_ban:read` | Chi tiết |
| `/api/v1/phong-ban/{id}` | PUT | ✅ | `phong_ban:update` | Cập nhật |
| `/api/v1/phong-ban/{id}` | DELETE | ✅ | `phong_ban:delete` | Xóa mềm |

**Use Cases:**
| Use Case | File | Features |
|----------|------|----------|
| `CreatePhongBanUseCase` | `create_phong_ban_uc.py` | Validate code uniqueness, audit log |
| `GetPhongBanUseCase` | `get_phong_ban_uc.py` | get_list, get_detail with employee counts |
| `UpdatePhongBanUseCase` | `update_phong_ban_uc.py` | Update fields, audit log |
| `DeletePhongBanUseCase` | `delete_phong_ban_uc.py` | Soft delete |

**Repository Methods:**
| Method | Description |
|--------|-------------|
| `create()` | Create department |
| `find_by_id()` | Find by ID |
| `find_by_ma()` | Find by code |
| `get_paginated()` | Paginated list with filters |
| `get_detail_with_stats()` | Detail with employee count stats |
| `count_employees()` | Count employees in department |
| `update()` | Update |
| `delete()` | Soft delete |

**Validation:**
- `ma_phong_ban`: Pattern `^[A-Z0-9\-]+$`

#### 3.4.2. Frontend Implementation

**Types:**
```typescript
interface PhongBan {
  id: string;
  ma_phong_ban: string;
  ten_phong_ban: string;
  loai: "chuyen_mon" | "hanh_chinh";
  trang_thai: boolean;
  cha_id?: string;
  so_luong_nhan_vien?: number;
}
```

**Components:**
| Component | Status |
|-----------|--------|
| `phong-ban/page.tsx` | ✅ |
| `phong-ban-form-dialog.tsx` | ✅ |
| `phong-ban-delete-dialog.tsx` | ✅ |
| `phong-ban-columns.tsx` | ✅ |

**Hooks:**
| Hook | File |
|------|------|
| `usePhongBanList` | `use-phong-ban-query.ts` |
| `useCreatePhongBan` | `use-phong-ban-mutations.ts` |
| `useUpdatePhongBan` | `use-phong-ban-mutations.ts` |
| `useDeletePhongBan` | `use-phong-ban-mutations.ts` |

**Zod Schemas:** ❌ Chưa có

#### 3.4.3. Missing Features

**⚠️ NOTE:** Field `loai` đã có trong model PhongBan (default="chuyen_mon"), không cần thêm.

**Missing API Endpoints:**
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `/phong-ban/{id}/nhan-vien` | List employees in department | HIGH |
| `/phong-ban/{id}/thong-ke` | Department statistics | MEDIUM |
| `POST /phong-ban/{id}/di-chuyen` | Move employees between departments | HIGH |
| `/phong-ban/truct-thu` | Direct reports hierarchy | LOW |

**Missing Frontend Features:**
- [x] Parent department selector (cha_id) trong form ✅ DONE
- [ ] Hiển thị danh sách nhân viên trong phòng ban
- [ ] Tree view hierarchy hoàn chỉnh
- [ ] Export danh sách phòng ban
- [ ] Organization chart view
- [ ] Zod validation schemas

---

### 3.5. Quản lý Chức vụ

**Route:** `/chuc-vu`

#### 3.5.1. Backend Implementation

**Database Model Fields (ChucVu):**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String(32) | PK | UUID |
| `ma_chuc_vu` | String(20) | UNIQUE, NOT NULL | Position code |
| `ten_chuc_vu` | String(100) | NOT NULL | Position name |
| `he_so_phu_cap` | Numeric(5,2) | NOT NULL, default=0 | Allowance coefficient |
| `mo_ta` | Text | NULLABLE | Description |
| `tieu_chuan` | Text | NULLABLE | Requirements |
| `trang_thai` | Boolean | NOT NULL, default=True | Active status |
| `cap_bac` | Integer | NOT NULL, default=1 | Level (1-10) |
| `loai` | String(20) | NOT NULL, default="nhan_vien" | Type: "quan_ly" / "giao_vien" / "nhan_vien" |
| `deleted_at` | DateTime | NULLABLE | Soft delete |
| `created_at` | DateTime | NOT NULL | Creation time |
| `updated_at` | DateTime | NOT NULL | Update time |

**Relationships:**
- One-to-Many with `CongTac`

**API Endpoints:**
| Endpoint | Method | Status | Permission | Description |
|----------|--------|--------|------------|-------------|
| `/api/v1/chuc-vu` | POST | ✅ | `chuc_vu:create` | Tạo chức vụ |
| `/api/v1/chuc-vu` | GET | ✅ | `chuc_vu:read` | Danh sách (phân trang) |
| `/api/v1/chuc-vu/{id}` | GET | ✅ | `chuc_vu:read` | Chi tiết |
| `/api/v1/chuc-vu/{id}` | PUT | ✅ | `chuc_vu:update` | Cập nhật |
| `/api/v1/chuc-vu/{id}` | DELETE | ✅ | `chuc_vu:delete` | Xóa mềm |

**Use Cases:**
| Use Case | File | Features |
|----------|------|----------|
| `CreateChucVuUseCase` | `create_chuc_vu_uc.py` | Validate code uniqueness, audit log |
| `GetChucVuUseCase` | `get_chuc_vu_uc.py` | get_list, get_detail |
| `UpdateChucVuUseCase` | `update_chuc_vu_uc.py` | Update fields, audit log |
| `DeleteChucVuUseCase` | `delete_chuc_vu_uc.py` | Soft delete |

**Repository Methods:**
| Method | Description |
|--------|-------------|
| `create()` | Create position |
| `find_by_id()` | Find by ID |
| `find_by_ma()` | Find by code |
| `get_paginated()` | Paginated list with filters |
| `count_employees()` | Count employees |
| `update()` | Update |
| `delete()` | Soft delete |

#### 3.5.2. Frontend Implementation

**Types:**
```typescript
type ChucVuLoai = "quan_ly" | "giao_vien" | "nhan_vien";

interface ChucVu {
  id: string;
  ma_chuc_vu: string;
  ten_chuc_vu: string;
  cap_bac: number;
  he_so_phu_cap: number;
  mo_ta?: string;
  tieu_chuan?: string;
  trang_thai: boolean;
  loai: ChucVuLoai;
}
```

**Components:**
| Component | Status |
|-----------|--------|
| `chuc-vu/page.tsx` | ✅ |
| `chuc-vu-form-dialog.tsx` | ✅ |
| `chuc-vu-delete-dialog.tsx` | ✅ |
| `chuc-vu-columns.tsx` | ✅ |

**Hooks:**
| Hook | File |
|------|------|
| `useChucVuList` | `use-chuc-vu-query.ts` |
| `useCreateChucVu` | `use-chuc-vu-mutations.ts` |
| `useUpdateChucVu` | `use-chuc-vu-mutations.ts` |
| `useDeleteChucVu` | `use-chuc-vu-mutations.ts` |

**Zod Schemas:** ❌ Chưa có

#### 3.5.3. Missing Features

**Missing API Endpoints:**
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `/chuc-vu/{id}/nhan-vien` | List employees with this position | HIGH |
| `/chuc-vu/thong-ke` | Position statistics | MEDIUM |

**Missing Frontend Features:**
- [ ] Hiển thị số lượng nhân viên giữ chức vụ
- [ ] Filter theo cap_bac
- [ ] Hierarchy view theo cấp bậc
- [ ] Danh sách nhân viên theo chức vụ
- [ ] Zod validation schemas

---

### 3.6. Phân công Công tác (CongTac) - Integration Module

> 📋 **QUAN TRỌNG**: Xem chi tiết nghiệp vụ tại [BUSINESS_LOGIC_NHAN_VIEN.md](./docs/BUSINESS_LOGIC_NHAN_VIEN.md)

#### 3.6.1. Current State

**⚠️ CRITICAL ISSUE: Dual Assignment System**

Hiện tại có **2 cách** lưu phòng ban/chức vụ của nhân viên:

1. **Direct FK on NhanVien** (Đang dùng):
   - `phong_ban_id` → FK trực tiếp
   - `chuc_vu_id` → FK trực tiếp
   - Dùng cho phân công HIỆN TẠI

2. **CongTac Table** (Tồn tại nhưng chưa dùng API):
   - Bảng `nhan_vien_cong_tac` lưu lịch sử phân công
   - Có đầy đủ fields nhưng KHÔNG có API endpoints
   - Dùng để theo dõi lịch sử thay đổi

**CongTac Model Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | String(32) | PK |
| `nhan_vien_id` | FK | Nhân viên |
| `phong_ban_id` | FK | Phòng ban |
| `chuc_vu_id` | FK | Chức vụ |
| `ngay_bat_dau` | Date | Ngày bắt đầu |
| `ngay_ket_thuc` | Date | Ngày kết thúc (null = hiện tại) |
| `is_primary` | Boolean | Có phải vị trí chính không |
| `he_so_luong` | String | Hệ số lương |
| `bac_luong` | Integer | Bậc lương |
| `trang_thai` | String | "dang_cong_tac" / "da_nghi" / "da_chuyen" |

#### 3.6.2. CongTac API Endpoints

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/nhan-vien/{id}/cong-tac` | GET | ✅ | Lịch sử công tác của NV |
| `/nhan-vien/{id}/cong-tac/hien-tai` | GET | ✅ | Phân công hiện tại |
| `/nhan-vien/{id}/cong-tac` | POST | ✅ | Tạo phân công mới (auto-end previous primary) |
| `/nhan-vien/{id}/cong-tac/{ct_id}/ket-thuc` | POST | ✅ | Kết thúc phân công |
| `/cong-tac` | GET | ✅ | Danh sách tất cả phân công |
| `/cong-tac/{id}` | GET | ✅ | Chi tiết 1 phân công |
| `/cong-tac/{id}` | PUT | ✅ | Cập nhật phân công |

**CongTac Use Cases:**
| Use Case | File | Features |
|----------|------|----------|
| `CongTacUseCase` | `cong_tac/__init__.py` | get_list, get_current, create (auto-end previous + sync NhanVien FK), end_assignment, audit log |

**CongTac Repository:**
| Method | Description |
|--------|-------------|
| `get_by_nhan_vien_id()` | Lấy tất cả phân công của NV |
| `get_current_by_nhan_vien_id()` | Lấy phân công primary hiện tại |
| `find_by_id()` | Tìm theo ID |
| `create()` | Tạo phân công mới |
| `end_assignment()` | Kết thúc phân công (set ngay_ket_thuc + trang_thai) |

**Missing Employee Assignment Features**

**Completed Use Cases:**
| Use Case | Purpose | Status |
|----------|---------|--------|
| `CongTacUseCase.create` | Tạo phân công mới, tự động kết thúc phân công cũ, đồng bộ FK trên NhanVien | ✅ |
| `CongTacUseCase.end` | Kết thúc phân công công tác | ✅ |
| `CongTacUseCase.get_list` | Lấy lịch sử công tác | ✅ |
| `CongTacUseCase.get_current` | Lấy phân công hiện tại | ✅ |
| `CongTacUseCase.get_all` | Danh sách tất cả phân công (phân trang) | ✅ |
| `CongTacUseCase.get_by_id` | Chi tiết 1 phân công | ✅ |
| `CongTacUseCase.update` | Cập nhật phân công | ✅ |
| `LichSuChucVuUseCase.get_list` | Lấy lịch sử chức vụ | ✅ |

**Still Missing Use Cases:**
| Use Case | Purpose | Priority |
|----------|---------|----------|
| `TransferEmployeeUseCase` | Chuyển phòng ban (tự động tạo CongTac mới) | HIGH |
| `PromoteEmployeeUseCase` | Thăng chức (tạo LichSuChucVu) | MEDIUM |

#### 3.6.4. LichSuChucVu Table

Bảng `lich_su_chuc_vu` tồn tại nhưng KHÔNG được sử dụng:
- Lưu lịch sử thay đổi chức vụ
- Cần tích hợp khi cập nhật chức vụ nhân viên

---

### 3.7. Quản lý Chấm công

**Route:** `/cham-cong`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/nghi-phep/cham-cong/thang` | GET | ✅ Implemented | DS chấm công tháng |
| `/api/v1/nghi-phep/cham-cong/thang/{id}` | GET | ✅ Implemented | Chi tiết tháng |
| `/api/v1/nghi-phep/cham-cong/mock/generate` | POST | ✅ Implemented | Mock data |

**Frontend:**
| Component | Status |
|-----------|--------|
| `cham-cong/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Danh sách chấm công theo tháng
- [ ] Import chấm công từ máy chấm công
- [ ] Cập nhật chấm công thủ công
- [ ] Duyệt chấm công
- [ ] Bảng chấm công theo phòng ban
- [ ] Xuất báo cáo chấm công

---

### 3.7. Quản lý Nghỉ phép

**Route:** `/nghi-phep`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/nghi-phep/don/{id}/duyet` | PUT | ✅ Implemented | Duyệt đơn |
| `/api/v1/nghi-phep/don/{id}/tu-choi` | PUT | ✅ Implemented | Từ chối |
| `/api/v1/nghi-phep/so-ngay-phep/init` | POST | ✅ Implemented | Khởi tạo số ngày phép |

**Frontend:**
| Component | Status |
|-----------|--------|
| `nghi-phep/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Danh sách đơn xin nghỉ (filter theo trạng thái)
- [ ] Duyệt đơn
- [ ] Từ chối đơn (kèm lý do)
- [ ] Xem chi tiết đơn
- [ ] Cấu hình số ngày phép theo loại
- [ ] Khởi tạo số ngày phép năm mới
- [ ] Báo cáo tổng hợp nghỉ phép

---

### 3.8. Quản lý Lương

**Route:** `/luong`

**Backend API:**
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/luong/cau-hinh` | POST/GET | ✅ Implemented | Cấu hình lương |
| `/api/v1/luong` | POST | ✅ Implemented | Tạo bảng lương |
| `/api/v1/luong` | GET | ✅ Implemented | Danh sách |
| `/api/v1/luong/preview` | POST | ✅ Implemented | Preview lương |
| `/api/v1/luong/chay-luong` | POST | ✅ Implemented | Chạy lương tháng |
| `/api/v1/luong/ky-luong` | GET | ✅ Implemented | Kỳ lương |
| `/api/v1/luong/ky-luong/{id}/duyet` | PUT | ✅ Implemented | Duyệt kỳ lương |
| `/api/v1/luong/ky-luong/{id}/chot` | PUT | ✅ Implemented | Chốt kỳ lương |

**Frontend:**
| Component | Status |
|-----------|--------|
| `luong/page.tsx` | ✅ Implemented |

**Chức năng:**
- [ ] Cấu hình bảng lương
  - [ ] Cấu hình lương cơ bản tối thiểu
  - [ ] Cấu hình phụ cấp
  - [ ] Cấu hình khấu trừ
  - [ ] Cấu hình thuế TNCN
- [ ] Tạo kỳ lương mới
- [ ] Chạy lương tự động
  - [ ] Preview trước khi duyệt
  - [ ] Duyệt từng nhân viên
  - [ ] Duyệt hàng loạt
- [ ] Danh sách bảng lương
- [ ] Chi tiết lương nhân viên
- [ ] In phiếu lương
- [ ] Export bảng lương
- [ ] Xem lịch sử chi trả

---

## 4. Báo cáo & Thống kê

### 4.1. Báo cáo Nhân sự
- [ ] Báo cáo tổng hợp nhân sự
- [ ] Báo cáo biến động nhân sự
- [ ] Báo cáo tuổi tác, giới tính
- [ ] Báo cáo trình độ chuyên môn

### 4.2. Báo cáo Chấm công
- [ ] Bảng tổng hợp chấm công
- [ ] Báo cáo đi muộn về sớm
- [ ] Báo cáo nghỉ phép

### 4.3. Báo cáo Lương
- [ ] Tổng hợp chi phí nhân sự
- [ ] Báo cáo thuế TNCN
- [ ] Báo cáo BHXH, BHYT

---

## 5. Hệ thống

### 5.1. Authentication & Authorization
- [x] Đăng nhập/Đăng xuất
- [x] JWT token với cookies
- [ ] Refresh token
- [x] RBAC (Role-based access control)

### 5.2. Upload & File Management
| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/v1/upload/files` | POST | ✅ Implemented | Upload file |
| `/api/v1/upload/tai-lieu` | GET/POST/PUT/DELETE | ✅ Implemented | Quản lý tài liệu |

**Chức năng:**
- [ ] Upload ảnh nhân viên
- [ ] Upload tài liệu (CCCD, hợp đồng, bằng cấp)
- [ ] Xem/tải file
- [ ] Xóa file
- [ ] Giới hạn loại file, kích thước

### 5.3. Audit Log
- [x] Ghi log các thao tác CRUD
- [ ] Xem lịch sử thay đổi của 1 bản ghi
- [ ] Export audit log

---

## 6. Database Tables

### Core Tables
| Table | Status | Description |
|-------|--------|-------------|
| `nhan_vien` | ✅ | Nhân viên |
| `phong_ban` | ✅ | Phòng ban |
| `chuc_vu` | ✅ | Chức vụ (đã có field `loai`) |
| `tai_khoan` | ✅ | Tài khoản |

### Related Tables
| Table | Status | API | Description |
|-------|--------|-----|-------------|
| `nhan_vien_cong_tac` | ✅ | ✅ | Lịch sử công tác |
| `bang_cap_chung_chi` | ✅ | ✅ | Bằng cấp, chứng chỉ |
| `tai_lieu_nhan_vien` | ✅ | ✅ | Tài liệu NV |
| `lich_su_chuc_vu` | ✅ | ✅ (GET) | Lịch sử chức vụ |
| `nguoi_than` | ✅ | ✅ | Người thân |
| `khen_thuong_ky_luat` | ✅ | ✅ | Khen thưởng, kỷ luật |
| `hop_dong` | ✅ (NEW) | ✅ (5 endpoints) | Lịch sử hợp đồng |

**Note:** Tables marked ❌ in API column need API endpoints to be implemented.

### Salary Tables
| Table | Status | Description |
|-------|--------|-------------|
| `luong` | ✅ | Bảng lương |
| `tra_luong` | ✅ | Chi trả lương |
| `cau_hinh_luong` | ✅ | Cấu hình lương |
| `cau_hinh_he_thong_luong` | ✅ | Hệ thống lương |
| `he_so_luong_danh_muc` | ✅ | Hệ số lương |

### Leave & Attendance Tables
| Table | Status | Description |
|-------|--------|-------------|
| `nghi_phep` | ✅ | Nghỉ phép |
| `don_xin_nghi` | ✅ | Đơn xin nghỉ |
| `so_ngay_phep` | ✅ | Số ngày phép |
| `cham_cong` | ✅ | Chấm công |
| `cham_cong_thang` | ✅ | Chấm công tháng |

### RBAC Tables
| Table | Status | Description |
|-------|--------|-------------|
| `roles` | ✅ | Roles |
| `permissions` | ✅ | Permissions |
| `role_permissions` | ✅ | Role-Permission mapping |
| `user_roles` | ✅ | User-Role mapping |

### Other Tables
| Table | Status | Description |
|-------|--------|-------------|
| `khen_thuong_ky_luat` | ✅ | Khen thưởng, kỷ luật |
| `audit_log` | ✅ | Audit log |

---

## 7. Priority Implementation Order

### Phase 1: Core Features (Hoàn thành)
- [x] Authentication
- [x] Employee CRUD
- [x] Department CRUD
- [x] Position CRUD

### Phase 2: Essential Features (Cần hoàn thiện)
- [ ] Employee self-service (leave request, view salary, view attendance)
- [ ] Leave approval workflow
- [ ] Salary management

### Phase 3: Advanced Features (Cần phát triển)
- [ ] Attendance management & import
- [ ] Advanced salary calculation
- [ ] Reports & statistics

### Phase 4: Polish
- [ ] File upload for documents
- [ ] Dashboard analytics
- [ ] Notification system

---

## 8. Technical Stack

- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Frontend:** Next.js 15 + React + shadcn/ui + TanStack Query
- **Auth:** JWT tokens (httpOnly cookies)
- **Architecture:** Clean Architecture + Use Cases + Result Pattern
- **Frontend Patterns:** Route Groups + Zod Validation + React Hook Form

---

## 9. Brainstorming & Gap Analysis

### 9.1 Critical Validation Gap: loai_nhan_vien vs loai_chuc_vu

**Business Logic Requirement** (BUSINESS_LOGIC_NHAN_VIEN.md section 4.1):

| loai_nhan_vien | Chức vụ hợp lệ (loai_chuc_vu) |
|----------------|--------------------------------|
| `giao_vien` | `giao_vien` |
| `can_bo` | `quan_ly` |
| `nhan_vien` | `nhan_vien` |

**Logic:**
- Giáo viên → Chỉ được gán chức vụ loại `giao_vien`
- Cán bộ → Chỉ được gán chức vụ loại `quan_ly`
- Nhân viên → Chỉ được gán chức vụ loại `nhan_vien`

**Backend Implementation:** ✅ DONE
- [x] `validate_loai_compatibility()` helper function in `create_nhan_vien_uc.py`
- [x] Validation in `CreateNhanVienUseCase.execute()`
- [x] Validation in `UpdateNhanVienUseCase.execute()`
- [x] Validation in `CongTacUseCase.create()`
- [x] Validation in `ImportNhanVienUseCase.execute()`

**Frontend:** ✅ DONE
- [x] `useChucVuList` hook with `loai` filter param
- [x] `LOAI_MAPPING` constant for filtering
- [x] Dynamic chuc_vu dropdown based on selected loai_nhan_vien
- [x] Error message when selecting incompatible position

### 9.2 CongTac Integration Gaps

**Current State:**
- ✅ 7 endpoints: GET list, GET current, POST create, POST end, GET all, GET by id, PUT
- ✅ Auto-create CongTac on employee creation
- ✅ CongTac history display in employee detail page
- ✅ Employee transfer workflow (auto-create CongTac when updating phong_ban_id/chuc_vu_id)

**When creating employee:**
- [x] Auto-create CongTac record (phong_ban_id, chuc_vu_id, ngay_bat_dau = ngay_vao_lam)
- [x] Sync NhanVien.phong_ban_id và chuc_vu_id

**When updating employee:**
- [x] If phong_ban_id or chuc_vu_id changed → Create new CongTac record ✅ DONE
- [x] End previous CongTac record ✅ DONE

### 9.3 LichSuChucVu - Table Exists, API Complete

**Table Status:** ✅ Exists in database (`lich_su_chuc_vu`)
**API Status:** ✅ GET endpoint implemented

**Fields in table:**
- nhan_vien_id, chuc_vu_id, phong_ban_id
- tu_ngay, den_ngay
- so_quyet_dinh, ly_do, ghi_chu

**Implemented:**
- [x] LichSuChucVu GET API (get_by_nhan_vien_id)
- [ ] Auto-create when promotion/demotion happens
- [ ] Frontend display in employee detail page

### 9.4 Complete Action Items

#### P0 - Critical (Must Fix)

1. **Validate loai compatibility** ✅ DONE
   - Backend: CreateNhanVienUseCase, UpdateNhanVienUseCase, CongTacUseCase, ImportNhanVienUseCase
   - Frontend: Filter chức vụ theo loại nhân viên ✅ DONE

2. **Auto-create CongTac on employee creation** ✅ DONE
   - When creating NhanVien → also create CongTac record
   - Sync phong_ban_id, chuc_vu_id

#### P1 - High Priority

3. **LichSuChucVu API** ✅ GET DONE
   - GET endpoint (get_by_nhan_vien_id)
   - Frontend display ⚠️ TODO

4. **CongTac full API** ✅ DONE
   - GET /cong-tac
   - GET /cong-tac/{id}
   - PUT /cong-tac/{id}

5. **CongTac in Employee Detail Page** ✅ DONE
   - Display assignment history
   - Show current assignment

#### P2 - Medium Priority

6. **PhongBan nested dropdown** ✅ DONE
   - Parent department selector in form ✅ DONE
   - Tree view in list ⚠️ TODO

7. **Employee transfer workflow** ✅ DONE
   - Backend: Auto-create CongTac on NV update ✅ DONE
   - Frontend: Transfer dialog ✅ DONE

#### P3 - Nice to Have

8. **Organization chart view**
9. **Bulk operations**
10. **Employee card generation**

---

## 10. Completed Items ✅

### 10.1 Core Models - All Fields Implemented

| Model | Fields Status |
|-------|---------------|
| `NhanVien` | ✅ loai_nhan_vien, phong_ban_id, chuc_vu_id, BHXH, Bank |
| `PhongBan` | ✅ loai, cha_id, all required fields |
| `ChucVu` | ✅ loai (NEW!), cap_bac, he_so_phu_cap |

### 10.2 Sub-modules - CRUD Complete

| Module | Status |
|--------|--------|
| NguoiThan | ✅ Model + API + Frontend hooks + UI |
| BangCap | ✅ Model + API + Frontend hooks + UI |
| KhenThuongKyLuat | ✅ Model + API + Frontend hooks + UI |
| CongTac | ✅ Full API (7 endpoints) + Auto-create + Detail page |
| LichSuChucVu | ✅ GET API + Frontend UI |
| HopDong | ✅ Model + API (5 endpoints) + Frontend UI |

### 10.3 Import/Export

| Feature | Status |
|---------|--------|
| Export Excel | ✅ xlsx + file-saver |
| Import Excel | ✅ SheetJS parse + backend bulk create |
| Import dialog | ✅ NhanVienImportDialog with preview |

---

## 11. Remaining Work Summary

### Backend Use Cases
- [x] **P0**: loai compatibility validation (Create/Update/Import/cong_tac)
- [x] **P0**: Auto-create CongTac on employee creation
- [x] **P0**: Auto-create HopDong on employee creation
- [x] **P1**: LichSuChucVu GET API + Full CRUD UseCase
- [x] **P1**: CongTac full API (GET all, GET by id, PUT)
- [x] **P2**: Employee transfer workflow (auto-create CongTac when updating NV)
- [x] **P2**: TransferEmployeeUseCase (dieu_chuyen module) - Complete transfer workflow with CongTac + LichSuChucVu
- [x] **P2**: HoSoNhanSuUseCase (ho_so module) - Employee profile with all related data
- [x] **P2**: Use Cases Index (__init__.py) - Consolidated exports for all use cases
- [x] **P2**: BUSINESS_LOGIC.md updated with complete use cases documentation (Section 2: Danh sách Use Cases)

### Frontend
- [x] **P0**: Filter chức vụ theo loại nhân viên
- [x] **P1**: CongTac history display in employee detail
- [x] **P2**: PhongBan parent selector
- [x] **P2**: LichSuChucVu frontend display
- [x] **P2**: HopDong (contract) history API + display
- [x] **P2**: Employee transfer dialog (integrated in detail page)
- [x] **P2**: NhanVienHopDongTab with nhanVienId prop

### Database
- [x] Run migration: `a1b2c3d4e5f6_add_loai_to_chuc_vu.py` ✅ DONE
- [x] Seed ChucVu.loai data ✅ DONE
- [x] Run migration: `dd8444fcbd22_add_hop_dong_table.py` ✅ DONE
- [ ] Consider adding: ngay_thanh_lap to PhongBan
- [ ] Consider adding: nguoi_than_id FK to NhanVien

---

*Last updated: 2026-04-21*
*Updated: All P0, P1, P2 completed - loai compatibility validation, auto-create CongTac, ChucVu.loai filter, CongTac full API, LichSuChucVu GET API, CongTac tab in detail page, PhongBan parent selector, migration ran, ChucVu.loai seeded, Employee transfer workflow, HopDong table + API + UI, LichSuChucVu UI, Transfer dialog, Use Cases documented in BUSINESS_LOGIC.md.*

## 12. Session Updates (2026-04-21) - Nghi Phep Module Enhancement

### Task 9: 2-level Approval Workflow (Frontend)
**Status:** ✅ Completed

**Backend Changes:**
- [x] Migration: `add_2level_approval_nghi_phep.py` - Add 2-level approval fields to DonXinNghi
- [x] Migration: `add_cau_hinh_nghi_phep_table.py` - Add CauHinhNghiPhep table
- [x] Migration: `seed_cau_hinh_nghi_phep.py` - Seed default leave configs
- [x] DonXinNghi model updated with 2-level fields
- [x] CauHinhNghiPhep model + repository
- [x] QR Cá nhân API: `generate_user_qr`, `validate_user_qr`, `/my-qr` endpoint
- [x] Duyệt 2 cấp API: duyet-cap-1, duyet-cap-2
- [x] Cấu hình ngày phép API: Config + init annual
- [x] Frontend hooks: `use-nghi-phep-admin.ts`

**Frontend Changes:**
- [x] Updated types: `TrangThaiDon` với 2 cấp (`cho_duyet_cap_1`, `cho_duyet_cap_2`, `da_duyet_cap_2`)
- [x] Added tabs filter (Tất cả / Chờ cấp 1 / Chờ cấp 2 / Đã duyệt / Từ chối)
- [x] Added stats cards với visual design
- [x] Updated page component để sử dụng mutations mới
- [x] Updated DonNghiDetailDialog với 2-level buttons (Duyệt cấp 1, Duyệt cấp 2)
- [x] Updated nghi-phep-columns.tsx với action buttons cho 2-level
- [x] Updated nghi-phep-toolbar.tsx với status options mới

### Task 10: ChamCong Edit + Approval Workflow (Frontend)
**Status:** ✅ Completed

**Backend Changes:**
- [x] Chấm công Edit API: PUT `/api/v1/nghi-phep/cham-cong/thang/{id}`
- [x] Chấm công Xác nhận API: POST `/api/v1/nghi-phep/cham-cong/thang/{id}/xac-nhan`
- [x] Chấm công Duyệt API: POST `/api/v1/nghi-phep/cham-cong/thang/{id}/duyet`
- [x] Chấm công Chốt API: POST `/api/v1/nghi-phep/cham-cong/thang/{id}/chot`
- [x] QR Cá nhân API: GET `/api/v1/nv/cham-cong/my-qr`

**Frontend Changes:**
- [x] Created ChamCongEditDialog với edit form + approve buttons
- [x] Added mutations: useChamCongUpdate, useChamCongXacNhan, useChamCongDuyet, useChamCongChot
- [x] Updated page chấm công để sử dụng edit dialog + approve workflow
- [x] Actions: Edit (when chua_chot or da_xac_nhan), Xác nhận (when chua_chot), Duyệt (when da_xac_nhan), Chốt (when da_duyet)

### Task 12: Admin CauHinhNghiPhep Page
**Status:** ✅ Completed

**Frontend Changes:**
- [x] Created `/cau-hinh-nghi-phep/page.tsx` - Admin page to manage leave configuration
- [x] Features: List configs, Create/Edit/Delete leave types, Init annual leave
- [x] Uses hooks: useCauHinhNghiPhep, useCreateCauHinhNghiPhep, useUpdateCauHinhNghiPhep, useInitAnnualLeave

### Task 13: Employee MyQR Page
**Status:** ✅ Completed

**Frontend Changes:**
- [x] Created `/employee/my-qr/page.tsx` - Employee page to view personal attendance QR
- [x] Uses hook: useGetMyQR
- [x] Shows employee info + QR code + refresh button

### Task 14: BaoCao Reporting System (Comprehensive)
**Status:** ✅ Completed

**Backend Changes:**
- [x] Created `BaoCaoService` (`backend/src/service/bao_cao_service.py`) with 6 report methods
- [x] Created API routes (`backend/src/api/routes/thong_ke/bao_cao.py`) with 6 endpoints
- [x] Endpoints: tong-quan, hop-dong/sap-het-han, cham-cong/di-muon, luong/so-sanh, khen-thuong, xu-huong

**Frontend Changes:**
- [x] Created hooks: `useBaoCaoTongQuan`, `useBaoCaoHopDong`, `useBaoCaoDiMuon`, `useBaoCaoLuongSoSanh`, `useBaoCaoKhenThuong`, `useBaoCaoXuHuong`
- [x] Updated sidebar navigation with hierarchical menu (Nhân Sự, Chấm Công, Lương, Khen Thưởng, Xu Hướng)
- [x] Created HopDong Report Tab - Hợp đồng lao động with KPIs + table
- [x] Created DiMuon Report Tab - Đi muộn/Về sớm with charts + table
- [x] Created LuongSoSanh Tab - So sánh lương with bar chart + table
- [x] Created KhenThuong Tab - Khen thưởng/Kỷ luật with pie + bar charts
- [x] Created XuHuong Tab - Trend analysis with multi-line + area charts
- [x] Created PDF export utility (`lib/export-pdf.ts`) with school header + auto-table
- [x] Created Excel export utility (`lib/export-excel.ts`) with multi-sheet support
- [x] Created ExportButtons component for reuse across all tabs

## 13. Session Updates (2026-04-14)

### Completed this session:
- [x] Export `HopDongFormDialog` in `index.ts`
- [x] Integrate `NhanVienTransferDialog` into detail page (`nhan-vien/[id]/page.tsx`)
- [x] Add "Điều chuyển" button with ArrowRightLeft icon
- [x] Remove unused `useUploadTaiLieu` import
- [x] Auto-create HopDong when creating new employee (`create_nhan_vien_uc.py`)
- [x] Add `luong_co_ban` field to `NhanVienCreateRequest` schema
- [x] Fix `HopDong` model import issue (`DateTime` from sqlalchemy)
- [x] Fix `NhanVienHopDongTab` call - pass `nhanVienId` prop

## 13. New Use Cases Added (2026-04-14)

### Backend Use Cases Created:

#### 1. TransferEmployeeUseCase (`dieu_chuyen/transfer_employee_uc.py`)
**Path:** `backend/src/app/usecases/dieu_chuyen/`

**Features:**
- `execute(command)`: Complete transfer workflow
  - Validates employee exists and is active
  - Validates new department and position exist
  - Validates loai compatibility
  - Ends current CongTac (set ngay_ket_thuc, is_primary=false, trang_thai=da_chuyen)
  - Creates new CongTac (is_primary=true)
  - Creates LichSuChucVu record
  - Updates NhanVien FK (phong_ban_id, chuc_vu_id)
  - Creates audit logs for all changes
- `get_history(query)`: Get transfer history for an employee
- `get_options(query)`: Get available transfer options (filtered by loai compatibility)

**Commands:**
- `TransferEmployeeCommand`: nhan_vien_id, phong_ban_id_moi, chuc_vu_id_moi, ngay_dieu_chuyen, ly_do, so_quyet_dinh, ghi_chu, actor_id

**Results:**
- `TransferEmployeeResult`: Full transfer result with old/new department/position info
- `GetEmployeeTransferHistoryResult`: List of transfer history items
- `GetTransferOptionsResult`: Available departments and positions for transfer

#### 2. HoSoNhanSuUseCase (`ho_so/ho_so_nhan_su_uc.py`)
**Path:** `backend/src/app/usecases/ho_so/`

**Features:**
- `get_profile(query)`: Get complete employee profile with all related data
  - Basic personal info
  - Work assignment (phong_ban, chuc_vu)
  - Contract history (hop_dong)
  - Salary history (luong)
  - Education (bang_cap)
  - Family (nguoi_than)
  - Rewards/Discipline (khen_thuong_ky_luat)
  - Attendance history (lich_su_chuc_vu)
- `export_pdf(query)`: Export employee profile to PDF (placeholder)

#### 3. Use Cases Index (`__init__.py`)
**Path:** `backend/src/app/usecases/__init__.py`

**Purpose:** Consolidated exports for all use cases in the application.

**Exports:**
- NhanVien: Create, Get, Update, Delete, Restore, Import
- PhongBan: Create, Get, Update, Delete
- ChucVu: Create, Get, Update, Delete
- HopDong: GetList, GetById, Create, Update, Delete (5 separate use cases)
- CongTac: CongTacUseCase
- LichSuChucVu: GetList, GetDetail, Create, Update, Delete (5 separate use cases)
- NghiPhep: NghiPhepUseCase
- DieuChuyen: TransferEmployeeUseCase
- HoSo: HoSoNhanSuUseCase
- Luong: 10 separate use cases (CauHinh: Create, GetList; Luong: Create, GetList, GetHienTai; KyLuong: GetList, Duyet, Chot; TraLuong: GetByKyLuong, GetDetail; TinhLuong: Preview, Chay)
- ChamCong: ChamCongUseCase
- TaiLieu: Multiple use cases for document management
- SubModule: NguoiThanUseCase, BangCapUseCase, KhenThuongKyLuatUseCase
- Employee: Dashboard, Profile, UpdateProfile, Permissions (4 separate use cases)

### Use Case Refactoring Completed:
- ✅ **hop_dong/**: 5 files (get_list, get_by_id, create, update, delete)
- ✅ **lich_su_chuc_vu/**: 5 files (get_list, get_detail, create, update, delete)
- ✅ **luong/**: 6 files (cau_hinh_luong, luong_record, ky_luong, tra_luong, tinh_luong) - 12 use cases total
- ✅ **employee/**: 4 files (get_dashboard, get_profile, update_profile, get_permissions)
- ✅ **dieu_chuyen/**: 1 file (transfer_employee) - Already correct pattern
- ✅ **ho_so/**: 1 file (ho_so_nhan_su) - Already correct pattern
- ✅ **BUSINESS_LOGIC.md**: Updated with new use case structure
- ✅ **__init__.py**: Main index updated with all use cases
- Employee: Dashboard, Profile, Permissions use cases
- Auth: LoginUseCase
- Dashboard: GetAdminDashboardUseCase

#### 4. BUSINESS_LOGIC.md Updated
- Added Section 2: "Danh sách Use Cases" - Complete listing of all use cases with names, files, and meanings
- Added Appendix: "Cấu trúc thư mục Use Cases" - Directory structure of use cases
- Updated section 2.11 (Luong) with 12 separate use cases
- Updated section 2.14 (Employee) with 4 separate use cases

---

## 14. Sidebar Dual Panel - Quick Actions & Stats

### 14.1 Overview

Sidebar dual panel provides **Mini Dashboard + Quick Actions** for each module.

**Location:** `frontend/src/components/app-sidebar.tsx`
**Pattern:** Custom events dispatched for page-level handling

### 14.2 Sidebar Panels Implemented

#### NhanVienSidebarPanel
**Path:** `frontend/src/components/forms/nhan-vien/nhan-vien-sidebar-panel.tsx`

**Quick Actions:**
| Button | Action | Event |
|--------|--------|-------|
| Thêm nhân viên | Open create dialog | `sidebar:nhan-vien:add` |
| Xuất Excel | Export employee list | `sidebar:nhan-vien:export` |
| Lịch sử | View employee history | `sidebar:nhan-vien:history` |

**Stats:**
- Đang làm (dang_lam count)
- Giáo viên count
- Nhân viên count
- Sinh nhật hôm nay (highlighted if > 0)

**Features:**
- Search box for quick filter
- Recent employees list (clickable → navigate to detail)
- Birthday indicator (Gift icon)

**Custom Events:**
```typescript
window.addEventListener("sidebar:nhan-vien:add", handler)
window.addEventListener("sidebar:nhan-vien:export", handler)
window.addEventListener("sidebar:nhan-vien:history", handler)
```

#### PhongBanSidebarPanel
**Path:** `frontend/src/components/forms/phong-ban/phong-ban-sidebar-panel.tsx`

**Quick Actions:**
| Button | Action | Event |
|--------|--------|-------|
| Thêm phòng ban | Open create dialog | `sidebar:phong-ban:add` |
| Cơ cấu | View organization structure | `sidebar:phong-ban:co-cau` |
| Phân bổ | Allocate employees | `sidebar:phong-ban:phan-bo` |

**Stats:**
- Hoạt động (active count)
- Hành chính count
- Chuyên môn count

**Features:**
- Top 3 departments by staff count (highlighted)
- Quick list by type (Hành chính / Chuyên môn)
- Staff count per department

#### ChucVuSidebarPanel
**Path:** `frontend/src/components/forms/chuc-vu/chuc-vu-sidebar-panel.tsx`

**Quick Actions:**
| Button | Action | Event |
|--------|--------|-------|
| Thêm chức vụ | Open create dialog | `sidebar:chuc-vu:add` |
| Phân bổ | Allocate positions | `sidebar:chuc-vu:phan-bo` |
| Bổ nhiệm | Promotion dialog | `sidebar:chuc-vu:bo-nhiem` |

**Stats:**
- Hoạt động (active count)
- Quản lý count
- Giáo viên count

**Features:**
- Highlight: Highest paid position (gradient card)
- Top 5 positions by staff count
- Quick list with color indicators

#### LuongSidebarPanel
**Path:** `frontend/src/components/forms/luong/luong-sidebar-panel.tsx`

**Quick Actions:**
| Button | Action | Event |
|--------|--------|-------|
| Chạy lương | Run salary calculation | `sidebar:luong:chay` |
| Cấu hình | Open config dialog | `sidebar:luong:cau-hinh` |
| Xem kỳ lương | View salary periods | `sidebar:luong:xem-ky` |

**Stats:**
- Chờ duyệt (pending count)
- Đã duyệt (approved count)
- Lương cơ sở (from active config)
- Tổng thực nhận (month total)

**Features:**
- Recent salary periods (clickable)
- Status badges (Đã chốt / Đã duyệt / Chờ duyệt)
- Quick tips (3 steps)

### 14.3 Custom Events Reference

| Event | Panel | Payload | Handler |
|-------|-------|---------|---------|
| `sidebar:nhan-vien:add` | NhanVien | - | Open create dialog |
| `sidebar:nhan-vien:export` | NhanVien | - | Export Excel |
| `sidebar:nhan-vien:history` | NhanVien | - | View history |
| `sidebar:phong-ban:add` | PhongBan | - | Open create dialog |
| `sidebar:phong-ban:co-cau` | PhongBan | - | Show org chart |
| `sidebar:phong-ban:phan-bo` | PhongBan | - | Allocate employees |
| `sidebar:chuc-vu:add` | ChucVu | - | Open create dialog |
| `sidebar:chuc-vu:phan-bo` | ChucVu | - | Allocate positions |
| `sidebar:chuc-vu:bo-nhiem` | ChucVu | - | Promotion dialog |
| `sidebar:luong:add` | Luong | - | Open config dialog |
| `sidebar:luong:chay` | Luong | - | Run salary |
| `sidebar:luong:cau-hinh` | Luong | - | Open config |
| `sidebar:luong:xem-ky` | Luong | - | View periods |

### 14.4 Page-Level Event Handlers

Pages should listen for sidebar events to implement the actual actions:

```typescript
// Example: nhan-vien/page.tsx
useEffect(() => {
  const handler = () => { /* handle export */ }
  window.addEventListener("sidebar:nhan-vien:export", handler)
  return () => window.removeEventListener("sidebar:nhan-vien:export", handler)
}, [])
```

### 14.5 Missing Implementations (TODO)

| Action | Event | Status |
|--------|-------|--------|
| Xuất Excel | `sidebar:nhan-vien:export` | Emit event, page should handle |
| Lịch sử | `sidebar:nhan-vien:history` | Emit event, page should handle |
| Cơ cấu | `sidebar:phong-ban:co-cau` | ✅ IMPLEMENTED - PhongBanCoCauDialog |
| Phân bổ | `sidebar:phong-ban:phan-bo` | ✅ IMPLEMENTED - PhongBanPhanBoDialog |
| Phân bổ CV | `sidebar:chuc-vu:phan-bo` | ✅ IMPLEMENTED - ChucVuPhanBoDialog |
| Bổ nhiệm | `sidebar:chuc-vu:bo-nhiem` | Emit event, page should handle |
| Chạy lương | `sidebar:luong:chay` | Emit event, LuongPage already handles via `chayLuongOpen` |
| Cấu hình | `sidebar:luong:cau-hinh` | Emit event, LuongPage already handles |
| Xem kỳ | `sidebar:luong:xem-ky` | Emit event, LuongPage already handles |

### 14.6 Sidebar Stats Cleanup

Removed duplicate stats from sidebar panels to avoid redundancy with main page stats:

**NhanVienSidebarPanel:**
- ✅ REMOVED: Đang làm, Giáo viên, Nhân viên counts
- ✅ KEPT: Sinh nhật hôm nay (highlighted card)

**PhongBanSidebarPanel:**
- ✅ REMOVED: Hoạt động, Hành chính, Chuyên môn counts

**ChucVuSidebarPanel:**
- ✅ REMOVED: Hoạt động, Quản lý, Giáo viên counts
- ✅ KEPT: Phụ cấp cao nhất (highlighted gradient card)

### 14.7 PhongBanCoCauDialog - Organization Chart Dialog

**Component:** `PhongBanCoCauDialog`
**Path:** `frontend/src/components/forms/phong-ban/phong-ban-co-cau-dialog.tsx`

**Features:**
- Dialog modal with multiple view modes
- **Tree View**: Hierarchical structure with expand/collapse
- **Theo loại View**: Grouped by type (Hành chính / Chuyên môn)
- **Danh sách View**: Flat list sorted by staff count
- Color coding: Hành chính (indigo) / Chuyên môn (amber)
- Staff count per department
- Inactive department styling (greyed out)
- Legend with department counts

**View Mode Buttons:**
- Tree (Network icon) - Default
- Theo loại (LayoutGrid icon)
- Danh sách (List icon)

**Integration:**
- Page listens for `sidebar:phong-ban:co-cau` event
- Opens dialog via `coCauDialogOpen` state

### 14.8 PhanBoDialog - Allocate Employees to Departments

**Component:** `PhongBanPhanBoDialog`
**Path:** `frontend/src/components/forms/phong-ban/phong-ban-phan-bo-dialog.tsx`

**Features:**
- Select target department
- Select employee (filter out employees already in target department)
- Confirmation and success feedback
- Uses `updateNhanVien` API to change `phong_ban_id`

### 14.9 ChucVuPhanBoDialog - Allocate Positions to Employees

**Component:** `ChucVuPhanBoDialog`
**Path:** `frontend/src/components/forms/chuc-vu/chuc-vu-phan-bo-dialog.tsx`

**Features:**
- Select target position
- Select employee (filter out employees already in target position)
- Color-coded by position type (Quản lý/Giáo viên/Nhân viên)
- Confirmation and success feedback
- Uses `updateNhanVien` API to change `chuc_vu_id`
