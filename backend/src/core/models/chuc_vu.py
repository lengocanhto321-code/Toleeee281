from sqlalchemy import Column, String, Boolean, Text, Numeric
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class ChucVu(BaseModel):
    __tablename__ = "chuc_vu"
    
    ma_chuc_vu = Column(String(20), nullable=False, unique=True)
    ten_chuc_vu = Column(String(100), nullable=False)
    he_so_phu_cap = Column(Numeric(5, 2), nullable=False, default=0.00)
    mo_ta = Column(Text)
    tieu_chuan = Column(Text)
    trang_thai = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    nhan_viens = relationship("NhanVien", back_populates="chuc_vu")
    lich_su_chuc_vus = relationship("LichSuChucVu", back_populates="chuc_vu")