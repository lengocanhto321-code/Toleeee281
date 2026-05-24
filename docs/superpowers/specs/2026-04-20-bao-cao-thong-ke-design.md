# Báo cáo & Thống kê - Design Spec

> Ngày: 2026-04-20
> Trạng thái: Approved
> Phạm vi: Tác nhân Admin - Báo cáo thống kê (3 nhóm: Nhân sự, Chấm công, Lương)

---

## 1. Tổng quan

Xây dựng module Báo cáo & Thống kê cho admin, bao gồm 3 nhóm báo cáo (9 báo cáo chi tiết) với khả năng lọc đa tiêu chí, xem online qua biểu đồ/bảng biểu, và xuất file Excel/PDF.

### Yêu cầu

- **Phạm vi**: Cả 3 nhóm báo cáo (Nhân sự, Chấm công, Lương) triển khai cùng lúc
- **UI**: 1 trang duy nhất `/bao-cao` với tabs chuyển đổi giữa các nhóm
- **Bộ lọc**: Tháng/năm, khoảng thời gian tự do, phòng ban, loại nhân viên, trạng thái
- **Export**: Excel (.xlsx) và PDF
- **Biểu đồ**: shadcn/ui Chart components (wrapper quanh Recharts)

### Giới hạn (Out of scope)

- Báo cáo cho tác nhân Employee (chỉ admin)
- Dashboard analytics nâng cao (riêng phase khác)
- Lập lịch báo cáo tự động / gửi email

---

## 2. Kiến trúc Backend

### 2.1 API Endpoints

Route mới: `backend/src/api/routes/quan_ly/bao_cao.py`, prefix `/bao-cao`.

| Method | Endpoint | Use Case | Permission |
|--------|----------|----------|------------|
| GET | `/bao-cao/nhan-su/tong-hop` | `BaoCaoNhanSuTongHopUseCase` | `bao_cao:read` |
| GET | `/bao-cao/nhan-su/bien-dong` | `BaoCaoBienDongUseCase` | `bao_cao:read` |
| GET | `/bao-cao/nhan-su/demo-graphics` | `BaoCaoDemoGraphicsUseCase` | `bao_cao:read` |
| GET | `/bao-cao/nhan-su/trinh-do` | `BaoCaoTrinhDoUseCase` | `bao_cao:read` |
| GET | `/bao-cao/cham-cong/tong-hop` | `BaoCaoChamCongTongHopUseCase` | `bao_cao:read` |
| GET | `/bao-cao/cham-cong/muon-som` | `BaoCaoMuonSomUseCase` | `bao_cao:read` |
| GET | `/bao-cao/cham-cong/nghi-phep` | `BaoCaoNghiPhepUseCase` | `bao_cao:read` |
| GET | `/bao-cao/luong/chi-phi` | `BaoCaoChiPhiUseCase` | `bao_cao:read` |
| GET | `/bao-cao/luong/thue-bhxh` | `BaoCaoThueBHXHUseCase` | `bao_cao:read` |
| POST | `/bao-cao/export` | `ExportBaoCaoUseCase` | `bao_cao:export` |

### 2.2 Use Cases

Thư mục: `backend/src/app/usecases/bao_cao/`

```
bao_cao/
├── __init__.py
├── nhan_su/
│   ├── __init__.py
│   ├── tong_hop_uc.py
│   ├── bien_dong_uc.py
│   ├── demo_graphics_uc.py
│   └── trinh_do_uc.py
├── cham_cong/
│   ├── __init__.py
│   ├── tong_hop_uc.py
│   ├── muon_som_uc.py
│   └── nghi_phep_uc.py
├── luong/
│   ├── __init__.py
│   ├── chi_phi_uc.py
│   └── thue_bhxh_uc.py
└── export/
    ├── __init__.py
    └── export_uc.py
```

Mỗi UseCase tuân theo pattern hiện tại:
- Nhận command (filters: thang, nam, tu_ngay, den_ngay, phong_ban_id, loai_nhan_vien, trang_thai)
- Dùng UnitOfWork để query qua BaoCaoRepository
- Trả về `Result[DataClass, Error]`

### 2.3 Repository

