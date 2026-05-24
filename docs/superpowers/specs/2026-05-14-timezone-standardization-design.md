# Timezone Standardization Design

## Problem

The HR management system has inconsistent timezone handling across all layers:

1. **Backend mixes `datetime.utcnow()` and `datetime.now()`** -- check-in/check-out uses local server time (UTC+7) while `created_at`/`updated_at` uses UTC. Same row has timestamps offset by 7 hours.
2. **Database uses `TIMESTAMP` without timezone** -- naive datetime, ambiguous whether UTC or VN time.
3. **API returns naive ISO strings** (`2026-05-14T08:30:00` with no offset) -- frontend interprets using browser timezone.
4. **Frontend uses `new Date().toISOString().slice(0,10)` for "today"** -- returns UTC date, wrong near midnight in VN.
5. **Utility `backend/libs/datetime.py` exists but is unused.**

## Decision

**Approach: TIMESTAMPTZ + UTC everywhere**

Golden rule: "Always store UTC, display Vietnam time."

Server is currently local VN (UTC+7). The solution must work correctly when deployed to cloud (UTC default).

## Architecture

### Data flow

```
[User in VN] → [FE: VN time] → [API: ISO +07:00] → [BE: normalize to UTC] → [DB: TIMESTAMPTZ (UTC)]
[DB: TIMESTAMPTZ (UTC)] → [BE: serialize ISO +00:00] → [API: ISO +00:00] → [FE: convert to +07:00 for display]
```

### Changes per layer

| Layer | Current | New |
|-------|---------|-----|
| **DB** | `TIMESTAMP` (naive) | `TIMESTAMPTZ` (UTC internally) |
| **BE datetime** | Mixed `utcnow()` / `now()` | Single `get_utc_now()` via utility |
| **BE models** | `DateTime()` + `datetime.utcnow` | `DateTime(timezone=True)` + `get_utc_now` |
| **BE serialization** | `dt.isoformat()` (naive) | `dt.astimezone(timezone.utc).isoformat()` (with `+00:00`) |
| **BE input parsing** | Accepts naive string | Accepts ISO with/without timezone, normalize to UTC |
| **API response** | `2026-05-14T08:30:00` | `2026-05-14T01:30:00+00:00` |
| **FE date utility** | None, inline functions | Shared `formatDateVN()` using `@date-fns/tz` |
| **FE "today" check** | `new Date().toISOString().slice(0,10)` | Uses `TZ` from `@date-fns/tz` for "today in VN" |

## Backend Changes

### Utility: `backend/libs/datetime.py`

Expand the existing unused utility:

- `get_utc_now()` → `datetime.now(timezone.utc)` (timezone-aware)
- `to_vn_time(dt)` → convert UTC to `Asia/Ho_Chi_Minh` (for logging/reports)
- `parse_datetime(s)` → parse ISO string (with or without timezone) → UTC datetime

All BE code must import from this utility. No direct `datetime.now()` or `datetime.utcnow()` calls.

### SQLAlchemy models

- All `DateTime()` columns → `DateTime(timezone=True)`
- All `default=datetime.utcnow` → `default=get_utc_now`
- All `onupdate=datetime.utcnow` → `onupdate=get_utc_now`

### Serialization

- Model `to_dict()` methods: use `dt.astimezone(timezone.utc).isoformat()`
- Pydantic schemas: add `json_encoders` for datetime to include timezone offset
- Ensure all API responses include `+00:00` suffix

### Input parsing

- Accept ISO strings with timezone offset (e.g., `2026-05-14T15:30:00+07:00`)
- Naive strings (no offset) will be treated as UTC -- this is safe because after migration, all API clients will send timezone-aware strings
- Normalize all incoming datetimes to UTC before database storage using `parse_datetime()`

## Frontend Changes

### Shared utility: `frontend/src/lib/date-utils.ts`

