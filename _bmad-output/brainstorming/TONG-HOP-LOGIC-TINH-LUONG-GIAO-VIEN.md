# TỔNG HỢP LOGIC TÍNH LƯƠNG GIÁO VIÊN VIÊN CHỨC CÔNG LẬP

---

## PHẦN 1: LOGIC TÍNH LƯƠNG CƠ BẢN

### Bước 1 – Xác định cấu hình áp dụng cho tháng tính lương

```
1. Lấy lương cơ sở từ bảng cau_hinh_he_thong (áp dụng theo thời gian)
2. Lấy cấu hình lương từ bảng Luong có hieu_luc_tu <= ngày tính và hieu_luc_den >= ngày tính
3. Lấy hệ số lương từ bảng he_so_luong_danh_muc theo ma_ngach và bac
4. Lấy danh sách người phụ thuộc đang hiệu lực từ bảng nguoi_phu_thuoc
5. Xác định cấp học của giáo viên (qua ma_ngach hoặc don_vi)
```

### Bước 2 – Tính lương thực hưởng theo ngày công

```
1. Lấy bản ghi ChamCong đúng tháng/năm
2. Ngày được tính lương = (ngày làm thực tế + nghỉ phép + nghỉ ốm + công tác + lễ tết)
3. Hệ số ngày công = Ngày được tính / Ngày chuẩn (tối đa 1)
4. Lương thực hưởng = (Hệ số lương × Lương cơ sở) × Hệ số ngày công

LƯU Ý: Cần xử lý trường hợp nhân viên vào/nghỉ giữa tháng:
- Vào giữa tháng → Ngày chuẩn tính từ ngày vào
- Nghỉ giữa tháng → Ngày chuẩn tính đến ngày nghỉ
```

### Bước 3 – Tính các loại phụ cấp

```
1. PHỤ CẤP ƯU ĐÃI NGHỀ (Điều 23 Luật Nhà giáo 2025):
   Công thức: (Hệ số lương + PC chức vụ + PC thâm niên vượt khung) × Lương cơ sở × Tỷ lệ %
   Tỷ lệ theo cấp học:
   - Mầm non (vùng thường): 40%
   - Tiểu học: 35%
   - THCS, THPT (vùng thường): 30%
   - Vùng dân tộc, miền núi: 35-80%
   - Trường chuyên/biệt: 50-70%

2. PHỤ CẤP THÂM NIÊN (Nghị định 77/2021):
   Điều kiện: Đủ 5 năm (60 tháng) giảng dạy có đóng BHXH
   Công thức: [5% + (năm - 1) × 1%] × (Hệ số lương + PC chức vụ + PC thâm niên VK) × Lương cơ sở
   Ví dụ: 5 năm = 5%, 6 năm = 6%, 7 năm = 7%, ...

3. PHỤ CẤP KHU VỰC/VÙNG:
   Công thức: Hệ số PC khu vực × Lương cơ sở
   Phụ thuộc vào đơn vị công tác của giáo viên

4. PHỤ CẤP CHỨC VỤ LÃNH ĐẠO:
   Công thức: Hệ số PC chức vụ × Lương cơ sở
   (Hiệu trưởng, Phó hiệu trưởng, Tổ trưởng, ...)

5. PHỤ CẤP THÂM NIÊN VƯỢT KHUNG:
   Theo bảng quy định tại Nghị định 204

TẤT CẢ PHỤ CẤP ĐỀU ÁP DỤNG HỆ SỐ NGÀY CÔNG
```

### Bước 4 – Tính tổng thu nhập

```
Tổng thu nhập = Lương thực hưởng + Tổng phụ cấp + Thưởng + Thu nhập tăng thêm

Trong đó:
- Thưởng: Bao gồm thưởng định kỳ, thưởng đột xuất, thưởng Tết (nếu có)
- Thu nhập tăng thêm: Các khoản phụ thu từ TraLuong
```

### Bước 5 – Tính bảo hiểm

```
Căn cứ đóng = Lương cơ bản (không nhân ngày công)

BHXH = Căn cứ × 8%
BHYT = Căn cứ × 1.5%
BHTN = Căn cứ × 1%

LƯU Ý:
- Có giới hạn trần căn cứ đóng BH theo quy định
- Giáo viên thử việc vẫn đóng BHXH bắt buộc
```

### Bước 6 – Tính thuế TNCN

