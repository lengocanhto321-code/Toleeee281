"""add_qr_attendance_tables

Revision ID: add_qr_attendance_v1
Revises: dd8444fcbd22
Create Date: 2026-04-14 15:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "add_qr_attendance_v1"
down_revision: Union[str, Sequence[str], None] = "dd8444fcbd22"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(table_name: str, connection) -> bool:
    """Check if a table exists in the database."""
    inspector = inspect(connection)
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    """Upgrade schema - Add QR Attendance tables."""
    conn = op.get_bind()

    # Create qr_config table (only if not exists)
    if not table_exists("qr_config", conn):
        op.create_table(
            "qr_config",
            sa.Column("id", sa.String(length=32), primary_key=True),
            sa.Column(
                "nhan_vien_id",
                sa.String(length=32),
                sa.ForeignKey("nhan_vien.id", ondelete="SET NULL"),
                nullable=True,
            ),
            sa.Column("ngay", sa.Date(), nullable=False),
            sa.Column("loai", sa.String(length=20), nullable=False),
            sa.Column("qr_data", sa.Text(), nullable=False),
            sa.Column("qr_image_base64", sa.Text(), nullable=True),
            sa.Column("mac", sa.String(length=128), nullable=False),
            sa.Column(
                "thoi_gian_hieu_luc",
                sa.DateTime(),
                nullable=False,
            ),
            sa.Column(
                "trang_thai",
                sa.String(length=20),
                nullable=False,
                server_default="active",
            ),
            sa.Column("created_by", sa.String(length=32), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
                onupdate=sa.func.now(),
            ),
        )
        op.create_index("ix_qr_config_ngay", "qr_config", ["ngay"])
        op.create_index("ix_qr_config_nhan_vien", "qr_config", ["nhan_vien_id"])
        op.create_index("ix_qr_config_trang_thai", "qr_config", ["trang_thai"])

    # Create check_in_out table (only if not exists)
    if not table_exists("check_in_out", conn):
        op.create_table(
            "check_in_out",
            sa.Column("id", sa.String(length=32), primary_key=True),
            sa.Column(
                "nhan_vien_id",
                sa.String(length=32),
                sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("ngay", sa.Date(), nullable=False),
            sa.Column("check_in_time", sa.DateTime(), nullable=True),
            sa.Column("check_in_qr_id", sa.String(length=32), nullable=True),
            sa.Column("check_in_lat", sa.Float(), nullable=True),
            sa.Column("check_in_lng", sa.Float(), nullable=True),
            sa.Column("check_in_status", sa.String(length=20), nullable=True),
            sa.Column("check_out_time", sa.DateTime(), nullable=True),
            sa.Column("check_out_qr_id", sa.String(length=32), nullable=True),
            sa.Column("check_out_lat", sa.Float(), nullable=True),
            sa.Column("check_out_lng", sa.Float(), nullable=True),
            sa.Column(
                "trang_thai",
                sa.String(length=20),
                nullable=False,
                server_default="checked_in",
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
                onupdate=sa.func.now(),
            ),
        )
        op.create_index("ix_check_in_out_ngay", "check_in_out", ["ngay"])
        op.create_index("ix_check_in_out_nhan_vien", "check_in_out", ["nhan_vien_id"])
        op.create_index(
            "ix_check_in_out_nhan_vien_ngay",
            "check_in_out",
            ["nhan_vien_id", "ngay"],
            unique=True,
        )

    # cham_cong_thang table might already exist from previous migration
    # Only create if not exists
    if not table_exists("cham_cong_thang", conn):
        op.create_table(
            "cham_cong_thang",
            sa.Column("id", sa.String(length=32), primary_key=True),
            sa.Column(
                "nhan_vien_id",
                sa.String(length=32),
                sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("thang", sa.SmallInteger(), nullable=False),
            sa.Column("nam", sa.SmallInteger(), nullable=False),
            sa.Column(
                "tong_ngay_lam", sa.Integer(), nullable=False, server_default="26"
            ),
            sa.Column(
                "so_ngay_co_mat", sa.Integer(), nullable=False, server_default="0"
            ),
            sa.Column(
                "so_ngay_vang_co_phep", sa.Integer(), nullable=False, server_default="0"
            ),
            sa.Column(
                "so_ngay_vang_khong_phep",
                sa.Integer(),
                nullable=False,
                server_default="0",
            ),
            sa.Column(
                "so_ngay_nghi_le_tet", sa.Integer(), nullable=False, server_default="0"
            ),
            sa.Column("so_ngay_cong", sa.Integer(), nullable=False, server_default="0"),
            sa.Column(
                "he_so_ngay_cong", sa.Float(), nullable=False, server_default="0.0"
            ),
            sa.Column(
                "trang_thai",
                sa.String(length=20),
                nullable=False,
                server_default="chua_cham",
            ),
            sa.Column(
                "created_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
                onupdate=sa.func.now(),
            ),
        )
        op.create_index(
            "ix_cham_cong_thang_nhan_vien", "cham_cong_thang", ["nhan_vien_id"]
        )
        op.create_index(
            "ix_cham_cong_thang_thang_nam", "cham_cong_thang", ["thang", "nam"]
        )
        op.create_index(
            "ix_cham_cong_thang_nhan_vien_thang_nam",
            "cham_cong_thang",
            ["nhan_vien_id", "thang", "nam"],
            unique=True,
        )


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()

    if table_exists("cham_cong_thang", conn):
        op.drop_index(
            "ix_cham_cong_thang_nhan_vien_thang_nam", table_name="cham_cong_thang"
        )
        op.drop_index("ix_cham_cong_thang_thang_nam", table_name="cham_cong_thang")
        op.drop_index("ix_cham_cong_thang_nhan_vien", table_name="cham_cong_thang")
        op.drop_table("cham_cong_thang")

    if table_exists("check_in_out", conn):
        op.drop_index("ix_check_in_out_nhan_vien_ngay", table_name="check_in_out")
        op.drop_index("ix_check_in_out_nhan_vien", table_name="check_in_out")
        op.drop_index("ix_check_in_out_ngay", table_name="check_in_out")
        op.drop_table("check_in_out")

    if table_exists("qr_config", conn):
        op.drop_index("ix_qr_config_trang_thai", table_name="qr_config")
        op.drop_index("ix_qr_config_nhan_vien", table_name="qr_config")
        op.drop_index("ix_qr_config_ngay", table_name="qr_config")
        op.drop_table("qr_config")
