from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NguoiThanCreateRequest(BaseModel):
    ho_ten: str = Field(..., min_length=2, max_length=100)
    quan_he: str = Field(..., max_length=50)
    nam_sinh: str = Field(..., max_length=4)
    nghe_nghiep: Optional[str] = Field(None, max_length=100)
    dia_chi: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    nguoi_phu_thuoc: bool = Field(default=False)
    ghi_chu: Optional[str] = Field(None, max_length=255)


class NguoiThanUpdateRequest(BaseModel):
    ho_ten: Optional[str] = Field(None, min_length=2, max_length=100)
    quan_he: Optional[str] = Field(None, max_length=50)
    nam_sinh: Optional[str] = Field(None, max_length=4)
    nghe_nghiep: Optional[str] = Field(None, max_length=100)
    dia_chi: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    nguoi_phu_thuoc: Optional[bool] = None
    ghi_chu: Optional[str] = Field(None, max_length=255)


class NguoiThanResponse(BaseModel):
    id: str
    nhan_vien_id: str
    ho_ten: str
    quan_he: str
    nam_sinh: str
    nghe_nghiep: Optional[str] = None
    dia_chi: Optional[str] = None
    so_dien_thoai: Optional[str] = None
    nguoi_phu_thuoc: bool = False
    ghi_chu: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BangCapCreateRequest(BaseModel):
    loai: str = Field(..., max_length=30)
    ten_bang: str = Field(..., max_length=200)
    chuyen_nganh: Optional[str] = Field(None, max_length=100)
    truong_cap: Optional[str] = Field(None, max_length=200)
    nam_cap: Optional[int] = None
    xep_loai: Optional[str] = Field(None, max_length=20)
    ghi_chu: Optional[str] = None


class BangCapUpdateRequest(BaseModel):
    loai: Optional[str] = Field(None, max_length=30)
    ten_bang: Optional[str] = Field(None, max_length=200)
    chuyen_nganh: Optional[str] = Field(None, max_length=100)
    truong_cap: Optional[str] = Field(None, max_length=200)
    nam_cap: Optional[int] = None
    xep_loai: Optional[str] = Field(None, max_length=20)
    ghi_chu: Optional[str] = None


class BangCapResponse(BaseModel):
    id: str
    nhan_vien_id: str
    loai: str
    ten_bang: str
    chuyen_nganh: Optional[str] = None
    truong_cap: Optional[str] = None
    nam_cap: Optional[int] = None
    xep_loai: Optional[str] = None
    ghi_chu: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KhenThuongKyLuatCreateRequest(BaseModel):
    loai: str = Field(..., pattern="^(khen_thuong|ky_luat)$")
    hinh_thuc: str = Field(..., max_length=150)
    ly_do: str = Field(..., min_length=1)
    ngay_quyet_dinh: str = Field(...)
    so_quyet_dinh: Optional[str] = Field(None, max_length=50)
    cap_quyet_dinh: Optional[str] = Field(None, max_length=50)
    gia_tri_thuong: Optional[int] = Field(None, ge=0)
    thoi_han_ky_luat: Optional[str] = None
    ghi_chu: Optional[str] = None


class KhenThuongKyLuatUpdateRequest(BaseModel):
    loai: Optional[str] = Field(None, pattern="^(khen_thuong|ky_luat)$")
    hinh_thuc: Optional[str] = Field(None, max_length=150)
    ly_do: Optional[str] = None
    ngay_quyet_dinh: Optional[str] = None
    so_quyet_dinh: Optional[str] = Field(None, max_length=50)
    cap_quyet_dinh: Optional[str] = Field(None, max_length=50)
    gia_tri_thuong: Optional[int] = Field(None, ge=0)
    thoi_han_ky_luat: Optional[str] = None
    ghi_chu: Optional[str] = None


class KhenThuongKyLuatResponse(BaseModel):
    id: str
    nhan_vien_id: str
    loai: str
    hinh_thuc: str
    ly_do: str
    ngay_quyet_dinh: str
    so_quyet_dinh: Optional[str] = None
    cap_quyet_dinh: Optional[str] = None
    gia_tri_thuong: int = 0
    thoi_han_ky_luat: Optional[str] = None
    ghi_chu: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