```
Thu nhập tính thuế = Tổng thu nhập – Tổng bảo hiểm – Giảm trừ bản thân – (Giảm trừ người phụ thuộc × số người)

Trong đó:
- Giảm trừ bản thân: 11 triệu đồng/tháng
- Giảm trừ người phụ thuộc: 4.4 triệu đồng/tháng/người

Tra biểu thuế lũy tiến từng phần vào bảng cấu hình
Làm tròn thuế đến đồng
```

### Bước 7 – Tính thực nhận

```
Thực nhận = Tổng thu nhập – (BHXH + BHYT + BHTN + Thuế TNCN + Khấu trừ khác)

Trong đó:
- Khấu trừ khác: Bồi thường thiệt hại (Điều 102, 129 BLLĐ)
  + Làm hư hỏng thiết bị, tài sản
  + Làm mất tài sản
  + Tiêu hao vật tư vượt định mức
```

### Bước 8 – Lưu kết quả

```
Lưu vào bảng TraLuong:
- Lương cơ bản, lương thực hưởng
- Từng loại phụ cấp
- Từng loại khấu trừ
- Tổng thu nhập, thực nhận
- Lưu luong_id và cham_cong_id để truy xuất nguồn gốc
```

---

## PHẦN 2: CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 2.1. NHÂN VIÊN VÀO/NGHỈ GIỮA THÁNG

```
VÀO GIỮA THÁNG:
- Ngày chuẩn = Số ngày trong tháng tính từ ngày vào
- Ví dụ: Vào ngày 20/4 → Ngày chuẩn = 30 - 20 + 1 = 11 ngày
- Lương = Lương tháng × (Ngày làm thực tế / Ngày chuẩn)

NGHỈ GIỮA THÁNG:
- Ngày chuẩn = Số ngày trong tháng tính đến ngày nghỉ
- Ví dụ: Nghỉ ngày 15/4 → Ngày chuẩn = 15 ngày
- Lương = Lương tháng × (Ngày làm thực tế / Ngày chuẩn)

THANH TOÁN CUỐI CÙNG KHI NGHỈ VIỆC:
- Lương tính đến ngày nghỉ việc thực tế
- Các khoản còn phải trả: Lương tháng cuối, ngày nghỉ phép chưa sử dụng (nếu có)
- Giải quyết: BHXH một lần (nếu có đủ điều kiện)
```

### 2.2. TẠM ĐÌNH CHỈ CÔNG TÁC (Điều 128 BLLĐ)

```
ĐIỀU KIỆN: Vụ việc vi phạm có tình tiết phức tạp

THỜI HẠN:
- Tối đa 15 ngày
- Trường hợp đặc biệt: Tối đa 90 ngày

LƯƠNG TRONG THỜI GIAN TẠM ĐÌNH CHỈ:
- Được tạm ứng 50% tiền lương trước khi bị đình chỉ

SAU KHI XỬ LÝ:
├── Nếu bị kỷ luật:
│   └── Không phải trả lại số tiền lương đã tạm ứng
└── Nếu không bị kỷ luật:
    └── Được trả đủ tiền lương cho thời gian bị đình chỉ

CHƯA XỬ LÝ KỶ LUẬT TRONG THỜI GIAN TẠM ĐÌNH CHỈ:
- Cán bộ, công chức, viên chức đang trong thời gian tạm giữ, tạm giam
- Cấp có thẩm quyền phải ra quyết định xử lý khi hết thời hạn
```

### 2.3. KỶ LUẬT VIÊN CHỨC (Nghị định 112/2020/NĐ-CP)

