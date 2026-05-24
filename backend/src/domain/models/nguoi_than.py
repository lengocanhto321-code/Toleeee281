from sqlalchemy import Column, String, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class NguoiThan(Base):
    """Người thân của nhân viên."""

    __tablename__ = "nguoi_than"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    ho_ten = Column(String(100), nullable=False)
    quan_he = Column(String(50), nullable=False)
    nam_sinh = Column(String(4), nullable=False)
    nghe_nghiep = Column(String(100))
    dia_chi = Column(String(255))
    so_dien_thoai = Column(String(15))
    nguoi_phu_thuoc = Column(Boolean, default=False)
    ghi_chu = Column(String(255))
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    nhan_vien = relationship("NhanVien", back_populates="nguoi_thans")
