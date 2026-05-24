import logging
from dataclasses import dataclass, field
from typing import List, Dict

from libs.result import Result, Error, Return
from sqlalchemy import func, select

from src.domain.models.nhan_vien import NhanVien
from src.domain.models.phong_ban import PhongBan
from src.domain.models.chuc_vu import ChucVu
from src.domain.models.don_xin_nghi import DonXinNghi

logger = logging.getLogger(__name__)


@dataclass
class PhongBanSummaryItem:
    ten_phong_ban: str
    so_nhan_vien: int


@dataclass
class HoatDongItem:
    id: str
    hanh_dong: str
    bang_du_lieu: str
    ban_ghi_id: str
    ghi_chu: str
    thoi_gian: str
    ten_dang_nhap: str


@dataclass
class AdminDashboardResult:
    tong_nhan_vien: int
    nhan_vien_dang_lam: int
    nhan_vien_nghi_viec: int
    nhan_vien_nghi_huu: int
    so_phong_ban: int
    so_chuc_vu: int
    giao_vien: int
    can_bo: int
    nhan_vien_loai: int
    don_nghi_phep_cho_duyet: int
    nhan_vien_moi_thang_nay: int
    phong_ban_summary: List[Dict] = field(default_factory=list)
    hoat_dong_gan_day: List[Dict] = field(default_factory=list)


class GetAdminDashboardUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self) -> Result[AdminDashboardResult, Error]:
        logger.info("Getting admin dashboard stats")

        async with self.unit_of_work as uow:
            session = uow.session

            tong_nhan_vien = await session.scalar(
                select(func.count(NhanVien.id)).where(NhanVien.deleted_at.is_(None))
            )

            nhan_vien_dang_lam = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.trang_thai == "dang_lam",
                    NhanVien.deleted_at.is_(None),
                )
            )

            nhan_vien_nghi_viec = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.trang_thai == "nghi_viec",
                    NhanVien.deleted_at.is_(None),
                )
            )

            nhan_vien_nghi_huu = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.trang_thai == "nghi_huu",
                    NhanVien.deleted_at.is_(None),
                )
            )

            giao_vien = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.loai_nhan_vien == "giao_vien",
                    NhanVien.deleted_at.is_(None),
                )
            )

            can_bo = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.loai_nhan_vien == "can_bo",
                    NhanVien.deleted_at.is_(None),
                )
            )

            nhan_vien_loai = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.loai_nhan_vien == "nhan_vien",
                    NhanVien.deleted_at.is_(None),
                )
            )

            so_phong_ban = await session.scalar(
                select(func.count(PhongBan.id)).where(
                    PhongBan.trang_thai == True,
                    PhongBan.deleted_at.is_(None),
                )
            )

            so_chuc_vu = await session.scalar(
                select(func.count(ChucVu.id)).where(
                    ChucVu.trang_thai == True,
                    ChucVu.deleted_at.is_(None),
                )
            )

            don_nghi_phep_cho_duyet = await session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    DonXinNghi.trang_thai == "cho_duyet"
                )
            )

            from libs.datetime import get_utc_now

            now = get_utc_now()
            first_of_month = now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )

            nhan_vien_moi_thang_nay = await session.scalar(
                select(func.count(NhanVien.id)).where(
                    NhanVien.created_at >= first_of_month,
                    NhanVien.deleted_at.is_(None),
                )
            )

            dept_stmt = (
                select(
                    PhongBan.ten_phong_ban,
                    func.count(NhanVien.id).label("so_nhan_vien"),
                )
                .outerjoin(NhanVien, NhanVien.phong_ban_id == PhongBan.id)
                .where(
                    PhongBan.deleted_at.is_(None),
                    PhongBan.trang_thai == True,
                )
                .group_by(PhongBan.id)
                .order_by(func.count(NhanVien.id).desc())
                .limit(5)
            )
            dept_result = await session.execute(dept_stmt)
            dept_rows = dept_result.all()
            phong_ban_summary = [
                {"ten_phong_ban": row[0], "so_nhan_vien": row[1]} for row in dept_rows
            ]

            hoat_dong_gan_day = await uow.audit_log_repository.get_recent(limit=5)

            return Return.ok(
                AdminDashboardResult(
                    tong_nhan_vien=tong_nhan_vien or 0,
                    nhan_vien_dang_lam=nhan_vien_dang_lam or 0,
                    nhan_vien_nghi_viec=nhan_vien_nghi_viec or 0,
                    nhan_vien_nghi_huu=nhan_vien_nghi_huu or 0,
                    so_phong_ban=so_phong_ban or 0,
                    so_chuc_vu=so_chuc_vu or 0,
                    giao_vien=giao_vien or 0,
                    can_bo=can_bo or 0,
                    nhan_vien_loai=nhan_vien_loai or 0,
                    don_nghi_phep_cho_duyet=don_nghi_phep_cho_duyet or 0,
                    nhan_vien_moi_thang_nay=nhan_vien_moi_thang_nay or 0,
                    phong_ban_summary=phong_ban_summary,
                    hoat_dong_gan_day=hoat_dong_gan_day,
                )
            )
