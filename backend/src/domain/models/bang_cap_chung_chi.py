from sqlalchemy import Column, String, Text, SmallInteger, ForeignKey, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class BangCapChungChi(Base):
    """Bằng cấp và chứng chỉ của từng nhân viên."""
    __tablename__ = "bang_cap_chung_chi"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    loai = Column(String(30), nullable=False)
    ten_bang = Column(String(200), nullable=False)
    chuyen_nganh = Column(String(100))
    truong_cap = Column(String(200))
    nam_cap = Column(SmallInteger)
    xep_loai = Column(String(20))
    ghi_chu = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
