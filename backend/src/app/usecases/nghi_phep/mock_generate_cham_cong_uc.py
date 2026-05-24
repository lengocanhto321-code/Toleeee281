from dataclasses import dataclass
from typing import Optional, List
from datetime import date

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService
from src.service.nghi_phep_service import NghiPhepService


@dataclass
class MockGenerateChamCongCommand:
    thang: int
    nam: int
    nhan_vien_ids: Optional[List[str]] = None


@dataclass
class MockGenerateChamCongResult:
    total: int
    created: int
    updated: int


class MockGenerateChamCongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, command: MockGenerateChamCongCommand
    ) -> Result[MockGenerateChamCongResult, Error]:
        created = 0
        updated = 0

        async with self.unit_of_work as uow:
            if command.nhan_vien_ids:
                nhan_viens = []
                for nv_id in command.nhan_vien_ids:
                    nv = await uow.nhan_vien_repository.find_by_id(nv_id)
                    if nv and nv.trang_thai == "dang_lam":
                        nhan_viens.append(nv)
            else:
                nhan_viens = await uow.nhan_vien_repository.find_all_by_status(
                    "dang_lam"
                )

        for nhan_vien in nhan_viens:
            tu_ngay = date(command.nam, command.thang, 1)
            if command.thang == 12:
                den_ngay = date(command.nam + 1, 1, 1) - __import__(
                    "datetime"
                ).timedelta(days=1)
            else:
                den_ngay = date(command.nam, command.thang + 1, 1) - __import__(
                    "datetime"
                ).timedelta(days=1)

            async with self.unit_of_work as uow:
                don_nghi_list = await uow.don_xin_nghi_repository.find_by_date_range(
                    nhan_vien.id, tu_ngay, den_ngay
                )

            danh_sach_nghi = []
            for don in don_nghi_list:
                danh_sach_nghi.append(
                    {
                        "loai_nghi": don.loai_nghi,
                        "so_ngay": float(don.so_ngay),
                    }
                )

            so_ngay_lam_viec = self.service.tinh_so_ngay_lam_viec_thang(
                command.thang, command.nam
            )

            nghi_phep_service = NghiPhepService()
            holidays = nghi_phep_service.get_holidays(command.nam)
            so_ngay_nghi_le_tet = sum(
                1 for h in holidays if h.month == command.thang and h.weekday() < 5
            )
            so_ngay_nghi_le_tet = float(so_ngay_nghi_le_tet)

            ket_qua = self.service.mock_tinh_cham_cong_thang(
                so_ngay_lam_viec_trong_thang=so_ngay_lam_viec,
                danh_sach_nghi=danh_sach_nghi,
                so_ngay_nghi_le_tet=so_ngay_nghi_le_tet,
            )

            async with self.unit_of_work as uow:
                (
                    existing,
                    was_created,
                ) = await uow.cham_cong_thang_repository.find_or_create(
                    nhan_vien.id, command.thang, command.nam
                )

                await uow.cham_cong_thang_repository.upsert(
                    nhan_vien_id=nhan_vien.id,
                    thang=command.thang,
                    nam=command.nam,
                    so_ngay_co_mat=ket_qua["so_ngay_co_mat"],
                    so_ngay_vang_co_phep=ket_qua["so_ngay_vang_co_phep"],
                    so_ngay_vang_khong_phep=ket_qua["so_ngay_vang_khong_phep"],
                    so_ngay_nghi_le_tet=ket_qua["so_ngay_nghi_le_tet"],
                    so_ngay_cong_tac=ket_qua["so_ngay_cong_tac"],
                    he_so_ngay_cong=ket_qua["he_so_ngay_cong"],
                )

                if was_created:
                    created += 1
                else:
                    updated += 1

        return Return.ok(
            MockGenerateChamCongResult(
                total=len(nhan_viens),
                created=created,
                updated=updated,
            )
        )
