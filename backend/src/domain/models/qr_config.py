from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    Time,
    Float,
    Integer,
    ForeignKey,
    DateTime,
    SmallInteger,
    Boolean,
)
from datetime import datetime

from libs.datetime import get_utc_now, serialize_dt

from .base import Base, generate_uuid


class QRConfig(Base):
    """QR Code cho mỗi ngày làm việc."""

    __tablename__ = "qr_config"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="SET NULL"), nullable=True
    )
    ngay = Column(Date, nullable=False)
    loai = Column(String(20), nullable=False, default="all")  # check_in, check_out, all

    qr_data = Column(Text, nullable=False)
    qr_image_base64 = Column(Text, nullable=True)
    mac = Column(String(128), nullable=True)

    thoi_gian_hieu_luc = Column(DateTime(timezone=True), nullable=True)

    gio_bat_dau = Column(
        Time, nullable=False, default=datetime.strptime("07:00", "%H:%M").time()
    )
    gio_ket_thuc = Column(
        Time, nullable=False, default=datetime.strptime("17:30", "%H:%M").time()
    )

    vi_tri = Column(String(100))
    kinh_do = Column(Float)
    vi_do = Column(Float)
    ban_kinh_cho_phep = Column(Integer, default=100)

    trang_thai = Column(String(20), nullable=False, default="active")
    bat_gps = Column(Boolean, nullable=False, default=True)

    ma_nhap = Column(String(6), nullable=True, unique=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
    created_by = Column(String(32), ForeignKey("tai_khoan.id", ondelete="SET NULL"))

    def to_dict(self):
        return {
            "id": self.id,
            "nhan_vien_id": self.nhan_vien_id,
            "ngay": self.ngay.isoformat() if self.ngay else None,
            "loai": self.loai,
            "qr_data": self.qr_data,
            "qr_image_base64": self.qr_image_base64,
            "thoi_gian_hieu_luc": serialize_dt(self.thoi_gian_hieu_luc),
            "gio_bat_dau": self.gio_bat_dau.strftime("%H:%M")
            if self.gio_bat_dau
            else None,
            "gio_ket_thuc": self.gio_ket_thuc.strftime("%H:%M")
            if self.gio_ket_thuc
            else None,
            "vi_tri": self.vi_tri,
            "kinh_do": self.kinh_do,
            "vi_do": self.vi_do,
            "ban_kinh_cho_phep": self.ban_kinh_cho_phep,
            "bat_gps": self.bat_gps,
            "trang_thai": self.trang_thai,
            "ma_nhap": self.ma_nhap,
            "created_at": serialize_dt(self.created_at),
            "created_by": self.created_by,
        }
