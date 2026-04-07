from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from src.repository.user_repository import UserRepository
from src.repository.phong_ban_repository import PhongBanRepository
from src.repository.audit_log_repository import AuditLogRepository

class UnitOfWork:
    """
    Unit of Work pattern for managing database transactions and repositories.

    This class ensures that all repository operations are executed within
    a single transaction, providing consistency and atomicity.
    """

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self._session_factory = session_factory
        self._session: AsyncSession | None = None
        self.user_repository: UserRepository
        self.phong_ban_repository: PhongBanRepository
        self.audit_log_repository: AuditLogRepository

    async def __aenter__(self):
        self._session = self._session_factory()
        self.user_repository = UserRepository(session=self._session)
        self.phong_ban_repository = PhongBanRepository(session=self._session)
        self.audit_log_repository = AuditLogRepository(session=self._session)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if self._session:
                if exc_type:
                    await self.rollback()
                else:
                    await self.commit()
        finally:
            if self._session:
                await self._session.close()
            self._session = None

    async def commit(self):
        """Commit the current transaction."""
        if self._session:
            await self._session.commit()

    async def rollback(self):
        """Rollback the current transaction."""
        if self._session:
            await self._session.rollback()

    @property
    def session(self) -> AsyncSession:
        """Get the current database session."""
        if self._session is None:
            raise RuntimeError("UnitOfWork is not active. Use 'async with' context manager.")
        return self._session