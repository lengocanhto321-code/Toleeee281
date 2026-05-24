import secrets
import string
from typing import Optional, List, Tuple
from dataclasses import dataclass, field
from decimal import Decimal
from sqlalchemy import select, func, or_, and_, cast, Integer, Float
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.luong import Luong

LOAI_PREFIX = {
    "giao_vien": "NV",
    "can_bo": "NV",
    "nhan_vien": "NV",
}


@dataclass
class NhanVienFilterParams:
    search: Optional[str] = None
    trang_thai: Optional[str] = None
    loai_nhan_vien: Optional[str] = None
    gioi_tinh: Optional[str] = None
    cap_hoc: Optional[str] = None
    phong_ban_id: Optional[str] = None
    loai_hop_dong: Optional[str] = None
    hang_chuc_danh: Optional[str] = None
    ngay_vao_lam_tu: Optional[str] = None
    ngay_vao_lam_den: Optional[str] = None
    ngay_sinh_tu: Optional[str] = None
    ngay_sinh_den: Optional[str] = None
    he_so_luong_tu: Optional[float] = None
    he_so_luong_den: Optional[float] = None
    la_dang_vien: Optional[bool] = None
    la_doan_vien: Optional[bool] = None
    co_bhxh: Optional[bool] = None
    co_ngan_hang: Optional[bool] = None