```
VIÊN CHỨC KHÔNG GIỮ CHỨC VỤ LÃNH ĐẠO:
┌─────────────────────┬────────────────────────────────────────────┐
│ Hình thức            │ Ảnh hưởng lương                          │
├─────────────────────┼────────────────────────────────────────────┤
│ Khiển trách         │ Không ảnh hưởng                           │
│ Cảnh cáo            │ Không ảnh hưởng                           │
│ Buộc thôi việc      │ Thanh toán đến ngày nghỉ việc             │
└─────────────────────┴────────────────────────────────────────────┘

VIÊN CHỨC GIỮ CHỨC VỤ LÃNH ĐẠO:
┌─────────────────────┬────────────────────────────────────────────┐
│ Hình thức            │ Ảnh hưởng lương                          │
├─────────────────────┼────────────────────────────────────────────┤
│ Khiển trách         │ Không ảnh hưởng                           │
│ Cảnh cáo            │ Không ảnh hưởng                           │
│ Giáng chức          │ Giảm/không hưởng PC chức vụ từ ngày giáng │
│ Cách chức           │ Không hưởng PC chức vụ                    │
│ Buộc thôi việc      │ Thanh toán đến ngày nghỉ việc             │
└─────────────────────┴────────────────────────────────────────────┘

⚠️ LƯU Ý QUAN TRỌNG:
- Không có hình thức "Hạ bậc lương" đối với viên chức
- Không được "Cắt lương" thay việc kỷ luật (Điều 127 BLLĐ)

THỜI GIAN CHƯA ĐƯỢC XỬ LÝ KỶ LUẬT:
- Đang nghỉ ốm đau, điều dưỡng
- Đang nghỉ việc riêng được cấp có thẩm quyền đồng ý
- Đang bị tạm giữ, tạm giam
- Nữ giới đang trong thời gian nghỉ thai sản
- Nữ giới có con dưới 12 tháng tuổi
```

### 2.4. THỬ VIỆC/TẬP SỰ

```
ĐIỀU KIỆN: Người mới được tuyển dụng viên chức

LƯƠNG THỬ VIỆC:
- Mức lương = 85% × Lương bậc 1 của ngạch được tuyển dụng
- Công thức: 85% × Hệ số bậc 1 × Lương cơ sở

THỜI GIAN TẬP SỰ:
- Thông thường: 12 tháng
- Có thể miễn tập sự nếu đủ điều kiện theo Điều 21 Nghị định 115/2020

BHXH:
- Đóng bắt buộc theo quy định viên chức

THUẾ TNCN:
- Tính như bình thường

PHỤ CẤP:
- Được hưởng phụ cấp ưu đãi nghề, phụ cấp khu vực (nếu có)

XẾP BẬC KHI KẾT THÚC TẬP SỰ:
- Nếu có thời gian công tác trước (có đóng BHXH, chưa nhận BHXH một lần):
  → Được kế thừa bậc lương theo số năm công tác
- Nếu mới ra trường:
  → Xếp bậc 1 của ngạch được tuyển dụng
```

### 2.5. THAY ĐỔI LƯƠNG GIỮA THÁNG

```
KHI CÓ THAY ĐỔI LƯƠNG TRONG THÁNG:
- Ngày thay đổi < 15 của tháng → Tính từ tháng đó
- Ngày thay đổi >= 15 của tháng → Tính từ tháng sau

VÍ DỤ: Lương thay đổi ngày 20/4:
- Áp dụng từ tháng 5

XỬ LÝ KHI THAY ĐỔI LƯƠNG TRONG THÁNG:
- Nếu thay đổi có hiệu lực từ ngày 01 của tháng:
  → Tính lương theo công thức mới cho cả tháng
- Nếu thay đổi có hiệu lực giữa tháng (thực tế có xảy ra):
  → Tính chia theo ngày: ngày trước (công thức cũ), ngày sau (công thức mới)
```

---

## PHẦN 3: THƯỞNG VÀ LƯƠNG THÁNG 13

### 3.1. THƯỞNG ĐỊNH KỲ HÀNG NĂM (Nghị định 73/2024)

```
CĂN CỨ: Xếp loại mức hoàn thành công việc

MỨC THƯỞNG THEO XẾP LOẠI:
┌─────────────────────┬──────────────────────────┐
│ Mức xếp loại        │ Tiền thưởng              │
├─────────────────────┼──────────────────────────┤
│ Xuất sắc            │ Mức thưởng cơ sở × 2.4   │
│ Hoàn thành tốt      │ Mức thưởng cơ sở × 1.0   │
│ Hoàn thành          │ Mức thưởng cơ sở × 0.5   │
│ Không hoàn thành    │ Không được thưởng        │
└─────────────────────┴──────────────────────────┘

QUỸ THƯỞNG:
- = 10% × Tổng quỹ lương năm (không gồm phụ cấp)
- Phân bổ theo xếp loại của từng cá nhân

THỜI ĐIỂM: Thường cuối năm học (tháng 5-6)
```

### 3.2. THƯỞNG ĐỘT XUẤT

