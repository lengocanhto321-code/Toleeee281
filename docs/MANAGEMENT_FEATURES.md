# Tính năng Quản lý - Trạng thái triển khai

> Document này mô tả trạng thái triển khai các tính năng dành cho tác nhân **Quản lý** (ADMIN, HIEU_TRUONG, HIEU_PHO, TO_TRUONG).

---

## 1. Tổng quan

### 1.1 Tác nhân Quản lý

| Mã | Tên | Quyền hạn chính |
|----|-----|-----------------|
| ADMIN | Quản trị viên | Toàn quyền |
| HIEU_TRUONG | Hiệu trưởng | Quản lý nhân sự, lương |
| HIEU_PHO | Phó Hiệu trưởng | Xem/xử lý đơn nghỉ, báo cáo |
| TO_TRUONG | Tổ trưởng | Quản lý nhân viên trong tổ |

### 1.2 Mức độ hoàn thành

```
████████████████████ 80% Hoàn thành

░░░░░░░░░░░░░░░░░░ 20% Cần triển khai
```

---

## 2. Tính năng ĐÃ triển khai

### 2.1 Quản lý Nhân viên ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo nhân viên | `POST /api/ql/nhan-vien` | `CreateNhanVienUseCase` | ✅ Hoàn thành |
| Import nhân viên (Excel) | `POST /api/ql/nhan-vien/import` | `ImportNhanVienUseCase` | ✅ Hoàn thành |
| Danh sách nhân viên | `GET /api/ql/nhan-vien` | `GetNhanVienUseCase` | ✅ Hoàn thành |
| Chi tiết nhân viên | `GET /api/ql/nhan-vien/{id}` | `GetNhanVienUseCase` | ✅ Hoàn thành |
| Cập nhật nhân viên | `PUT /api/ql/nhan-vien/{id}` | `UpdateNhanVienUseCase` | ✅ Hoàn thành |
| Xóa nhân viên (soft delete) | `DELETE /api/ql/nhan-vien/{id}` | `DeleteNhanVienUseCase` | ✅ Hoàn thành |
| Khôi phục nhân viên | `POST /api/ql/nhan-vien/{id}/restore` | `RestoreNhanVienUseCase` | ✅ Hoàn thành |

**Business logic đã hỗ trợ:**
- Auto-generate mã nhân viên (GV001, CB001, NV001)
- Validate email/CCCD uniqueness
- Auto-tạo CongTac ban đầu khi tạo NV
- Auto-tạo LichSuChucVu khi thay đổi chức vụ
- Audit log cho mọi thao tác

### 2.2 Quản lý Phòng ban ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo phòng ban | `POST /api/ql/phong-ban` | `CreatePhongBanUseCase` | ✅ Hoàn thành |
| Danh sách phòng ban | `GET /api/ql/phong-ban` | `GetPhongBanUseCase` | ✅ Hoàn thành |
| Chi tiết phòng ban | `GET /api/ql/phong-ban/{id}` | `GetPhongBanUseCase` | ✅ Hoàn thành |
| Cập nhật phòng ban | `PUT /api/ql/phong-ban/{id}` | `UpdatePhongBanUseCase` | ✅ Hoàn thành |
| Xóa phòng ban | `DELETE /api/ql/phong-ban/{id}` | `DeletePhongBanUseCase` | ✅ Hoàn thành |

### 2.3 Quản lý Chức vụ ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo chức vụ | `POST /api/ql/chuc-vu` | `CreateChucVuUseCase` | ✅ Hoàn thành |
| Danh sách chức vụ | `GET /api/ql/chuc-vu` | `GetChucVuUseCase` | ✅ Hoàn thành |
| Chi tiết chức vụ | `GET /api/ql/chuc-vu/{id}` | `GetChucVuUseCase` | ✅ Hoàn thành |
| Cập nhật chức vụ | `PUT /api/ql/chuc-vu/{id}` | `UpdateChucVuUseCase` | ✅ Hoàn thành |
| Xóa chức vụ | `DELETE /api/ql/chuc-vu/{id}` | `DeleteChucVuUseCase` | ✅ Hoàn thành |

