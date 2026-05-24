"""merge heads

Revision ID: a804bd663080
Revises: 1957a2f5091b, a1b2c3d4e5f6
Create Date: 2026-04-14 12:46:17.989703

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a804bd663080'
down_revision: Union[str, Sequence[str], None] = ('1957a2f5091b', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
