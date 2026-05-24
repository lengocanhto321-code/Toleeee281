from dataclasses import dataclass
from datetime import date
from typing import Dict, Any

from libs.result import Result, Error, Return

from src.repository.nhan_vien_repository import NhanVienFilterParams


@dataclass
class GetDailyReportQuery:
    ngay: date


@dataclass
class GetDailyReportResult:
    summary: Dict[str, Any]


class GetDailyAttendanceReportUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetDailyReportQuery
    ) -> Result[GetDailyReportResult, Error]:
        async with self.unit_of_work as uow:
            records = await uow.check_in_out_repository.get_by_date(query.ngay)
            nhan_vien_result = await uow.nhan_vien_repository.get_paginated(
                page=1,
                page_size=1000,
                filters=NhanVienFilterParams(trang_thai="dang_lam"),
            )

            if nhan_vien_result.is_err():
                return Return.err(nhan_vien_result.value)

            total_nv, nhan_vien_list = nhan_vien_result.value

            checked_in_ids = {r.nhan_vien_id for r in records if r.check_in_time}

            summary = {
                "ngay": query.ngay.isoformat(),
                "tong_nhan_vien": total_nv,
                "so_check_in": len(checked_in_ids),
                "chua_check_in": total_nv - len(checked_in_ids),
                "details": [],
            }

            for nv in nhan_vien_list:
                record = next((r for r in records if r.nhan_vien_id == nv["id"]), None)
                summary["details"].append(
                    {
                        "nhan_vien_id": nv["id"],
                        "ho_ten": nv.get("ho_ten"),
                        "ma_nhan_vien": nv.get("ma_nhan_vien"),
                        "check_in": record.check_in_time.isoformat()
                        if record and record.check_in_time
                        else None,
                        "check_out": record.check_out_time.isoformat()
                        if record and record.check_out_time
                        else None,
                        "trang_thai": "checked_in"
                        if record and record.check_in_time
                        else "chua_check_in",
                    }
                )

            return Return.ok(GetDailyReportResult(summary=summary))
