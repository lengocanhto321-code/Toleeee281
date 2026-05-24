"""add_missing_qr_config_columns

Revision ID: add_missing_qr_config_v1
Revises: add_qr_attendance_v1
Create Date: 2026-04-14 16:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "add_missing_qr_config_v1"
down_revision: Union[str, Sequence[str], None] = "add_qr_attendance_v1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table_name: str, column_name: str, connection) -> bool:
    """Check if a column exists in a table."""
    inspector = inspect(connection)
    columns = [col["name"] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    """Add missing columns to qr_config table."""
    conn = op.get_bind()

    if "qr_config" not in inspect(conn).get_table_names():
        return

    if not column_exists("qr_config", "gio_bat_dau", conn):
        op.add_column(
            "qr_config",
            sa.Column("gio_bat_dau", sa.Time(), nullable=True),
        )

    if not column_exists("qr_config", "gio_ket_thuc", conn):
        op.add_column(
            "qr_config",
            sa.Column("gio_ket_thuc", sa.Time(), nullable=True),
        )

    if not column_exists("qr_config", "vi_tri", conn):
        op.add_column(
            "qr_config",
            sa.Column("vi_tri", sa.String(length=100), nullable=True),
        )

    if not column_exists("qr_config", "kinh_do", conn):
        op.add_column(
            "qr_config",
            sa.Column("kinh_do", sa.Float(), nullable=True),
        )

    if not column_exists("qr_config", "vi_do", conn):
        op.add_column(
            "qr_config",
            sa.Column("vi_do", sa.Float(), nullable=True),
        )

    if not column_exists("qr_config", "ban_kinh_cho_phep", conn):
        op.add_column(
            "qr_config",
            sa.Column("ban_kinh_cho_phep", sa.Integer(), nullable=True),
        )


def downgrade() -> None:
    """Remove added columns."""
    conn = op.get_bind()

    if "qr_config" in inspect(conn).get_table_names():
        if column_exists("qr_config", "ban_kinh_cho_phep", conn):
            op.drop_column("qr_config", "ban_kinh_cho_phep")
        if column_exists("qr_config", "vi_do", conn):
            op.drop_column("qr_config", "vi_do")
        if column_exists("qr_config", "kinh_do", conn):
            op.drop_column("qr_config", "kinh_do")
        if column_exists("qr_config", "vi_tri", conn):
            op.drop_column("qr_config", "vi_tri")
        if column_exists("qr_config", "gio_ket_thuc", conn):
            op.drop_column("qr_config", "gio_ket_thuc")
        if column_exists("qr_config", "gio_bat_dau", conn):
            op.drop_column("qr_config", "gio_bat_dau")
