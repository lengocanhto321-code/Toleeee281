import logging
from dataclasses import dataclass, field
from typing import Optional, List

from sqlalchemy import select, func, extract

from libs.datetime import get_utc_now
from libs.result import Result, Error, Return
from src.api.schemas.nhan_vien import NhanVienDataResponse
from src.api.schemas.nhan_vien_detail import NhanVienDetailResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.phong_ban import PhongBan
from src.repository.nhan_vien_repository import NhanVienFilterParams

logger = logging.getLogger(__name__)


@dataclass
class GetListNhanVienQuery:
    page: int = 1
    page_size: int = 10
    filters: NhanVienFilterParams = field(default_factory=NhanVienFilterParams)
    sort_by: str = "created_at"
    sort_desc: bool = True


@dataclass
class GetListNhanVienResult:
    total: int
    items: list
    thong_ke: dict = field(default_factory=dict)
    phong_ban_list: list = field(default_factory=list)


@dataclass
class GetDetailNhanVienQuery:
    id: str


@dataclass
class GetDetailNhanVienResult:
    nhan_vien: NhanVienDataResponse
    hop_dongs: List[dict] = field(default_factory=list)
    cong_tacs: List[dict] = field(default_factory=list)
    lich_su_chuc_vu: List[dict] = field(default_factory=list)
    nguoi_thans: List[dict] = field(default_factory=list)
    bang_caps: List[dict] = field(default_factory=list)
    khen_thuongs: List[dict] = field(default_factory=list)
    ky_luats: List[dict] = field(default_factory=list)
    luong_hien_tai: Optional[dict] = None


