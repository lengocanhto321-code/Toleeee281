from sqlalchemy import Column, String, Boolean, Text, SmallInteger
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class TrinhDo(BaseModel):
    __tablename__ = "trinh_do"
    
    ma_trinh_do = Column(String(20), nullable=False, unique=True)
    ten_trinh_do = Column(String(100), nullable=False)
    cap_do = Column(SmallInteger, nullable=False)
    mo_ta = Column(Text)
    trang_thai = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    nhan_viens = relationship("NhanVien", back_populates="trinh_do")