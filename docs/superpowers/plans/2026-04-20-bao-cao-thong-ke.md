# Báo cáo & Thống kê Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng module Báo cáo & Thống kê cho admin với 9 báo cáo (Nhân sự, Chấm công, Lương), có lọc đa tiêu chí, xem biểu đồ online, và export Excel/PDF.

**Architecture:** API endpoints riêng cho từng báo cáo (Phương án 1), mỗi UseCase xử lý một báo cáo cụ thể, dùng chung BaoCaoRepository cho aggregation queries. Frontend: trang `/bao-cao` với tabs, dùng shadcn Chart components.

**Tech Stack:** Backend: FastAPI + SQLAlchemy 2.0 + openpyxl + reportlab. Frontend: Next.js 16 + React + TanStack Query + shadcn Chart (Recharts).

---

## Backend Implementation

### Task 1: Tạo BaoCaoRepository

**Files:**
- Create: `backend/src/repository/bao_cao_repository.py`

- [ ] **Step 1: Tạo file bao_cao_repository.py**

```python
# backend/src/repository/bao_cao_repository.py
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from sqlalchemy import select, func, and_, or_, extract
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.models.nhan_vien import NhanVien
from src.domain.models.phong_ban import PhongBan
from src.domain.models.don_xin_nghi import DonXinNghi
from src.domain.models.bang_cap_chung_chi import BangCapChungChi
from src.domain.models.cham_cong_thang import ChamCongThang
from src.domain.models.tra_luong import TraLuong
from src.domain.models.luong import Luong


class BaoCaoRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    # === NHAN SU ===
    
    async def get_tong_hop_nhan_su(
        self,
        phong_ban_id: Optional[str] = None,
        loai_nhan_vien: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Tổng hợp nhân sự."""
        conditions = [NhanVien.deleted_at.is_(None)]
        if phong_ban_id:
            conditions.append(NhanVien.phong_ban_id == phong_ban_id)
        if loai_nhan_vien:
            conditions.append(NhanVien.loai_nhan_vien == loai_nhan_vien)

        # Total
        tong = await self._session.scalar(
            select(func.count(NhanVien.id)).where(and_(*conditions))
        )

        # By status
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

        # By gender
        nam = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nam")
            )
        )
        nu = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nữ")
            )
        )
        khac = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh.notin_(["Nam", "Nữ"]))
            )
        )

        # By type
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
        nhan_vien = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.loai_nhan_vien == "nhan_vien")
            )
        )

        # By department
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
            {"ten_phong_ban": row[0], "so_luong": row[1]}
            for row in dept_result.all()
        ]

        return {
            "tong_nhan_vien": tong or 0,
            "dang_lam": dang_lam or 0,
            "nghi_viec": nghi_viec or 0,
            "nghi_huu": nghi_huu or 0,
            "theo_gioi_tinh": {"nam": nam or 0, "nu": nu or 0, "khac": khac or 0},
            "theo_loai_nv": {
                "giao_vien": giao_vien or 0,
                "can_bo": can_bo or 0,
                "nhan_vien": nhan_vien or 0,
            },
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_demo_graphics(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Demographics: tuổi, giới tính, dân tộc, tôn giáo."""
        conditions = [NhanVien.deleted_at.is_(None)]
        if phong_ban_id:
            conditions.append(NhanVien.phong_ban_id == phong_ban_id)

        # Age groups (calculate from ngay_sinh)
        # Using raw SQL for age calculation is more efficient
        from sqlalchemy import text
        
        age_query = text("""
            SELECT 
                CASE 
                    WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) < 25 THEN 'Dưới 25'
                    WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 25 AND 30 THEN '25-30'
                    WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 31 AND 40 THEN '31-40'
                    WHEN EXTRACT(YREEK FROM AGE(ngay_sinh)) BETWEEN 41 AND 50 THEN '41-50'
                    WHEN EXTRACT(YEAR FROM AGE(ngay_sinh)) BETWEEN 51 AND 60 THEN '51-60'
                    ELSE 'Trên 60'
                END as nhom_tuoi,
                gioi_tinh,
                COUNT(*) as so_luong
            FROM nhan_vien
            WHERE deleted_at IS NULL
            GROUP BY nhom_tuoi, gioi_tinh
            ORDER BY nhom_tuoi, gioi_tinh
        """)
        age_result = await self._session.execute(age_query)
        
        phan_bo_tuoi = []
        for row in age_result:
            phan_bo_tuoi.append({
                "nhom_tuoi": row[0],
                "gioi_tinh": row[1],
                "so_luong": row[2],
            })

        # Average age
        avg_age_result = await self._session.execute(
            text("SELECT AVG(EXTRACT(YEAR FROM AGE(ngay_sinh))) FROM nhan_vien WHERE deleted_at IS NULL")
        )
        tuoi_trung_binh = avg_age_result.scalar() or 0

        # By gender
        nam = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nam")
            )
        )
        nu = await self._session.scalar(
            select(func.count(NhanVien.id)).where(
                and_(*conditions, NhanVien.gioi_tinh == "Nữ")
            )
        )

        # By dan toc
        dan_toc_stmt = (
            select(NhanVien.dan_toc, func.count(NhanVien.id).label("so_luong"))
            .where(and_(*conditions, NhanVien.dan_toc.isnot(None)))
            .group_by(NhanVien.dan_toc)
            .order_by(func.count(NhanVien.id).desc())
        )
        dan_toc_result = await self._session.execute(dan_toc_stmt)
        theo_dan_toc = [
            {"dan_toc": row[0], "so_luong": row[1]}
            for row in dan_toc_result.all()
        ]

        # By ton giao
        ton_giao_stmt = (
            select(NhanVien.ton_giao, func.count(NhanVien.id).label("so_luong"))
            .where(and_(*conditions, NhanVien.ton_giao.isnot(None)))
            .group_by(NhanVien.ton_giao)
            .order_by(func.count(NhanVien.id).desc())
        )
        ton_giao_result = await self._session.execute(ton_giao_stmt)
        theo_ton_giao = [
            {"ton_giao": row[0], "so_luong": row[1]}
            for row in ton_giao_result.all()
        ]

        return {
            "phan_bo_tuoi": phan_bo_tuoi,
            "tuoi_trung_binh": round(float(tuoi_trung_binh), 1),
            "theo_gioi_tinh": {
                "nam": nam or 0,
                "nu": nu or 0,
                "phan_tram_nam": round((nam or 0) / (tong or 1) * 100, 1),
                "phan_tram_nu": round((nu or 0) / (tong or 1) * 100, 1),
            },
            "theo_dan_toc": theo_dan_toc,
            "theo_ton_giao": theo_ton_giao,
        }

    async def get_trinh_do(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Trình độ chuyên môn."""
        conditions = [BangCapChungChi.deleted_at.is_(None)]
        if phong_ban_id:
            conditions.append(BangCapChungChi.nhan_vien_id.in_(
                select(NhanVien.id).where(NhanVien.phong_ban_id == phong_ban_id)
            ))

        # By degree
        bang_cap_stmt = (
            select(
                BangCapChungChi.ten_bang,
                func.count(BangCapChungChi.id).label("so_luong"),
            )
            .where(and_(*conditions))
            .group_by(BangCapChungChi.ten_bang)
            .order_by(func.count(BangCapChungChi.id).desc())
        )
        bang_cap_result = await self._session.execute(bang_cap_stmt)
        theo_bang_cap = [
            {"ten_bang": row[0], "so_luong": row[1]}
            for row in bang_cap_result.all()
        ]

        # By chuyen nganh
        chuyen_nganh_stmt = (
            select(
                BangCapChungChi.chuyen_nganh,
                func.count(BangCapChungChi.id).label("so_luong"),
            )
            .where(and_(*conditions, BangCapChungChi.chuyen_nganh.isnot(None)))
            .group_by(BangCapChungChi.chuyen_nganh)
            .order_by(func.count(BangCapChungChi.id).desc())
        )
        chuyen_nganh_result = await self._session.execute(chuyen_nganh_stmt)
        theo_chuyen_nganh = [
            {"chuyen_nganh": row[0], "so_luong": row[1]}
            for row in chuyen_nganh_result.all()
        ]

        # By salary grade
        bac_luong_stmt = (
            select(
                NhanVien.bac_luong,
                func.count(NhanVien.id).label("so_luong"),
            )
            .where(and_(*conditions, NhanVien.bac_luong.isnot(None)))
            .group_by(NhanVien.bac_luong)
            .order_by(NhanVien.bac_luong)
        )
        bac_luong_result = await self._session.execute(bac_luong_stmt)
        phan_bo_bac_luong = [
            {"bac_luong": row[0], "so_luong": row[1]}
            for row in bac_luong_result.all()
        ]

        return {
            "theo_bang_cap": theo_bang_cap,
            "theo_chuyen_nganh": theo_chuyen_nganh,
            "phan_bo_bac_luong": phan_bo_bac_luong,
        }

    async def get_bien_dong_nhan_su(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Biến động nhân sự theo kỳ."""
        from datetime import datetime
        
        if not thang or not nam:
            now = datetime.utcnow()
            thang = thang or now.month
            nam = nam or now.year

        # Current period stats
        current_conditions = [
            NhanVien.deleted_at.is_(None),
            extract("month", NhanVien.created_at) == thang,
            extract("year", NhanVien.created_at) == nam,
        ]
        
        tong_hien_tai = await self._session.scalar(
            select(func.count(NhanVien.id)).where(and_(*current_conditions))
        )
        
        # Previous period
        prev_thang = thang - 1 if thang > 1 else 12
        prev_nam = nam if thang > 1 else nam - 1
        
        prev_conditions = [
            NhanVien.deleted_at.is_(None),
            extract("month", NhanVien.created_at) == prev_thang,
            extract("year", NhanVien.created_at) == prev_nam,
        ]
        
        tong_ky_truoc = await self._session.scalar(
            select(func.count(NhanVien.id)).where(and_(*prev_conditions))
        )

        bien_dong = (tong_hien_tai or 0) - (tong_ky_truoc or 0)

        return {
            "ky_truoc": {"tong": tong_ky_truoc or 0},
            "ky_hien_tai": {"tong": tong_hien_tai or 0},
            "bien_dong": {
                "tang": max(0, bien_dong),
                "giam": max(0, -bien_dong),
                "phan_tram_thay_doi": round((bien_dong / (tong_ky_truoc or 1)) * 100, 1) if tong_ky_truoc else 0,
            },
        }

    # === CHAM CONG ===

    async def get_tong_hop_cham_cong(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Tổng hợp chấm công."""
        from datetime import datetime
        
        if not thang or not nam:
            now = datetime.utcnow()
            thang = thang or now.month
            nam = nam or now.year

        conditions = [
            ChamCongThang.thang == thang,
            ChamCongThang.nam == nam,
        ]
        if phong_ban_id:
            conditions.append(ChamCongThang.nhan_vien_id.in_(
                select(NhanVien.id).where(NhanVien.phong_ban_id == phong_ban_id)
            ))

        tong_so_nhan_vien = await self._session.scalar(
            select(func.count(ChamCongThang.id)).where(and_(*conditions))
        )

        # Average work days
        avg_cong_result = await self._session.execute(
            select(func.avg(ChamCongThang.so_ngay_co_mat)).where(and_(*conditions))
        )
        tb_ngay_cong = avg_cong_result.scalar() or 0

        # By department
        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.avg(ChamCongThang.so_ngay_co_mat).label("tb_ngay_cong"),
            )
            .join(NhanVien, ChamCongThang.nhan_vien_id == NhanVien.id)
            .join(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(*conditions, PhongBan.deleted_at.is_(None)))
            .group_by(PhongBan.id)
        )
        dept_result = await self._session.execute(dept_stmt)
        theo_phong_ban = [
            {"ten_phong_ban": row[0], "tb_ngay_cong": float(row[1] or 0)}
            for row in dept_result.all()
        ]

        return {
            "tong_so_nhan_vien": tong_so_nhan_vien or 0,
            "tb_ngay_cong": round(float(tb_ngay_cong), 1),
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_nghi_phep_report(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Báo cáo nghỉ phép."""
        from datetime import datetime
        
        if not thang or not nam:
            now = datetime.utcnow()
            thang = thang or now.month
            nam = nam or now.year

        conditions = [
            extract("month", DonXinNghi.tu_ngay) == thang,
            extract("year", DonXinNghi.tu_ngay) == nam,
        ]

        tong_don = await self._session.scalar(
            select(func.count(DonXinNghi.id)).where(and_(*conditions))
        )

        da_duyet = await self._session.scalar(
            select(func.count(DonXinNghi.id)).where(
                and_(*conditions, DonXinNghi.trang_thai == "da_duyet")
            )
        )

        tu_choi = await self._session.scalar(
            select(func.count(DonXinNghi.id)).where(
                and_(*conditions, DonXinNghi.trang_thai == "tu_choi")
            )
        )

        cho_duyet = await self._session.scalar(
            select(func.count(DonXinNghi.id)).where(
                and_(*conditions, DonXinNghi.trang_thai == "cho_duyet")
            )
        )

        # By leave type
        loai_stmt = (
            select(
                DonXinNghi.loai_nghi,
                func.count(DonXinNghi.id).label("so_luong"),
            )
            .where(and_(*conditions))
            .group_by(DonXinNghi.loai_nghi)
        )
        loai_result = await self._session.execute(loai_stmt)
        theo_loai_nghi = [
            {"loai": row[0], "so_luong": row[1]}
            for row in loai_result.all()
        ]

        return {
            "tong_don": tong_don or 0,
            "da_duyet": da_duyet or 0,
            "tu_choi": tu_choi or 0,
            "cho_duyet": cho_duyet or 0,
            "theo_loai_nghi": theo_loai_nghi,
        }

    # === LUONG ===

    async def get_chi_phi_nhan_su(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Chi phí nhân sự."""
        from datetime import datetime
        
        if not thang or not nam:
            now = datetime.utcnow()
            thang = thang or now.month
            nam = nam or now.year

        conditions = [
            TraLuong.thang == thang,
            TraLuong.nam == nam,
        ]
        if phong_ban_id:
            conditions.append(TraLuong.nhan_vien_id.in_(
                select(NhanVien.id).where(NhanVien.phong_ban_id == phong_ban_id)
            ))

        # Total cost
        tong_chi_phi_result = await self._session.execute(
            select(func.sum(TraLuong.tong_thu_nhap)).where(and_(*conditions))
        )
        tong_chi_phi = tong_chi_phi_result.scalar() or 0

        # Average salary
        avg_luong_result = await self._session.execute(
            select(func.avg(TraLuong.luong_thuc_nhan)).where(and_(*conditions))
        )
        tb_luong = avg_luong_result.scalar() or 0

        # Min/Max
        max_luong_result = await self._session.execute(
            select(func.max(TraLuong.luong_thuc_nhan)).where(and_(*conditions))
        )
        luong_cao_nhat = max_luong_result.scalar() or 0

        min_luong_result = await self._session.execute(
            select(func.min(TraLuong.luong_thuc_nhan)).where(and_(*conditions))
        )
        luong_thap_nhat = min_luong_result.scalar() or 0

        # By department
        dept_stmt = (
            select(
                PhongBan.ten_phong_ban,
                func.sum(TraLuong.tong_thu_nhap).label("tong_chi_phi"),
                func.avg(TraLuong.luong_thuc_nhan).label("tb_luong"),
                func.count(TraLuong.id).label("so_nhan_vien"),
            )
            .join(NhanVien, TraLuong.nhan_vien_id == NhanVien.id)
            .join(PhongBan, NhanVien.phong_ban_id == PhongBan.id)
            .where(and_(*conditions, PhongBan.deleted_at.is_(None)))
            .group_by(PhongBan.id)
        )
        dept_result = await self._session.execute(dept_stmt)
        theo_phong_ban = [
            {
                "ten_phong_ban": row[0],
                "tong_chi_phi": float(row[1] or 0),
                "tb_luong": float(row[2] or 0),
                "so_nhan_vien": row[3],
            }
            for row in dept_result.all()
        ]

        return {
            "tong_chi_phi": float(tong_chi_phi),
            "tb_luong": float(tb_luong),
            "luong_cao_nhat": float(luong_cao_nhat),
            "luong_thap_nhat": float(luong_thap_nhat),
            "theo_phong_ban": theo_phong_ban,
        }

    async def get_thue_bhxh(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Thuế & BHXH."""
        from datetime import datetime
        
        if not thang or not nam:
            now = datetime.utcnow()
            thang = thang or now.month
            nam = nam or now.year

        conditions = [
            TraLuong.thang == thang,
            TraLuong.nam == nam,
        ]

        # Tax
        tong_thue_result = await self._session.execute(
            select(func.sum(TraLuong.thue_tncn)).where(and_(*conditions))
        )
        tong_thue_tncn = tong_thue_result.scalar() or 0

        # BHXH
        bhxh_nv_result = await self._session.execute(
            select(func.sum(TraLuong.bhxh)).where(and_(*conditions))
        )
        tong_bhxh_nv = bhxh_nv_result.scalar() or 0

        # BHYT
        bhyt_nv_result = await self._session.execute(
            select(func.sum(TraLuong.bhyt)).where(and_(*conditions))
        )
        tong_bhyt_nv = bhyt_nv_result.scalar() or 0

        return {
            "tong_thue_tncn": float(tong_thue_tncn),
            "tong_bhxh_nv": float(tong_bhxh_nv),
            "tong_bhyt_nv": float(tong_bhyt_nv),
        }
```

