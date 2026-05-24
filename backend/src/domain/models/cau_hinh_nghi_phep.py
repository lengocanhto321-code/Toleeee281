from libs.datetime import get_utc_now

from sqlalchemy import Column, String, Float, Boolean, Text, DateTime

from .base import Base, generate_uuid


class CauHinhNghiPhep(Base):
    """Cấu hình số ngày nghỉ phép theo loại."""

    __tablename__ = "cau_hinh_nghi_phep"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    loai_nghi = Column(String(50), nullable=False, unique=True)
    ten_loai = Column(String(100), nullable=False)
    so_ngay_moi_nam = Column(Float, nullable=False)
    so_ngay_toi_da_mot_lan = Column(Float)
    can_giay_to = Column(Boolean, default=False)
    bat_buoc_ghi_ly_do = Column(Boolean, default=False)
    trang_thai = Column(Boolean, default=True)
    ghi_chu = Column(Text)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
