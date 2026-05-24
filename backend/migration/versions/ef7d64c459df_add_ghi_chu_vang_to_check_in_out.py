"""add ghi_chu_vang to check_in_out

Revision ID: ef7d64c459df
Revises: 76b007f56d3a
Create Date: 2026-05-15 00:37:01.472701

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "ef7d64c459df"
down_revision: Union[str, Sequence[str], None] = "76b007f56d3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("check_in_out", sa.Column("ghi_chu_vang", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("check_in_out", "ghi_chu_vang")
