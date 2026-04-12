from typing import Optional, List, Tuple
from datetime import date
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.luong import Luong
from src.domain.models.nhan_vien import NhanVien
from src.domain.models.cham_cong import ChamCong
from src.domain.models.cau_hinh_luong import (
    CauHinhHeThongLuong,
    HeSoLuongDanhMuc,
    PhuCapTheoCapHoc,
    TamDinhChiCongTac,
    KyLuatVienChuc,
)


class LuongRepository:
    """Repository for Luong model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, luong: Luong) -> Luong:
        """Create a new Luong record."""
        self._session.add(luong)
        await self._session.flush()
        await self._session.refresh(luong)
        return luong

    async def find_by_id(self, id: str) -> Optional[Luong]:
        """Find Luong by ID."""
        result = await self._session.execute(select(Luong).where(Luong.id == id))
        return result.scalar_one_or_none()

    async def find_hien_tai(self, nhan_vien_id: str, ngay: date) -> Optional[Luong]:
        """Find current Luong for nhan_vien at a specific date."""
        result = await self._session.execute(
            select(Luong).where(
                Luong.nhan_vien_id == nhan_vien_id,
                Luong.hieu_luc_tu <= ngay,
                (Luong.hieu_luc_den >= ngay) | (Luong.hieu_luc_den.is_(None)),
            )
        )
        return result.scalar_one_or_none()

    async def find_all_by_nhan_vien(
        self, nhan_vien_id: str, include_expired: bool = False
    ) -> List[Luong]:
        """Find all Luong records for a nhan_vien."""
        query = select(Luong).where(Luong.nhan_vien_id == nhan_vien_id)
        if not include_expired:
            query = query.where(
                (Luong.hieu_luc_den.is_(None)) | (Luong.hieu_luc_den >= date.today())
            )
        result = await self._session.execute(query.order_by(Luong.hieu_luc_tu.desc()))
        return list(result.scalars().all())

    async def update_hieu_luc_den(self, luong_id: str, ngay: date) -> Optional[Luong]:
        """Update hieu_luc_den to close the previous record."""
        luong = await self.find_by_id(luong_id)
        if luong:
            luong.hieu_luc_den = ngay
            await self._session.flush()
            await self._session.refresh(luong)
        return luong

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        nhan_vien_id: Optional[str] = None,
        hieu_luc: Optional[date] = None,
    ) -> Tuple[int, List[Luong]]:
        """Get paginated list of Luong records."""
        query = select(Luong)

        if nhan_vien_id:
            query = query.where(Luong.nhan_vien_id == nhan_vien_id)
        if hieu_luc:
            query = query.where(
                Luong.hieu_luc_tu <= hieu_luc,
                (Luong.hieu_luc_den >= hieu_luc) | (Luong.hieu_luc_den.is_(None)),
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar() or 0

        items_query = (
            query.order_by(Luong.hieu_luc_tu.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._session.execute(items_query)
        items = list(result.scalars().all())

        return total, items


class NhanVienRepository:
    """Repository for NhanVien model - minimal version for salary calculations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_id(self, id: str) -> Optional[NhanVien]:
        """Find NhanVien by ID."""
        result = await self._session.execute(select(NhanVien).where(NhanVien.id == id))
        return result.scalar_one_or_none()

    async def find_dang_lam(
        self, danh_sach_ids: Optional[List[str]] = None
    ) -> List[NhanVien]:
        """Find all active (dang_lam) nhan_vien."""
        query = select(NhanVien).where(NhanVien.trang_thai == "dang_lam")
        if danh_sach_ids:
            query = query.where(NhanVien.id.in_(danh_sach_ids))
        result = await self._session.execute(query)
        return list(result.scalars().all())


