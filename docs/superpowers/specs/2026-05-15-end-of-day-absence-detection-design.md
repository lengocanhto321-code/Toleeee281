# End-of-Day Absence Detection Schedule

## Overview

Sau khi kết thúc ngày làm việc (23:59), hệ thống tự động phát hiện nhân viên vắng mặt và ghi nhận vào bảng `CheckInOut` với trạng thái phù hợp (có phép / không phép). Admin có thể xem danh sách vắng mặt qua API và UI.

## Model Changes

### CheckInOut — thêm cột

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `ghi_chu_vang` | `Text` | Yes | Ghi chú lý do vắng (vd: "Nghỉ phép năm (có phép)") |

### CheckInOut.trang_thai — thêm giá trị

| Giá trị | Ý nghĩa |
|---------|---------|
| `checked_in` | Đã check-in (hiện tại) |
| `checked_out` | Đã check-out (hiện tại) |
| `vang_mat_co_phep` | Vắng mặt, có đơn xin nghỉ đã duyệt |
| `vang_mat_khong_phep` | Vắng mặt, không có đơn xin nghỉ |

## Scheduled Job

### Job config

- **ID**: `auto_detect_absence`
- **Schedule**: Cron 23:59 theo `ngay_lam_viec` từ `LichChamCong` (chạy vào ngày làm việc)
- **Singleton**: Không chạy song song (APScheduler default)

### Logic (`_detect_absence_job`)

```
Input: today = date.today()

1. Load LichChamCong active config → skip if none
2. Check today is holiday (via NghiPhepService.get_holidays) → skip if holiday
3. Get all NV with trang_thai="dang_lam", deleted_at IS NULL
4. Get all CheckInOut records for today → set of present NV IDs
5. Get all DonXinNghi with trang_thai="da_duyet" where tu_ngay <= today <= den_ngay → map nv_id → don
6. For each NV NOT in present set:
   a. Skip if already has a CheckInOut with trang_thai LIKE 'vang_mat%' (idempotent)
   b. Check DonXinNghi map:
      - Has approved leave → create CheckInOut(trang_thai="vang_mat_co_phep", ghi_chu_vang="Nghỉ {loai_nghi} (có phép)")
       - No approved leave → create CheckInOut(trang_thai="vang_mat_khong_phep", ghi_chu_vang="Nghỉ không phép")
7. Commit all new records
8. Log: "Absence detection: {n} co phep, {m} khong phep, {total} total"
```

### Integration point

Thêm job vào `SchedulerService._register_jobs()` khi config active, cùng lúc với check-in/check-out QR jobs.

## Backend API

### GET `/api/v1/quan-ly/cham-cong/vang-mat`

**Query params:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `ngay` | `date` | No | Today | Ngày cần xem |
| `phong_ban_id` | `string` | No | All | Lọc theo phòng ban |
| `loai_vang` | `string` | No | All | `co_phep` / `khong_phep` / all |
| `page` | `int` | No | 1 | Trang |
| `page_size` | `int` | No | 20 | Số item/trang |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "nhan_vien_id": "...",
      "nhan_vien_ho_ten": "Nguyễn Văn A",
      "phong_ban": "Tổ Toán",
      "ngay": "2026-05-15",
      "trang_thai": "vang_mat_co_phep",
      "ghi_chu_vang": "Nghỉ phép năm (có phép)",
      "loai_nghi": "phep_nam",
      "created_at": "..."
    }
  ],
  "metadata": {
    "page": 1,
    "page_size": 20,
    "total": 5,
    "tong_vang": 5,
    "tong_co_phep": 3,
    "tong_khong_phep": 2
  }
}
```

### Components

- **Route**: `backend/src/api/routes/quan_ly/cham_cong.py` — thêm endpoint
- **Use Case**: `backend/src/app/usecases/cham_cong/get_danh_sach_vang_mat_uc.py`
- **Repository method**: `CheckInOutRepository.get_vang_mat_by_ngay(ngay, phong_ban_id, loai_vang, page, page_size)`

## Frontend UI

### Location

Tab "Vắng mặt" mới trong trang Chấm công admin (`/cham-cong`).

### Components

1. **Stats row**: 3 card — Tổng vắng mặt, Có phép (badge xanh), Không phép (badge đỏ)
2. **Filter bar**: Date picker, phòng ban select, loai_vang select (Tất cả/Có phép/Không phép)
3. **Table**: Cột — STT, Họ tên, Phòng ban, Trạng thái (badge), Lý do ghi chú, Ngày
4. **Pagination**: Standard shadcn pagination

### Styling

- Badge "Có phép": `bg-emerald-100 text-emerald-700`
- Badge "Không phép": `bg-red-100 text-red-700`
- Theo pattern shadcn/ui hiện tại của project

## Files to modify/create

### Backend — Modify
| File | Change |
|------|--------|
| `backend/src/domain/models/check_in_out.py` | Thêm cột `ghi_chu_vang` |
| `backend/src/service/scheduler_service.py` | Thêm job `auto_detect_absence` vào `_register_jobs` |
| `backend/src/repository/check_in_out_repository.py` | Thêm `get_vang_mat_by_ngay()` |
| `backend/src/api/routes/quan_ly/cham_cong.py` | Thêm endpoint GET `/vang-mat` |
| `backend/src/service/unit_of_work.py` | Đảm bảo DonXinNghi repo accessible |

### Backend — Create
| File | Purpose |
|------|---------|
| `backend/src/app/usecases/cham_cong/get_danh_sach_vang_mat_uc.py` | Use case lấy danh sách vắng mặt |
| Alembic migration | Thêm cột `ghi_chu_vang` |

### Frontend — Create
| File | Purpose |
|------|---------|
| `frontend/src/hooks/cham-cong/use-danh-sach-vang-mat.ts` | React query hook |
| `frontend/src/app/(admin)/cham-cong/_components/vang-mat-tab.tsx` | Tab UI chính |

### Frontend — Modify
| File | Change |
|------|---------|
| Page cham-cong | Thêm tab "Vắng mặt" |
