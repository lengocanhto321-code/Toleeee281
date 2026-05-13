from sqlalchemy import (
    Column,
    String,
    Boolean,
    Text,
    Date,
    ForeignKey,
    DateTime,
    Integer,
)
from sqlalchemy.orm import relationship
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
    dia_chi_tam_tru = Column(String(255))
    so_dien_thoai = Column(String(15))
    email = Column(String(100))
    email_ca_nhan = Column(String(100))
    so_cccd = Column(String(12))
    ngay_cap_cccd = Column(Date)
    noi_cap_cccd = Column(String(200))
    anh_dai_dien = Column(String(500))

    # CCCD front/back images
    cccd_front = Column(String(500))
    cccd_back = Column(String(500))

    # Nơi sinh
    noi_sinh = Column(String(200))
    dan_toc = Column(String(50))
    ton_giao = Column(String(50))

    # Phân loại
    loai_nhan_vien = Column(String(20), nullable=False, default="giao_vien")
    cap_hoc = Column(String(20))
    mon_day = Column(String(100))
    hang_chuc_danh = Column(String(50))
    ngach_luong = Column(String(50))
    bac_luong = Column(Integer)
    he_so_luong = Column(String(10))
    so_nam_tham_nien = Column(Integer)

    # Phòng ban & Chức vụ (FK)
    phong_ban_id = Column(String(32), ForeignKey("phong_ban.id", ondelete="SET NULL"))
    chuc_vu_id = Column(String(32), ForeignKey("chuc_vu.id", ondelete="SET NULL"))

    # Hợp đồng
    loai_hop_dong = Column(String(30), nullable=False, default="vien_chuc")
    so_hop_dong = Column(String(50))
    ngay_vao_lam = Column(Date)
    ngay_het_hop_dong = Column(Date)
    hinh_thuc_tuyen_dung = Column(String(100))
    noi_ky_hop_dong = Column(String(200))

    # Phụ cấp
    phu_cap_chuc_vu = Column(String(20))
    ngay_bo_nhiem_chuc_vu = Column(Date)

    # Đảng viên
    la_dang_vien = Column(Boolean, nullable=False, default=False)
    la_doan_vien = Column(Boolean, nullable=False, default=False)
    ngay_vao_dang = Column(Date)
    ngay_vao_doan = Column(Date)

    # Tình trạng hôn nhân
    tinh_trang_hon_nhan = Column(String(20))

    # Ghi chú
    ghi_chu = Column(Text)
    trang_thai = Column(String(20), nullable=False, default="dang_lam")

    # Soft-delete
    deleted_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    # Direct FK to PhongBan (not through CongTac)
    phong_ban = relationship("PhongBan", lazy="selectin")
    # Direct FK to ChucVu (current position)
    chuc_vu = relationship("ChucVu", lazy="selectin")
    cong_tac = relationship(
        "CongTac",
        back_populates="nhan_vien",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    bang_caps = relationship(
        "BangCapChungChi",
        foreign_keys="BangCapChungChi.nhan_vien_id",
        back_populates="nhan_vien",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    tai_lieus = relationship(
        "TaiLieuNhanVien",
        back_populates="nhan_vien",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    nguoi_thans = relationship(
        "NguoiThan",
        back_populates="nhan_vien",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    hop_dongs = relationship(
        "HopDong",
        back_populates="nhan_vien",
        lazy="selectin",
        cascade="all, delete-orphan",
    )


class TaiLieuNhanVien(Base):
    """Bảng lưu trữ giấy tờ, tài liệu của nhân viên.

    Các loại tài liệu:
    - cccd: CCCD/CMND
    - ho_so: Hồ sơ ứng tuyển
    - hop_dong: Hợp đồng lao động
    - bang_cap: Bằng cấp, chứng chỉ
    - khac: Tài liệu khác
    """

    __tablename__ = "tai_lieu_nhan_vien"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    loai_tai_lieu = Column(String(30), nullable=False)
    ten_tai_lieu = Column(String(255), nullable=False)
    duong_dan = Column(String(500), nullable=False)
    ten_file_goc = Column(String(255))
    kich_thuoc = Column(Integer)
    dinh_dang = Column(String(50))
    mo_ta = Column(Text)
    ngay_het_han = Column(Date)
    la_ban_chinh = Column(Boolean, default=False)
    trang_thai = Column(String(20), nullable=False, default="hieu_luc")

    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    nhan_vien = relationship("NhanVien", back_populates="tai_lieus")

    @property
    def file_name_pattern(self) -> str:
        """Tạo tên file theo pattern: <ten_nhan_vien>-<id_nhan_vien>/<loai_tai_lieu>/<ten_file>"""
        return f"{self.nhan_vien_id}/{self.loai_tai_lieu}/{self.ten_file_goc}"


# Loại tài liệu constants
LOAI_TAI_LIEU = {
    "cccd": "CCCD/CMND",
    "ho_so": "Hồ sơ ứng tuyển",
    "hop_dong": "Hợp đồng lao động",
    "bang_cap": "Bằng cấp/Chứng chỉ",
    "bien_ban": "Biên bản các loại",
    "quyet_dinh": "Quyết định",
    "khac": "Tài liệu khác",
}

LOAI_TAI_LIEU_LABELS = LOAI_TAI_LIEU
