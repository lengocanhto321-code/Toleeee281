"""Add salary configuration tables

Revision ID: abc123def456
Revises: ac9225a0a31e
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import CHAR, DECIMAL, DATE, SMALLINT, TEXT, BOOLEAN
from datetime import datetime


revision = "abc123def456"
down_revision = "ac9225a0a31e"
branch_labels = None
depends_on = None


def upgrade():
    # 1. Bảng cấu hình hệ thống lương
    op.create_table(
        "cau_hinh_he_thong_luong",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column("ngay_ap_dung", DATE, nullable=False),
        sa.Column("luong_co_so", sa.BigInteger, nullable=False, default=2340000),
        sa.Column("he_so_dac_thu", DECIMAL(4, 2), nullable=False, default=1.00),
        sa.Column("ty_le_quy_thuong", DECIMAL(5, 2), nullable=False, default=10.00),
        sa.Column("ty_le_bhxh", DECIMAL(5, 2), nullable=False, default=8.00),
        sa.Column("ty_le_bhyt", DECIMAL(5, 2), nullable=False, default=1.50),
        sa.Column("ty_le_bhtn", DECIMAL(5, 2), nullable=False, default=1.00),
        sa.Column(
            "muc_giam_tru_ban_than", sa.BigInteger, nullable=False, default=11000000
        ),
        sa.Column(
            "muc_giam_tru_nguoi_phu_thuoc",
            sa.BigInteger,
            nullable=False,
            default=4400000,
        ),
        sa.Column("trang_thai", CHAR(20), nullable=False, default="dang_ap_dung"),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 2. Bảng hệ số lương theo ngạch/bậc
    op.create_table(
        "he_so_luong_danh_muc",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column("ma_ngach", CHAR(20), nullable=False),
        sa.Column("ten_ngach", CHAR(100), nullable=False),
        sa.Column("cap_hoc", CHAR(20), nullable=False),
        sa.Column("bac", SMALLINT, nullable=False),
        sa.Column("he_so", DECIMAL(5, 2), nullable=False),
        sa.Column("ngay_ap_dung", DATE, nullable=False),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 3. Bảng cấu hình phụ cấp theo cấp học
    op.create_table(
        "phu_cap_theo_cap_hoc",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column("cap_hoc", CHAR(20), nullable=False),
        sa.Column("ty_le_pc_uu_dai", DECIMAL(5, 2), nullable=False),
        sa.Column("he_so_khu_vuc", DECIMAL(4, 2), nullable=False, default=0.00),
        sa.Column("ngay_ap_dung", DATE, nullable=False),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 4. Bảng tạm đình chỉ công tác
    op.create_table(
        "tam_dinh_chi_cong_tac",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            CHAR(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ngay_bat_dau", DATE, nullable=False),
        sa.Column("ngay_ket_thuc", DATE),
        sa.Column("ly_do", TEXT),
        sa.Column("ty_le_huong_luong", DECIMAL(5, 2), nullable=False, default=50.00),
        sa.Column("so_tien_tam_ung", sa.BigInteger, nullable=False, default=0),
        sa.Column("so_tien_hoan_lai", sa.BigInteger, nullable=False, default=0),
        sa.Column("co_bi_ky_luat", BOOLEAN, nullable=True),
        sa.Column("quyet_dinh_so", CHAR(50)),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
        sa.Column("ghi_chu", TEXT),
    )

    # 5. Bảng kỷ luật viên chức (mở rộng từ khen_thuong_ky_luat)
    op.create_table(
        "ky_luat_vien_chuc",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            CHAR(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("hinh_thuc", CHAR(30), nullable=False),
        sa.Column("ngay_quyet_dinh", DATE, nullable=False),
        sa.Column("ngay_co_hieu_luc", DATE),
        sa.Column("ly_do", TEXT),
        sa.Column("muc_do_vi_pham", CHAR(30)),
        sa.Column("trang_thai", CHAR(20), nullable=False, default="da_xu_ly"),
        sa.Column("co_hoan_tien", BOOLEAN, nullable=False, default=False),
        sa.Column("nguoi_ky", CHAR(100)),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
        sa.Column("ghi_chu", TEXT),
    )

    # 6. Bảng cấu hình thưởng Tết
    op.create_table(
        "cau_hinh_thuong_tet",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column("nam", SMALLINT, nullable=False, unique=True),
        sa.Column("ty_le_thuong", DECIMAL(4, 2), nullable=False, default=1.00),
        sa.Column("bat_len", BOOLEAN, nullable=False, default=False),
        sa.Column("ngay_ap_dung", DATE),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 7. Bảng lương tháng 13
    op.create_table(
        "luong_thang_13",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            CHAR(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("nam", SMALLINT, nullable=False),
        sa.Column("tien_thuong", sa.BigInteger, nullable=False, default=0),
        sa.Column("tien_thue_tncn", sa.BigInteger, nullable=False, default=0),
        sa.Column("ngay_tra", DATE),
        sa.Column("trang_thai", CHAR(20), nullable=False, default="chua_tra"),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 8. Bảng kỳ lương (để quản lý đợt chạy lương)
    op.create_table(
        "ky_luong",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column("thang", SMALLINT, nullable=False),
        sa.Column("nam", SMALLINT, nullable=False),
        sa.Column("ngay_bat_dau", DATE, nullable=False),
        sa.Column("ngay_ket_thuc", DATE, nullable=False),
        sa.Column("ngay_chay", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column("tong_nhan_vien", SMALLINT, nullable=False, default=0),
        sa.Column("tong_thu_nhap", sa.BigInteger, nullable=False, default=0),
        sa.Column("tong_thuc_nhan", sa.BigInteger, nullable=False, default=0),
        sa.Column("trang_thai", CHAR(20), nullable=False, default="chua_duyet"),
        sa.Column("nguoi_duyet", CHAR(32)),
        sa.Column("ngay_duyet", sa.TIMESTAMP),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
        sa.Column(
            "ngay_cap_nhat",
            sa.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        ),
    )

    # 9. Bảng chi tiết phụ cấp trong phiếu lương
    op.create_table(
        "chi_tiet_phu_cap",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column(
            "tra_luong_id",
            CHAR(32),
            sa.ForeignKey("tra_luong.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("loai_phu_cap", CHAR(30), nullable=False),
        sa.Column("ten_phu_cap", CHAR(100), nullable=False),
        sa.Column("so_tien", sa.BigInteger, nullable=False, default=0),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
    )

    # 10. Bảng chi tiết khấu trừ trong phiếu lương
    op.create_table(
        "chi_tiet_khau_tru",
        sa.Column("id", CHAR(32), primary_key=True),
        sa.Column(
            "tra_luong_id",
            CHAR(32),
            sa.ForeignKey("tra_luong.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("loai_khau_tru", CHAR(30), nullable=False),
        sa.Column("ten_khau_tru", CHAR(100), nullable=False),
        sa.Column("so_tien", sa.BigInteger, nullable=False, default=0),
        sa.Column("ghi_chu", TEXT),
        sa.Column("nguoi_tao", CHAR(32)),
        sa.Column("ngay_tao", sa.TIMESTAMP, nullable=False, default=datetime.utcnow),
    )

    # Cập nhật bảng tra_luong - thêm trường mới
    op.add_column("tra_luong", sa.Column("ngay_vao", DATE))
    op.add_column("tra_luong", sa.Column("ngay_nghi", DATE))
    op.add_column("tra_luong", sa.Column("co_tam_dinh_chi", BOOLEAN, default=False))
    op.add_column("tra_luong", sa.Column("tam_dinh_chi_id", CHAR(32)))
    op.add_column("tra_luong", sa.Column("co_ky_luat", BOOLEAN, default=False))
    op.add_column("tra_luong", sa.Column("ky_luat_id", CHAR(32)))
    op.add_column(
        "tra_luong", sa.Column("he_so_dac_thu_ap_dung", DECIMAL(4, 2), default=1.00)
    )
    op.add_column("tra_luong", sa.Column("loai_cong_thuc", CHAR(10), default="cu"))
    op.add_column("tra_luong", sa.Column("ky_luong_id", CHAR(32)))
    op.add_column("tra_luong", sa.Column("ngay_chay", sa.TIMESTAMP))
    op.add_column("tra_luong", sa.Column("so_ngay_cong_chuan", DECIMAL(4, 1)))
    op.add_column("tra_luong", sa.Column("so_ngay_cong_thuc_te", DECIMAL(4, 1)))

    # Cập nhật bảng luong - thêm trường mới
    op.add_column("luong", sa.Column("ma_ngach", CHAR(20)))
    op.add_column("luong", sa.Column("bac", SMALLINT))
    op.add_column("luong", sa.Column("so_nam_tham_nien", SMALLINT, default=0))
    op.add_column("luong", sa.Column("ty_le_pc_uu_dai", DECIMAL(5, 2), default=30.00))
    op.add_column("luong", sa.Column("he_so_khu_vuc", DECIMAL(4, 2), default=0.00))
    op.add_column(
        "luong", sa.Column("phu_cap_tham_nien_vuot_khung", sa.BigInteger, default=0)
    )
    op.add_column("luong", sa.Column("la_giao_vien_tap_su", BOOLEAN, default=False))

    # Cập nhật bảng nhan_vien - thêm trường ngày vào
    op.add_column("nhan_vien", sa.Column("ngay_vao_nganh", DATE))

    # Tạo index cho các bảng mới
    op.create_index("ix_he_so_luong_ma_ngach", "he_so_luong_danh_muc", ["ma_ngach"])
    op.create_index(
        "ix_cau_hinh_luong_ngay", "cau_hinh_he_thong_luong", ["ngay_ap_dung"]
    )
    op.create_index("ix_ky_luong_thang_nam", "ky_luong", ["thang", "nam"])
    op.create_index(
        "ix_tam_dinh_chi_nhan_vien", "tam_dinh_chi_cong_tac", ["nhan_vien_id"]
    )
    op.create_index("ix_ky_luat_nhan_vien", "ky_luat_vien_chuc", ["nhan_vien_id"])


def downgrade():
    # Xóa index
    op.drop_index("ix_ky_luat_nhan_vien", "ky_luat_vien_chuc")
    op.drop_index("ix_tam_dinh_chi_nhan_vien", "tam_dinh_chi_cong_tac")
    op.drop_index("ix_ky_luong_thang_nam", "ky_luong")
    op.drop_index("ix_cau_hinh_luong_ngay", "cau_hinh_he_thong_luong")
    op.drop_index("ix_he_so_luong_ma_ngach", "he_so_luong_danh_muc")

    # Xóa cột đã thêm vào bảng
    op.drop_column("nhan_vien", "ngay_vao_nganh")
    op.drop_column("luong", "la_giao_vien_tap_su")
    op.drop_column("luong", "phu_cap_tham_nien_vuot_khung")
    op.drop_column("luong", "he_so_khu_vuc")
    op.drop_column("luong", "ty_le_pc_uu_dai")
    op.drop_column("luong", "so_nam_tham_nien")
    op.drop_column("luong", "bac")
    op.drop_column("luong", "ma_ngach")
    op.drop_column("tra_luong", "so_ngay_cong_thuc_te")
    op.drop_column("tra_luong", "so_ngay_cong_chuan")
    op.drop_column("tra_luong", "ngay_chay")
    op.drop_column("tra_luong", "ky_luong_id")
    op.drop_column("tra_luong", "loai_cong_thuc")
    op.drop_column("tra_luong", "he_so_dac_thu_ap_dung")
    op.drop_column("tra_luong", "ky_luat_id")
    op.drop_column("tra_luong", "co_ky_luat")
    op.drop_column("tra_luong", "tam_dinh_chi_id")
    op.drop_column("tra_luong", "co_tam_dinh_chi")
    op.drop_column("tra_luong", "ngay_nghi")
    op.drop_column("tra_luong", "ngay_vao")

    # Xóa bảng
    op.drop_table("chi_tiet_khau_tru")
    op.drop_table("chi_tiet_phu_cap")
    op.drop_table("ky_luong")
    op.drop_table("luong_thang_13")
    op.drop_table("cau_hinh_thuong_tet")
    op.drop_table("ky_luat_vien_chuc")
    op.drop_table("tam_dinh_chi_cong_tac")
    op.drop_table("phu_cap_theo_cap_hoc")
    op.drop_table("he_so_luong_danh_muc")
    op.drop_table("cau_hinh_he_thong_luong")
