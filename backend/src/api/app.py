import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import ApplicationConfig
from src.api.routes import router
from src.api.error import ClientError, ServerError

logger = logging.getLogger(__name__)


async def handle_unexpected_error(request: Request, exc: Exception):
    import traceback

    logger.exception(
        f"Unexpected error on {request.method} {request.url}: {exc}\n{traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": 500, "message": str(exc)}},
    )


async def handle_client_error(request, exc: ClientError) -> JSONResponse:
    logger.warning(f"Client error: {exc.to_dict()}")
    return JSONResponse(
        status_code=exc.get_status_code(),
        content={"error": exc.to_dict()},
    )


async def handle_server_error(request, exc: ServerError) -> JSONResponse:
    import traceback

    logger.error(
        f"Server error on {request.method} {request.url}: {exc.to_dict()}\n{traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=exc.get_status_code(),
        content={"error": exc.to_dict()},
    )


def create_app(config_app: ApplicationConfig) -> FastAPI:
    config = config_app

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        from src.service.scheduler_service import scheduler_service

        await scheduler_service.start()
        logger.info("Application startup complete")
        yield
        await scheduler_service.stop()
        logger.info("Application shutdown complete")

    app = FastAPI(
        title="HR Management API",
        version="0.1.0",
        description="API for HR management system",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    @app.get("/")
    async def root() -> RedirectResponse:
        return RedirectResponse(url="/docs")

    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(ClientError, handle_client_error)
    app.add_exception_handler(ServerError, handle_server_error)
    app.add_exception_handler(Exception, handle_unexpected_error)

    app.include_router(router, prefix="/api/v1")

    return app


__all__ = ["create_app"]
