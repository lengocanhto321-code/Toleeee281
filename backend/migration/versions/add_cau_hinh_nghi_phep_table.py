"""add_cau_hinh_nghi_phep_table

Revision ID: add_cau_hinh_nghi_phep_v1
Revises: add_2level_approval_v1
Create Date: 2026-04-21 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_cau_hinh_nghi_phep_v1"
down_revision: Union[str, Sequence[str], None] = "add_2level_approval_v1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create CauHinhNghiPhep table."""
    op.create_table(
        "cau_hinh_nghi_phep",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("loai_nghi", sa.String(50), nullable=False, unique=True),
        sa.Column("ten_loai", sa.String(100), nullable=False),
        sa.Column("so_ngay_moi_nam", sa.Float(), nullable=False),
        sa.Column("so_ngay_toi_da_mot_lan", sa.Float(), nullable=True),
        sa.Column("can_giay_to", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column(
            "bat_buoc_ghi_ly_do", sa.Boolean(), nullable=True, server_default="false"
        ),
        sa.Column("trang_thai", sa.Boolean(), nullable=True, server_default="true"),
        sa.Column("ghi_chu", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    """Drop CauHinhNghiPhep table."""
    op.drop_table("cau_hinh_nghi_phep")
