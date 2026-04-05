from sqlalchemy import Column, String, Text, Date, ForeignKey, DateTime, Numeric
from datetime import datetime

from .base import Base, generate_uuid


class NghiPhep(Base):
    """Quản lý đơn nghỉ của cán bộ giáo viên."""

    __tablename__ = "nghi_phep"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    loai_nghi = Column(String(25), nullable=False)
    tu_ngay = Column(Date, nullable=False)
    den_ngay = Column(Date, nullable=False)
    so_ngay = Column(Numeric(4, 1), nullable=False, default=1)
    ly_do = Column(Text)
    trang_thai = Column(String(15), nullable=False, default="cho_duyet")
    ghi_chu_duyet = Column(Text)
    ngay_duyet = Column(DateTime)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
