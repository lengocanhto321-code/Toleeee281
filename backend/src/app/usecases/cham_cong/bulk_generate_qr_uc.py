from dataclasses import dataclass
from typing import List
from datetime import date, timedelta, datetime

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import generate_pin
from src.service.nghi_phep_service import NghiPhepService
from src.domain.models.qr_config import QRConfig


@dataclass
class BulkGenerateQRCommand:
    tu_ngay: str
    den_ngay: str
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
                    qr_config = QRConfig(
                        ngay=current,
                        qr_data="",
                        mac="",
                        trang_thai="active",
                        ma_nhap=generate_pin(),
                        bat_gps=False,
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
