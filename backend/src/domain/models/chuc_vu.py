from sqlalchemy import Column, String, Boolean, Text, Numeric, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class ChucVu(Base):
    """Danh mục chức vụ trong trường."""
    __tablename__ = "chuc_vu"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_chuc_vu = Column(String(20), unique=True, nullable=False)
    ten_chuc_vu = Column(String(100), nullable=False)
    he_so_phu_cap = Column(Numeric(5, 2), nullable=False, default=0.00)
    mo_ta = Column(Text)
    tieu_chuan = Column(Text)
    trang_thai = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
