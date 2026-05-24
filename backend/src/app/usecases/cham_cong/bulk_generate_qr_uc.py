from dataclasses import dataclass
from typing import List
from datetime import date, timedelta

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import QRAttendanceService, generate_pin
from src.service.nghi_phep_service import NghiPhepService
from src.domain.models.qr_config import QRConfig


@dataclass
class BulkGenerateQRCommand:
    tu_ngay: str
    den_ngay: str
    phong_ban_id: str = None
    vi_tri: dict = None
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"
    exclude_weekends: bool = True


@dataclass
class BulkGenerateQRResult:
    created: int
    skipped: int
    errors: List[dict]


class BulkGenerateQRUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: BulkGenerateQRCommand
    ) -> Result[BulkGenerateQRResult, Error]:
        tu_ngay = date.fromisoformat(command.tu_ngay)
        den_ngay = date.fromisoformat(command.den_ngay)

        created = 0
        skipped = 0
        errors = []

        nghi_phep_service = NghiPhepService()
        all_holidays: set[date] = set()
        for y in range(tu_ngay.year, den_ngay.year + 1):
            all_holidays.update(nghi_phep_service.get_holidays(y))

        current = tu_ngay
        async with self.unit_of_work as uow:
            while current <= den_ngay:
                if command.exclude_weekends and current.weekday() >= 5:
                    skipped += 1
                    current += timedelta(days=1)
                    continue

                if current in all_holidays:
                    skipped += 1
                    current += timedelta(days=1)
                    continue

                existing = await uow.qr_config_repository.find_by_ngay(current)
                if existing:
                    skipped += 1
                    current += timedelta(days=1)
                    continue

                try:
                    qr_payload = QRAttendanceService.generate_qr_payload(
                        ngay=current,
                        phong_ban_id=command.phong_ban_id,
                        vi_tri=command.vi_tri,
                    )

                    from datetime import datetime

                    gio_bat_dau = datetime.strptime(command.gio_bat_dau, "%H:%M").time()
                    gio_ket_thuc = datetime.strptime(
                        command.gio_ket_thuc, "%H:%M"
                    ).time()

                    qr_config = QRConfig(
                        ngay=current,
                        qr_data=qr_payload,
                        mac=qr_payload[:64] if len(qr_payload) >= 64 else qr_payload,
                        gio_bat_dau=gio_bat_dau,
                        gio_ket_thuc=gio_ket_thuc,
                        vi_tri=command.vi_tri.get("name") if command.vi_tri else None,
                        kinh_do=command.vi_tri.get("lat") if command.vi_tri else None,
                        vi_do=command.vi_tri.get("lng") if command.vi_tri else None,
                        ban_kinh_cho_phep=command.vi_tri.get("radius", 100)
                        if command.vi_tri
                        else 100,
                        trang_thai="active",
                        ma_nhap=generate_pin(),
                    )

                    await uow.qr_config_repository.create(qr_config)
                    created += 1

                except Exception as e:
                    errors.append({"ngay": current.isoformat(), "error": str(e)})

                current += timedelta(days=1)

        return Return.ok(
            BulkGenerateQRResult(
                created=created,
                skipped=skipped,
                errors=errors,
            )
        )
