from sqlalchemy import Column, Integer, SmallInteger, Numeric, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class ChamCong(BaseModel):
    __tablename__ = "cham_cong"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)
    
    so_ngay_lam_chuan = Column(Numeric(4, 1), nullable=False, default=26)
    so_ngay_lam_thuc_te = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_om = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_cong_tac = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_nghi_khong_phep = Column(Numeric(4, 1), nullable=False, default=0)
    so_ngay_le_tet = Column(Numeric(4, 1), nullable=False, default=0)
    
    trang_thai = Column(String(15), nullable=False, default="chua_chot")
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="cham_congs")
    tra_luongs = relationship("TraLuong", back_populates="cham_cong")