from dataclasses import dataclass
from typing import Optional
from datetime import date

from libs.result import Result, Error, Return


@dataclass
class GetMyMonthlyQuery:
    nhan_vien_id: str
    thang: Optional[int] = None
    nam: Optional[int] = None


@dataclass
class GetMyMonthlyResult:
    nhan_vien_id: str
    thang: int
    nam: int
    so_ngay_lam_chuan: float
    so_ngay_co_mat: float
    so_ngay_vang_co_phep: float
    so_ngay_vang_khong_phep: float
    so_ngay_nghi_le_tet: float
    so_ngay_cong_tac: float
    he_so_ngay_cong: float
    trang_thai: str


class GetMyMonthlyUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetMyMonthlyQuery
    ) -> Result[GetMyMonthlyResult, Error]:
        from libs.datetime import get_utc_now

        now = get_utc_now()
        thang = query.thang or now.month
        nam = query.nam or now.year

        async with self.unit_of_work as uow:
            nhan_vien = await uow.nhan_vien_repository.find_by_id(query.nhan_vien_id)
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            cham_cong = (
                await uow.cham_cong_thang_repository.find_by_nhan_vien_thang_nam(
                    query.nhan_vien_id, thang, nam
                )
            )

            if cham_cong:
                return Return.ok(
                    GetMyMonthlyResult(
                        nhan_vien_id=query.nhan_vien_id,
                        thang=thang,
                        nam=nam,
                        so_ngay_lam_chuan=float(cham_cong.so_ngay_lam_chuan or 0),
                        so_ngay_co_mat=float(cham_cong.so_ngay_co_mat or 0),
                        so_ngay_vang_co_phep=float(cham_cong.so_ngay_vang_co_phep or 0),
                        so_ngay_vang_khong_phep=float(
                            cham_cong.so_ngay_vang_khong_phep or 0
                        ),
                        so_ngay_nghi_le_tet=float(cham_cong.so_ngay_nghi_le_tet or 0),
                        so_ngay_cong_tac=float(cham_cong.so_ngay_cong_tac or 0),
                        he_so_ngay_cong=float(cham_cong.he_so_ngay_cong or 0),
                        trang_thai=cham_cong.trang_thai,
                    )
                )

            so_ngay_lam_viec = self._tinh_so_ngay_lam_viec(thang, nam)

            tong_check_in = await uow.check_in_out_repository.get_monthly_count(
                query.nhan_vien_id, thang, nam, "check_in"
            )

        return Return.ok(
            GetMyMonthlyResult(
                nhan_vien_id=query.nhan_vien_id,
                thang=thang,
                nam=nam,
                so_ngay_lam_chuan=so_ngay_lam_viec,
                so_ngay_co_mat=float(tong_check_in),
                so_ngay_vang_co_phep=0,
                so_ngay_vang_khong_phep=0,
                so_ngay_nghi_le_tet=0,
                so_ngay_cong_tac=0,
                he_so_ngay_cong=0,
                trang_thai="chua_chot",
            )
        )

    def _tinh_so_ngay_lam_viec(self, thang: int, nam: int) -> float:
        """Tính số ngày làm việc trong tháng."""
        from calendar import monthrange
        from datetime import timedelta

        _, so_ngay = monthrange(nam, thang)
        ngay_dau = date(nam, thang, 1)
        ngay_cuoi = date(nam, thang, so_ngay)

        so_ngay = 0
        current = ngay_dau
        while current <= ngay_cuoi:
            if current.weekday() < 5:
                so_ngay += 1
            current += timedelta(days=1)

        return float(so_ngay)
