# Chấm công + Nghỉ phép Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện module Chấm công + Nghỉ phép: QR cá nhân, workflow duyệt 2 cấp, cấu hình ngày phép, chấm công tháng edit/duyệt/chốt

**Architecture:** Backend FastAPI + Frontend Next.js. Thêm model CauHinhNghiPhep, update DonXinNghi cho 2 cấp, thêm API endpoints mới. Frontend thêm pages và dialogs.

**Tech Stack:** Python/FastAPI (backend), TypeScript/Next.js (frontend), SQLAlchemy, TanStack Query

---

## Task 1: Tạo Migration cho Schema Changes

**Files:**
- Create: `backend/migration/versions/add_nghi_phep_cap_2_v1.py`
- Modify: `backend/src/domain/models/nghi_phep.py`
- Test: `backend/tests/test_migration.py`

- [ ] **Step 1: Tạo migration thêm columns cho DonXinNghi 2 cấp**

```python
# backend/migration/versions/add_nghi_phep_cap_2_v1.py
"""Add cap 2 support for DonXinNghi"""
from alembic import op
import sqlalchemy as sa

revision = 'add_nghi_phep_cap_2_v1'
down_revision = 'latest_revision'
tree_branch = None
depends_on = None

def upgrade():
    op.add_column('don_xin_nghi', sa.Column('cap_duyet_hien_tai', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('don_xin_nghi', sa.Column('nguoi_duyet_cap_1_id', sa.String(32), nullable=True))
    op.add_column('don_xin_nghi', sa.Column('nguoi_duyet_cap_2_id', sa.String(32), nullable=True))
    op.add_column('don_xin_nghi', sa.Column('ngay_duyet_cap_1', sa.DateTime(), nullable=True))
    op.add_column('don_xin_nghi', sa.Column('ngay_duyet_cap_2', sa.DateTime(), nullable=True))
    op.add_column('don_xin_nghi', sa.Column('ghi_chu_duyet_cap_1', sa.Text(), nullable=True))
    op.add_column('don_xin_nghi', sa.Column('ghi_chu_duyet_cap_2', sa.Text(), nullable=True))

def downgrade():
    op.drop_column('don_xin_nghi', 'ghi_chu_duyet_cap_2')
    op.drop_column('don_xin_nghi', 'ghi_chu_duyet_cap_1')
    op.drop_column('don_xin_nghi', 'ngay_duyet_cap_2')
    op.drop_column('don_xin_nghi', 'ngay_duyet_cap_1')
    op.drop_column('don_xin_nghi', 'nguoi_duyet_cap_2_id')
    op.drop_column('don_xin_nghi', 'nguoi_duyet_cap_1_id')
    op.drop_column('don_xin_nghi', 'cap_duyet_hien_tai')
```

- [ ] **Step 2: Tạo bảng CauHinhNghiPhep**

```python
# backend/migration/versions/add_cau_hinh_nghi_phep_v1.py
"""Create CauHinhNghiPhep table"""
from alembic import op
import sqlalchemy as sa

revision = 'add_cau_hinh_nghi_phep_v1'
down_revision = 'add_nghi_phep_cap_2_v1'

def upgrade():
    op.create_table('cau_hinh_nghi_phep',
        sa.Column('id', sa.String(32), primary_key=True),
        sa.Column('loai_nghi', sa.String(50), nullable=False, unique=True),
        sa.Column('ten_loai', sa.String(100), nullable=False),
        sa.Column('so_ngay_moi_nam', sa.Float(), nullable=False),
        sa.Column('so_ngay_toi_da_mot_lan', sa.Float(), nullable=True),
        sa.Column('can_giay_to', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('bat_buoc_ghi_ly_do', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('trang_thai', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('ghi_chu', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

def downgrade():
    op.drop_table('cau_hinh_nghi_phep')
```

- [ ] **Step 3: Run migration**

```bash
cd /home/enles04/hr_management/backend
alembic upgrade head
```

- [ ] **Step 4: Commit**

```bash
git add backend/migration/versions/add_nghi_phep_cap_2_v1.py backend/migration/versions/add_cau_hinh_nghi_phep_v1.py
git commit -m "feat: add 2-level approval for DonXinNghi and CauHinhNghiPhep table"
```

---

## Task 2: Update DonXinNghi Model

**Files:**
- Modify: `backend/src/domain/models/nghi_phep.py`
- Test: `backend/tests/test_don_xin_nghi.py`

- [ ] **Step 1: Thêm fields vào DonXinNghi model**

```python
# backend/src/domain/models/nghi_phep.py - thêm vào DonXinNghi class
cap_duyet_hien_tai: Mapped[int] = mapped_column(Integer, default=1)
nguoi_duyet_cap_1_id: Mapped[str | None] = mapped_column(String(32), ForeignKey('tai_khoan.id'))
nguoi_duyet_cap_2_id: Mapped[str | None] = mapped_column(String(32), ForeignKey('tai_khoan.id'))
ngay_duyet_cap_1: Mapped[datetime | None] = mapped_column(DateTime)
ngay_duyet_cap_2: Mapped[datetime | None] = mapped_column(DateTime)
ghi_chu_duyet_cap_1: Mapped[str | None] = mapped_column(Text)
ghi_chu_duyet_cap_2: Mapped[str | None] = mapped_column(Text)
```

- [ ] **Step 2: Thêm relationships**

```python
# Thêm vào DonXinNghi class
nguoi_duyet_cap_1: Mapped["TaiKhoan"] = relationship("TaiKhoan", foreign_keys=[nguoi_duyet_cap_1_id])
nguoi_duyet_cap_2: Mapped["TaiKhoan"] = relationship("TaiKhoan", foreign_keys=[nguoi_duyet_cap_2_id])
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/domain/models/nghi_phep.py
git commit -m "feat: add 2-level approval fields to DonXinNghi model"
```

---

## Task 3: Tạo CauHinhNghiPhep Model

**Files:**
- Create: `backend/src/domain/models/cau_hinh_nghi_phep.py`
- Modify: `backend/src/domain/models/__init__.py`
- Test: `backend/tests/test_cau_hinh_nghi_phep.py`

- [ ] **Step 1: Tạo model**

```python
# backend/src/domain/models/cau_hinh_nghi_phep.py
from datetime import datetime
from sqlalchemy import String, Float, Boolean, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.domain.models.base import Base

class CauHinhNghiPhep(Base):
    __tablename__ = 'cau_hinh_nghi_phep'
    
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    loai_nghi: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    ten_loai: Mapped[str] = mapped_column(String(100), nullable=False)
    so_ngay_moi_nam: Mapped[float] = mapped_column(Float, nullable=False)
    so_ngay_toi_da_mot_lan: Mapped[float | None] = mapped_column(Float)
    can_giay_to: Mapped[bool] = mapped_column(Boolean, default=False)
    bat_buoc_ghi_ly_do: Mapped[bool] = mapped_column(Boolean, default=False)
    trang_thai: Mapped[bool] = mapped_column(Boolean, default=True)
    ghi_chu: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 2: Register model**

```python
# backend/src/domain/models/__init__.py - thêm vào __all__
from .cau_hinh_nghi_phep import CauHinhNghiPhep
__all__ = [..., "CauHinhNghiPhep"]
```

- [ ] **Step 3: Seed data migration**

```python
# backend/migration/versions/seed_cau_hinh_nghi_phep.py
from alembic import op
from datetime import datetime

