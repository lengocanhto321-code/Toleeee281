import os
import yaml

ROOT_PATH = os.path.dirname(__file__)

CONFIG_FILE_PATH = os.path.join(ROOT_PATH, "env.yaml")

if os.path.exists(CONFIG_FILE_PATH):
    with open(CONFIG_FILE_PATH, "r") as r_file:
        data = yaml.safe_load(r_file)
else:
    data = dict()


class ApplicationConfig:
    # Basic application settings
    HOST = data["HOST"]
    PORT = data["PORT"]
    CORS_ORIGINS = data["CORS_ORIGINS"]

    # Database configuration
    DB_URI = data["DB_URI"]
    MIGRATION_DB_URI = data["MIGRATION_DB_URI"]

    # JWT configuration
    JWT_SECRET = data["JWT_SECRET"]
    JWT_ALGORITHM = data["JWT_ALGORITHM"]
    JWT_EXP_MIN = data.get("JWT_EXP_MIN", 60)


config = ApplicationConfig()
