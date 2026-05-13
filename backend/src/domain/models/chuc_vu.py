from sqlalchemy import Column, String, Boolean, Text, Numeric, DateTime, Integer
from sqlalchemy.orm import relationship
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

    # Cấp bậc (1-10, 1 lowest, 10 highest)
    cap_bac = Column(Integer, nullable=False, default=1)

    # Soft-delete
    deleted_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    # One-to-Many with CongTac (để lấy danh sách NV giữ chức vụ này)
    nhan_viens = relationship(
        "CongTac",
        back_populates="chuc_vu",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
