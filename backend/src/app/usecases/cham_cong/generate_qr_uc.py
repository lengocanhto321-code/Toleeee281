from dataclasses import dataclass
from typing import Optional, List
from datetime import date, datetime, time

from libs.result import Result, Error, Return
from src.service.qr_attendance_service import QRAttendanceService, generate_pin
from src.domain.models.qr_config import QRConfig


@dataclass
class GenerateQRCommand:
    ngay: str
    loai: str = "all"
    phong_ban_id: Optional[str] = None
    vi_tri: Optional[dict] = None
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"
    bat_gps: bool = True


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
        ngay = date.fromisoformat(command.ngay)

        qr_payload = QRAttendanceService.generate_qr_payload(
            ngay=ngay,
            phong_ban_id=command.phong_ban_id,
            vi_tri=command.vi_tri,
            loai=command.loai,
        )

        ngay_date = datetime.strptime(command.ngay, "%Y-%m-%d").date()
        gio_bat_dau = datetime.strptime(command.gio_bat_dau, "%H:%M").time()
        gio_ket_thuc = datetime.strptime(command.gio_ket_thuc, "%H:%M").time()

        thoi_gian_hieu_luc = datetime.combine(ngay_date, gio_ket_thuc)
        qr_config = QRConfig(
            ngay=ngay_date,
            loai=command.loai,
            qr_data=qr_payload,
            thoi_gian_hieu_luc=thoi_gian_hieu_luc,
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
            bat_gps=command.bat_gps,
        )

        async with self.unit_of_work as uow:
            created = await uow.qr_config_repository.create(qr_config)

        return Return.ok(
            GenerateQRResult(
                id=created.id,
                ngay=command.ngay,
                qr_data=qr_payload,
                ma_nhap=created.ma_nhap,
            )
        )
