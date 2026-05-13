from sqlalchemy import (
    Column,
    String,
    Text,
    BigInteger,
    Date,
    Numeric,
    SmallInteger,
    DateTime,
    Boolean,
)
from datetime import datetime

from .base import Base, generate_uuid


class CauHinhHeThongLuong(Base):
    """Cấu hình hệ thống lương - lương cơ sở, tỷ lệ BH, thuế."""

    __tablename__ = "cau_hinh_he_thong_luong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ngay_ap_dung = Column(Date, nullable=False)
    luong_co_so = Column(BigInteger, nullable=False, default=2340000)
    he_so_dac_thu = Column(Numeric(4, 2), nullable=False, default=1.00)

    # Tỷ lệ quỹ thưởng
    ty_le_quy_thuong = Column(Numeric(5, 2), nullable=False, default=10.00)

    # Tỷ lệ bảo hiểm
    ty_le_bhxh = Column(Numeric(5, 2), nullable=False, default=8.00)
    ty_le_bhyt = Column(Numeric(5, 2), nullable=False, default=1.50)
    ty_le_bhtn = Column(Numeric(5, 2), nullable=False, default=1.00)

    # Mức giảm trừ thuế
    muc_giam_tru_ban_than = Column(BigInteger, nullable=False, default=11000000)
    muc_giam_tru_nguoi_phu_thuoc = Column(BigInteger, nullable=False, default=4400000)

    # Trạng thái
    trang_thai = Column(
        String(20), nullable=False, default="dang_ap_dung"
    )  # dang_ap_dung, het_han, sap_hieu_luc
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class HeSoLuongDanhMuc(Base):
    """Bảng hệ số lương theo ngạch/bậc."""

    __tablename__ = "he_so_luong_danh_muc"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    ma_ngach = Column(String(20), nullable=False)
    ten_ngach = Column(String(100), nullable=False)
    cap_hoc = Column(String(20), nullable=False)  # mam_non, tieu_hoc, thcs, thpt
    bac = Column(SmallInteger, nullable=False)  # 1-6
    he_so = Column(Numeric(5, 2), nullable=False)
    ngay_ap_dung = Column(Date, nullable=False)
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class PhuCapTheoCapHoc(Base):
    """Cấu hình phụ cấp theo cấp học."""

    __tablename__ = "phu_cap_theo_cap_hoc"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    cap_hoc = Column(String(20), nullable=False)
    ty_le_pc_uu_dai = Column(Numeric(5, 2), nullable=False)
    he_so_khu_vuc = Column(Numeric(4, 2), nullable=False, default=0.00)
    ngay_ap_dung = Column(Date, nullable=False)
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class TamDinhChiCongTac(Base):
    """Tạm đình chỉ công tác."""

    __tablename__ = "tam_dinh_chi_cong_tac"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32),
        nullable=False,
    )
    ngay_bat_dau = Column(Date, nullable=False)
    ngay_ket_thuc = Column(Date)
    ly_do = Column(Text)

    # Lương trong thời gian tạm đình chỉ
    ty_le_huong_luong = Column(Numeric(5, 2), nullable=False, default=50.00)
    so_tien_tam_ung = Column(BigInteger, nullable=False, default=0)
    so_tien_hoan_lai = Column(BigInteger, nullable=False, default=0)

    # Kết quả xử lý
    co_bi_ky_luat = Column(Boolean)  # NULL=chưa, True=Có, False=Không
    quyet_dinh_so = Column(String(50))

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    ghi_chu = Column(Text)


class KyLuatVienChuc(Base):
    """Kỷ luật viên chức."""

    __tablename__ = "ky_luat_vien_chuc"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32),
        nullable=False,
    )

    # Hình thức kỷ luật
    hinh_thuc = Column(
        String(30), nullable=False
    )  # khiem_trach, canh_cao, gianh_chuc, cach_chuc, buoc_thoi_viec
    ngay_quyet_dinh = Column(Date, nullable=False)
    ngay_co_hieu_luc = Column(Date)
    ly_do = Column(Text)

    # Mức độ vi phạm
    muc_do_vi_pham = Column(
        String(30)
    )  # it_nghiem_trong, nghiem_trong, rat_nghiem_trong, dac_biet_nghiem_trong

    # Trạng thái
    trang_thai = Column(
        String(20), nullable=False, default="da_xu_ly"
    )  # dang_xu_ly, da_xu_ly, da_xoa
    co_hoan_tien = Column(Boolean, nullable=False, default=False)

    # Người ký
    nguoi_ky = Column(String(100))

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    ghi_chu = Column(Text)


class CauHinhThuongTet(Base):
    """Cấu hình thưởng Tết."""

    __tablename__ = "cau_hinh_thuong_tet"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nam = Column(SmallInteger, nullable=False, unique=True)
    ty_le_thuong = Column(
        Numeric(4, 2), nullable=False, default=1.00
    )  # 0.5 = nửa tháng, 1.0 = 1 tháng
    bat_len = Column(Boolean, nullable=False, default=False)
    ngay_ap_dung = Column(Date)
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class LuongThang13(Base):
    """Lương tháng 13."""

    __tablename__ = "luong_thang_13"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    nhan_vien_id = Column(
        String(32),
        nullable=False,
    )
    nam = Column(SmallInteger, nullable=False)
    tien_thuong = Column(BigInteger, nullable=False, default=0)
    tien_thue_tncn = Column(BigInteger, nullable=False, default=0)
    ngay_tra = Column(Date)
    trang_thai = Column(
        String(20), nullable=False, default="chua_tra"
    )  # chua_tra, da_tra
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class KyLuong(Base):
    """Kỳ lương - quản lý đợt chạy lương."""

    __tablename__ = "ky_luong"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)
    ngay_bat_dau = Column(Date, nullable=False)
    ngay_ket_thuc = Column(Date, nullable=False)
    ngay_chay = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Tổng kết
    tong_nhan_vien = Column(SmallInteger, nullable=False, default=0)
    tong_thu_nhap = Column(BigInteger, nullable=False, default=0)
    tong_thuc_nhan = Column(BigInteger, nullable=False, default=0)

    # Duyệt
    trang_thai = Column(
        String(20), nullable=False, default="chua_duyet"
    )  # chua_duyet, da_duyet, da_huy
    nguoi_duyet = Column(String(32))
    ngay_duyet = Column(DateTime)

    ghi_chu = Column(Text)
    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ChiTietPhuCap(Base):
    """Chi tiết phụ cấp trong phiếu lương."""

    __tablename__ = "chi_tiet_phu_cap"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    tra_luong_id = Column(String(32), nullable=False)
    loai_phu_cap = Column(
        String(30), nullable=False
    )  # chuc_vu, tham_nien, uu_dai, khu_vuc, khac
    ten_phu_cap = Column(String(100), nullable=False)
    so_tien = Column(BigInteger, nullable=False, default=0)
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class ChiTietKhauTru(Base):
    """Chi tiết khấu trừ trong phiếu lương."""

    __tablename__ = "chi_tiet_khau_tru"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    tra_luong_id = Column(String(32), nullable=False)
    loai_khau_tru = Column(
        String(30), nullable=False
    )  # bhxh, bhyt, bhtn, thue_tncn, boi_thuong, khac
    ten_khau_tru = Column(String(100), nullable=False)
    so_tien = Column(BigInteger, nullable=False, default=0)
    ghi_chu = Column(Text)

    nguoi_tao = Column(String(32))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
