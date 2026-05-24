# Timezone Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all datetime handling to store UTC in TIMESTAMPTZ columns, serialize with timezone info, and display in Vietnam time (UTC+7) on the frontend.

**Architecture:** BE stores all datetimes as UTC in PostgreSQL TIMESTAMPTZ columns. A shared utility (`backend/libs/datetime.py`) provides `get_utc_now()` -- all BE code imports from this utility instead of calling `datetime.now()` or `datetime.utcnow()` directly. API responses include timezone offset (`+00:00`). FE uses `@date-fns/tz` to convert UTC responses to Vietnam time for display.

**Tech Stack:** Python 3.11+ (datetime, timezone), SQLAlchemy (DateTime(timezone=True)), PostgreSQL (TIMESTAMPTZ), Alembic (migration), Pydantic v2 (serialization), TypeScript, date-fns 4.x + @date-fns/tz 1.x

---

## Task 1: Expand BE datetime utility

**Files:**
- Modify: `backend/libs/datetime.py`

- [ ] **Step 1: Write the expanded utility**

Replace the entire content of `backend/libs/datetime.py` with:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def to_vn_time(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(VN_TZ)


def parse_datetime(s: str) -> datetime:
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def serialize_dt(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
```

- [ ] **Step 2: Verify the module loads**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "from libs.datetime import get_utc_now, to_vn_time, parse_datetime, serialize_dt, VN_TZ; print('OK', get_utc_now())"`
Expected: Prints `OK` followed by a timezone-aware UTC datetime string ending in `+00:00`.

- [ ] **Step 3: Commit**

```bash
git add backend/libs/datetime.py
git commit -m "feat: expand datetime utility with get_utc_now, parse_datetime, serialize_dt"
```

---

## Task 2: Update all SQLAlchemy models -- DateTime(timezone=True) + get_utc_now

**Files:**
- Modify: `backend/src/domain/models/nhan_vien.py`
- Modify: `backend/src/domain/models/check_in_out.py`
- Modify: `backend/src/domain/models/lich_cham_cong.py`
- Modify: `backend/src/domain/models/don_xin_nghi.py`
- Modify: `backend/src/domain/models/phong_ban.py`
- Modify: `backend/src/domain/models/chuc_vu.py`
- Modify: `backend/src/domain/models/bang_cap_chung_chi.py`
- Modify: `backend/src/domain/models/cong_tac.py`
- Modify: `backend/src/domain/models/tai_khoan.py`
- Modify: `backend/src/domain/models/cham_cong_thang.py`
- Modify: `backend/src/domain/models/cau_hinh_nghi_phep.py`
- Modify: `backend/src/domain/models/qr_config.py`

**Pattern for each file:**

1. Replace `from datetime import datetime` import with `from libs.datetime import get_utc_now` (keep other datetime imports like `date` if used)
2. Replace `Column(DateTime, ...)` with `Column(DateTime(timezone=True), ...)` for all DateTime columns
3. Replace `default=datetime.utcnow` with `default=get_utc_now`
4. Replace `onupdate=datetime.utcnow` with `onupdate=get_utc_now`

### Sub-task 2a: nhan_vien.py

- [ ] **Step 1: Update imports**

Replace `from datetime import datetime` with:
```python
from datetime import date
from libs.datetime import get_utc_now
```

- [ ] **Step 2: Update DateTime columns**

```python
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

Same for `TaiLieuNhanVien` class in the same file:
```python
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/domain/models/nhan_vien.py
git commit -m "refactor: nhan_vien model use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2b: check_in_out.py

- [ ] **Step 1: Update imports and columns**

Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`.

Update columns:
```python
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/check_in_out.py
git commit -m "refactor: check_in_out model use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2c: don_xin_nghi.py

- [ ] **Step 1: Update imports and columns**

Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`.

```python
    ngay_duyet = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/don_xin_nghi.py
git commit -m "refactor: don_xin_nghi model use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2d: cong_tac.py

- [ ] **Step 1: Update imports and columns**

Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`.

```python
    ngay_bat_dau = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    ngay_ket_thuc = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/cong_tac.py
git commit -m "refactor: cong_tac model use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2e: phong_ban.py, chuc_vu.py, bang_cap_chung_chi.py, tai_khoan.py, cham_cong_thang.py, cau_hinh_nghi_phep.py

All follow the same pattern -- these files only have `created_at`/`updated_at` (and some `deleted_at`). For each file:

1. Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`
2. Change `DateTime` → `DateTime(timezone=True)` on all DateTime columns
3. Change `default=datetime.utcnow` → `default=get_utc_now`
4. Change `onupdate=datetime.utcnow` → `onupdate=get_utc_now`

- [ ] **Step 1: Update phong_ban.py**
- [ ] **Step 2: Update chuc_vu.py**
- [ ] **Step 3: Update bang_cap_chung_chi.py**
- [ ] **Step 4: Update tai_khoan.py**
- [ ] **Step 5: Update cham_cong_thang.py**
- [ ] **Step 6: Update cau_hinh_nghi_phep.py**
- [ ] **Step 7: Commit all**

```bash
git add backend/src/domain/models/phong_ban.py backend/src/domain/models/chuc_vu.py backend/src/domain/models/bang_cap_chung_chi.py backend/src/domain/models/tai_khoan.py backend/src/domain/models/cham_cong_thang.py backend/src/domain/models/cau_hinh_nghi_phep.py
git commit -m "refactor: standard models use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2f: lich_cham_cong.py

Same pattern as 2e.

- [ ] **Step 1: Update lich_cham_cong.py** -- replace datetime import, update `created_at`/`updated_at` to use `DateTime(timezone=True)` + `get_utc_now`
- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/lich_cham_cong.py
git commit -m "refactor: lich_cham_cong model use DateTime(timezone=True) + get_utc_now"
```

### Sub-task 2g: qr_config.py

- [ ] **Step 1: Update imports and columns**

Replace `from datetime import datetime` with:
```python
from datetime import datetime
from libs.datetime import get_utc_now
```
(Keep `datetime` import because `datetime.strptime` is used for Time defaults.)

```python
    thoi_gian_hieu_luc = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=get_utc_now, onupdate=get_utc_now
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/qr_config.py
git commit -m "refactor: qr_config model use DateTime(timezone=True) + get_utc_now"
```

---

## Task 3: Update BE serialization (to_dict / isoformat / helpers)

**Files:**
- Modify: `backend/src/domain/models/check_in_out.py` (to_dict method)
- Modify: `backend/src/domain/models/qr_config.py` (to_dict method)
- Modify: `backend/src/app/usecases/nhan_vien/helpers.py`
- Modify: `backend/src/app/usecases/employee/get_employee_profile_uc.py`
- Modify: `backend/src/app/usecases/employee/get_employee_dashboard_uc.py`
- Modify: `backend/src/app/usecases/tai_lieu/tai_lieu_uc.py`

### Sub-task 3a: Update check_in_out.py to_dict

- [ ] **Step 1: Add serialize_dt import and update to_dict**

Add to imports: `from libs.datetime import get_utc_now, serialize_dt`

Replace the `to_dict` method's datetime serialization lines. Change all `self.<field>.isoformat() if self.<field> else None` patterns to `serialize_dt(self.<field>)`:

```python
    def to_dict(self):
        return {
            "id": self.id,
            "nhan_vien_id": self.nhan_vien_id,
            "ngay": self.ngay.isoformat() if self.ngay else None,
            "check_in_time": serialize_dt(self.check_in_time),
            "check_in_qr_id": self.check_in_qr_id,
            "check_in_lat": self.check_in_lat,
            "check_in_lng": self.check_in_lng,
            "check_in_status": self.check_in_status,
            "check_out_time": serialize_dt(self.check_out_time),
            "check_out_qr_id": self.check_out_qr_id,
            "check_out_lat": self.check_out_lat,
            "check_out_lng": self.check_out_lng,
            "trang_thai": self.trang_thai,
            "created_at": serialize_dt(self.created_at),
        }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/check_in_out.py
git commit -m "refactor: check_in_out to_dict use serialize_dt for timezone-aware output"
```

### Sub-task 3b: Update qr_config.py to_dict

- [ ] **Step 1: Add serialize_dt import and update to_dict**

Add to imports: `from libs.datetime import get_utc_now, serialize_dt`

Update `to_dict` to use `serialize_dt` for DateTime fields:

```python
    def to_dict(self):
        return {
            "id": self.id,
            "nhan_vien_id": self.nhan_vien_id,
            "ngay": self.ngay.isoformat() if self.ngay else None,
            "loai": self.loai,
            "qr_data": self.qr_data,
            "qr_image_base64": self.qr_image_base64,
            "thoi_gian_hieu_luc": serialize_dt(self.thoi_gian_hieu_luc),
            "gio_bat_dau": self.gio_bat_dau.strftime("%H:%M")
            if self.gio_bat_dau
            else None,
            "gio_ket_thuc": self.gio_ket_thuc.strftime("%H:%M")
            if self.gio_ket_thuc
            else None,
            "vi_tri": self.vi_tri,
            "kinh_do": self.kinh_do,
            "vi_do": self.vi_do,
            "ban_kinh_cho_phep": self.ban_kinh_cho_phep,
            "trang_thai": self.trang_thai,
            "created_at": serialize_dt(self.created_at),
            "created_by": self.created_by,
        }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/models/qr_config.py
git commit -m "refactor: qr_config to_dict use serialize_dt for timezone-aware output"
```

### Sub-task 3c: Update helpers.py serialize_model_to_dict

- [ ] **Step 1: Add serialize_dt and update the function**

Replace file content:

```python
from datetime import datetime, date
from decimal import Decimal

from libs.datetime import serialize_dt


def serialize_model_to_dict(model) -> dict:
    d = {c.key: getattr(model, c.key) for c in model.__table__.columns}
    for key, value in d.items():
        if isinstance(value, datetime):
            d[key] = serialize_dt(value)
        elif isinstance(value, date):
            d[key] = value.isoformat()
        elif isinstance(value, Decimal):
            d[key] = float(value)
    return d
```

Note: `datetime` check must come before `date` check because `datetime` is a subclass of `date`.

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/nhan_vien/helpers.py
git commit -m "refactor: serialize_model_to_dict use serialize_dt for timezone-aware output"
```

### Sub-task 3d: Update get_employee_profile_uc.py

- [ ] **Step 1: No changes needed for .isoformat() on Date fields**

This file only calls `.isoformat()` on `date` fields (`ngay_sinh`, `ngay_cap_cccd`, `ngay_vao_lam`) -- these are `Date` type, not `DateTime`, so no timezone conversion is needed. No changes required.

### Sub-task 3e: Update get_employee_dashboard_uc.py

- [ ] **Step 1: Replace datetime.now() with get_utc_now and fix .isoformat()**

The `.isoformat()` calls on lines 72-73 are on `date` fields (`tu_ngay`, `den_ngay`) -- no change needed for those.

For the `datetime.now()` calls:

Replace local import `from datetime import datetime` (around line 18) with:
```python
from libs.datetime import get_utc_now
```

Change line 54: `datetime.now().year` → `get_utc_now().year`
Change line 60: `now = datetime.now()` → `now = get_utc_now()`

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/employee/get_employee_dashboard_uc.py
git commit -m "refactor: get_employee_dashboard_uc use get_utc_now"
```

### Sub-task 3f: Update tai_lieu_uc.py

- [ ] **Step 1: Update serialize_tai_lieu to use serialize_dt**

The `created_at` on line 44 is a DateTime field. Add import and update:

```python
from libs.datetime import serialize_dt
```

Change line 44 from:
```python
        "created_at": tl.created_at.isoformat() if tl.created_at else None,
```
to:
```python
        "created_at": serialize_dt(tl.created_at),
```

Line 41 (`ngay_het_han.isoformat()`) is a Date field -- no change needed.

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/tai_lieu/tai_lieu_uc.py
git commit -m "refactor: tai_lieu_uc use serialize_dt for created_at"
```

---

## Task 4: Replace all datetime.utcnow() and datetime.now() calls in BE business logic

**Files:**
- Modify: `backend/src/api/routes/nhan_vien/cham_cong.py`
- Modify: `backend/src/api/routes/nhan_vien/nghi_phep.py`
- Modify: `backend/src/app/usecases/cham_cong/get_my_monthly_uc.py`
- Modify: `backend/src/service/upload_service.py`
- Modify: `backend/src/service/qr_attendance_service.py`
- Modify: `backend/src/service/auth_service.py`
- Modify: `backend/src/service/bao_cao_service.py`
- Modify: `backend/src/repository/bao_cao_repository.py`
- Modify: `backend/src/repository/nhan_vien_repository.py`
- Modify: `backend/src/repository/chuc_vu_repository.py`
- Modify: `backend/src/repository/phong_ban_repository.py`
- Modify: `backend/src/repository/cong_tac_repository.py`
- Modify: `backend/src/repository/cau_hinh_nghi_phep_repository.py`
- Modify: `backend/src/app/usecases/luong/tinh_luong_uc.py`
- Modify: `backend/src/app/usecases/luong/ky_luong_uc.py`
- Modify: `backend/src/app/usecases/nghi_phep/create_don_nghi_uc.py`
- Modify: `backend/src/app/usecases/nghi_phep/duyet_2_cap_uc.py`
- Modify: `backend/src/app/usecases/nhan_vien/update_nhan_vien_uc.py`
- Modify: `backend/src/app/usecases/nhan_vien/create_nhan_vien_uc.py`
- Modify: `backend/src/app/usecases/nhan_vien/get_nhan_vien_uc.py`
- Modify: `backend/src/app/usecases/nhan_vien/batch_phan_bo_uc.py`

**Pattern for each file:**
- Replace `from datetime import datetime` (or local import) with `from libs.datetime import get_utc_now` (keep other datetime imports like `date`, `timedelta`)
- Replace all `datetime.utcnow()` → `get_utc_now()`
- Replace all `datetime.now()` → `get_utc_now()`

### Sub-task 4a: cham_cong.py (critical -- was using datetime.now())

- [ ] **Step 1: Update imports and replace datetime.now()**

Replace `from datetime import date, datetime` with:
```python
from datetime import date
from libs.datetime import get_utc_now
```

Change line 73: `thoi_gian=datetime.now().isoformat()` → `thoi_gian=get_utc_now().isoformat()`
Change line 111: `thoi_gian=datetime.now().isoformat()` → `thoi_gian=get_utc_now().isoformat()`
Change line 181: `now = datetime.now()` → `now = get_utc_now()`
Change line 219: `"expires_at": datetime.utcnow().isoformat()` → `"expires_at": get_utc_now().isoformat()`

- [ ] **Step 2: Commit**

```bash
git add backend/src/api/routes/nhan_vien/cham_cong.py
git commit -m "fix: cham_cong route use get_utc_now instead of datetime.now()"
```

### Sub-task 4b: nghi_phep.py (route)

- [ ] **Step 1: Replace datetime.now()**

Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`.

Change line 161: `now = datetime.now()` → `now = get_utc_now()`

- [ ] **Step 2: Commit**

```bash
git add backend/src/api/routes/nhan_vien/nghi_phep.py
git commit -m "fix: nghi_phep route use get_utc_now"
```

### Sub-task 4c: get_my_monthly_uc.py

- [ ] **Step 1: Replace datetime.now()**

Replace local import `from datetime import datetime` with `from libs.datetime import get_utc_now`.

Change line 39: `now = datetime.now()` → `now = get_utc_now()`

- [ ] **Step 2: Commit**

```bash
git add backend/src/app/usecases/cham_cong/get_my_monthly_uc.py
git commit -m "fix: get_my_monthly_uc use get_utc_now"
```

### Sub-task 4d: upload_service.py

- [ ] **Step 1: Replace datetime.now()**

Replace `from datetime import datetime` with `from libs.datetime import get_utc_now`.

Change line 150: `datetime.now().strftime("%Y%m%d_%H%M%S")` → `get_utc_now().strftime("%Y%m%d_%H%M%S")`

- [ ] **Step 2: Commit**

```bash
git add backend/src/service/upload_service.py
git commit -m "fix: upload_service use get_utc_now"
```

### Sub-task 4e: auth_service.py

- [ ] **Step 1: Replace datetime.now(timezone.utc) with get_utc_now**

Add import: `from libs.datetime import get_utc_now`

Replace all 4 occurrences of `datetime.now(timezone.utc)` with `get_utc_now()`:
- Lines 51, 53, 81, 83

Keep the `from datetime import datetime, timedelta` and `from datetime import timezone` imports if they are still needed elsewhere in the file (check before removing).

- [ ] **Step 2: Commit**

```bash
git add backend/src/service/auth_service.py
git commit -m "refactor: auth_service use get_utc_now"
```

### Sub-task 4f: qr_attendance_service.py

- [ ] **Step 1: Replace datetime.utcnow()**

Add import: `from libs.datetime import get_utc_now`

Change line 286: `int(datetime.utcnow().timestamp())` → `int(get_utc_now().timestamp())`

Keep `from datetime import date, datetime, time` if still needed for other uses.

- [ ] **Step 2: Commit**

```bash
git add backend/src/service/qr_attendance_service.py
git commit -m "refactor: qr_attendance_service use get_utc_now"
```

### Sub-task 4g: bao_cao_repository.py

- [ ] **Step 1: Replace all 5 datetime.utcnow() calls**

Add import: `from libs.datetime import get_utc_now`

Change lines 244, 337, 417, 532, 624: `datetime.utcnow()` → `get_utc_now()`

- [ ] **Step 2: Commit**

```bash
git add backend/src/repository/bao_cao_repository.py
git commit -m "refactor: bao_cao_repository use get_utc_now"
```

### Sub-task 4h: bao_cao_service.py

- [ ] **Step 1: No datetime.now/utcnow to replace**

This file only uses `date.isoformat()` on line 359 which is a `date` field. No changes needed.

### Sub-task 4i: Remaining repository files (nhan_vien, chuc_vu, phong_ban, cong_tac, cau_hinh_nghi_phep)

All use local imports `from datetime import datetime` and `datetime.utcnow()` for soft-delete timestamps or updated_at.

For each file, replace the local import and the `datetime.utcnow()` call with `get_utc_now()`.

- [ ] **Step 1: Update nhan_vien_repository.py** -- local import on line 256, call on line 258
- [ ] **Step 2: Update chuc_vu_repository.py** -- local import on line 154, call on line 156
- [ ] **Step 3: Update phong_ban_repository.py** -- local import on line 209, call on line 211
- [ ] **Step 4: Update cong_tac_repository.py** -- local import on line 51, call on line 53
- [ ] **Step 5: Update cau_hinh_nghi_phep_repository.py** -- import on line 3, calls on lines 45, 79, 104
- [ ] **Step 6: Commit all**

```bash
git add backend/src/repository/nhan_vien_repository.py backend/src/repository/chuc_vu_repository.py backend/src/repository/phong_ban_repository.py backend/src/repository/cong_tac_repository.py backend/src/repository/cau_hinh_nghi_phep_repository.py
git commit -m "refactor: repositories use get_utc_now for soft-delete and updated_at"
```

### Sub-task 4j: Remaining use case files

Each file uses `datetime.utcnow()` in one or two places:

- `tinh_luong_uc.py` -- import line 2, call line 384
- `ky_luong_uc.py` -- local import line 80, call line 108
- `create_don_nghi_uc.py` -- import line 3, call line 109
- `duyet_2_cap_uc.py` -- local imports lines 49, 115, calls lines 54, 119
- `update_nhan_vien_uc.py` -- import line 5, calls lines 162, 182
- `create_nhan_vien_uc.py` -- import line 3, calls lines 255, 261, 287, 288
- `get_nhan_vien_uc.py` -- import line 3, call line 87
- `batch_phan_bo_uc.py` -- import line 3, calls lines 71, 89

For each file, add `from libs.datetime import get_utc_now` and replace `datetime.utcnow()` → `get_utc_now()`. For `create_nhan_vien_uc.py`, replace `datetime.utcnow().date()` → `get_utc_now().date()`.

- [ ] **Step 1: Update all 8 use case files**
- [ ] **Step 2: Commit all**

```bash
git add backend/src/app/usecases/luong/tinh_luong_uc.py backend/src/app/usecases/luong/ky_luong_uc.py backend/src/app/usecases/nghi_phep/create_don_nghi_uc.py backend/src/app/usecases/nghi_phep/duyet_2_cap_uc.py backend/src/app/usecases/nhan_vien/update_nhan_vien_uc.py backend/src/app/usecases/nhan_vien/create_nhan_vien_uc.py backend/src/app/usecases/nhan_vien/get_nhan_vien_uc.py backend/src/app/usecases/nhan_vien/batch_phan_bo_uc.py
git commit -m "refactor: all use cases use get_utc_now"
```

---

## Task 5: Create Alembic migration for TIMESTAMP → TIMESTAMPTZ

**Files:**
- Create: `backend/migration/versions/<auto>_convert_timestamp_to_timestamptz.py`

- [ ] **Step 1: Generate the migration file**

Run:
```bash
cd /mnt/newhome/code/hr_management/backend && alembic revision -m "convert_timestamp_to_timestamptz"
```

- [ ] **Step 2: Write the migration**

The migration must handle two groups of columns:

**Group 1 (already UTC -- created by utcnow):** Just add timezone info.
- `nhan_vien.created_at`, `nhan_vien.updated_at`, `nhan_vien.deleted_at`
- `nhan_vien.tai_lieu_nhan_vien.created_at`, `nhan_vien.tai_lieu_nhan_vien.updated_at`, `nhan_vien.tai_lieu_nhan_vien.deleted_at`
- `check_in_out.created_at`, `check_in_out.updated_at`
- `lich_cham_cong.created_at`, `lich_cham_cong.updated_at`
- `don_xin_nghi.created_at`, `don_xin_nghi.updated_at`, `don_xin_nghi.ngay_duyet`
- `phong_ban.created_at`, `phong_ban.updated_at`, `phong_ban.deleted_at`
- `chuc_vu.created_at`, `chuc_vu.updated_at`, `chuc_vu.deleted_at`
- `bang_cap_chung_chi.created_at`, `bang_cap_chung_chi.updated_at`
- `nhan_vien_cong_tac.created_at`, `nhan_vien_cong_tac.updated_at`, `nhan_vien_cong_tac.ngay_bat_dau`, `nhan_vien_cong_tac.ngay_ket_thuc`
- `tai_khoan.created_at`, `tai_khoan.updated_at`
- `cham_cong_thang.created_at`, `cham_cong_thang.updated_at`
- `cau_hinh_nghi_phep.created_at`, `cau_hinh_nghi_phep.updated_at`
- `qr_config.created_at`, `qr_config.updated_at`, `qr_config.thoi_gian_hieu_luc`

**Group 2 (VN time -- created by datetime.now()):** Subtract 7 hours first.
- `check_in_out.check_in_time`
- `check_in_out.check_out_time`

Write the upgrade function:

```python
from alembic import op
import sqlalchemy as sa

GROUP1_COLUMNS = [
    ("nhan_vien", "created_at"),
    ("nhan_vien", "updated_at"),
    ("nhan_vien", "deleted_at"),
    ("tai_lieu_nhan_vien", "created_at"),
    ("tai_lieu_nhan_vien", "updated_at"),
    ("tai_lieu_nhan_vien", "deleted_at"),
    ("check_in_out", "created_at"),
    ("check_in_out", "updated_at"),
    ("lich_cham_cong", "created_at"),
    ("lich_cham_cong", "updated_at"),
    ("don_xin_nghi", "created_at"),
    ("don_xin_nghi", "updated_at"),
    ("don_xin_nghi", "ngay_duyet"),
    ("phong_ban", "created_at"),
    ("phong_ban", "updated_at"),
    ("phong_ban", "deleted_at"),
    ("chuc_vu", "created_at"),
    ("chuc_vu", "updated_at"),
    ("chuc_vu", "deleted_at"),
    ("bang_cap_chung_chi", "created_at"),
    ("bang_cap_chung_chi", "updated_at"),
    ("nhan_vien_cong_tac", "created_at"),
    ("nhan_vien_cong_tac", "updated_at"),
    ("nhan_vien_cong_tac", "ngay_bat_dau"),
    ("nhan_vien_cong_tac", "ngay_ket_thuc"),
    ("tai_khoan", "created_at"),
    ("tai_khoan", "updated_at"),
    ("cham_cong_thang", "created_at"),
    ("cham_cong_thang", "updated_at"),
    ("cau_hinh_nghi_phep", "created_at"),
    ("cau_hinh_nghi_phep", "updated_at"),
    ("qr_config", "created_at"),
    ("qr_config", "updated_at"),
    ("qr_config", "thoi_gian_hieu_luc"),
]

GROUP2_COLUMNS = [
    ("check_in_out", "check_in_time"),
    ("check_in_out", "check_out_time"),
]


def upgrade() -> None:
    for table, column in GROUP2_COLUMNS:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMPTZ "
            f"USING {column} - INTERVAL '7 hours' AT TIME ZONE 'Asia/Ho_Chi_Minh'"
        )

    for table, column in GROUP1_COLUMNS:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMPTZ "
            f"USING {column} AT TIME ZONE 'UTC'"
        )


def downgrade() -> None:
    all_columns = GROUP1_COLUMNS + GROUP2_COLUMNS
    for table, column in all_columns:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMP "
            f"USING {column} AT TIME ZONE 'UTC'"
        )

    for table, column in GROUP2_COLUMNS:
        op.execute(
            f"UPDATE {table} SET {column} = {column} + INTERVAL '7 hours' WHERE {column} IS NOT NULL"
        )
```

- [ ] **Step 3: Test migration on backup DB**

Run: `alembic upgrade head`
Verify with: `psql -c "\d check_in_out"` -- should show `timestamp with time zone` for datetime columns.

- [ ] **Step 4: Commit**

```bash
git add backend/migration/versions/*convert_timestamp_to_timestamptz*
git commit -m "feat: alembic migration convert TIMESTAMP to TIMESTAMPTZ"
```

---

## Task 6: Create FE shared date utility

**Files:**
- Create: `frontend/src/lib/date-utils.ts`

- [ ] **Step 1: Write the utility**

```typescript
import { format } from "date-fns"
import { TZDate } from "@date-fns/tz"

const VN_TZ = "Asia/Ho_Chi_Minh"

export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "dd/MM/yyyy")
}

export function formatDateTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "dd/MM/yyyy HH:mm")
}

export function formatTimeVN(dateStr?: string | null): string {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return format(new TZDate(d, VN_TZ), "HH:mm")
}

export function getTodayVN(): string {
  return format(new TZDate(new Date(), VN_TZ), "yyyy-MM-dd")
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit src/lib/date-utils.ts`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/date-utils.ts
git commit -m "feat: add shared date utility with VN timezone support"
```

---

## Task 7: Update FE -- replace all inline formatDate with shared utility

**Files (10 components with inline formatDate):**
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-detail-info.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-nghi-phep-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-tai-lieu-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-columns.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-reward-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-lich-su-chuc-vu-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-cong-tac-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-contract-tab.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-salary-tab.tsx`

**Pattern for each file:**

1. Add import: `import { formatDateVN } from "@/lib/date-utils"`
2. Remove the inline `formatDate` function
3. Replace all calls from `formatDate(...)` → `formatDateVN(...)`

- [ ] **Step 1: Update all 10 files**
- [ ] **Step 2: Verify build**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/forms/nhan-vien/nhan-vien-detail-info.tsx frontend/src/components/forms/nhan-vien/nhan-vien-nghi-phep-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-tai-lieu-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-columns.tsx frontend/src/components/forms/nhan-vien/nhan-vien-reward-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-lich-su-chuc-vu-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-cong-tac-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-contract-tab.tsx frontend/src/components/forms/nhan-vien/nhan-vien-salary-tab.tsx
git commit -m "refactor: replace inline formatDate with shared formatDateVN utility"
```

---

## Task 8: Update FE -- components using date-fns directly

**Files (12 components):**
- Modify: `frontend/src/components/forms/nghi-phep/nghi-phep-dialogs.tsx`
- Modify: `frontend/src/components/forms/nghi-phep/nghi-phep-columns.tsx`
- Modify: `frontend/src/app/(employee)/employee/nghi-phep/page.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/page.tsx`
- Modify: `frontend/src/app/(admin)/luong/page.tsx`
- Modify: `frontend/src/app/(admin)/bao-cao/_components/export-all-dialog.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-form-dialog.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-toolbar.tsx`
- Modify: `frontend/src/components/forms/luong/luong-columns.tsx`
- Modify: `frontend/src/components/forms/luong/cau-hinh-luong-dialog.tsx`
- Modify: `frontend/src/components/forms/luong/tra-luong-detail-dialog.tsx`
- Modify: `frontend/src/components/forms/nhan-vien/nhan-vien-grid-view.tsx`

**Pattern for each file:**

For each file that uses `format(date, "dd/MM/yyyy", { locale: vi })` or similar patterns for displaying dates from API:

1. Add import: `import { formatDateVN, formatDateTimeVN } from "@/lib/date-utils"`
2. Replace `format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })` → `formatDateVN(dateStr)`
3. Replace `format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi })` → `formatDateTimeVN(dateStr)`
4. Remove unused `format` imports from `date-fns` if no longer needed (but keep other date-fns functions like `addDays`, `differenceInDays`, etc. if still used)
5. Remove unused `import { vi } from "date-fns/locale"` if no longer needed

Note: Some files use date-fns for date arithmetic (`addDays`, `subDays`, `subMonths`, etc.) -- these should remain as date-fns imports. Only the display formatting should switch to the shared utility.

- [ ] **Step 1: Update all 12 files**
- [ ] **Step 2: Verify build**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/forms/nghi-phep/ frontend/src/app/ frontend/src/components/forms/luong/ frontend/src/components/forms/nhan-vien/nhan-vien-form-dialog.tsx frontend/src/components/forms/nhan-vien/nhan-vien-toolbar.tsx frontend/src/components/forms/nhan-vien/nhan-vien-grid-view.tsx
git commit -m "refactor: use shared formatDateVN/formatDateTimeVN in all date-fns components"
```

---

## Task 9: Fix FE timezone-sensitive logic

**Files:**
- Modify: `frontend/src/hooks/employee/use-employee-check-in-out.ts`
- Modify: `frontend/src/app/(employee)/employee/my-qr/page.tsx`

### Sub-task 9a: Fix "today" check in use-employee-check-in-out.ts

- [ ] **Step 1: Add import and replace today check**

Add import: `import { getTodayVN } from "@/lib/date-utils"`

Change line 47:
```typescript
// Before:
const today = new Date().toISOString().slice(0, 10)

// After:
const today = getTodayVN()
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/employee/use-employee-check-in-out.ts
git commit -m "fix: use VN timezone for today check in attendance hook"
```

### Sub-task 9b: Fix QR time display in my-qr/page.tsx

- [ ] **Step 1: Add import and replace time formatting**

Add import: `import { formatTimeVN } from "@/lib/date-utils"`

Replace the `formatTime` function:
```typescript
// Before:
const formatTime = (iso: string | null) => {
  if (!iso) return "—"
  return iso.slice(11, 16)
}

// After: remove the function entirely, use formatTimeVN directly
```

Replace usages:
- `res.thoi_gian?.slice(11, 16)` → `formatTimeVN(res.thoi_gian)`
- `formatTime(todayRecord?.check_in_time)` → `formatTimeVN(todayRecord?.check_in_time)`
- `formatTime(todayRecord?.check_out_time)` → `formatTimeVN(todayRecord?.check_out_time)`

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/(employee)/employee/my-qr/page.tsx
git commit -m "fix: use VN timezone for QR time display"
```

---

## Task 10: Final verification

- [ ] **Step 1: Run BE linting/type checking**

Run: `cd /mnt/newhome/code/hr_management/backend && python -c "from src.domain.models.nhan_vien import NhanVien; from src.domain.models.check_in_out import CheckInOut; print('Models OK')" && python -c "from libs.datetime import get_utc_now, serialize_dt, parse_datetime; print('Utils OK')"`

- [ ] **Step 2: Run FE build**

Run: `cd /mnt/newhome/code/hr_management/frontend && npx tsc --noEmit`

- [ ] **Step 3: Verify no remaining datetime.now() or datetime.utcnow() in BE (except datetime utility)**

Run: `cd /mnt/newhome/code/hr_management/backend && grep -rn "datetime\.now()" src/ --include="*.py" | grep -v "__pycache__" | grep -v "libs/datetime.py" | grep -v "timezone.utc"`
Expected: No results.

Run: `cd /mnt/newhome/code/hr_management/backend && grep -rn "datetime\.utcnow" src/ --include="*.py" | grep -v "__pycache__"`
Expected: No results.

- [ ] **Step 4: Final commit if any remaining fixes needed**