- [ ] **Step 2: Thêm vào unit_of_work.py**

Modify: `backend/src/service/unit_of_work.py`

Thêm import:
```python
from src.repository.bao_cao_repository import BaoCaoRepository
```

Thêm vào class UnitOfWork properties:
```python
self.bao_cao_repository: BaoCaoRepository
```

Thêm vào __aenter__:
```python
self.bao_cao_repository = BaoCaoRepository(session=self._session)
```

- [ ] **Step 3: Commit**

```bash
cd /home/enles04/hr_management
git add backend/src/repository/bao_cao_repository.py backend/src/service/unit_of_work.py
git commit -m "feat: add BaoCaoRepository for aggregation queries"
```

---

### Task 2: Tạo Use Cases cho Báo cáo Nhân sự

**Files:**
- Create: `backend/src/app/usecases/bao_cao/nhan_su/tong_hop_uc.py`
- Create: `backend/src/app/usecases/bao_cao/nhan_su/demo_graphics_uc.py`
- Create: `backend/src/app/usecases/bao_cao/nhan_su/trinh_do_uc.py`
- Create: `backend/src/app/usecases/bao_cao/nhan_su/bien_dong_uc.py`
- Create: `backend/src/app/usecases/bao_cao/nhan_su/__init__.py`
- Create: `backend/src/app/usecases/bao_cao/__init__.py`

