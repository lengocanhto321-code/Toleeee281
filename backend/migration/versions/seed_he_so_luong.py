"""Seed data hệ số lương giáo viên phổ thông

Revision ID: seed_he_so_luong
Revises: abc123def456
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.types import CHAR, DECIMAL, DATE, DATETIME, SMALLINT, TEXT
from datetime import datetime
import uuid


revision = "seed_he_so_luong"
down_revision = "abc123def456"
branch_labels = None
depends_on = None


def generate_id():
    return str(uuid.uuid4())[:32]


def upgrade():
    # Seed bảng cấu hình hệ thống lương
    op.execute("""
        INSERT INTO cau_hinh_he_thong_luong (id, ngay_ap_dung, luong_co_so, he_so_dac_thu, ty_le_quy_thuong, 
            ty_le_bhxh, ty_le_bhyt, ty_le_bhtn, muc_giam_tru_ban_than, muc_giam_tru_nguoi_phu_thuoc, 
            trang_thai, ghi_chu, ngay_tao, ngay_cap_nhat)
        VALUES 
        ('cfg001', '2025-01-01', 2340000, 1.00, 10.00, 8.00, 1.50, 1.00, 11000000, 4400000, 
         'dang_ap_dung', 'Cấu hình lương cơ sở 2025', NOW(), NOW()),
        ('cfg002', '2026-01-01', 2340000, 1.15, 10.00, 8.00, 1.50, 1.00, 11000000, 4400000, 
         'sap_hieu_luc', 'Cấu hình lương 2026 - có hệ số đặc thù', NOW(), NOW())
    """)

    # Seed bảng hệ số lương danh mục - Giáo viên Mầm non (V.07.01)
    he_so_mam_non = [
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 1, 2.10),
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 2, 2.41),
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 3, 2.72),
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 4, 3.03),
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 5, 3.34),
        ("V.07.01.01", "Giáo viên Mầm non hạng I", "mam_non", 6, 3.65),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 1, 1.86),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 2, 2.13),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 3, 2.40),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 4, 2.67),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 5, 2.94),
        ("V.07.01.02", "Giáo viên Mầm non hạng II", "mam_non", 6, 3.21),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 1, 1.65),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 2, 1.89),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 3, 2.13),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 4, 2.37),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 5, 2.61),
        ("V.07.01.03", "Giáo viên Mầm non hạng III", "mam_non", 6, 2.85),
    ]

    # Giáo viên Tiểu học (V.07.02)
    he_so_tieu_hoc = [
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 1, 2.34),
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 2, 2.67),
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 3, 3.00),
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 4, 3.33),
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 5, 3.66),
        ("V.07.02.01", "Giáo viên Tiểu học hạng I", "tieu_hoc", 6, 3.99),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 1, 2.10),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 2, 2.41),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 3, 2.72),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 4, 3.03),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 5, 3.34),
        ("V.07.02.02", "Giáo viên Tiểu học hạng II", "tieu_hoc", 6, 3.65),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 1, 1.86),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 2, 2.13),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 3, 2.40),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 4, 2.67),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 5, 2.94),
        ("V.07.02.03", "Giáo viên Tiểu học hạng III", "tieu_hoc", 6, 3.21),
    ]

    # Giáo viên THCS (V.07.03)
    he_so_thcs = [
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 1, 4.00),
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 2, 4.48),
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 3, 4.96),
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 4, 5.44),
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 5, 5.92),
        ("V.07.03.01", "Giáo viên THCS hạng I", "thcs", 6, 6.40),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 1, 2.34),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 2, 2.67),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 3, 3.00),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 4, 3.33),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 5, 3.66),
        ("V.07.03.02", "Giáo viên THCS hạng II", "thcs", 6, 3.99),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 1, 2.10),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 2, 2.41),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 3, 2.72),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 4, 3.03),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 5, 3.34),
        ("V.07.03.03", "Giáo viên THCS hạng III", "thcs", 6, 3.65),
    ]

    # Giáo viên THPT (V.07.04)
    he_so_thpt = [
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 1, 4.40),
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 2, 4.92),
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 3, 5.44),
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 4, 5.96),
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 5, 6.48),
        ("V.07.04.01", "Giáo viên THPT hạng I", "thpt", 6, 7.00),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 1, 2.34),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 2, 2.67),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 3, 3.00),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 4, 3.33),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 5, 3.66),
        ("V.07.04.02", "Giáo viên THPT hạng II", "thpt", 6, 3.99),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 1, 2.10),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 2, 2.41),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 3, 2.72),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 4, 3.03),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 5, 3.34),
        ("V.07.04.03", "Giáo viên THPT hạng III", "thpt", 6, 3.65),
    ]

    all_he_so = he_so_mam_non + he_so_tieu_hoc + he_so_thcs + he_so_thpt

    for ma_ngach, ten_ngach, cap_hoc, bac, he_so in all_he_so:
        op.execute(f"""
            INSERT INTO he_so_luong_danh_muc (id, ma_ngach, ten_ngach, cap_hoc, bac, he_so, ngay_ap_dung, ngay_tao, ngay_cap_nhat)
            VALUES ('{generate_id()}', '{ma_ngach}', '{ten_ngach}', '{cap_hoc}', {bac}, {he_so}, '2025-01-01', NOW(), NOW())
        """)

    # Seed bảng cấu hình phụ cấp theo cấp học
    phu_cap_config = [
        ("mam_non", 40.00, 0.00, "Mầm non - vùng thường"),
        ("tieu_hoc", 35.00, 0.00, "Tiểu học - vùng thường"),
        ("thcs", 30.00, 0.00, "THCS - vùng thường"),
        ("thpt", 30.00, 0.00, "THPT - vùng thường"),
    ]

    for cap_hoc, ty_le_pc, he_so_kv, ghi_chu in phu_cap_config:
        op.execute(f"""
            INSERT INTO phu_cap_theo_cap_hoc (id, cap_hoc, ty_le_pc_uu_dai, he_so_khu_vuc, ngay_ap_dung, ghi_chu, ngay_tao, ngay_cap_nhat)
            VALUES ('{generate_id()}', '{cap_hoc}', {ty_le_pc}, {he_so_kv}, '2025-01-01', '{ghi_chu}', NOW(), NOW())
        """)


def downgrade():
    op.execute("DELETE FROM phu_cap_theo_cap_hoc")
    op.execute("DELETE FROM he_so_luong_danh_muc")
    op.execute("DELETE FROM cau_hinh_he_thong_luong")
