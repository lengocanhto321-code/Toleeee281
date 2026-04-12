# TÓM TẮT LOGIC TÍNH LƯƠNG - PHẦN BỔ SUNG

## 1. BẢNG HỆ SỐ LƯƠNG THEO NGẠCH/BẬC

### Bảng hệ số lương giáo viên phổ thông (áp dụng đến 30/6/2026)

| Hạng/Mã | Bậc 1 | Bậc 2 | Bậc 3 | Bậc 4 | Bậc 5 | Bậc 6 |
|----------|--------|--------|--------|--------|--------|--------|
| **Mầm non** |
| Hạng I (V.07.01.01) | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |
| Hạng II (V.07.01.02) | 1.86 | 2.13 | 2.40 | 2.67 | 2.94 | 3.21 |
| Hạng III (V.07.01.03) | 1.65 | 1.89 | 2.13 | 2.37 | 2.61 | 2.85 |
| **Tiểu học** |
| Hạng I (V.07.02.01) | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng II (V.07.02.02) | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |
| Hạng III (V.07.02.03) | 1.86 | 2.13 | 2.40 | 2.67 | 2.94 | 3.21 |
| **THCS** |
| Hạng I (V.07.03.01) | 4.00 | 4.48 | 4.96 | 5.44 | 5.92 | 6.40 |
| Hạng II (V.07.03.02) | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng III (V.07.03.03) | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |
| **THPT** |
| Hạng I (V.07.04.01) | 4.40 | 4.92 | 5.44 | 5.96 | 6.48 | 7.00 |
| Hạng II (V.07.04.02) | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng III (V.07.04.03) | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |

### Cấu trúc bảng SQL:
```sql
he_so_luong_danh_muc (
  id PK,
  ma_ngach VARCHAR(20),      -- V.07.03.02
  ten_ngach VARCHAR(100),     -- Giáo viên THCS hạng II
  cap_hoc ENUM,               -- mam_non, tieu_hoc, thcs, thpt
  bac INT,                    -- 1-6
  he_so DECIMAL(4,2),         -- 2.34
  ngay_ap_dung DATE,
  ghi_chu TEXT
)
```

---

## 2. CÁC LOẠI PHỤ CẤP ĐẦY ĐỦ

| STT | Tên phụ cấp | Công thức tính | Căn cứ |
|-----|--------------|----------------|--------|
| 1 | **Phụ cấp ưu đãi nghề** | (Hệ số lương + PC chức vụ + PC thâm niên VK) × Lương cơ sở × Tỷ lệ % | Luật Nhà giáo 2025 |
| 2 | **Phụ cấp thâm niên** | [5% + (năm - 1) × 1%] × (Hệ số lương + PC chức vụ + PC thâm niên VK) × Lương cơ sở | NĐ 77/2021 |
| 3 | **Phụ cấp khu vực/vùng** | Hệ số PC khu vực × Lương cơ sở | NĐ 73/2024 |
| 4 | **Phụ cấp chức vụ lãnh đạo** | Hệ số PC chức vụ × Lương cơ sở | Theo ngạch |
| 5 | **Phụ cấp thâm niên vượt khung** | Theo bảng quy định | NĐ 204 |

### Bảng mức Phụ cấp ưu đãi nghề:

| Cấp học/Đối tượng | Mức PC |
|---------------------|--------|
| Mầm non (vùng thường) | 40% |
| Mầm non (vùng đặc biệt) | 70-80% |
| Tiểu học | 35% |
| THCS, THPT (vùng thường) | 30% |
| THCS, THPT (vùng I, II dân tộc) | 35-50% |
| Trường chuyên/biệt | 50-70% |
| Giáo viên lớp chuyên/biệt | 70% |

---

## 3. THƯỞNG (ĐỊNH KỲ & ĐỘT XUẤT)

### Theo Nghị định 73/2024:

```
THƯỞNG ĐỊNH KỲ HÀNG NĂM:
├── Căn cứ: Xếp loại mức hoàn thành công việc
├── Mức xếp loại:
│   ├── Xuất sắc → Mức thưởng cơ sở × 2,4
│   ├── Hoàn thành tốt → Mức thưởng cơ sở × 1,0
│   └── Hoàn thành → Mức thưởng cơ sở × 0,5
├── Quỹ thưởng = 10% × Tổng quỹ lương (không gồm phụ cấp)
└── Thời điểm: Cuối năm học

THƯỞNG ĐỘT XUẤT:
├── Theo thành tích công tác đột xuất
├── Căn cứ quy chế nội bộ
└── Không giới hạn mức
```

### Cấu trúc bảng SQL:
```sql
thuong (
  id PK,
  nhan_vien_id FK,
  ky_luong_id FK,
  loai_thuong ENUM,           -- dinh_ky, dot_xuat
  tien_thuong DECIMAL(15,0),
  muc_xep_loai VARCHAR(50),  -- xuat_sac, tot, hoan_thanh
  ngay_tra DATE,
  ly_do TEXT,
  nguoi_chi_tra VARCHAR(100)
)
```

---

## 4. LƯƠNG THÁNG 13 / THƯỞNG TẾT

### Theo pháp luật hiện hành:
- ❌ **Không bắt buộc** theo luật
- ✅ Tùy thuộc vào **quy chế nội bộ** của trường
- Quỹ thưởng 10% đã có quy định nhưng chưa triển khai thực tế

### Đề xuất cho hệ thống:
```
CẤU HÌNH LINH HOẠT:
├── Bật/tắt tính năng thưởng Tết
├── Cấu hình mức thưởng:
│   ├── 0.5 tháng lương
│   ├── 1.0 tháng lương
│   └── Tùy quy định trường
├── Điều kiện nhận: Có thể tùy chỉnh
└── Thời điểm chi: Trước Tết Nguyên Đán
```

