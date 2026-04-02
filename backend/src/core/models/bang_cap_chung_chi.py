from sqlalchemy import Column, String, Integer, SmallInteger, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class BangCapChungChi(BaseModel):
    __tablename__ = "bang_cap_chung_chi"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    loai = Column(String(30), nullable=False)
    ten_bang = Column(String(200), nullable=False)
    chuyen_nganh = Column(String(100))
    truong_cap = Column(String(200))
    nam_cap = Column(SmallInteger)
    xep_loai = Column(String(20))
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="bang_caps")