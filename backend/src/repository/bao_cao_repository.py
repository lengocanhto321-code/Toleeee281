from typing import List, Optional, Dict, Any
from datetime import date
from libs.datetime import get_utc_now
from sqlalchemy import select, func, and_, or_, extract, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.nhan_vien import NhanVien
from src.domain.models.phong_ban import PhongBan
from src.domain.models.don_xin_nghi import DonXinNghi
from src.domain.models.bang_cap_chung_chi import BangCapChungChi
from src.domain.models.cham_cong_thang import ChamCongThang
from src.domain.models.tra_luong import TraLuong


class BaoCaoRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    # === NHAN SU ===

    async def get_tong_hop_nhan_su(
        self,
        phong_ban_id: Optional[str] = None,
        loai_nhan_vien: Optional[str] = None,
    ) -> Dict[str, Any]:
        conditions = [NhanVien.deleted_at.is_(None)]
        if phong_ban_id:
            conditions.append(NhanVien.phong_ban_id == phong_ban_id)
        if loai_nhan_vien:
            conditions.append(NhanVien.loai_nhan_vien == loai_nhan_vien)

        tong = await self._session.scalar(
            select(func.count(NhanVien.id)).where(and_(*conditions))
        )

        dang_lam = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.trang_thai == "dang_lam")
            )
        )
        nghi_viec = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.trang_thai == "nghi_viec")
            )
        )
        nghi_huu = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.trang_thai == "nghi_huu")
            )
        )

        nam_count = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nam")
            )
        )
        nu_count = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nữ")
            )
        )
        khac_count = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh.notin_(["Nam", "Nữ"]))
            )
        )

        giao_vien = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.loai_nhan_vien == "giao_vien")
            )
        )
        can_bo = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.loai_nhan_vien == "can_bo")
            )
        )
        nhan_vien_count = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.loai_nhan_vien == "nhan_vien")
            )
        )

        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.count(NhanVien.id).label("so_luong"),
            )
            .outerjoin(NhanVien, NhanVien.phong_ban_id == PhongBan.id)
            .where(
                PhongBan.deleted_at.is_(None),
                PhongBan.trang_thai == True,
                NhanVien.deleted_at.is_(None),
            )
            .group_by(PhongBan.id)
            .order_by(func.count(NhanVien.id).desc())
        )
        dept_result = await self._session.execute(dept_stmt)
        theo_phong_ban = [
            {"ten_phong_ban": row[0], "so_luong": row[1]} for row in dept_result.all()
        ]

        return {
            "tong_nhan_vien": tong or 0,
            "dang_lam": dang_lam or 0,
            "nghi_viec": nghi_viec or 0,
            "nghi_huu": nghi_huu or 0,
            "theo_gioi_tinh": {
                "nam": nam_count or 0,
                "nu": nu_count or 0,
                "khac": khac_count or 0,
            },
            "theo_loai_nv": {
                "giao_vien": giao_vien or 0,
                "can_bo": can_bo or 0,
                "nhan_vien": nhan_vien_count or 0,
            },
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_demo_graphics(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        conditions = [NhanVien.deleted_at.is_(None)]
        if phong_ban_id:
            conditions.append(NhanVien.phong_ban_id == phong_ban_id)

        nam_count = (
            await self._session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*conditions, NhanVien.gioi_tinh == "Nam")
                )
            )
            or 0
        )
        nu_count = (
            await self._session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(*conditions, NhanVien.gioi_tinh == "Nữ")
                )
            )
            or 0
        )

        gioi_tinh = []
        if nam_count > 0:
            gioi_tinh.append({"name": "Nam", "value": nam_count})
        if nu_count > 0:
            gioi_tinh.append({"name": "Nữ", "value": nu_count})

        age_result = await self._session.execute(
            text("""
                SELECT 
                    CASE 
                        WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) < 25 THEN 'Dưới 25'
                        WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 25 AND 30 THEN '25-30'
                        WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 31 AND 40 THEN '31-40'
                        WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 41 AND 50 THEN '41-50'
                        WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 51 AND 60 THEN '51-60'
                        ELSE 'Trên 60'
                    END as nhom_tuoi,
                    COUNT(*) as so_luong
                FROM nhan_vien
                WHERE deleted_at IS NULL
                GROUP BY nhom_tuoi
                ORDER BY nhom_tuoi
            """)
        )
        do_tuoi = [{"name": row[0], "value": row[1]} for row in age_result]

        loai_nv_result = await self._session.execute(
            select(NhanVien.loai_nhan_vien, func.count(NhanVien.id).label("so_luong"))
            .where(and_(*conditions))
            .group_by(NhanVien.loai_nhan_vien)
            .order_by(func.count(NhanVien.id).desc())
        )
        loai_labels = {
            "giao_vien": "Giáo viên",
            "can_bo": "Cán bộ",
            "nhan_vien": "Nhân viên",
        }
        loai_nhan_vien = [
            {"name": loai_labels.get(row[0], row[0]), "value": row[1]}
            for row in loai_nv_result.all()
        ]

        return {
            "gioi_tinh": gioi_tinh,
            "do_tuoi": do_tuoi,
            "loai_nhan_vien": loai_nhan_vien,
        }

    async def get_trinh_do(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        nv_conditions = [NhanVien.deleted_at.is_(None)]
        if phong_ban_id:
            nv_conditions.append(NhanVien.phong_ban_id == phong_ban_id)

        nv_ids_subquery = select(NhanVien.id).where(and_(*nv_conditions))

        bang_cap_stmt = (
            select(
                BangCapChungChi.ten_bang,
                func.count(BangCapChungChi.id).label("so_luong"),
            )
            .where(BangCapChungChi.nhan_vien_id.in_(nv_ids_subquery))
            .group_by(BangCapChungChi.ten_bang)
            .order_by(func.count(BangCapChungChi.id).desc())
        )
        bang_cap_result = await self._session.execute(bang_cap_stmt)
        trinh_do_hoc_van = [
            {"name": row[0] or "Khác", "value": row[1]} for row in bang_cap_result.all()
        ]

        chuyen_nganh_stmt = (
            select(
                BangCapChungChi.chuyen_nganh,
                func.count(BangCapChungChi.id).label("so_luong"),
            )
            .where(
                BangCapChungChi.nhan_vien_id.in_(nv_ids_subquery),
                BangCapChungChi.chuyen_nganh.isnot(None),
            )
            .group_by(BangCapChungChi.chuyen_nganh)
            .order_by(func.count(BangCapChungChi.id).desc())
        )
        chuyen_nganh_result = await self._session.execute(chuyen_nganh_stmt)
        chuyen_mon = [
            {"name": row[0], "value": row[1]} for row in chuyen_nganh_result.all()
        ]

        return {
            "trinh_do_hoc_van": trinh_do_hoc_van,
            "chuyen_mon": chuyen_mon,
        }

    async def get_bien_dong_nhan_su(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        now = get_utc_now()
        thang = thang or now.month
        nam = nam or now.year

        base_conditions = [NhanVien.deleted_at.is_(None)]

        tong_vao = (
            await self._session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        *base_conditions,
                        extract("month", NhanVien.ngay_vao_lam) == thang,
                        extract("year", NhanVien.ngay_vao_lam) == nam,
                    )
                )
            )
            or 0
        )

        tong_ra = (
            await self._session.scalar(
                select(func.count(NhanVien.id)).where(
                    and_(
                        NhanVien.deleted_at.isnot(None),
                        extract("month", NhanVien.deleted_at) == thang,
                        extract("year", NhanVien.deleted_at) == nam,
                    )
                )
            )
            or 0
        )

        tong_chuyen = 0

        theo_thang_result = await self._session.execute(
            text("""
                SELECT TO_CHAR(ngay_vao_lam, 'YYYY-MM') as thang,
                       COUNT(*) as vao
                FROM nhan_vien
                WHERE deleted_at IS NULL AND ngay_vao_lam IS NOT NULL
                GROUP BY thang
                ORDER BY thang DESC
                LIMIT 12
            """)
        )
        vao_map = {row[0]: row[1] for row in theo_thang_result.all()}

        ra_result = await self._session.execute(
            text("""
                SELECT TO_CHAR(deleted_at, 'YYYY-MM') as thang,
                       COUNT(*) as ra
                FROM nhan_vien
                WHERE deleted_at IS NOT NULL
                GROUP BY thang
                ORDER BY thang DESC
                LIMIT 12
            """)
        )
        ra_map = {row[0]: row[1] for row in ra_result.all()}

        all_thangs = sorted(
            set(list(vao_map.keys()) + list(ra_map.keys())), reverse=True
        )[:12]

        theo_thang = [
            {"thang": t, "vao": vao_map.get(t, 0), "ra": ra_map.get(t, 0)}
            for t in sorted(all_thangs)
        ]

        ly_do = []
        if tong_ra > 0:
            ly_do.append({"ly_do": "Nghỉ việc", "so_luong": tong_ra})
        if tong_chuyen > 0:
            ly_do.append({"ly_do": "Chuyển công tác", "so_luong": tong_chuyen})
        if tong_vao > 0:
            ly_do.append({"ly_do": "Nhân viên mới", "so_luong": tong_vao})

        return {
            "tong_vao": tong_vao,
            "tong_ra": tong_ra,
            "tong_chuyen": tong_chuyen,
            "ly_do": ly_do,
            "theo_thang": theo_thang,
        }

    # === CHAM CONG ===

    async def get_tong_hop_cham_cong(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        now = get_utc_now()
        thang = thang or now.month
        nam = nam or now.year

        conditions = [
            ChamCongThang.thang == thang,
            ChamCongThang.nam == nam,
        ]
        if phong_ban_id:
            nv_ids = select(NhanVien.id).where(NhanVien.phong_ban_id == phong_ban_id)
            conditions.append(ChamCongThang.nhan_vien_id.in_(nv_ids))

        tong_co_mat = (
            await self._session.scalar(
                select(func.sum(ChamCongThang.so_ngay_co_mat)).where(and_(*conditions))
            )
            or 0
        )

        tong_chuan = (
            await self._session.scalar(
                select(func.sum(ChamCongThang.so_ngay_lam_chuan)).where(
                    and_(*conditions)
                )
            )
            or 0
        )

        tong_nhan_vien = (
            await self._session.scalar(
                select(func.count(ChamCongThang.id)).where(and_(*conditions))
            )
            or 0
        )

        ty_le_co_mat = (
            round((float(tong_co_mat) / max(float(tong_chuan), 1)) * 100, 1)
            if tong_chuan
            else 0
        )

        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.sum(ChamCongThang.so_ngay_co_mat).label("co_mat"),
                func.sum(ChamCongThang.so_ngay_lam_chuan).label("chuan"),
                func.count(ChamCongThang.id).label("so_nv"),
            )
            .join(NhanVien, ChamCongThang.nhan_vien_id == NhanVien.id)
            .join(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(*conditions, PhongBan.deleted_at.is_(None)))
            .group_by(PhongBan.id)
        )
        dept_result = await self._session.execute(dept_stmt)
        theo_phong_ban = [
            {
                "phong_ban": row[0],
                "co_mat": int(row[1] or 0),
                "chuan": int(row[2] or 0),
                "so_nv": row[3],
                "ty_le": round(
                    (float(row[1] or 0) / max(float(row[2] or 1), 1)) * 100, 1
                ),
            }
            for row in dept_result.all()
        ]

        return {
            "tong_co_mat": int(tong_co_mat),
            "tong_chuan": int(tong_chuan),
            "tong_nhan_vien": tong_nhan_vien,
            "ty_le_co_mat": ty_le_co_mat,
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_nghi_phep_report(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        now = get_utc_now()
        thang = thang or now.month
        nam = nam or now.year

        conditions = [
            extract("month", DonXinNghi.tu_ngay) == thang,
            extract("year", DonXinNghi.tu_ngay) == nam,
        ]

        tong_don = (
            await self._session.scalar(
                select(func.count(DonXinNghi.id)).where(and_(*conditions))
            )
            or 0
        )
        da_duyet = (
            await self._session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    and_(*conditions, DonXinNghi.trang_thai == "da_duyet")
                )
            )
            or 0
        )
        cho_duyet = (
            await self._session.scalar(
                select(func.count(DonXinNghi.id)).where(
                    and_(*conditions, DonXinNghi.trang_thai == "cho_duyet")
                )
            )
            or 0
        )

        tong_ngay_nghi_result = await self._session.execute(
            select(func.sum(DonXinNghi.so_ngay)).where(
                and_(*conditions, DonXinNghi.trang_thai == "da_duyet")
            )
        )
        tong_ngay_nghi = tong_ngay_nghi_result.scalar() or 0

        loai_labels = {
            "nghi_phep_nam": "Nghỉ phép năm",
            "nghi_om": "Nghỉ ốm",
            "nghi_viec_rieng": "Việc riêng",
            "nghi_huu": "Nghỉ hưu",
            "nghi_khac": "Khác",
        }
        loai_stmt = (
            select(
                DonXinNghi.loai_nghi,
                func.count(DonXinNghi.id).label("so_luong"),
            )
            .where(and_(*conditions))
            .group_by(DonXinNghi.loai_nghi)
        )
        loai_result = await self._session.execute(loai_stmt)
        theo_ly_do = [
            {"name": loai_labels.get(row[0], row[0]), "value": row[1]}
            for row in loai_result.all()
        ]

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            so_don = (
                await self._session.scalar(
                    select(func.count(DonXinNghi.id)).where(
                        and_(
                            extract("month", DonXinNghi.tu_ngay) == m,
                            extract("year", DonXinNghi.tu_ngay) == y,
                        )
                    )
                )
                or 0
            )
            so_ngay = (
                await self._session.scalar(
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
                    "so_don": so_don,
                    "so_ngay": int(so_ngay),
                }
            )

        return {
            "tong_don": tong_don,
            "da_duyet": da_duyet,
            "cho_duyet": cho_duyet,
            "tong_ngay_nghi": int(tong_ngay_nghi),
            "theo_ly_do": theo_ly_do,
            "theo_thang": theo_thang,
        }

    # === LUONG ===

    async def get_chi_phi_nhan_su(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        now = get_utc_now()
        thang = thang or now.month
        nam = nam or now.year

        conditions = [
            TraLuong.thang == thang,
            TraLuong.nam == nam,
        ]
        if phong_ban_id:
            nv_ids = select(NhanVien.id).where(NhanVien.phong_ban_id == phong_ban_id)
            conditions.append(TraLuong.nhan_vien_id.in_(nv_ids))

        tong_chi_phi = (
            await self._session.scalar(
                select(func.sum(TraLuong.tong_thu_nhap)).where(and_(*conditions))
            )
            or 0
        )

        tong_luong_co_ban = (
            await self._session.scalar(
                select(func.sum(TraLuong.luong_co_ban)).where(and_(*conditions))
            )
            or 0
        )

        so_nhan_vien = (
            await self._session.scalar(
                select(func.count(TraLuong.id)).where(and_(*conditions))
            )
            or 0
        )

        chi_phi_tb = round(float(tong_chi_phi) / max(so_nhan_vien, 1), 0)

        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.sum(TraLuong.tong_thu_nhap).label("chi_phi"),
                func.count(TraLuong.id).label("so_nv"),
            )
            .join(NhanVien, TraLuong.nhan_vien_id == NhanVien.id)
            .join(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(*conditions, PhongBan.deleted_at.is_(None)))
            .group_by(PhongBan.id)
        )
        dept_result = await self._session.execute(dept_stmt)
        theo_phong_ban = [
            {
                "phong_ban": row[0],
                "chi_phi": float(row[1] or 0),
                "so_nv": row[2],
            }
            for row in dept_result.all()
        ]

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            chi_phi_thang = (
                await self._session.scalar(
                    select(func.sum(TraLuong.tong_thu_nhap)).where(
                        and_(TraLuong.thang == m, TraLuong.nam == y)
                    )
                )
                or 0
            )
            theo_thang.append(
                {
                    "thang": f"{y}-{m:02d}",
                    "chi_phi": float(chi_phi_thang),
                }
            )

        return {
            "tong_chi_phi": float(tong_chi_phi),
            "tong_luong_co_ban": float(tong_luong_co_ban),
            "so_nhan_vien": so_nhan_vien,
            "chi_phi_tb": float(chi_phi_tb),
            "theo_phong_ban": theo_phong_ban,
            "theo_thang": theo_thang,
        }

    async def get_thue_bhxh(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        now = get_utc_now()
        thang = thang or now.month
        nam = nam or now.year

        conditions = [
            TraLuong.thang == thang,
            TraLuong.nam == nam,
        ]

        tong_thue_tncn = (
            await self._session.scalar(
                select(func.sum(TraLuong.thue_tncn)).where(and_(*conditions))
            )
            or 0
        )

        tong_bhxh = (
            await self._session.scalar(
                select(func.sum(TraLuong.bhxh)).where(and_(*conditions))
            )
            or 0
        )

        tong_bhyt = (
            await self._session.scalar(
                select(func.sum(TraLuong.bhyt)).where(and_(*conditions))
            )
            or 0
        )

        tong_cong = float(tong_bhxh) + float(tong_bhyt) + float(tong_thue_tncn)

        phan_bo = []
        if tong_bhxh > 0:
            phan_bo.append({"name": "BHXH", "value": float(tong_bhxh)})
        if tong_bhyt > 0:
            phan_bo.append({"name": "BHYT", "value": float(tong_bhyt)})
        if tong_thue_tncn > 0:
            phan_bo.append({"name": "Thuế TNCN", "value": float(tong_thue_tncn)})

        theo_thang = []
        for i in range(5, -1, -1):
            m = thang - i
            y = nam
            while m <= 0:
                m += 12
                y -= 1
            m_bhxh = (
                await self._session.scalar(
                    select(func.sum(TraLuong.bhxh)).where(
                        and_(TraLuong.thang == m, TraLuong.nam == y)
                    )
                )
                or 0
            )
            m_bhyt = (
                await self._session.scalar(
                    select(func.sum(TraLuong.bhyt)).where(
                        and_(TraLuong.thang == m, TraLuong.nam == y)
                    )
                )
                or 0
            )
            m_thue = (
                await self._session.scalar(
                    select(func.sum(TraLuong.thue_tncn)).where(
                        and_(TraLuong.thang == m, TraLuong.nam == y)
                    )
                )
                or 0
            )
            theo_thang.append(
                {
                    "thang": f"{y}-{m:02d}",
                    "bhxh": float(m_bhxh),
                    "bhyt": float(m_bhyt),
                    "thue": float(m_thue),
                }
            )

        return {
            "tong_bhxh": float(tong_bhxh),
            "tong_bhyt": float(tong_bhyt),
            "tong_thue_tncn": float(tong_thue_tncn),
            "tong_cong": tong_cong,
            "phan_bo": phan_bo,
            "theo_thang": theo_thang,
        }
