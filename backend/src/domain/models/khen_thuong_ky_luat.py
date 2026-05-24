from sqlalchemy import Column, String, Text, BigInteger, Date, ForeignKey, DateTime
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class KhenThuongKyLuat(Base):
    """Khen thưởng & kỷ luật - cơ sở xét thi đua hàng năm."""

    __tablename__ = "khen_thuong_ky_luat"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    loai = Column(String(15), nullable=False)
    hinh_thuc = Column(String(150), nullable=False)
    ly_do = Column(Text, nullable=False)
    ngay_quyet_dinh = Column(Date, nullable=False)
    so_quyet_dinh = Column(String(50))
    cap_quyet_dinh = Column(String(50))
    gia_tri_thuong = Column(BigInteger, nullable=False, default=0)
    thoi_han_ky_luat = Column(Date)
    ghi_chu = Column(Text)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