File: `backend/src/service/repositories/bao_cao_repository.py`

Một repository duy nhất chứa các query aggregation cho tất cả báo cáo. Các query dùng SQLAlchemy 2.0 select/func (GROUP BY, JOIN, subquery) theo pattern hiện tại trong `admin_dashboard_uc.py`.

### 2.4 Permissions

Thêm 2 permissions mới vào seed data:
- `bao_cao:read` - Xem báo cáo
- `bao_cao:export` - Xuất file báo cáo

Gán cho roles: ADMIN, HIEU_TRUONG, HIEU_PHO.

### 2.5 Dependencies

```bash
pip install openpyxl reportlab
```

- `openpyxl`: Tạo file Excel (.xlsx)
- `reportlab`: Tạo file PDF

---

## 3. Chi tiết Data trả về

### 3.1 Báo cáo Nhân sự

#### TongHop (Tổng hợp nhân sự)

```python
@dataclass
class BaoCaoNhanSuTongHopResult:
    tong_nhan_vien: int
    dang_lam: int
    nghi_viec: int
    nghi_huu: int
    theo_gioi_tinh: dict  # {nam: N, nu: N, khac: N}
    theo_loai_nv: dict    # {giao_vien: N, can_bo: N, nhan_vien: N}
    theo_phong_ban: list  # [{ten_phong_ban: str, so_luong: int}]
    theo_trang_thai_hop_dong: dict  # {xac_dinh_thoi_han: N, khong_xac_dinh: N, ...}
```

#### BienDong (Biến động nhân sự)

```python
@dataclass
class BaoCaoBienDongResult:
    ky_truoc: dict        # {tong, dang_lam, nghi_viec, nghi_huu}
    ky_hien_tai: dict     # {tong, dang_lam, nghi_viec, nghi_huu}
    bien_dong: dict       # {tang, giam, phan_tram_thay_doi}
    chi_tiet_tang: list   # [{nhan_vien_id, ho_ten, phong_ban, ngay_vao, ly_do}]
    chi_tiet_giam: list   # [{nhan_vien_id, ho_ten, phong_ban, ngay_nghi, ly_do}]
```

#### DemoGraphics (Tuổi & Giới tính)

```python
@dataclass
class BaoCaoDemoGraphicsResult:
    phan_bo_tuoi: list    # [{nhom_tuoi: "20-25", nam: N, nu: N, tong: N}]
    tuoi_trung_binh: float
    theo_gioi_tinh: dict  # {nam, nu, khac, phan_tram_nam, phan_tram_nu}
    theo_dan_toc: list    # [{dan_toc: str, so_luong: int}]
    theo_ton_giao: list   # [{ton_giao: str, so_luong: int}]
```

#### TrinhDo (Trình độ chuyên môn)

```python
@dataclass
class BaoCaoTrinhDoResult:
    theo_bang_cap: list       # [{ten_bang: str, so_luong: int, ty_le: float}]
    theo_chuyen_nganh: list   # [{chuyen_nganh: str, so_luong: int}]
    theo_loai_nv_bang_cap: list  # [{loai_nv, ten_bang, so_luong}]
    phan_bo_bac_luong: list   # [{bac_luong: int, so_luong: int}]
```

### 3.2 Báo cáo Chấm công

#### TongHop (Tổng hợp chấm công)

```python
@dataclass
class BaoCaoChamCongTongHopResult:
    tong_so_nhan_vien: int
    so_ngay_cong_chuan: int
    tb_ngay_cong: float
    tb_ngay_nghi: float
    tb_ngay_di_muon: float
    theo_phong_ban: list      # [{ten_phong_ban, tb_ngay_cong, tb_ngay_nghi}]
    phan_bo_cham_cong: dict   # {xuat_sac: N, tot: N, trung_binh: N, kem: N}
```

#### MuonSom (Đi muộn về sớm)

```python
@dataclass
class BaoCaoMuonSomResult:
    tong_lan_muon: int
    tong_lan_ve_som: int
    tb_phut_muon: float
    top_nhan_vien_muon: list  # [{ho_ten, phong_ban, so_lan_muon, tong_phut}]
    theo_phong_ban: list      # [{ten_phong_ban, so_lan_muon, so_lan_ve_som}]
```

