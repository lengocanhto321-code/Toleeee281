"""add_nghi_phep_tables_v2

Revision ID: 1957a2f5091b
Revises: 519a9fd83f52
Create Date: 2026-04-13 12:50:07.150570

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1957a2f5091b"
down_revision: Union[str, Sequence[str], None] = "519a9fd83f52"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add tables for Nghỉ phép, Số ngày phép, and Chấm công tháng."""

    # === don_xin_nghi ===
    op.create_table(
        "don_xin_nghi",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            sa.String(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("loai_nghi", sa.String(30), nullable=False),
        sa.Column("tu_ngay", sa.Date(), nullable=False),
        sa.Column("den_ngay", sa.Date(), nullable=False),
        sa.Column("so_ngay", sa.Numeric(4, 1), nullable=False),
        sa.Column("ly_do", sa.Text(), nullable=True),
        sa.Column("files", sa.JSON(), nullable=True),
        sa.Column(
            "trang_thai", sa.String(20), nullable=False, server_default="cho_duyet"
        ),
        sa.Column("lich_su_duyet", sa.JSON(), nullable=True),
        sa.Column("ghi_chu_duyet", sa.Text(), nullable=True),
        sa.Column("nguoi_tao_id", sa.String(32), nullable=True),
        sa.Column("nguoi_duyet_id", sa.String(32), nullable=True),
        sa.Column("ngay_duyet", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_don_xin_nghi_nhan_vien", "don_xin_nghi", ["nhan_vien_id"])
    op.create_index("ix_don_xin_nghi_trang_thai", "don_xin_nghi", ["trang_thai"])
    op.create_index("ix_don_xin_nghi_ngay", "don_xin_nghi", ["tu_ngay", "den_ngay"])

    # === so_ngay_phep ===
    op.create_table(
        "so_ngay_phep",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            sa.String(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("nam", sa.SmallInteger(), nullable=False),
        sa.Column(
            "phep_nam_duoc_phep", sa.Numeric(4, 1), nullable=False, server_default="12"
        ),
        sa.Column(
            "phep_nam_da_su_dung", sa.Numeric(4, 1), nullable=False, server_default="0"
        ),
        sa.Column(
            "phep_nam_con_lai", sa.Numeric(4, 1), nullable=False, server_default="12"
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index(
        "ix_so_ngay_phep_nhan_vien_nam",
        "so_ngay_phep",
        ["nhan_vien_id", "nam"],
        unique=True,
    )

    # === cham_cong_thang ===
    op.create_table(
        "cham_cong_thang",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            sa.String(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("thang", sa.SmallInteger(), nullable=False),
        sa.Column("nam", sa.SmallInteger(), nullable=False),
        sa.Column(
            "so_ngay_lam_chuan", sa.Numeric(4, 1), nullable=False, server_default="26"
        ),
        sa.Column(
            "so_ngay_co_mat", sa.Numeric(4, 1), nullable=False, server_default="0"
        ),
        sa.Column(
            "so_ngay_vang_co_phep", sa.Numeric(4, 1), nullable=False, server_default="0"
        ),
        sa.Column(
            "so_ngay_vang_khong_phep",
            sa.Numeric(4, 1),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "so_ngay_nghi_le_tet", sa.Numeric(4, 1), nullable=False, server_default="0"
        ),
        sa.Column(
            "so_ngay_cong_tac", sa.Numeric(4, 1), nullable=False, server_default="0"
        ),
        sa.Column(
            "he_so_ngay_cong", sa.Numeric(4, 4), nullable=False, server_default="1.0"
        ),
        sa.Column(
            "trang_thai", sa.String(20), nullable=False, server_default="da_mock"
        ),
        sa.Column("ghi_chu", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_cham_cong_thang_nhan_vien", "cham_cong_thang", ["nhan_vien_id"])
    op.create_index("ix_cham_cong_thang_thang_nam", "cham_cong_thang", ["thang", "nam"])
    op.create_index(
        "ix_cham_cong_thang_unique",
        "cham_cong_thang",
        ["nhan_vien_id", "thang", "nam"],
        unique=True,
    )


def downgrade() -> None:
    """Drop tables."""
    op.drop_table("cham_cong_thang")
    op.drop_table("so_ngay_phep")
    op.drop_table("don_xin_nghi")
