from typing import AsyncGenerator
from config import config
from src.service.auth_service import AuthService
from src.service.storage.postgres import create_session_factory
from src.service.unit_of_work import UnitOfWork
from sqlalchemy.ext.asyncio import AsyncSession

session_factory = create_session_factory(config.DB_URI)

auth_service = AuthService(
    jwt_secret=config.JWT_SECRET,
    jwt_algorithm=config.JWT_ALGORITHM,
    jwt_expiration_minutes=config.JWT_EXP_MIN,
    refresh_token_expiration_seconds=config.JWT_EXP_MIN * 60,
)


def get_unit_of_work() -> UnitOfWork:
    return UnitOfWork(session_factory)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_factory() as session:
        yield session


def get_auth_service() -> AuthService:
    return auth_service
