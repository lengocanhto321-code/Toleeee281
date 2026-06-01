"""add_ma_nhap_to_qr_config

Revision ID: c0ffee123456
Revises: ef7d64c459df
Create Date: 2026-05-26 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "c0ffee123456"
down_revision: Union[str, Sequence[str], None] = "ef7d64c459df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table_name: str, column_name: str, connection) -> bool:
    inspector = inspect(connection)
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    conn = op.get_bind()

    if "qr_config" not in inspect(conn).get_table_names():
        return

    if not column_exists("qr_config", "ma_nhap", conn):
        op.add_column(
            "qr_config",
            sa.Column("ma_nhap", sa.String(length=6), nullable=True, unique=True),
        )


def downgrade() -> None:
    conn = op.get_bind()

    if "qr_config" in inspect(conn).get_table_names() and column_exists(
        "qr_config", "ma_nhap", conn
    ):
        op.drop_column("qr_config", "ma_nhap")
