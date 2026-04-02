from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class LichSuChucVu(BaseModel):
    __tablename__ = "lich_su_chuc_vu"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    chuc_vu_id = Column(Integer, ForeignKey("chuc_vu.id"), nullable=False)
    phong_ban_id = Column(Integer, ForeignKey("phong_ban.id"))
    tu_ngay = Column(Date, nullable=False)
    den_ngay = Column(Date)
    ly_do = Column(String(200))
    so_quyet_dinh = Column(String(50))
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="lich_su_chuc_vus")
    chuc_vu = relationship("ChucVu", back_populates="lich_su_chuc_vus")
    phong_ban = relationship("PhongBan", back_populates="lich_su_chuc_vus")