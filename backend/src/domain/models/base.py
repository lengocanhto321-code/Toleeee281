from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()


def generate_uuid() -> str:
    """Tạo UUID v4 hex string (32 ký tự không có gạch nối) cho primary key."""
    return uuid.uuid4().hex
