import logging

import uvicorn

from config import config
from logger import setup_app_level_logger
from src.api.app import create_app

setup_app_level_logger(
    level="INFO",
)

logger = logging.getLogger(__name__)

logger.info("Initializing application")
app = create_app(config_app=config)
logger.info(
    f"Application initialized and ready to serve on {config.HOST}:{config.PORT}"
)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
    )