- [ ] **Step 1: Tạo bao_cao/__init__.py**

```python
# backend/src/app/usecases/bao_cao/__init__.py
from .nhan_su import (
    BaoCaoNhanSuTongHopUseCase,
    BaoCaoDemoGraphicsUseCase,
    BaoCaoTrinhDoUseCase,
    BaoCaoBienDongUseCase,
)

__all__ = [
    "BaoCaoNhanSuTongHopUseCase",
    "BaoCaoDemoGraphicsUseCase",
    "BaoCaoTrinhDoUseCase",
    "BaoCaoBienDongUseCase",
]
```

- [ ] **Step 2: Tạo nhan_su/__init__.py**

```python
# backend/src/app/usecases/bao_cao/nhan_su/__init__.py
from .tong_hop_uc import BaoCaoNhanSuTongHopUseCase
from .demo_graphics_uc import BaoCaoDemoGraphicsUseCase
from .trinh_do_uc import BaoCaoTrinhDoUseCase
from .bien_dong_uc import BaoCaoBienDongUseCase

__all__ = [
    "BaoCaoNhanSuTongHopUseCase",
    "BaoCaoDemoGraphicsUseCase",
    "BaoCaoTrinhDoUseCase",
    "BaoCaoBienDongUseCase",
]
```

- [ ] **Step 3: Tạo tong_hop_uc.py**

```python
# backend/src/app/usecases/bao_cao/nhan_su/tong_hop_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoNhanSuTongHopResult:
    tong_nhan_vien: int
    dang_lam: int
    nghi_viec: int
    nghi_huu: int
    theo_gioi_tinh: Dict[str, int]
    theo_loai_nv: Dict[str, int]
    theo_phong_ban: List[Dict[str, Any]]


class BaoCaoNhanSuTongHopUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
        loai_nhan_vien: Optional[str] = None,
    ) -> Result[BaoCaoNhanSuTongHopResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_tong_hop_nhan_su(
                phong_ban_id=phong_ban_id,
                loai_nhan_vien=loai_nhan_vien,
            )

            return Return.ok(
                BaoCaoNhanSuTongHopResult(
                    tong_nhan_vien=data["tong_nhan_vien"],
                    dang_lam=data["dang_lam"],
                    nghi_viec=data["nghi_viec"],
                    nghi_huu=data["nghi_huu"],
                    theo_gioi_tinh=data["theo_gioi_tinh"],
                    theo_loai_nv=data["theo_loai_nv"],
                    theo_phong_ban=data["theo_phong_ban"],
                )
            )
```

- [ ] **Step 4: Tạo demo_graphics_uc.py**

```python
# backend/src/app/usecases/bao_cao/nhan_su/demo_graphics_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoDemoGraphicsResult:
    phan_bo_tuoi: List[Dict[str, Any]]
    tuoi_trung_binh: float
    theo_gioi_tinh: Dict[str, Any]
    theo_dan_toc: List[Dict[str, Any]]
    theo_ton_giao: List[Dict[str, Any]]


class BaoCaoDemoGraphicsUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoDemoGraphicsResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_demo_graphics(
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoDemoGraphicsResult(
                    phan_bo_tuoi=data["phan_bo_tuoi"],
                    tuoi_trung_binh=data["tuoi_trung_binh"],
                    theo_gioi_tinh=data["theo_gioi_tinh"],
                    theo_dan_toc=data["theo_dan_toc"],
                    theo_ton_giao=data["theo_ton_giao"],
                )
            )
```

- [ ] **Step 5: Tạo trinh_do_uc.py**

```python
# backend/src/app/usecases/bao_cao/nhan_su/trinh_do_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoTrinhDoResult:
    theo_bang_cap: List[Dict[str, Any]]
    theo_chuyen_nganh: List[Dict[str, Any]]
    phan_bo_bac_luong: List[Dict[str, Any]]


class BaoCaoTrinhDoUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoTrinhDoResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_trinh_do(
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoTrinhDoResult(
                    theo_bang_cap=data["theo_bang_cap"],
                    theo_chuyen_nganh=data["theo_chuyen_nganh"],
                    phan_bo_bac_luong=data["phan_bo_bac_luong"],
                )
            )
```

- [ ] **Step 6: Tạo bien_dong_uc.py**

```python
# backend/src/app/usecases/bao_cao/nhan_su/bien_dong_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any
from libs.result import Result, Error, Return


@dataclass
class BaoCaoBienDongResult:
    ky_truoc: Dict[str, Any]
    ky_hien_tai: Dict[str, Any]
    bien_dong: Dict[str, Any]


class BaoCaoBienDongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoBienDongResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_bien_dong_nhan_su(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoBienDongResult(
                    ky_truoc=data["ky_truoc"],
                    ky_hien_tai=data["ky_hien_tai"],
                    bien_dong=data["bien_dong"],
                )
            )
```

- [ ] **Step 7: Commit**

```bash
cd /home/enles04/hr_management
git add backend/src/app/usecases/bao_cao/
git commit -m "feat: add NhanSu use cases for reports"
```

---

### Task 3: Tạo Use Cases cho Báo cáo Chấm công & Lương

**Files:**
- Create: `backend/src/app/usecases/bao_cao/cham_cong/__init__.py`
- Create: `backend/src/app/usecases/bao_cao/cham_cong/tong_hop_uc.py`
- Create: `backend/src/app/usecases/bao_cao/cham_cong/nghi_phep_uc.py`
- Create: `backend/src/app/usecases/bao_cao/luong/__init__.py`
- Create: `backend/src/app/usecases/bao_cao/luong/chi_phi_uc.py`
- Create: `backend/src/app/usecases/bao_cao/luong/thue_bhxh_uc.py`

- [ ] **Step 1: Tạo cham_cong/__init__.py**

```python
# backend/src/app/usecases/bao_cao/cham_cong/__init__.py
from .tong_hop_uc import BaoCaoChamCongTongHopUseCase
from .nghi_phep_uc import BaoCaoNghiPhepUseCase

__all__ = [
    "BaoCaoChamCongTongHopUseCase",
    "BaoCaoNghiPhepUseCase",
]
```

- [ ] **Step 2: Tạo tong_hop_uc.py cho ChamCong**

