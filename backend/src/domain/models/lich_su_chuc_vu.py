from sqlalchemy import Column, String, Text, Date, ForeignKey, DateTime
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class LichSuChucVu(Base):
    """Lịch sử bổ nhiệm / điều chuyển chức vụ nhân viên."""

    __tablename__ = "lich_su_chuc_vu"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    chuc_vu_id = Column(String(32), ForeignKey("chuc_vu.id"), nullable=False)
    phong_ban_id = Column(String(32), ForeignKey("phong_ban.id"))
    tu_ngay = Column(Date, nullable=False)
    den_ngay = Column(Date)
    ly_do = Column(String(200))
    so_quyet_dinh = Column(String(50))
    ghi_chu = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
