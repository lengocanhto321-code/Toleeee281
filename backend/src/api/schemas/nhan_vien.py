from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date, datetime
from typing import Optional


class NhanVienBase(BaseModel):
    ho_ten: str = Field(..., min_length=2, max_length=100)
    gioi_tinh: str = Field(..., pattern="^(Nam|Nữ|Khác)$")

    @validator("gioi_tinh", pre=True)
    def normalize_gioi_tinh(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v.capitalize()
        return v

    ngay_sinh: date = Field(...)
    que_quan: str = Field(..., min_length=1, max_length=200)
    dia_chi_thuong_tru: str = Field(..., min_length=1, max_length=255)
    dia_chi_tam_tru: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: str = Field(..., max_length=15)
    email: Optional[EmailStr] = Field(None, max_length=100)
    email_ca_nhan: Optional[EmailStr] = Field(None, max_length=100)
    so_cccd: str = Field(..., max_length=12)
    ngay_cap_cccd: date = Field(...)
    noi_cap_cccd: str = Field(..., min_length=1, max_length=200)
    anh_dai_dien: Optional[str] = Field(None, max_length=500)
    cccd_front: Optional[str] = Field(None, max_length=500)
    cccd_back: Optional[str] = Field(None, max_length=500)
    noi_sinh: str = Field(..., min_length=1, max_length=200)
    dan_toc: str = Field(..., min_length=1, max_length=50)
    ton_giao: Optional[str] = Field(None, max_length=50)
    loai_nhan_vien: str = Field(
        default="giao_vien", pattern="^(giao_vien|nhan_vien|can_bo|chuyen_mon)$"
    )
    cap_hoc: str = Field(..., max_length=20)
    mon_day: Optional[str] = Field(None, max_length=100)
    hang_chuc_danh: Optional[str] = Field(None, max_length=50)
    ngach_luong: Optional[str] = Field(None, max_length=50)
    bac_luong: Optional[int] = Field(None, ge=1, le=10)
    he_so_luong: Optional[str] = Field(None, max_length=10)
    so_nam_tham_nien: Optional[int] = Field(None, ge=0)
    phong_ban_id: str = Field(..., min_length=1, max_length=32)
    chuc_vu_id: str = Field(..., min_length=1, max_length=32)
    loai_hop_dong: str = Field(default="vien_chuc", max_length=30)
    so_hop_dong: Optional[str] = Field(None, max_length=50)
    luong_co_ban: Optional[float] = Field(None, ge=0)
    ngay_vao_lam: date = Field(...)
    ngay_het_hop_dong: Optional[date] = Field(None)
    hinh_thuc_tuyen_dung: Optional[str] = Field(None, max_length=100)
    noi_ky_hop_dong: Optional[str] = Field(None, max_length=200)
    phu_cap_chuc_vu: Optional[str] = Field(None, max_length=20)
    ngay_bo_nhiem_chuc_vu: Optional[date] = Field(None)
    la_dang_vien: bool = Field(default=False)
    la_doan_vien: bool = Field(default=False)
    ngay_vao_dang: Optional[date] = Field(None)
    ngay_vao_doan: Optional[date] = Field(None)
    tinh_trang_hon_nhan: str = Field(..., max_length=20)

    so_bao_hiem: Optional[str] = Field(None, max_length=20)
    ngay_tham_gia_bhxh: Optional[date] = Field(None)

    ten_ngan_hang: Optional[str] = Field(None, max_length=100)
    so_tai_khoan_ngan_hang: Optional[str] = Field(None, max_length=30)

    ghi_chu: Optional[str] = Field(None)
    trang_thai: str = Field(
        default="dang_lam", pattern="^(dang_lam|nghi_viec|nghi_huu|da_xoa)$"
    )

    @validator("ngay_het_hop_dong")
    def validate_contract_dates(cls, v, values):
        if (
            v is not None
            and "ngay_vao_lam" in values
            and values["ngay_vao_lam"] is not None
        ):
            if v < values["ngay_vao_lam"]:
                raise ValueError("Ngày hết hạn hợp đồng phải sau ngày vào làm")
        return v


class NhanVienCreateRequest(NhanVienBase):
    pass


class NhanVienUpdateRequest(BaseModel):
    ho_ten: Optional[str] = Field(None, min_length=2, max_length=100)
    gioi_tinh: Optional[str] = Field(None, pattern="^(Nam|Nữ|Khác)$")
    ngay_sinh: Optional[date] = None
    que_quan: Optional[str] = Field(None, max_length=200)
    dia_chi_thuong_tru: Optional[str] = Field(None, max_length=255)
    dia_chi_tam_tru: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = Field(None, max_length=100)
    email_ca_nhan: Optional[EmailStr] = Field(None, max_length=100)
    so_cccd: Optional[str] = Field(None, max_length=12)
    ngay_cap_cccd: Optional[date] = None
    noi_cap_cccd: Optional[str] = Field(None, max_length=200)
    anh_dai_dien: Optional[str] = Field(None, max_length=500)
    cccd_front: Optional[str] = Field(None, max_length=500)
    cccd_back: Optional[str] = Field(None, max_length=500)
    noi_sinh: Optional[str] = Field(None, max_length=200)
    dan_toc: Optional[str] = Field(None, max_length=50)
    ton_giao: Optional[str] = Field(None, max_length=50)
    loai_nhan_vien: Optional[str] = Field(
        None, pattern="^(giao_vien|nhan_vien|can_bo|chuyen_mon)$"
    )
    cap_hoc: Optional[str] = Field(None, max_length=20)
    mon_day: Optional[str] = Field(None, max_length=100)
    hang_chuc_danh: Optional[str] = Field(None, max_length=50)
    ngach_luong: Optional[str] = Field(None, max_length=50)
    bac_luong: Optional[int] = Field(None, ge=1, le=10)
    he_so_luong: Optional[str] = Field(None, max_length=10)
    so_nam_tham_nien: Optional[int] = Field(None, ge=0)
    phong_ban_id: Optional[str] = Field(None, max_length=32)
    chuc_vu_id: Optional[str] = Field(None, max_length=32)
    loai_hop_dong: Optional[str] = Field(None, max_length=30)
    so_hop_dong: Optional[str] = Field(None, max_length=50)
    luong_co_ban: Optional[float] = Field(None, ge=0)
    ngay_vao_lam: Optional[date] = None
    ngay_het_hop_dong: Optional[date] = None
    hinh_thuc_tuyen_dung: Optional[str] = Field(None, max_length=100)
    noi_ky_hop_dong: Optional[str] = Field(None, max_length=200)
    phu_cap_chuc_vu: Optional[str] = Field(None, max_length=20)
    ngay_bo_nhiem_chuc_vu: Optional[date] = None
    la_dang_vien: Optional[bool] = None
    la_doan_vien: Optional[bool] = None
    ngay_vao_dang: Optional[date] = None
    ngay_vao_doan: Optional[date] = None
    tinh_trang_hon_nhan: Optional[str] = Field(None, max_length=20)

    so_bao_hiem: Optional[str] = Field(None, max_length=20)
    ngay_tham_gia_bhxh: Optional[date] = None
    ten_ngan_hang: Optional[str] = Field(None, max_length=100)
    so_tai_khoan_ngan_hang: Optional[str] = Field(None, max_length=30)

    ghi_chu: Optional[str] = None
    trang_thai: Optional[str] = Field(
        None, pattern="^(dang_lam|nghi_viec|nghi_huu|da_xoa)$"
    )

    class Config:
        extra = "ignore"

    @validator("ngay_het_hop_dong")
    def validate_contract_dates(cls, v, values):
        if (
            v is not None
            and "ngay_vao_lam" in values
            and values["ngay_vao_lam"] is not None
        ):
            if v < values["ngay_vao_lam"]:
                raise ValueError("Ngày hết hạn hợp đồng phải sau ngày vào làm")
        return v


class PhongBanBrief(BaseModel):
    id: str
    ten_phong_ban: str

    class Config:
        extra = "ignore"


class ChucVuBrief(BaseModel):
    id: str
    ten_chuc_vu: str
    cap_bac: Optional[int] = None

    class Config:
        extra = "ignore"


class NhanVienDataResponse(NhanVienBase):
    id: str
    ma_nhan_vien: str
    que_quan: Optional[str] = None
    dia_chi_thuong_tru: Optional[str] = None
    so_cccd: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    ngay_cap_cccd: Optional[date] = None
    noi_cap_cccd: Optional[str] = None
    noi_sinh: Optional[str] = None
    dan_toc: Optional[str] = None
    cap_hoc: Optional[str] = None
    phong_ban_id: Optional[str] = None
    chuc_vu_id: Optional[str] = None
    ngay_vao_lam: Optional[date] = None
    tinh_trang_hon_nhan: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    phong_ban: Optional[PhongBanBrief] = None
    chuc_vu: Optional[ChucVuBrief] = None

    class Config:
        from_attributes = True
