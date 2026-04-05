from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


def create_session_factory(uri: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(uri, pool_size=20, max_overflow=0, pool_pre_ping=False)
    return async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
