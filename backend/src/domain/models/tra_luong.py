from sqlalchemy import Column, String, Text, BigInteger, SmallInteger, Date, ForeignKey, UniqueConstraint, DateTime
from datetime import datetime

from .base import Base, generate_uuid


class TraLuong(Base):
    """Phiếu lương hàng tháng - lịch sử chi trả."""
    __tablename__ = "tra_luong"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "thang", "nam", name="uq_tra_luong"),
    )

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    luong_id = Column(String(32), ForeignKey("luong.id", ondelete="SET NULL"))
    cham_cong_id = Column(String(32), ForeignKey("cham_cong.id", ondelete="SET NULL"))
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)

    # Kết quả tính toán
    luong_co_ban = Column(BigInteger, nullable=False, default=0)
    tong_phu_cap = Column(BigInteger, nullable=False, default=0)
    thu_nhap_tang_them = Column(BigInteger, nullable=False, default=0)
    thuong = Column(BigInteger, nullable=False, default=0)
    tong_thu_nhap = Column(BigInteger, nullable=False, default=0)
    tong_khau_tru = Column(BigInteger, nullable=False, default=0)
    luong_thuc_nhan = Column(BigInteger, nullable=False, default=0)

    # Thanh toán
    ngay_tra_luong = Column(Date)
    phuong_thuc = Column(String(20), nullable=False, default="chuyen_khoan")
    so_tai_khoan = Column(String(30))
    ngan_hang = Column(String(100))
    trang_thai = Column(String(15), nullable=False, default="chua_tra")
    ghi_chu = Column(Text)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
