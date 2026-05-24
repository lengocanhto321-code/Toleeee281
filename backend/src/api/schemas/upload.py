from datetime import date
from typing import Optional, List

from pydantic import BaseModel, Field

from src.domain.models.nhan_vien import LOAI_TAI_LIEU_LABELS


class TaiLieuUploadResponse(BaseModel):
    id: str
    nhan_vien_id: str
    loai_tai_lieu: str
    loai_tai_lieu_label: str
    ten_tai_lieu: str
    duong_dan: str
    ten_file_goc: Optional[str] = None
    kich_thuoc: Optional[int] = None
    dinh_dang: Optional[str] = None
    mo_ta: Optional[str] = None
    ngay_het_han: Optional[date] = None
    la_ban_chinh: bool = False
    trang_thai: str
    created_at: str

    class Config:
        from_attributes = True


class TaiLieuCreateRequest(BaseModel):
    nhan_vien_id: str = Field(..., description="ID của nhân viên")
    loai_tai_lieu: str = Field(..., description="Loại tài liệu")
    ten_tai_lieu: str = Field(..., description="Tên tài liệu")
    mo_ta: Optional[str] = Field(None, description="Mô tả tài liệu")
    ngay_het_han: Optional[date] = Field(None, description="Ngày hết hạn")
    la_ban_chinh: bool = Field(False, description="Là bản chính")


class TaiLieuUpdateRequest(BaseModel):
    ten_tai_lieu: Optional[str] = Field(None, description="Tên tài liệu")
    mo_ta: Optional[str] = Field(None, description="Mô tả tài liệu")
    ngay_het_han: Optional[date] = Field(None, description="Ngày hết hạn")
    la_ban_chinh: Optional[bool] = Field(None, description="Là bản chính")
    trang_thai: Optional[str] = Field(None, description="Trạng thái")


class TaiLieuFilterRequest(BaseModel):
    nhan_vien_id: Optional[str] = Field(None, description="Lọc theo nhân viên")
    loai_tai_lieu: Optional[str] = Field(None, description="Lọc theo loại tài liệu")
    trang_thai: Optional[str] = Field(None, description="Lọc theo trạng thái")
    search: Optional[str] = Field(None, description="Tìm kiếm theo tên tài liệu")


class UploadResponse(BaseModel):
    url: str
    file_name: str
    file_size: int
    content_type: str
    path: str
