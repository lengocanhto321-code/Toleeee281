from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class ChucVuBase(BaseModel):
    """Base schema for ChucVu with common fields."""
    ten_chuc_vu: str = Field(..., min_length=2, max_length=100, description="Tên chức vụ")
    he_so_phu_cap: float = Field(default=0.00, ge=0, le=10, description="Hệ số phụ cấp")
    mo_ta: Optional[str] = Field(None, description="Mô tả chức vụ")
    tieu_chuan: Optional[str] = Field(None, description="Tiêu chuẩn chức vụ")
    trang_thai: bool = Field(default=True, description="Trạng thái (True=active, False=inactive)")
    cap_bac: int = Field(default=1, ge=1, le=10, description="Cấp bậc (1-10, 1 lowest, 10 highest)")


class ChucVuCreateRequest(ChucVuBase):
    """Schema for creating a new ChucVu."""
    ma_chuc_vu: str = Field(..., min_length=2, max_length=20, description="Mã chức vụ (unique)")


class ChucVuUpdateRequest(BaseModel):
    """Schema for updating an existing ChucVu. All fields optional."""
    ten_chuc_vu: Optional[str] = Field(None, min_length=2, max_length=100)
    he_so_phu_cap: Optional[float] = Field(None, ge=0, le=10)
    mo_ta: Optional[str] = None
    tieu_chuan: Optional[str] = None
    trang_thai: Optional[bool] = None
    cap_bac: Optional[int] = Field(None, ge=1, le=10)


class ChucVuDataResponse(ChucVuBase):
    """Schema for ChucVu data response."""
    id: str
    ma_chuc_vu: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allow Pydantic to parse from ORM objects