class ChamCongRepository:
    """Repository for ChamCong model."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def find_by_nhan_vien_thang_nam(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> Optional[ChamCong]:
        """Find ChamCong record by nhan_vien, thang, nam."""
        result = await self._session.execute(
            select(ChamCong).where(
                ChamCong.nhan_vien_id == nhan_vien_id,
                ChamCong.thang == thang,
                ChamCong.nam == nam,
            )
        )
        return result.scalar_one_or_none()


class CauHinhLuongRepository:
    """Repository for salary configuration models."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_cau_hinh(
        self, cau_hinh: CauHinhHeThongLuong
    ) -> CauHinhHeThongLuong:
        """Create a new CauHinhHeThongLuong."""
        self._session.add(cau_hinh)
        await self._session.flush()
        await self._session.refresh(cau_hinh)
        return cau_hinh

    async def find_cau_hinh_hien_tai(self, ngay: date) -> Optional[CauHinhHeThongLuong]:
        """Find the current salary configuration for a date."""
        result = await self._session.execute(
            select(CauHinhHeThongLuong)
            .where(
                CauHinhHeThongLuong.ngay_ap_dung <= ngay,
                CauHinhHeThongLuong.trang_thai.in_(["dang_ap_dung", "sap_hieu_luc"]),
            )
            .order_by(CauHinhHeThongLuong.ngay_ap_dung.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_paginated(
        self,
        page: int = 1,
        page_size: int = 10,
        ngay_ap_dung: Optional[date] = None,
        trang_thai: Optional[str] = None,
    ) -> Tuple[int, List[CauHinhHeThongLuong]]:
        """Get paginated list of CauHinhHeThongLuong."""
        query = select(CauHinhHeThongLuong)

        if ngay_ap_dung:
            query = query.where(CauHinhHeThongLuong.ngay_ap_dung == ngay_ap_dung)
        if trang_thai:
            query = query.where(CauHinhHeThongLuong.trang_thai == trang_thai)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self._session.execute(count_query)
        total = total_result.scalar() or 0

        items_query = (
            query.order_by(CauHinhHeThongLuong.ngay_ap_dung.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._session.execute(items_query)
        items = list(result.scalars().all())

        return total, items

    async def find_he_so_luong(
        self, ma_ngach: str, bac: int, ngay: date
    ) -> Optional[HeSoLuongDanhMuc]:
        """Find salary coefficient by ma_ngach and bac."""
        result = await self._session.execute(
            select(HeSoLuongDanhMuc)
            .where(
                HeSoLuongDanhMuc.ma_ngach == ma_ngach,
                HeSoLuongDanhMuc.bac == bac,
                HeSoLuongDanhMuc.ngay_ap_dung <= ngay,
            )
            .order_by(HeSoLuongDanhMuc.ngay_ap_dung.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def find_tam_dinh_chi(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> Optional[TamDinhChiCongTac]:
        """Find tam dinh chi record for nhan_vien in a month."""
        ngay_dau_thang = date(nam, thang, 1)
        ngay_cuoi_thang = (
            date(nam + 1, 1, 1) if thang == 12 else date(nam, thang + 1, 1)
        )

        result = await self._session.execute(
            select(TamDinhChiCongTac).where(
                TamDinhChiCongTac.nhan_vien_id == nhan_vien_id,
                TamDinhChiCongTac.ngay_bat_dau < ngay_cuoi_thang,
                TamDinhChiCongTac.ngay_ket_thuc >= ngay_dau_thang,
            )
        )
        return result.scalar_one_or_none()

    async def find_ky_luat_hieu_luc(
        self, nhan_vien_id: str, thang: int, nam: int
    ) -> Optional[KyLuatVienChuc]:
        """Find active disciplinary record for nhan_vien."""
        ngay_cuoi_thang = (
            date(nam + 1, 1, 1) if thang == 12 else date(nam, thang + 1, 1)
        )

        result = await self._session.execute(
            select(KyLuatVienChuc)
            .where(
                KyLuatVienChuc.nhan_vien_id == nhan_vien_id,
                KyLuatVienChuc.trang_thai == "da_xu_ly",
                KyLuatVienChuc.ngay_co_hieu_luc <= ngay_cuoi_thang,
            )
            .order_by(KyLuatVienChuc.ngay_co_hieu_luc.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