class NhanVienRepository:
    """Repository for NhanVien model with soft-delete support."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def generate_ma_nhan_vien(self, loai_nhan_vien: str) -> str:
        chars = string.ascii_uppercase + string.digits
        suffix = "".join(secrets.choice(chars) for _ in range(6))
        return f"NV-{suffix}"

    async def create(self, nhan_vien: NhanVien) -> NhanVien:
        self._session.add(nhan_vien)
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien

    async def find_by_id(
        self, id: str, include_deleted: bool = False
    ) -> Optional[NhanVien]:
        query = select(NhanVien).where(NhanVien.id == id)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_ma(
        self, ma_nhan_vien: str, include_deleted: bool = False
    ) -> Optional[NhanVien]:
        query = select(NhanVien).where(NhanVien.ma_nhan_vien == ma_nhan_vien)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_email(
        self, email: str, include_deleted: bool = False
    ) -> Optional[NhanVien]:
        query = select(NhanVien).where(NhanVien.email == email)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_cccd(
        self, so_cccd: str, include_deleted: bool = False
    ) -> Optional[NhanVien]:
        query = select(NhanVien).where(NhanVien.so_cccd == so_cccd)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    def _build_filter_query(self, base_stmt, filters: NhanVienFilterParams):
        if filters.search:
            pattern = f"%{filters.search}%"
            base_stmt = base_stmt.where(
                or_(
                    NhanVien.ma_nhan_vien.ilike(pattern),
                    NhanVien.ho_ten.ilike(pattern),
                    NhanVien.email.ilike(pattern),
                    NhanVien.so_dien_thoai.ilike(pattern),
                    NhanVien.so_cccd.ilike(pattern),
                    NhanVien.mon_day.ilike(pattern),
                )
            )

        if filters.trang_thai:
            base_stmt = base_stmt.where(NhanVien.trang_thai == filters.trang_thai)
        if filters.loai_nhan_vien:
            base_stmt = base_stmt.where(
                NhanVien.loai_nhan_vien == filters.loai_nhan_vien
            )
        if filters.gioi_tinh:
            base_stmt = base_stmt.where(NhanVien.gioi_tinh == filters.gioi_tinh)
        if filters.cap_hoc:
            base_stmt = base_stmt.where(NhanVien.cap_hoc == filters.cap_hoc)
        if filters.phong_ban_id:
            base_stmt = base_stmt.where(NhanVien.phong_ban_id == filters.phong_ban_id)
        if filters.loai_hop_dong:
            base_stmt = base_stmt.where(NhanVien.loai_hop_dong == filters.loai_hop_dong)
        if filters.hang_chuc_danh:
            base_stmt = base_stmt.where(
                NhanVien.hang_chuc_danh == filters.hang_chuc_danh
            )

        if filters.ngay_vao_lam_tu:
            base_stmt = base_stmt.where(
                NhanVien.ngay_vao_lam >= filters.ngay_vao_lam_tu
            )
        if filters.ngay_vao_lam_den:
            base_stmt = base_stmt.where(
                NhanVien.ngay_vao_lam <= filters.ngay_vao_lam_den
            )
        if filters.ngay_sinh_tu:
            base_stmt = base_stmt.where(NhanVien.ngay_sinh >= filters.ngay_sinh_tu)
        if filters.ngay_sinh_den:
            base_stmt = base_stmt.where(NhanVien.ngay_sinh <= filters.ngay_sinh_den)

        if filters.he_so_luong_tu is not None:
            base_stmt = base_stmt.where(
                NhanVien.he_so_luong.cast(Float) >= filters.he_so_luong_tu
            )
        if filters.he_so_luong_den is not None:
            base_stmt = base_stmt.where(
                NhanVien.he_so_luong.cast(Float) <= filters.he_so_luong_den
            )

        if filters.la_dang_vien is True:
            base_stmt = base_stmt.where(NhanVien.la_dang_vien == True)
        if filters.la_doan_vien is True:
            base_stmt = base_stmt.where(NhanVien.la_doan_vien == True)
        if filters.co_bhxh is True:
            base_stmt = base_stmt.where(
                NhanVien.so_bao_hiem.isnot(None), NhanVien.so_bao_hiem != ""
            )
        if filters.co_ngan_hang is True:
            base_stmt = base_stmt.where(
                NhanVien.so_tai_khoan_ngan_hang.isnot(None),
                NhanVien.so_tai_khoan_ngan_hang != "",
            )

        return base_stmt

    def _serialize_nhan_vien(self, nv: NhanVien) -> dict:
        d = {c.key: getattr(nv, c.key) for c in nv.__table__.columns}

        pb = getattr(nv, "phong_ban", None)
        if pb:
            d["phong_ban"] = {"id": pb.id, "ten_phong_ban": pb.ten_phong_ban}
        else:
            d["phong_ban"] = None

        cv = getattr(nv, "chuc_vu", None)
        if cv:
            d["chuc_vu"] = {
                "id": cv.id,
                "ten_chuc_vu": cv.ten_chuc_vu,
                "cap_bac": cv.cap_bac,
            }
        else:
            d["chuc_vu"] = None

        return d

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        filters: NhanVienFilterParams = None,
        sort_by: str = "created_at",
        sort_desc: bool = True,
    ) -> Result[Tuple[int, List[dict]], Error]:
        if filters is None:
            filters = NhanVienFilterParams()

        base_stmt = select(NhanVien).where(NhanVien.deleted_at.is_(None))
        base_stmt = self._build_filter_query(base_stmt, filters)

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        allowed_sorts = {
            "created_at": NhanVien.created_at,
            "updated_at": NhanVien.updated_at,
            "ho_ten": NhanVien.ho_ten,
            "ma_nhan_vien": NhanVien.ma_nhan_vien,
            "trang_thai": NhanVien.trang_thai,
            "loai_nhan_vien": NhanVien.loai_nhan_vien,
            "ngay_vao_lam": NhanVien.ngay_vao_lam,
        }
        sort_col = allowed_sorts.get(sort_by, NhanVien.created_at)
        base_stmt = base_stmt.order_by(sort_col.desc() if sort_desc else sort_col.asc())

        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        try:
            result = await self._session.execute(base_stmt)
            nhan_viens = result.scalars().all()

            nv_ids = [nv.id for nv in nhan_viens]
            luong_result = await self._session.execute(
                select(Luong).where(Luong.nhan_vien_id.in_(nv_ids))
            )
            luong_map = {}
            for l in luong_result.scalars().all():
                existing = luong_map.get(l.nhan_vien_id)
                if not existing or (
                    l.hieu_luc_tu
                    and (
                        not existing.hieu_luc_tu or l.hieu_luc_tu > existing.hieu_luc_tu
                    )
                ):
                    luong_map[l.nhan_vien_id] = l

            items = []
            for nv in nhan_viens:
                d = self._serialize_nhan_vien(nv)
                l = luong_map.get(nv.id)
                if l:
                    d["luong"] = {
                        "id": l.id,
                        "luong_co_ban": float(l.luong_co_ban or 0),
                        "he_so_luong": float(l.he_so_luong or 0),
                        "phu_cap_chuc_vu": float(l.phu_cap_chuc_vu or 0),
                        "phu_cap_uu_dai": float(l.phu_cap_uu_dai or 0),
                        "phu_cap_khac": float(l.phu_cap_khac or 0),
                    }
                else:
                    d["luong"] = None
                items.append(d)

            return Return.ok((total, items))
        except Exception as e:
            return Return.err(
                Error(
                    code="database_error",
                    message=f"Lỗi truy vấn: {str(e)}",
                    reason="DatabaseError",
                )
            )

    async def find_all_by_status(self, trang_thai: str) -> List[NhanVien]:
        query = select(NhanVien).where(
            NhanVien.trang_thai == trang_thai,
            NhanVien.deleted_at.is_(None),
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def find_dang_lam(
        self, danh_sach_ids: Optional[List[str]] = None
    ) -> List[NhanVien]:
        query = select(NhanVien).where(
            NhanVien.trang_thai == "dang_lam",
            NhanVien.deleted_at.is_(None),
        )
        if danh_sach_ids:
            query = query.where(NhanVien.id.in_(danh_sach_ids))
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def update(self, nhan_vien: NhanVien) -> NhanVien:
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien

    async def delete(self, nhan_vien: NhanVien) -> NhanVien:
        from libs.datetime import get_utc_now

        nhan_vien.deleted_at = get_utc_now()
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien
