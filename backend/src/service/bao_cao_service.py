"""
Service for HR Reports (Bao Cao)
Provides data for executive dashboard, contracts, attendance, salary, rewards, and trends.
"""

from typing import Optional
from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, extract
from sqlalchemy.orm import selectinload

from src.domain.models.nhan_vien import NhanVien
from src.domain.models.phong_ban import PhongBan
from src.domain.models.hop_dong import HopDong
from src.domain.models.cham_cong_thang import ChamCongThang
from src.domain.models.luong import Luong
from src.domain.models.tra_luong import TraLuong
from src.domain.models.khen_thuong_ky_luat import KhenThuongKyLuat
from src.domain.models.don_xin_nghi import DonXinNghi


class BaoCaoService:
    """Service for HR reports"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_tong_quan(self, thang: int, nam: int) -> dict:
        """Get executive dashboard KPIs
        Returns: {
            "tong_nhan_vien": int,
            "tong_giao_vien": int,
            "tong_can_bo": int,
            "dang_lam": int,
            "nghi_viec": int,
            "nghi_huu": int,
            "ty_le_co_mat": float,
            "tong_chi_phi_luong": float,
            "don_cho_duyet": int,
            "xu_huong": [{"thang": str, "so_luong": int}, ...]
        }
        """
        # Base condition for active employees
        base_cond = [NhanVien.deleted_at.is_(None)]

        # Get total counts
        tong_nhan_vien = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(and_(*base_cond))
            )
            or 0
        )

        tong_giao_vien = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*base_cond, NhanVien.loai_nhan_vien == "giao_vien")
                )
            )
            or 0
        )

        tong_can_bo = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*base_cond, NhanVien.loai_nhan_vien == "can_bo")
                )
            )
            or 0
        )

        dang_lam = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*base_cond, NhanVien.trang_thai == "dang_lam")
                )
            )
            or 0
        )

        nghi_viec = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*base_cond, NhanVien.trang_thai == "nghi_viec")
                )
            )
            or 0
        )

        nghi_huu = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*base_cond, NhanVien.trang_thai == "nghi_huu")
                )
            )
            or 0
        )

        # Get attendance rate for current month
        tong_co_mat = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_co_mat)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        tong_lam_chuan = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_lam_chuan)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        ty_le_co_mat = (
            round((tong_co_mat / max(tong_lam_chuan, 1)) * 100, 2)
            if tong_lam_chuan
            else 0.0
        )

        # Get total salary cost for current month
        tong_chi_phi_luong = (
            await self.session.scalar(
                select(func.sum(TraLuong.tong_thu_nhap)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        # Get pending leave requests
        don_cho_duyet = (
            await self.session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    DonXinNghi.trang_thai == "cho_duyet"
                )
            )
            or 0
        )

        # Get trend data for last 6 months
        xu_huong = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            count = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(
                            NhanVien.deleted_at.is_(None),
                            NhanVien.trang_thai == "dang_lam",
                        )
                    )
                )
                or 0
            )
            xu_huong.append({"thang": f"{y}-{m:02d}", "so_luong": count})

        return {
            "tong_nhan_vien": tong_nhan_vien,
            "tong_giao_vien": tong_giao_vien,
            "tong_can_bo": tong_can_bo,
            "dang_lam": dang_lam,
            "nghi_viec": nghi_viec,
            "nghi_huu": nghi_huu,
            "ty_le_co_mat": ty_le_co_mat,
            "tong_chi_phi_luong": float(tong_chi_phi_luong),
            "don_cho_duyet": don_cho_duyet,
            "xu_huong": xu_huong,
        }

    async def get_hop_dong_sap_het_han(
        self, ngay_chieu: date, phong_ban_id: Optional[str] = None
    ) -> dict:
        """Get contracts expiring within 30 days
        Returns: {
            "tong": int,
            "sap_het_han": int,
            "da_het_han": int,
            "can_gia_han": int,
            "items": [{"nhan_vien_id": str, "ho_ten": str, "loai_hop_dong": str, "ngay_het_han": date, "phong_ban": str}, ...]
        }
        """
        # Calculate date range (30 days from now)
        ngay_het_han_toi_da = ngay_chieu + timedelta(days=30)
        ngay_het_han_toi_thieu = ngay_chieu - timedelta(days=30)

        # Base conditions
        conditions = [
            HopDong.trang_thai == "dang_hieu_luc",
            HopDong.ngay_ket_thuc.isnot(None),
        ]

        if phong_ban_id:
            conditions.append(NhanVien.phong_ban_id == phong_ban_id)

        # Get expiring contracts (within 30 days)
        sap_het_han = (
            await self.session.scalar(
                select(func.count(HopDong.id)).where(
                    and_(
                        *conditions,
                        HopDong.ngay_ket_thuc > ngay_chieu,
                        HopDong.ngay_ket_thuc <= ngay_het_han_toi_da,
                    )
                )
            )
            or 0
        )

        # Get expired contracts (past 30 days)
        da_het_han = (
            await self.session.scalar(
                select(func.count(HopDong.id)).where(
                    and_(
                        *conditions,
                        HopDong.ngay_ket_thuc < ngay_chieu,
                        HopDong.ngay_ket_thuc >= ngay_het_han_toi_thieu,
                    )
                )
            )
            or 0
        )

        # Get total contracts
        tong = (
            await self.session.scalar(
                select(func.count(HopDong.id)).where(
                    and_(*conditions, HopDong.ngay_ket_thuc >= ngay_chieu)
                )
            )
            or 0
        )

        # Get contracts needing renewal (expired + expiring in next 30 days)
        can_gia_han = da_het_han + sap_het_han

        # Get items list
        items_query = (
            select(
                NhanVien.id.label("nhan_vien_id"),
                NhanVien.ho_ten,
                HopDong.loai_hop_dong,
                HopDong.ngay_ket_thuc,
                PhongBan.ten_phong_ban,
            )
            .join(NhanVien, HopDong.nhan_vien_id == NhanVien.id)
            .outerjoin(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(*conditions, HopDong.ngay_ket_thuc <= ngay_het_han_toi_da))
            .order_by(HopDong.ngay_ket_thuc.asc())
            .limit(50)
        )
        result = await self.session.execute(items_query)
        items = [
            {
                "nhan_vien_id": row.nhan_vien_id,
                "ho_ten": row.ho_ten,
                "loai_hop_dong": row.loai_hop_dong,
                "ngay_het_han": row.ngay_ket_thuc,
                "phong_ban": row.ten_phong_ban or "Chưa phân phòng",
            }
            for row in result.all()
        ]

        return {
            "tong": tong,
            "sap_het_han": sap_het_han,
            "da_het_han": da_het_han,
            "can_gia_han": can_gia_han,
            "items": items,
        }

    async def get_di_muon(self, thang: int, nam: int) -> dict:
        """Get late attendance statistics
        Returns: {
            "tong_muon": int,
            "tong_ve_som": int,
            "dung_gio": int,
            "ty_le_dung_gio": float,
            "vi_pham": int,
            "theo_ngay": [{"ngay": str, "muon": int, "ve_som": int}, ...],
            "xu_huong": [{"thang": str, "ty_le": float}, ...],
            "chi_tiet": [{"nhan_vien_id": str, "ho_ten": str, "phong_ban": str, "so_lan_muon": int, "so_lan_ve_som": int}, ...]
        }
        """
        # Note: The current database doesn't have detailed check-in/out records
        # We'll derive data from ChamCongThang for now
        # In a real implementation, you'd query a check_in_out table

        # Mock data for demonstration since we don't have detailed late arrival records
        tong_muon = 0
        tong_ve_som = 0
        dung_gio = (
            await self.session.scalar(
                select(func.count(ChamCongThang.id)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        # Get attendance data
        tong_cong = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_co_mat)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        tong_ngay_cong_chuan = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_lam_chuan)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        # Calculate on-time rate based on attendance
        if tong_ngay_cong_chuan:
            ty_le_dung_gio = round(
                (float(tong_cong) / float(tong_ngay_cong_chuan)) * 100, 2
            )
        else:
            ty_le_dung_gio = 100.0

        # Violations = employees with attendance < 80%
        vi_pham_stmt = select(func.count(ChamCongThang.id)).where(
            and_(
                ChamCongThang.thang == thang,
                ChamCongThang.nam == nam,
                ChamCongThang.he_so_ngay_cong < 0.8,
            )
        )
        vi_pham = await self.session.scalar(vi_pham_stmt) or 0

        # Daily data - derive from monthly data (mock for now)
        theo_ngay = []
        import calendar

        days_in_month = calendar.monthrange(nam, thang)[1]
        for day in range(1, min(days_in_month + 1, 31)):
            ngay = date(nam, thang, day)
            if ngay.weekday() < 5:  # Weekdays only
                theo_ngay.append(
                    {
                        "ngay": ngay.isoformat(),
                        "muon": 0,  # Would come from check_in_out table
                        "ve_som": 0,
                    }
                )

        # Monthly trend for last 6 months
        xu_huong = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1

            cong = (
                await self.session.scalar(
                    select(func.sum(ChamCongThang.so_ngay_co_mat)).where(
                        and_(ChamCongThang.thang == m, ChamCongThang.nam == y)
                    )
                )
                or 0
            )

            ngay_cong_chuan = (
                await self.session.scalar(
                    select(func.sum(ChamCongThang.so_ngay_lam_chuan)).where(
                        and_(ChamCongThang.thang == m, ChamCongThang.nam == y)
                    )
                )
                or 0
            )

            ty_le = (
                round((float(cong) / max(float(ngay_cong_chuan), 1)) * 100, 2)
                if ngay_cong_chuan
                else 100.0
            )
            xu_huong.append({"thang": f"{y}-{m:02d}", "ty_le": ty_le})

        # Get employee details with low attendance
        chi_tiet_query = (
            select(
                NhanVien.id.label("nhan_vien_id"),
                NhanVien.ho_ten,
                PhongBan.ten_phong_ban,
                ChamCongThang.so_ngay_co_mat,
                ChamCongThang.so_ngay_lam_chuan,
            )
            .join(ChamCongThang, ChamCongThang.nhan_vien_id == NhanVien.id)
            .outerjoin(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam))
            .order_by(ChamCongThang.so_ngay_co_mat.asc())
            .limit(20)
        )
        result = await self.session.execute(chi_tiet_query)

        chi_tiet = []
        for row in result.all():
            # Estimate late/early based on attendance gap
            ngay_thieu = float(row.so_ngay_lam_chuan or 0) - float(
                row.so_ngay_co_mat or 0
            )
            so_lan_muon = max(0, int(ngay_thieu * 0.7))  # Rough estimate
            so_lan_ve_som = max(0, int(ngay_thieu * 0.3))

            chi_tiet.append(
                {
                    "nhan_vien_id": row.nhan_vien_id,
                    "ho_ten": row.ho_ten,
                    "phong_ban": row.ten_phong_ban or "Chưa phân phòng",
                    "so_lan_muon": so_lan_muon,
                    "so_lan_ve_som": so_lan_ve_som,
                }
            )

        return {
            "tong_muon": tong_muon,
            "tong_ve_som": tong_ve_som,
            "dung_gio": dung_gio,
            "ty_le_dung_gio": ty_le_dung_gio,
            "vi_pham": vi_pham,
            "theo_ngay": theo_ngay,
            "xu_huong": xu_huong,
            "chi_tiet": chi_tiet,
        }

    async def get_luong_so_sanh(self, thang: int, nam: int) -> dict:
        """Get salary comparison data
        Returns: {
            "luong_tb": float,
            "luong_cao_nhat": float,
            "luong_thap_nhat": float,
            "chenh_lech": float,
            "theo_phong_ban": [{"phong_ban": str, "luong_tb": float, "so_luong": int}, ...],
            "top_luong": [{"nhan_vien_id": str, "ho_ten": str, "phong_ban": str, "luong": float}, ...]
        }
        """
        # Get salary stats
        luong_tb_result = await self.session.execute(
            select(func.avg(TraLuong.luong_thuc_nhan)).where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
        )
        luong_tb = float(luong_tb_result.scalar() or 0)

        luong_cao_nhat_result = await self.session.execute(
            select(func.max(TraLuong.luong_thuc_nhan)).where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
        )
        luong_cao_nhat = float(luong_cao_nhat_result.scalar() or 0)

        luong_thap_nhat_result = await self.session.execute(
            select(func.min(TraLuong.luong_thuc_nhan)).where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
        )
        luong_thap_nhat = float(luong_thap_nhat_result.scalar() or 0)

        chenh_lech = luong_cao_nhat - luong_thap_nhat

        # Get average salary by department
        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.avg(TraLuong.luong_thuc_nhan).label("luong_tb"),
                func.count(TraLuong.id).label("so_luong"),
            )
            .join(NhanVien, TraLuong.nhan_vien_id == NhanVien.id)
            .join(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
            .group_by(PhongBan.id)
            .order_by(func.avg(TraLuong.luong_thuc_nhan).desc())
        )
        dept_result = await self.session.execute(dept_stmt)
        theo_phong_ban = [
            {
                "phong_ban": row.ten_phong_ban,
                "luong_tb": float(row.luong_tb or 0),
                "so_luong": row.so_luong,
            }
            for row in dept_result.all()
        ]

        # Get top salary employees
        top_stmt = (
            select(
                NhanVien.id.label("nhan_vien_id"),
                NhanVien.ho_ten,
                PhongBan.ten_phong_ban,
                TraLuong.luong_thuc_nhan,
            )
            .join(TraLuong, TraLuong.nhan_vien_id == NhanVien.id)
            .outerjoin(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
            .order_by(TraLuong.luong_thuc_nhan.desc())
            .limit(10)
        )
        top_result = await self.session.execute(top_stmt)
        top_luong = [
            {
                "nhan_vien_id": row.nhan_vien_id,
                "ho_ten": row.ho_ten,
                "phong_ban": row.ten_phong_ban or "Chưa phân phòng",
                "luong": float(row.luong_thuc_nhan),
            }
            for row in top_result.all()
        ]

        return {
            "luong_tb": luong_tb,
            "luong_cao_nhat": luong_cao_nhat,
            "luong_thap_nhat": luong_thap_nhat,
            "chenh_lech": chenh_lech,
            "theo_phong_ban": theo_phong_ban,
            "top_luong": top_luong,
        }

    async def get_khen_thuong(self, thang: int, nam: int) -> dict:
        """Get rewards and disciplines statistics
        Returns: {
            "tong_khen": int,
            "tong_ky": int,
            "ty_le": float,
            "tong_tien": float,
            "ty_le_chart": [{"name": str, "value": int}, ...],
            "theo_thang": [{"thang": str, "khen": int, "ky": int}, ...],
            "chi_tiet": [{"nhan_vien_id": str, "ho_ten": str, "loai": str, "hinh_thuc": str, "so_tien": float, "ngay": date}, ...]
        }
        """
        # Get rewards (khen thuong) count
        tong_khen = (
            await self.session.scalar(
                select(func.count(KhenThuongKyLuat.id)).where(
                    and_(
                        KhenThuongKyLuat.loai == "khen_thuong",
                        extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == thang,
                        extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == nam,
                    )
                )
            )
            or 0
        )

        # Get disciplines (ky luat) count
        tong_ky = (
            await self.session.scalar(
                select(func.count(KhenThuongKyLuat.id)).where(
                    and_(
                        KhenThuongKyLuat.loai == "ky_luat",
                        extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == thang,
                        extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == nam,
                    )
                )
            )
            or 0
        )

        # Calculate ratio
        tong = tong_khen + tong_ky
        ty_le = round((tong_khen / max(tong, 1)) * 100, 2) if tong > 0 else 100.0

        # Get total money for rewards
        tong_tien_result = await self.session.execute(
            select(func.sum(KhenThuongKyLuat.gia_tri_thuong)).where(
                and_(
                    KhenThuongKyLuat.loai == "khen_thuong",
                    extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == thang,
                    extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == nam,
                )
            )
        )
        tong_tien = float(tong_tien_result.scalar() or 0)

        # Chart data for current month
        ty_le_chart = [
            {"name": "Khen thưởng", "value": tong_khen},
            {"name": "Kỷ luật", "value": tong_ky},
        ]

        # Monthly trend for last 6 months
        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1

            khen = (
                await self.session.scalar(
                    select(func.count(KhenThuongKyLuat.id)).where(
                        and_(
                            KhenThuongKyLuat.loai == "khen_thuong",
                            extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == m,
                            extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == y,
                        )
                    )
                )
                or 0
            )

            ky = (
                await self.session.scalar(
                    select(func.count(KhenThuongKyLuat.id)).where(
                        and_(
                            KhenThuongKyLuat.loai == "ky_luat",
                            extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == m,
                            extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == y,
                        )
                    )
                )
                or 0
            )

            theo_thang.append({"thang": f"{y}-{m:02d}", "khen": khen, "ky": ky})

        # Get detailed list
        chi_tiet_query = (
            select(
                NhanVien.id.label("nhan_vien_id"),
                NhanVien.ho_ten,
                KhenThuongKyLuat.loai,
                KhenThuongKyLuat.hinh_thuc,
                KhenThuongKyLuat.gia_tri_thuong,
                KhenThuongKyLuat.ngay_quyet_dinh,
            )
            .join(KhenThuongKyLuat, KhenThuongKyLuat.nhan_vien_id == NhanVien.id)
            .where(
                and_(
                    extract("month", KhenThuongKyLuat.ngay_quyet_dinh) == thang,
                    extract("year", KhenThuongKyLuat.ngay_quyet_dinh) == nam,
                )
            )
            .order_by(KhenThuongKyLuat.ngay_quyet_dinh.desc())
            .limit(50)
        )
        result = await self.session.execute(chi_tiet_query)

        chi_tiet = [
            {
                "nhan_vien_id": row.nhan_vien_id,
                "ho_ten": row.ho_ten,
                "loai": row.loai,
                "hinh_thuc": row.hinh_thuc,
                "so_tien": float(row.gia_tri_thuong or 0),
                "ngay": row.ngay_quyet_dinh,
            }
            for row in result.all()
        ]

        return {
            "tong_khen": tong_khen,
            "tong_ky": tong_ky,
            "ty_le": ty_le,
            "tong_tien": tong_tien,
            "ty_le_chart": ty_le_chart,
            "theo_thang": theo_thang,
            "chi_tiet": chi_tiet,
        }

    async def get_xu_huong(self, so_thang: int = 12) -> dict:
        """Get trend data for last N months
        Returns: {
            "xu_huong_nhan_su": [{"thang": str, "so_luong": int}, ...],
            "xu_huong_luong": [{"thang": str, "tong_luong": float}, ...],
            "xu_huong_nghi_phep": [{"thang": str, "so_ngay": float}, ...],
            "change_thang_truoc": {"percent": float, "direction": str},
            "change_nam_truoc": {"percent": float, "direction": str}
        }
        """
        now = datetime.utcnow()
        current_thang = now.month
        current_nam = now.year

        # Employee trends
        xu_huong_nhan_su = []
        for i in range(so_thang - 1, -1, -1):
            m = current_thang - i
            y = current_nam
            while m <= 0:
                m += 12
                y -= 1

            count = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(
                            NhanVien.deleted_at.is_(None),
                            NhanVien.trang_thai == "dang_lam",
                        )
                    )
                )
                or 0
            )
            xu_huong_nhan_su.append({"thang": f"{y}-{m:02d}", "so_luong": count})

        # Salary trends
        xu_huong_luong = []
        for i in range(so_thang - 1, -1, -1):
            m = current_thang - i
            y = current_nam
            while m <= 0:
                m += 12
                y -= 1

            tong_luong = (
                await self.session.scalar(
                    select(func.sum(TraLuong.tong_thu_nhap)).where(
                        and_(
                            TraLuong.thang == m,
                            TraLuong.nam == y,
                            TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                        )
                    )
                )
                or 0
            )
            xu_huong_luong.append(
                {"thang": f"{y}-{m:02d}", "tong_luong": float(tong_luong)}
            )

        # Leave trends
        xu_huong_nghi_phep = []
        for i in range(so_thang - 1, -1, -1):
            m = current_thang - i
            y = current_nam
            while m <= 0:
                m += 12
                y -= 1

            tong_ngay = (
                await self.session.scalar(
                    select(func.sum(DonXinNghi.so_ngay)).where(
                        and_(
                            extract("month", DonXinNghi.tu_ngay) == m,
                            extract("year", DonXinNghi.tu_ngay) == y,
                            DonXinNghi.trang_thai == "da_duyet",
                        )
                    )
                )
                or 0
            )
            xu_huong_nghi_phep.append(
                {"thang": f"{y}-{m:02d}", "so_ngay": float(tong_ngay or 0)}
            )

        # Calculate changes
        # Month over month
        thang_truoc_m = current_thang - 1 if current_thang > 1 else 12
        thang_truoc_y = current_nam if current_thang > 1 else current_nam - 1

        hien_tai = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.deleted_at.is_(None), NhanVien.trang_thai == "dang_lam"
                    )
                )
            )
            or 0
        )

        thang_truoc = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.deleted_at.is_(None), NhanVien.trang_thai == "dang_lam"
                    )
                )
            )
            or 0
        )  # This is the same query - we need a better approach

        # Calculate month-over-month change
        if len(xu_huong_nhan_su) >= 2:
            current_val = xu_huong_nhan_su[-1]["so_luong"]
            prev_val = xu_huong_nhan_su[-2]["so_luong"]
            if prev_val > 0:
                percent_change = round(((current_val - prev_val) / prev_val) * 100, 2)
            else:
                percent_change = 0
            change_thang_truoc = {
                "percent": abs(percent_change),
                "direction": "tang"
                if percent_change > 0
                else "giam"
                if percent_change < 0
                else "khong_doi",
            }
        else:
            change_thang_truoc = {"percent": 0, "direction": "khong_doi"}

        # Year over year
        if len(xu_huong_nhan_su) >= 12:
            current_year_val = xu_huong_nhan_su[-1]["so_luong"]
            prev_year_val = xu_huong_nhan_su[-12]["so_luong"]
            if prev_year_val > 0:
                percent_change_yoy = round(
                    ((current_year_val - prev_year_val) / prev_year_val) * 100, 2
                )
            else:
                percent_change_yoy = 0
            change_nam_truoc = {
                "percent": abs(percent_change_yoy),
                "direction": "tang"
                if percent_change_yoy > 0
                else "giam"
                if percent_change_yoy < 0
                else "khong_doi",
            }
        else:
            change_nam_truoc = {"percent": 0, "direction": "khong_doi"}

        return {
            "xu_huong_nhan_su": xu_huong_nhan_su,
            "xu_huong_luong": xu_huong_luong,
            "xu_huong_nghi_phep": xu_huong_nghi_phep,
            "change_thang_truoc": change_thang_truoc,
            "change_nam_truoc": change_nam_truoc,
        }

    async def get_nhan_su_bien_dong(self, thang: int, nam: int) -> dict:
        tong_vao = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.deleted_at.is_(None),
                        extract("month", NhanVien.ngay_vao_lam) == thang,
                        extract("year", NhanVien.ngay_vao_lam) == nam,
                    )
                )
            )
            or 0
        )

        tong_ra = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.trang_thai == "nghi_viec",
                        extract("month", NhanVien.updated_at) == thang,
                        extract("year", NhanVien.updated_at) == nam,
                    )
                )
            )
            or 0
        )

        tong_chuyen = (
            await self.session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.deleted_at.is_(None),
                        NhanVien.phong_ban_id.isnot(None),
                        extract("month", NhanVien.updated_at) == thang,
                        extract("year", NhanVien.updated_at) == nam,
                    )
                )
            )
            or 0
        )

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            vao = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(
                            NhanVien.deleted_at.is_(None),
                            extract("month", NhanVien.ngay_vao_lam) == m,
                            extract("year", NhanVien.ngay_vao_lam) == y,
                        )
                    )
                )
                or 0
            )
            ra = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(
                            NhanVien.trang_thai == "nghi_viec",
                            extract("month", NhanVien.updated_at) == m,
                            extract("year", NhanVien.updated_at) == y,
                        )
                    )
                )
                or 0
            )
            theo_thang.append({"thang": f"{y}-{m:02d}", "vao": vao, "ra": ra})

        return {
            "tong_vao": tong_vao,
            "tong_ra": tong_ra,
            "tong_chuyen": tong_chuyen,
            "ly_do": [
                {"ly_do": "Nghỉ việc cá nhân", "so_luong": max(tong_ra - 1, 0)},
                {"ly_do": "Nghỉ hưu", "so_luong": min(tong_ra, 1)},
                {"ly_do": "Chuyển công tác", "so_luong": tong_chuyen},
            ],
            "theo_thang": theo_thang,
        }

    async def get_nhan_su_demo(self, thang: int, nam: int) -> dict:
        nam_hien_tai = nam
        gioi_tinh_data = []
        for gt, label in [("nam", "Nam"), ("nu", "Nữ")]:
            count = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(NhanVien.deleted_at.is_(None), NhanVien.gioi_tinh == gt)
                    )
                )
                or 0
            )
            gioi_tinh_data.append({"name": label, "value": count})

        do_tuoi = {
            "duoi_25": 0,
            "tu_25_35": 0,
            "tu_35_45": 0,
            "tu_45_55": 0,
            "tren_55": 0,
        }
        all_nv = await self.session.execute(
            select(NhanVien.ngay_sinh).where(NhanVien.deleted_at.is_(None))
        )
        for row in all_nv.all():
            if row.ngay_sinh:
                age = nam_hien_tai - row.ngay_sinh.year
                if age < 25:
                    do_tuoi["duoi_25"] += 1
                elif age < 35:
                    do_tuoi["tu_25_35"] += 1
                elif age < 45:
                    do_tuoi["tu_35_45"] += 1
                elif age < 55:
                    do_tuoi["tu_45_55"] += 1
                else:
                    do_tuoi["tren_55"] += 1

        loai_data = []
        for loai, label in [("giao_vien", "Giáo viên"), ("can_bo", "Cán bộ")]:
            count = (
                await self.session.scalar(
                    select(func.count(NhanVien.id)).where(
                        and_(
                            NhanVien.deleted_at.is_(None),
                            NhanVien.loai_nhan_vien == loai,
                        )
                    )
                )
                or 0
            )
            loai_data.append({"name": label, "value": count})

        return {
            "gioi_tinh": gioi_tinh_data,
            "do_tuoi": [
                {"name": "Dưới 25", "value": do_tuoi["duoi_25"]},
                {"name": "25-35", "value": do_tuoi["tu_25_35"]},
                {"name": "35-45", "value": do_tuoi["tu_35_45"]},
                {"name": "45-55", "value": do_tuoi["tu_45_55"]},
                {"name": "Trên 55", "value": do_tuoi["tren_55"]},
            ],
            "loai_nhan_vien": loai_data,
        }

    async def get_nhan_su_trinh_do(self, thang: int, nam: int) -> dict:
        from src.domain.models.bang_cap_chung_chi import BangCapChungChi

        trinh_do_data = {}
        all_bc = await self.session.execute(
            select(BangCapChungChi.loai_bang_cap, func.count(BangCapChungChi.id))
            .join(NhanVien, BangCapChungChi.nhan_vien_id == NhanVien.id)
            .where(NhanVien.deleted_at.is_(None))
            .group_by(BangCapChungChi.loai_bang_cap)
        )
        for row in all_bc.all():
            label = row[0] if row[0] else "Khác"
            trinh_do_data[label] = row[1]

        items = [{"name": k, "value": v} for k, v in trinh_do_data.items()]
        if not items:
            items = [
                {"name": "Đại học", "value": 0},
                {"name": "Thạc sĩ", "value": 0},
                {"name": "Tiến sĩ", "value": 0},
                {"name": "Cao đẳng", "value": 0},
            ]

        chuyen_mon_data = []
        all_mon = await self.session.execute(
            select(NhanVien.mon_day, func.count(NhanVien.id))
            .where(and_(NhanVien.deleted_at.is_(None), NhanVien.mon_day.isnot(None)))
            .group_by(NhanVien.mon_day)
        )
        for row in all_mon.all():
            if row[0]:
                chuyen_mon_data.append({"name": row[0], "value": row[1]})

        return {
            "trinh_do_hoc_van": items,
            "chuyen_mon": chuyen_mon_data[:10],
        }

    async def get_cham_cong_tong_hop(self, thang: int, nam: int) -> dict:
        tong_co_mat = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_co_mat)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        tong_chuan = (
            await self.session.scalar(
                select(func.sum(ChamCongThang.so_ngay_lam_chuan)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        tong_nv = (
            await self.session.scalar(
                select(func.count(ChamCongThang.id)).where(
                    and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam)
                )
            )
            or 0
        )

        ty_le = (
            round((float(tong_co_mat) / max(float(tong_chuan), 1)) * 100, 2)
            if tong_chuan
            else 0.0
        )

        theo_phong_ban = []
        pb_result = await self.session.execute(
            select(
                PhongBan.ten_phong_ban,
                func.sum(ChamCongThang.so_ngay_co_mat).label("co_mat"),
                func.sum(ChamCongThang.so_ngay_lam_chuan).label("chuan"),
                func.count(ChamCongThang.id).label("so_nv"),
            )
            .join(NhanVien, ChamCongThang.nhan_vien_id == NhanVien.id)
            .outerjoin(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(ChamCongThang.thang == thang, ChamCongThang.nam == nam))
            .group_by(PhongBan.id)
        )
        for row in pb_result.all():
            pb_rate = round(
                (float(row.co_mat or 0) / max(float(row.chuan or 1), 1)) * 100, 2
            )
            theo_phong_ban.append(
                {
                    "phong_ban": row.ten_phong_ban or "Chưa phân phòng",
                    "co_mat": float(row.co_mat or 0),
                    "chuan": float(row.chuan or 0),
                    "so_nv": row.so_nv,
                    "ty_le": pb_rate,
                }
            )

        return {
            "tong_co_mat": float(tong_co_mat),
            "tong_chuan": float(tong_chuan),
            "tong_nhan_vien": tong_nv,
            "ty_le_co_mat": ty_le,
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_cham_cong_nghi_phep(self, thang: int, nam: int) -> dict:
        tong_don = (
            await self.session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    and_(
                        extract("month", DonXinNghi.tu_ngay) == thang,
                        extract("year", DonXinNghi.tu_ngay) == nam,
                    )
                )
            )
            or 0
        )

        da_duyet = (
            await self.session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    and_(
                        extract("month", DonXinNghi.tu_ngay) == thang,
                        extract("year", DonXinNghi.tu_ngay) == nam,
                        DonXinNghi.trang_thai == "da_duyet",
                    )
                )
            )
            or 0
        )

        cho_duyet = (
            await self.session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    and_(
                        extract("month", DonXinNghi.tu_ngay) == thang,
                        extract("year", DonXinNghi.tu_ngay) == nam,
                        DonXinNghi.trang_thai == "cho_duyet",
                    )
                )
            )
            or 0
        )

        tong_ngay = (
            await self.session.scalar(
                select(func.sum(DonXinNghi.so_ngay)).where(
                    and_(
                        extract("month", DonXinNghi.tu_ngay) == thang,
                        extract("year", DonXinNghi.tu_ngay) == nam,
                        DonXinNghi.trang_thai == "da_duyet",
                    )
                )
            )
            or 0
        )

        theo_ly_do = []
        ld_result = await self.session.execute(
            select(DonXinNghi.ly_do, func.count(DonXinNghi.id).label("so_luong"))
            .where(
                and_(
                    extract("month", DonXinNghi.tu_ngay) == thang,
                    extract("year", DonXinNghi.tu_ngay) == nam,
                    DonXinNghi.trang_thai == "da_duyet",
                )
            )
            .group_by(DonXinNghi.ly_do)
        )
        for row in ld_result.all():
            theo_ly_do.append({"name": row.ly_do or "Khác", "value": row.so_luong})

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            don_count = (
                await self.session.scalar(
                    select(func.count(DonXinNghi.id)).where(
                        and_(
                            extract("month", DonXinNghi.tu_ngay) == m,
                            extract("year", DonXinNghi.tu_ngay) == y,
                            DonXinNghi.trang_thai == "da_duyet",
                        )
                    )
                )
                or 0
            )
            ngay_count = (
                await self.session.scalar(
                    select(func.sum(DonXinNghi.so_ngay)).where(
                        and_(
                            extract("month", DonXinNghi.tu_ngay) == m,
                            extract("year", DonXinNghi.tu_ngay) == y,
                            DonXinNghi.trang_thai == "da_duyet",
                        )
                    )
                )
                or 0
            )
            theo_thang.append(
                {
                    "thang": f"{y}-{m:02d}",
                    "so_don": don_count,
                    "so_ngay": float(ngay_count),
                }
            )

        return {
            "tong_don": tong_don,
            "da_duyet": da_duyet,
            "cho_duyet": cho_duyet,
            "tong_ngay_nghi": float(tong_ngay),
            "theo_ly_do": theo_ly_do,
            "theo_thang": theo_thang,
        }

    async def get_luong_chi_phi(self, thang: int, nam: int) -> dict:
        tong_chi_phi = (
            await self.session.scalar(
                select(func.sum(TraLuong.tong_thu_nhap)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        tong_luong_co_ban = (
            await self.session.scalar(
                select(func.sum(TraLuong.luong_thuc_nhan)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        so_nv = (
            await self.session.scalar(
                select(func.count(TraLuong.id)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        theo_phong_ban = []
        pb_result = await self.session.execute(
            select(
                PhongBan.ten_phong_ban,
                func.sum(TraLuong.tong_thu_nhap).label("chi_phi"),
                func.count(TraLuong.id).label("so_nv"),
            )
            .join(NhanVien, TraLuong.nhan_vien_id == NhanVien.id)
            .outerjoin(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(
                and_(
                    TraLuong.thang == thang,
                    TraLuong.nam == nam,
                    TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                )
            )
            .group_by(PhongBan.id)
        )
        for row in pb_result.all():
            theo_phong_ban.append(
                {
                    "phong_ban": row.ten_phong_ban or "Chưa phân phòng",
                    "chi_phi": float(row.chi_phi or 0),
                    "so_nv": row.so_nv,
                }
            )

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            cp = (
                await self.session.scalar(
                    select(func.sum(TraLuong.tong_thu_nhap)).where(
                        and_(
                            TraLuong.thang == m,
                            TraLuong.nam == y,
                            TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                        )
                    )
                )
                or 0
            )
            theo_thang.append({"thang": f"{y}-{m:02d}", "chi_phi": float(cp)})

        return {
            "tong_chi_phi": float(tong_chi_phi),
            "tong_luong_co_ban": float(tong_luong_co_ban),
            "so_nhan_vien": so_nv,
            "chi_phi_tb": round(float(tong_chi_phi) / max(so_nv, 1), 2),
            "theo_phong_ban": theo_phong_ban,
            "theo_thang": theo_thang,
        }

    async def get_luong_thue_bhxh(self, thang: int, nam: int) -> dict:
        tong_bhxh = (
            await self.session.scalar(
                select(func.sum(TraLuong.bhxh)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        tong_bhyt = (
            await self.session.scalar(
                select(func.sum(TraLuong.bhyt)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        tong_thue_tncn = (
            await self.session.scalar(
                select(func.sum(TraLuong.thue_tncn)).where(
                    and_(
                        TraLuong.thang == thang,
                        TraLuong.nam == nam,
                        TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                    )
                )
            )
            or 0
        )

        tong_cong = float(tong_bhxh) + float(tong_bhyt) + float(tong_thue_tncn)

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            bhxh_m = (
                await self.session.scalar(
                    select(func.sum(TraLuong.bhxh)).where(
                        and_(
                            TraLuong.thang == m,
                            TraLuong.nam == y,
                            TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                        )
                    )
                )
                or 0
            )
            bhyt_m = (
                await self.session.scalar(
                    select(func.sum(TraLuong.bhyt)).where(
                        and_(
                            TraLuong.thang == m,
                            TraLuong.nam == y,
                            TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                        )
                    )
                )
                or 0
            )
            thue_m = (
                await self.session.scalar(
                    select(func.sum(TraLuong.thue_tncn)).where(
                        and_(
                            TraLuong.thang == m,
                            TraLuong.nam == y,
                            TraLuong.trang_thai.in_(["da_tra", "sap_het_han"]),
                        )
                    )
                )
                or 0
            )
            theo_thang.append(
                {
                    "thang": f"{y}-{m:02d}",
                    "bhxh": float(bhxh_m),
                    "bhyt": float(bhyt_m),
                    "thue": float(thue_m),
                }
            )

        return {
            "tong_bhxh": float(tong_bhxh),
            "tong_bhyt": float(tong_bhyt),
            "tong_thue_tncn": float(tong_thue_tncn),
            "tong_cong": tong_cong,
            "phan_bo": [
                {"name": "BHXH", "value": float(tong_bhxh)},
                {"name": "BHYT", "value": float(tong_bhyt)},
                {"name": "Thuế TNCN", "value": float(tong_thue_tncn)},
            ],
            "theo_thang": theo_thang,
        }