- `formatDateVN(date)` → display `dd/MM/yyyy`
- `formatDateTimeVN(date)` → display `dd/MM/yyyy HH:mm`
- `getTodayVN()` → get current date in VN timezone (for "today" checks)
- `parseUTCDate(s)` → parse ISO string from API, preserve timezone info

Uses `@date-fns/tz` package (already installed but unused) with `TZ` set to `Asia/Ho_Chi_Minh`.

### Replace all inline `formatDate` functions

10+ components have identical inline `formatDate` functions. Replace all with imports from shared utility.

### Fix "today" checks

Replace `new Date().toISOString().slice(0,10)` with `getTodayVN()` in:
- `use-employee-check-in-out.ts` (line 47)
- Any other "today" comparisons

### Fix QR time display

In `my-qr/page.tsx` (lines 89-92), replace `iso.slice(11, 16)` with proper timezone-aware formatting.

## Database Migration

### Column classification

**Group 1 -- Currently storing UTC (created by `datetime.utcnow`):** Mark as UTC during conversion.
- All `created_at`, `updated_at` columns in every model
- `ngay_chay` in ky luong
- Timestamps in QR config
- `thoi_gian_tao` in cau hinh nghi phep

**Group 2 -- Currently storing VN time (created by `datetime.now()`):** Subtract 7 hours before marking as UTC.
- `thoi_gian_vao` (check-in) in `check_in_out`
- `thoi_gian_ra` (check-out) in `check_in_out`

**Group 3 -- `Date` type columns (date only):** Not affected.
- `ngay_sinh`, `ngay_bat_dau`, `ngay_ket_thuc`, `hieu_luc_tu`, `hieu_luc_den`, etc.

### Migration SQL strategy

```sql
-- Group 2 (VN time): subtract 7 hours, then mark as UTC
ALTER TABLE check_in_out ALTER COLUMN thoi_gian_vao TYPE TIMESTAMPTZ
  USING thoi_gian_vao - INTERVAL '7 hours' AT TIME ZONE 'Asia/Ho_Chi_Minh';
ALTER TABLE check_in_out ALTER COLUMN thoi_gian_ra TYPE TIMESTAMPTZ
  USING thoi_gian_ra - INTERVAL '7 hours' AT TIME ZONE 'Asia/Ho_Chi_Minh';

-- Group 1 (already UTC): just mark timezone
ALTER TABLE nhan_vien ALTER COLUMN created_at TYPE TIMESTAMPTZ
  USING created_at AT TIME ZONE 'UTC';
-- ... same for all other UTC columns

-- Update defaults
ALTER TABLE nhan_vien ALTER COLUMN created_at
  SET DEFAULT now() AT TIME ZONE 'UTC';
```

The Alembic migration will handle NULL values automatically (`USING` clause skips NULLs).

## Deployment Order

1. **Backup database**
2. **Deploy BE code** (new code handles both TIMESTAMPTZ and TIMESTAMP, uses `get_utc_now()`)
3. **Run Alembic migration immediately after BE deploy**, in the same deployment session (convert columns)
4. **Deploy FE code** (timezone-aware display)

Steps 2 and 3 must happen in the same deploy session with zero traffic if possible (maintenance window). BE code must be deployed before migration so it can handle the new column types. Steps 2+3 before step 4 ensures FE receives properly formatted timezone-aware responses.

## Affected Files

### Backend -- Utility
- `backend/libs/datetime.py` -- expand with `get_utc_now()`, `to_vn_time()`, `parse_datetime()`

### Backend -- Models (DateTime columns)
- `backend/src/domain/models/nhan_vien.py`
- `backend/src/domain/models/check_in_out.py`
- `backend/src/domain/models/lich_cham_cong.py`
- `backend/src/domain/models/don_xin_nghi.py`
- `backend/src/domain/models/phong_ban.py`
- `backend/src/domain/models/chuc_vu.py`
- `backend/src/domain/models/bang_cap_chung_chi.py`
- `backend/src/domain/models/cong_tac.py`
- `backend/src/domain/models/tai_khoan.py`
- `backend/src/domain/models/cham_cong_thang.py`
- `backend/src/domain/models/cau_hinh_nghi_phep.py`