def seed_data():
    seed_data = [
        ("phep_nam", "Nghỉ phép năm", 12, 5, False, False),
        ("viec_rieng", "Nghỉ việc riêng", 3, 3, False, False),
        ("nghi_om", "Nghỉ ốm", 0, 30, True, True),
        ("ket_hon", "Nghỉ kết hôn", 3, 3, True, True),
        ("mai_tang", "Nghỉ ma táng", 3, 3, True, True),
        ("thai_san", "Nghỉ thai sản", 180, 180, True, True),
    ]
    # Insert vào bảng
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/domain/models/cau_hinh_nghi_phep.py
git commit -m "feat: add CauHinhNghiPhep model"
```

---

## Task 4: API Endpoints - QR Cá nhân

**Files:**
- Modify: `backend/src/api/routes/nhan_vien/cham_cong.py`

- [ ] **Step 1: Thêm API lấy QR cá nhân**

```python
# Thêm vào employee cham_cong.py router
@router.get("/my-qr", response_model=APIResponse[dict])
async def get_my_qr(
    current_user: UserContext = Depends(require_permission("cham_cong:check_in")),
):
    """Lấy QR code cá nhân của user đang login."""
    # Generate QR với user_id + ngày hôm nay
    qr_service = QRAttendanceService()
    qr_data = qr_service.generate_user_qr(
        user_id=current_user.user_id,
        ngay=date.today()
    )
    return APIResponse(data={
        "qr_data": qr_data,
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    })
```

- [ ] **Step 2: Update QRAttendanceService**

```python
# backend/src/service/qr_attendance_service.py - thêm method
def generate_user_qr(self, user_id: str, ngay: date) -> str:
    """Generate QR cá nhân cho user."""
    payload = {
        "v": 2,
        "uid": user_id,
        "ngay": ngay.isoformat(),
        "timestamp": int(datetime.utcnow().timestamp())
    }
    data_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        SECRET_KEY.encode(), data_str.encode(), hashlib.sha256
    ).hexdigest()
    payload["sig"] = signature
    return base64.b64encode(json.dumps(payload).encode()).decode()
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/service/qr_attendance_service.py backend/src/api/routes/nhan_vien/cham_cong.py
git commit -m "feat: add per-user QR generation endpoint"
```

---

## Task 5: API Endpoints - Duyệt Nghỉ phép 2 Cấp

**Files:**
- Modify: `backend/src/api/routes/quan_ly/nghi_phep.py`

- [ ] **Step 1: Thêm API duyệt cấp 1**

```python
# Thêm vào nghi_phep.py router
@router.put("/don/{don_id}/duyet-cap-1", response_model=APIResponse[dict])
async def duyet_cap_1(
    don_id: str,
    body: DuyetDonNghiRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:approve")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Duyệt cấp 1 - Trưởng phòng."""
    # Validate: user có quyền duyệt đơn này (cùng phòng ban)
    # Check: trạng thái = cho_duyet_cap_1
    # Update: cap_duyet_hien_tai = 2, nguoi_duyet_cap_1_id, ngay_duyet_cap_1, ghi_chu_duyet_cap_1
    # Return updated don
```

- [ ] **Step 2: Thêm API duyệt cấp 2**

```python
@router.put("/don/{don_id}/duyet-cap-2", response_model=APIResponse[dict])
async def duyet_cap_2(
    don_id: str,
    body: DuyetDonNghiRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:approve")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Duyệt cấp 2 - Quản lý cao cấp."""
    # Validate: permission level
    # Check: trạng thái = cho_duyet_cap_2
    # Update: trang_thai = da_duyet, cap_duyet_hien_tai = 2, ngay_duyet_cap_2, ghi_chu_duyet_cap_2
    # Trừ ngày phép nếu loai = phep_nam
    # Return updated don
```

- [ ] **Step 3: Thêm API từ chối**

```python
@router.put("/don/{don_id}/tu-choi", response_model=APIResponse[dict])
async def tu_choi(
    don_id: str,
    body: TuChoiDonNghiRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:approve")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    """Từ chối đơn nghỉ phép."""
    # Update: trang_thai = tu_choi, ghi_chu = body.ghi_chu
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/api/routes/quan_ly/nghi_phep.py
git commit -m "feat: add 2-level approval endpoints for don-xin-nghi"
```

---

## Task 6: API Endpoints - Cấu hình Ngày phép

**Files:**
- Create: `backend/src/api/routes/quan_ly/cau_hinh_nghi_phep.py`
- Modify: `backend/src/api/routes/__init__.py`

- [ ] **Step 1: Tạo router**

```python
# backend/src/api/routes/quan_ly/cau_hinh_nghi_phep.py
from fastapi import APIRouter, Depends
router = APIRouter(prefix="/cau-hinh", tags=["Cấu hình nghỉ phép"])

@router.get("")
async def get_list(
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
):
    # Return list of CauHinhNghiPhep

@router.post("")
async def create(
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
):
    # Create CauHinhNghiPhep

@router.put("/{id}")
async def update(
    id: str,
    body: CauHinhNghiPhepRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
):
    # Update CauHinhNghiPhep

@router.delete("/{id}")
async def delete(
    id: str,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
):
    # Soft delete CauHinhNghiPhep

@router.post("/init-annual")
async def init_annual_leave(
    body: InitAnnualRequest,
    current_user: UserContext = Depends(require_permission("nghi_phep:manage")),
):
    # Init số ngày phép cho tất cả NV đầu năm
```

- [ ] **Step 2: Register router**

```python
# backend/src/api/routes/__init__.py - thêm vào admin router
from .cau_hinh_nghi_phep import router as cau_hinh_nghi_phep_router
router.include_router(cau_hinh_nghi_phep_router, prefix="/nghi-phep", tags=["Nghi Phep - Cau Hinh"])
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/api/routes/quan_ly/cau_hinh_nghi_phep.py
git commit -m "feat: add cau-hinh-nghi-phep endpoints"
```

---

## Task 7: API Endpoints - Chấm công Edit + Duyệt

**Files:**
- Modify: `backend/src/api/routes/quan_ly/nghi_phep.py` - cham_cong part

- [ ] **Step 1: Thêm API edit chấm công**

```python
# Thêm vào nghi_phep.py (phần cham_cong)
@router.put("/cham-cong/thang/{id}", response_model=APIResponse[dict])
async def update_cham_cong_thang(
    id: str,
    body: UpdateChamCongRequest,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
):
    """Update chấm công tháng - chỉ khi status = chua_chot."""
    # Check: trang_thai = chua_chot
    # Update fields
    # Return updated record
```

- [ ] **Step 2: Thêm API xác nhận/duyệt/chốt**

```python
@router.post("/cham-cong/thang/{id}/xac-nhan")
async def xac_nhan(
    id: str,
    current_user: UserContext = Depends(require_permission("cham_cong:manage")),
):
    # chua_chot -> da_xac_nhan

@router.post("/cham-cong/thang/{id}/duyet")
async def duyet(
    id: str,
    current_user: UserContext = Depends(require_permission("cham_cong:approve")),
):
    # da_xac_nhan -> da_duyet

@router.post("/cham-cong/thang/{id}/chot")
async def chot(
    id: str,
    current_user: UserContext = Depends(require_permission("cham_cong:approve")),
):
    # da_duyet -> da_chot
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/api/routes/quan_ly/nghi_phep.py
git commit -m "feat: add cham-cong edit and approval endpoints"
```

---

## Task 8: Frontend - Hooks

**Files:**
- Create: `frontend/src/hooks/use-nghi-phep-admin.ts`
- Modify: `frontend/src/hooks/nghi-phep.ts`

- [ ] **Step 1: Thêm hooks cho admin**

```typescript
// frontend/src/hooks/use-nghi-phep-admin.ts
export function useDuyetCap1() {
  return useMutation(({ id, ghi_chu }) => 
    axios.put(`/api/v1/nghi-phep/don/${id}/duyet-cap-1`, { ghi_chu })
  )
}

export function useDuyetCap2() {
  return useMutation(({ id, ghi_chu }) => 
    axios.put(`/api/v1/nghi-phep/don/${id}/duyet-cap-2`, { ghi_chu })
  )
}

export function useTuChoi() {
  return useMutation(({ id, ghi_chu }) => 
    axios.put(`/api/v1/nghi-phep/don/${id}/tu-choi`, { ghi_chu })
  )
}

export function useChamCongUpdate() {
  return useMutation(({ id, data }) => 
    axios.put(`/api/v1/nghi-phep/cham-cong/thang/${id}`, data)
  )
}

export function useChamCongXacNhan() {
  return useMutation((id) => 
    axios.post(`/api/v1/nghi-phep/cham-cong/thang/${id}/xac-nhan`)
  )
}

export function useChamCongDuyet() {
  return useMutation((id) => 
    axios.post(`/api/v1/nghi-phep/cham-cong/thang/${id}/duyet`)
  )
}

export function useChamCongChot() {
  return useMutation((id) => 
    axios.post(`/api/v1/nghi-phep/cham-cong/thang/${id}/chot`)
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/use-nghi-phep-admin.ts
git commit -m "feat: add admin hooks for nghi-phep and cham-cong"
```

---

## Task 9: Frontend - Trang Duyệt Nghỉ phép

**Files:**
- Modify: `frontend/src/app/(admin)/nghi-phep/page.tsx`

- [ ] **Step 1: Update trang nghỉ phép thêm filter tabs**

```typescript
// Thêm tabs: Tất cả / Chờ cấp 1 / Chờ cấp 2 / Đã duyệt / Từ chối
type TabType = "all" | "cho_cap_1" | "cho_cap_2" | "da_duyet" | "tu_choi"

const tabs = [
  { value: "all", label: "Tất cả" },
  { value: "cho_cap_1", label: "Chờ cấp 1" },
  { value: "cho_cap_2", label: "Chờ cấp 2" },
  { value: "da_duyet", label: "Đã duyệt" },
  { value: "tu_choi", label: "Từ chối" },
]
```

- [ ] **Step 2: Thêm action buttons**

```typescript
// Trong row actions của table
<DropdownMenuItem onClick={() => handleDuyetCap1(don.id)}>
  Duyệt cấp 1
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleDuyetCap2(don.id)}>
  Duyệt cấp 2
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleTuChoi(don.id)} className="text-red-500">
  Từ chối
</DropdownMenuItem>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\(admin\)/nghi-phep/page.tsx
git commit -m "feat: add 2-level approval UI to nghi-phep page"
```

---

## Task 10: Frontend - Trang Chấm công Edit + Duyệt

**Files:**
- Modify: `frontend/src/app/(admin)/cham-cong/page.tsx`

- [ ] **Step 1: Thêm action buttons**

```typescript
// Trong row actions của table
<DropdownMenuItem onClick={() => handleEdit(don.id)}>
  Chỉnh sửa
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleXacNhan(don.id)}>
  Xác nhận
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleDuyet(don.id)}>
  Duyệt
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleChot(don.id)}>
  Chốt
</DropdownMenuItem>
```

- [ ] **Step 2: Thêm edit dialog**

```typescript
// ChamCongEditDialog component
interface Props {
  open: boolean
  onClose: () => void
  chamCong: ChamCongThang | null
}

function ChamCongEditDialog({ open, onClose, chamCong }: Props) {
  const form = useForm({
    defaultValues: {
      so_ngay_co_mat: chamCong?.so_ngay_co_mat,
      so_ngay_vang_co_phep: chamCong?.so_ngay_vang_co_phep,
      // ...
    }
  })
  // Render form fields
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\(admin\)/cham-cong/page.tsx
git commit -m "feat: add edit and approval UI to cham-cong page"
```

---

## Task 11: Cập nhật BUSINESS_LOGIC.md

**Files:**
- Modify: `docs/BUSINESS_LOGIC.md`

- [ ] **Step 1: Thêm section mới**

```markdown
## 8. Module Nghỉ phép (Updated)

### 7.1.x Workflow 2 Cấp

[Thêm mô tả workflow 2 cấp vào BUSINESS_LOGIC.md]
- Tr���ng thái đơn
- Quy trình duyệt
- API endpoints

### 7.1.y Cấu hình Ngày phép

[Thêm mô tả CauHinhNghiPhep]
- Model
- Seed data
- API

## 9. Module Chấm công (Updated)

### 8.x Workflow Edit + Duyệt + Chốt

[Thêm mô tả workflow chấm công tháng]
- Trạng thái
- API endpoints
```

- [ ] **Step 2: Commit**

```bash
git add docs/BUSINESS_LOGIC.md
git commit -m "docs: update BUSINESS_LOGIC with 2-level approval"
```

---

## Task 12: Cập nhật IMPLEMENTATION_STATUS.md

**Files:**
- Modify: `IMPLEMENTATION_STATUS.md`

- [ ] **Step 1: Update status**

```markdown
### 3.7 Quản lý Chấm công (Updated)

**Chức năng:**
- [x] Danh sách chấm công theo tháng
- [x] Import chấm công từ máy chấm công ❌ (không có máy)
- [x] Cập nhật chấm công thủ công ✅ (NEW)
- [x] Duyệt chấm công ✅ (NEW)
- [x] Xác nhận + Chốt ✅ (NEW)
- [x] Bảng chấm công theo phòng ban
- [x] Xuất báo cáo chấm công
- [x] QR cá nhân ✅ (NEW)

### 3.8 Quản lý Nghỉ phép (Updated)

**Chức năng:**
- [x] Danh sách đơn xin nghỉ (filter theo trạng thái)
- [x] Duyệt đơn cấp 1 ✅ (NEW)
- [x] Duyệt đơn cấp 2 ✅ (NEW)
- [x] Từ chối đơn (kèm lý do)
- [x] Xem chi tiết đơn
- [x] Cấu hình số ngày phép theo loại ✅ (NEW)
- [x] Khởi tạo số ngày phép năm mới ✅ (NEW)
- [x] Báo cáo tổng hợp nghỉ phép
```

- [ ] **Step 2: Commit**

```bash
git add IMPLEMENTATION_STATUS.md
git commit -m "chore: update implementation status for cham-cong nghi-phep"
```

---

## Task 13: Verification

**Files:**
- Test: All modified files

- [ ] **Step 1: Run backend tests**

```bash
cd /home/enles04/hr_management/backend
pytest tests/ -v --tb=short
```

- [ ] **Step 2: Run frontend build**

```bash
cd /home/enles04/hr_management/frontend
npm run build
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete cham-cong and nghi-phep 2-level approval"
```

---

## Plan Complete

**Spec:** `docs/superpowers/specs/2026-04-21-cham-cong-nghi-phep-design.md`

**Tasks:** 13 tasks

**Execution options:**
1. **Subagent-Driven (recommended)** - Fresh subagent per task
2. **Inline Execution** - Execute tasks in this session

Which approach?