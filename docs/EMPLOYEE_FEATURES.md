# Tính năng Nhân viên - Trạng thái triển khai

> Document này mô tả trạng thái triển khai các tính năng dành cho tác nhân **Nhân viên** (GIAO_VIEN, NHAN_VIEN).

---

## 1. Tổng quan

### 1.1 Tác nhân Nhân viên

| Mã | Tên | Quyền hạn |
|----|-----|-----------|
| GIAO_VIEN | Giáo viên | Xem thông tin cá nhân, tạo đơn nghỉ, xem lương |
| NHAN_VIEN | Nhân viên | Giống Giáo viên |

### 1.2 Mức độ hoàn thành

```
████████████░░░░░░░░ 60% Hoàn thành

░░░░░░░░░░░░░░░░░░░ 40% Cần triển khai
```

---

## 2. Tính năng ĐÃ triển khai

### 2.1 Dashboard cá nhân ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Dashboard | `GET /api/nv/dashboard` | `GetEmployeeDashboardUseCase` | ✅ Hoàn thành |

**Data trả về:**
```json
{
  "nhan_vien": {
    "id": "...",
    "ho_ten": "Nguyễn Văn A",
    "ma_nhan_vien": "GV001",
    "phong_ban": {...},
    "chuc_vu": {...}
  },
  "nghi_phep": {
    "phep_nam_con_lai": 5.0,
    "don_cho_duyet": 1
  },
  "cham_cong": {
    "thang": 4,
    "nam": 2026,
    "so_ngay_co_mat": 20
  }
}
```

### 2.2 Hồ sơ cá nhân ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Xem hồ sơ | `GET /api/nv/profile` | `GetEmployeeProfileUseCase` | ✅ Hoàn thành |
| Cập nhật hồ sơ | `PUT /api/nv/profile` | `UpdateEmployeeProfileUseCase` | ✅ Hoàn thành |

**Cho phép cập nhật:**
- `email` - Email công việc
- `so_dien_thoai` - Số điện thoại
- `dia_chi` - Địa chỉ

### 2.3 Quyền hạn ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Xem permissions | `GET /api/nv/permissions` | `GetEmployeePermissionsUseCase` | ✅ Hoàn thành |

**Data trả về:**
```json
{
  "user_id": "...",
  "roles": ["GIAO_VIEN"],
  "permissions": [
    "dashboard:view_employee",
    "profile:read",
    "profile:update",
    "nghi_phep:create",
    "nghi_phep:view_own",
    "luong:view_own",
    "cham_cong:view_own"
  ]
}
```

### 2.4 Đơn nghỉ phép ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Xem đơn của tôi | `GET /api/ql/nghi-phep/me` | `GetListDonNghiUseCase` | ✅ Hoàn thành |
| Tạo đơn mới | `POST /api/ql/nghi-phep/don` | `CreateDonNghiUseCase` | ✅ Hoàn thành |

**Workflow:**
```
1. Nhân viên tạo đơn nghỉ
   - Chọn loại nghỉ (phép năm, ốm, việc riêng...)
   - Chọn ngày bắt đầu, ngày kết thúc
   - Nhập lý do
   - Upload giấy tờ (nếu cần)
   
2. Hệ thống:
   - Validate ngày >= hôm nay
   - Check không trùng đơn đã có
   - Tính số ngày nghỉ
   - Cảnh báo nếu vượt số ngày phép
   
3. Đơn được tạo với trạng thái "cho_duyet"
```

### 2.5 Chấm công QR ✅ (NEW - Thay thế Mock)

> **Thay thế hoàn toàn:** Hệ thống chấm công QR Code mới thay thế cho mock data.

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Lấy QR check-in | `GET /api/nv/cham-cong/qr/{ngay}` | `GetQRCodeUseCase` | ⏳ Cần implement |
| Check-in QR | `POST /api/nv/cham-cong/check-in` | `CheckInUseCase` | ⏳ Cần implement |
| Check-out QR | `POST /api/nv/cham-cong/check-out` | `CheckOutUseCase` | ⏳ Cần implement |
| Lịch sử chấm công | `GET /api/nv/cham-cong/lich-su` | `GetMyHistoryUseCase` | ⏳ Cần implement |
| Chấm công tháng | `GET /api/nv/cham-cong/thang` | `GetMonthlyUseCase` | ⏳ Cần implement |

