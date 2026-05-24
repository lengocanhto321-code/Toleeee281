"""merge heads

Revision ID: bbe32dda7060
Revises: 024c7e31b8d3, add_lich_cham_cong_v1
Create Date: 2026-05-14 16:05:48.907918

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bbe32dda7060'
down_revision: Union[str, Sequence[str], None] = ('024c7e31b8d3', 'add_lich_cham_cong_v1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
