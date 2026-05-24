"""add_2level_approval_nghi_phep

Revision ID: add_2level_approval_v1
Revises: add_missing_qr_config_v1
Create Date: 2026-04-21 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_2level_approval_v1"
down_revision: Union[str, Sequence[str], None] = "add_missing_qr_config_v1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add 2-level approval columns for DonXinNghi."""
    op.add_column(
        "don_xin_nghi",
        sa.Column(
            "cap_duyet_hien_tai", sa.Integer(), nullable=True, server_default="1"
        ),
    )
    op.add_column(
        "don_xin_nghi", sa.Column("nguoi_duyet_cap_1_id", sa.String(32), nullable=True)
    )
    op.add_column(
        "don_xin_nghi", sa.Column("nguoi_duyet_cap_2_id", sa.String(32), nullable=True)
    )
    op.add_column(
        "don_xin_nghi", sa.Column("ngay_duyet_cap_1", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "don_xin_nghi", sa.Column("ngay_duyet_cap_2", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "don_xin_nghi", sa.Column("ghi_chu_duyet_cap_1", sa.Text(), nullable=True)
    )
    op.add_column(
        "don_xin_nghi", sa.Column("ghi_chu_duyet_cap_2", sa.Text(), nullable=True)
    )


def downgrade() -> None:
    """Remove 2-level approval columns."""
    op.drop_column("don_xin_nghi", "ghi_chu_duyet_cap_2")
    op.drop_column("don_xin_nghi", "ghi_chu_duyet_cap_1")
    op.drop_column("don_xin_nghi", "ngay_duyet_cap_2")
    op.drop_column("don_xin_nghi", "ngay_duyet_cap_1")
    op.drop_column("don_xin_nghi", "nguoi_duyet_cap_2_id")
    op.drop_column("don_xin_nghi", "nguoi_duyet_cap_1_id")
    op.drop_column("don_xin_nghi", "cap_duyet_hien_tai")
