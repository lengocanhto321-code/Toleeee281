from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    Date,
    Numeric,
    ForeignKey,
    DateTime,
    Boolean,
    SmallInteger,
)
from datetime import datetime

from .base import Base, generate_uuid


class Luong(Base):
    """Bảng lương theo ngạch bậc viên chức + phụ cấp."""

    __tablename__ = "luong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )

    # Thông tin ngạch/bậc
    ma_ngach = Column(String(20))
    bac = Column(SmallInteger)

    # Hệ số lương
    he_so_luong = Column(Numeric(5, 2), nullable=False, default=1.00)

    # Thông tin thâm niên
    so_nam_tham_nien = Column(SmallInteger, default=0)

    # Tỷ lệ phụ cấp (%)
    ty_le_pc_uu_dai = Column(Numeric(5, 2), default=30.00)
    he_so_khu_vuc = Column(Numeric(4, 2), default=0.00)

    # Phụ cấp (số tiền) - được tính tự động hoặc nhập tay
    luong_co_ban = Column(BigInteger, nullable=False, default=0)
    phu_cap_chuc_vu = Column(BigInteger, nullable=False, default=0)
    phu_cap_tham_nien = Column(BigInteger, nullable=False, default=0)
    phu_cap_uu_dai = Column(BigInteger, nullable=False, default=0)
    phu_cap_khu_vuc = Column(BigInteger, nullable=False, default=0)
    phu_cap_tham_nien_vuot_khung = Column(BigInteger, nullable=False, default=0)
    phu_cap_khac = Column(BigInteger, nullable=False, default=0)

    # Khấu trừ mặc định (tham chiếu, không tính vào lương)
    bhxh = Column(BigInteger, nullable=False, default=0)
    bhyt = Column(BigInteger, nullable=False, default=0)
    thue_tncn = Column(BigInteger, nullable=False, default=0)
    khau_tru_khac = Column(BigInteger, nullable=False, default=0)

    # Trạng thái đặc biệt
    la_giao_vien_tap_su = Column(Boolean, default=False)

    # Thời hiệu
    hieu_luc_tu = Column(Date, nullable=False)
    hieu_luc_den = Column(Date)
    ghi_chu = Column(Text)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
