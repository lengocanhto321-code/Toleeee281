from config import config
from src.service.auth_service import AuthService
from src.service.storage.postgres import create_session_factory
from src.service.unit_of_work import UnitOfWork

# Session factory for database interactions
session_factory = create_session_factory(config.DB_URI)

# Auth service
auth_service = AuthService(
    jwt_secret=config.JWT_SECRET,
    jwt_algorithm=config.JWT_ALGORITHM,
    jwt_expiration_minutes=config.JWT_EXP_MIN,
    refresh_token_expiration_seconds=config.JWT_EXP_MIN * 60,
)


def get_unit_of_work() -> UnitOfWork:
    return UnitOfWork(session_factory)


def get_auth_service() -> AuthService:
    return auth_service