**Workflow mới:**
```
1. Admin tạo QR codes hàng loạt cho cả tuần/tháng
   - QR chứa: ngày, vị trí, HMAC signature
   - QR có hiệu lực trong khung giờ quy định

2. Nhân viên scan QR để check-in/out
   - Validate signature chống giả mạo
   - Validate thời gian (trong giờ làm việc)
   - Validate vị trí GPS (nếu có)
   - Phát hiện đi muộn

3. Cuối tháng: Admin chạy aggregate
   - Tổng hợp check-in/out → ChamCongThang
   - Cộng thêm ngày nghỉ phép, công tác
```

**Chi tiết:** Xem `docs/ATTENDANCE_QR_SYSTEM.md`

### 2.6 Lương (hạn chế) ⚠️

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Xem lương của tôi | `GET /api/ql/luong/me` | `GetListLuongUseCase` | ✅ Hoàn thành |

**Lưu ý:** API này yêu cầu permission `luong:manage` thay vì `luong:view_own` → **CẦN SỬA**

---

## 3. Tính năng CHƯA triển khai

### 3.1 Xem chi tiết đơn nghỉ phép ⏳

**Priority: HIGH**

**Mô tả:** Xem chi tiết một đơn nghỉ phép cụ thể.

**API cần tạo:**
```python
# backend/src/api/routes/nhan_vien/nghi_phep.py (CẦN TẠO MỚI)

from fastapi import APIRouter, Depends, Path

router = APIRouter(prefix="/nv/nghi-phep", tags=["Nghỉ phép"])

@router.get("/{don_id}")
async def get_my_don_detail(
    don_id: str = Path(..., description="ID đơn nghỉ"),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem chi tiết đơn nghỉ phép của user hiện tại.
    Chỉ cho phép xem đơn của chính mình.
    """
    # TODO: Implement
    pass
```

### 3.2 Hủy đơn nghỉ phép ⏳

**Priority: MEDIUM**

**Mô tả:** Nhân viên có thể hủy đơn nghỉ phép đang chờ duyệt.

**API cần tạo:**
```python
@router.delete("/{don_id}/huy")
async def cancel_my_don_nghi(
    don_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Hủy đơn nghỉ phép đang chờ duyệt.
    Chỉ người tạo mới được hủy.
    """
    # TODO: Implement
    pass
```

### 3.3 Số ngày phép còn lại ⏳

**Priority: HIGH**

**Mô tả:** Xem số ngày phép còn lại của bản thân.

**API cần tạo:**
```python
@router.get("/so-ngay-phep")
async def get_my_remaining_leave(
    nam: int = Query(default=2026),
    user_context: UserContext = Depends(require_permission("nghi_phep:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem số ngày phép còn lại của user hiện tại.
    """
    # TODO: Implement
    pass
```

**Data trả về:**
```json
{
  "nhan_vien_id": "...",
  "nam": 2026,
  "phep_nam_duoc_phep": 12.0,
  "phep_nam_da_su_dung": 7.0,
  "phep_nam_con_lai": 5.0,
  "chi_tiet": [
    {"loai": "phép năm", "da_su_dung": 5.0},
    {"loai": "nghỉ ốm", "da_su_dung": 2.0}
  ]
}
```

### 3.4 Lịch sử lương chi tiết ⏳

**Priority: HIGH**

**Mô tả:** Xem chi tiết lương từng tháng với breakdown.

**Vấn đề hiện tại:**
- API `/api/ql/luong/me` yêu cầu `luong:manage` thay vì `luong:view_own`

**API cần sửa:**
```python
# backend/src/api/routes/quan_ly/luong.py - Sửa permission

@router.get("/me", response_model=APIResponseWithMetadata[list[dict]])
async def get_my_luong(
    ...
    user_context: UserContext = Depends(require_permission("luong:view_own")),  # Sửa từ manage
    ...
):
```

**API cần tạo:**
```python
@router.get("/nv/luong")
async def get_my_salary_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=24),
    nam: int = Query(default=2026),
    user_context: UserContext = Depends(require_permission("luong:view_own")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem lịch sử lương của user hiện tại.
    Trả về chi tiết: lương cơ bản, phụ cấp, khấu trừ, thực nhận.
    """
    # TODO: Implement
    pass
```

