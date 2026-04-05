from sqlalchemy import Column, String, Boolean, Text, SmallInteger, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class TrinhDo(Base):
    """Danh mục trình độ học vấn."""

    __tablename__ = "trinh_do"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_trinh_do = Column(String(20), unique=True, nullable=False)
    ten_trinh_do = Column(String(100), nullable=False)
    cap_do = Column(SmallInteger, nullable=False)
    mo_ta = Column(Text)
    trang_thai = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
