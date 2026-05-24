"""add_loai_to_chuc_vu

Revision ID: a1b2c3d4e5f6
Revises: 0e5bcd6cd911
Create Date: 2026-04-14 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "0e5bcd6cd911"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add loai column to chuc_vu table.

    loai values: quan_ly / giao_vien / nhan_vien
    Default: nhan_vien
    """
    op.add_column(
        "chuc_vu",
        sa.Column(
            "loai", sa.String(length=20), nullable=False, server_default="nhan_vien"
        ),
    )


def downgrade() -> None:
    """Remove loai column from chuc_vu table."""
    op.drop_column("chuc_vu", "loai")