**Data trả về:**
```json
{
  "items": [{
    "thang": 4,
    "nam": 2026,
    "luong_co_ban": 5400000,
    "phu_cap": {
      "chuc_vu": 1000000,
      "tham_nien": 500000,
      "khac": 0
    },
    "tong_thu_nhap": 6900000,
    "khau_tru": {
      "bhxh": 432000,
      "bhyt": 81000,
      "bhtn": 54000,
      "thue_tncn": 285000,
      "khac": 0
    },
    "tong_khau_tru": 852000,
    "luong_thuc_nhan": 6048000,
    "ngay_thanh_toan": "2026-04-25"
  }]
}
```

### 3.5 Xem thông tin phòng ban ⏳

**Priority: MEDIUM**

**Mô tả:** Xem thông tin phòng ban mình đang thuộc về.

**API cần tạo:**
```python
@router.get("/phong-ban")
async def get_my_department(
    user_context: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem thông tin phòng ban của user hiện tại.
    """
    # TODO: Implement
    pass
```

### 3.6 Xem thông tin chức vụ ⏳

**Priority: MEDIUM**

**Mô tả:** Xem thông tin chức vụ hiện tại.

**API cần tạo:**
```python
@router.get("/chuc-vu")
async def get_my_position(
    user_context: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem thông tin chức vụ của user hiện tại.
    """
    # TODO: Implement
    pass
```

### 3.7 Đổi mật khẩu ⏳

**Priority: HIGH**

**Mô tả:** Nhân viên tự đổi mật khẩu của mình.

**API cần tạo:**
```python
# backend/src/api/routes/auth.py

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

@router.put("/doi-mat-khau")
async def change_password(
    body: ChangePasswordRequest,
    user_context: UserContext = Depends(require_permission("profile:update")),
):
    """
    Đổi mật khẩu của user hiện tại.
    - Validate old_password đúng
    - Validate new_password != old_password
    - Validate new_password == confirm_password
    - Hash và lưu new_password
    """
    # TODO: Implement
    pass
```

### 3.8 Upload avatar ⏳

**Priority: LOW**

**Mô tả:** Upload và cập nhật ảnh đại diện.

**API cần tạo:**
```python
@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_context: UserContext = Depends(require_permission("profile:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Upload ảnh đại diện.
    - Validate file type (jpg, png)
    - Validate file size (< 5MB)
    - Resize nếu cần
    - Lưu và update nhan_vien.anh_dai_dien
    """
    # TODO: Implement
    pass
```

### 3.9 Thông báo cá nhân ⏳

**Priority: MEDIUM**

**Mô tả:** Xem thông báo dành riêng cho nhân viên.

**API cần tạo:**
```python
@router.get("/thong-bao")
async def get_my_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    da_doc: bool = Query(None),
    user_context: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem danh sách thông báo của user hiện tại.
    """
    # TODO: Implement
    pass

@router.put("/thong-bao/{id}/doc")
async def mark_notification_read(
    id: str,
    user_context: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Đánh dấu thông báo đã đọc.
    """
    # TODO: Implement
    pass
```

### 3.10 Xem lịch sử công tác ⏳

**Priority: LOW**

**Mô tả:** Xem lịch sử phân công công tác của bản thân.

**API cần tạo:**
```python
@router.get("/lich-su-cong-tac")
async def get_my_assignment_history(
    user_context: UserContext = Depends(require_permission("dashboard:view_employee")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem lịch sử phân công công tác của user hiện tại.
    """
    # TODO: Implement
    pass
```

### 3.11 Xem hợp đồng ⏳

**Priority: MEDIUM**

**Mô tả:** Xem thông tin hợp đồng lao động của bản thân.

**API cần tạo:**
```python
@router.get("/hop-dong")
async def get_my_contracts(
    user_context: UserContext = Depends(require_permission("profile:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """
    Xem danh sách hợp đồng của user hiện tại.
    """
    # TODO: Implement
    pass
```

---

## 4. Chi tiết Implementation Required

### 4.1 Route Structure cho Employee

