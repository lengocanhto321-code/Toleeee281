from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_, cast, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.cong_tac import CongTac

LOAI_PREFIX = {
    "giao_vien": "GV",
    "can_bo": "CB",
    "nhan_vien": "NV",
}


class NhanVienRepository:
    """Repository for NhanVien model with soft-delete support."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def generate_ma_nhan_vien(self, loai_nhan_vien: str) -> str:
        """Generate next ma_nhan_vien based on loai_nhan_vien prefix."""
        prefix = LOAI_PREFIX.get(loai_nhan_vien, "NV")
        # Find the max numeric suffix for this prefix
        stmt = (
            select(func.max(
                cast(func.substr(NhanVien.ma_nhan_vien, len(prefix) + 1), Integer)
            ))
            .where(NhanVien.ma_nhan_vien.like(f"{prefix}%"))
        )
        result = await self._session.execute(stmt)
        max_num = result.scalar() or 0
        return f"{prefix}{max_num + 1:03d}"

    async def create(self, nhan_vien: NhanVien) -> NhanVien:
        """Create a new NhanVien."""
        self._session.add(nhan_vien)
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien

    async def find_by_id(self, id: str, include_deleted: bool = False) -> Optional[NhanVien]:
        """Find NhanVien by ID. By default excludes soft-deleted records."""
        query = select(NhanVien).where(NhanVien.id == id)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_ma(self, ma_nhan_vien: str, include_deleted: bool = False) -> Optional[NhanVien]:
        """Find NhanVien by code (ma_nhan_vien). By default excludes soft-deleted records."""
        query = select(NhanVien).where(NhanVien.ma_nhan_vien == ma_nhan_vien)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_email(self, email: str, include_deleted: bool = False) -> Optional[NhanVien]:
        """Find NhanVien by email. By default excludes soft-deleted records."""
        query = select(NhanVien).where(NhanVien.email == email)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_cccd(self, so_cccd: str, include_deleted: bool = False) -> Optional[NhanVien]:
        """Find NhanVien by CCCD. By default excludes soft-deleted records."""
        query = select(NhanVien).where(NhanVien.so_cccd == so_cccd)
        if not include_deleted:
            query = query.where(NhanVien.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        trang_thai: Optional[str] = None,
        loai_nhan_vien: Optional[str] = None,
        phong_ban_id: Optional[str] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Result[Tuple[int, List[dict]], Error]:
        """
        Get paginated list of NhanVien.
        Returns Result with (total_count, items).
        """
        # Base query with soft-delete filter
        base_stmt = select(NhanVien).where(NhanVien.deleted_at.is_(None))

        # Apply filters
        if search:
            search_pattern = f"%{search}%"
            filter_condition = or_(
                NhanVien.ma_nhan_vien.ilike(search_pattern),
                NhanVien.ho_ten.ilike(search_pattern),
                NhanVien.email.ilike(search_pattern),
                NhanVien.so_dien_thoai.ilike(search_pattern)
            )
            base_stmt = base_stmt.where(filter_condition)

        if trang_thai:
            base_stmt = base_stmt.where(NhanVien.trang_thai == trang_thai)

        if loai_nhan_vien:
            base_stmt = base_stmt.where(NhanVien.loai_nhan_vien == loai_nhan_vien)

        if phong_ban_id:
            base_stmt = base_stmt.join(CongTac, CongTac.nhan_vien_id == NhanVien.id).where(
                CongTac.phong_ban_id == phong_ban_id
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Sorting
        allowed_sorts = {
            "created_at": NhanVien.created_at,
            "updated_at": NhanVien.updated_at,
            "ho_ten": NhanVien.ho_ten,
            "ma_nhan_vien": NhanVien.ma_nhan_vien,
            "trang_thai": NhanVien.trang_thai,
            "loai_nhan_vien": NhanVien.loai_nhan_vien,
        }
        sort_col = allowed_sorts.get(sort_by, NhanVien.created_at)

        if sort_desc:
            base_stmt = base_stmt.order_by(sort_col.desc())
        else:
            base_stmt = base_stmt.order_by(sort_col.asc())

        # Pagination
        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        try:
            result = await self._session.execute(base_stmt)
            nhan_viens = result.scalars().all()

            # Convert to list of dicts
            items = []
            for nv in nhan_viens:
                d = {c.key: getattr(nv, c.key) for c in nv.__table__.columns}
                
                # Attaching phong_ban and chuc_vu
                primary_ct = next(
                    (ct for ct in getattr(nv, "cong_tac", []) if ct.is_primary and ct.trang_thai == "dang_cong_tac"),
                    getattr(nv, "cong_tac", [])[0] if getattr(nv, "cong_tac", []) else None
                )
                
                d["phong_ban"] = primary_ct.phong_ban.ten_phong_ban if primary_ct and primary_ct.phong_ban else None
                d["chuc_vu"] = primary_ct.chuc_vu.ten_chuc_vu if primary_ct and primary_ct.chuc_vu else None

                items.append(d)

            return Return.ok((total, items))
        except Exception as e:
            return Return.err(
                Error(
                    code="database_error",
                    message=f"Lỗi truy vấn: {str(e)}",
                    reason="DatabaseError"
                )
            )

    async def update(self, nhan_vien: NhanVien) -> NhanVien:
        """Update NhanVien."""
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien

    async def delete(self, nhan_vien: NhanVien) -> NhanVien:
        """Soft-delete NhanVien by setting deleted_at."""
        from datetime import datetime
        nhan_vien.deleted_at = datetime.utcnow()
        await self._session.flush()
        await self._session.refresh(nhan_vien)
        return nhan_vien
