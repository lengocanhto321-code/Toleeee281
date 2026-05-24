from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CongTacCreateRequest(BaseModel):
    phong_ban_id: str = Field(..., min_length=1)
    chuc_vu_id: str = Field(..., min_length=1)
    ngay_bat_dau: Optional[str] = None
    is_primary: bool = Field(default=False)
    he_so_luong: Optional[float] = None
    bac_luong: Optional[str] = Field(None, max_length=10)
    ghi_chu: Optional[str] = None


class CongTacUpdateRequest(BaseModel):
    phong_ban_id: Optional[str] = None
    chuc_vu_id: Optional[str] = None
    ngay_bat_dau: Optional[str] = None
    ngay_ket_thuc: Optional[str] = None
    is_primary: Optional[bool] = None
    he_so_luong: Optional[float] = None
    bac_luong: Optional[str] = Field(None, max_length=10)
    ghi_chu: Optional[str] = None
    trang_thai: Optional[str] = None


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


class CongTacResponse(BaseModel):
    id: str
    nhan_vien_id: str
    phong_ban_id: str
    chuc_vu_id: str
    phong_ban: Optional[PhongBanBrief] = None
    chuc_vu: Optional[ChucVuBrief] = None
    ngay_bat_dau: Optional[datetime] = None
    ngay_ket_thuc: Optional[datetime] = None
    is_primary: bool = False
    he_so_luong: Optional[float] = None
    bac_luong: Optional[str] = None
    ghi_chu: Optional[str] = None
    trang_thai: str = "dang_cong_tac"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