```python
# backend/src/api/routes/nhan_vien/__init__.py (CẦN CẬP NHẬT)

from .employee import router as employee_router
from .nghi_phep import router as nghi_phep_router  # [NEW]
from .luong import router as luong_router          # [NEW]

__all__ = [
    "employee_router",
    "nghi_phep_router",
    "luong_router",
]
```

### 4.2 Files cần tạo

```
backend/src/api/routes/nhan_vien/
├── __init__.py           # [UPDATE] Import thêm routers mới
├── employee.py           # [EXISTS] Dashboard, profile, permissions
├── nghi_phep.py         # [NEW] Đơn nghỉ, số ngày phép
├── luong.py             # [NEW] Lương cá nhân
└── thong_bao.py         # [NEW] Thông báo

backend/src/app/usecases/employee/
├── get_employee_dashboard_uc.py    # [EXISTS]
├── get_employee_profile_uc.py      # [EXISTS]
├── update_employee_profile_uc.py   # [EXISTS]
├── get_employee_permissions_uc.py   # [EXISTS]
├── get_my_remaining_leave_uc.py    # [NEW] Số ngày phép
├── get_my_salary_detail_uc.py      # [NEW] Lương chi tiết
└── get_my_notifications_uc.py      # [NEW] Thông báo
```

### 4.3 RBAC Permissions cần thêm

```python
# backend/scripts/init_rbac.py

PERMISSIONS_TO_ADD = {
    # Employee self-service
    "luong:view_own",     # Xem lương cá nhân (đã có nhưng chưa dùng đúng)
    "hop_dong:view_own",  # Xem hợp đồng cá nhân
    "thong_bao:view",     # Xem thông báo
    "thong_bao:mark_read", # Đánh dấu đã đọc
    "password:change",     # Đổi mật khẩu
}
```

### 4.4 Update Role Permissions

```python
# Role: GIAO_VIEN
GIAO_VIEN_PERMISSIONS = [
    # Existing
    "dashboard:view_employee",
    "profile:read",
    "profile:update",
    "nghi_phep:create",
    "nghi_phep:view_own",
    "luong:view_own",  # ← Thêm/cập nhật
    "cham_cong:view_own",
    
    # New
    "hop_dong:view_own",
    "thong_bao:view",
    "thong_bao:mark_read",
    "password:change",
]

# Role: NHAN_VIEN (giống GIAO_VIEN)
NHAN_VIEN_PERMISSIONS = GIAO_VIEN_PERMISSIONS
```

---

## 5. API Reference cho Employee

### 5.1 Endpoints hiện có

| Method | Endpoint | Mô tả | Permission |
|--------|----------|--------|------------|
| GET | `/api/nv/dashboard` | Dashboard cá nhân | `dashboard:view_employee` |
| GET | `/api/nv/profile` | Xem hồ sơ | `profile:read` |
| PUT | `/api/nv/profile` | Cập nhật hồ sơ | `profile:update` |
| GET | `/api/nv/permissions` | Xem quyền | `profile:read` |
| GET | `/api/ql/nghi-phep/me` | DS đơn nghỉ | `nghi_phep:view_own` |
| POST | `/api/ql/nghi-phep/don` | Tạo đơn nghỉ | `nghi_phep:create` |
| GET | `/api/ql/nghi-phep/cham-cong/me` | Chấm công | `nghi_phep:view_own` |

### 5.2 Endpoints cần tạo

| Method | Endpoint | Mô tả | Permission |
|--------|----------|--------|------------|
| GET | `/api/nv/nghi-phep/{id}` | Chi tiết đơn nghỉ | `nghi_phep:view_own` |
| DELETE | `/api/nv/nghi-phep/{id}/huy` | Hủy đơn nghỉ | `nghi_phep:view_own` |
| GET | `/api/nv/nghi-phep/so-ngay-phep` | Số ngày phép | `nghi_phep:view_own` |
| GET | `/api/nv/luong` | Lịch sử lương | `luong:view_own` |
| GET | `/api/nv/phong-ban` | Phòng ban của tôi | `dashboard:view_employee` |
| GET | `/api/nv/chuc-vu` | Chức vụ của tôi | `dashboard:view_employee` |
| GET | `/api/nv/hop-dong` | Hợp đồng của tôi | `hop_dong:view_own` |
| PUT | `/api/nv/doi-mat-khau` | Đổi mật khẩu | `password:change` |
| POST | `/api/nv/avatar` | Upload avatar | `profile:update` |
| GET | `/api/nv/thong-bao` | Thông báo | `thong_bao:view` |
| PUT | `/api/nv/thong-bao/{id}/doc` | Đánh dấu đã đọc | `thong_bao:mark_read` |
| GET | `/api/nv/lich-su-cong-tac` | Lịch sử công tác | `dashboard:view_employee` |