```python
# backend/src/app/usecases/bao_cao/cham_cong/tong_hop_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoChamCongTongHopResult:
    tong_so_nhan_vien: int
    tb_ngay_cong: float
    theo_phong_ban: List[Dict[str, Any]]


class BaoCaoChamCongTongHopUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoChamCongTongHopResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_tong_hop_cham_cong(
                thang=thang,
                nam=nam,
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoChamCongTongHopResult(
                    tong_so_nhan_vien=data["tong_so_nhan_vien"],
                    tb_ngay_cong=data["tb_ngay_cong"],
                    theo_phong_ban=data["theo_phong_ban"],
                )
            )
```

- [ ] **Step 3: Tạo nghi_phep_uc.py**

```python
# backend/src/app/usecases/bao_cao/cham_cong/nghi_phep_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoNghiPhepResult:
    tong_don: int
    da_duyet: int
    tu_choi: int
    cho_duyet: int
    theo_loai_nghi: List[Dict[str, Any]]


class BaoCaoNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoNghiPhepResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_nghi_phep_report(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoNghiPhepResult(
                    tong_don=data["tong_don"],
                    da_duyet=data["da_duyet"],
                    tu_choi=data["tu_choi"],
                    cho_duyet=data["cho_duyet"],
                    theo_loai_nghi=data["theo_loai_nghi"],
                )
            )
```

- [ ] **Step 4: Tạo luong/__init__.py**

```python
# backend/src/app/usecases/bao_cao/luong/__init__.py
from .chi_phi_uc import BaoCaoChiPhiUseCase
from .thue_bhxh_uc import BaoCaoThueBHXHUseCase

__all__ = [
    "BaoCaoChiPhiUseCase",
    "BaoCaoThueBHXHUseCase",
]
```

- [ ] **Step 5: Tạo chi_phi_uc.py**

```python
# backend/src/app/usecases/bao_cao/luong/chi_phi_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from libs.result import Result, Error, Return


@dataclass
class BaoCaoChiPhiResult:
    tong_chi_phi: float
    tb_luong: float
    luong_cao_nhat: float
    luong_thap_nhat: float
    theo_phong_ban: List[Dict[str, Any]]


class BaoCaoChiPhiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
        phong_ban_id: Optional[str] = None,
    ) -> Result[BaoCaoChiPhiResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_chi_phi_nhan_su(
                thang=thang,
                nam=nam,
                phong_ban_id=phong_ban_id,
            )

            return Return.ok(
                BaoCaoChiPhiResult(
                    tong_chi_phi=data["tong_chi_phi"],
                    tb_luong=data["tb_luong"],
                    luong_cao_nhat=data["luong_cao_nhat"],
                    luong_thap_nhat=data["luong_thap_nhat"],
                    theo_phong_ban=data["theo_phong_ban"],
                )
            )
```

- [ ] **Step 6: Tạo thue_bhxh_uc.py**

```python
# backend/src/app/usecases/bao_cao/luong/thue_bhxh_uc.py
from dataclasses import dataclass
from typing import Optional, Dict, Any
from libs.result import Result, Error, Return


@dataclass
class BaoCaoThueBHXHResult:
    tong_thue_tncn: float
    tong_bhxh_nv: float
    tong_bhyt_nv: float


class BaoCaoThueBHXHUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self,
        thang: Optional[int] = None,
        nam: Optional[int] = None,
    ) -> Result[BaoCaoThueBHXHResult, Error]:
        async with self.unit_of_work as uow:
            data = await uow.bao_cao_repository.get_thue_bhxh(
                thang=thang,
                nam=nam,
            )

            return Return.ok(
                BaoCaoThueBHXHResult(
                    tong_thue_tncn=data["tong_thue_tncn"],
                    tong_bhxh_nv=data["tong_bhxh_nv"],
                    tong_bhyt_nv=data["tong_bhyt_nv"],
                )
            )
```

- [ ] **Step 7: Commit**

```bash
cd /home/enles04/hr_management
git add backend/src/app/usecases/bao_cao/
git commit -m "feat: add ChamCong and Luong use cases for reports"
```

---

### Task 4: Tạo API Routes cho Báo cáo

**Files:**
- Create: `backend/src/api/routes/quan_ly/bao_cao.py`
- Modify: `backend/src/api/routes/quan_ly/__init__.py`
- Modify: `backend/src/api/routes/__init__.py`

- [ ] **Step 1: Tạo bao_cao.py route**

