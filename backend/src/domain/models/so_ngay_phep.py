from sqlalchemy import Column, String, SmallInteger, ForeignKey, DateTime, Numeric
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class SoNgayPhep(Base):
    """Theo dõi số ngày phép của nhân viên theo năm."""

    __tablename__ = "so_ngay_phep"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    nam = Column(SmallInteger, nullable=False)

    phep_nam_duoc_phep = Column(Numeric(4, 1), nullable=False, default=12)
    phep_nam_da_su_dung = Column(Numeric(4, 1), nullable=False, default=0)
    phep_nam_con_lai = Column(Numeric(4, 1), nullable=False, default=12)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