```
ĐIỀU KIỆN: Thành tích công tác đột xuất
CĂN CỨ: Quy chế nội bộ của trường
MỨC: Không giới hạn (tùy quy chế)
```

### 3.3. THƯỞNG TẾT / LƯƠNG THÁNG 13

```
THEO PHÁP LUẬT HIỆN HÀNH:
- ❌ Không bắt buộc
- ✅ Tùy thuộc quy chế chi tiêu nội bộ của trường

ĐỀ XUẤT CẤU HÌNH HỆ THỐNG:
- Bật/tắt tính năng thưởng Tết
- Cấu hình mức thưởng:
  ├── 0.5 tháng lương
  ├── 1.0 tháng lương
  └── Tùy quy định trường
- Điều kiện nhận: Có thể tùy chỉnh
- Thời điểm chi: Trước Tết Nguyên Đán

LƯƠNG THÁNG 13 = Hệ số bậc 1 × Lương cơ sở (hoặc lương tháng 12, tùy quy chế)
```

---

## PHẦN 4: TÍNH LƯƠNG 2 GIAI ĐOẠN

### 4.1. GIAI ĐOẠN TRƯỚC 01/01/2026

```
CÔNG THỨC:
Tiền lương = Hệ số lương × Lương cơ sở (2.340.000 đ)

Ví dụ - Giáo viên THCS hạng II, bậc 3 (hệ số 3.00):
  Lương = 3.00 × 2.340.000 = 7.020.000 đ
  PC ưu đãi = (3.00 + 0) × 2.340.000 × 30% = 2.106.000 đ
```

### 4.2. GIAI ĐOẠN TỪ 01/01/2026 (Luật Nhà giáo 2025)

```
CÔNG THỨC MỚI:
Tiền lương = Lương cơ sở × Hệ số lương × Hệ số đặc thù (1.15)

LƯU Ý:
- Hệ số đặc thù 1.15 áp dụng cho tất cả giáo viên
- Hệ số đặc thù KHÔNG dùng để tính phụ cấp
- Phụ cấp vẫn tính theo công thức cũ

Ví dụ - Giáo viên THCS hạng II, bậc 3 (hệ số 3.00):

TRƯỚC 01/01/2026:
  Lương = 3.00 × 2.340.000 = 7.020.000 đ
  PC ưu đãi = (3.00 + 0) × 2.340.000 × 30% = 2.106.000 đ

TỪ 01/01/2026:
  Lương = 3.00 × 2.340.000 × 1.15 = 8.073.000 đ
  PC ưu đãi = (3.00 + 0) × 2.340.000 × 30% = 2.106.000 đ (giữ nguyên)
```

### 4.3. XỬ LÝ TRONG HỆ THỐNG

```
LOGIC XÁC ĐỊNH CÔNG THỨC:
1. Xác định ngày tính lương
2. Nếu ngày < 01/01/2026:
   └── Áp dụng công thức cũ
3. Nếu ngày >= 01/01/2026:
   └── Áp dụng công thức mới
4. Nếu thay đổi lương trong tháng (thực tế hiếm xảy ra):
   └── Chia theo ngày: trước 01/01 (cũ), từ 01/01 (mới)

DỰ KIẾN THAY ĐỔI TIẾP THEO:
- Từ 01/7/2026: Dự kiến tăng lương cơ sở lên 2.530.000 đ
```

---

## PHẦN 5: CẤU TRÚC BẢNG DỮ LIỆU

### 5.1. BẢNG HIỆN CÓ (CẦN BỔ SUNG)

