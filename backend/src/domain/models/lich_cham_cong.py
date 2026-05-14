from datetime import datetime

from libs.datetime import get_utc_now

from sqlalchemy import (
    Column,
    String,
    Time,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
)

from .base import Base, generate_uuid


class LichChamCong(Base):
    __tablename__ = "lich_cham_cong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    gio_check_in = Column(
        Time, nullable=False, default=datetime.strptime("07:00", "%H:%M").time()
    )
    gio_check_out = Column(
        Time, nullable=False, default=datetime.strptime("17:00", "%H:%M").time()
    )
    ngay_lam_viec = Column(String(20), nullable=False, default="0,1,2,3,4,5")
    bat_gps = Column(Boolean, nullable=False, default=False)
    kinh_do = Column(Float, nullable=True)
    vi_do = Column(Float, nullable=True)
    ten_vi_tri = Column(String(100), nullable=True)
    ban_kinh_cho_phep = Column(Integer, default=100)
    trang_thai = Column(String(20), nullable=False, default="active")
    created_by = Column(
        String(32), ForeignKey("tai_khoan.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