### 2.4 Quản lý Hợp đồng ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo hợp đồng | `POST /api/ql/hop-dong` | `CreateHopDongUseCase` | ✅ Hoàn thành |
| Danh sách hợp đồng | `GET /api/ql/hop-dong` | `GetListHopDongUseCase` | ✅ Hoàn thành |
| Chi tiết hợp đồng | `GET /api/ql/hop-dong/{id}` | `GetHopDongByIdUseCase` | ✅ Hoàn thành |
| Cập nhật hợp đồng | `PUT /api/ql/hop-dong/{id}` | `UpdateHopDongUseCase` | ✅ Hoàn thành |
| Xóa hợp đồng | `DELETE /api/ql/hop-dong/{id}` | `DeleteHopDongUseCase` | ✅ Hoàn thành |

**Business logic đã hỗ trợ:**
- Auto-update hợp đồng cũ → `da_het_han` khi tạo hợp đồng mới

### 2.5 Quản lý Phân công Công tác ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo phân công | `POST /api/ql/cong-tac` | `CreateCongTacUseCase` | ✅ Hoàn thành |
| Danh sách phân công | `GET /api/ql/cong-tac` | `GetAllCongTacUseCase` | ✅ Hoàn thành |
| DS theo nhân viên | `GET /api/ql/cong-tac/nhan-vien/{id}` | `GetListCongTacUseCase` | ✅ Hoàn thành |
| Phân công hiện tại | `GET /api/ql/cong-tac/nhan-vien/{id}/current` | `GetCurrentCongTacUseCase` | ✅ Hoàn thành |
| Chi tiết phân công | `GET /api/ql/cong-tac/{id}` | `GetCongTacByIdUseCase` | ✅ Hoàn thành |
| Cập nhật phân công | `PUT /api/ql/cong-tac/{id}` | `UpdateCongTacUseCase` | ✅ Hoàn thành |
| Kết thúc phân công | `PUT /api/ql/cong-tac/{id}/end` | `EndCongTacUseCase` | ✅ Hoàn thành |

**Business logic đã hỗ trợ:**
- Validate loai compatibility (giao_vien/chuc_vu)
- Auto-end phân công cũ khi tạo mới
- Auto-sync NhanVien FK khi is_primary=true

### 2.6 Quản lý Lịch sử Chức vụ ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo lịch sử chức vụ | `POST /api/ql/lich-su-chuc-vu` | `CreateLichSuChucVuUseCase` | ✅ Hoàn thành |
| Danh sách lịch sử | `GET /api/ql/lich-su-chuc-vu` | `GetListLichSuChucVuUseCase` | ✅ Hoàn thành |
| Chi tiết lịch sử | `GET /api/ql/lich-su-chuc-vu/{id}` | `GetDetailLichSuChucVuUseCase` | ✅ Hoàn thành |
| Cập nhật lịch sử | `PUT /api/ql/lich-su-chuc-vu/{id}` | `UpdateLichSuChucVuUseCase` | ✅ Hoàn thành |
| Xóa lịch sử | `DELETE /api/ql/lich-su-chuc-vu/{id}` | `DeleteLichSuChucVuUseCase` | ✅ Hoàn thành |

### 2.7 Quản lý Nghỉ phép ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo đơn nghỉ phép | `POST /api/ql/nghi-phep/don` | `CreateDonNghiUseCase` | ✅ Hoàn thành |
| Danh sách đơn nghỉ | `GET /api/ql/nghi-phep/don` | `GetListDonNghiUseCase` | ✅ Hoàn thành |
| Chi tiết đơn nghỉ | `GET /api/ql/nghi-phep/don/{id}` | `GetDonNghiDetailUseCase` | ✅ Hoàn thành |
| Duyệt đơn nghỉ | `PUT /api/ql/nghi-phep/don/{id}/duyet` | `DuyetDonNghiUseCase` | ✅ Hoàn thành |
| Từ chối đơn nghỉ | `PUT /api/ql/nghi-phep/don/{id}/tu-choi` | `TuChoiDonNghiUseCase` | ✅ Hoàn thành |
| Xóa đơn nghỉ | `DELETE /api/ql/nghi-phep/don/{id}` | `DeleteDonNghiUseCase` | ✅ Hoàn thành |
| Lấy số ngày phép | `GET /api/ql/nghi-phep/so-ngay-phep/{id}` | `GetSoNgayPhepUseCase` | ✅ Hoàn thành |
| Khởi tạo số ngày phép | `POST /api/ql/nghi-phep/so-ngay-phep/init` | `InitSoNgayPhepUseCase` | ✅ Hoàn thành |

**Business logic đã hỗ trợ:**
- Validate ngày >= hôm nay
- Check overlapping requests
- Tính số ngày nghỉ (trừ T7, CN, lễ)
- Cảnh báo khi vượt số ngày phép
- Auto-update số ngày phép khi duyệt

