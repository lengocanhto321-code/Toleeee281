from sqlalchemy import Column, Integer, String, Date, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class NghiPhep(BaseModel):
    __tablename__ = "nghi_phep"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    loai_nghi = Column(String(25), nullable=False)
    tu_ngay = Column(Date, nullable=False)
    den_ngay = Column(Date, nullable=False)
    so_ngay = Column(Numeric(4, 1), nullable=False, default=1)
    ly_do = Column(Text)
    trang_thai = Column(String(15), nullable=False, default="cho_duyet")
    ghi_chu_duyet = Column(Text)
    ngay_duyet = Column(DateTime(timezone=True))
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="nghi_pheps")