#### NghiPhep (Nghỉ phép)

```python
@dataclass
class BaoCaoNghiPhepResult:
    tong_don: int
    da_duyet: int
    tu_choi: int
    cho_duyet: int
    theo_loai_nghi: list      # [{loai: str, so_luong: int, tong_ngay: int}]
    theo_phong_ban: list      # [{ten_phong_ban: str, so_ngay_nghi: int}]
    theo_thang: list          # [{thang: int, so_ngay_nghi: int}]
```

### 3.3 Báo cáo Lương

#### ChiPhi (Chi phí nhân sự)

```python
@dataclass
class BaoCaoChiPhiResult:
    tong_chi_phi: float
    tb_luong: float
    luong_cao_nhat: float
    luong_thap_nhat: float
    theo_phong_ban: list      # [{ten_phong_ban, tong_chi_phi, tb_luong, so_nhan_vien}]
    theo_loai_nv: list        # [{loai: str, tong_chi_phi: float}]
    theo_ky: list             # [{ky: str, tong_chi_phi: float}]  (6-12 tháng gần nhất)
    phan_bo_phu_cap: dict     # {tong_phu_cap, tb_phu_cap}
```

#### ThueBHXH (Thuế & Bảo hiểm)

```python
@dataclass
class BaoCaoThueBHXHResult:
    tong_thue_tncn: float
    tong_bhxh_nv: float
    tong_bhxh_dn: float
    tong_bhyt_nv: float
    tong_bhyt_dn: float
    tong_bhtn: float
    tong_khau_tru: float
    theo_thang: list          # [{thang, thue_tncn, bhxh, bhyt, bhtn}]
```

### 3.4 Export

Request body:

```python
class ExportBaoCaoRequest(BaseModel):
    loai_bao_cao: str       # "nhan_su_tong_hop", "cham_cong_tong_hop", ...
    format: str             # "excel" | "pdf"
    filters: dict           # {thang, nam, tu_ngay, den_ngay, phong_ban_id, ...}
```