```sql
-- Bảng hệ số lương theo ngạch/bậc
he_so_luong_danh_muc (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  ma_ngach             VARCHAR(20),      -- V.07.03.02
  ten_ngach            VARCHAR(100),     -- Giáo viên THCS hạng II
  cap_hoc              ENUM,             -- mam_non, tieu_hoc, thcs, thpt
  bac                  INT,              -- 1-6
  he_so                DECIMAL(4,2),     -- 2.34
  ngay_ap_dung         DATE,
  ghi_chu              TEXT
);

-- Bảng cấu hình phụ cấp theo cấp học
phu_cap_theo_cap_hoc (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  cap_hoc              ENUM,
  ty_le_pc_uu_dai      DECIMAL(5,2),    -- 30.00 = 30%
  he_so_khu_vuc         DECIMAL(4,2),    -- 0.1, 0.2, ...
  ngay_ap_dung         DATE,
  ghi_chu              TEXT
);

-- Bảng cấu hình hệ thống lương
cau_hinh_he_thong_luong (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  ngay_ap_dung         DATE,
  luong_co_so          DECIMAL(15,0),   -- 2340000
  he_so_dac_thu        DECIMAL(4,2),    -- 1.15 từ 2026
  ty_le_quy_thuong     DECIMAL(5,2),    -- 10.00 = 10%
  trang_thai           ENUM             -- dang_ap_dung, het_han
);

-- Bảng tạm đình chỉ công tác
tam_dinh_chi_cong_tac (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nhan_vien_id         INT FK,
  ngay_bat_dau         DATE,
  ngay_ket_thuc        DATE,
  ly_do                TEXT,
  ty_le_huong_luong    DECIMAL(5,2),   -- 50.00 = 50%
  so_tien_tam_ung      DECIMAL(15,0),
  so_tien_hoan_lai     DECIMAL(15,0),
  co_bi_ky_luat        BOOLEAN,         -- NULL=chưa, TRUE=Có, FALSE=Không
  quyet_dinh_so        VARCHAR(50),
  nguoi_tao            INT,
  ngay_tao             DATETIME,
  ghi_chu              TEXT
);

-- Bảng kỷ luật viên chức
ky_luat_vien_chuc (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nhan_vien_id         INT FK,
  hinh_thuc            ENUM,            -- khiem_trach, canh_cao, gianh_chuc, cach_chuc, buoc_thoi_viec
  ngay_quyet_dinh      DATE,
  ngay_co_hieu_luc      DATE,
  ly_do                 TEXT,
  muc_do_vi_pham        VARCHAR(50),     -- it_nghiem_trong, nghiem_trong, rat_nghiem_trong, dac_biet_nghiem_trong
  trang_thai            ENUM,          -- dang_xu_ly, da_xu_ly, da_xoa
  co_hoan_tien          BOOLEAN,        -- cho giáng/cách chức
  nguoi_ky              VARCHAR(100),
  nguoi_tao            INT,
  ngay_tao             DATETIME,
  ghi_chu              TEXT
);

-- Bảng thưởng
thuong (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nhan_vien_id         INT FK,
  ky_luong_id          INT FK,
  loai_thuong          ENUM,            -- dinh_ky, dot_xuat, tet
  tien_thuong          DECIMAL(15,0),
  muc_xep_loai         VARCHAR(50),     -- xuat_sac, tot, hoan_thanh
  ngay_tra             DATE,
  ly_do                TEXT,
  nguoi_chi_tra        VARCHAR(100),
  nguoi_tao            INT,
  ngay_tao             DATETIME
);

-- Bảng cấu hình thưởng Tết
cau_hinh_thuong_tet (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nam                   INT,
  ty_le_thuong         DECIMAL(4,2),   -- 0.5 = nửa tháng, 1.0 = 1 tháng
  bat_len              BOOLEAN,
  ghi_chu              TEXT
);

-- Bảng lương tháng 13
luong_thang_13 (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nhan_vien_id         INT FK,
  nam                   INT,
  tien_thuong          DECIMAL(15,0),
  tien_thue_tncn       DECIMAL(15,0),
  ngay_tra              DATE,
  ghi_chu              TEXT
);

-- Bảng TraLuong - Bổ sung thêm trường
tra_luong (
  -- Các trường hiện có --
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  nhan_vien_id         INT FK,
  ky_luong_id          INT FK,
  thang                 INT,
  nam                   INT,
  
  -- Bổ sung thêm --
  ngay_vao              DATE,           -- Ngày vào (nếu vào giữa tháng)
  ngay_nghi             DATE,           -- Ngày nghỉ (nếu nghỉ giữa tháng)
  co_tam_dinh_chi       BOOLEAN,        -- Có bị tạm đình chỉ không
  tam_dinh_chi_id       INT FK,         -- Liên kết bảng tạm đình chỉ
  co_ky_luat            BOOLEAN,        -- Có bị kỷ luật không
  ky_luat_id            INT FK,          -- Liên kết bảng kỷ luật
  he_so_dac_thu_ap_dung DECIMAL(4,2),   -- Hệ số đặc thù áp dụng (1.0 hoặc 1.15)
  loai_cong_thuc        ENUM            -- cu, moi - Công thức cũ hay mới
);
```

