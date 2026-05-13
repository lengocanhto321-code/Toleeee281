from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import QRAttendanceService
from src.domain.models.check_in_out import CheckInOut


@dataclass
class CheckOutCommand:
    nhan_vien_id: str
    thoi_gian: str
    device_info: Optional[str] = None


@dataclass
class CheckOutResult:
    id: str
    thoi_gian: str
    trang_thai: str
    message: str


class CheckOutUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: CheckOutCommand) -> Result[CheckOutResult, Error]:
        thoi_gian_dt = datetime.fromisoformat(command.thoi_gian)
        ngay = thoi_gian_dt.date()

        check_in = await self.unit_of_work.check_in_out_repository.find_today(
            command.nhan_vien_id, ngay
        )
        if not check_in or not check_in.check_in_time:
            return Return.err(
                Error(
                    code="not_checked_in",
                    message="Chưa check-in hôm nay",
                    reason="NotCheckedIn",
                )
            )

        if check_in.check_out_time:
            return Return.err(
                Error(
                    code="already_checked_out",
                    message="Đã check-out hôm nay rồi",
                    reason="AlreadyCheckedOut",
                )
            )

        min_time = check_in.check_in_time + timedelta(hours=1)
        if thoi_gian_dt < min_time:
            return Return.err(
                Error(
                    code="too_early",
                    message=f"Phải làm ít nhất 1 giờ (đến {min_time.strftime('%H:%M')})",
                    reason="EarlyCheckOut",
                )
            )

        async with self.unit_of_work as uow:
            check_in.check_out_time = thoi_gian_dt
            check_in.check_out_qr_id = check_in.check_in_qr_id
            check_in.check_out_lat = check_in.check_in_lat
            check_in.check_out_lng = check_in.check_in_lng
            check_in.trang_thai = "checked_out"
            if command.device_info:
                check_in.device_info = command.device_info
            await uow.check_in_out_repository.update(check_in)

        working_hours = (thoi_gian_dt - check_in.check_in_time).total_seconds() / 3600
        message = f"Check-out thành công ({working_hours:.1f} giờ làm việc)"

        return Return.ok(
            CheckOutResult(
                id=check_in.id,
                thoi_gian=command.thoi_gian,
                trang_thai="valid",
                message=message,
            )
        )
