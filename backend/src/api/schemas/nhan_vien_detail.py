from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# ============ Sub-models ============


class PhongBanBrief(BaseModel):
    id: str
    ten_phong_ban: str

    class Config:
        from_attributes = True


class ChucVuBrief(BaseModel):
    id: str
    ten_chuc_vu: str

    class Config:
        from_attributes = True


class HopDongBrief(BaseModel):
    id: str
    loai_hop_dong: str
    ngay_ky: Optional[date] = None
    ngay_hieu_luc: Optional[date] = None
    ngay_het_han: Optional[date] = None
    trang_thai: str

    class Config:
        from_attributes = True


class CongTacBrief(BaseModel):
    id: str
    phong_ban_id: str
    chuc_vu_id: str
    phong_ban: Optional[PhongBanBrief] = None
    chuc_vu: Optional[ChucVuBrief] = None
    ngay_bat_dau: Optional[datetime] = None
    ngay_ket_thuc: Optional[datetime] = None
    is_primary: bool = False
    trang_thai: str = "dang_cong_tac"

    class Config:
        from_attributes = True


class LichSuChucVuBrief(BaseModel):
    id: str
    chuc_vu_id: str
    chuc_vu: Optional[ChucVuBrief] = None
    ngay_bo_nhiem: Optional[date] = None
    ngay_cham_dut: Optional[date] = None
    trang_thai: str

    class Config:
        from_attributes = True


class NguoiThanBrief(BaseModel):
    id: str
    ho_ten: str
    quan_he: Optional[str] = None

    class Config:
        from_attributes = True


class BangCapBrief(BaseModel):
    id: str
    loai: str
    ten_bang: str
    chuyen_nganh: Optional[str] = None
    truong_cap: Optional[str] = None
    nam_cap: Optional[int] = None
    xep_loai: Optional[str] = None
    ghi_chu: Optional[str] = None

    class Config:
        from_attributes = True


class KhenThuongBrief(BaseModel):
    id: str
    loai: str
    hinh_thuc: Optional[str] = None
    ngay_quyet_dinh: Optional[date] = None

    class Config:
        from_attributes = True


class KyLuatBrief(BaseModel):
    id: str
    loai: str
    hinh_thuc: Optional[str] = None
    ngay_quyet_dinh: Optional[date] = None

    class Config:
        from_attributes = True


class LuongBrief(BaseModel):
    id: str
    he_so_luong: float
    ngay_ap_dung: Optional[date] = None

    class Config:
        from_attributes = True


# ============ Main Response ============


class NhanVienDetailResponse(BaseModel):
    """Unified response for NhanVien detail with all related data."""

    # Basic info
    id: str
    ma_nhan_vien: str
    ho_ten: str
    gioi_tinh: str
    ngay_sinh: date
    que_quan: Optional[str] = None
    dia_chi_thuong_tru: Optional[str] = None
    dia_chi_tam_tru: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    email: Optional[str] = None
    email_ca_nhan: Optional[str] = None
    so_cccd: Optional[str] = None
    ngay_cap_cccd: Optional[date] = None
    noi_cap_cccd: Optional[str] = None
    anh_dai_dien: Optional[str] = None
    cccd_front: Optional[str] = None
    cccd_back: Optional[str] = None
    noi_sinh: Optional[str] = None
    dan_toc: Optional[str] = None
    ton_giao: Optional[str] = None
    tinh_trang_hon_nhan: Optional[str] = None
    loai_nhan_vien: str
    cap_hoc: Optional[str] = None
    mon_day: Optional[str] = None
    hang_chuc_danh: Optional[str] = None
    ngach_luong: Optional[str] = None
    bac_luong: Optional[int] = None
    he_so_luong: Optional[str] = None
    so_nam_tham_nien: Optional[int] = None
    phong_ban_id: Optional[str] = None
    chuc_vu_id: Optional[str] = None
    phong_ban: Optional[PhongBanBrief] = None
    chuc_vu: Optional[ChucVuBrief] = None
    loai_hop_dong: str
    so_hop_dong: Optional[str] = None
    ngay_vao_lam: Optional[date] = None
    ngay_het_hop_dong: Optional[date] = None
    hinh_thuc_tuyen_dung: Optional[str] = None
    noi_ky_hop_dong: Optional[str] = None
    phu_cap_chuc_vu: Optional[str] = None
    ngay_bo_nhiem_chuc_vu: Optional[date] = None
    la_dang_vien: bool = False
    ngay_vao_dang: Optional[date] = None
    la_doan_vien: bool = False
    ngay_vao_doan: Optional[date] = None
    so_bao_hiem: Optional[str] = None
    ngay_tham_gia_bhxh: Optional[date] = None
    ten_ngan_hang: Optional[str] = None
    so_tai_khoan_ngan_hang: Optional[str] = None
    ghi_chu: Optional[str] = None
    trang_thai: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    # Related data
    hop_dongs: List[HopDongBrief] = []
    cong_tacs: List[CongTacBrief] = []
    lich_su_chuc_vu: List[LichSuChucVuBrief] = []
    nguoi_thans: List[NguoiThanBrief] = []
    bang_caps: List[BangCapBrief] = []
    khen_thuongs: List[KhenThuongBrief] = []
    ky_luats: List[KyLuatBrief] = []
    luong_hien_tai: Optional[LuongBrief] = None

    class Config:
        from_attributes = True
