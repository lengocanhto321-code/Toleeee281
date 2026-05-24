from dataclasses import dataclass
from typing import Optional, List
from datetime import date


@dataclass
class UploadTaiLieuCommand:
    nhan_vien_id: str
    loai_tai_lieu: str
    ten_tai_lieu: str
    ho_ten: str
    file_content: bytes
    original_filename: str
    mo_ta: Optional[str] = None
    ngay_het_han: Optional[date] = None
    la_ban_chinh: bool = False


@dataclass
class UploadTaiLieuResult:
    id: str
    url: str
    file_name: str
    file_size: int
    content_type: str
    path: str


@dataclass
class GetTaiLieuListQuery:
    page: int = 1
    page_size: int = 10
    nhan_vien_id: Optional[str] = None
    loai_tai_lieu: Optional[str] = None
    trang_thai: Optional[str] = None
    search: Optional[str] = None


@dataclass
class GetTaiLieuListResult:
    total: int
    items: List[dict]


@dataclass
class GetTaiLieuByNhanVienQuery:
    nhan_vien_id: str
    loai_tai_lieu: Optional[str] = None
    trang_thai: Optional[str] = None


@dataclass
class GetTaiLieuByNhanVienResult:
    items: List[dict]


@dataclass
class GetTaiLieuDetailQuery:
    id: str


@dataclass
class GetTaiLieuDetailResult:
    tai_lieu: dict


@dataclass
class UpdateTaiLieuCommand:
    id: str
    ten_tai_lieu: Optional[str] = None
    mo_ta: Optional[str] = None
    ngay_het_han: Optional[date] = None
    la_ban_chinh: Optional[bool] = None
    trang_thai: Optional[str] = None


@dataclass
class UpdateTaiLieuResult:
    tai_lieu: dict


@dataclass
class DeleteTaiLieuCommand:
    id: str


@dataclass
class DeleteTaiLieuResult:
    id: str