---

## PHẦN 6: API ENDPOINTS

### 6.1. API HIỆN CÓ (Giữ nguyên)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/luong/cau-hinh/{nhan_vien_id}` | Lấy cấu hình lương hiện tại |
| POST | `/api/luong/cau-hinh` | Tạo/cập nhật cấu hình lương |
| POST | `/api/luong/preview` | Tính lương thử |
| POST | `/api/luong/chay-loat` | Chạy lương hàng loạt |
| PUT | `/api/luong/dieu-chinh/{tra_luong_id}` | Điều chỉnh thủ công |
| POST | `/api/luong/duyet/{ky_luong_id}` | Duyệt phiếu lương |
| GET | `/api/luong/phieu/{nhan_vien_id}` | Lấy phiếu lương chi tiết |
| GET | `/api/luong/bang-luong` | Bảng lương tổng hợp |
| GET | `/api/luong/he-so-danh-muc` | Tra cứu hệ số lương |
| GET | `/api/luong/lich-su/{nhan_vien_id}` | Lịch sử lương |

### 6.2. API MỚI CẦN BỔ SUNG

```sql
-- Tạm đình chỉ công tác
POST   /api/luong/tam-dinh-chi              -- Tạo tạm đình chỉ
GET    /api/luong/tam-dinh-chi/{nhan_vien_id} -- Lấy thông tin tạm đình chỉ
PUT    /api/luong/tam-dinh-chi/{id}         -- Cập nhật tạm đình chỉ
POST   /api/luong/tam-dinh-chi/{id}/ket-thuc -- Kết thúc tạm đình chỉ

-- Kỷ luật viên chức
POST   /api/luong/ky-luat                   -- Tạo kỷ luật
GET    /api/luong/ky-luat/{nhan_vien_id}    -- Lấy danh sách kỷ luật
PUT    /api/luong/ky-luat/{id}              -- Cập nhật kỷ luật
DELETE /api/luong/ky-luat/{id}              -- Xóa kỷ luật (xóa kỷ)

-- Thưởng
POST   /api/luong/thuong                     -- Tạo thưởng
GET    /api/luong/thuong/{nhan_vien_id}     -- Lấy danh sách thưởng
POST   /api/luong/thuong/dinh-ky            -- Tạo thưởng định kỳ hàng loạt
POST   /api/luong/thuong/tet                -- Tạo thưởng Tết hàng loạt

-- Cấu hình
GET    /api/luong/cau-hinh-he-so            -- Lấy hệ số lương danh mục
POST   /api/luong/cau-hinh-he-so            -- Thêm/sửa hệ số lương
GET    /api/luong/cau-hinh-phu-cap          -- Lấy cấu hình phụ cấp
POST   /api/luong/cau-hinh-phu-cap          -- Thêm/sửa cấu hình phụ cấp
GET    /api/luong/cau-hinh-thuong-tet       -- Lấy cấu hình thưởng Tết
PUT    /api/luong/cau-hinh-thuong-tet       -- Cập nhật cấu hình thưởng Tết

-- Báo cáo
GET    /api/luong/bao-cao/ky-luat           -- Báo cáo kỷ luật
GET    /api/luong/bao-cao/thuong             -- Báo cáo thưởng
GET    /api/luong/bao-cao/tong-hop          -- Báo cáo tổng hợp lương
```

---

## PHẦN 7: QUY TRÌNH XỬ LÝ KỶ LUẬT

```
1. PHÁT HIỆN VI PHẠM
   └── Ghi nhận hành vi vi phạm, thu thập chứng cứ

2. KIỂM TRA ĐIỀU KIỆN
   └── Kiểm tra có thuộc trường hợp chưa được xử lý kỷ luật không?
       ├── Đang nghỉ ốm? → Chờ
       ├── Đang tạm giữ/giam? → Chờ
       ├── Đang thai sản? → Chờ
       └── Nếu không thuộc các trường hợp trên → Tiếp tục

3. QUYẾT ĐỊNH HÌNH THỨC
   └── Xác định mức độ vi phạm và hình thức kỷ luật phù hợp

4. RA QUYẾT ĐỊNH
   └── Lập hồ sơ, ký quyết định

5. CẬP NHẬT HỆ THỐNG
   └── Ghi nhận vào bảng ky_luat_vien_chuc
   └── Tính toán ảnh hưởng lương (nếu có)

6. THEO DÕI
   └── Theo dõi thời hạn xóa kỷ luật
       ├── Khiển trách → 03 tháng
       ├── Cảnh cáo → 06 tháng
       └── Tự động xóa kỷ luật khi hết thời hạn
```

