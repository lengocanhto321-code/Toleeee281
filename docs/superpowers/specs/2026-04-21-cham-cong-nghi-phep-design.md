# Design: Module Chấm công + Nghỉ phép Hoàn thiện

> Ngày: 2026-04-21
> Module: Chấm công & Nghỉ phép
> Trạng thái: Design approved - chờ implementation

---

## 1. QR Chấm công Cá nhân (Per-user QR)

### 1.1 Mục tiêu
Mỗi nhân viên có QR code cá nhân chứa `user_id`, không cần admin tạo QR hàng ngày.

### 1.2 API Design

**Endpoint:**
```
GET /api/v1/nv/cham-cong/my-qr
Permission: cham_cong:check_in
Response: { "qr_data": "base64_encoded_qr", "expires_at": "datetime" }
```

**QR Payload Structure:**
```python
{
    "v": 2,                      # Version
    "uid": "user_uuid",          # User ID từ JWT token
    "ngay": "2026-04-21",        # Ngày hiện tại
    "timestamp": 1713081600,     # Unix timestamp tạo QR
    "sig": "hmac_sha256..."      # Signature
}
```

**Logic Check-in với QR cá nhân:**
1. User quét QR (chứa user_id + ngày)
2. Server decode QR, extract `user_id` từ payload
3. Verify signature với SECRET_KEY
4. Check `ngay` matches today
5. Tìm `nhan_vien_id` từ `user_id` (qua TaiKhoan → NhanVien)
6. Tạo/Update CheckInOut record

### 1.3 Validation Rules

| Rule | Mô tả | Error Code |
|------|-------|------------|
| QR Expired | QR hết hạn (10 phút) | `qr_expired` |
| Invalid Signature | HMAC không hợp lệ | `invalid_qr` |
| Invalid Date | QR cho ngày khác hôm nay | `invalid_date` |
| Already Checked-in | Đã check-in hôm nay | `already_checked_in` |

---

## 2. Workflow Duyệt Nghỉ phép 2 Cấp

### 2.1 Trạng thái đơn

```
cho_duyet_cap_1 → da_duyet_cap_1 → cho_duyet_cap_2 → da_duyet_cap_2
                                              ↓
tu_choi ←─────────────────────────────── huy (chỉ khi chưa duyệt cap 1)
```

| Trạng thái | Mô tả | Ai thao tác |
|------------|-------|-------------|
| `cho_duyet_cap_1` | Chờ trưởng phòng duyệt | TO_TRUONG |
| `da_duyet_cap_1` | Đã qua cấp 1 | System auto |
| `cho_duyet_cap_2` | Chờ quản lý cấp cao duyệt | HIEU_TRUONG/HIEU_PHO/ADMIN |
| `da_duyet_cap_2` | Đã duyệt hoàn tất | System auto |
| `tu_choi` | Bị từ chối (any level) | TO_TRUONG / HIEU_TRUONG |
| `huy` | Người tạo hủy | NHAN_VIEN (chỉ khi status = cho_duyet_cap_1) |

### 2.2 Database Changes

**Update DonXinNghi model:**
```python
class DonXinNghi:
    # ... existing fields ...
    cap_duyet_hien_tai: int = 1           # 1 hoặc 2
    nguoi_duyet_cap_1_id: str | None      # FK → TaiKhoan
    nguoi_duyet_cap_2_id: str | None      # FK → TaiKhoan
    ngay_duyet_cap_1: datetime | None
    ngay_duyet_cap_2: datetime | None
    ghi_chu_duyet_cap_1: str | None       # Lý do duyệt/từ chối cấp 1
    ghi_chu_duyet_cap_2: str | None       # Lý do duyệt/từ chối cấp 2
```

### 2.3 API Endpoints

