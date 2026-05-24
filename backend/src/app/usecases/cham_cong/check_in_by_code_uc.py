from dataclasses import dataclass
from typing import Optional
from datetime import datetime

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import QRAttendanceService
from src.domain.models.check_in_out import CheckInOut


@dataclass
class CheckInByCodeCommand:
    nhan_vien_id: str
    ma_nhap: str
    thoi_gian: str
    vi_tri: Optional[dict] = None


@dataclass
class CheckInByCodeResult:
    id: str
    thoi_gian: str
    trang_thai: str
    is_late: bool
    message: str


class CheckInByCodeUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CheckInByCodeCommand
    ) -> Result[CheckInByCodeResult, Error]:
        thoi_gian_dt = datetime.fromisoformat(command.thoi_gian)
        ngay = thoi_gian_dt.date()

        async with self.unit_of_work as uow:
            qr_config = await uow.qr_config_repository.find_by_ma_nhap(command.ma_nhap)
            if not qr_config:
                return Return.err(
                    Error(
                        code="invalid_code",
                        message="Mã không hợp lệ hoặc đã hết hạn",
                        reason="CodeNotFound",
                    )
                )

            if qr_config.ngay != ngay:
                return Return.err(
                    Error(
                        code="invalid_code",
                        message="Mã không đúng ngày",
                        reason="CodeDateMismatch",
                    )
                )

            is_valid, error_msg = QRAttendanceService.validate_check_in_time(
                thoi_gian=thoi_gian_dt,
                gio_bat_dau=qr_config.gio_bat_dau,
                gio_ket_thuc=qr_config.gio_ket_thuc,
            )
            if not is_valid:
                return Return.err(
                    Error(
                        code="invalid_time",
                        message=error_msg,
                        reason="TimeValidationError",
                    )
                )

            existing = await uow.check_in_out_repository.find_today(
                command.nhan_vien_id, ngay
            )
            if existing and existing.check_in_time:
                return Return.err(
                    Error(
                        code="already_checked_in",
                        message="Đã check-in hôm nay rồi",
                        reason="AlreadyCheckedIn",
                    )
                )

            khoang_cach = None
            current_lat = None
            current_lng = None

            co_bat_gps = getattr(qr_config, "bat_gps", True)

            if co_bat_gps and qr_config.kinh_do is not None and qr_config.vi_do is not None:
                if not command.vi_tri:
                    return Return.err(
                        Error(
                            code="location_required",
                            message="Không tìm thấy thông tin vị trí của bạn. Vui lòng bật định vị GPS trên thiết bị.",
                            reason="LocationRequired",
                        )
                    )

                current_lat = command.vi_tri.get("lat")
                current_lng = command.vi_tri.get("lng")
                is_valid_loc, khoang_cach, error_loc = (
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

            is_late = QRAttendanceService.is_late(thoi_gian_dt)

            if existing:
                existing.check_in_time = thoi_gian_dt
                existing.check_in_qr_id = qr_config.id
                existing.check_in_lat = current_lat
                existing.check_in_lng = current_lng
                existing.check_in_status = "on_time" if not is_late else "late"
                existing.trang_thai = "checked_in"
                await uow.check_in_out_repository.update(existing)
                created = existing
            else:
                check_in = CheckInOut(
                    nhan_vien_id=command.nhan_vien_id,
                    ngay=ngay,
                    check_in_time=thoi_gian_dt,
                    check_in_qr_id=qr_config.id,
                    check_in_lat=current_lat,
                    check_in_lng=current_lng,
                    check_in_status="on_time" if not is_late else "late",
                    trang_thai="checked_in",
                )
                created = await uow.check_in_out_repository.create(check_in)

        message = "Check-in thành công"
        if is_late:
            message = f"Check-in thành công (đi muộn {thoi_gian_dt.strftime('%H:%M')})"

        return Return.ok(
            CheckInByCodeResult(
                id=created.id,
                thoi_gian=command.thoi_gian,
                trang_thai=created.check_in_status or "on_time",
                is_late=is_late,
                message=message,
            )
        )