### 2.8 Quản lý Chấm công ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Danh sách chấm công | `GET /api/ql/nghi-phep/cham-cong/thang` | `GetListChamCongUseCase` | ✅ Hoàn thành |
| Chi tiết chấm công | `GET /api/ql/nghi-phep/cham-cong/thang/{id}` | `GetChamCongDetailUseCase` | ✅ Hoàn thành |
| Mock generate | `POST /api/ql/nghi-phep/cham-cong/mock/generate` | `MockGenerateChamCongUseCase` | ✅ Hoàn thành |

### 2.9 Quản lý Lương ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Tạo cấu hình lương | `POST /api/ql/luong/cau-hinh` | `CreateCauHinhLuongUseCase` | ✅ Hoàn thành |
| Danh sách cấu hình | `GET /api/ql/luong/cau-hinh` | `GetListCauHinhLuongUseCase` | ✅ Hoàn thành |
| Tạo bảng lương | `POST /api/ql/luong` | `CreateLuongUseCase` | ✅ Hoàn thành |
| Danh sách lương | `GET /api/ql/luong` | `GetListLuongUseCase` | ✅ Hoàn thành |
| Lương hiện tại NV | `GET /api/ql/luong/{id}/hien-tai` | `GetLuongHienTaiUseCase` | ✅ Hoàn thành |
| Preview tính lương | `POST /api/ql/luong/preview` | `PreviewLuongUseCase` | ✅ Hoàn thành |
| Chạy lương tháng | `POST /api/ql/luong/chay-luong` | `ChayLuongUseCase` | ✅ Hoàn thành |
| Danh sách kỳ lương | `GET /api/ql/luong/ky-luong` | `GetListKyLuongUseCase` | ✅ Hoàn thành |
| Duyệt kỳ lương | `PUT /api/ql/luong/ky-luong/{id}/duyet` | `DuyetKyLuongUseCase` | ✅ Hoàn thành |
| Chốt kỳ lương | `PUT /api/ql/luong/ky-luong/{id}/chot` | `ChotKyLuongUseCase` | ✅ Hoàn thành |
| DS phiếu trả lương | `GET /api/ql/luong/ky-luong/{id}/tra-luong` | `GetTraLuongByKyLuongUseCase` | ✅ Hoàn thành |
| Chi tiết phiếu trả | `GET /api/ql/luong/tra-luong/{id}` | `GetTraLuongDetailUseCase` | ✅ Hoàn thành |

### 2.10 Dashboard & Thống kê ✅

| Tính năng | API Endpoint | Use Case | Trạng thái |
|------------|-------------|----------|------------|
| Dashboard admin | `GET /api/ql/thong-ke/dashboard` | `GetAdminDashboardUseCase` | ✅ Hoàn thành |

**Data trả về:**
- 11 counters (tổng NV, PB, CV, đơn chờ duyệt...)
- Top 5 phòng ban
- 5 hoạt động gần nhất

### 2.11 Sub-modules ✅

| Tính năng | API Endpoint | Trạng thái |
|------------|-------------|------------|
| Người thân CRUD | `/api/ql/nhan-vien/{id}/nguoi-than/*` | ✅ Hoàn thành |
| Bằng cấp CRUD | `/api/ql/nhan-vien/{id}/bang-cap/*` | ✅ Hoàn thành |
| Khen thưởng/Kỷ luật CRUD | `/api/ql/nhan-vien/{id}/khen-thuong/*` | ✅ Hoàn thành |

---

## 3. Tính năng CHƯA triển khai

### 3.1 Điều chuyển nhân viên ⏳

**Priority: HIGH**

**Mô tả:** Workflow điều chuyển nhân viên từ phòng ban này sang phòng ban khác.

**Use case đã có nhưng chưa có API:**
```python
# src/app/usecases/dieu_chuyen/transfer_employee_uc.py
TransferEmployeeUseCase  # ✅ Đã implement
```

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `POST /api/ql/dieu-chuyen` | Thực hiện điều chuyển |
| `GET /api/ql/dieu-chuyen/nhan-vien/{id}` | Lịch sử điều chuyển |
| `GET /api/ql/dieu-chuyen/options` | PB/CV khả dụng để điều chuyển |

**Business logic cần đảm bảo:**
- Validate nhân viên đang hoạt động
- Validate PB/CV mới tồn tại
- Validate loai compatibility
- Auto-end CongTac cũ
- Auto-create CongTac mới (is_primary=true)
- Auto-create LichSuChucVu
- Auto-update NhanVien FK
- Audit logs cho mỗi thay đổi