```python
# backend/src/api/routes/quan_ly/bao_cao.py
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from libs.result import is_err
from src.api.auth import require_permission, UserContext
from src.api.depends import get_unit_of_work
from src.service.unit_of_work import UnitOfWork
from src.api.schemas.common import APIResponse
from src.api.error import ServerError
from src.app.usecases.bao_cao.nhan_su import (
    BaoCaoNhanSuTongHopUseCase,
    BaoCaoDemoGraphicsUseCase,
    BaoCaoTrinhDoUseCase,
    BaoCaoBienDongUseCase,
)
from src.app.usecases.bao_cao.cham_cong import (
    BaoCaoChamCongTongHopUseCase,
    BaoCaoNghiPhepUseCase,
)
from src.app.usecases.bao_cao.luong import (
    BaoCaoChiPhiUseCase,
    BaoCaoThueBHXHUseCase,
)

router = APIRouter()


class BaoCaoFilters(BaseModel):
    thang: Optional[int] = None
    nam: Optional[int] = None
    phong_ban_id: Optional[str] = None
    loai_nhan_vien: Optional[str] = None
    trang_thai: Optional[str] = None


# === NHAN SU ===

@router.get("/nhan-su/tong-hop", response_model=APIResponse[dict])
async def get_bao_cao_nhan_su_tong_hop(
    phong_ban_id: Optional[str] = Query(None),
    loai_nhan_vien: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoNhanSuTongHopUseCase(uow)
    result = await use_case.execute(
        phong_ban_id=phong_ban_id,
        loai_nhan_vien=loai_nhan_vien,
    )

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo tổng hợp nhân sự thành công",
        data={
            "tong_nhan_vien": r.tong_nhan_vien,
            "dang_lam": r.dang_lam,
            "nghi_viec": r.nghi_viec,
            "nghi_huu": r.nghi_huu,
            "theo_gioi_tinh": r.theo_gioi_tinh,
            "theo_loai_nv": r.theo_loai_nv,
            "theo_phong_ban": r.theo_phong_ban,
        },
    )


@router.get("/nhan-su/demo-graphics", response_model=APIResponse[dict])
async def get_bao_cao_demo_graphics(
    phong_ban_id: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoDemoGraphicsUseCase(uow)
    result = await use_case.execute(phong_ban_id=phong_ban_id)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo demographics thành công",
        data={
            "phan_bo_tuoi": r.phan_bo_tuoi,
            "tuoi_trung_binh": r.tuoi_trung_binh,
            "theo_gioi_tinh": r.theo_gioi_tinh,
            "theo_dan_toc": r.theo_dan_toc,
            "theo_ton_giao": r.theo_ton_giao,
        },
    )


@router.get("/nhan-su/trinh-do", response_model=APIResponse[dict])
async def get_bao_cao_trinh_do(
    phong_ban_id: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoTrinhDoUseCase(uow)
    result = await use_case.execute(phong_ban_id=phong_ban_id)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo trình độ thành công",
        data={
            "theo_bang_cap": r.theo_bang_cap,
            "theo_chuyen_nganh": r.theo_chuyen_nganh,
            "phan_bo_bac_luong": r.phan_bo_bac_luong,
        },
    )


@router.get("/nhan-su/bien-dong", response_model=APIResponse[dict])
async def get_bao_cao_bien_dong(
    thang: Optional[int] = Query(None),
    nam: Optional[int] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoBienDongUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo biến động nhân sự thành công",
        data={
            "ky_truoc": r.ky_truoc,
            "ky_hien_tai": r.ky_hien_tai,
            "bien_dong": r.bien_dong,
        },
    )


# === CHAM CONG ===

@router.get("/cham-cong/tong-hop", response_model=APIResponse[dict])
async def get_bao_cao_cham_cong_tong_hop(
    thang: Optional[int] = Query(None),
    nam: Optional[int] = Query(None),
    phong_ban_id: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoChamCongTongHopUseCase(uow)
    result = await use_case.execute(
        thang=thang, nam=nam, phong_ban_id=phong_ban_id
    )

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo tổng hợp chấm công thành công",
        data={
            "tong_so_nhan_vien": r.tong_so_nhan_vien,
            "tb_ngay_cong": r.tb_ngay_cong,
            "theo_phong_ban": r.theo_phong_ban,
        },
    )


@router.get("/cham-cong/nghi-phep", response_model=APIResponse[dict])
async def get_bao_cao_nghi_phep(
    thang: Optional[int] = Query(None),
    nam: Optional[int] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoNghiPhepUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo nghỉ phép thành công",
        data={
            "tong_don": r.tong_don,
            "da_duyet": r.da_duyet,
            "tu_choi": r.tu_choi,
            "cho_duyet": r.cho_duyet,
            "theo_loai_nghi": r.theo_loai_nghi,
        },
    )


# === LUONG ===

@router.get("/luong/chi-phi", response_model=APIResponse[dict])
async def get_bao_cao_chi_phi(
    thang: Optional[int] = Query(None),
    nam: Optional[int] = Query(None),
    phong_ban_id: Optional[str] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoChiPhiUseCase(uow)
    result = await use_case.execute(
        thang=thang, nam=nam, phong_ban_id=phong_ban_id
    )

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo chi phí nhân sự thành công",
        data={
            "tong_chi_phi": r.tong_chi_phi,
            "tb_luong": r.tb_luong,
            "luong_cao_nhat": r.luong_cao_nhat,
            "luong_thap_nhat": r.luong_thap_nhat,
            "theo_phong_ban": r.theo_phong_ban,
        },
    )


@router.get("/luong/thue-bhxh", response_model=APIResponse[dict])
async def get_bao_cao_thue_bhxh(
    thang: Optional[int] = Query(None),
    nam: Optional[int] = Query(None),
    user_context: UserContext = Depends(require_permission("bao_cao:read")),
    uow: UnitOfWork = Depends(get_unit_of_work),
):
    use_case = BaoCaoThueBHXHUseCase(uow)
    result = await use_case.execute(thang=thang, nam=nam)

    if is_err(result):
        raise ServerError(base_error=result.value)

    r = result.value
    return APIResponse(
        message="Lấy báo cáo thuế & BHXH thành công",
        data={
            "tong_thue_tncn": r.tong_thue_tncn,
            "tong_bhxh_nv": r.tong_bhxh_nv,
            "tong_bhyt_nv": r.tong_bhyt_nv,
        },
    )
```

- [ ] **Step 2: Thêm vào quan_ly/__init__.py**

```python
# backend/src/api/routes/quan_ly/__init__.py (thêm dòng)
from .bao_cao import router as bao_cao_router
```

Thêm vào __all__:
```python
"bao_cao_router",
```

- [ ] **Step 3: Thêm vào routes/__init__.py**

```python
# backend/src/api/routes/__init__.py (thêm dòng)
from .quan_ly import bao_cao_router
```

Thêm vào router.include_router:
```python
router.include_router(bao_cao_router, prefix="/bao-cao", tags=["Bao Cao"])
```

- [ ] **Step 4: Commit**

```bash
cd /home/enles04/hr_management
git add backend/src/api/routes/quan_ly/bao_cao.py backend/src/api/routes/quan_ly/__init__.py backend/src/api/routes/__init__.py
git commit -m "feat: add bao_cao API routes"
```

---

### Task 5: Thêm Permissions

**Files:**
- Create: `backend/src/repository/rbac_repository.py` (kiểm tra xem đã có chưa, nếu có thì bỏ qua)

- [ ] **Step 1: Thêm permissions vào seed data**

Kiểm tra file seed permissions hiện tại:
```bash
ls backend/src/
```

Nếu có file seed permissions, thêm:
```python
# Thêm vào seed
permissions_to_add = [
    ("bao_cao:read", "Bao Cao", "read"),
    ("bao_cao:export", "Bao Cao", "export"),
]
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add bao_cao permissions"
```

---

## Frontend Implementation

### Task 6: Tạo Types và API Endpoints

**Files:**
- Modify: `frontend/src/types/api.types.ts`
- Create: `frontend/src/types/bao-cao.types.ts`

- [ ] **Step 1: Thêm vào api.types.ts**

