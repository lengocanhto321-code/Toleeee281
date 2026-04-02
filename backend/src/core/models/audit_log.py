from sqlalchemy import Column, Integer, BigInteger, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    tai_khoan_id = Column(Integer, ForeignKey("tai_khoan.id", ondelete="SET NULL"))
    hanh_dong = Column(String(10), nullable=False)
    bang_du_lieu = Column(String(50))
    ban_ghi_id = Column(Integer)
    du_lieu_cu = Column(JSONB)
    du_lieu_moi = Column(JSONB)
    dia_chi_ip = Column(String(45))
    ghi_chu = Column(Text)
    thoi_gian = Column(DateTime(timezone=True), nullable=False, server_default="NOW()")
    
    # Relationships
    tai_khoan = relationship("TaiKhoan", back_populates="audit_logs")