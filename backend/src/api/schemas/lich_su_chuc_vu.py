from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class LichSuChucVuBase(BaseModel):
    """Base schema for LichSuChucVu."""

    chuc_vu_id: str = Field(..., description="ID chức vụ")
    phong_ban_id: Optional[str] = Field(None, description="ID phòng ban (nếu có)")
    tu_ngay: date = Field(..., description="Từ ngày")
    den_ngay: Optional[date] = Field(None, description="Đến ngày (null = hiện tại)")
    ly_do: Optional[str] = Field(None, max_length=200, description="Lý do")
    so_quyet_dinh: Optional[str] = Field(
        None, max_length=50, description="Số quyết định"
    )
    ghi_chu: Optional[str] = Field(None, description="Ghi chú")


class LichSuChucVuCreateRequest(LichSuChucVuBase):
    """Schema for creating a new LichSuChucVu."""

    nhan_vien_id: str = Field(..., description="ID nhân viên")


class LichSuChucVuUpdateRequest(BaseModel):
    """Schema for updating LichSuChucVu."""

    chuc_vu_id: Optional[str] = None
    phong_ban_id: Optional[str] = None
    tu_ngay: Optional[date] = None
    den_ngay: Optional[date] = None
    ly_do: Optional[str] = Field(None, max_length=200)
    so_quyet_dinh: Optional[str] = Field(None, max_length=50)
    ghi_chu: Optional[str] = None


class LichSuChucVuResponse(LichSuChucVuBase):
    """Schema for LichSuChucVu response."""

    id: str
    nhan_vien_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
