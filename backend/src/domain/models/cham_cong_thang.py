from sqlalchemy import (
    Column,
    String,
    Text,
    SmallInteger,
    ForeignKey,
    DateTime,
    Numeric,
    UniqueConstraint,
)
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class ChamCongThang(Base):
    """Tổng hợp chấm công tháng - generated tự động (mock)."""

    __tablename__ = "cham_cong_thang"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "thang", "nam", name="uq_cham_cong_thang"),
    )

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)

    so_ngay_lam_chuan = Column(Numeric(4, 1), nullable=False, default=26)
    so_ngay_co_mat = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_vang_co_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_vang_khong_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_le_tet = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_cong_tac = Column(Numeric(4, 1), nullable=False, default=0)

    he_so_ngay_cong = Column(Numeric(5, 4), nullable=False, default=1.0)
    trang_thai = Column(String(20), nullable=False, default="da_mock")
    ghi_chu = Column(Text)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
