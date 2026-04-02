from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class KhenThuongKyLuat(BaseModel):
    __tablename__ = "khen_thuong_ky_luat"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    loai = Column(String(15), nullable=False)
    hinh_thuc = Column(String(150), nullable=False)
    ly_do = Column(Text, nullable=False)
    ngay_quyet_dinh = Column(Date, nullable=False)
    so_quyet_dinh = Column(String(50))
    cap_quyet_dinh = Column(String(50))
    gia_tri_thuong = Column(BigInteger, nullable=False, default=0)
    thoi_han_ky_luat = Column(Date)
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="khen_thuongs")