### Backend -- Use Cases (datetime calls)
- `backend/src/api/routes/nhan_vien/cham_cong.py` -- `datetime.now()` → `get_utc_now()`
- `backend/src/api/routes/nhan_vien/nghi_phep.py`
- `backend/src/app/usecases/employee/get_employee_dashboard_uc.py`
- `backend/src/app/usecases/cham_cong/get_my_monthly_uc.py`
- `backend/src/service/bao_cao_repository.py`
- `backend/src/service/bao_cao_service.py`
- `backend/src/service/qr_attendance_service.py`
- `backend/src/service/upload_service.py`
- `backend/src/app/usecases/luong/tinh_luong_uc.py`
- `backend/src/app/usecases/nghi_phep/create_don_nghi_uc.py`
- `backend/src/app/usecases/nhan_vien/update_nhan_vien_uc.py`
- `backend/src/app/usecases/nhan_vien/create_nhan_vien_uc.py`
- `backend/src/app/usecases/nhan_vien/get_nhan_vien_uc.py`
- `backend/src/app/usecases/luong/ky_luong_uc.py`
- `backend/src/app/usecases/nghi_phep/duyet_2_cap_uc.py`
- `backend/src/app/usecases/nhan_vien/batch_phan_bo_uc.py`
- `backend/src/repository/nhan_vien_repository.py`
- `backend/src/repository/chuc_vu_repository.py`
- `backend/src/repository/phong_ban_repository.py`
- `backend/src/repository/cong_tac_repository.py`
- `backend/src/repository/cau_hinh_nghi_phep_repository.py`

### Backend -- Serialization (to_dict / isoformat)
- `backend/src/domain/models/check_in_out.py`
- `backend/src/domain/models/qr_config.py`
- `backend/src/app/usecases/nhan_vien/helpers.py`
- `backend/src/app/usecases/employee/get_employee_profile_uc.py`
- `backend/src/app/usecases/employee/get_employee_dashboard_uc.py`
- `backend/src/app/usecases/tai_lieu/tai_lieu_uc.py`

### Backend -- Migration
- New Alembic migration file for TIMESTAMP → TIMESTAMPTZ conversion

### Frontend -- New utility
- `frontend/src/lib/date-utils.ts` -- shared date formatting with timezone support

### Frontend -- Components using inline formatDate (replace with shared utility)
- `frontend/src/components/forms/nhan-vien/nhan-vien-detail-info.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-nghi-phep-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-tai-lieu-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-columns.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-reward-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-hop-dong-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-lich-su-chuc-vu-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-cong-tac-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-contract-tab.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-salary-tab.tsx`

### Frontend -- Components using date-fns directly
- `frontend/src/components/forms/nghi-phep/nghi-phep-dialogs.tsx`
- `frontend/src/components/forms/nghi-phep/nghi-phep-columns.tsx`
- `frontend/src/app/(employee)/employee/nghi-phep/page.tsx`
- `frontend/src/app/(admin)/bao-cao/page.tsx`
- `frontend/src/app/(admin)/luong/page.tsx`
- `frontend/src/app/(admin)/bao-cao/_components/export-all-dialog.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-form-dialog.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-toolbar.tsx`
- `frontend/src/components/forms/luong/luong-columns.tsx`
- `frontend/src/components/forms/luong/cau-hinh-luong-dialog.tsx`
- `frontend/src/components/forms/luong/tra-luong-detail-dialog.tsx`
- `frontend/src/components/forms/nhan-vien/nhan-vien-grid-view.tsx`

### Frontend -- Timezone-sensitive logic
- `frontend/src/hooks/employee/use-employee-check-in-out.ts` -- "today" check
- `frontend/src/app/(employee)/employee/my-qr/page.tsx` -- QR time display
- `frontend/src/components/layouts/authenticated-layout.tsx` -- live clock