```typescript
// frontend/src/types/api.types.ts (thêm vào ApiEndpoints)

// Bao Cao
BAO_CAO_NHAN_SU_TONG_HOP: "/api/v1/bao-cao/nhan-su/tong-hop",
BAO_CAO_NHAN_SU_DEMO: "/api/v1/bao-cao/nhan-su/demo-graphics",
BAO_CAO_NHAN_SU_TRINH_DO: "/api/v1/bao-cao/nhan-su/trinh-do",
BAO_CAO_NHAN_SU_BIEN_DONG: "/api/v1/bao-cao/nhan-su/bien-dong",
BAO_CAO_CHAM_CONG_TONG_HOP: "/api/v1/bao-cao/cham-cong/tong-hop",
BAO_CAO_CHAM_CONG_NGHI_PHEP: "/api/v1/bao-cao/cham-cong/nghi-phep",
BAO_CAO_LUONG_CHI_PHI: "/api/v1/bao-cao/luong/chi-phi",
BAO_CAO_LUONG_THUE_BHHX: "/api/v1/bao-cao/luong/thue-bhxh",
BAO_CAO_EXPORT: "/api/v1/bao-cao/export",
```

- [ ] **Step 2: Tạo bao-cao.types.ts**

```typescript
// frontend/src/types/bao-cao.types.ts

export interface BaoCaoNhanSuTongHopResponse {
  tong_nhan_vien: number;
  dang_lam: number;
  nghi_viec: number;
  nghi_huu: number;
  theo_gioi_tinh: { nam: number; nu: number; khac: number };
  theo_loai_nv: { giao_vien: number; can_bo: number; nhan_vien: number };
  theo_phong_ban: { ten_phong_ban: string; so_luong: number }[];
}

export interface BaoCaoDemoGraphicsResponse {
  phan_bo_tuoi: { nhom_tuoi: string; gioi_tinh: string; so_luong: number }[];
  tuoi_trung_binh: number;
  theo_gioi_tinh: { nam: number; nu: number; phan_tram_nam: number; phan_tram_nu: number };
  theo_dan_toc: { dan_toc: string; so_luong: number }[];
  theo_ton_giao: { ton_giao: string; so_luong: number }[];
}

export interface BaoCaoTrinhDoResponse {
  theo_bang_cap: { ten_bang: string; so_luong: number }[];
  theo_chuyen_nganh: { chuyen_nganh: string; so_luong: number }[];
  phan_bo_bac_luong: { bac_luong: number; so_luong: number }[];
}

export interface BaoCaoBienDongResponse {
  ky_truoc: { tong: number };
  ky_hien_tai: { tong: number };
  bien_dong: { tang: number; giam: number; phan_tram_thay_doi: number };
}

export interface BaoCaoChamCongTongHopResponse {
  tong_so_nhan_vien: number;
  tb_ngay_cong: number;
  theo_phong_ban: { ten_phong_ban: string; tb_ngay_cong: number }[];
}

export interface BaoCaoNghiPhepResponse {
  tong_don: number;
  da_duyet: number;
  tu_choi: number;
  cho_duyet: number;
  theo_loai_nghi: { loai: string; so_luong: number }[];
}

export interface BaoCaoChiPhiResponse {
  tong_chi_phi: number;
  tb_luong: number;
  luong_cao_nhat: number;
  luong_thap_nhat: number;
  theo_phong_ban: { ten_phong_ban: string; tong_chi_phi: number; tb_luong: number; so_nhan_vien: number }[];
}

export interface BaoCaoThueBHXHResponse {
  tong_thue_tncn: number;
  tong_bhxh_nv: number;
  tong_bhyt_nv: number;
}

export interface BaoCaoFilters {
  thang?: number;
  nam?: number;
  phong_ban_id?: string;
  loai_nhan_vien?: string;
  trang_thai?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/api.types.ts frontend/src/types/bao-cao.types.ts
git commit -m "feat: add bao_cao types and API endpoints"
```

---

### Task 7: Tạo Hooks

**Files:**
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-nhan-su.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-cham-cong.ts`
- Create: `frontend/src/hooks/bao-cao/use-bao-cao-luong.ts`

- [ ] **Step 1: Tạo use-bao-cao-nhan-su.ts**

```typescript
// frontend/src/hooks/bao-cao/use-bao-cao-nhan-su.ts
import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { BaoCaoNhanSuTongHopResponse, BaoCaoDemoGraphicsResponse, BaoCaoTrinhDoResponse, BaoCaoBienDongResponse, BaoCaoFilters } from "@/types/bao-cao.types";

const baoCaoNhanSuKeys = {
  tongHop: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-tong-hop", filters] as const,
  demo: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-demo", filters] as const,
  trinhDo: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-trinh-do", filters] as const,
  bienDong: (filters: BaoCaoFilters) => ["bao-cao-nhan-su-bien-dong", filters] as const,
};

export function useBaoCaoNhanSuTongHop(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoNhanSuKeys.tongHop(filters),
    queryFn: () => apiGateway.get<BaoCaoNhanSuTongHopResponse>(
      ApiEndpoints.BAO_CAO_NHAN_SU_TONG_HOP,
      { params: filters }
    ),
  });
}

export function useBaoCaoDemoGraphics(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoNhanSuKeys.demo(filters),
    queryFn: () => apiGateway.get<BaoCaoDemoGraphicsResponse>(
      ApiEndpoints.BAO_CAO_NHAN_SU_DEMO,
      { params: filters }
    ),
  });
}

export function useBaoCaoTrinhDo(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoNhanSuKeys.trinhDo(filters),
    queryFn: () => apiGateway.get<BaoCaoTrinhDoResponse>(
      ApiEndpoints.BAO_CAO_NHAN_SU_TRINH_DO,
      { params: filters }
    ),
  });
}

export function useBaoCaoBienDong(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoNhanSuKeys.bienDong(filters),
    queryFn: () => apiGateway.get<BaoCaoBienDongResponse>(
      ApiEndpoints.BAO_CAO_NHAN_SU_BIEN_DONG,
      { params: filters }
    ),
  });
}
```

- [ ] **Step 2: Tạo use-bao-cao-cham-cong.ts**

```typescript
// frontend/src/hooks/bao-cao/use-bao-cao-cham-cong.ts
import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { BaoCaoChamCongTongHopResponse, BaoCaoNghiPhepResponse, BaoCaoFilters } from "@/types/bao-cao.types";

const baoCaoChamCongKeys = {
  tongHop: (filters: BaoCaoFilters) => ["bao-cao-cham-cong-tong-hop", filters] as const,
  nghiPhep: (filters: BaoCaoFilters) => ["bao-cao-nghi-phep", filters] as const,
};

export function useBaoCaoChamCongTongHop(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoChamCongKeys.tongHop(filters),
    queryFn: () => apiGateway.get<BaoCaoChamCongTongHopResponse>(
      ApiEndpoints.BAO_CAO_CHAM_CONG_TONG_HOP,
      { params: filters }
    ),
  });
}

