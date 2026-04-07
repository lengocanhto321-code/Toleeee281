from sqlalchemy import Column, String, Boolean, Text, Date, ForeignKey, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class NhanVien(Base):
    """Bảng trung tâm: cán bộ, giáo viên, nhân viên."""

    __tablename__ = "nhan_vien"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_nhan_vien = Column(String(20), unique=True, nullable=False)
    ho_ten = Column(String(100), nullable=False)
    gioi_tinh = Column(String(5), nullable=False)
    ngay_sinh = Column(Date, nullable=False)
    que_quan = Column(String(200))
    dia_chi_thuong_tru = Column(String(255))
    so_dien_thoai = Column(String(15))
    email = Column(String(100), unique=True)
    so_cccd = Column(String(12), unique=True)
    anh_dai_dien = Column(String(500))

    # Phân loại
    loai_nhan_vien = Column(String(20), nullable=False, default="giao_vien")
    mon_day = Column(String(100))
    hang_chuc_danh = Column(String(50))

    # Hợp đồng
    loai_hop_dong = Column(String(30), nullable=False, default="vien_chuc")
    so_hop_dong = Column(String(50))
    ngay_vao_lam = Column(Date)
    ngay_het_hop_dong = Column(Date)

    # Bổ sung
    la_dang_vien = Column(Boolean, nullable=False, default=False)
    la_doan_vien = Column(Boolean, nullable=False, default=False)
    ghi_chu = Column(Text)
    trang_thai = Column(String(20), nullable=False, default="dang_lam")

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
