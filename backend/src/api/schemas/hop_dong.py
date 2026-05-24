from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class HopDongCreateRequest(BaseModel):
    so_hop_dong: str = Field("", max_length=50)
    loai_hop_dong: str = Field(..., min_length=1, max_length=30)
    ngay_ky: date
    ngay_bat_dau: date
    ngay_ket_thuc: Optional[date] = None
    hinh_thuc_tuyen_dung: Optional[str] = Field(None, max_length=100)
    noi_ky_hop_dong: Optional[str] = Field(None, max_length=200)
    luong_co_ban: Optional[str] = Field(None, max_length=20)
    ghi_chu: Optional[str] = None


class HopDongUpdateRequest(BaseModel):
    so_hop_dong: Optional[str] = Field(None, min_length=1, max_length=50)
    loai_hop_dong: Optional[str] = Field(None, min_length=1, max_length=30)
    ngay_ky: Optional[date] = None
    ngay_bat_dau: Optional[date] = None
    ngay_ket_thuc: Optional[date] = None
    hinh_thuc_tuyen_dung: Optional[str] = Field(None, max_length=100)
    noi_ky_hop_dong: Optional[str] = Field(None, max_length=200)
    luong_co_ban: Optional[str] = Field(None, max_length=20)
    ghi_chu: Optional[str] = None
    trang_thai: Optional[str] = None


class HopDongResponse(BaseModel):
    id: str
    nhan_vien_id: str
    so_hop_dong: str
    loai_hop_dong: str
    ngay_ky: Optional[date] = None
    ngay_bat_dau: Optional[date] = None
    ngay_ket_thuc: Optional[date] = None
    hinh_thuc_tuyen_dung: Optional[str] = None
    noi_ky_hop_dong: Optional[str] = None
    luong_co_ban: Optional[str] = None
    ghi_chu: Optional[str] = None
    trang_thai: str = "dang_hieu_luc"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


LOAI_HOP_DONG = {
    "vien_chuc": "Viên chức",
    "hop_dong_thu_viec": "Hợp đồng thử việc",
    "hop_dong_1_nam": "Hợp đồng 1 năm",
    "hop_dong_2_nam": "Hợp đồng 2 năm",
    "hop_dong_3_nam": "Hợp đồng 3 năm",
    "hop_dong_khong_thoi_han": "Hợp đồng không thời hạn",
    "hop_dong_ngan_han": "Hợp đồng ngắn hạn",
    "hop_dong_khac": "Khác",
}

TRANG_THAI_HOP_DONG = {
    "dang_hieu_luc": "Đang hiệu lực",
    "da_het_han": "Đã hết hạn",
    "bi_huy": "Bị hủy",
}