---

## 6. Checklist triển khai

### Phase 1: Core Features (HIGH)
- [ ] Fix permission `luong:view_own` trong `/api/ql/luong/me`
- [ ] Tạo `GET /api/nv/nghi-phep/{id}` - Chi tiết đơn nghỉ
- [ ] Tạo `GET /api/nv/nghi-phep/so-ngay-phep` - Số ngày phép còn lại
- [ ] Tạo `GET /api/nv/luong` - Lịch sử lương chi tiết
- [ ] Tạo `PUT /api/nv/doi-mat-khau` - Đổi mật khẩu

### Phase 2: Info Features (MEDIUM)
- [ ] Tạo `GET /api/nv/phong-ban` - Phòng ban
- [ ] Tạo `GET /api/nv/chuc-vu` - Chức vụ
- [ ] Tạo `GET /api/nv/hop-dong` - Hợp đồng
- [ ] Tạo `GET /api/nv/lich-su-cong-tac` - Lịch sử công tác

### Phase 3: Additional Features (LOW)
- [ ] Tạo `POST /api/nv/avatar` - Upload avatar
- [ ] Tạo `GET /api/nv/thong-bao` - Thông báo
- [ ] Tạo `PUT /api/nv/thong-bao/{id}/doc` - Đánh dấu đã đọc
- [ ] Tạo `DELETE /api/nv/nghi-phep/{id}/huy` - Hủy đơn

---

## 7. Frontend Pages cần tạo

```
frontend/src/pages/nhan-vien/
├── Dashboard.tsx              # Dashboard cá nhân (existed)
├── Profile.tsx                # Hồ sơ cá nhân (existed)
├── LeaveRequest.tsx          # [NEW] Tạo đơn nghỉ
├── LeaveHistory.tsx          # [NEW] Lịch sử đơn nghỉ
├── LeaveBalance.tsx          # [NEW] Số ngày phép
├── SalaryHistory.tsx         # [NEW] Lịch sử lương
├── SalaryDetail.tsx          # [NEW] Chi tiết lương tháng
├── Attendance.tsx            # [NEW] Chấm công QR
├── QRScanner.tsx            # [NEW] Scanner component
├── Notifications.tsx         # [NEW] Thông báo
└── ChangePassword.tsx        # [NEW] Đổi mật khẩu
```

---

## 8. QR Attendance Pages (Admin)

```
frontend/src/pages/admin/
├── QRGenerator.tsx           # [NEW] Tạo QR hàng loạt
├── QRList.tsx               # [NEW] Danh sách QR đã tạo
├── AttendanceMonthly.tsx     # [NEW] Bảng chấm công tháng
├── AttendanceManualEdit.tsx  # [NEW] Sửa chấm công thủ công
└── AttendanceReport.tsx      # [NEW] Báo cáo chấm công
```
frontend/src/pages/nhan-vien/
├── Dashboard.tsx              # Dashboard cá nhân (existed)
├── Profile.tsx                # Hồ sơ cá nhân (existed)
├── LeaveRequest.tsx          # [NEW] Tạo đơn nghỉ
├── LeaveHistory.tsx           # [NEW] Lịch sử đơn nghỉ
├── LeaveBalance.tsx          # [NEW] Số ngày phép
├── SalaryHistory.tsx         # [NEW] Lịch sử lương
├── SalaryDetail.tsx          # [NEW] Chi tiết lương tháng
├── Attendance.tsx            # [NEW] Chấm công
├── Notifications.tsx         # [NEW] Thông báo
└── ChangePassword.tsx        # [NEW] Đổi mật khẩu
```

---

**Last Updated:** 2026-04-14
