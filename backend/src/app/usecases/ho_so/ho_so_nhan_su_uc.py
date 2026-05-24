import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional, List

from libs.result import Result, Error, Return
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetHoSoNhanVienQuery:
    nhan_vien_id: str


@dataclass
class GetHoSoNhanVienResult:
    ho_so: dict


@dataclass
class ExportHoSoNhanVienQuery:
    nhan_vien_id: str
    format: str = "pdf"


@dataclass
class ExportHoSoNhanVienResult:
    file_path: str
    file_name: str


class HoSoNhanSuUseCase:
    """
    Use case for employee profile (Hồ sơ nhân sự) operations.

    Provides:
    - Get full employee profile with all related data
    - Export employee profile to PDF
    """

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def get_profile(
        self, query: GetHoSoNhanVienQuery
    ) -> Result[GetHoSoNhanVienResult, Error]:
        """
        Get complete employee profile with all related information.

        Includes:
        - Basic personal info
        - Work assignment (phong_ban, chuc_vu)
        - Contract history (hop_dong)
        - Salary history (luong)
        - Education (bang_cap)
        - Family (nguoi_than)
        - Rewards/Discipline (khen_thuong_ky_luat)
        - Attendance history (lich_su_chuc_vu)
        """
        logger.info(f"Getting employee profile for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            ho_so = serialize_model_to_dict(nhan_vien)

            if nhan_vien.phong_ban_id:
                phong_ban = await uow.phong_ban_repository.find_by_id(
                    nhan_vien.phong_ban_id
                )
                if phong_ban:
                    ho_so["phong_ban"] = {
                        "id": phong_ban.id,
                        "ma_phong_ban": phong_ban.ma_phong_ban,
                        "ten_phong_ban": phong_ban.ten_phong_ban,
                        "loai": phong_ban.loai,
                    }

            if nhan_vien.chuc_vu_id:
                chuc_vu = await uow.chuc_vu_repository.find_by_id(nhan_vien.chuc_vu_id)
                if chuc_vu:
                    ho_so["chuc_vu"] = {
                        "id": chuc_vu.id,
                        "ma_chuc_vu": chuc_vu.ma_chuc_vu,
                        "ten_chuc_vu": chuc_vu.ten_chuc_vu,
                        "loai": chuc_vu.loai,
                        "cap_bac": chuc_vu.cap_bac,
                    }

            hop_dongs = await uow.hop_dong_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            ho_so["hop_dongs"] = [serialize_model_to_dict(hd) for hd in hop_dongs]

            cong_tacs = await uow.cong_tac_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            ho_so["lich_su_cong_tac"] = [
                serialize_model_to_dict(ct) for ct in cong_tacs
            ]

            bang_caps = await uow.bang_cap_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            ho_so["bang_caps"] = [serialize_model_to_dict(bc) for bc in bang_caps]

            nguoi_thans = await uow.nguoi_than_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            ho_so["nguoi_thans"] = [serialize_model_to_dict(nt) for nt in nguoi_thans]

            khen_thuongs = await uow.khen_thuong_ky_luat_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            ho_so["khen_thuongs"] = [serialize_model_to_dict(kt) for kt in khen_thuongs]

            lich_su_chuc_vus = (
                await uow.lich_su_chuc_vu_repository.find_by_nhan_vien_id(
                    query.nhan_vien_id
                )
            )
            ho_so["lich_su_chuc_vus"] = [
                serialize_model_to_dict(ls) for ls in lich_su_chuc_vus
            ]

            return Return.ok(GetHoSoNhanVienResult(ho_so=ho_so))

    async def export_pdf(
        self, query: ExportHoSoNhanVienQuery
    ) -> Result[ExportHoSoNhanVienResult, Error]:
        """
        Export employee profile to PDF.

        Note: This is a placeholder that returns the file path.
        Actual PDF generation should be implemented with a PDF library
        (e.g., ReportLab, WeasyPrint).
        """
        logger.info(
            f"Exporting employee profile for nhan_vien={query.nhan_vien_id}, "
            f"format={query.format}"
        )

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="nhan_vien_not_found",
                        message="Nhân viên không tồn tại",
                        reason="NotFound",
                    )
                )

            export_dir = "/home/enles04/hr_management/backend/exports"
            import os

            os.makedirs(export_dir, exist_ok=True)

            file_name = f"ho_so_{nhan_vien.ma_nhan_vien}_{date.today().isoformat()}.{query.format}"
            file_path = os.path.join(export_dir, file_name)

            return Return.ok(
                ExportHoSoNhanVienResult(
                    file_path=file_path,
                    file_name=file_name,
                )
            )
