"""merge nguoi_than and cau_hinh_nghi_phep heads

Revision ID: 248e1101f916
Revises: nguoi_than_v1, seed_cau_hinh_nghi_phep_v1
Create Date: 2026-04-21 21:41:39.542266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '248e1101f916'
down_revision: Union[str, Sequence[str], None] = ('nguoi_than_v1', 'seed_cau_hinh_nghi_phep_v1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
