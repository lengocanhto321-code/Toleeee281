from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from src.core.database import Base

class BaseModel(Base):
    """Base model với các cột chung cho tất cả bảng"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())