from sqlalchemy import Column, String, Boolean, Text, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class CongTac(Base):
    """
    Bảng trung gian: Lịch sử công tác của nhân viên
    - Mỗi record là một lần phân công: NV + Phòng ban + Chức vụ
    - Một NV có thể có nhiều bản ghi (điều chuyển qua các phòng ban, thăng chức...)
    """

    __tablename__ = "nhan_vien_cong_tac"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32),
        ForeignKey("nhan_vien.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    phong_ban_id = Column(
        String(32),
        ForeignKey("phong_ban.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chuc_vu_id = Column(
        String(32),
        ForeignKey("chuc_vu.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Thời gian
    ngay_bat_dau = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    ngay_ket_thuc = Column(
        DateTime(timezone=True), nullable=True
    )  # NULL = đang công tác

    # Đánh dấu
    is_primary = Column(Boolean, nullable=False, default=False)  # Vị trí chính hiện tại

    # Thông tin lương
    he_so_luong = Column(Numeric(5, 2), nullable=True)
    bac_luong = Column(String(10), nullable=True)

    # Ghi chú
    ghi_chu = Column(Text, nullable=True)
    trang_thai = Column(
        String(20), nullable=False, default="dang_cong_tac"
    )  # dang_cong_tac, da_nghi, da_chuyen

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="cong_tac", lazy="selectin")
    phong_ban = relationship("PhongBan", back_populates="cong_tacs", lazy="selectin")
    chuc_vu = relationship("ChucVu", back_populates="nhan_viens", lazy="selectin")
