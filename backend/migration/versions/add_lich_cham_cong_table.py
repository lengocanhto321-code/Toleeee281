"""add_lich_cham_cong_table

Revision ID: add_lich_cham_cong_v1
Revises: seed_cau_hinh_nghi_phep_v1
Create Date: 2026-05-14 00:00:00.000000

"""

from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa


revision: str = "add_lich_cham_cong_v1"
down_revision: Union[str, Sequence[str], None] = "seed_cau_hinh_nghi_phep_v1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "lich_cham_cong",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("gio_check_in", sa.Time(), nullable=False, server_default="07:00:00"),
        sa.Column(
            "gio_check_out", sa.Time(), nullable=False, server_default="17:00:00"
        ),
        sa.Column(
            "ngay_lam_viec", sa.String(20), nullable=False, server_default="0,1,2,3,4,5"
        ),
        sa.Column("bat_gps", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("kinh_do", sa.Float(), nullable=True),
        sa.Column("vi_do", sa.Float(), nullable=True),
        sa.Column("ten_vi_tri", sa.String(100), nullable=True),
        sa.Column("ban_kinh_cho_phep", sa.Integer(), server_default="100"),
        sa.Column("trang_thai", sa.String(20), nullable=False, server_default="active"),
        sa.Column(
            "created_by",
            sa.String(32),
            sa.ForeignKey("tai_khoan.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("lich_cham_cong")
