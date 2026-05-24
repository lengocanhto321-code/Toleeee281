from dataclasses import dataclass
from typing import Optional, List
from datetime import date

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import QRAttendanceService


@dataclass
class GetMyHistoryQuery:
    nhan_vien_id: str
    page: int = 1
    page_size: int = 20
    tu_ngay: Optional[date] = None
    den_ngay: Optional[date] = None


@dataclass
class GetMyHistoryResult:
    records: List[dict]
    total: int


class GetMyHistoryUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetMyHistoryQuery
    ) -> Result[GetMyHistoryResult, Error]:
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

            total, items = await uow.check_in_out_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                nhan_vien_id=query.nhan_vien_id,
                tu_ngay=query.tu_ngay,
                den_ngay=query.den_ngay,
            )

            response_items = []
            for item in items:
                response_items.append(
                    {
                        "id": item.id,
                        "ngay": str(item.ngay),
                        "check_in_time": str(item.check_in_time)
                        if item.check_in_time
                        else None,
                        "check_out_time": str(item.check_out_time)
                        if item.check_out_time
                        else None,
                        "check_in_status": item.check_in_status,
                        "trang_thai": item.trang_thai,
                    }
                )

        return Return.ok(
            GetMyHistoryResult(
                records=response_items,
                total=total,
            )
        )
