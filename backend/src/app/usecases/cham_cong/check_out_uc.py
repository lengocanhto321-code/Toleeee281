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
    vi_tri: Optional[dict] = None
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

            nhan_vien = await uow.nhan_vien_repository.find_by_id(command.nhan_vien_id)
            phong_ban_id = nhan_vien.phong_ban_id if nhan_vien else None

            qr_config = await uow.qr_config_repository.find_active_by_ngay(
                ngay,
                phong_ban_id=phong_ban_id,
                nhan_vien_id=command.nhan_vien_id,
            )
            qr_id = check_in.check_in_qr_id
            current_lat = None
            current_lng = None

            if qr_config:
                qr_id = qr_config.id
                co_bat_gps = getattr(qr_config, "bat_gps", True)
                if co_bat_gps and qr_config.kinh_do is not None and qr_config.vi_do is not None:
                    if not command.vi_tri:
                        return Return.err(
                            Error(
                                code="location_required",
                                message="Không tìm thấy thông tin vị trí của bạn. Vui lòng bật định vị GPS trên thiết bị để check-out.",
                                reason="LocationRequired",
                            )
                        )
                    
                    current_lat = command.vi_tri.get("lat")
                    current_lng = command.vi_tri.get("lng")
                    is_valid_loc, _, error_loc = (
                        QRAttendanceService.validate_location(
                            current_lat=current_lat,
                            current_lng=current_lng,
                            qr_location={
                                "lat": qr_config.kinh_do,
                                "lng": qr_config.vi_do,
                                "radius": qr_config.ban_kinh_cho_phep or 100,
                            },
                        )
                    )
                    if not is_valid_loc:
                        return Return.err(
                            Error(
                                code="invalid_location",
                                message=error_loc,
                                reason="LocationValidationError",
                            )
                        )
                elif command.vi_tri:
                    current_lat = command.vi_tri.get("lat")
                    current_lng = command.vi_tri.get("lng")
            elif command.vi_tri:
                current_lat = command.vi_tri.get("lat")
                current_lng = command.vi_tri.get("lng")

            # Ensure naive datetimes for safe comparison
            check_in_time_naive = check_in.check_in_time.replace(tzinfo=None) if check_in.check_in_time.tzinfo else check_in.check_in_time
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
            check_in.check_out_qr_id = qr_id
            check_in.check_out_lat = current_lat
            check_in.check_out_lng = current_lng
            check_in.trang_thai = "checked_out"
            await uow.check_in_out_repository.update(check_in)

        # Make naive datetimes for duration calculation
        thoi_gian_naive = thoi_gian_dt.replace(tzinfo=None)
        check_in_time_naive = check_in.check_in_time.replace(tzinfo=None) if check_in.check_in_time.tzinfo else check_in.check_in_time
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
