from sqlalchemy import Column, Integer, String, Boolean, SmallInteger, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class TaiKhoan(BaseModel):
    __tablename__ = "tai_khoan"
    
    nhan_vien_id = Column(Integer, ForeignKey("nhan_vien.id", ondelete="SET NULL"))
    ten_dang_nhap = Column(String(50), nullable=False, unique=True, index=True)
    mat_khau_hash = Column(String(255), nullable=False)
    vai_tro = Column(String(15), nullable=False, default="admin")
    email = Column(String(100), unique=True)
    refresh_token = Column(Text)
    so_lan_dang_nhap_sai = Column(SmallInteger, nullable=False, default=0)
    bi_khoa = Column(Boolean, nullable=False, default=False)
    lan_dang_nhap_cuoi = Column(DateTime(timezone=True))
    trang_thai = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    nhan_vien = relationship("NhanVien", back_populates="tai_khoan")
    audit_logs = relationship("AuditLog", back_populates="tai_khoan")
    bao_caos = relationship("BaoCao", back_populates="nguoi_xuat")