class GetNhanVienUseCase:
    """Use case for getting NhanVien list and detail with all related data."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def get_list(
        self, query: GetListNhanVienQuery
    ) -> Result[GetListNhanVienResult, Error]:
        """Get paginated list of NhanVien."""
        logger.info(
            f"Getting NhanVien list: page={query.page}, page_size={query.page_size}"
        )

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository

            result = await nhan_vien_repo.get_paginated(
                page=query.page,
                page_size=query.page_size,
                filters=query.filters,
                sort_by=query.sort_by,
                sort_desc=query.sort_desc,
            )

            if result.is_err():
                return result

            total, items = result.value

            # Convert to response objects
            response_items = [NhanVienDataResponse(**item) for item in items]

            now = get_utc_now()
            current_month = now.month
            current_year = now.year

            base = select(NhanVien).where(NhanVien.deleted_at.is_(None))

            tong_dang_lam = await nhan_vien_repo._session.scalar(
                select(func.count()).select_from(
                    select(NhanVien.id)
                    .where(
                        NhanVien.deleted_at.is_(None),
                        NhanVien.trang_thai == "dang_lam",
                    )
                    .subquery()
                )
            )

            sinh_nhat_thang = await nhan_vien_repo._session.scalar(
                select(func.count()).select_from(
                    select(NhanVien.id)
                    .where(
                        NhanVien.deleted_at.is_(None),
                        NhanVien.trang_thai == "dang_lam",
                        extract("month", NhanVien.ngay_sinh) == current_month,
                    )
                    .subquery()
                )
            )

            ky_niem_thang = await nhan_vien_repo._session.scalar(
                select(func.count()).select_from(
                    select(NhanVien.id)
                    .where(
                        NhanVien.deleted_at.is_(None),
                        NhanVien.trang_thai == "dang_lam",
                        NhanVien.ngay_vao_lam.isnot(None),
                        extract("month", NhanVien.ngay_vao_lam) == current_month,
                        extract("year", NhanVien.ngay_vao_lam) != current_year,
                    )
                    .subquery()
                )
            )

            nv_moi_thang = await nhan_vien_repo._session.scalar(
                select(func.count()).select_from(
                    select(NhanVien.id)
                    .where(
                        NhanVien.deleted_at.is_(None),
                        NhanVien.trang_thai == "dang_lam",
                        extract("month", NhanVien.created_at) == current_month,
                        extract("year", NhanVien.created_at) == current_year,
                    )
                    .subquery()
                )
            )

            thong_ke = {
                "tong_dang_lam": tong_dang_lam or 0,
                "sinh_nhat_thang": sinh_nhat_thang or 0,
                "ky_niem_thang": ky_niem_thang or 0,
                "nv_moi_thang": nv_moi_thang or 0,
            }

            phong_ban_result = await nhan_vien_repo._session.execute(
                select(PhongBan)
                .where(PhongBan.deleted_at.is_(None))
                .order_by(PhongBan.ten_phong_ban)
            )
            phong_ban_list = [
                {"id": pb.id, "ten_phong_ban": pb.ten_phong_ban}
                for pb in phong_ban_result.scalars().all()
            ]

            logger.info(
                f"Found {total} NhanVien, returning {len(response_items)} items"
            )
            return Return.ok(
                GetListNhanVienResult(
                    total=total,
                    items=response_items,
                    thong_ke=thong_ke,
                    phong_ban_list=phong_ban_list,
                )
            )

    async def get_detail(
        self, query: GetDetailNhanVienQuery
    ) -> Result[GetDetailNhanVienResult, Error]:
        """Get detail of a NhanVien with all related data."""
        logger.info(f"Getting NhanVien detail with all related data: {query.id}")

        async with self.unit_of_work as uow:
            nhan_vien_repo = uow.nhan_vien_repository

            # Try find by ma_nhan_vien first, then fallback to id
            nhan_vien = await nhan_vien_repo.find_by_ma(query.id)
            if not nhan_vien:
                nhan_vien = await nhan_vien_repo.find_by_id(query.id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            # Basic info
            resp = serialize_model_to_dict(nhan_vien)

            pb = getattr(nhan_vien, "phong_ban", None)
            if pb:
                resp["phong_ban"] = {"id": pb.id, "ten_phong_ban": pb.ten_phong_ban}
            else:
                resp["phong_ban"] = None

            cv = getattr(nhan_vien, "chuc_vu", None)
            if cv:
                resp["chuc_vu"] = {
                    "id": cv.id,
                    "ten_chuc_vu": cv.ten_chuc_vu,
                    "cap_bac": cv.cap_bac,
                }
            else:
                resp["chuc_vu"] = None

            nhan_vien_data = NhanVienDataResponse(**resp)

            # Hop dong list
            hop_dong_repo = uow.hop_dong_repository
            hop_dongs = await hop_dong_repo.get_by_nhan_vien(nhan_vien.id)
            hop_dong_list = [serialize_model_to_dict(hd) for hd in hop_dongs]

            # Cong tac list
            cong_tac_repo = uow.cong_tac_repository
            cong_tacs = await cong_tac_repo.get_by_nhan_vien(nhan_vien.id)
            cong_tac_list = [serialize_model_to_dict(ct) for ct in cong_tacs]

            # Lich su chuc vu
            lich_su_repo = uow.lich_su_chuc_vu_repository
            lich_sus = await lich_su_repo.get_by_nhan_vien(nhan_vien.id)
            lich_su_list = [serialize_model_to_dict(ls) for ls in lich_sus]

            # Nguoi than
            nguoi_than_repo = uow.nguoi_than_repository
            nguoi_thans = await nguoi_than_repo.get_by_nhan_vien(nhan_vien.id)
            nguoi_than_list = [serialize_model_to_dict(nt) for nt in nguoi_thans]

            # Bang cap
            bang_cap_repo = uow.bang_cap_repository
            bang_caps = await bang_cap_repo.get_by_nhan_vien(nhan_vien.id)
            bang_cap_list = [serialize_model_to_dict(bc) for bc in bang_caps]

            # Khen thuong & Ky luat
            khen_ky_repo = uow.khen_thuong_ky_luat_repository
            khen_ky_list = await khen_ky_repo.get_by_nhan_vien(nhan_vien.id)
            khen_thuongs = []
            ky_luats = []
            for item in khen_ky_list:
                item_dict = serialize_model_to_dict(item)
                if item.loai == "khen_thuong":
                    khen_thuongs.append(item_dict)
                else:
                    ky_luats.append(item_dict)

            # Luong hien tai
            luong_repo = uow.luong_repository
            luong_hien_tai = await luong_repo.get_current_by_nhan_vien(nhan_vien.id)
            luong_data = (
                serialize_model_to_dict(luong_hien_tai) if luong_hien_tai else None
            )

            logger.info(
                f"NhanVien {nhan_vien.ma_nhan_vien} detail loaded with all related data"
            )
            return Return.ok(
                GetDetailNhanVienResult(
                    nhan_vien=nhan_vien_data,
                    hop_dongs=hop_dong_list,
                    cong_tacs=cong_tac_list,
                    lich_su_chuc_vu=lich_su_list,
                    nguoi_thans=nguoi_than_list,
                    bang_caps=bang_cap_list,
                    khen_thuongs=khen_thuongs,
                    ky_luats=ky_luats,
                    luong_hien_tai=luong_data,
                )
            )
