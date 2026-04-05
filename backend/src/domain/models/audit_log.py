from sqlalchemy import Column, String, Text, BigInteger, ForeignKey, DateTime, JSON
from datetime import datetime

from .base import Base, generate_uuid


class AuditLog(Base):
    """Log toàn bộ thao tác - bắt buộc để đảm bảo an toàn dữ liệu."""
    __tablename__ = "audit_log"

    id = Column(String(32), primary_key=True, default=generate_uuid)
    tai_khoan_id = Column(String(32), ForeignKey("tai_khoan.id", ondelete="SET NULL"))
    hanh_dong = Column(String(10), nullable=False)
    bang_du_lieu = Column(String(50))
    ban_ghi_id = Column(String(32))
    du_lieu_cu = Column(JSON)
    du_lieu_moi = Column(JSON)
    dia_chi_ip = Column(String(45))
    ghi_chu = Column(Text)
    thoi_gian = Column(DateTime, nullable=False, default=datetime.utcnow)
