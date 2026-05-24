"""add_hop_dong_table

Revision ID: dd8444fcbd22
Revises: a804bd663080
Create Date: 2026-04-14 14:14:48.608569

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dd8444fcbd22"
down_revision: Union[str, Sequence[str], None] = "a804bd663080"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "hop_dong",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            sa.String(length=32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("so_hop_dong", sa.String(length=50), nullable=False),
        sa.Column("loai_hop_dong", sa.String(length=30), nullable=False),
        sa.Column("ngay_ky", sa.Date(), nullable=False),
        sa.Column("ngay_bat_dau", sa.Date(), nullable=False),
        sa.Column("ngay_ket_thuc", sa.Date(), nullable=True),
        sa.Column("hinh_thuc_tuyen_dung", sa.String(length=100), nullable=True),
        sa.Column("noi_ky_hop_dong", sa.String(length=200), nullable=True),
        sa.Column("luong_co_ban", sa.String(length=20), nullable=True),
        sa.Column("ghi_chu", sa.Text(), nullable=True),
        sa.Column(
            "trang_thai",
            sa.String(length=20),
            nullable=False,
            server_default="dang_hieu_luc",
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_hop_dong_nhan_vien", "hop_dong", ["nhan_vien_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_hop_dong_nhan_vien", table_name="hop_dong")
    op.drop_table("hop_dong")
