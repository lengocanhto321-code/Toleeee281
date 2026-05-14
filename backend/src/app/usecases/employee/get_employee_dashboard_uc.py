import logging
from libs.result import Result, Error, Return
from src.app.usecases.employee.commands import (
    GetEmployeeDashboardQuery,
    GetEmployeeDashboardResult,
)

logger = logging.getLogger(__name__)


class GetEmployeeDashboardUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetEmployeeDashboardQuery
    ) -> Result[GetEmployeeDashboardResult, Error]:
        from libs.datetime import get_utc_now

        logger.info(f"Getting dashboard for user_id={query.user_id}")

        async with self.unit_of_work as uow:
            tai_khoan = await uow.rbac_repository.get_tai_khoan_by_id(query.user_id)
            if not tai_khoan:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy tài khoản",
                        reason="TaiKhoanNotFound",
                    )
                )

            nhan_vien_id = tai_khoan.nhan_vien_id
            if not nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Tài khoản chưa được liên kết với nhân viên",
                        reason="NhanVienNotLinked",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            so_ngay_phep = await uow.so_ngay_phep_repository.find_by_nhan_vien_nam(
                nhan_vien_id, get_utc_now().year
            )

            don_cho_duyet = 0
            da_duyet_thang_nay = 0
            don_gan_nhat = None
            now = get_utc_now()
            all_dons = await uow.don_xin_nghi_repository.find_by_nhan_vien(nhan_vien_id)
            for don in all_dons:
                if don.trang_thai == "cho_duyet":
                    don_cho_duyet += 1
                if don.trang_thai == "da_duyet" and don.tu_ngay:
                    if don.tu_ngay.month == now.month and don.tu_ngay.year == now.year:
                        da_duyet_thang_nay += don.so_ngay or 0
                if not don_gan_nhat:
                    don_gan_nhat = {
                        "id": don.id,
                        "loai_nghi": don.loai_nghi,
                        "tu_ngay": don.tu_ngay.isoformat() if don.tu_ngay else None,
                        "den_ngay": don.den_ngay.isoformat() if don.den_ngay else None,
                        "trang_thai": don.trang_thai,
                    }

            cham_cong_thang = (
                await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                    nhan_vien_id, now.month, now.year
                )
            )

            nhan_vien_data = {
                "id": nhan_vien.id,
                "ma_nhan_vien": nhan_vien.ma_nhan_vien,
                "ho_ten": nhan_vien.ho_ten,
                "email": nhan_vien.email,
                "so_dien_thoai": nhan_vien.so_dien_thoai,
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

            nghi_phep_data = {
                "so_ngay_phep_con_lai": so_ngay_phep.phep_nam_con_lai
                if so_ngay_phep
                else 0,
                "tong_ngay_phep_nam": so_ngay_phep.phep_nam_duoc_phep
                if so_ngay_phep
                else 12,
                "don_cho_duyet": don_cho_duyet,
                "da_duyet_thang_nay": da_duyet_thang_nay,
                "don_gan_nhat": don_gan_nhat,
            }

            cham_cong_data = {
                "thang_hien_tai": {
                    "thang": now.month,
                    "nam": now.year,
                    "so_ngay_cong": cham_cong_thang.so_ngay_cong
                    if cham_cong_thang
                    else 0,
                    "he_so": cham_cong_thang.he_so_ngay_cong if cham_cong_thang else 0,
                }
            }

            return Return.ok(
                GetEmployeeDashboardResult(
                    nhan_vien=nhan_vien_data,
                    nghi_phep=nghi_phep_data,
                    cham_cong=cham_cong_data,
                )
            )
