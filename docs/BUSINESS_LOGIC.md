# Business Logic Documentation

> Document này mô tả chi tiết nghiệp vụ, ràng buộc, và luồng xử lý của hệ thống HR Management.

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Danh sách Use Cases](#2-danh-sách-use-cases)
3. [Module Nhân viên](#3-module-nhân-viên)
4. [Module Phòng ban](#4-module-phòng-ban)
5. [Module Chức vụ](#5-module-chức-vụ)
6. [Module Phân công Công tác](#6-module-phân-công-công-tác)
7. [Module Hợp đồng Lao động](#7-module-hợp-đồng-lao-động)
8. [Module Nghỉ phép](#8-module-nghỉ-phép)
9. [Module Chấm công](#9-module-chấm-công)
10. [Module Lương](#10-module-lương)
11. [Module Khen thưởng/Kỷ luật](#11-module-khen-thưởngkỷ-luật)
12. [Module Người thân](#12-module-người-thân)
13. [Module Bằng cấp/Chứng chỉ](#13-module-bằng-cấpchứng-chỉ)
14. [Module Authentication & RBAC](#14-module-authentication--rbac)
15. [Ràng buộc toàn vẹn dữ liệu](#15-ràng-buộc-toàn-vẹn-dữ-liệu)

---

## 1. Tổng quan hệ thống

### 1.1 Giới thiệu

Hệ thống HR Management được thiết kế để quản lý nhân sự cho **Trường THPT Thăng Long**, bao gồm:
- Quản lý nhân viên (giáo viên, cán bộ quản lý, nhân viên)
- Quản lý tổ chức (phòng ban, chức vụ)
- Quản lý công tác (phân công, điều chuyển)
- Quản lý nghỉ phép và chấm công
- Quản lý lương

### 1.2 Các tác nhân (Actors)

| Mã | Tên | Mô tả |
|----|-----|-------|
| ADMIN | Quản trị viên | Người có toàn quyền quản lý hệ thống |
| HIEU_TRUONG | Hiệu trưởng | Người có quyền quản lý cao nhất sau Admin |
| HIEU_PHO | Phó hiệu trưởng | Hỗ trợ Hiệu trưởng, có quyền quản lý nhân sự |
| TO_TRUONG | Trưởng phòng/Tổ trưởng | Quản lý phòng ban hoặc tổ chuyên môn |
| GIAO_VIEN | Giáo viên | Người được giảng dạy, có quyền xem và tạo đơn |
| NHAN_VIEN | Nhân viên | Nhân viên hỗ trợ (bảo vệ, vệ sinh...) |

### 1.3 Mối quan hệ chính

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TỔ CHỨC TRƯỜNG                                │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │                      BAN GIÁM HIỆU                               │ │
│   │   (Hiệu trưởng + Phó Hiệu trưởng)                               │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                   │                                     │
│              ┌────────────────────┼────────────────────┐              │
│              ▼                    ▼                    ▼              │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐    │
│   │  TỔ CHUYÊN MÔN  │   │  HÀNH CHÍNH     │   │   PHỤC VỤ      │    │
│   │  (Các tổ bộ môn)│   │  (Văn phòng...) │   │ (Bảo vệ, VS)   │    │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘    │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │                        NHÂN VIÊN                                 │ │
│   │   ├── Giáo viên (loai_nhan_vien = giao_vien)                   │ │
│   │   ├── Cán bộ (loai_nhan_vien = can_bo)                         │ │
│   │   └── Nhân viên (loai_nhan_vien = nhan_vien)                   │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Danh sách Use Cases

> Phần này liệt kê tất cả các Use Case trong hệ thống, được tổ chức theo module.

### 2.1 Module Nhân viên (`nhan_vien/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `CreateNhanVienUseCase` | `create_nhan_vien_uc.py` | Tạo nhân viên mới. Validate email/CCCD uniqueness, tự động tạo mã nhân viên (NV-xxxxxx), tự động tạo TaiKhoan đăng nhập (username = ma_nhan_vien, password = so_dien_thoai, vai_tro = nhan_vien), tạo CongTac ban đầu, tạo HopDong nếu có, tạo audit log |
| `GetNhanVienUseCase` | `get_nhan_vien_uc.py` | Lấy danh sách nhân viên (phân trang, tìm kiếm, lọc) và chi tiết một nhân viên |
| `UpdateNhanVienUseCase` | `update_nhan_vien_uc.py` | Cập nhật thông tin nhân viên. Validate email/CCCD uniqueness, tự động tạo CongTac mới và kết thúc CongTac cũ khi phòng ban/chức vụ thay đổi, tạo audit log |
| `DeleteNhanVienUseCase` | `delete_nhan_vien_uc.py` | Xóa mềm nhân viên (soft delete), không cho xóa nhân viên đang làm việc |
| `RestoreNhanVienUseCase` | `restore_nhan_vien_uc.py` | Khôi phục nhân viên đã xóa mềm, validate không đang hoạt động |
| `ImportNhanVienUseCase` | `import_nhan_vien_uc.py` | Import hàng loạt nhân viên từ Excel. Validate per-row (email/CCCD uniqueness), tự động tạo mã nhân viên, audit log per row |
| `BatchPhanBoUseCase` | `batch_phan_bo_uc.py` | Phân bổ hàng loạt nhân viên vào phòng ban. Cập nhật `phong_ban_id`, quản lý CongTac cũ/mới cho từng NV, audit log |
| `BatchPhanBoChucVuUseCase` | `batch_phan_bo_chuc_vu_uc.py` | Phân bổ chức vụ hàng loạt cho nhân viên. Cập nhật `chuc_vu_id` trên từng NV, audit log |
| `BatchBoNhiemUseCase` | `batch_bo_nhiem_uc.py` | Bổ nhiệm chức vụ hàng loạt. Tạo `LichSuChucVu` + cập nhật `chuc_vu_id` + `ngay_bo_nhiem_chuc_vu` trên từng NV, audit log |

### 2.2 Module Phòng ban (`phong_ban/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `CreatePhongBanUseCase` | `create_phong_ban_uc.py` | Tạo phòng ban mới. Mã phòng ban (`ma_phong_ban`) tự sinh format `PB-xxxxxx` (random 6 ký tự) nếu không cung cấp. Có thể nhập thủ công, validate không trùng, pattern `^[A-Z0-9\-]+$` |
| `GetPhongBanUseCase` | `get_phong_ban_uc.py` | Lấy danh sách phòng ban (phân trang, lọc) và chi tiết phòng ban với số nhân viên |
| `UpdatePhongBanUseCase` | `update_phong_ban_uc.py` | Cập nhật thông tin phòng ban, audit log |
| `DeletePhongBanUseCase` | `delete_phong_ban_uc.py` | Xóa mềm phòng ban (soft delete) |

### 2.3 Module Chức vụ (`chuc_vu/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `CreateChucVuUseCase` | `create_chuc_vu_uc.py` | Tạo chức vụ mới. Mã chức vụ (`ma_chuc_vu`) tự sinh format `CV-xxxxxx` (random 6 ký tự) nếu không cung cấp. Có thể nhập thủ công, validate không trùng |
| `GetChucVuUseCase` | `get_chuc_vu_uc.py` | Lấy danh sách chức vụ (phân trang, lọc) và chi tiết |
| `UpdateChucVuUseCase` | `update_chuc_vu_uc.py` | Cập nhật thông tin chức vụ, audit log |
| `DeleteChucVuUseCase` | `delete_chuc_vu_uc.py` | Xóa mềm chức vụ (soft delete) |

### 2.4 Module Hợp đồng (`hop_dong/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListHopDongUseCase` | `get_list_hop_dong_uc.py` | Lấy danh sách hợp đồng theo nhân viên |
| `GetHopDongByIdUseCase` | `get_hop_dong_by_id_uc.py` | Lấy chi tiết một hợp đồng |
| `CreateHopDongUseCase` | `create_hop_dong_uc.py` | Tạo hợp đồng mới. Tự động cập nhật trạng thái hợp đồng cũ (dang_hieu_luc → da_het_han) |
| `UpdateHopDongUseCase` | `update_hop_dong_uc.py` | Cập nhật thông tin hợp đồng, audit log |
| `DeleteHopDongUseCase` | `delete_hop_dong_uc.py` | Xóa hợp đồng, audit log |

### 2.5 Module Phân công Công tác (`cong_tac/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListCongTacUseCase` | `get_list_cong_tac_uc.py` | Lấy danh sách phân công công tác theo nhân viên, bao gồm thông tin phòng ban và chức vụ |
| `GetCurrentCongTacUseCase` | `get_current_cong_tac_uc.py` | Lấy phân công công tác hiện tại của nhân viên |
| `CreateCongTacUseCase` | `create_cong_tac_uc.py` | Tạo phân công công tác mới. Validate loai compatibility, tự động kết thúc phân công cũ + đồng bộ NhanVien FK |
| `EndCongTacUseCase` | `end_cong_tac_uc.py` | Kết thúc phân công công tác, audit log |
| `GetAllCongTacUseCase` | `get_all_cong_tac_uc.py` | Lấy tất cả phân công công tác (phân trang) |
| `GetCongTacByIdUseCase` | `get_cong_tac_by_id_uc.py` | Lấy chi tiết một phân công công tác |
| `UpdateCongTacUseCase` | `update_cong_tac_uc.py` | Cập nhật phân công công tác, tự đồng bộ NhanVien FK nếu is_primary, audit log |

### 2.6 Module Lịch sử Chức vụ (`lich_su_chuc_vu/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListLichSuChucVuUseCase` | `get_list_lich_su_chuc_vu_uc.py` | Lấy danh sách lịch sử chức vụ (phân trang, lọc theo nhan_vien_id) |
| `GetDetailLichSuChucVuUseCase` | `get_detail_lich_su_chuc_vu_uc.py` | Lấy chi tiết một bản ghi lịch sử chức vụ |
| `CreateLichSuChucVuUseCase` | `create_lich_su_chuc_vu_uc.py` | Tạo lịch sử chức vụ mới. Validate nhan_vien và chuc_vu tồn tại, audit log |
| `UpdateLichSuChucVuUseCase` | `update_lich_su_chuc_vu_uc.py` | Cập nhật lịch sử chức vụ, audit log |
| `DeleteLichSuChucVuUseCase` | `delete_lich_su_chuc_vu_uc.py` | Xóa lịch sử chức vụ, audit log |

### 2.7 Module Điều chuyển (`dieu_chuyen/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `TransferEmployeeUseCase` | `transfer_employee_uc.py` | Workflow điều chuyển nhân viên hoàn chỉnh: Validate NV hoạt động + PB/CV mới tồn tại + loai compatibility. Kết thúc CongTac cũ, tạo CongTac mới (is_primary=true), tạo LichSuChucVu, cập nhật NhanVien FK, tạo audit logs. Cung cấp get_history (lịch sử điều chuyển) và get_options (PB/CV khả dụng) |

### 2.8 Module Hồ sơ Nhân sự (`ho_so/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `HoSoNhanSuUseCase` | `ho_so_nhan_su_uc.py` | Lấy hồ sơ đầy đủ nhân viên với tất cả dữ liệu liên quan (phong_ban, chuc_vu, hop_dong, lich_su_cong_tac, bang_cap, nguoi_than, khen_thuong, lich_su_chuc_vu). Cung cấp export_pdf (placeholder cho xuất PDF) |

### 2.9 Module Nghỉ phép (`nghi_phep/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `CreateDonNghiUseCase` | `create_don_nghi_uc.py` | Tạo đơn xin nghỉ. Validate ngày >= hôm nay, check overlapping, tính số ngày nghỉ, cảnh báo nếu quá số ngày phép |
| `GetListDonNghiUseCase` | `get_list_don_nghi_uc.py` | Lấy danh sách đơn nghỉ phép (phân trang, lọc theo nhân viên, trạng thái, loại) |
| `GetDonNghiDetailUseCase` | `get_don_nghi_detail_uc.py` | Lấy chi tiết một đơn nghỉ phép |
| `DuyetDonNghiUseCase` | `duyet_don_nghi_uc.py` | Duyệt đơn nghỉ phép, cập nhật số ngày phép còn lại nếu là phep_nam |
| `TuChoiDonNghiUseCase` | `tu_choi_don_nghi_uc.py` | Từ chối đơn nghỉ phép |
| `DeleteDonNghiUseCase` | `delete_don_nghi_uc.py` | Xóa đơn nghỉ phép (chỉ đơn đang chờ duyệt) |
| `GetSoNgayPhepUseCase` | `get_so_ngay_phep_uc.py` | Lấy số ngày phép còn lại của nhân viên |
| `InitSoNgayPhepUseCase` | `init_so_ngay_phep_uc.py` | Khởi tạo số ngày phép năm mới cho nhân viên |

### 2.10 Module Chấm công (`nghi_phep/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListChamCongUseCase` | `get_list_cham_cong_uc.py` | Lấy danh sách chấm công tháng (phân trang, lọc theo nhân viên, tháng, năm) |
| `GetChamCongDetailUseCase` | `get_cham_cong_detail_uc.py` | Lấy chi tiết chấm công tháng của một nhân viên |
| `MockGenerateChamCongUseCase` | `mock_generate_cham_cong_uc.py` | Mock data chấm công tháng cho tất cả nhân viên đang làm |

### 2.11 Module Lương (`luong/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `CreateCauHinhLuongUseCase` | `cau_hinh_luong_uc.py` | Tạo cấu hình lương mới |
| `GetListCauHinhLuongUseCase` | `cau_hinh_luong_uc.py` | Lấy danh sách cấu hình lương (phân trang, lọc) |
| `CreateLuongUseCase` | `luong_record_uc.py` | Tạo bảng lương cho nhân viên |
| `GetListLuongUseCase` | `luong_record_uc.py` | Lấy danh sách bảng lương (phân trang, lọc) |
| `GetLuongHienTaiUseCase` | `luong_record_uc.py` | Lấy lương hiện tại của nhân viên |
| `GetListKyLuongUseCase` | `ky_luong_uc.py` | Lấy danh sách kỳ lương (phân trang, lọc) |
| `DuyetKyLuongUseCase` | `ky_luong_uc.py` | Duyệt kỳ lương |
| `ChotKyLuongUseCase` | `ky_luong_uc.py` | Chốt kỳ lương (khóa không cho sửa) |
| `GetTraLuongByKyLuongUseCase` | `tra_luong_uc.py` | Lấy danh sách phiếu trả lương theo kỳ lương |
| `GetTraLuongDetailUseCase` | `tra_luong_uc.py` | Lấy chi tiết một phiếu trả lương |
| `PreviewLuongUseCase` | `tinh_luong_uc.py` | Preview tính lương cho một nhân viên (xem trước khi chạy) |
| `ChayLuongUseCase` | `tinh_luong_uc.py` | Chạy lương hàng loạt cho tất cả nhân viên trong tháng |

### 2.12 Module Tài liệu (`tai_lieu/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `UploadTaiLieuUseCase` | `tai_lieu_uc.py` | Upload tài liệu cho nhân viên. Validate file, lưu file, tạo bản ghi TaiLieuNhanVien |
| `GetTaiLieuListUseCase` | `tai_lieu_uc.py` | Lấy danh sách tài liệu (phân trang, lọc) |
| `GetTaiLieuByNhanVienUseCase` | `tai_lieu_uc.py` | Lấy tài liệu theo nhân viên |
| `GetTaiLieuDetailUseCase` | `tai_lieu_uc.py` | Lấy chi tiết một tài liệu |
| `UpdateTaiLieuUseCase` | `tai_lieu_uc.py` | Cập nhật thông tin tài liệu |
| `DeleteTaiLieuUseCase` | `tai_lieu_uc.py` | Xóa tài liệu (xóa file + bản ghi) |

### 2.13 Module Người thân (`sub_module/nguoi_than/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListNguoiThanUseCase` | `nguoi_than/get_list_nguoi_than_uc.py` | Lấy danh sách người thân theo nhân viên |
| `CreateNguoiThanUseCase` | `nguoi_than/create_nguoi_than_uc.py` | Thêm người thân mới cho nhân viên, audit log |
| `UpdateNguoiThanUseCase` | `nguoi_than/update_nguoi_than_uc.py` | Cập nhật thông tin người thân, validate ownership, audit log |
| `DeleteNguoiThanUseCase` | `nguoi_than/delete_nguoi_than_uc.py` | Xóa người thân, validate ownership, audit log |

### 2.14 Module Bằng cấp/Chứng chỉ (`sub_module/bang_cap/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListBangCapUseCase` | `bang_cap/get_list_bang_cap_uc.py` | Lấy danh sách bằng cấp/chứng chỉ theo nhân viên |
| `CreateBangCapUseCase` | `bang_cap/create_bang_cap_uc.py` | Thêm bằng cấp/chứng chỉ mới, audit log |
| `UpdateBangCapUseCase` | `bang_cap/update_bang_cap_uc.py` | Cập nhật bằng cấp/chứng chỉ, validate ownership, audit log |
| `DeleteBangCapUseCase` | `bang_cap/delete_bang_cap_uc.py` | Xóa bằng cấp/chứng chỉ, validate ownership, audit log |

### 2.15 Module Khen thưởng/Kỷ luật (`sub_module/khen_thuong_ky_luat/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetListKhenThuongKyLuatUseCase` | `khen_thuong_ky_luat/get_list_khen_thuong_ky_luat_uc.py` | Lấy danh sách khen thưởng/kỷ luật, hỗ trợ filter theo loai |
| `CreateKhenThuongKyLuatUseCase` | `khen_thuong_ky_luat/create_khen_thuong_ky_luat_uc.py` | Thêm khen thưởng/kỷ luật mới, audit log |
| `UpdateKhenThuongKyLuatUseCase` | `khen_thuong_ky_luat/update_khen_thuong_ky_luat_uc.py` | Cập nhật khen thưởng/kỷ luật, validate ownership, audit log |
| `DeleteKhenThuongKyLuatUseCase` | `khen_thuong_ky_luat/delete_khen_thuong_ky_luat_uc.py` | Xóa khen thưởng/kỷ luật, validate ownership, audit log |

### 2.16 Module Employee Self-Service (`employee/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetEmployeeDashboardUseCase` | `get_employee_dashboard_uc.py` | Lấy dashboard cá nhân: thông tin nhân viên, số ngày phép, đơn nghỉ chờ duyệt, chấm công tháng hiện tại |
| `GetEmployeeProfileUseCase` | `get_employee_profile_uc.py` | Lấy hồ sơ cá nhân của user đang đăng nhập |
| `UpdateEmployeeProfileUseCase` | `update_employee_profile_uc.py` | Cập nhật thông tin cá nhân (chỉ cho phép sửa một số trường: email, SĐT, địa chỉ) |
| `GetEmployeePermissionsUseCase` | `get_employee_permissions_uc.py` | Lấy permissions của user từ JWT token |

### 2.17 Module Authentication (`auth/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `LoginUseCase` | `login_uc.py` | Đăng nhập: Validate username/password, lấy roles và permissions từ RBAC, tạo JWT access token và refresh token, trả về thông tin user |

### 2.18 Module Dashboard (`dashboard/`)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GetAdminDashboardUseCase` | `admin_dashboard_uc.py` | Lấy thống kê dashboard admin: 11 counters (tổng NV, phòng ban, chức vụ, đơn chờ duyệt...), top 5 phòng ban, 5 hoạt động gần nhất |

---

## 3. Module Nhân viên

### 2.1 Mô tả nghiệp vụ

Nhân viên là thực thể trung tâm của hệ thống. Mỗi nhân viên được phân loại thành một trong ba loại:

**2.1.1 Phân loại nhân viên**

| Loại | Mã | Đặc điểm | Chức vụ hợp lệ |
|------|-----|-----------|-----------------|
| Giáo viên | `giao_vien` | Người giảng dạy theo bộ môn | Chức vụ có `loai = "giao_vien"` (Giáo viên, Tổ trưởng bộ môn) |
| Cán bộ | `can_bo` | Người quản lý, lãnh đạo | Chức vụ có `loai = "quan_ly"` (Hiệu trưởng, Phó HT, Trưởng phòng) |
| Nhân viên | `nhan_vien` | Người hỗ trợ | Chức vụ có `loai = "nhan_vien"` (Bảo vệ, Vệ sinh, NVVP) |

**Quy tắc quan trọng:** 
- Một Giáo viên KHÔNG thể giữ chức vụ loại "Quản lý"
- Một Cán bộ KHÔNG thể giữ chức vụ loại "Giáo viên" hoặc "Nhân viên"
- Chức vụ và loại nhân viên phải tương thích

**2.1.2 Quy trình tạo nhân viên mới**

```
1. Nhập thông tin cá nhân (họ tên, giới tính, ngày sinh, CCCD, SĐT,...)
   ↓
2. Chọn loại nhân viên (Giáo viên/Cán bộ/Nhân viên)
   ↓
3. Chọn phòng ban và chức vụ phù hợp
   ↓
4. Hệ thống tự động:
   - Tạo mã nhân viên (NV-xxxxxx, random 6 ký tự)
   - Tạo tài khoản đăng nhập:
     • Tên đăng nhập = ma_nhan_vien
     • Mật khẩu = số điện thoại
     • Vai trò = "nhan_vien"
   - Tạo bản ghi CongTac (phân công công tác)
   - Tạo bản ghi HopDong (hợp đồng) nếu có thông tin
   ↓
5. Frontend hiển thị dialog thông tin tài khoản (username + mật khẩu)
   ↓
6. Audit log ghi nhận hành động
```

**2.1.3 Quy trình cập nhật nhân viên**

Khi cập nhật `phong_ban_id` hoặc `chuc_vu_id`:
```
1. Kiểm tra loại tương thích mới
   ↓
2. Tạo bản ghi CongTac mới với is_primary = true
   ↓
3. Cập nhật CongTac cũ:
   - ngay_ket_thuc = hôm nay
   - is_primary = false
   - trang_thai = "da_chuyen"
   ↓
4. Đồng bộ FK trên NhanVien
   ↓
5. Audit log ghi nhận cả hai thay đổi
```

### 2.2 Ràng buộc và quy tắc

| STT | Trường | Quy tắc | Giải thích |
|-----|--------|---------|------------|
| 1 | `ho_ten` | 2-100 ký tự | Họ tên phải đầy đủ |
| 2 | `ngay_sinh` | Tuổi 18-65 | Đủ điều kiện lao động |
| 3 | `so_cccd` | 9 hoặc 12 số | CCCD Việt Nam |
| 4 | `email` | Định dạng email, DUY NHẤT | Mỗi người một email công việc |
| 5 | `bac_luong` | 1-10 | Theo bảng lương nhà nước |
| 6 | `ngay_het_hop_dong` | >= `ngay_vao_lam` | Hợp đồng phải có thời hạn hợp lệ |
| 7 | `loai_nhan_vien` + `chuc_vu_id` | Tương thích | Theo bảng 2.1.1 |

### 2.3 Các trạng thái của nhân viên

| Trạng thái | Mã | Ý nghĩa |
|-------------|-----|---------|
| Đang làm | `dang_lam` | Nhân viên đang làm việc |
| Nghỉ việc | `nghi_viec` | Đã nghỉ việc (thôi việc) |
| Nghỉ hưu | `nghi_huu` | Đã đến tuổi nghỉ hưu |
| Đã xóa | `da_xoa` | Đã xóa mềm (soft delete) |

### 2.4 Mô hình dữ liệu

```python
# NhanVien Model
class NhanVien:
    """Thông tin nhân viên"""
    
    # ─────────────────────────────────────────────────────────────
    # THÔNG TIN CÁ NHÂN
    # ─────────────────────────────────────────────────────────────
    id: str                      # UUID
    ma_nhan_vien: str            # Mã: GV001, CB001, NV001 (AUTO)
    ho_ten: str                  # Họ và tên đầy đủ
    gioi_tinh: str               # Nam | Nữ | Khác
    ngay_sinh: date             # Ngày sinh
    
    # ─────────────────────────────────────────────────────────────
    # ĐỊA CHỈ
    # ─────────────────────────────────────────────────────────────
    que_quan: str | None         # Quê quán
    noi_sinh: str | None         # Nơi sinh
    dia_chi_thuong_tru: str | None    # Địa chỉ thường trú
    dia_chi_tam_tru: str | None       # Địa chỉ tạm trú
    
    # ─────────────────────────────────────────────────────────────
    # LIÊN LẠC
    # ─────────────────────────────────────────────────────────────
    so_dien_thoai: str | None   # SĐT (9-11 số)
    email: str | None            # Email công việc (UNIQUE)
    email_ca_nhan: str | None   # Email cá nhân
    
    # ─────────────────────────────────────────────────────────────
    # ĐỊNH DANH
    # ─────────────────────────────────────────────────────────────
    so_cccd: str | None         # Số CCCD (9/12 số, UNIQUE)
    ngay_cap_cccd: date | None  # Ngày cấp CCCD
    noi_cap_cccd: str | None    # Nơi cấp CCCD
    cccd_front: str | None      # URL ảnh CCCD mặt trước
    cccd_back: str | None       # URL ảnh CCCD mặt sau
    anh_dai_dien: str | None    # URL ảnh đại diện
    
    # ─────────────────────────────────────────────────────────────
    # DÂN TỘC & TÔN GIÁO
    # ─────────────────────────────────────────────────────────────
    dan_toc: str | None          # Dân tộc
    ton_giao: str | None         # Tôn giáo
    
    # ─────────────────────────────────────────────────────────────
    # PHÂN LOẠI
    # ─────────────────────────────────────────────────────────────
    loai_nhan_vien: str         # giao_vien | can_bo | nhan_vien
    cap_hoc: str | None          # Cấp học giảng dạy (TH, THCS, THPT)
    mon_day: str | None         # Môn giảng dạy (Toán, Văn, Lý...)
    
    # ─────────────────────────────────────────────────────────────
    # PHÒNG BAN & CHỨC VỤ
    # ─────────────────────────────────────────────────────────────
    phong_ban_id: str | None     # FK → PhongBan (Đang làm)
    chuc_vu_id: str | None       # FK → ChucVu (Đang giữ)
    
    # ─────────────────────────────────────────────────────────────
    # HỢP ĐỒNG LAO ĐỘNG
    # ─────────────────────────────────────────────────────────────
    loai_hop_dong: str          # vien_chuc | hop_dong_thu_viec | hop_dong_nam
    so_hop_dong: str | None     # Số hợp đồng
    ngay_vao_lam: date | None  # Ngày bắt đầu làm việc
    ngay_het_hop_dong: date | None  # Ngày kết thúc HĐ
    hinh_thuc_tuyen_dung: str | None  # Thi tuyển, xét tuyển...
    noi_ky_hop_dong: str | None # Nơi ký hợp đồng
    
    # ─────────────────────────────────────────────────────────────
    # LƯƠNG & THÂM NIÊN
    # ─────────────────────────────────────────────────────────────
    hang_chuc_danh: str | None   # Hạng chức danh
    ngach_luong: str | None     # Ngạch lương
    bac_luong: int | None       # Bậc lương (1-10)
    he_so_luong: str | None     # Hệ số lương
    so_nam_tham_nien: int | None # Số năm thâm niên
    
    # ─────────────────────────────────────────────────────────────
    # PHỤ CẤP & BỔ NHIỆM
    # ─────────────────────────────────────────────────────────────
    phu_cap_chuc_vu: str | None # Phụ cấp chức vụ
    ngay_bo_nhiem_chuc_vu: date | None  # Ngày bổ nhiệm
    
    # ─────────────────────────────────────────────────────────────
    # ĐẢNG/ĐOÀN
    # ─────────────────────────────────────────────────────────────
    la_dang_vien: bool          # Có phải đảng viên
    ngay_vao_dang: date | None # Ngày vào Đảng
    la_doan_vien: bool          # Có phải đoàn viên
    ngay_vao_doan: date | None # Ngày vào Đoàn
    
    # ─────────────────────────────────────────────────────────────
    # BHXH & NGÂN HÀNG
    # ─────────────────────────────────────────────────────────────
    so_bao_hiem: str | None     # Số BHXH
    ngay_tham_gia_bhxh: date | None  # Ngày tham gia BHXH
    ten_ngan_hang: str | None   # Tên ngân hàng
    so_tai_khoan_ngan_hang: str | None  # Số tài khoản
    
    # ─────────────────────────────────────────────────────────────
    # HÔN NHÂN & TÌNH TRẠNG
    # ─────────────────────────────────────────────────────────────
    tinh_trang_hon_nhan: str | None  # Độc thân, Đã kết hôn...
    trang_thai: str             # dang_lam | nghi_viec | nghi_huu | da_xoa
    ghi_chu: str | None        # Ghi chú khác
    
    # ─────────────────────────────────────────────────────────────
    # TIMESTAMPS
    # ─────────────────────────────────────────────────────────────
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None  # Soft delete
```

---

## 4. Module Phòng ban

### 3.1 Mô tả nghiệp vụ

Phòng ban đại diện cho các đơn vị tổ chức trong trường, bao gồm:
- **Ban Giám hiệu**: Hiệu trưởng, Phó Hiệu trưởng
- **Tổ Chuyên môn**: Các tổ bộ môn (Toán, Văn, Ngoại ngữ...)
- **Phòng Hành chính**: Văn phòng, Kế toán, Nhân sự...
- **Phòng Phục vụ**: Bảo vệ, Vệ sinh...

**3.1.1 Phân loại phòng ban**

| Loại | Mã | Mô tả | Ví dụ |
|------|-----|--------|--------|
| Chuyên môn | `chuyen_mon` | Các tổ bộ môn giảng dạy | Tổ Toán, Tổ Văn, Tổ Lý |
| Hành chính | `hanh_chinh` | Phòng ban hỗ trợ | Văn phòng, Kế toán |
| Khác | `khac` | Các đơn vị khác | Thư viện, Phòng y tế |

**3.1.2 Cấu trúc phân cấp**

Phòng ban có thể có **phòng ban cha** (`cha_id`), tạo thành cấu trúc cây:
```
Trường THPT Thăng Long (cha_id = NULL)
├── Ban Giám hiệu (cha_id = root)
│   ├── Hiệu trưởng
│   └── Phó Hiệu trưởng 1, 2
├── Tổ Chuyên môn (cha_id = Ban Giám hiệu)
│   ├── Tổ Toán
│   ├── Tổ Văn
│   └── Tổ Ngoại ngữ
└── Hành chính (cha_id = Ban Giám hiệu)
    ├── Văn phòng
    └── Kế toán
```

**Quy tắc:**
- Không được tạo vòng lặp: A → B → C → A
- Khi xóa phòng ban cha, phải xử lý các phòng ban con

### 3.2 Ràng buộc và quy tắc

| STT | Trường | Quy tắc | Giải thích |
|-----|--------|---------|------------|
| 1 | `ma_phong_ban` | UNIQUE, pattern `^[A-Z0-9\-]+$`, tự sinh `PB-xxxxxx` nếu không cung cấp | Mã không trùng, viết hoa, tự động |
| 2 | `ten_phong_ban` | UNIQUE trong cùng cấp cha | Hai tổ Toán ở hai cấp khác nhau thì được |
| 3 | `cha_id` | Không tạo vòng | Kiểm tra phản xạ khi tạo |
| 4 | Khi xóa | Không có nhân viên đang làm | Hoặc phải di chuyển nhân viên trước |

### 3.3 Mô hình dữ liệu

```python
# PhongBan Model
class PhongBan:
    """Phòng ban / Đơn vị trong trường"""
    
    id: str                      # UUID
    ma_phong_ban: str            # Mã: PB-xxxxxx (AUTO) hoặc thủ công (UNIQUE)
    ten_phong_ban: str           # Tên đầy đủ
    loai: str                    # chuyen_mon | hanh_chinh | khac
    mo_ta: str | None            # Mô tả chức năng
    truong_phong: str | None     # Tên trưởng phòng
    so_dien_thoai: str | None   # SĐT liên hệ
    email: str | None             # Email phòng ban
    trang_thai: bool             # True = đang hoạt động
    cha_id: str | None           # FK → PhongBan (cha)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None   # Soft delete
    
    # Relationships
    children: List[PhongBan]      # Các phòng ban con
```

---

## 5. Module Chức vụ

### 4.1 Mô tả nghiệp vụ

Chức vụ xác định vị trí công việc và cấp bậc của nhân viên trong tổ chức.

**4.1.1 Phân loại chức vụ**

| Loại | Mã | Mô tả | Ví dụ |
|------|-----|--------|--------|
| Quản lý | `quan_ly` | Cán bộ quản lý | Hiệu trưởng, Phó HT, Trưởng phòng |
| Giáo viên | `giao_vien` | Giáo viên bộ môn | Giáo viên, Tổ trưởng bộ môn |
| Nhân viên | `nhan_vien` | Nhân viên hỗ trợ | Bảo vệ, Vệ sinh, NVVP |

**4.1.2 Hệ thống cấp bậc**

| Cấp | Mã | Ví dụ chức vụ |
|-----|----|---------------|
| 10 | Thượng | Hiệu trưởng |
| 9 | Thượng | Phó Hiệu trưởng |
| 8 | Trung | Trưởng phòng, Tổ trưởng |
| 7 | Trung | Phó Trưởng phòng, Phó Tổ trưởng |
| 6 | Sơ | Giáo viên chủ nhiệm |
| 5 | Sơ | Giáo viên |
| 4 | Sơ | Giáo viên (thâm niên thấp) |
| 3 | Cơ bản | Nhân viên hành chính |
| 2 | Cơ bản | Nhân viên |
| 1 | Cơ bản | Nhân viên phục vụ |

**4.1.3 Hệ số phụ cấp chức vụ**

| Chức vụ | Hệ số phụ cấp |
|---------|---------------|
| Hiệu trưởng | 1.5 |
| Phó Hiệu trưởng | 1.2 |
| Trưởng phòng | 0.8 |
| Phó Trưởng phòng | 0.5 |
| Tổ trưởng bộ môn | 0.4 |
| Giáo viên | 0.0 |

### 4.2 Mô hình dữ liệu

```python
# ChucVu Model
class ChucVu:
    """Chức vụ trong trường"""
    
    id: str                      # UUID
    ma_chuc_vu: str             # Mã: CV-xxxxxx (AUTO) hoặc thủ công (UNIQUE)
    ten_chuc_vu: str            # Tên chức vụ
    loai: str                    # quan_ly | giao_vien | nhan_vien
    cap_bac: int                 # 1-10 (10 = cao nhất)
    he_so_phu_cap: float         # Hệ số phụ cấp (0.0 - 2.0)
    mo_ta: str | None           # Mô tả công việc
    tieu_chuan: str | None       # Tiêu chuẩn chức vụ
    trang_thai: bool             # True = đang sử dụng
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None  # Soft delete
```

---

## 6. Module Phân công Công tác

### 5.1 Mô tả nghiệp vụ

**CongTac** (Phân công công tác) là bảng lưu lịch sử phân công của nhân viên. Mỗi khi nhân viên:
- Được nhận vào làm
- Được điều chuyển sang phòng ban khác
- Được thăng chức/thay đổi chức vụ

→ Một bản ghi CongTac mới được tạo.

**5.1.1 Nguyên tắc cốt lõi**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NGUYÊN TẮC QUAN TRỌNG                            │
│                                                                      │
│  1. MỘT nhân viên chỉ có MỘT phân công chính (is_primary = true)  │
│     tại một thời điểm                                               │
│                                                                      │
│  2. Khi tạo phân công mới:                                         │
│     - Phân công cũ: is_primary = false, ngay_ket_thuc = hôm nay     │
│     - Phân công mới: is_primary = true                              │
│                                                                      │
│  3. CongTac là NGUỒN SỰ THẬT cho lịch sử phân công                 │
│                                                                      │
│  4. FK trên NhanVien (phong_ban_id, chuc_vu_id) được DERIVED        │
│     từ phân công chính (is_primary = true)                         │
└─────────────────────────────────────────────────────────────────────┘
```

**5.1.2 Quy trình khi tạo nhân viên mới**

```
1. Tạo NhanVien với thông tin ban đầu
   ↓
2. Tự động tạo CongTac:
   - nhan_vien_id = NV vừa tạo
   - phong_ban_id = phong_ban đã chọn
   - chuc_vu_id = chuc_vu đã chọn
   - ngay_bat_dau = ngay_vao_lam
   - ngay_ket_thuc = NULL
   - is_primary = true
   - trang_thai = "dang_cong_tac"
   ↓
3. Đồng bộ: NhanVien.phong_ban_id = CongTac.phong_ban_id
             NhanVien.chuc_vu_id = CongTac.chuc_vu_id
```

**5.1.3 Quy trình khi điều chuyển**

```
1. Cập nhật NhanVien (phong_ban_id hoặc chuc_vu_id mới)
   ↓
2. Tìm CongTac hiện tại (is_primary = true)
   ↓
3. Cập nhật CongTac cũ:
   - ngay_ket_thuc = hôm nay
   - is_primary = false
   - trang_thai = "da_chuyen"
   ↓
4. Tạo CongTac mới:
   - nhan_vien_id = NV đang xét
   - phong_ban_id = giá trị MỚI trên NhanVien
   - chuc_vu_id = giá trị MỚI trên NhanVien
   - ngay_bat_dau = hôm nay
   - ngay_ket_thuc = NULL
   - is_primary = true
   - trang_thai = "dang_cong_tac"
   ↓
5. Đồng bộ FK trên NhanVien
```

### 5.2 Mô hình dữ liệu

```python
# CongTac Model
class CongTac:
    """Phân công công tác - Lịch sử phân công NV"""
    
    id: str                      # UUID
    nhan_vien_id: str           # FK → NhanVien
    phong_ban_id: str           # FK → PhongBan
    chuc_vu_id: str             # FK → ChucVu
    
    # Thời gian
    ngay_bat_dau: datetime      # Ngày bắt đầu phân công
    ngay_ket_thuc: datetime | None  # NULL = đang công tác
    
    # Phân công chính
    is_primary: bool            # True = vị trí chính hiện tại
    
    # Lương tại thời điểm
    he_so_luong: str | None    # Hệ số lương khi được phân công
    bac_luong: int | None      # Bậc lương khi được phân công
    
    # Trạng thái
    trang_thai: str            # dang_cong_tac | da_nghi | da_chuyen
    
    # Timestamps
    created_at: datetime
    updated_at: datetime

# LichSuChucVu Model
class LichSuChucVu:
    """Lịch sử thay đổi chức vụ - Theo dõi thăng giáng"""
    
    id: str
    nhan_vien_id: str          # FK → NhanVien
    chuc_vu_id: str            # FK → ChucVu (chức vụ cũ)
    phong_ban_id: str | None   # FK → PhongBan
    
    tu_ngay: date              # Từ ngày
    den_ngay: date | None      # Đến ngày (NULL = hiện tại)
    
    # Quyết định
    so_quyet_dinh: str | None  # Số quyết định
    ly_do: str | None          # Lý do thay đổi (thăng chức, giáng chức...)
    ghi_chu: str | None        # Ghi chú
```

### 5.3 Ràng buộc

| STT | Quy tắc | Giải thích |
|-----|---------|------------|
| 1 | Chỉ 1 `is_primary = true` | Dùng trigger/database constraint |
| 2 | `ngay_ket_thuc >= ngay_bat_dau` | Ngày kết thúc phải sau ngày bắt đầu |
| 3 | `ngay_bat_dau` phân công mới = `ngay_ket_thuc` phân công cũ | Liên tục, không trùng lặp |

### 5.4 Phân bổ và Bổ nhiệm hàng loạt

**5.4.1 Phân bổ phòng ban hàng loạt (BatchPhanBo)**

```
1. Admin chọn nhiều nhân viên + phòng ban đích
   ↓
2. Với từng NV:
   a. Bỏ qua nếu đã ở phòng ban đích
   b. Cập nhật NhanVien.phong_ban_id
   c. Kết thúc CongTac cũ (is_primary=true → false, ngay_ket_thuc=hôm nay)
   d. Tạo CongTac mới (is_primary=true)
   e. Audit log cho CongTac cũ + mới + NhanVien
   ↓
3. Trả về {success_count, failed_ids}
```

**5.4.2 Phân bổ chức vụ hàng loạt (BatchPhanBoChucVu)**

```
1. Admin chọn nhiều nhân viên + chức vụ đích
   ↓
2. Với từng NV:
   a. Bỏ qua nếu đã giữ chức vụ đích
   b. Cập nhật NhanVien.chuc_vu_id
   c. Audit log cho NhanVien
   ↓
3. Trả về {success_count, failed_ids}
```

**5.4.3 Bổ nhiệm chức vụ hàng loạt (BatchBoNhiem)**

```
1. Admin chọn nhiều nhân viên + chức vụ mới + ngày bổ nhiệm + số QĐ
   ↓
2. Với từng NV:
   a. Tạo LichSuChucVu (chức vụ mới, phòng ban hiện tại, ngày bổ nhiệm, số QĐ)
   b. Cập nhật NhanVien.chuc_vu_id = chức vụ mới
   c. Cập nhật NhanVien.ngay_bo_nhiem_chuc_vu = ngày bổ nhiệm
   d. Audit log cho LichSuChucVu + NhanVien
   ↓
3. Trả về {success_count, failed_ids}
```

**So sánh Phân bổ vs Bổ nhiệm:**

| Tiêu chí | Phân bổ chức vụ | Bổ nhiệm chức vụ |
|----------|-----------------|-------------------|
| LichSuChucVu | Không tạo | Có tạo |
| Ngày bổ nhiệm | Không cập nhật | Cập nhật `ngay_bo_nhiem_chuc_vu` |
| Số quyết định | Không | Có |
| Mục đích | Gán nhanh chức vụ | Quyết định bổ nhiệm chính thức |
| API Endpoint | `POST /batch-phan-bo-chuc-vu` | `POST /batch-bo-nhiem` |

---

## 7. Module Hợp đồng Lao động

### 6.1 Mô tả nghiệp vụ

Hợp đồng lao động ghi nhận quan hệ hợp đồng giữa nhà trường và nhân viên. Mỗi nhân viên có thể có nhiều hợp đồng theo thời gian (khi gia hạn, ký lại).

**6.1.1 Loại hợp đồng**

| Loại | Mã | Mô tả | Thời hạn |
|------|-----|--------|----------|
| Viên chức | `vien_chuc` | Cán bộ nhà nước | Không xác định |
| Thử việc | `hop_dong_thu_viec` | Hợp đồng thử việc | 1-3 tháng |
| Hợp đồng năm | `hop_dong_nam` | Hợp đồng theo năm | 12 tháng |
| Hợp đồng khác | `hop_dong_khac` | Các loại khác | Tùy quy định |

**6.1.2 Quy trình**

```
1. Tạo Hợp đồng khi:
   - Tuyển dụng nhân viên mới
   - Gia hạn hợp đồng cũ
   ↓
2. Hợp đồng cũ:
   - trang_thai = "da_het_han" hoặc "bi_huy"
   ↓
3. Hợp đồng mới:
   - trang_thai = "dang_hieu_luc"
```

### 6.2 Mô hình dữ liệu

```python
# HopDong Model
class HopDong:
    """Hợp đồng lao động"""
    
    id: str
    nhan_vien_id: str          # FK → NhanVien
    
    # Thông tin hợp đồng
    so_hop_dong: str           # Số hợp đồng (unique theo NV)
    loai_hop_dong: str        # vien_chuc | hop_dong_thu_viec | hop_dong_nam
    
    # Thời hạn
    ngay_ky: date             # Ngày ký
    ngay_bat_dau: date        # Ngày bắt đầu
    ngay_ket_thuc: date | None  # NULL = không xác định
    
    # Chi tiết
    hinh_thuc_tuyen_dung: str | None  # Thi tuyển, xét tuyển...
    noi_ky_hop_dong: str | None     # Nơi ký
    luong_co_ban: str | None        # Lương cơ bản khi ký HĐ
    
    # Trạng thái
    trang_thai: str          # dang_hieu_luc | da_het_han | bi_huy
    
    # Ghi chú
    ghi_chu: str | None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
```

### 6.3 Ràng buộc

| STT | Quy tắc | Giải thích |
|-----|---------|------------|
| 1 | `so_hop_dong` | UNIQUE theo nhân viên |
| 2 | `ngay_ket_thuc >= ngay_bat_dau` | Thời hạn hợp lệ |
| 3 | Chỉ 1 HĐ `dang_hieu_luc` | Tại một thời điểm |

---

## 8. Module Nghỉ phép

### 7.1 Mô tả nghiệp vụ

Nghỉ phép là quyền lợi của người lao động theo Bộ Luật Lao động Việt Nam. Nhân viên muốn nghỉ phép phải:

1. **Tạo đơn xin nghỉ** với đầy đủ thông tin
2. **Chờ quản lý duyệt** (hoặc từ chối)
3. **Được duyệt** → Nghỉ theo đơn đã duyệt

**7.1.1 Quy trình duyệt 2 cấp**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH DUYỆT NGHỈ PHÉP 2 CẤP                        │
│                                                                             │
│  ┌──────────┐    ┌─────────────────┐    ┌─────────────────────────┐   │
│  │ NHÂN VIÊN│    │  TRƯỞNG PHÒNG  │    │   QUẢN LÝ CAO CẤP      │   │
│  │          │    │  (Cấp 1)        │    │   (Cấp 2)               │   │
│  └────┬─────┘    └────────┬────────┘    └───────────┬─────────────┘   │
│       │                    │                         │                  │
│       │ 1. Tạo đơn        │                         │                  │
│       │──────────────────▶│                         │                  │
│       │                   │                         │                  │
│       │ 2. Trạng thái:   │                         │                  │
│       │   cho_duyet_cap_1 │                         │                  │
│       │◀─────────────────│                         │                  │
│       │                   │                         │                  │
│       │                   │ 3a. Duyệt ✓           │                  │
│       │                   │ 3b. Từ chối ✗         │                  │
│       │                   │◀─────────────────────│                  │
│       │                   │                         │                  │
│       │                   │ 4. Trạng thái:        │                  │
│       │                   │   cho_duyet_cap_2      │                  │
│       │                   │──────────────────────▶│                  │
│       │                   │                         │                  │
│       │                   │                         │ 5a. Duyệt cấp 2 ✓│
│       │                   │                         │ 5b. Từ chối ✗    │
│       │                   │                         │◀─────────────────│
│       │                   │                         │                  │
│       │ 6. Trạng thái:   │ 7. Trừ ngày phép      │                  │
│       │   da_duyet_cap_2  │   (nếu phep_nam)      │                  │
│       │◀─────────────────│─────────────────────▶│                  │
│       │                   │                         │                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**7.1.2 Trạng thái đơn**

| Trạng thái | Mã | Cấp duyệt | Mô tả |
|-------------|-----|-----------|-------|
| Chờ cấp 1 | `cho_duyet_cap_1` | Trưởng phòng | Đơn mới tạo |
| Chờ cấp 2 | `cho_duyet_cap_2` | Quản lý cao cấp | Đã duyệt cấp 1 |
| Đã duyệt | `da_duyet_cap_2` | - | Đã duyệt cấp 2 |
| Từ chối | `tu_choi` | - | Bị từ chối |
| Đã hủy | `huy` | - | Người tự hủy |

**7.1.3 Loại nghỉ phép**

| STT | Loại | Mã | Số ngày BHXH | Cần giấy tờ | Ghi chú |
|-----|------|-----|--------------|-------------|---------|
| 1 | Nghỉ phép năm | `phep_nam` | Không | Không | 12 ngày/năm (theo luật) |
| 2 | Nghỉ ốm | `nghi_om` | Có | Có | Cần giấy xác nhận |
| 3 | Nghỉ việc riêng | `viec_rieng` | Không | Không | 3 ngày/năm |
| 4 | Nghỉ kết hôn | `ket_hon` | Không | Không | 3 ngày |
| 5 | Nghỉ ma táng | `mai_tang` | Không | Không | 3 ngày |
| 6 | Nghỉ thai sản | `thai_san` | Có | Có | 180 ngày |
| 7 | Đi công tác | `cong_tac` | Không | Có | Không giới hạn |

**7.1.2 Quy trình xử lý đơn**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         QUY TRÌNH NGHỈ PHÉP                              │
│                                                                          │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │ NHÂN VIÊN│    │   HỆ THỐNG  │    │  QUẢN LÝ   │                   │
│  └────┬────┘    └──────┬──────┘    └──────┬──────┘                   │
│       │                  │                  │                              │
│       │ 1. Tạo đơn      │                  │                              │
│       │────────────────▶│                  │                              │
│       │                  │                  │                              │
│       │ 2. Trạng thái:  │                  │                              │
│       │    cho_duyet     │                  │                              │
│       │◀────────────────│                  │                              │
│       │                  │                  │                              │
│       │                  │ 3. Thông báo     │                              │
│       │                  │─────────────────▶│                              │
│       │                  │                  │                              │
│       │                  │                  │ 4a. Duyệt ✓                  │
│       │                  │                  │ 4b. Từ chối ✗                │
│       │                  │◀────────────────│                              │
│       │                  │                  │                              │
│       │ 5a. Trạng thái: │ 5b. Trừ ngày phép│                              │
│       │   da_duyet       │   (nếu phep_nam) │                              │
│       │◀────────────────│────────────────────│                              │
│       │                  │                  │                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Tính số ngày nghỉ

**Nguyên tắc:** Chỉ tính ngày làm việc, trừ:
- Thứ 7, Chủ nhật
- Ngày lễ, Tết

**7.2.1 Ngày lễ Việt Nam**

| Ngày | Tên | Loại |
|------|-----|------|
| 1/1 | Tết Dương lịch | Cố định |
| 30/4 | Giải phóng miền Nam | Cố định |
| 1/5 | Quốc tế Lao động | Cố định |
| 2/9 | Quốc khánh | Cố định |
| Tết Nguyên Đán (7 ngày) | 30 Tết - mùng 6 Tết | Âm lịch |
| 10/3 | Giỗ Tổ Hùng Vương | Âm lịch |

**7.2.2 Thuật toán**

```
HÀM tinh_so_ngay_nghi(tu_ngay, den_ngay):
    holidays = lay_danh_sach_ngay_le(nam)
    so_ngay = 0
    ngay_hien_tai = tu_ngay
    
    KHI ngay_hien_tai <= den_ngay:
        thu = lay_thu(ngay_hien_tai)  # 0=Thứ 2, 5=Thứ 7, 6=CN
        
        NẾU thu < 5 VÀ ngay_hien_tai KHÔNG trong holidays:
            so_ngay = so_ngay + 1
        
        ngay_hien_tai = ngay_hien_tai + 1
    
    TRẢ VỀ so_ngay
```

### 7.3 Số ngày phép năm

Mỗi nhân viên có số ngày phép năm, được theo dõi trong bảng `SoNgayPhep`.

```
Đầu năm:
   phep_nam_duoc_phep = 12 (mặc định)
   phep_nam_da_su_dung = 0
   phep_nam_con_lai = 12

Khi duyệt đơn phep_nam:
   phep_nam_da_su_dung += so_ngay
   phep_nam_con_lai = phep_nam_duoc_phep - phep_nam_da_su_dung
```

**Quy tắc:**
- `phep_nam_con_lai` không được âm
- Khi nghỉ quá số ngày còn lại → Vẫn cho tạo đơn nhưng có **cảnh báo**

### 7.4 Mô hình dữ liệu

```python
# DonXinNghi Model
class DonXinNghi:
    """Đơn xin nghỉ phép"""
    
    id: str
    nhan_vien_id: str           # FK → NhanVien
    
    # Thông tin nghỉ
    loai_nghi: str             # phep_nam | nghi_om | viec_rieng | ...
    tu_ngay: date              # Ngày bắt đầu nghỉ
    den_ngay: date             # Ngày kết thúc nghỉ
    so_ngay: float             # Số ngày nghỉ (đã tính trừ T7, CN, lễ)
    ly_do: str | None          # Lý do nghỉ
    
    # File đính kèm
    files: List[str] | None    # URLs của giấy tờ
    
    # Trạng thái (2 cấp)
    trang_thai: str           # cho_duyet_cap_1 | cho_duyet_cap_2 | da_duyet_cap_2 | tu_choi | huy
    cap_duyet_hien_tai: int   # 1 hoặc 2
    
    # Phê duyệt cấp 1 (Trưởng phòng)
    nguoi_duyet_cap_1_id: str | None
    nguoi_duyet_cap_1: str | None    # Tên người duyệt cấp 1
    ngay_duyet_cap_1: datetime | None
    ghi_chu_duyet_cap_1: str | None
    
    # Phê duyệt cấp 2 (Quản lý cao cấp)
    nguoi_duyet_cap_2_id: str | None
    nguoi_duyet_cap_2: str | None    # Tên người duyệt cấp 2
    ngay_duyet_cap_2: datetime | None
    ghi_chu_duyet_cap_2: str | None
    
    # Legacy fields (for backward compatibility)
    lich_su_duyet: List[dict] | None  # Lịch sử phê duyệt
    ghi_chu_duyet: str | None        # Ghi chú khi duyệt/từ chối
    nguoi_tao_id: str         # Người tạo đơn
    nguoi_duyet_id: str | None  # Người duyệt (legacy)
    ngay_duyet: datetime | None  # Thời gian duyệt (legacy)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime

# CauHinhNghiPhep Model
class CauHinhNghiPhep:
    """Cấu hình số ngày phép theo loại"""
    
    id: str
    loai_nghi: str             # phep_nam | nghi_om | viec_rieng | ...
    ten_loai: str              # Tên hiển thị
    so_ngay_moi_nam: float    # Số ngày phép/năm
    so_ngay_toi_da_mot_lan: float | None  # Giới hạn 1 lần nghỉ
    can_giay_to: bool         # Cần giấy tờ đính kèm
    bat_buoc_ghi_ly_do: bool  # Bắt buộc nhập lý do
    trang_thai: bool          # True = hoạt động
    ghi_chu: str | None
    
    created_at: datetime
    updated_at: datetime

# SoNgayPhep Model
class SoNgayPhep:
    """Số ngày phép của nhân viên theo năm"""
    
    id: str
    nhan_vien_id: str           # FK → NhanVien
    nam: int                    # Năm (VD: 2026)
    
    # Số ngày phép
    phep_nam_duoc_phep: float   # Tổng ngày phép năm (mặc định: 12)
    phep_nam_da_su_dung: float # Đã sử dụng
    phep_nam_con_lai: float    # Còn lại = duoc_phep - da_su_dung
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
```

### 7.5 Ràng buộc

| STT | Quy tắc | Kiểm tra |
|-----|---------|----------|
| 1 | `tu_ngay >= hôm nay` | Validation |
| 2 | `den_ngay >= tu_ngay` | Validation |
| 3 | Không trùng đơn đã có | `find_overlapping()` |
| 4 | Chỉ duyệt cấp 1 khi `trang_thai = cho_duyet_cap_1` | Use case |
| 5 | Chỉ duyệt cấp 2 khi `trang_thai = cho_duyet_cap_2` | Use case |
| 6 | Chỉ hủy khi `trang_thai = cho_duyet_cap_1` hoặc `cho_duyet_cap_2` | Use case |
| 7 | `phep_nam_con_lai >= 0` | Trigger/Use case |

---

## 9. Module Chấm công

### 8.1 Mô tả nghiệp vụ

Chấm công theo dõi số ngày làm việc thực tế của nhân viên trong tháng, bao gồm:
- Ngày đi làm
- Ngày nghỉ có phép (đơn đã duyệt)
- Ngày nghỉ không phép
- Ngày nghỉ lễ Tết

### 8.2 Công thức tính

```
Số ngày công = Số ngày có mặt + Nghỉ có phép + Nghỉ lễ Tết
Hệ số ngày công = Số ngày công / 26 (số ngày làm chuẩn)
```

### 8.3 Mô hình dữ liệu

```python
# ChamCongThang Model
class ChamCongThang:
    """Chấm công tháng của nhân viên"""
    
    id: str
    nhan_vien_id: str           # FK → NhanVien
    thang: int                  # Tháng (1-12)
    nam: int                    # Năm
    
    # Số ngày
    tong_ngay_lam: int         # Tổng số ngày trong tháng
    so_ngay_co_mat: int        # Số ngày đi làm
    so_ngay_vang_co_phep: int  # Nghỉ có phép
    so_ngay_vang_khong_phep: int  # Nghỉ không phép
    so_ngay_nghi_le_tet: int   # Nghỉ lễ Tết
    
    # Tính công
    so_ngay_cong: int          # = co_mat + vang_co_phep + nghi_le
    he_so_ngay_cong: float     # = so_ngay_cong / 26
    
    # Trạng thái
    trang_thai: str            # chua_cham | da_cham | da_duyet
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
```

---

## 9.1. Module Chấm công QR (Hệ thống mới)

### 9.1.1 Mô tả nghiệp vụ

Hệ thống chấm công QR cho phép nhân viên check-in/check-out bằng QR code với các tính năng:
- Tạo QR code theo ngày hoặc **cho từng nhân viên** (QR cá nhân)
- Validate QR (chống giả mạo bằng HMAC-SHA256)
- Geo-fencing (kiểm tra vị trí GPS)
- Phát hiện check-in muộn
- Tổng hợp dữ liệu tháng

**9.1.1.1 QR Cá nhân (User-specific QR)**

Mỗi nhân viên có QR code riêng được tạo dựa trên `user_id`, cho phép:
- Admin có thể tạo QR chung cho cả trường hoặc QR cá nhân cho từng NV
- Nhân viên có thể xem QR cá nhân của mình tại `/employee/my-qr`
- QR cá nhân được generate mỗi ngày với timestamp

```
QR Cá nhân = HMAC-SHA256(user_id + ngay + timestamp, secret_key)
```

**9.1.1.2 Workflow Chấm công Tháng**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CHẤM CÔNG THÁNG                                 │
│                                                                             │
│  1. Admin tạo dữ liệu chấm công tháng (mock hoặc import)                  │
│     → Trạng thái: chua_chot                                               │
│                                                                             │
│  2. Nhân viên xác nhận (hoặc Admin xác nhận)                              │
│     → Trạng thái: da_xac_nhan                                             │
│                                                                             │
│  3. Trưởng phòng duyệt                                                    │
│     → Trạng thái: da_duyet                                                │
│                                                                             │
│  4. Admin/Quản lý cao cấp chốt                                             │
│     → Trạng thái: da_chot (không thể chỉnh sửa)                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Trạng thái Chấm công Tháng:**

| Trạng thái | Mã | Ai có thể thao tác |
|-------------|-----|-------------------|
| Chưa chốt | `chua_chot` | Nhân viên, Admin |
| Đã xác nhận | `da_xac_nhan` | Admin |
| Đã duyệt | `da_duyet` | Admin |
| Đã chốt | `da_chot` | - (chỉ đọc) |
| Đã mock | `da_mock` | - (test data) |

### 9.1.2 Luồng hoạt động

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        QUY TRÌNH CHẤM CÔNG QR                              │
│                                                                            │
│  ┌──────────┐    ┌──────────────┐    ┌────────────┐                        │
│  │  ADMIN   │    │    SERVER    │    │  EMPLOYEE  │                        │
│  └────┬─────┘    └──────┬───────┘    └─────┬──────┘                        │
│       │                 │                  │                                │
│       │ 1. Tạo QR       │                  │                                │
│       │────────────────▶│                  │                                │
│       │                 │                  │                                │
│       │                 │ 2. Hiển thị QR   │                                │
│       │                 │◀─────────────────│                                │
│       │                 │                  │                                │
│       │                 │                  │ 3. Quét QR + GPS               │
│       │                 │                  │────────────────▶│              │
│       │                 │                  │                                │
│       │                 │ 4. Validate QR   │                                │
│       │                 │    + GPS         │                                │
│       │                 │◀─────────────────│                                │
│       │                 │                  │                                │
│       │                 │ 5. Lưu check-in  │                                │
│       │                 │─────────────────▶│                                │
│       │                 │                  │                                │
└────────────────────────────────────────────────────────────────────────────┘
```

### 9.1.3 QR Code Structure

```python
# QR Data Format (JSON → Base64)
{
    "id": "qr_uuid",
    "ngay": "2026-04-14",
    "loai": "check_in",  # check_in | check_out
    "nhan_vien_id": "nv_uuid",  # Optional (null = all employees)
    "timestamp": 1713081600,
    "mac": "hmac_sha256_signature"
}
```

### 9.1.4 Validation Rules

| Rule | Mô tả | Error Code |
|------|-------|------------|
| QR Expired | QR hết hạn (mặc định: 5 phút) | `qr_expired` |
| Invalid MAC | Chữ ký HMAC không hợp lệ | `invalid_qr` |
| Already Checked-in | Đã check-in hôm nay | `already_checked_in` |
| Not Checked-in | Chưa check-in để check-out | `not_checked_in` |
| Outside Geo-fence | Vị trí ngoài bán kính cho phép | `outside_geo_fence` |
| Late Check-in | Check-in sau giờ qui định | `late_check_in` |

### 9.1.5 Mô hình dữ liệu

```python
# QRConfig Model
class QRConfig:
    """Cấu hình QR cho một ngày"""
    
    id: str                      # UUID
    ngay: date                   # Ngày tạo QR
    loai: str                    # check_in | check_out | all
    nhan_vien_id: str | None   # Null = tất cả nhân viên
    
    # QR Content
    qr_data: str                # Nội dung QR (JSON)
    qr_image_base64: str        # Ảnh QR (Base64)
    mac: str                    # HMAC signature
    
    # Thời gian hiệu lực
    thoi_gian_hieu_luc: datetime  # Thời điểm hết hạn
    trang_thai: str              # active | expired | used
    
    # Metadata
    created_by: str              # Người tạo
    created_at: datetime
    updated_at: datetime

# CheckInOut Model
class CheckInOut:
    """Bản ghi check-in/check-out"""
    
    id: str                      # UUID
    nhan_vien_id: str           # FK → NhanVien
    ngay: date                   # Ngày check-in
    
    # Check-in
    check_in_time: datetime | None
    check_in_qr_id: str | None  # FK → QRConfig
    check_in_lat: float | None
    check_in_lng: float | None
    check_in_status: str        # on_time | late | very_late
    
    # Check-out
    check_out_time: datetime | None
    check_out_qr_id: str | None
    check_out_lat: float | None
    check_out_lng: float | None
    
    # Trạng thái
    trang_thai: str              # checked_in | checked_out | missing
    
    created_at: datetime
    updated_at: datetime
```

### 9.1.6 Use Cases (QR Attendance)

| Use Case | File | Ý nghĩa |
|----------|------|----------|
| `GenerateQRUseCase` | `generate_qr_uc.py` | Tạo QR code cho ngày hôm nay hoặc ngày chỉ định |
| `BulkGenerateQRUseCase` | `bulk_generate_qr_uc.py` | Tạo QR hàng loạt cho nhiều nhân viên |
| `CheckInUseCase` | `check_in_uc.py` | Check-in bằng QR với validate (HMAC, GPS) |
| `CheckOutUseCase` | `check_out_uc.py` | Check-out (sử dụng QR từ lần check-in gần nhất) |
| `GetMyHistoryUseCase` | `get_my_history_uc.py` | Lấy lịch sử check-in/out của nhân viên |
| `GetMyMonthlyUseCase` | `get_my_monthly_uc.py` | Lấy tổng hợp chấm công tháng |
| `AggregateMonthlyUseCase` | `aggregate_monthly_uc.py` | Tổng hợp dữ liệu tháng từ check-in/out |
| `GetQRByDateUseCase` | `get_qr_by_date_uc.py` | Lấy QR code theo ngày |

### 9.1.7 API Endpoints

**Employee Routes (`/nv/cham-cong/*`)**:
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|--------|
| POST | `/check-in` | `cham_cong:check_in` | Check-in bằng QR |
| POST | `/check-out` | `cham_cong:check_in` | Check-out |
| GET | `/history` | `cham_cong:check_in` | Lịch sử check-in/out |
| GET | `/monthly` | `cham_cong:check_in` | Tổng hợp tháng |

**Admin Routes (`/ql/cham-cong/*`)**:
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|--------|
| POST | `/qr/generate` | `cham_cong:manage` | Tạo QR |
| POST | `/qr/bulk-generate` | `cham_cong:manage` | Tạo QR hàng loạt |
| GET | `/qr/by-date` | `cham_cong:manage` | Lấy QR theo ngày |
| GET | `/qr/{qr_id}` | `cham_cong:manage` | Chi tiết QR |
| POST | `/aggregate-monthly` | `cham_cong:manage` | Tổng hợp tháng |
| GET | `/report/daily` | `cham_cong:manage` | Báo cáo ngày |
| GET | `/report/monthly-summary` | `cham_cong:manage` | Báo cáo tháng |

### 9.1.8 RBAC Permissions

```python
PERMISSION_CODES = {
    # ... existing permissions ...
    "cham_cong:check_in": "Check-in/Check-out bằng QR",
}

# Nhân viên được phép check-in
ROLE_PERMISSIONS = {
    "GIAO_VIEN": ["cham_cong:check_in", "cham_cong:view_own", ...],
    "NHAN_VIEN": ["cham_cong:check_in", "cham_cong:view_own", ...],
}
```

---

## 10. Module Lương

### 9.1 Mô tả nghiệp vụ

Lương được tính dựa trên:
- Lương cơ bản (theo bảng lương nhà nước)
- Hệ số lương (theo bậc lương)
- Phụ cấp (chức vụ, thâm niên...)
- Khấu trừ (BHXH, BHYT, thuế TNCN...)

### 9.2 Công thức tính lương

```
┌─────────────────────────────────────────────────────────────────┐
│                      CÔNG THỨC TÍNH LƯƠNG                       │
│                                                                  │
│  Lương tháng = Lương cơ bản × Hệ số lương                      │
│                                                                  │
│  Tổng lương = Lương tháng + Phụ cấp chức vụ + Phụ cấp khác    │
│                                                                  │
│  Khấu trừ = BHXH + BHYT + BHTN + Thuế TNCN + Khấu trừ khác     │
│                                                                  │
│  Lương thực nhận = Tổng lương - Khấu trừ                       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Mô hình dữ liệu

```python
# KyLuong Model
class KyLuong:
    """Kỳ lương (tháng/năm)"""
    
    id: str
    thang: int                  # Tháng
    nam: int                    # Năm
    ngay_chot: datetime | None  # Ngày chốt bảng lương
    trang_thai: str            # sap_chot | da_chot | da_duyet
    
    # Thống kê
    tong_nhan_vien: int        # Số nhân viên trong kỳ
    tong_luong: float         # Tổng lương kỳ này
    
    created_at: datetime
    updated_at: datetime

# Luong Model
class Luong:
    """Bảng lương của nhân viên"""
    
    id: str
    nhan_vien_id: str          # FK → NhanVien
    ky_luong_id: str           # FK → KyLuong
    
    # Lương
    luong_co_ban: float        # Lương cơ bản
    he_so_luong: float        # Hệ số lương
    luong_thang_nay: float    # = luong_co_ban × he_so_luong
    
    # Phụ cấp
    phu_cap_chuc_vu: float    # Theo chức vụ
    phu_cap_khac: float       # Phụ cấp khác
    tong_phu_cap: float      # = phu_cap_chuc_vu + phu_cap_khac
    
    # Tổng lương
    tong_luong: float         # = luong_thang_nay + tong_phu_cap
    
    # Khấu trừ
    bhxh: float               # Bảo hiểm xã hội (8% lương)
    bhyt: float              # Bảo hiểm y tế (1.5% lương)
    bhtn: float              # Bảo hiểm thất nghiệp (1% lương)
    thue_tncn: float         # Thuế thu nhập cá nhân
    khau_tru_khac: float     # Các khoản khấu trừ khác
    tong_khau_tru: float     # Tổng khấu trừ
    
    # Thực nhận
    luong_thuc_nhan: float   # = tong_luong - tong_khau_tru
    
    # Trạng thái
    trang_thai: str          # chua_chay | da_chay | da_duyet | da_chot
    
    created_at: datetime
    updated_at: datetime
```

---

## 11. Module Khen thưởng/Kỷ luật

### 10.1 Mô tả nghiệp vụ

Ghi nhận các hình thức khen thưởng hoặc kỷ luật đối với nhân viên.

**10.1.1 Hình thức khen thưởng**

| Hình thức | Mã | Ghi chú |
|-----------|-----|---------|
| Tăng lương | `Tang_tien` | Tăng bậc lương/thưởng |
| Bằng khen | `Bang_khen` | Cấp nhà nước/tỉnh |
| Giấy khen | `Giay_khen` | Cấp trường |
| Khác | `Khac` | Các hình thức khác |

**10.1.2 Hình thức kỷ luật**

| Hình thức | Mã | Ghi chú |
|-----------|-----|---------|
| Không xác nhận thâm niên | `Khong_xac_nhan` | Không tính thâm niên |
| Giảm lương | `Giam_luong` | Giảm bậc/thu hồi |
| Kỷ luật | `Ky_luat` | Các hình thức kỷ luật |
| Cảnh cáo | `Canh_cao` | Cảnh cáo bằng văn bản |

### 10.2 Mô hình dữ liệu

```python
# KhenThuongKyLuat Model
class KhenThuongKyLuat:
    """Khen thưởng và kỷ luật"""
    
    id: str
    nhan_vien_id: str          # FK → NhanVien
    
    loai: str                  # khen_thuong | ky_luat
    hinh_thuc: str             # Tang_tien | Bang_khen | Khong_xac_nhan | ...
    
    # Quyết định
    so_quyet_dinh: str | None  # Số quyết định
    ngay_quyet_dinh: date | None  # Ngày quyết định
    ly_do: str | None          # Lý do/thành tích
    so_tien: float | None      # Số tiền thưởng/phạt
    
    # Người tạo
    nguoi_tao_id: str
    
    created_at: datetime
```

---

## 12. Module Người thân

### 11.1 Mô tả nghiệp vụ

Lưu thông tin về gia đình và người thân của nhân viên, phục vụ:
- Liên hệ trong trường hợp khẩn cấp
- Xác nhận thông tin cá nhân
- Các chế độ liên quan gia đình

### 11.2 Mối quan hệ

| Mã | Mối quan hệ |
|----|-------------|
| `vo_chong` | Vợ/Chồng |
| `con` | Con |
| `cha` | Cha |
| `me` | Mẹ |
| `anh_chi` | Anh/Chị/Em |
| `khac` | Người thân khác |

### 11.3 Mô hình dữ liệu

```python
# NguoiThan Model
class NguoiThan:
    """Người thân của nhân viên"""
    
    id: str
    nhan_vien_id: str           # FK → NhanVien
    
    ho_ten: str                # Họ tên
    moi_quan_he: str           # vo_chong | con | cha | me | anh_chi | khac
    ngay_sinh: date | None
    so_dien_thoai: str | None
    dia_chi: str | None
    nghe_nghiep: str | None
    
    # Liên hệ khẩn cấp
    la_nguoi_lien_he_khan_cap: bool  # Có phải người liên hệ khẩn cấp
    
    created_at: datetime
    updated_at: datetime
```

---

## 13. Module Bằng cấp/Chứng chỉ

### 12.1 Mô tả nghiệp vụ

Lưu trữ thông tin về bằng cấp, chứng chỉ, chứng nhận của nhân viên, phục vụ:
- Xác nhận trình độ chuyên môn
- Theo dõi đào tạo
- Điều kiện giữ chức vụ

### 12.2 Loại tài liệu

| Mã | Loại | Ví dụ |
|----|------|-------|
| `bang` | Bằng cấp | Bằng ĐH, Bằng Ths |
| `chung_chi` | Chứng chỉ | Chứng chỉ tin học, ngoại ngữ |
| `chung_nhan` | Chứng nhận | Chứng nhận hoàn thành khóa học |
| `khoa_hoc` | Nghiên cứu khoa học | Bài báo, đề tài |

### 12.3 Mô hình dữ liệu

```python
# BangCapChungChi Model
class BangCapChungChi:
    """Bằng cấp, chứng chỉ của nhân viên"""
    
    id: str
    nhan_vien_id: str           # FK → NhanVien
    
    loai: str                   # bang | chung_chi | chung_nhan | khoa_hoc
    ten_bang: str               # Tên bằng/chứng chỉ
    nganh: str | None           # Ngành/chuyên ngành
    xep_loai: str | None       # Gioi | Kha | Trung_binh | Yeu
    nam_cap: int | None         # Năm cấp
    noi_cap: str | None         # Nơi cấp
    so_hieu: str | None         # Số hiệu bằng
    file_dinh_kem: str | None   # URL file scan
    
    ghi_chu: str | None
    
    created_at: datetime
    updated_at: datetime
```

---

## 14. Module Authentication & RBAC

### 13.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                          │
│                                                                  │
│  1. Đăng nhập: username + password                            │
│     ↓                                                           │
│  2. Validate credentials                                        │
│     ↓                                                           │
│  3. Tạo JWT token với payload:                                 │
│     {                                                          │
│       "sub": tai_khoan_id,                                    │
│       "nhan_vien_id": nv_id,                                  │
│       "vai_tro": vai_tro,                                     │
│       "permissions": [perms],                                  │
│       "exp": expiration                                        │
│     }                                                          │
│     ↓                                                           │
│  4. Lưu token vào HTTP-only cookie                            │
│     ↓                                                           │
│  5. Gửi token về client                                        │
│     ↓                                                           │
│  6. Client gửi kèm token trong header Authorization            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 RBAC (Role-Based Access Control)

```python
ROLE_PERMISSIONS = {
    "ADMIN": ["*"],  # Tất cả quyền
    
    "HIEU_TRUONG": [
        "nhan_vien:create", "nhan_vien:read", "nhan_vien:update",
        "phong_ban:create", "phong_ban:read", "phong_ban:update",
        "chuc_vu:create", "chuc_vu:read", "chuc_vu:update",
        "nghi_phep:create", "nghi_phep:read", "nghi_phep:manage",
        "luong:read", "luong:create", "luong:update",
        "cham_cong:manage",
    ],
    
    "HIEU_PHO": [
        "nhan_vien:read", "nhan_vien:update",
        "phong_ban:read", "chuc_vu:read",
        "nghi_phep:create", "nghi_phep:read", "nghi_phep:manage",
        "luong:read",
        "cham_cong:manage",
    ],
    
    "TO_TRUONG": [
        "nhan_vien:read",
        "phong_ban:read",
        "nghi_phep:create", "nghi_phep:read", "nghi_phep:manage",
        "luong:read",
    ],
    
    "GIAO_VIEN": [
        "nghi_phep:create", "nghi_phep:view_own",
        "luong:view_own",
        "cham_cong:view_own",
    ],
    
    "NHAN_VIEN": [
        "nghi_phep:create", "nghi_phep:view_own",
        "luong:view_own",
        "cham_cong:view_own",
    ],
}
```

### 13.3 Mô hình dữ liệu

```python
# TaiKhoan Model
class TaiKhoan:
    """Tài khoản đăng nhập"""
    
    id: str
    ten_dang_nhap: str         # Username (UNIQUE)
    mat_khau_hash: str         # Bcrypt hash
    email: str | None         # Email (UNIQUE)
    nhan_vien_id: str | None  # FK → NhanVien (nullable cho Admin)
    
    # Trạng thái
    trang_thai: str            # active | inactive
    vai_tro: str              # ADMIN | HIEU_TRUONG | HIEU_PHO | ...
    
    # Audit
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime

# Role Model
class Role:
    id: str
    ten: str                  # Tên vai trò
    ma: str                   # Mã vai trò
    mo_ta: str | None

# Permission Model
class Permission:
    id: str
    ma: str                   # Mã quyền (VD: nhan_vien:create)
    mo_ta: str               # Mô tả
    module: str              # Module (VD: nhan_vien)

# RolePermission Model (Many-to-Many)
class RolePermission:
    role_id: str
    permission_id: str
```

---

## 15. Ràng buộc toàn vẹn dữ liệu

### 14.1 Database Constraints

```sql
-- UNIQUE constraints
nhan_vien.ma_nhan_vien: UNIQUE
nhan_vien.email: UNIQUE
nhan_vien.so_cccd: UNIQUE (WHERE deleted_at IS NULL)
phong_ban.ma_phong_ban: UNIQUE (auto-generated PB-xxxxxx if not provided)
chuc_vu.ma_chuc_vu: UNIQUE (auto-generated CV-xxxxxx if not provided)
tai_khoan.ten_dang_nhap: UNIQUE
hop_dong.nhan_vien_id + hop_dong.so_hop_dong: UNIQUE

-- FOREIGN KEY constraints
nhan_vien.phong_ban_id → phong_ban.id
nhan_vien.chuc_vu_id → chuc_vu.id
don_xin_nghi.nhan_vien_id → nhan_vien.id
luong.nhan_vien_id → nhan_vien.id

-- CHECK constraints
nhan_vien.bac_luong: CHECK (1-10)
chuc_vu.cap_bac: CHECK (1-10)
so_ngay_phep.phep_nam_con_lai: CHECK (>= 0)
```

### 14.2 Business Rules Implementation

| STT | Rule | Implementation |
|-----|------|----------------|
| 1 | Loại NV + Chức vụ tương thích | `validate_loai_compatibility()` |
| 2 | Mỗi NV 1 CongTac chính | Trigger/database constraint |
| 3 | Ngày phép >= hôm nay | Validation in `create_don_nghi()` |
| 4 | Không đơn trùng ngày | `find_overlapping()` |
| 5 | Chỉ duyệt khi `cho_duyet` | Validation in `duyet_don_nghi()` |
| 6 | Lương không sửa sau chốt | Check `trang_thai != da_chot` |

---

*Document version: 2.0*
*Last updated: 2026-05-13*
*Authors: Development Team*

---

## Phụ lục: Cấu trúc thư mục Use Cases

```
backend/src/app/usecases/
├── __init__.py                    # Consolidated exports (index)
├── nhan_vien/                    # Employee CRUD
│   ├── create_nhan_vien_uc.py
│   ├── get_nhan_vien_uc.py
│   ├── update_nhan_vien_uc.py
│   ├── delete_nhan_vien_uc.py
│   ├── restore_nhan_vien_uc.py
│   ├── import_nhan_vien_uc.py
│   ├── batch_phan_bo_uc.py
│   ├── batch_phan_bo_chuc_vu_uc.py
│   ├── batch_bo_nhiem_uc.py
│   ├── helpers.py
│   └── __init__.py
├── phong_ban/                    # Department CRUD
│   ├── create_phong_ban_uc.py
│   ├── get_phong_ban_uc.py
│   ├── update_phong_ban_uc.py
│   ├── delete_phong_ban_uc.py
│   ├── helpers.py
│   └── __init__.py
├── chuc_vu/                      # Position CRUD
│   ├── create_chuc_vu_uc.py
│   ├── get_chuc_vu_uc.py
│   ├── update_chuc_vu_uc.py
│   ├── delete_chuc_vu_uc.py
│   └── __init__.py
├── hop_dong/                     # Contract
│   ├── hop_dong_uc.py
│   └── __init__.py
├── cong_tac/                     # Work assignment
│   ├── __init__.py
│   └── (uses CongTacUseCase)
├── lich_su_chuc_vu/              # Position history
│   ├── get_lich_su_chuc_vu_uc.py
│   └── __init__.py
├── nghi_phep/                    # Leave management
│   ├── nghi_phep_uc.py
│   ├── cham_cong_uc.py
│   └── __init__.py
├── luong/                        # Salary
│   ├── luong_uc.py
│   ├── tinh_luong_uc.py
│   └── __init__.py
├── tai_lieu/                     # Documents
│   ├── tai_lieu_uc.py
│   ├── commands.py
│   └── __init__.py
├── sub_module/                   # Family, Degree, Reward
│   ├── nguoi_than_uc.py
│   ├── bang_cap_uc.py
│   ├── khen_thuong_ky_luat_uc.py
│   └── __init__.py
├── employee/                     # Employee self-service
│   ├── employee_uc.py
│   ├── commands.py
│   └── __init__.py
├── auth/                         # Authentication
│   ├── login_uc.py
│   └── __init__.py
├── dashboard/                    # Admin dashboard
│   ├── admin_dashboard_uc.py
│   └── __init__.py
├── dieu_chuyen/                  # Employee transfer (NEW)
│   ├── transfer_employee_uc.py
│   └── __init__.py
└── ho_so/                       # Employee profile (NEW)
    ├── ho_so_nhan_su_uc.py
    └── __init__.py
```
