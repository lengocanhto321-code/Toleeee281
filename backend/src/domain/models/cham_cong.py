from sqlalchemy import (
    Column,
    String,
    Text,
    SmallInteger,
    Numeric,
    ForeignKey,
    UniqueConstraint,
    DateTime,
)
from datetime import datetime

from .base import Base, generate_uuid


class ChamCong(Base):
    """Chấm công hàng tháng."""

    __tablename__ = "cham_cong"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "thang", "nam", name="uq_cham_cong"),
    )

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)

    so_ngay_lam_chuan = Column(Numeric(4, 1), nullable=False, default=26)
    so_ngay_lam_thuc_te = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_om = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_cong_tac = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_khong_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_le_tet = Column(Numeric(4, 1), nullable=False, default=0)

    trang_thai = Column(String(15), nullable=False, default="chua_chot")
    ghi_chu = Column(Text)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