```
PUT /api/v1/nghi-phep/don/{id}/duyet-cap-1
Body: { "ghi_chu": "Đồng ý" }
Permission: nghi_phep:approve (TO_TRUONG, HIEU_TRUONG, HIEU_PHO, ADMIN)

PUT /api/v1/nghi-phep/don/{id}/duyet-cap-2
Body: { "ghi_chu": "Đồng ý" }
Permission: nghi_phep:approve (HIEU_TRUONG, HIEU_PHO, ADMIN)

PUT /api/v1/nghi-phep/don/{id}/tu-choi
Body: { "ghi_chu": "Lý do từ chối" }
Permission: nghi_phep:approve

DELETE /api/v1/nghi-phep/don/{id}
Permission: nghi_phep:delete (chỉ hủy khi status = cho_duyet_cap_1)
```

### 2.4 Permission Logic

| Role | Duyệt cấp 1 | Duyệt cấp 2 |
|------|-------------|-------------|
| TO_TRUONG | ✅ Xem & duyệt đơn của PB mình | ❌ |
| HIEU_TRUONG | ✅ | ✅ |
| HIEU_PHO | ✅ | ✅ |
| ADMIN | ✅ | ✅ |

**Rule:** TO_TRUONG chỉ duyệt được đơn của nhân viên thuộc phòng ban mình quản lý.

---

## 3. Cấu hình Số ngày phép + Khởi tạo Annual

### 3.1 Bảng CauHinhNghiPhep

```python
class CauHinhNghiPhep:
    id: str                      # UUID
    loai_nghi: str              # phep_nam, viec_rieng, nghi_om, ket_hon, mai_tang, thai_san
    ten_loai: str               # Tên hiển thị
    so_ngay_moi_nam: float      # Số ngày được phép/năm (vd: 12)
    so_ngay_toi_da_mot_lan: float  # Max ngày nghỉ 1 lần (vd: 5)
    can_giay_to: bool           # Cần giấy tờ đính kèm
    bat_buoc_ghi_ly_do: bool    # Phải nhập lý do
    trang_thai: bool            # Active/inactive
    ghi_chu: str | None
    created_at: datetime
    updated_at: datetime
```

**Seed data mặc định:**
| Loại | Mã | Ngày/năm | Max/lần | Cần giấy |
|------|-----|----------|---------|----------|
| Nghỉ phép năm | phep_nam | 12 | 5 | Không |
| Nghỉ việc riêng | viec_rieng | 3 | 3 | Không |
| Nghỉ ốm | nghi_om | 0 | 30 | Có |
| Nghỉ kết hôn | ket_hon | 3 | 3 | Có |
| Nghỉ ma táng | mai_tang | 3 | 3 | Có |
| Nghỉ thai sản | thai_san | 180 | 180 | Có |

### 3.2 API Endpoints

```
# Cấu hình
GET /api/v1/nghi-phep/cau-hinh
POST /api/v1/nghi-phep/cau-hinh
PUT /api/v1/nghi-phep/cau-hinh/{id}
DELETE /api/v1/nghi-phep/cau-hinh/{id}
Permission: nghi_phep:manage (ADMIN)

# Khởi tạo annual leave
POST /api/v1/nghi-phep/so-ngay-phep/init-annual
Body: { "nam": 2027 }
Permission: nghi_phep:manage (ADMIN)
```

### 3.3 Logic Init Annual

```python
async def init_annual_leave(nam: int):
    # 1. Lấy tất cả NV đang làm (trang_thai = dang_lam)
    # 2. Với mỗi NV:
    #    a. Check đã có SoNgayPhep cho năm chưa
    #    b. Nếu chưa: Tạo bản ghi mới
    #       - phep_nam_duoc_phep = get from CauHinhNghiPhep(phep_nam).so_ngay_moi_nam
    #    c. Nếu đã có: Skip (không overwrite)
    # 3. Return: { created: N, skipped: M }
```

---

## 4. Chấm công Tháng - Edit + Duyệt + Chốt

### 4.1 Trạng thái

| Trạng thái | Mô tả | Cho phép edit |
|------------|-------|---------------|
| `chua_chot` | Dữ liệu thô từ QR | ✅ Admin |
| `da_xac_nhan` | Admin xác nhận | ❌ |
| `da_duyet` | Quản lý duyệt | ❌ |
| `da_chot` | Đã chốt, lock | ❌ |

### 4.2 API Updates