### 3.2 Hồ sơ nhân sự chi tiết ⏳

**Priority: MEDIUM**

**Mô tả:** Xem hồ sơ đầy đủ của nhân viên với tất cả dữ liệu liên quan.

**Use case đã có nhưng chưa expose API:**
```python
# src/app/usecases/ho_so/ho_so_nhan_su_uc.py
HoSoNhanSuUseCase  # ✅ Đã implement
```

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/ql/nhan-vien/{id}/ho-so` | Lấy hồ sơ đầy đủ |
| `GET /api/ql/nhan-vien/{id}/ho-so/export-pdf` | Export PDF hồ sơ |

**Data cần trả về:**
- Thông tin cá nhân
- Phòng ban, chức vụ hiện tại
- Hợp đồng
- Lịch sử công tác
- Bằng cấp, chứng chỉ
- Người thân
- Khen thưởng, kỷ luật
- Lịch sử chức vụ

### 3.3 Báo cáo & Xuất file ⏳

**Priority: HIGH**

**Mô tả:** Xuất báo cáo dưới dạng Excel/PDF cho các module.

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/ql/nhan-vien/export` | Export danh sách NV (Excel) |
| `GET /api/ql/luong/{ky_id}/export` | Export bảng lương (Excel) |
| `GET /api/ql/nghi-phep/bao-cao` | Báo cáo tổng hợp nghỉ phép |
| `GET /api/ql/cham-cong/{thang}/{nam}/export` | Export bảng chấm công |

**Cần tạo Use Cases:**
```python
# src/app/usecases/bao_cao/
├── export_nhan_vien_uc.py      # Export danh sách nhân viên
├── export_luong_uc.py           # Export bảng lương
├── export_cham_cong_uc.py       # Export chấm công
├── bao_cao_nghi_phep_uc.py     # Báo cáo nghỉ phép
└── bao_cao_tong_hop_uc.py      # Báo cáo tổng hợp
```

### 3.4 Quản lý Tài khoản người dùng ⏳

**Priority: MEDIUM**

**Mô tả:** CRUD tài khoản hệ thống, gán vai trò, reset mật khẩu.

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/ql/tai-khoan` | Danh sách tài khoản |
| `POST /api/ql/tai-khoan` | Tạo tài khoản |
| `PUT /api/ql/tai-khoan/{id}` | Cập nhật tài khoản |
| `DELETE /api/ql/tai-khoan/{id}` | Xóa tài khoản |
| `PUT /api/ql/tai-khoan/{id}/reset-password` | Reset mật khẩu |
| `PUT /api/ql/tai-khoan/{id}/roles` | Gán vai trò |

**Cần tạo Use Cases:**
```python
# src/app/usecases/tai_khoan/
├── create_tai_khoan_uc.py
├── get_list_tai_khoan_uc.py
├── update_tai_khoan_uc.py
├── delete_tai_khoan_uc.py
├── reset_password_uc.py
└── assign_roles_uc.py
```

### 3.5 Thông báo & Cảnh báo ⏳

**Priority: LOW**

**Mô tả:** Hệ thống thông báo cho admin và quản lý.

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/ql/thong-bao` | Danh sách thông báo |
| `PUT /api/ql/thong-bao/{id}/read` | Đánh dấu đã đọc |
| `POST /api/ql/canh-bao` | Tạo cảnh báo |

### 3.6 Cài đặt hệ thống ⏳

**Priority: LOW**

**Mô tả:** Cấu hình các tham số hệ thống.

**API endpoints cần tạo:**
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/ql/cai-dat` | Lấy cài đặt |
| `PUT /api/ql/cai-dat` | Cập nhật cài đặt |

---

## 4. Chi tiết Implementation Required

### 4.1 Điều chuyển nhân viên

```python
# File: backend/src/api/routes/quan_ly/dieu_chuyen.py (CẦN TẠO MỚI)

from fastapi import APIRouter, Depends, Path, Body
from src.api.auth import require_permission, UserContext
from src.app.usecases.dieu_chuyen import TransferEmployeeUseCase

router = APIRouter(tags=["Điều chuyển"])

class TransferEmployeeRequest(BaseModel):
    nhan_vien_id: str
    phong_ban_moi_id: str
    chuc_vu_moi_id: str
    ngay_chuyen: str
    ly_do: str = ""
    so_quyet_dinh: str = ""

