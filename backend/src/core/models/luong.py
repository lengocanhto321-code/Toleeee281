from sqlalchemy import Column, Integer, Numeric, Date, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class Luong(BaseModel):
    __tablename__ = "luong"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    
    # Thu nhập
    luong_co_ban = Column(BigInteger, nullable=False, default=0)
    he_so_luong = Column(Numeric(5, 2), nullable=False, default=1.00)
    phu_cap_chuc_vu = Column(BigInteger, nullable=False, default=0)
    phu_cap_tham_nien = Column(BigInteger, nullable=False, default=0)
    phu_cap_uu_dai = Column(BigInteger, nullable=False, default=0)
    phu_cap_khu_vuc = Column(BigInteger, nullable=False, default=0)
    phu_cap_khac = Column(BigInteger, nullable=False, default=0)
    
    # Khấu trừ
    bhxh = Column(BigInteger, nullable=False, default=0)
    bhyt = Column(BigInteger, nullable=False, default=0)
    thue_tncn = Column(BigInteger, nullable=False, default=0)
    khau_tru_khac = Column(BigInteger, nullable=False, default=0)
    
    # Thời hiệu
    hieu_luc_tu = Column(Date, nullable=False)
    hieu_luc_den = Column(Date)
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="luongs")
    tra_luongs = relationship("TraLuong", back_populates="luong")