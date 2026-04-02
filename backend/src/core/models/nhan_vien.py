from sqlalchemy import Column, String, Date, Boolean, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from src.core.base import BaseModel

class NhanVien(BaseModel):
    __tablename__ = "nhan_vien"
    
    # Thông tin cơ bản
    ma_nhan_vien = Column(String(20), nullable=False, unique=True, index=True)
    ho_ten = Column(String(100), nullable=False, index=True)
    gioi_tinh = Column(String(5), nullable=False)
    ngay_sinh = Column(Date, nullable=False)
    que_quan = Column(String(200))
    dia_chi_thuong_tru = Column(String(255))
    so_dien_thoai = Column(String(15), index=True)
    email = Column(String(100), unique=True, index=True)
    so_cccd = Column(String(12), unique=True)
    anh_dai_dien = Column(String(500))
    
    # Phân loại
    loai_nhan_vien = Column(String(20), nullable=False, default="giao_vien")
    mon_day = Column(String(100))
    hang_chuc_danh = Column(String(50))
    
    # Khóa ngoại
    phong_ban_id = Column(Integer, ForeignKey("phong_ban.id", ondelete="SET NULL"), index=True)
    chuc_vu_id = Column(Integer, ForeignKey("chuc_vu.id", ondelete="SET NULL"), index=True)
    trinh_do_id = Column(Integer, ForeignKey("trinh_do.id", ondelete="SET NULL"), index=True)
    
    # Hợp đồng
    loai_hop_dong = Column(String(30), nullable=False, default="vien_chuc")
    so_hop_dong = Column(String(50))
    ngay_vao_lam = Column(Date)
    ngay_het_hop_dong = Column(Date)
    
    # Bổ sung
    la_dang_vien = Column(Boolean, nullable=False, default=False)
    la_doan_vien = Column(Boolean, nullable=False, default=False)
    ghi_chu = Column(Text)
    trang_thai = Column(String(20), nullable=False, default="dang_lam", index=True)
    
    # Relationships
    phong_ban = relationship("PhongBan", back_populates="nhan_viens")
    chuc_vu = relationship("ChucVu", back_populates="nhan_viens")
    trinh_do = relationship("TrinhDo", back_populates="nhan_viens")
    
    bang_caps = relationship("BangCapChungChi", back_populates="nhan_vien", cascade="all, delete-orphan")
    lich_su_chuc_vus = relationship("LichSuChucVu", back_populates="nhan_vien", cascade="all, delete-orphan")
    luongs = relationship("Luong", back_populates="nhan_vien", cascade="all, delete-orphan")
    cham_congs = relationship("ChamCong", back_populates="nhan_vien", cascade="all, delete-orphan")
    tra_luongs = relationship("TraLuong", back_populates="nhan_vien", cascade="all, delete-orphan")
    nghi_pheps = relationship("NghiPhep", back_populates="nhan_vien", cascade="all, delete-orphan")
    khen_thuongs = relationship("KhenThuongKyLuat", back_populates="nhan_vien", cascade="all, delete-orphan")
    tai_khoan = relationship("TaiKhoan", back_populates="nhan_vien", uselist=False)