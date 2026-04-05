from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from datetime import datetime

from .base import Base, generate_uuid


class BaoCao(Base):
    """Lịch sử xuất báo cáo."""

    __tablename__ = "bao_cao"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ten_bao_cao = Column(String(200), nullable=False)
    loai_bao_cao = Column(String(50), nullable=False)
    dinh_dang = Column(String(5), nullable=False, default="excel")
    tham_so = Column(JSON)
    duong_dan_file = Column(String(500))
    nguoi_xuat_id = Column(String(32), ForeignKey("tai_khoan.id", ondelete="SET NULL"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
