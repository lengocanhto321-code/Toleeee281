"""Rename ngay_tao/ngay_cap_nhat to created_at/updated_at

Revision ID: rename_datetime_columns
Revises: seed_he_so_luong
Create Date: 2026-04-12
"""

from alembic import op
import sqlalchemy as sa


revision = "rename_datetime_columns"
down_revision = "seed_he_so_luong"
branch_labels = None
depends_on = None


def upgrade():
    tables = [
        "cau_hinh_he_thong_luong",
        "he_so_luong_danh_muc",
        "phu_cap_theo_cap_hoc",
        "tam_dinh_chi_cong_tac",
        "ky_luat_vien_chuc",
        "cau_hinh_thuong_tet",
        "luong_thang_13",
        "ky_luong",
    ]
    for table in tables:
        op.alter_column(
            table,
            "ngay_tao",
            new_column_name="created_at",
            type_=sa.TIMESTAMP,
            nullable=False,
        )
        op.alter_column(
            table,
            "ngay_cap_nhat",
            new_column_name="updated_at",
            type_=sa.TIMESTAMP,
            nullable=False,
        )


def downgrade():
    tables = [
        "cau_hinh_he_thong_luong",
        "he_so_luong_danh_muc",
        "phu_cap_theo_cap_hoc",
        "tam_dinh_chi_cong_tac",
        "ky_luat_vien_chuc",
        "cau_hinh_thuong_tet",
        "luong_thang_13",
        "ky_luong",
    ]
    for table in tables:
        op.alter_column(
            table,
            "created_at",
            new_column_name="ngay_tao",
            type_=sa.TIMESTAMP,
            nullable=False,
        )
        op.alter_column(
            table,
            "updated_at",
            new_column_name="ngay_cap_nhat",
            type_=sa.TIMESTAMP,
            nullable=False,
        )
