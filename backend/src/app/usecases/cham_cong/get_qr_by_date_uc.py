from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return


@dataclass
class GetQRByDateQuery:
    ngay: str
    loai: Optional[str] = None


@dataclass
class QRCodeData:
    id: str
    ngay: str
    loai: str
    qr_data: str
    qr_image_base64: Optional[str] = None
    gio_bat_dau: str = "07:00"
    gio_ket_thuc: str = "17:30"
    vi_tri: Optional[str] = None
    trang_thai: str = "active"
    bat_gps: bool = True
    kinh_do: Optional[float] = None
    vi_do: Optional[float] = None
    ban_kinh_cho_phep: int = 100
    ma_nhap: Optional[str] = None


@dataclass
class GetQRByDateResult:
    qr_codes: List[QRCodeData]


class GetQRByDateUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetQRByDateQuery
    ) -> Result[GetQRByDateResult, Error]:
        from datetime import date

        ngay = date.fromisoformat(query.ngay)

        async with self.unit_of_work as uow:
            qr_configs = await uow.qr_config_repository.find_by_ngay(ngay, query.loai)

        qr_codes = []
        for qr_config in qr_configs:
            qr_image = None
            if qr_config.qr_image_base64:
                qr_image = qr_config.qr_image_base64

            qr_codes.append(
                QRCodeData(
                    id=qr_config.id,
                    ngay=query.ngay,
                    loai=qr_config.loai,
                    qr_data=qr_config.qr_data,
                    qr_image_base64=qr_image,
                    gio_bat_dau=qr_config.gio_bat_dau.strftime("%H:%M")
                    if qr_config.gio_bat_dau
                    else "07:00",
                    gio_ket_thuc=qr_config.gio_ket_thuc.strftime("%H:%M")
                    if qr_config.gio_ket_thuc
                    else "17:30",
                    vi_tri=qr_config.vi_tri,
                    trang_thai=qr_config.trang_thai,
                    bat_gps=qr_config.bat_gps,
                    kinh_do=qr_config.kinh_do,
                    vi_do=qr_config.vi_do,
                    ban_kinh_cho_phep=qr_config.ban_kinh_cho_phep,
                    ma_nhap=qr_config.ma_nhap,
                )
            )

        return Return.ok(GetQRByDateResult(qr_codes=qr_codes))
