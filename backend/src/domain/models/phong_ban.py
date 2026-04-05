from sqlalchemy import Column, String, Boolean, Text, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class PhongBan(Base):
    """Tổ chuyên môn và phòng ban hành chính trong trường."""
    __tablename__ = "phong_ban"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_phong_ban = Column(String(20), unique=True, nullable=False)
    ten_phong_ban = Column(String(100), nullable=False)
    loai = Column(String(20), nullable=False, default="chuyen_mon")
    mo_ta = Column(Text)
    truong_phong = Column(String(100))
    so_dien_thoai = Column(String(15))
    email = Column(String(100))
    trang_thai = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
