from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    SmallInteger,
    Date,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    Boolean,
    Numeric,
)
from libs.datetime import get_utc_now

from .base import Base, generate_uuid


class TraLuong(Base):
    """Phiếu lương hàng tháng - lịch sử chi trả."""

    __tablename__ = "tra_luong"
    __table_args__ = (
        UniqueConstraint("nhan_vien_id", "thang", "nam", name="uq_tra_luong"),
    )

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32), ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False
    )
    luong_id = Column(String(32), ForeignKey("luong.id", ondelete="SET NULL"))
    cham_cong_id = Column(
        String(32), ForeignKey("cham_cong_thang.id", ondelete="SET NULL")
    )
    ky_luong_id = Column(String(32), ForeignKey("ky_luong.id", ondelete="SET NULL"))
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)

    # Ngày vào/nghỉ (nếu vào hoặc nghỉ giữa tháng)
    ngay_vao = Column(Date)
    ngay_nghi = Column(Date)

    # Số ngày công
    so_ngay_cong_chuan = Column(Numeric(4, 1))
    so_ngay_cong_thuc_te = Column(Numeric(4, 1))

    # Kết quả tính toán
    luong_co_ban = Column(BigInteger, nullable=False, default=0)
    he_so_dac_thu_ap_dung = Column(Numeric(4, 2), default=1.00)
    loai_cong_thuc = Column(String(10), default="cu")  # "cu" hoặc "moi"

    # Phụ cấp chi tiết
    phu_cap_chuc_vu = Column(BigInteger, nullable=False, default=0)
    phu_cap_tham_nien = Column(BigInteger, nullable=False, default=0)
    phu_cap_uu_dai = Column(BigInteger, nullable=False, default=0)
    phu_cap_khu_vuc = Column(BigInteger, nullable=False, default=0)
    phu_cap_tham_nien_vuot_khung = Column(BigInteger, nullable=False, default=0)
    phu_cap_khac = Column(BigInteger, nullable=False, default=0)
    tong_phu_cap = Column(BigInteger, nullable=False, default=0)

    # Thu nhập khác
    thu_nhap_tang_them = Column(BigInteger, nullable=False, default=0)
    thuong = Column(BigInteger, nullable=False, default=0)

    # Khấu trừ chi tiết
    bhxh = Column(BigInteger, nullable=False, default=0)
    bhyt = Column(BigInteger, nullable=False, default=0)
    bhtn = Column(BigInteger, nullable=False, default=0)
    thue_tncn = Column(BigInteger, nullable=False, default=0)
    khau_tru_khac = Column(BigInteger, nullable=False, default=0)
    tong_khau_tru = Column(BigInteger, nullable=False, default=0)

    # Tổng kết
    tong_thu_nhap = Column(BigInteger, nullable=False, default=0)
    luong_thuc_nhan = Column(BigInteger, nullable=False, default=0)

    # Trạng thái đặc biệt
    co_tam_dinh_chi = Column(Boolean, default=False)
    tam_dinh_chi_id = Column(String(32))
    co_ky_luat = Column(Boolean, default=False)
    ky_luat_id = Column(String(32))

    # Thông tin chạy lương
    ngay_chay = Column(DateTime(timezone=True))

    # Thanh toán
    ngay_tra_luong = Column(Date)
    phuong_thuc = Column(String(20), nullable=False, default="chuyen_khoan")
    so_tai_khoan = Column(String(30))
    ngan_hang = Column(String(100))
    trang_thai = Column(String(15), nullable=False, default="chua_tra")
    ghi_chu = Column(Text)

    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )
