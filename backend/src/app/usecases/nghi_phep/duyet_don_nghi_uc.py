from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.app.usecases.nghi_phep.sync_cham_cong_uc import (
    sync_cham_cong_thang_for_nhan_vien,
)
from src.constants import LOAI_NGHI_KEYS, TRANG_THAI_DON_KEYS


@dataclass
class DuyetDonNghiCommand:
    don_id: str
    nguoi_duyet_id: str
    ghi_chu: Optional[str] = None


@dataclass
class DuyetDonNghiResult:
    don: dict
    phep_con_lai: Optional[float] = None


class DuyetDonNghiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DuyetDonNghiCommand
    ) -> Result[DuyetDonNghiResult, Error]:
        async with self.unit_of_work as uow:
            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)
            if not don:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy đơn nghỉ phép",
                        reason="DonXinNghi not found",
                    )
                )

            if don.trang_thai != TRANG_THAI_DON_KEYS[0]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể duyệt đơn ở trạng thái: {don.trang_thai}",
                        reason="Invalid status",
                    )
                )

            await uow.don_xin_nghi_repository.update_trang_thai(
                don.id,
                trang_thai=TRANG_THAI_DON_KEYS[1],
                nguoi_duyet_id=command.nguoi_duyet_id,
                ghi_chu=command.ghi_chu,
            )

            phep_con_lai = None
            if don.loai_nghi == LOAI_NGHI_KEYS[0]:
                so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                    don.nhan_vien_id, don.tu_ngay.year
                )
                phep_nam_da_su_dung = float(
                    so_ngay_phep.phep_nam_da_su_dung or 0
                ) + float(don.so_ngay)
                phep_nam_con_lai = (
                    float(so_ngay_phep.phep_nam_duoc_phep) - phep_nam_da_su_dung
                )
                phep_nam_con_lai = max(0, phep_nam_con_lai)

                await uow.so_ngay_phep_repository.update_con_lai(
                    so_ngay_phep.id,
                    phep_nam_da_su_dung=phep_nam_da_su_dung,
                    phep_nam_con_lai=phep_nam_con_lai,
                )
                phep_con_lai = phep_nam_con_lai

            await sync_cham_cong_thang_for_nhan_vien(
                uow, don.nhan_vien_id, don.tu_ngay.month, don.tu_ngay.year
            )

            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)

        return Return.ok(
            DuyetDonNghiResult(
                don={
                    "id": don.id,
                    "trang_thai": don.trang_thai,
                    "ngay_duyet": str(don.ngay_duyet) if don.ngay_duyet else None,
                },
                phep_con_lai=phep_con_lai,
            )
        )
