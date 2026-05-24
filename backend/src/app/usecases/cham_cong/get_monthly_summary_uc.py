from dataclasses import dataclass
from typing import Dict, Any

from libs.result import Result, Error, Return


@dataclass
class GetMonthlySummaryQuery:
    thang: int
    nam: int


@dataclass
class GetMonthlySummaryResult:
    data: Dict[str, Any]


class GetMonthlySummaryReportUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetMonthlySummaryQuery
    ) -> Result[GetMonthlySummaryResult, Error]:
        async with self.unit_of_work as uow:
            records = await uow.cham_cong_thang_repository.get_all_by_thang_nam(
                query.thang, query.nam
            )

            tong_co_mat = sum(r.so_ngay_co_mat for r in records)
            tong_vang_co_phep = sum(r.so_ngay_vang_co_phep for r in records)
            tong_vang_khong_phep = sum(r.so_ngay_vang_khong_phep for r in records)

            return Return.ok(
                GetMonthlySummaryResult(
                    data={
                        "thang": query.thang,
                        "nam": query.nam,
                        "tong_nhan_vien": len(records),
                        "tong_so_ngay_co_mat": tong_co_mat,
                        "tong_so_ngay_vang_co_phep": tong_vang_co_phep,
                        "tong_so_ngay_vang_khong_phep": tong_vang_khong_phep,
                        "trung_binh_so_ngay_cong": round(tong_co_mat / len(records), 2)
                        if records
                        else 0,
                        "details": [
                            {
                                "nhan_vien_id": r.nhan_vien_id,
                                "so_ngay_co_mat": r.so_ngay_co_mat,
                                "so_ngay_vang": r.so_ngay_vang_co_phep
                                + r.so_ngay_vang_khong_phep,
                                "he_so_ngay_cong": r.he_so_ngay_cong,
                                "trang_thai": r.trang_thai,
                            }
                            for r in records
                        ],
                    }
                )
            )
