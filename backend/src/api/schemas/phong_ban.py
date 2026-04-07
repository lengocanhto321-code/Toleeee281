import re
from typing import Optional, Literal
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    EmailStr,
    field_validator,
)


class PhongBanBase(BaseModel):
    """Base schema cho PhongBan - dùng chung cho Create/Update."""

    ten_phong_ban: str = Field(..., min_length=5, max_length=100)
    loai: Literal["chuyen_mon", "hanh_chinh", "khac"] = Field(...)
    mo_ta: Optional[str] = Field(None, max_length=500)
    truong_phong: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    trang_thai: bool = True

    model_config = ConfigDict(
        str_strip_whitespace=True,   # Tự động strip khoảng trắng cho tất cả string
    )

    @field_validator("so_dien_thoai")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r"^\+?[0-9]{9,15}$", v):
            raise ValueError("Số điện thoại không hợp lệ")
        return v


class PhongBanCreateRequest(PhongBanBase):
    """Schema dùng khi tạo mới PhongBan."""

    ma_phong_ban: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[A-Z0-9\-]+$"   # Dùng pattern thay vì validator riêng
    )

    @field_validator("ma_phong_ban", mode="before")
    @classmethod
    def uppercase_ma(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class PhongBanUpdateRequest(BaseModel):
    """Schema dùng khi cập nhật PhongBan (tất cả field đều optional)."""

    ten_phong_ban: Optional[str] = Field(None, min_length=5, max_length=100)
    loai: Optional[Literal["chuyen_mon", "hanh_chinh", "khac"]] = None
    mo_ta: Optional[str] = Field(None, max_length=500)
    truong_phong: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    trang_thai: Optional[bool] = None

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("so_dien_thoai")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r"^\+?[0-9]{9,15}$", v):
            raise ValueError("Số điện thoại không hợp lệ")
        return v


class PhongBanDataResponse(PhongBanBase):
    """Schema response đầy đủ khi trả về dữ liệu PhongBan (dùng cho API GET)."""

    id: str
    ma_phong_ban: str
    so_luong_nhan_vien: int = Field(default=0, ge=0)
    so_luong_dang_lam: int = Field(default=0, ge=0)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,      # Rất quan trọng để convert từ ORM model
    )
