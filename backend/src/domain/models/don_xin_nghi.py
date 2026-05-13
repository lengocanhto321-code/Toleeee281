from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    ForeignKey,
    DateTime,
    Numeric,
    JSON,
)
from datetime import datetime

from .base import Base, generate_uuid


class DonXinNghi(Base):
    """Đơn xin nghỉ phép."""

    __tablename__ = "don_xin_nghi"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    loai_nghi = Column(String(30), nullable=False)
    tu_ngay = Column(Date, nullable=False)
    den_ngay = Column(Date, nullable=False)
    so_ngay = Column(Numeric(4, 1), nullable=False)
    ly_do = Column(Text)

    files = Column(JSON)

    trang_thai = Column(String(20), nullable=False, default="cho_duyet")
    lich_su_duyet = Column(JSON)
    ghi_chu_duyet = Column(Text)

    nguoi_tao_id = Column(String(32))
    nguoi_duyet_id = Column(String(32), ForeignKey("tai_khoan.id"))
    ngay_duyet = Column(DateTime)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
