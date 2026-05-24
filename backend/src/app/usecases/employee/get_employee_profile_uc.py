import logging
from libs.result import Result, Error, Return
from src.app.usecases.employee.commands import (
    GetEmployeeProfileQuery,
    GetEmployeeProfileResult,
)

logger = logging.getLogger(__name__)


class GetEmployeeProfileUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetEmployeeProfileQuery
    ) -> Result[GetEmployeeProfileResult, Error]:
        logger.info(f"Getting profile for user_id={query.user_id}")

        async with self.unit_of_work as uow:
            tai_khoan = await uow.rbac_repository.get_tai_khoan_by_id(query.user_id)
            if not tai_khoan or not tai_khoan.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy thông tin nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(
                tai_khoan.nhan_vien_id
            )
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            profile = {
                "id": nhan_vien.id,
                "ma_nhan_vien": nhan_vien.ma_nhan_vien,
                "ho_ten": nhan_vien.ho_ten,
                "gioi_tinh": nhan_vien.gioi_tinh,
                "ngay_sinh": nhan_vien.ngay_sinh.isoformat()
                if nhan_vien.ngay_sinh
                else None,
                "que_quan": nhan_vien.que_quan,
                "dia_chi": nhan_vien.dia_chi_tam_tru or nhan_vien.dia_chi_thuong_tru,
                "so_dien_thoai": nhan_vien.so_dien_thoai,
                "email": nhan_vien.email,
                "email_ca_nhan": nhan_vien.email_ca_nhan,
                "so_cccd": nhan_vien.so_cccd,
                "ngay_cap_cccd": nhan_vien.ngay_cap_cccd.isoformat()
                if nhan_vien.ngay_cap_cccd
                else None,
                "noi_cap_cccd": nhan_vien.noi_cap_cccd,
                "loai_nhan_vien": nhan_vien.loai_nhan_vien,
                "ngay_vao_lam": nhan_vien.ngay_vao_lam.isoformat()
                if nhan_vien.ngay_vao_lam
                else None,
                "trang_thai": nhan_vien.trang_thai,
                "phong_ban": {
                    "id": nhan_vien.phong_ban.id,
                    "ten_phong_ban": nhan_vien.phong_ban.ten_phong_ban,
                }
                if nhan_vien.phong_ban
                else None,
                "chuc_vu": {
                    "id": nhan_vien.chuc_vu.id,
                    "ten_chuc_vu": nhan_vien.chuc_vu.ten_chuc_vu,
                }
                if nhan_vien.chuc_vu
                else None,
            }

            return Return.ok(GetEmployeeProfileResult(profile=profile))
