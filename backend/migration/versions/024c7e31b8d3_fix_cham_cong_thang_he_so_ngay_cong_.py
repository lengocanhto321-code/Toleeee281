"""fix_cham_cong_thang_he_so_ngay_cong_precision

Revision ID: 024c7e31b8d3
Revises: 248e1101f916
Create Date: 2026-04-21 21:54:27.495306

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "024c7e31b8d3"
down_revision: Union[str, Sequence[str], None] = "248e1101f916"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "cham_cong_thang",
        "he_so_ngay_cong",
        existing_type=sa.Numeric(4, 4),
        type_=sa.Numeric(5, 4),
    )


def downgrade() -> None:
    op.alter_column(
        "cham_cong_thang",
        "he_so_ngay_cong",
        existing_type=sa.Numeric(5, 4),
        type_=sa.Numeric(4, 4),
    )
