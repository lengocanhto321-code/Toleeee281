from sqlalchemy import Column, String, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime as dt

from .base import Base, generate_uuid


class HopDong(Base):
    """
    Bảng: Lịch sử hợp đồng lao động của nhân viên
    - Mỗi record là một hợp đồng
    - Một NV có thể có nhiều bản ghi (nhiều lần ký HĐ)
    """

    __tablename__ = "hop_dong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32),
        ForeignKey("nhan_vien.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    so_hop_dong = Column(String(50), nullable=False)
    loai_hop_dong = Column(
        String(30), nullable=False
    )  # vien_chuc, hop_dong_thu_viec, hop_dong_nam...
    ngay_ky = Column(Date, nullable=False)
    ngay_bat_dau = Column(Date, nullable=False)
    ngay_ket_thuc = Column(Date, nullable=True)  # NULL = không xác định
    hinh_thuc_tuyen_dung = Column(String(100))
    noi_ky_hop_dong = Column(String(200))
    luong_co_ban = Column(String(20))  # Lương cơ bản khi ký HĐ
    ghi_chu = Column(Text, nullable=True)
    trang_thai = Column(
        String(20), nullable=False, default="dang_hieu_luc"
    )  # dang_hieu_luc, da_het_han, bi_huy

    created_at = Column(DateTime, nullable=False, default=dt.utcnow)
    updated_at = Column(DateTime, nullable=False, default=dt.utcnow, onupdate=dt.utcnow)

    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="hop_dongs", lazy="selectin")
