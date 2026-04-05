---
name: hr
description: 'Kỹ năng Quản lý Nhân sự - xử lý nhân viên, chấm công, lương, nghỉ phép, phòng ban. Sử dụng khi làm việc với các tác vụ quản lý nhân sự trong dự án này.'
---

# Kỹ năng Quản lý Nhân sự

## Mục đích

Hỗ trợ làm việc với hệ thống Quản lý Nhân sự - bao gồm quản lý nhân viên, chấm công, tính lương, quản lý nghỉ phép và tổ chức phòng ban.

## Cấu trúc Dự án

Hệ thống backend FastAPI + frontend React:

**Backend** (`/backend`):
- `src/api/` - API endpoints (app.py, auth.py, depends.py, error.py)
- `src/domain/models/` - SQLAlchemy ORM models
- `src/service/` - Business logic (unit_of_work, storage)
- PostgreSQL database với Alembic migrations

**Frontend** (`/frontend`):
- Ứng dụng React/TypeScript

## Các Chức năng

### Quản lý Nhân viên
- Tạo, đọc, sửa, xóa hồ sơ nhân viên
- Quản lý chức vụ, phòng ban
- Theo dõi lịch sử công tác và thay đổi trạng thái

### Chấm công
- Theo dõi check-in/check-out
- Báo cáo chấm công và tóm tắt
- Tính toán tăng ca

### Quản lý Nghỉ phép
- Gửi đơn nghỉ phép
- Theo dõi số ngày nghỉ còn lại
- Quy trình phê duyệt

### Tính Lương
- Tính lương
- Xử lý thanh toán
- Báo cáo lương

### Phòng ban & Chức vụ
- Quản lý phân cấp phòng ban
- Định nghĩa vị trí/vai trò
- Cấu trúc tổ chức

## Quy ước Coding

### Import Statement
**LUÔN LUÔN import tất cả các module cần thiết ở đầu file:**
```python
# Import từ thư viện chuẩn
from datetime import datetime
from typing import Optional

# Import từ SQLAlchemy
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey

# Import từ base
from .base import Base, generate_uuid
```

### Snake_case Convention
**Backend variables, functions, parameters LUÔN LUÔN dùng snake_case:**
```python
# ✅ ĐÚNG - snake_case
ho_ten = "Nguyen Van A"
so_dien_thoai = "0123456789"
def tinh_luong_thuc_nhan(luong_co_ban: int, he_so_luong: float) -> int:
    pass

# ❌ SAI - camelCase hoặc PascalCase
hoTen = "Nguyen Van A"  # Sai!
soDienThoai = "0123456789"  # Sai!
def TinhLuongThucNhan():  # Sai!
    pass
```

### Domain Models Convention
**Tất cả domain fields sử dụng UUID v4 hex (32 ký tự, không có gạch nối):**

```python
from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from .base import Base, generate_uuid


class TenModel(Base):
    """Mô tả model."""

    __tablename__ = "ten_bang"

    # Primary key - LUÔN dùng UUID v4 hex
    id = Column(String(32), primary_key=True, default=generate_uuid)

    # Các field khác - dùng snake_case tiếng Việt
    ten_cot = Column(String(50), unique=True, nullable=False)
    trang_thai = Column(Boolean, nullable=False, default=True)

    # Timestamps - LUÔN bao gồm
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**Quy tắc bắt buộc:**
- Import `Base` và `generate_uuid` từ `src.domain.models.base`
- Primary key: `Column(String(32), primary_key=True, default=generate_uuid)` - UUID v4 hex
- Foreign key: `Column(String(32), ForeignKey("bang_ben_ngoai.id"))` - cũng dùng UUID
- Timestamps: `created_at`, `updated_at` với `datetime.utcnow`
- Định nghĩa `__tablename__` ở dạng snake_case tiếng Việt
- Tên column dùng **Vietnamese snake_case** (ví dụ: `ho_ten`, `ngay_sinh`, `so_dien_thoai`)
- Tên class dùng **PascalCase** (ví dụ: `NhanVien`, `PhongBan`, `ChamCong`)

### Ví dụ Model hoàn chỉnh
```python
from sqlalchemy import Column, String, Boolean, Text, Date, ForeignKey, DateTime
from datetime import datetime
from .base import Base, generate_uuid


class NhanVien(Base):
    """Bảng trung tâm: cán bộ, giáo viên, nhân viên."""

    __tablename__ = "nhan_vien"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_nhan_vien = Column(String(20), unique=True, nullable=False)
    ho_ten = Column(String(100), nullable=False)
    gioi_tinh = Column(String(5), nullable=False)
    ngay_sinh = Column(Date, nullable=False)
    so_dien_thoai = Column(String(15))
    email = Column(String(100), unique=True)
    trang_thai = Column(String(20), nullable=False, default="dang_lam")

    # Foreign key - cũng dùng UUID
    phong_ban_id = Column(String(32), ForeignKey("phong_ban.id", ondelete="SET NULL"))
    chuc_vu_id = Column(String(32), ForeignKey("chuc_vu.id", ondelete="SET NULL"))

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## Cấu trúc API

- FastAPI với dependency injection (`depends.py`)
- Xử lý lỗi qua `error.py`
- Xác thực qua `auth.py`

## Service Layer

- Pattern Unit of Work (`unit_of_work.py`)
- PostgreSQL storage implementation (`storage/postgres.py`)

## Khi nào sử dụng Kỹ năng này

Sử dụng `/hr` khi:
- Tạo hoặc sửa tính năng quản lý nhân sự
- Làm việc với dữ liệu nhân viên, chấm công, lương
- Thiết lập database migrations cho entities nhân sự
- Debug logic nghiệp vụ HR
- Thêm API endpoints mới cho operations HR

## Lệnh nhanh

```bash
# Chạy backend
cd backend && uv run python main.py

# Chạy migrations
cd backend && uv run alembic upgrade head

# Tạo migration mới
cd backend && uv run alembic revision --autogenerate -m "mo_ta"
```

## Danh sách Models hiện có

| File | Tên Class | Mô tả |
|------|-----------|-------|
| phong_ban.py | PhongBan | Tổ chuyên môn và phòng ban hành chính |
| chuc_vu.py | ChucVu | Danh mục chức vụ trong trường |
| trinh_do.py | TrinhDo | Danh mục trình độ học vấn |
| nhan_vien.py | NhanVien | Bảng trung tâm: cán bộ, giáo viên, nhân viên |
| bang_cap_chung_chi.py | BangCapChungChi | Bằng cấp và chứng chỉ của nhân viên |
| lich_su_chuc_vu.py | LichSuChucVu | Lịch sử bổ nhiệm/điều chuyển chức vụ |
| luong.py | Luong | Bảng lương theo ngạch bậc + phụ cấp |
| cham_cong.py | ChamCong | Chấm công hàng tháng |
| tra_luong.py | TraLuong | Phiếu lương hàng tháng |
| nghi_phep.py | NghiPhep | Quản lý đơn nghỉ |
| khen_thuong_ky_luat.py | KhenThuongKyLuat | Khen thưởng & kỷ luật |
| tai_khoan.py | TaiKhoan | Tài khoản hệ thống |
| audit_log.py | AuditLog | Log thao tác |
| bao_cao.py | BaoCao | Lịch sử xuất báo cáo |
