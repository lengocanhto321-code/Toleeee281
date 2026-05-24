# Auto QR Scheduling Design

## Overview

Thay vì admin phải thủ công tạo QR check-in/check-out mỗi ngày, hệ thống sẽ tự động lập lịch tạo QR dựa trên cấu hình. Scheduler chạy bên trong FastAPI process sử dụng APScheduler với PostgreSQL jobstore.

## Requirements

- Tự động tạo 2 QR riêng biệt mỗi ngày làm việc: QR check-in và QR check-out
- Ngày làm việc: Thứ 2 - Thứ 7, bỏ qua Chủ Nhật và ngày lễ Việt Nam
- Giờ tạo QR mặc định: check-in 07:00, check-out 17:00 (admin có thể cấu hình lại)
- GPS tùy chọn: admin bật/tắt và cấu hình vị trí mặc định
- Toàn công ty (không phân phòng ban)
- Idempotent: nếu QR đã tồn tại cho ngày đó thì skip

## Architecture

### Technology: APScheduler + SQLAlchemyJobStore

APScheduler chạy in-process cùng FastAPI, sử dụng PostgreSQL làm jobstore để:
- Persist jobs across server restarts
- Avoid duplicate job execution in multi-worker setups

### Data Model

#### Bảng `lich_cham_cong` (Attendance Schedule Config)

Singleton config — chỉ 1 dòng active tại 1 thời điểm.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String(32) PK | UUID |
| `gio_check_in` | Time NOT NULL | Giờ chạy job tạo QR check-in (default 07:00) |
| `gio_check_out` | Time NOT NULL | Giờ chạy job tạo QR check-out (default 17:00) |
| `ngay_lam_viec` | String NOT NULL | Các ngày làm việc trong tuần, comma-separated weekday numbers. `"1,2,3,4,5,6"` = T2-T7. Python `date.weekday()`: Mon=0, Sun=6 |
| `bat_gps` | Boolean default false | Có yêu cầu GPS khi check-in/out không |
| `kinh_do` | Float nullable | Vĩ độ vị trí mặc định |
| `vi_do` | Float nullable | Kinh độ vị trí mặc định |
| `ten_vi_tri` | String(100) nullable | Tên vị trí (VD: "Tòa nhà chính") |
| `ban_kinh_cho_phep` | Integer default 100 | Bán kính cho phép (mét) |
| `trang_thai` | String(20) default "active" | `"active"` / `"inactive"` |
| `created_by` | String(32) FK | Admin tạo/cập nhật |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

### Scheduler Service

File: `backend/src/service/scheduler_service.py`

Responsibilities:
- Initialize APScheduler with SQLAlchemyJobStore on app startup
- Read active config from `lich_cham_cong`, register 2 cron jobs
- Each job calls `QrAttendanceService` to generate QR
- Update jobs when config changes (remove old, add new)
- Graceful shutdown on app stop

### Job Execution Flow

```
Job runs at configured time (e.g., 07:00)
  → Is today a working day? (check ngay_lam_viec + Vietnamese holidays via NghiPhepService)
  → NO → log "Skipping: non-working day" → return
  → YES → Does a QR of this type (check_in/check_out) already exist for today?
  → YES → log "Skipping: QR already exists" → return
  → NO → Generate QR payload via QrAttendanceService.generate_qr_payload()
         → Save to qr_config table
         → Log success
```

### Vietnamese Holiday Integration

Reuse existing `NghiPhepService.get_holidays(year)` which covers:
- Fixed holidays: 1/1, 30/4, 1/5, 2/9
- Lunar holidays: Tết Nguyên Đán (7 days), Giỗ Tổ Hùng Vương (10/3 Âm lịch)

The scheduler will call this service to check if today is a holiday before generating QR.

### API Endpoints

All under prefix `/api/v1/admin/cham-cong/lich`, require `cham_cong:manage` permission.

#### GET `/` — Get current schedule config
Response: current active config or 404 if none exists.

#### POST `/` — Create or update schedule config
Request body:
```json
{
  "gio_check_in": "07:00",
  "gio_check_out": "17:00",
  "ngay_lam_viec": "0,1,2,3,4,5",
  "bat_gps": false,
  "vi_tri": {
    "lat": 10.762622,
    "lng": 106.660172,
    "name": "Tòa nhà chính",
    "radius": 100
  }
}
```

Upsert logic: deactivate any existing active config, create new active config, update scheduler jobs.

#### PATCH `/{id}/trang-thai` — Toggle active/inactive
Request body: `{ "trang_thai": "active" | "inactive" }`

When activating: register scheduler jobs.
When deactivating: remove scheduler jobs.

### Backend File Structure

```
backend/src/
├── domain/models/
│   └── lich_cham_cong.py              # New SQLAlchemy model
├── service/
│   └── scheduler_service.py           # New: APScheduler management
├── api/routes/quan_ly/
│   └── cham_cong.py                   # Add schedule config endpoints
├── api/schemas/
│   └── lich_cham_cong.py              # New: request/response schemas
└── app.py                             # Modify: integrate scheduler lifecycle
```

### Frontend

Add a "Cài đặt lịch chấm công" section to the admin cham-cong page or a dedicated sub-page:
- Time picker for check-in / check-out hours
- Checkbox group for working days
- Toggle switch for GPS + location input fields
- Toggle switch for enabling/disabling auto-generation
- Display current scheduler status (running/stopped)

### Error Handling

- Job failure: catch exceptions, log error, do not crash scheduler
- Server restart: APScheduler recovers jobs from PostgreSQL jobstore
- Duplicate QR: idempotent check before creation
- Missing config: jobs do nothing if no active config found

### Dependencies to Add

```
apscheduler~=3.10
```

No additional infrastructure needed (uses existing PostgreSQL).