### Cấu trúc bảng SQL:
```sql
luong_thang_13 (
  id PK,
  nhan_vien_id FK,
  nam INT,
  tien_thuong DECIMAL(15,0),
  tien_thue_tncn DECIMAL(15,0),
  ngay_tra DATE,
  ghi_chu TEXT
)

cau_hinh_thuong_tet (
  id PK,
  nam INT,
  ty_le_thuong DECIMAL(3,2),  -- 0.5 = nửa tháng, 1.0 = 1 tháng
  bat_len BOOLEAN,
  ghi_chu TEXT
)
```

---

## 5. TẠM ĐÌNH CHỈ CÔNG TÁC

### Theo Điều 128 BLLĐ & Nghị định 112/2020:

```
TẠM ĐÌNH CHỈ:
├── Thời hạn: ≤15 ngày (đặc biệt ≤90 ngày)
├── Lương: 50% × (Lương bậc + PC chức vụ)
├── Sau xử lý:
│   ├── Bị kỷ luật → Giữ nguyên 50%
│   └── Không bị kỷ luật → Hoàn lại 50% còn lại
└── Điều kiện: Chưa xử lý kỷ luật trong thời gian này
```

### Cấu trúc bảng SQL:
```sql
tam_dinh_chi_cong_tac (
  id PK,
  nhan_vien_id FK,
  ngay_bat_dau DATE,
  ngay_ket_thuc DATE,
  ly_do TEXT,
  ty_le_huong_luong DECIMAL(5,2),  -- 50.00
  so_tien_tam_ung DECIMAL(15,0),
  so_tien_hoan_lai DECIMAL(15,0),
  co_bi_ky_luat BOOLEAN,            -- NULL=chưa, TRUE=Có, FALSE=Không
  quyet_dinh_so VARCHAR(50),
  ghi_chu TEXT
)
```

---

## 6. KỶ LUẬT VIÊN CHỨC

### Theo Nghị định 112/2020:

```
VIÊN CHỨC (không giữ chức vụ):
├── Khiển trách → Không ảnh hưởng lương
├── Cảnh cáo → Không ảnh hưởng lương
└── Buộc thôi việc → Thanh toán đến ngày nghỉ

VIÊN CHỨC GIỮ CHỨC VỤ:
├── Khiển trách → Không ảnh hưởng
├── Cảnh cáo → Không ảnh hưởng
├── Giáng chức → Giảm/không hưởng PC chức vụ
├── Cách chức → Không hưởng PC chức vụ
└── Buộc thôi việc → Thanh toán đến ngày nghỉ
```

### Cấu trúc bảng SQL:
```sql
ky_luat_vien_chuc (
  id PK,
  nhan_vien_id FK,
  hinh_thuc ENUM,                    -- khiem_trach, canh_cao, gianh_chuc, cach_chuc, buoc_thoi_viec
  ngay_quyet_dinh DATE,
  ngay_co_hieu_luc DATE,
  ly_do TEXT,
  muc_do_vi_pham VARCHAR(50),        -- it_nghiem_trong, nghiem_trong, rat_nghiem_trong
  trang_thai ENUM,                   -- dang_xu_ly, da_xu_ly, da_xoa
  co_hoan_tien BOOLEAN,              -- cho giáng/cách chức
  nguoi_ky VARCHAR(100),
  ghi_chu TEXT
)
```

---

## 7. GIÁO VIÊN THỬ VIỆC (TẬP SỰ)

```
THỬ VIỆC/TẬP SỰ:
├── Lương = 85% × Lương bậc 1 của ngạch
├── Thời gian: 12 tháng (thông thường)
├── BHXH: Đóng bắt buộc
├── Thuế TNCN: Tính như bình thường
├── Phụ cấp: Được hưởng ưu đãi, thâm niên (nếu có)
└── Xếp bậc khi kết thúc: Có thời gian công tác → kế thừa bậc
```

---

## 8. TÍNH LƯƠNG 2 GIAI ĐOẠN

### A. TRƯỚC 01/01/2026:
```
Lương = Hệ số lương × Lương cơ sở (2.340.000)
```

### B. TỪ 01/01/2026 (Luật Nhà giáo 2025):
```
Lương = Lương cơ sở × Hệ số lương × Hệ số đặc thù (1.15)

Ví dụ - Giáo viên THCS bậc 1 (hệ số 2.34):

TRƯỚC 2026:
  Lương = 2.34 × 2.340.000 = 5.475.600 đ
  PC ưu đãi = (2.34 + 0) × 2.340.000 × 30% = 1.642.680 đ

TỪ 01/01/2026:
  Lương = 2.34 × 2.340.000 × 1.15 = 6.297.000 đ
  PC ưu đãi = (2.34 × 1.15 + 0) × 2.340.000 × 30% = 1.888.080 đ
```

---

## TÓM TẮT CÁC BẢNG CẦN BỔ SUNG

| Bảng | Mục đích |
|------|----------|
| `he_so_luong_danh_muc` | Hệ số lương theo ngạch/bậc |
| `phu_cap_theo_cap_hoc` | Phụ cấp ưu đãi, khu vực theo cấp học |
| `cau_hinh_he_thong_luong` | Lương cơ sở, hệ số đặc thù |
| `tam_dinh_chi_cong_tac` | Tạm đình chỉ công tác |
| `ky_luat_vien_chuc` | Kỷ luật viên chức |
| `thuong` | Thưởng định kỳ, đột xuất |
| `luong_thang_13` | Lương tháng 13 |
| `cau_hinh_thuong_tet` | Cấu hình thưởng Tết |
