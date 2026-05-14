from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    DateTime,
    Float,
    ForeignKey,
    UniqueConstraint,
)
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class CheckInOut(Base):
    """Bản ghi check-in/out của nhân viên."""

    __tablename__ = "check_in_out"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "ngay", name="uq_check_in_out_daily"),
    )

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    ngay = Column(Date, nullable=False)

    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_in_qr_id = Column(String(32), nullable=True)
    check_in_lat = Column(Float, nullable=True)
    check_in_lng = Column(Float, nullable=True)
    check_in_status = Column(String(20), nullable=True)

    check_out_time = Column(DateTime(timezone=True), nullable=True)
    check_out_qr_id = Column(String(32), nullable=True)
    check_out_lat = Column(Float, nullable=True)
    check_out_lng = Column(Float, nullable=True)

    trang_thai = Column(String(20), nullable=False, default="checked_in")

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nhan_vien_id": self.nhan_vien_id,
            "ngay": self.ngay.isoformat() if self.ngay else None,
            "check_in_time": self.check_in_time.isoformat()
            if self.check_in_time
            else None,
            "check_in_qr_id": self.check_in_qr_id,
            "check_in_lat": self.check_in_lat,
            "check_in_lng": self.check_in_lng,
            "check_in_status": self.check_in_status,
            "check_out_time": self.check_out_time.isoformat()
            if self.check_out_time
            else None,
            "check_out_qr_id": self.check_out_qr_id,
            "check_out_lat": self.check_out_lat,
            "check_out_lng": self.check_out_lng,
            "trang_thai": self.trang_thai,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
