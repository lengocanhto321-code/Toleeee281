from sqlalchemy import Column, Integer, SmallInteger, String, Date, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class TraLuong(BaseModel):
    __tablename__ = "tra_luong"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="CASCADE"), nullable=False)
    luong_id = Column(Integer, ForeignKey("luong.id", ondelete="SET NULL"))
    cham_cong_id = Column(Integer, ForeignKey("cham_cong.id", ondelete="SET NULL"))
    thang = Column(SmallInteger, nullable=False)
    nam = Column(SmallInteger, nullable=False)
    
    # Kết quả tính toán
    luong_co_ban = Column(BigInteger, nullable=False, default=0)
    tong_phu_cap = Column(BigInteger, nullable=False, default=0)
    thu_nhap_tang_them = Column(BigInteger, nullable=False, default=0)
    thuong = Column(BigInteger, nullable=False, default=0)
    tong_thu_nhap = Column(BigInteger, nullable=False, default=0)
    tong_khau_tru = Column(BigInteger, nullable=False, default=0)
    luong_thuc_nhan = Column(BigInteger, nullable=False, default=0)
    
    # Thanh toán
    ngay_tra_luong = Column(Date)
    phuong_thuc = Column(String(20), nullable=False, default="chuyen_khoan")
    so_tai_khoan = Column(String(30))
    ngan_hang = Column(String(100))
    trang_thai = Column(String(15), nullable=False, default="chua_tra")
    ghi_chu = Column(Text)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="tra_luongs")
    luong = relationship("Luong", back_populates="tra_luongs")
    cham_cong = relationship("ChamCong", back_populates="tra_luongs")