from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.models.audit_log import AuditLog


class AuditLogRepository:
    """Repository for AuditLog model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, audit_log: AuditLog) -> AuditLog:
        """Create a new AuditLog."""
        self._session.add(audit_log)
        await self._session.flush()
        return audit_log
