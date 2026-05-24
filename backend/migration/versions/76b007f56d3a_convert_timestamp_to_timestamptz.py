"""convert_timestamp_to_timestamptz

Revision ID: 76b007f56d3a
Revises: bbe32dda7060
Create Date: 2026-05-14 21:19:52.090635

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "76b007f56d3a"
down_revision: Union[str, Sequence[str], None] = "bbe32dda7060"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

GROUP1 = [
    ("nhan_vien", "created_at"),
    ("nhan_vien", "updated_at"),
    ("nhan_vien", "deleted_at"),
    ("tai_lieu_nhan_vien", "created_at"),
    ("tai_lieu_nhan_vien", "updated_at"),
    ("tai_lieu_nhan_vien", "deleted_at"),
    ("check_in_out", "created_at"),
    ("check_in_out", "updated_at"),
    ("lich_cham_cong", "created_at"),
    ("lich_cham_cong", "updated_at"),
    ("don_xin_nghi", "created_at"),
    ("don_xin_nghi", "updated_at"),
    ("don_xin_nghi", "ngay_duyet"),
    ("phong_ban", "created_at"),
    ("phong_ban", "updated_at"),
    ("phong_ban", "deleted_at"),
    ("chuc_vu", "created_at"),
    ("chuc_vu", "updated_at"),
    ("chuc_vu", "deleted_at"),
    ("bang_cap_chung_chi", "created_at"),
    ("bang_cap_chung_chi", "updated_at"),
    ("nhan_vien_cong_tac", "created_at"),
    ("nhan_vien_cong_tac", "updated_at"),
    ("nhan_vien_cong_tac", "ngay_bat_dau"),
    ("nhan_vien_cong_tac", "ngay_ket_thuc"),
    ("tai_khoan", "created_at"),
    ("tai_khoan", "updated_at"),
    ("cham_cong_thang", "created_at"),
    ("cham_cong_thang", "updated_at"),
    ("cau_hinh_nghi_phep", "created_at"),
    ("cau_hinh_nghi_phep", "updated_at"),
    ("qr_config", "created_at"),
    ("qr_config", "updated_at"),
    ("qr_config", "thoi_gian_hieu_luc"),
    ("nguoi_than", "created_at"),
    ("nguoi_than", "updated_at"),
    ("luong", "created_at"),
    ("luong", "updated_at"),
    ("so_ngay_phep", "created_at"),
    ("so_ngay_phep", "updated_at"),
    ("khen_thuong_ky_luat", "created_at"),
    ("khen_thuong_ky_luat", "updated_at"),
    ("audit_log", "thoi_gian"),
    ("bao_cao", "created_at"),
    ("bao_cao", "updated_at"),
    ("cau_hinh_he_thong_luong", "created_at"),
    ("cau_hinh_he_thong_luong", "updated_at"),
    ("he_so_luong_danh_muc", "created_at"),
    ("he_so_luong_danh_muc", "updated_at"),
    ("phu_cap_theo_cap_hoc", "created_at"),
    ("phu_cap_theo_cap_hoc", "updated_at"),
    ("tam_dinh_chi_cong_tac", "created_at"),
    ("tam_dinh_chi_cong_tac", "updated_at"),
    ("ky_luat_vien_chuc", "created_at"),
    ("ky_luat_vien_chuc", "updated_at"),
    ("cau_hinh_thuong_tet", "created_at"),
    ("cau_hinh_thuong_tet", "updated_at"),
    ("luong_thang_13", "created_at"),
    ("luong_thang_13", "updated_at"),
    ("ky_luong", "created_at"),
    ("ky_luong", "updated_at"),
    ("ky_luong", "ngay_chay"),
    ("ky_luong", "ngay_duyet"),
    ("chi_tiet_phu_cap", "created_at"),
    ("chi_tiet_khau_tru", "created_at"),
    ("nghi_phep", "created_at"),
    ("nghi_phep", "updated_at"),
    ("nghi_phep", "ngay_duyet"),
    ("lich_su_chuc_vu", "created_at"),
    ("lich_su_chuc_vu", "updated_at"),
    ("tra_luong", "created_at"),
    ("tra_luong", "updated_at"),
    ("tra_luong", "ngay_chay"),
    ("cham_cong", "created_at"),
    ("cham_cong", "updated_at"),
    ("hop_dong", "created_at"),
    ("hop_dong", "updated_at"),
]

GROUP2 = [
    ("check_in_out", "check_in_time"),
    ("check_in_out", "check_out_time"),
]


def upgrade() -> None:
    for table, column in GROUP2:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMPTZ "
            f"USING ({column} - INTERVAL '7 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh'"
        )

    for table, column in GROUP1:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMPTZ "
            f"USING {column} AT TIME ZONE 'UTC'"
        )


def downgrade() -> None:
    for table, column in GROUP2:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMP "
            f"USING ({column} AT TIME ZONE 'Asia/Ho_Chi_Minh') + INTERVAL '7 hours'"
        )

    for table, column in GROUP1:
        op.execute(
            f"ALTER TABLE {table} ALTER COLUMN {column} TYPE TIMESTAMP "
            f"USING {column} AT TIME ZONE 'UTC'"
        )

