from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error
from src.domain.models.chuc_vu import ChucVu


class ChucVuRepository:
    """Repository for ChucVu model with soft-delete support."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, chuc_vu: ChucVu) -> ChucVu:
        """Create a new ChucVu."""
        self._session.add(chuc_vu)
        await self._session.flush()
        await self._session.refresh(chuc_vu)
        return chuc_vu

    async def find_by_id(self, id: str, include_deleted: bool = False) -> Optional[ChucVu]:
        """Find ChucVu by ID. By default excludes soft-deleted records."""
        query = select(ChucVu).where(ChucVu.id == id)
        if not include_deleted:
            query = query.where(ChucVu.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def find_by_ma(self, ma_chuc_vu: str, include_deleted: bool = False) -> Optional[ChucVu]:
        """Find ChucVu by code (ma_chuc_vu). By default excludes soft-deleted records."""
        query = select(ChucVu).where(ChucVu.ma_chuc_vu == ma_chuc_vu)
        if not include_deleted:
            query = query.where(ChucVu.deleted_at.is_(None))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        trang_thai: Optional[bool] = None,
        cap_bac_min: Optional[int] = None,
        cap_bac_max: Optional[int] = None,
        sort_by: str = "cap_bac",
        sort_desc: bool = False  # Default to ascending for cap_bac
    ) -> Result[Tuple[int, List[dict]], Error]:
        """
        Get paginated list of ChucVu sorted by cap_bac.
        Returns Result with (total_count, items).
        """
        # Base query with soft-delete filter
        base_stmt = select(ChucVu).where(ChucVu.deleted_at.is_(None))

        # Apply filters
        if search:
            search_pattern = f"%{search}%"
            filter_condition = or_(
                ChucVu.ma_chuc_vu.ilike(search_pattern),
                ChucVu.ten_chuc_vu.ilike(search_pattern)
            )
            base_stmt = base_stmt.where(filter_condition)

        if trang_thai is not None:
            base_stmt = base_stmt.where(ChucVu.trang_thai == trang_thai)

        if cap_bac_min is not None:
            base_stmt = base_stmt.where(ChucVu.cap_bac >= cap_bac_min)

        if cap_bac_max is not None:
            base_stmt = base_stmt.where(ChucVu.cap_bac <= cap_bac_max)

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # Sorting
        allowed_sorts = {
            "created_at": ChucVu.created_at,
            "updated_at": ChucVu.updated_at,
            "ten_chuc_vu": ChucVu.ten_chuc_vu,
            "ma_chuc_vu": ChucVu.ma_chuc_vu,
            "cap_bac": ChucVu.cap_bac,
            "trang_thai": ChucVu.trang_thai,
        }
        sort_col = allowed_sorts.get(sort_by, ChucVu.cap_bac)

        if sort_desc:
            base_stmt = base_stmt.order_by(sort_col.desc())
        else:
            base_stmt = base_stmt.order_by(sort_col.asc())

        # Pagination
        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        try:
            result = await self._session.execute(base_stmt)
            chuc_vus = result.scalars().all()

            # Convert to list of dicts
            items = []
            for cv in chuc_vus:
                d = {c.key: getattr(cv, c.key) for c in cv.__table__.columns}
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

    async def count_employees(self, id: str, active_only: bool = False) -> int:
        """Count employees with this ChucVu."""
        from src.domain.models.nhan_vien import NhanVien

        stmt = select(func.count(NhanVien.id)).where(
            NhanVien.chuc_vu_id == id,
            NhanVien.deleted_at.is_(None)
        )
        if active_only:
            stmt = stmt.where(NhanVien.trang_thai == "dang_lam")

        result = await self._session.execute(stmt)
        return result.scalar() or 0

    async def update(self, chuc_vu: ChucVu) -> ChucVu:
        """Update ChucVu."""
        await self._session.flush()
        await self._session.refresh(chuc_vu)
        return chuc_vu

    async def delete(self, chuc_vu: ChucVu) -> ChucVu:
        """Soft-delete ChucVu by setting deleted_at."""
        from datetime import datetime
        chuc_vu.deleted_at = datetime.utcnow()
        await self._session.flush()
        await self._session.refresh(chuc_vu)
        return chuc_vu
