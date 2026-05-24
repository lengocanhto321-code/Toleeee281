"""seed_cau_hinh_nghi_phep

Revision ID: seed_cau_hinh_nghi_phep_v1
Revises: add_cau_hinh_nghi_phep_v1
Create Date: 2026-04-21 00:00:00.000000

"""

from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa


revision: str = "seed_cau_hinh_nghi_phep_v1"
down_revision: Union[str, Sequence[str], None] = "add_cau_hinh_nghi_phep_v1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed default cau hinh nghi phep."""
    now = datetime.utcnow()
    seed_data = [
        ("phep_nam", "Nghỉ phép năm", 12.0, 5.0, False, False),
        ("viec_rieng", "Nghỉ việc riêng", 3.0, 3.0, False, False),
        ("nghi_om", "Nghỉ ốm", 0.0, 30.0, True, True),
        ("ket_hon", "Nghỉ kết hôn", 3.0, 3.0, True, True),
        ("mai_tang", "Nghỉ ma táng", 3.0, 3.0, True, True),
        ("thai_san", "Nghỉ thai sản", 180.0, 180.0, True, True),
    ]

    import uuid

    for loai_nghi, ten_loai, so_ngay, max_lan, can_giay, bat_lydo in seed_data:
        op.execute(
            sa.text("""
                INSERT INTO cau_hinh_nghi_phep 
                (id, loai_nghi, ten_loai, so_ngay_moi_nam, so_ngay_toi_da_mot_lan, 
                 can_giay_to, bat_buoc_ghi_ly_do, trang_thai, created_at, updated_at)
                VALUES (:id, :loai, :ten, :so_ngay, :max, :can_giay, :bat_lydo, true, :now, :now)
            """).bindparams(
                id=str(uuid.uuid4())[:32],
                loai=loai_nghi,
                ten=ten_loai,
                so_ngay=so_ngay,
                max=max_lan,
                can_giay=can_giay,
                bat_lydo=bat_lydo,
                now=now,
            )
        )


def downgrade() -> None:
    """Remove seed data."""
    op.execute(sa.text("DELETE FROM cau_hinh_nghi_phep"))
