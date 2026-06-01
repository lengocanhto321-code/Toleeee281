from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta

from libs.result import Result, Error, Return
from src.domain.models.check_in_out import CheckInOut


@dataclass
class CheckOutCommand:
    nhan_vien_id: str
    thoi_gian: str


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
        from libs.datetime import to_vn_time
        thoi_gian_dt = to_vn_time(datetime.fromisoformat(command.thoi_gian))
        ngay = thoi_gian_dt.date()

        async with self.unit_of_work as uow:
            check_in = await uow.check_in_out_repository.find_today(
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

            # Ensure VN timezone datetimes and make naive for safe comparison
            check_in_time_vn = to_vn_time(check_in.check_in_time)
            check_in_time_naive = check_in_time_vn.replace(tzinfo=None)
            thoi_gian_dt_naive = thoi_gian_dt.replace(tzinfo=None)

            min_time = check_in_time_naive + timedelta(hours=1)
            if thoi_gian_dt_naive < min_time:
                return Return.err(
                    Error(
                        code="too_early",
                        message=f"Phải làm ít nhất 1 giờ (đến {min_time.strftime('%H:%M')})",
                        reason="EarlyCheckOut",
                    )
                )

            check_in.check_out_time = thoi_gian_dt
            check_in.trang_thai = "checked_out"
            await uow.check_in_out_repository.update(check_in)

        # Make naive datetimes for duration calculation
        from libs.datetime import to_vn_time
        thoi_gian_naive = thoi_gian_dt.replace(tzinfo=None)
        check_in_time_vn = to_vn_time(check_in.check_in_time)
        check_in_time_naive = check_in_time_vn.replace(tzinfo=None)
        working_hours = (thoi_gian_naive - check_in_time_naive).total_seconds() / 3600
        message = f"Check-out thành công ({working_hours:.1f} giờ làm việc)"

        return Return.ok(
            CheckOutResult(
                id=check_in.id,
                thoi_gian=command.thoi_gian,
                trang_thai="on_time",
                message=message,
            )
        )