Response: `StreamingResponse` với content-type phù hợp (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` hoặc `application/pdf`).

---

## 4. Frontend

### 4.1 Route

`/bao-cao` - Trang duy nhất cho tất cả báo cáo.

### 4.2 Component Structure

```
frontend/src/app/(admin)/bao-cao/
├── page.tsx                              # Trang chính: bộ lọc + tabs layout
├── _components/
│   ├── bao-cao-filters.tsx               # Bộ lọc chung (tháng/năm, khoảng TG, PB, loại NV, trạng thái)
│   ├── bao-cao-tabs.tsx                  # Main tabs (Nhân sự / Chấm công / Lương)
│   ├── bao-cao-export-button.tsx         # Nút export Excel/PDF dropdown
│   ├── nhan-su/
│   │   ├── tong-hop-tab.tsx              # KPI cards + PieChart (PB, loại NV) + BarChart (giới tính)
│   │   ├── bien-dong-tab.tsx             # So sánh kỳ + bảng chi tiết tăng/giảm
│   │   ├── demo-graphics-tab.tsx         # BarChart (nhóm tuổi) + PieChart (giới tính) + BarChart (dân tộc)
│   │   └── trinh-do-tab.tsx              # BarChart (bằng cấp) + cross-tab table
│   ├── cham-cong/
│   │   ├── tong-hop-tab.tsx              # KPI cards + BarChart (theo PB) + PieChart (phân bố)
│   │   ├── muon-som-tab.tsx              # KPI cards + BarChart (theo PB) + table (top muộn)
│   │   └── nghi-phep-tab.tsx             # PieChart (loại nghỉ) + BarChart (PB) + LineChart (theo tháng)
│   └── luong/
│       ├── chi-phi-tab.tsx               # KPI cards + LineChart (trend) + BarChart (PB)
│       └── thue-bhxh-tab.tsx             # KPI cards + stacked BarChart (theo tháng)
```

### 4.3 Hooks

```
frontend/src/hooks/bao-cao/
├── use-bao-cao-nhan-su.ts      # 4 query hooks: useNhanSuTongHop, useNhanSuBienDong, useNhanSuDemo, useNhanSuTrinhDo
├── use-bao-cao-cham-cong.ts    # 3 query hooks: useChamCongTongHop, useChamCongMuonSom, useChamCongNghiPhep
├── use-bao-cao-luong.ts        # 2 query hooks: useLuongChiPhi, useLuongThueBHXH
└── use-bao-cao-export.ts       # 1 mutation hook: useExportBaoCao
```

### 4.4 Types

```
frontend/src/types/bao-cao.types.ts    # Tất cả response types cho 9 báo cáo + filter types + export types
```

### 4.5 Biểu đồ

Sử dụng shadcn/ui Chart components (`ChartContainer`, `ChartTooltip`, `ChartLegend`, `ChartConfig`) từ `frontend/src/components/ui/chart.tsx`, bọc quanh Recharts primitives:

- **PieChart**: Phân bổ giới tính, loại NV, loại nghỉ, phân bố chấm công
- **BarChart**: So sánh theo phòng ban, tuổi, bằng cấp, đi muộn
- **LineChart**: Trend biến động chi phí, nghỉ phép theo tháng
- **AreaChart / Stacked BarChart**: Thuế & BHXH theo tháng

### 4.6 Sidebar

Thêm item vào `navItems` trong `app-sidebar.tsx`:

```typescript
{
  title: "Báo cáo",
  url: "/bao-cao",
  icon: BarChart3,  // từ lucide-react
}
```

### 4.7 API Endpoints (frontend)

Thêm vào `frontend/src/types/api.types.ts`:

```typescript
baoCao: {
  nhanSu: {
    tongHop: '/bao-cao/nhan-su/tong-hop',
    bienDong: '/bao-cao/nhan-su/bien-dong',
    demoGraphics: '/bao-cao/nhan-su/demo-graphics',
    trinhDo: '/bao-cao/nhan-su/trinh-do',
  },
  chamCong: {
    tongHop: '/bao-cao/cham-cong/tong-hop',
    muonSom: '/bao-cao/cham-cong/muon-som',
    nghiPhep: '/bao-cao/cham-cong/nghi-phep',
  },
  luong: {
    chiPhi: '/bao-cao/luong/chi-phi',
    thueBhxh: '/bao-cao/luong/thue-bhxh',
  },
  export: '/bao-cao/export',
}
```

---

## 5. Bộ lọc chung

Tất cả API endpoints nhận cùng một bộ query parameters:

| Parameter | Type | Mô tả |
|-----------|------|--------|
| `thang` | int (optional) | Tháng (1-12) |
| `nam` | int (optional) | Năm |
| `tu_ngay` | str (optional) | Từ ngày (ISO format) |
| `den_ngay` | str (optional) | Đến ngày (ISO format) |
| `phong_ban_id` | str (optional) | Lọc theo phòng ban |
| `loai_nhan_vien` | str (optional) | giao_vien / can_bo / nhan_vien |
| `trang_thai` | str (optional) | dang_lam / nghi_viec / nghi_huu |

Logic ưu tiên: Nếu có `tu_ngay` + `den_ngay` thì dùng khoảng thời gian đó, ngược lại dùng `thang` + `nam`. Nếu không có gì, mặc định là tháng hiện tại.

Frontend hiển thị 2 chế độ chọn thời gian:
1. **Chọn nhanh**: Dropdown tháng/năm
2. **Khoảng tự do**: Date range picker (từ ngày - đến ngày)

---

## 6. Files cần tạo/sửa

### Backend - Files mới

| File | Mô tả |
|------|--------|
| `backend/src/api/routes/quan_ly/bao_cao.py` | API route với 10 endpoints |
| `backend/src/app/usecases/bao_cao/__init__.py` | Module init |
| `backend/src/app/usecases/bao_cao/nhan_su/__init__.py` | Module init |
| `backend/src/app/usecases/bao_cao/nhan_su/tong_hop_uc.py` | Tổng hợp nhân sự |
| `backend/src/app/usecases/bao_cao/nhan_su/bien_dong_uc.py` | Biến động nhân sự |
| `backend/src/app/usecases/bao_cao/nhan_su/demo_graphics_uc.py` | Demographics |
| `backend/src/app/usecases/bao_cao/nhan_su/trinh_do_uc.py` | Trình độ chuyên môn |
| `backend/src/app/usecases/bao_cao/cham_cong/__init__.py` | Module init |
| `backend/src/app/usecases/bao_cao/cham_cong/tong_hop_uc.py` | Tổng hợp chấm công |
| `backend/src/app/usecases/bao_cao/cham_cong/muon_som_uc.py` | Đi muộn/về sớm |
| `backend/src/app/usecases/bao_cao/cham_cong/nghi_phep_uc.py` | Nghỉ phép |
| `backend/src/app/usecases/bao_cao/luong/__init__.py` | Module init |
| `backend/src/app/usecases/bao_cao/luong/chi_phi_uc.py` | Chi phí nhân sự |
| `backend/src/app/usecases/bao_cao/luong/thue_bhxh_uc.py` | Thuế & BHXH |
| `backend/src/app/usecases/bao_cao/export/__init__.py` | Module init |
| `backend/src/app/usecases/bao_cao/export/export_uc.py` | Export Excel/PDF |
| `backend/src/service/repositories/bao_cao_repository.py` | Repository cho aggregation queries |

### Backend - Files sửa

| File | Thay đổi |
|------|----------|
| `backend/src/api/routes/__init__.py` | Thêm `bao_cao_router` |
| `backend/src/api/routes/quan_ly/__init__.py` | Export bao_cao_router |
| `backend/src/service/unit_of_work.py` | Thêm `bao_cao_repository` |

### Frontend - Files mới

| File | Mô tả |
|------|--------|
| `frontend/src/app/(admin)/bao-cao/page.tsx` | Trang báo cáo chính |
| `frontend/src/app/(admin)/bao-cao/_components/bao-cao-filters.tsx` | Bộ lọc |
| `frontend/src/app/(admin)/bao-cao/_components/bao-cao-tabs.tsx` | Tabs chính |
| `frontend/src/app/(admin)/bao-cao/_components/bao-cao-export-button.tsx` | Export button |
| `frontend/src/app/(admin)/bao-cao/_components/nhan-su/tong-hop-tab.tsx` | Tab tổng hợp NS |
| `frontend/src/app/(admin)/bao-cao/_components/nhan-su/bien-dong-tab.tsx` | Tab biến động |
| `frontend/src/app/(admin)/bao-cao/_components/nhan-su/demo-graphics-tab.tsx` | Tab demographics |
| `frontend/src/app/(admin)/bao-cao/_components/nhan-su/trinh-do-tab.tsx` | Tab trình độ |
| `frontend/src/app/(admin)/bao-cao/_components/cham-cong/tong-hop-tab.tsx` | Tab tổng hợp CC |
| `frontend/src/app/(admin)/bao-cao/_components/cham-cong/muon-som-tab.tsx` | Tab muộn/sớm |
| `frontend/src/app/(admin)/bao-cao/_components/cham-cong/nghi-phep-tab.tsx` | Tab nghỉ phép |
| `frontend/src/app/(admin)/bao-cao/_components/luong/chi-phi-tab.tsx` | Tab chi phí |
| `frontend/src/app/(admin)/bao-cao/_components/luong/thue-bhxh-tab.tsx` | Tab thuế BHXH |
| `frontend/src/hooks/bao-cao/use-bao-cao-nhan-su.ts` | 4 query hooks NS |
| `frontend/src/hooks/bao-cao/use-bao-cao-cham-cong.ts` | 3 query hooks CC |
| `frontend/src/hooks/bao-cao/use-bao-cao-luong.ts` | 2 query hooks lương |
| `frontend/src/hooks/bao-cao/use-bao-cao-export.ts` | 1 mutation hook export |
| `frontend/src/types/bao-cao.types.ts` | Types cho báo cáo |

### Frontend - Files sửa

| File | Thay đổi |
|------|----------|
| `frontend/src/components/app-sidebar.tsx` | Thêm navItem "Báo cáo" |
| `frontend/src/types/api.types.ts` | Thêm baoCao endpoints |