@router.post("", status_code=status.HTTP_201_CREATED)
async def transfer_employee(
    body: TransferEmployeeRequest,
    user_context: UserContext = Depends(require_permission("nhan_vien:update")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Điều chuyển nhân viên sang phòng ban/chức vụ mới."""
    # TODO: Implement
    pass

@router.get("/nhan-vien/{nhan_vien_id}")
async def get_transfer_history(
    nhan_vien_id: str = Path(...),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
):
    """Lấy lịch sử điều chuyển của nhân viên."""
    # TODO: Implement
    pass

@router.get("/options")
async def get_transfer_options(
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
):
    """Lấy danh sách phòng ban, chức vụ có thể điều chuyển đến."""
    # TODO: Implement
    pass
```

### 4.2 Export báo cáo

```python
# File: backend/src/api/routes/quan_ly/bao_cao.py (CẦN TẠO MỚI)

from fastapi import APIRouter, Depends, Query
from src.api.auth import require_permission

router = APIRouter(tags=["Báo cáo"])

@router.get("/nhan-vien/export")
async def export_nhan_vien(
    format: str = Query("excel", enum=["excel", "pdf"]),
    trang_thai: str = Query(None),
    phong_ban_id: str = Query(None),
    user_context: UserContext = Depends(require_permission("nhan_vien:read")),
):
    """Export danh sách nhân viên ra Excel/PDF."""
    # TODO: Implement
    pass

@router.get("/luong/{ky_luong_id}/export")
async def export_luong(
    ky_luong_id: str,
    user_context: UserContext = Depends(require_permission("luong:export")),
):
    """Export bảng lương kỳ lương ra Excel."""
    # TODO: Implement
    pass
```

---

## 5. Danh sách Files cần tạo

### Routes (API Layer)
```
backend/src/api/routes/quan_ly/
├── dieu_chuyen.py      # [NEW] Điều chuyển nhân viên
├── bao_cao.py          # [NEW] Báo cáo & Export
├── tai_khoan.py        # [NEW] Quản lý tài khoản
└── thong_bao.py        # [NEW] Thông báo
```

### Use Cases (Business Logic)
```
backend/src/app/usecases/
├── dieu_chuyen/
│   ├── transfer_employee_uc.py    # [EXISTS - cần expose API]
│   ├── get_transfer_history_uc.py # [NEW]
│   └── get_transfer_options_uc.py # [NEW]
├── ho_so/
│   └── export_ho_so_uc.py         # [NEW] Export hồ sơ
├── bao_cao/
│   ├── export_nhan_vien_uc.py     # [NEW]
│   ├── export_luong_uc.py         # [NEW]
│   ├── export_cham_cong_uc.py      # [NEW]
│   └── bao_cao_nghi_phep_uc.py    # [NEW]
└── tai_khoan/
    ├── create_tai_khoan_uc.py     # [NEW]
    ├── get_list_tai_khoan_uc.py   # [NEW]
    ├── update_tai_khoan_uc.py     # [NEW]
    └── reset_password_uc.py       # [NEW]
```

---

## 6. Dependencies cần cài đặt

```bash
# Xuất Excel
pip install openpyxl

# Xuất PDF
pip install reportlab weasyprint

# Validation
pip install pydantic[email]
```

---

## 7. Checklist triển khai

### Phase 1: Điều chuyển nhân viên (HIGH)
- [ ] Tạo API endpoint `POST /api/ql/dieu-chuyen`
- [ ] Tạo API endpoint `GET /api/ql/dieu-chuyen/nhan-vien/{id}`
- [ ] Tạo API endpoint `GET /api/ql/dieu-chuyen/options`
- [ ] Update `__init__.py` exports
- [ ] Test workflow hoàn chỉnh

### Phase 2: Hồ sơ nhân sự (MEDIUM)
- [ ] Tạo API endpoint `GET /api/ql/nhan-vien/{id}/ho-so`
- [ ] Tạo API endpoint `GET /api/ql/nhan-vien/{id}/ho-so/export-pdf`
- [ ] Test data aggregation

### Phase 3: Báo cáo & Export (HIGH)
- [ ] Tạo `ExportNhanVienUseCase`
- [ ] Tạo `ExportLuongUseCase`
- [ ] Tạo `ExportChamCongUseCase`
- [ ] Tạo API endpoints tương ứng
- [ ] Test export files

### Phase 4: Quản lý tài khoản (MEDIUM)
- [ ] Tạo CRUD Use Cases cho tai_khoan
- [ ] Tạo API endpoints
- [ ] RBAC integration
- [ ] Test security

---

**Last Updated:** 2026-04-14
