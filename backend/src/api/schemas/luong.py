from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List


class LuongBase(BaseModel):
    nhan_vien_id: str = Field(..., description="ID nhân viên")
    ma_ngach: Optional[str] = Field(None, max_length=20, description="Mã ngạch")
    bac: Optional[int] = Field(None, ge=1, le=15, description="Bậc lương")
    he_so_luong: float = Field(..., ge=1.0, description="Hệ số lương")
    so_nam_tham_nien: int = Field(default=0, ge=0, description="Số năm thâm niên")
    ty_le_pc_uu_dai: float = Field(
        default=30.0, ge=0, description="Tỷ lệ phụ cấp ưu đãi (%)"
    )
    he_so_khu_vuc: float = Field(default=0.0, ge=0, description="Hệ số khu vực")
    phu_cap_chuc_vu: int = Field(default=0, ge=0, description="Phụ cấp chức vụ")
    phu_cap_tham_nien_vuot_khung: int = Field(
        default=0, ge=0, description="Phụ cấp thâm niên vượt khung"
    )
    phu_cap_khac: int = Field(default=0, ge=0, description="Phụ cấp khác")
    khau_tru_khac: int = Field(default=0, ge=0, description="Khấu trừ khác")
    hieu_luc_tu: date = Field(..., description="Hiệu lực từ ngày")
    hieu_luc_den: Optional[date] = Field(None, description="Hiệu lực đến ngày")
    ghi_chu: Optional[str] = Field(None, description="Ghi chú")


class LuongCreateRequest(LuongBase):
    pass


class LuongUpdateRequest(BaseModel):
    ma_ngach: Optional[str] = Field(None, max_length=20)
    bac: Optional[int] = Field(None, ge=1, le=15)
    he_so_luong: Optional[float] = Field(None, ge=1.0)
    so_nam_tham_nien: Optional[int] = Field(None, ge=0)
    ty_le_pc_uu_dai: Optional[float] = Field(None, ge=0)
    he_so_khu_vuc: Optional[float] = Field(None, ge=0)
    phu_cap_chuc_vu: Optional[int] = Field(None, ge=0)
    phu_cap_tham_nien_vuot_khung: Optional[int] = Field(None, ge=0)
    phu_cap_khac: Optional[int] = Field(None, ge=0)
    khau_tru_khac: Optional[int] = Field(None, ge=0)
    hieu_luc_tu: Optional[date] = None
    hieu_luc_den: Optional[date] = None
    ghi_chu: Optional[str] = None


class LuongDataResponse(LuongBase):
    id: str
    luong_co_ban: int
    phu_cap_uu_dai: int
    bhxh: int
    bhyt: int
    thue_tncn: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PreviewLuongRequest(BaseModel):
    nhan_vien_id: str = Field(..., description="ID nhân viên")
    thang: int = Field(..., ge=1, le=12, description="Tháng tính lương")
    nam: int = Field(..., ge=2000, le=2100, description="Năm tính lương")


class PreviewLuongResponse(BaseModel):
    nhan_vien_id: str
    thang: int
    nam: int
    ngay_vao: Optional[date]
    ngay_nghi: Optional[date]
    loai_cong_thuc: str
    he_so_dac_thu_ap_dung: float
    so_ngay_cong_chuan: float
    so_ngay_cong_thuc_te: float
    he_so_ngay_cong: float
    luong_co_ban: int
    phu_cap_chuc_vu: int
    phu_cap_tham_nien: int
    phu_cap_uu_dai: int
    phu_cap_khu_vuc: int
    phu_cap_tham_nien_vuot_khung: int
    phu_cap_khac: int
    tong_phu_cap: int
    bhxh: int
    bhyt: int
    bhtn: int
    thue_tncn: int
    khau_tru_khac: int
    tong_thu_nhap: int
    tong_khau_tru: int
    luong_thuc_nhan: int
    co_tam_dinh_chi: bool
    tam_dinh_chi_id: Optional[str]
    co_ky_luat: bool
    ky_luat_id: Optional[str]
    hinh_thuc_ky_luat: Optional[str]


class ChayLuongRequest(BaseModel):
    thang: int = Field(..., ge=1, le=12, description="Tháng tính lương")
    nam: int = Field(..., ge=2000, le=2100, description="Năm tính lương")
    danh_sach_nhan_vien_ids: Optional[List[str]] = Field(
        None, description="Danh sách ID nhân viên (để trống = tất cả)"
    )


class ChayLuongResponse(BaseModel):
    ky_luong_id: str
    thang: int
    nam: int
    tong_nhan_vien: int
    tong_thu_nhap: int
    tong_thuc_nhan: int
    danh_sach: List[dict]


class KyLuongResponse(BaseModel):
    id: str
    thang: int
    nam: int
    ngay_bat_dau: date
    ngay_ket_thuc: date
    trang_thai: str
    tong_nhan_vien: Optional[int]
    tong_thu_nhap: Optional[int]
    tong_thuc_nhan: Optional[int]
    ngay_chot: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class TraLuongResponse(BaseModel):
    id: str
    nhan_vien_id: str
    nhan_vien_ho_ten: Optional[str] = None
    ky_luong_id: str
    thang: int
    nam: int
    ngay_vao: Optional[date]
    ngay_nghi: Optional[date]
    so_ngay_cong_chuan: float
    so_ngay_cong_thuc_te: float
    luong_co_ban: int
    he_so_dac_thu_ap_dung: float
    loai_cong_thuc: str
    phu_cap_chuc_vu: int
    phu_cap_tham_nien: int
    phu_cap_uu_dai: int
    phu_cap_khu_vuc: int
    phu_cap_tham_nien_vuot_khung: int
    phu_cap_khac: int
    tong_phu_cap: int
    thu_nhap_tang_them: int
    thuong: int
    bhxh: int
    bhyt: int
    bhtn: int
    thue_tncn: int
    khau_tru_khac: int
    tong_khau_tru: int
    tong_thu_nhap: int
    luong_thuc_nhan: int
    co_tam_dinh_chi: bool
    tam_dinh_chi_id: Optional[str]
    co_ky_luat: bool
    ky_luat_id: Optional[str]
    ngay_chay: datetime
    trang_thai: str

    class Config:
        from_attributes = True


class CauHinhLuongResponse(BaseModel):
    id: str
    ngay_ap_dung: date
    luong_co_so: int
    he_so_dac_thu: float
    ty_le_quy_thuong: float
    ty_le_bhxh: float
    ty_le_bhyt: float
    ty_le_bhtn: float
    muc_giam_tru_ban_than: int
    muc_giam_tru_nguoi_phu_thuoc: int
    trang_thai: str
    ghi_chu: Optional[str] = None
    nguoi_tao: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
