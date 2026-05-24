"""
Add nguoi_than table
"""

from alembic import op
import sqlalchemy as sa

revision = "nguoi_than_v1"
down_revision = "add_qr_attendance_v1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "nguoi_than",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column(
            "nhan_vien_id",
            sa.String(32),
            sa.ForeignKey("nhan_vien.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ho_ten", sa.String(100), nullable=False),
        sa.Column("quan_he", sa.String(50), nullable=False),
        sa.Column("nam_sinh", sa.String(4), nullable=False),
        sa.Column("nghe_nghiep", sa.String(100), nullable=True),
        sa.Column("dia_chi", sa.String(255), nullable=True),
        sa.Column("so_dien_thoai", sa.String(15), nullable=True),
        sa.Column("nguoi_phu_thuoc", sa.Boolean, default=False),
        sa.Column("ghi_chu", sa.String(255), nullable=True),
        sa.Column(
            "created_at", sa.DateTime, nullable=False, server_default=sa.func.now()
        ),
        sa.Column(
            "updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()
        ),
    )
    op.create_index("ix_nguoi_than_nhan_vien_id", "nguoi_than", ["nhan_vien_id"])


def downgrade() -> None:
    op.drop_index("ix_nguoi_than_nhan_vien_id", table_name="nguoi_than")
    op.drop_table("nguoi_than")