export function useBaoCaoNghiPhep(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoChamCongKeys.nghiPhep(filters),
    queryFn: () => apiGateway.get<BaoCaoNghiPhepResponse>(
      ApiEndpoints.BAO_CAO_CHAM_CONG_NGHI_PHEP,
      { params: filters }
    ),
  });
}
```

- [ ] **Step 3: Tạo use-bao-cao-luong.ts**

```typescript
// frontend/src/hooks/bao-cao/use-bao-cao-luong.ts
import { useQuery } from "@tanstack/react-query";
import { apiGateway } from "@/lib/axios";
import { ApiEndpoints } from "@/types/api.types";
import type { BaoCaoChiPhiResponse, BaoCaoThueBHXHResponse, BaoCaoFilters } from "@/types/bao-cao.types";

const baoCaoLuongKeys = {
  chiPhi: (filters: BaoCaoFilters) => ["bao-cao-chi-phi", filters] as const,
  thueBhxh: (filters: BaoCaoFilters) => ["bao-cao-thue-bhxh", filters] as const,
};

export function useBaoCaoChiPhi(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoLuongKeys.chiPhi(filters),
    queryFn: () => apiGateway.get<BaoCaoChiPhiResponse>(
      ApiEndpoints.BAO_CAO_LUONG_CHI_PHI,
      { params: filters }
    ),
  });
}

export function useBaoCaoThueBHXH(filters: BaoCaoFilters) {
  return useQuery({
    queryKey: baoCaoLuongKeys.thueBhxh(filters),
    queryFn: () => apiGateway.get<BaoCaoThueBHXHResponse>(
      ApiEndpoints.BAO_CAO_LUONG_THUE_BHHX,
      { params: filters }
    ),
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/bao-cao/
git commit -m "feat: add bao_cao query hooks"
```

---

### Task 8: Tạo Trang Báo cáo Frontend

**Files:**
- Create: `frontend/src/app/(admin)/bao-cao/page.tsx`
- Create: `frontend/src/app/(admin)/bao-cao/_components/bao-cao-filters.tsx`
- Create: `frontend/src/app/(admin)/bao-cao/_components/bao-cao-tabs.tsx`
- Modify: `frontend/src/components/app-sidebar.tsx`

- [ ] **Step 1: Thêm navItem vào sidebar**

Modify: `frontend/src/components/app-sidebar.tsx`

Thêm import:
```typescript
import { BarChart3 } from "lucide-react"
```

Thêm vào navItems:
```typescript
{
  title: "Báo cáo",
  url: "/bao-cao",
  icon: BarChart3,
},
```

- [ ] **Step 2: Tạo bao-cao-filters.tsx**

```typescript
// frontend/src/app/(admin)/bao-cao/_components/bao-cao-filters.tsx
"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface BaoCaoFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function BaoCaoFilters({ onFilterChange }: BaoCaoFiltersProps) {
  const [thang, setThang] = useState<string>(new Date().getMonth().toString());
  const [nam, setNam] = useState<string>(new Date().getFullYear().toString());
  const [phongBan, setPhongBan] = useState<string>("all");
  const [loaiNV, setLoaiNV] = useState<string>("all");

  const handleFilterChange = () => {
    onFilterChange({
      thang: thang !== "all" ? parseInt(thang) : undefined,
      nam: nam !== "all" ? parseInt(nam) : undefined,
      phong_ban_id: phongBan !== "all" ? phongBan : undefined,
      loai_nhan_vien: loaiNV !== "all" ? loaiNV : undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="text-sm font-medium">Tháng</label>
        <Select value={thang} onValueChange={setThang}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>Tháng {i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium">Năm</label>
        <Select value={nam} onValueChange={setNam}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Phòng ban</label>
        <Select value={phongBan} onValueChange={setPhongBan}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {/* Add department options from API */}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Loại NV</label>
        <Select value={loaiNV} onValueChange={setLoaiNV}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="giao_vien">Giáo viên</SelectItem>
            <SelectItem value="can_bo">Cán bộ</SelectItem>
            <SelectItem value="nhan_vien">Nhân viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleFilterChange}>
        <Calendar className="w-4 h-4 mr-2" />
        Lọc
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Tạo bao-cao-tabs.tsx**

```typescript
// frontend/src/app/(admin)/bao-cao/_components/bao-cao-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface BaoCaoTabsProps {
  children: React.ReactNode;
}

export function BaoCaoTabs({ children }: BaoCaoTabsProps) {
  return (
    <Tabs defaultValue="nhan-su" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="nhan-su">Nhân sự</TabsTrigger>
        <TabsTrigger value="cham-cong">Chấm công</TabsTrigger>
        <TabsTrigger value="luong">Lương</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
```

- [ ] **Step 4: Tạo bao-cao/page.tsx**

```typescript
// frontend/src/app/(admin)/bao-cao/page.tsx
"use client";

import { useState } from "react";
import { BaoCaoFilters } from "./_components/bao-cao-filters";
import { BaoCaoTabs } from "./_components/bao-cao-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BaoCaoPage() {
  const [filters, setFilters] = useState({});

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
        <p className="text-muted-foreground">Xem và phân tích dữ liệu nhân sự</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <BaoCaoFilters onFilterChange={setFilters} />
        </CardContent>
      </Card>

      <BaoCaoTabs>
        <TabsContent value="nhan-su">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Nhân sự</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cham-cong">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Chấm công</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="luong">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo Lương</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Đang phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </BaoCaoTabs>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/\(admin\)/bao-cao/ frontend/src/components/app-sidebar.tsx
git commit -m "feat: add bao_cao page and components"
```

---

## Summary

Các tasks đã tạo đủ infrastructure cho module Báo cáo:

1. **BaoCaoRepository** - aggregation queries cho tất cả báo cáo
2. **9 UseCases** - từng báo cáo riêng (4 NS, 2 CC, 2 Lương)
3. **API Routes** - 9 endpoints + filters
4. **Frontend types & hooks** - TypeScript types + TanStack Query hooks
5. **Trang /bao-cao** - layout cơ bản với tabs + filters
6. **Sidebar** - thêm item "Báo cáo"

Các tab contents với biểu đồ sẽ được implement trong các tasks tiếp theo.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-bao-cao-thong-ke.md`**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
