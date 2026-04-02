from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from src.core.base import BaseModel  # Import từ core, không phải từ models

class PhongBan(BaseModel):
    __tablename__ = "phong_ban"
    
    ma_phong_ban = Column(String(20), nullable=False, unique=True)
    ten_phong_ban = Column(String(100), nullable=False)
    loai = Column(String(20), nullable=False, default="chuyen_mon")
    mo_ta = Column(Text)
    truong_phong = Column(String(100))
    so_dien_thoai = Column(String(15))
    email = Column(String(100))
    trang_thai = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    nhan_viens = relationship("NhanVien", back_populates="phong_ban")