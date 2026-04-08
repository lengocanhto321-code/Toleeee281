from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from libs.result import Result, Return, Error
from src.domain.models.phong_ban import PhongBan
from src.domain.models.nhan_vien import NhanVien


class PhongBanRepository:
    """Repository for PhongBan model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, phong_ban: PhongBan) -> PhongBan:
        """Create a new PhongBan."""
        self._session.add(phong_ban)
        await self._session.flush()
        await self._session.refresh(phong_ban)
        return phong_ban

    async def find_by_id(self, id: str) -> Optional[PhongBan]:
        """Find PhongBan by ID."""
        result = await self._session.execute(
            select(PhongBan).where(PhongBan.id == id)
        )
        return result.scalar_one_or_none()

    async def find_by_ma(self, ma_phong_ban: str) -> Optional[PhongBan]:
        """Find PhongBan by code (ma_phong_ban)."""
        result = await self._session.execute(
            select(PhongBan).where(PhongBan.ma_phong_ban == ma_phong_ban)
        )
        return result.scalar_one_or_none()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        loai: Optional[str] = None,
        trang_thai: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Result[Tuple[int, List[dict]], Error]:
        """
        Get paginated list of PhongBan with employee counts.
        Returns Result with (total_count, items).
        """

        # 1. Base query chứa join + aggregate (quan trọng)
        base_stmt = (
            select(
                PhongBan,
                func.count(NhanVien.id).label("so_luong_nhan_vien"),
                func.count(NhanVien.id)
                    .filter(NhanVien.trang_thai == "dang_lam")
                    .label("so_luong_dang_lam")
            )
            .outerjoin(NhanVien, NhanVien.phong_ban_id == PhongBan.id)
            .group_by(PhongBan.id)
        )

        # 2. Áp dụng tất cả filter vào base_stmt
        if search:
            search_pattern = f"%{search}%"
            filter_condition = or_(
                PhongBan.ma_phong_ban.ilike(search_pattern),
                PhongBan.ten_phong_ban.ilike(search_pattern)
            )
            base_stmt = base_stmt.where(filter_condition)

        if loai is not None:
            base_stmt = base_stmt.where(PhongBan.loai == loai)

        if trang_thai is not None:
            base_stmt = base_stmt.where(PhongBan.trang_thai == trang_thai)

        # 3. Tính total count từ subquery (đây là phần sửa quan trọng nhất)
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        # 4. Sorting
        allowed_sorts = {
            "created_at": PhongBan.created_at,
            "updated_at": PhongBan.updated_at,
            "ten_phong_ban": PhongBan.ten_phong_ban,
            "ma_phong_ban": PhongBan.ma_phong_ban,
            "loai": PhongBan.loai,
            "trang_thai": PhongBan.trang_thai,
            # Nếu muốn sort theo số nhân viên sau này, có thể thêm:
            # "so_luong_nhan_vien": "so_luong_nhan_vien"  # cần xử lý riêng
        }
        sort_col = allowed_sorts.get(sort_by, PhongBan.created_at)

        if sort_desc:
            base_stmt = base_stmt.order_by(sort_col.desc())
        else:
            base_stmt = base_stmt.order_by(sort_col.asc())

        # 5. Pagination
        base_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)

        # 6. Execute query
        try:
            result = await self._session.execute(base_stmt)
            rows = result.all()

            # 7. Xử lý kết quả thành list dict
            items = []
            for phong_ban, count_nv, count_dl in rows:
                d = phong_ban.__dict__.copy()
                if "_sa_instance_state" in d:
                    del d["_sa_instance_state"]
                d["so_luong_nhan_vien"] = count_nv
                d["so_luong_dang_lam"] = count_dl
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

    async def get_detail_with_stats(self, id: str) -> Result[Optional[dict], Error]:
        """Get detail of Phong Ban including employee stats."""
        stmt = (
            select(
                PhongBan,
                func.count(NhanVien.id).label("so_luong_nhan_vien"),
                func.count(NhanVien.id).filter(NhanVien.trang_thai == "dang_lam").label("so_luong_dang_lam")
            )
            .outerjoin(NhanVien, NhanVien.phong_ban_id == PhongBan.id)
            .where(PhongBan.id == id)
            .group_by(PhongBan.id)
        )
        
        try:
            result = await self._session.execute(stmt)
            row = result.first()
            
            if not row:
                return Return.ok(None)
                
            phong_ban, count_nv, count_dl = row
            d = phong_ban.__dict__.copy()
            if "_sa_instance_state" in d:
                del d["_sa_instance_state"]
            d["so_luong_nhan_vien"] = count_nv
            d["so_luong_dang_lam"] = count_dl
            
            return Return.ok(d)
        except Exception as e:
            return Return.err(
                Error(
                    code="database_error",
                    message=f"Lỗi truy vấn chi tiết: {str(e)}",
                    reason="DatabaseError"
                )
            )

    async def count_employees(self, id: str, active_only: bool = False) -> int:
        """Count employees in a department."""
        stmt = select(func.count(NhanVien.id)).where(NhanVien.phong_ban_id == id)
        if active_only:
            stmt = stmt.where(NhanVien.trang_thai == "dang_lam")
            
        result = await self._session.execute(stmt)
        return result.scalar() or 0

    async def update(self, phong_ban: PhongBan) -> PhongBan:
        """Update PhongBan."""
        await self._session.flush()
        await self._session.refresh(phong_ban)
        return phong_ban

    async def delete(self, phong_ban: PhongBan) -> None:
        """Delete PhongBan."""
        await self._session.delete(phong_ban)
        await self._session.flush()
