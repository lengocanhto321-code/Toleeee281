from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.audit_log import AuditLog
from src.domain.models.tai_khoan import TaiKhoan


class AuditLogRepository:
    """Repository for AuditLog model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, audit_log: AuditLog) -> AuditLog:
        """Create a new AuditLog."""
        self._session.add(audit_log)
        await self._session.flush()
        return audit_log

    async def get_recent(self, limit: int = 5) -> List[Dict]:
        stmt = (
            select(AuditLog, TaiKhoan.ten_dang_nhap)
            .outerjoin(TaiKhoan, TaiKhoan.id == AuditLog.tai_khoan_id)
            .order_by(AuditLog.thoi_gian.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        rows = result.all()
        items = []
        for log, ten_dang_nhap in rows:
            items.append(
                {
                    "id": log.id,
                    "hanh_dong": log.hanh_dong,
                    "bang_du_lieu": log.bang_du_lieu,
                    "ban_ghi_id": log.ban_ghi_id,
                    "ghi_chu": log.ghi_chu,
                    "thoi_gian": log.thoi_gian.isoformat() if log.thoi_gian else None,
                    "ten_dang_nhap": ten_dang_nhap,
                }
            )
        return items
