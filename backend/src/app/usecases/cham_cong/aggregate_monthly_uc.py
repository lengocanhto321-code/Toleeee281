from dataclasses import dataclass
from typing import List

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService
from src.service.nghi_phep_service import NghiPhepService


@dataclass
class AggregateMonthlyCommand:
    thang: int
    nam: int
    phong_ban_id: str = None


@dataclass
class AggregateMonthlyResult:
    thang: int
    nam: int
    tong_nhan_vien: int
    da_cap_nhat: int


class AggregateMonthlyUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, command: AggregateMonthlyCommand
    ) -> Result[AggregateMonthlyResult, Error]:
        so_ngay_lam_viec = self.service.tinh_so_ngay_lam_viec_thang(
            command.thang, command.nam
        )

        nghi_phep_service = NghiPhepService()
        holidays = nghi_phep_service.get_holidays(command.nam)
        so_ngay_nghi_le_tet = sum(
            1 for h in holidays if h.month == command.thang and h.weekday() < 5
        )

        async with self.unit_of_work as uow:
            if command.phong_ban_id:
                nhan_viens = await uow.nhan_vien_repository.find_by_phong_ban(
                    command.phong_ban_id
                )
            else:
                nhan_viens = await uow.nhan_vien_repository.find_all_by_status(
                    "dang_lam"
                )

            da_cap_nhat = 0

            for nv in nhan_viens:
                check_in_count = await uow.check_in_out_repository.get_monthly_count(
                    nv.id, command.thang, command.nam, "check_in"
                )

                don_nghi = await uow.don_xin_nghi_repository.get_approved_monthly(
                    nv.id, command.thang, command.nam
                )

                so_ngay_vang_co_phep = 0.0
                so_ngay_cong_tac = 0.0
                for don in don_nghi:
                    if don.loai_nghi == "cong_tac":
                        so_ngay_cong_tac += float(don.so_ngay)
                    else:
                        so_ngay_vang_co_phep += float(don.so_ngay)

                so_ngay_vang_khong_phep = max(
                    0, so_ngay_lam_viec - check_in_count - so_ngay_vang_co_phep
                )

                he_so = self.service.tinh_he_so_ngay_cong(
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    so_ngay_nghi_le_tet=float(so_ngay_nghi_le_tet),
                    so_ngay_lam_chuan=float(so_ngay_lam_viec),
                    so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                )

                await uow.cham_cong_thang_repository.upsert(
                    nhan_vien_id=nv.id,
                    thang=command.thang,
                    nam=command.nam,
                    so_ngay_co_mat=float(check_in_count),
                    so_ngay_vang_co_phep=so_ngay_vang_co_phep,
                    so_ngay_vang_khong_phep=so_ngay_vang_khong_phep,
                    so_ngay_nghi_le_tet=float(so_ngay_nghi_le_tet),
                    so_ngay_cong_tac=so_ngay_cong_tac,
                    he_so_ngay_cong=he_so,
                )
                da_cap_nhat += 1

        return Return.ok(
            AggregateMonthlyResult(
                thang=command.thang,
                nam=command.nam,
                tong_nhan_vien=len(nhan_viens),
                da_cap_nhat=da_cap_nhat,
            )
        )
