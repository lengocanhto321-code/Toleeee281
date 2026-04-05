import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import ApplicationConfig
from .error import ClientError, ServerError

logger = logging.getLogger(__name__)


async def handle_unexpected_error(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"},
    )


async def handle_client_error(request, exc: ClientError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.get_status_code(),
        content={"error": exc.to_dict()},
    )


async def handle_server_error(request, exc: ServerError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.get_status_code(),
        content={"error": exc.to_dict()},
    )


def create_app(config_app: ApplicationConfig) -> FastAPI:
    config = config_app

    app = FastAPI(
        title="Code Intelligence Backend",
        version="0.1.0",
    )

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

    return app


__all__ = ["create_app"]
