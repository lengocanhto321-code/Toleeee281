from config import config
from src.service.storage.postgres import create_session_factory
from src.service.unit_of_work import UnitOfWork

# Session factory for database interactions
session_factory = create_session_factory(config.DB_URI)


def get_unit_of_work() -> UnitOfWork:
    return UnitOfWork(session_factory)
