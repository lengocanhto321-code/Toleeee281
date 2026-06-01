from dataclasses import dataclass
from typing import Optional
from datetime import date, datetime, time

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import generate_pin
from src.domain.models.qr_config import QRConfig


@dataclass
class GenerateQRCommand:
    ngay: str
    loai: str = "all"
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"


@dataclass
class GenerateQRResult:
    id: str
    ngay: str
    qr_data: str
    ma_nhap: str


class GenerateQRUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: GenerateQRCommand
    ) -> Result[GenerateQRResult, Error]:
        ngay_date = date.fromisoformat(command.ngay)
        gio_bat_dau = datetime.strptime(command.gio_bat_dau, "%H:%M").time()
        gio_ket_thuc = datetime.strptime(command.gio_ket_thuc, "%H:%M").time()

        thoi_gian_hieu_luc = datetime.combine(ngay_date, gio_ket_thuc)
        qr_config = QRConfig(
            ngay=ngay_date,
            loai=command.loai,
            qr_data="",
            thoi_gian_hieu_luc=thoi_gian_hieu_luc,
            mac="",
            gio_bat_dau=gio_bat_dau,
            gio_ket_thuc=gio_ket_thuc,
            trang_thai="active",
            ma_nhap=generate_pin(),
            bat_gps=False,
        )

        async with self.unit_of_work as uow:
            created = await uow.qr_config_repository.create(qr_config)

        return Return.ok(
            GenerateQRResult(
                id=created.id,
                ngay=command.ngay,
                qr_data="",
                ma_nhap=created.ma_nhap,
            )
        )
