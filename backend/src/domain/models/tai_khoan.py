from sqlalchemy import Column, String, Text, SmallInteger, Boolean, ForeignKey, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class TaiKhoan(Base):
    __tablename__ = "tai_khoan"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(String(32), ForeignKey("nhan_vien.id", ondelete="SET NULL"))
    ten_dang_nhap = Column(String(50), unique=True, nullable=False)
    mat_khau_hash = Column(String(255), nullable=False)
    vai_tro = Column(String(15), nullable=False, default="admin")
    email = Column(String(100), unique=True)
    trang_thai = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
