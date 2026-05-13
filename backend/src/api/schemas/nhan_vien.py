from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date, datetime
from typing import Optional


class NhanVienBase(BaseModel):
    """Base schema for NhanVien with common fields."""
    ho_ten: str = Field(..., min_length=2, max_length=100, description="Họ và tên nhân viên")
    gioi_tinh: str = Field(..., pattern="^(Nam|Nữ|Khác)$", description="Giới tính")
    ngay_sinh: date = Field(..., description="Ngày sinh")
    que_quan: Optional[str] = Field(None, max_length=200, description="Quê quán")
    dia_chi_thuong_tru: Optional[str] = Field(None, max_length=255, description="Địa chỉ thường trú")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại")
    email: Optional[EmailStr] = Field(None, max_length=100, description="Email")
    so_cccd: Optional[str] = Field(None, pattern="^[0-9]{12}$", max_length=12, description="Số CCCD (12 số)")
    anh_dai_dien: Optional[str] = Field(None, max_length=500, description="URL ảnh đại diện")
    loai_nhan_vien: str = Field(default="giao_vien", pattern="^(giao_vien|nhan_vien|can_bo)$", description="Loại nhân viên")
    mon_day: Optional[str] = Field(None, max_length=100, description="Môn dạy")
    hang_chuc_danh: Optional[str] = Field(None, max_length=50, description="Hạng chức danh")
    loai_hop_dong: str = Field(default="vien_chuc", max_length=30, description="Loại hợp đồng")
    so_hop_dong: Optional[str] = Field(None, max_length=50, description="Số hợp đồng")
    ngay_vao_lam: Optional[date] = Field(None, description="Ngày vào làm")
    ngay_het_hop_dong: Optional[date] = Field(None, description="Ngày hết hạn hợp đồng")
    la_dang_vien: bool = Field(default=False, description="Là đảng viên")
    la_doan_vien: bool = Field(default=False, description="Là đoàn viên")
    ghi_chu: Optional[str] = Field(None, description="Ghi chú")
    trang_thai: str = Field(default="dang_lam", pattern="^(dang_lam|nghi_viec|nghi_huu|da_xoa)$", description="Trạng thái")

    @validator('ngay_het_hop_dong')
    def validate_contract_dates(cls, v, values):
        """Validate that end date is after start date if both are provided."""
        if v is not None and 'ngay_vao_lam' in values and values['ngay_vao_lam'] is not None:
            if v < values['ngay_vao_lam']:
                raise ValueError('Ngày hết hạn hợp đồng phải sau ngày vào làm')
        return v


class NhanVienCreateRequest(NhanVienBase):
    """Schema for creating a new NhanVien. ma_nhan_vien is auto-generated."""
    pass


class NhanVienUpdateRequest(BaseModel):
    """Schema for updating an existing NhanVien. All fields optional."""
    ho_ten: Optional[str] = Field(None, min_length=2, max_length=100)
    gioi_tinh: Optional[str] = Field(None, pattern="^(Nam|Nữ|Khác)$")
    ngay_sinh: Optional[date] = None
    que_quan: Optional[str] = Field(None, max_length=200)
    dia_chi_thuong_tru: Optional[str] = Field(None, max_length=255)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = Field(None, max_length=100)
    so_cccd: Optional[str] = Field(None, pattern="^[0-9]{12}$", max_length=12)
    anh_dai_dien: Optional[str] = Field(None, max_length=500)
    loai_nhan_vien: Optional[str] = Field(None, pattern="^(giao_vien|nhan_vien|can_bo)$")
    mon_day: Optional[str] = Field(None, max_length=100)
    hang_chuc_danh: Optional[str] = Field(None, max_length=50)
    loai_hop_dong: Optional[str] = Field(None, max_length=30)
    so_hop_dong: Optional[str] = Field(None, max_length=50)
    ngay_vao_lam: Optional[date] = None
    ngay_het_hop_dong: Optional[date] = None
    la_dang_vien: Optional[bool] = None
    la_doan_vien: Optional[bool] = None
    ghi_chu: Optional[str] = None
    trang_thai: Optional[str] = Field(None, pattern="^(dang_lam|nghi_viec|nghi_huu|da_xoa)$")

    @validator('ngay_het_hop_dong')
    def validate_contract_dates(cls, v, values):
        """Validate that end date is after start date if both are provided."""
        if v is not None and 'ngay_vao_lam' in values and values['ngay_vao_lam'] is not None:
            if v < values['ngay_vao_lam']:
                raise ValueError('Ngày hết hạn hợp đồng phải sau ngày vào làm')
        return v


class NhanVienDataResponse(NhanVienBase):
    """Schema for NhanVien data response."""
    id: str
    ma_nhan_vien: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    phong_ban: Optional[str] = None
    chuc_vu: Optional[str] = None

    class Config:
        from_attributes = True  # Allow Pydantic to parse from ORM objects