```
# Edit chấm công (chỉ khi chua_chot)
PUT /api/v1/nghi-phep/cham-cong/thang/{id}
Body: {
  "so_ngay_co_mat": 22,
  "so_ngay_vang_co_phep": 1,
  "so_ngay_vang_khong_phep": 0,
  "so_ngay_cong_tac": 0,
  "ghi_chu": "..."
}
Permission: cham_cong:manage

# Xác nhận (chua_chot → da_xac_nhan)
POST /api/v1/nghi-phep/cham-cong/thang/{id}/xac-nhan
Permission: cham_cong:manage

# Duyệt (da_xac_nhan → da_duyet)
POST /api/v1/nghi-phep/cham-cong/thang/{id}/duyet
Permission: cham_cong:approve (TO_TRUONG, HIEU_TRUONG, ADMIN)

# Chốt (da_duyet → da_chot)
POST /api/v1/nghi-phep/cham-cong/thang/{id}/chot
Permission: cham_cong:approve (HIEU_TRUONG, ADMIN)

# Batch operations
POST /api/v1/nghi-phep/cham-cong/thang/batch-xac-nhan
POST /api/v1/nghi-phep/cham-cong/thang/batch-duyet
Body: { "ids": ["id1", "id2", ...] }
```

---

## 5. RBAC Permissions

```python
PERMISSION_CODES = {
    # ... existing ...
    "nghi_phep:approve": "Duyệt đơn nghỉ phép",
    "nghi_phep:manage": "Quản lý nghỉ phép (cấu hình)",
    "cham_cong:approve": "Duyệt chấm công",
}

ROLE_PERMISSIONS = {
    "ADMIN": [..., "nghi_phep:approve", "nghi_phep:manage", "cham_cong:approve"],
    "HIEU_TRUONG": [..., "nghi_phep:approve", "cham_cong:approve"],
    "HIEU_PHO": [..., "nghi_phep:approve", "cham_cong:approve"],
    "TO_TRUONG": [..., "nghi_phep:approve", "cham_cong:approve"],  # Limited to own dept
}
```

---

## 6. Frontend Components

| Component | Route | Description |
|-----------|-------|-------------|
| `nghi-phep/cau-hinh/page.tsx` | /admin/nghi-phep/cau-hinh | Cấu hình số ngày phép |
| `nghi-phep/duyet/page.tsx` | /admin/nghi-phep/duyet | Trang duyệt nghỉ phép 2 cấp |
| `cham-cong/edit-dialog.tsx` | - | Edit chấm công tháng |
| `cham-cong/approve-dialog.tsx` | - | Xác nhận/Duyệt/Chốt |
| `cham-cong/my-qr-page.tsx` | /employee/cham-cong/qr | Hiển thị QR cá nhân |

---

## 7. Acceptance Criteria

1. **QR Cá nhân:**
   - [ ] User có thể lấy QR cá nhân từ app mobile
   - [ ] QR chứa user_id, ngày, signature
   - [ ] Check-in/out works với QR này

2. **Nghỉ phép 2 cấp:**
   - [ ] Tạo đơn → status = cho_duyet_cap_1
   - [ ] TO_TRUONG duyệt cấp 1 → status = cho_duyet_cap_2
   - [ ] HIEU_TRUONG duyệt cấp 2 → status = da_duyet_cap_2
   - [ ] Từ chối ở bất kỳ cấp nào → status = tu_choi
   - [ ] Hủy đơn (chỉ khi chưa duyệt cấp 1)

3. **Cấu hình ngày phép:**
   - [ ] Admin có thể cấu hình số ngày phép theo loại
   - [ ] Init annual leave tạo đủ số ngày cho tất cả NV

4. **Chấm công:**
   - [ ] Edit được khi status = chua_chot
   - [ ] Xác nhận → Duyệt → Chốt workflow hoạt động
   - [ ] Sau khi chốt không sửa được

---

## 8. Tech Stack Changes

- **Backend:** Thêm model CauHinhNghiPhep, update DonXinNghi
- **Frontend:** Thêm pages và dialogs mới
- **Migration:** Alembic migrations cho schema changes