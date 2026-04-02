from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class BaoCao(BaseModel):
    __tablename__ = "bao_cao"
    
    ten_bao_cao = Column(String(200), nullable=False)
    loai_bao_cao = Column(String(50), nullable=False)
    dinh_dang = Column(String(5), nullable=False, default="excel")
    tham_so = Column(JSONB)
    duong_dan_file = Column(String(500))
    nguoi_xuat_id = Column(Integer, ForeignKey("tai_khoan.id", ondelete="SET NULL"))
    thoi_gian_xuat = Column(DateTime(timezone=True), nullable=False, server_default="NOW()")
    
    # Relationships
    nguoi_xuat = relationship("TaiKhoan", back_populates="bao_caos")