---

## PHẦN 8: CHECKLIST TRIỂN KHAI

```
□ Bảng he_so_luong_danh_muc - Nhập dữ liệu hệ số lương
□ Bảng phu_cap_theo_cap_hoc - Cấu hình phụ cấp theo cấp học
□ Bảng cau_hinh_he_thong_luong - Cấu hình lương cơ sở
□ Cập nhật logic tính lương xử lý 2 giai đoạn
□ Bảng tam_dinh_chi_cong_tac - Xử lý tạm đình chỉ
□ Bảng ky_luat_vien_chuc - Xử lý kỷ luật
□ Bảng thuong - Xử lý thưởng
□ Bảng cau_hinh_thuong_tet - Cấu hình thưởng Tết
□ API mới cho các chức năng bổ sung
□ Xử lý nhân viên vào/nghỉ giữa tháng
□ Xử lý giáo viên thử việc
□ Báo cáo kỷ luật, thưởng
□ Kiểm thử với dữ liệu thực tế
```

---

## PHỤ LỤC: BẢNG HỆ SỐ LƯƠNG THAM KHẢO

### Giáo viên Mầm non (V.07.01.xx)

| Hạng | Bậc 1 | Bậc 2 | Bậc 3 | Bậc 4 | Bậc 5 | Bậc 6 |
|------|--------|--------|--------|--------|--------|--------|
| Hạng I | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |
| Hạng II | 1.86 | 2.13 | 2.40 | 2.67 | 2.94 | 3.21 |
| Hạng III | 1.65 | 1.89 | 2.13 | 2.37 | 2.61 | 2.85 |

### Giáo viên Tiểu học (V.07.02.xx)

| Hạng | Bậc 1 | Bậc 2 | Bậc 3 | Bậc 4 | Bậc 5 | Bậc 6 |
|------|--------|--------|--------|--------|--------|--------|
| Hạng I | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng II | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |
| Hạng III | 1.86 | 2.13 | 2.40 | 2.67 | 2.94 | 3.21 |

### Giáo viên THCS (V.07.03.xx)

| Hạng | Bậc 1 | Bậc 2 | Bậc 3 | Bậc 4 | Bậc 5 | Bậc 6 |
|------|--------|--------|--------|--------|--------|--------|
| Hạng I | 4.00 | 4.48 | 4.96 | 5.44 | 5.92 | 6.40 |
| Hạng II | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng III | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |

### Giáo viên THPT (V.07.04.xx)

| Hạng | Bậc 1 | Bậc 2 | Bậc 3 | Bậc 4 | Bậc 5 | Bậc 6 |
|------|--------|--------|--------|--------|--------|--------|
| Hạng I | 4.40 | 4.92 | 5.44 | 5.96 | 6.48 | 7.00 |
| Hạng II | 2.34 | 2.67 | 3.00 | 3.33 | 3.66 | 3.99 |
| Hạng III | 2.10 | 2.41 | 2.72 | 3.03 | 3.34 | 3.65 |

---

## CĂN CỨ PHÁP LÝ

- Bộ luật Lao động 2019 (Điều 102, 117-128)
- Luật Viên chức 2010, Luật sửa đổi 2019
- Luật Nhà giáo 2025 (số 73/2025/QH15) - có hiệu lực 01/01/2026
- Nghị định 112/2020/NĐ-CP - Xử lý kỷ luật cán bộ, công chức, viên chức
- Nghị định 73/2024/NĐ-CP - Tiền lương cơ sở
- Nghị định 77/2021/NĐ-CP - Phụ cấp thâm niên nhà giáo
- Nghị định 115/2020/NĐ-CP - Tuyển dụng viên chức
- Nghị quyết 159/2024/QH15 - Chưa tăng lương năm 2025
- Thông tư 01, 02, 03/2021/TT-BGDĐT - Bảng lương giáo viên
- Nghị định 12/2022/NĐ-CP - Xử phạt vi phạm lao động

---

*Document được tạo từ buổi brainstorming ngày 2026-04-12*
