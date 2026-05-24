from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.constants import LOAI_NGHI_KEYS, TRANG_THAI_DON_KEYS


@dataclass
class DuyetCap1DonNghiCommand:
    don_id: str
    nguoi_duyet_id: str
    ghi_chu: Optional[str] = None


@dataclass
class DuyetCap1DonNghiResult:
    don: dict


class DuyetCap1DonNghiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DuyetCap1DonNghiCommand
    ) -> Result[DuyetCap1DonNghiResult, Error]:
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

            # Check status cho duyet cap 1
            if don.trang_thai != "cho_duyet_cap_1":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể duyệt cấp 1 đơn ở trạng thái: {don.trang_thai}",
                        reason="Invalid status - must be cho_duyet_cap_1",
                    )
                )

            # Update to cap 2
            from libs.datetime import get_utc_now

            don.trang_thai = "cho_duyet_cap_2"
            don.cap_duyet_hien_tai = 2
            don.nguoi_duyet_cap_1_id = command.nguoi_duyet_id
            don.ngay_duyet_cap_1 = get_utc_now()
            don.ghi_chu_duyet_cap_1 = command.ghi_chu

            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)

        return Return.ok(
            DuyetCap1DonNghiResult(
                don={
                    "id": don.id,
                    "trang_thai": don.trang_thai,
                    "cap_duyet_hien_tai": don.cap_duyet_hien_tai,
                    "ngay_duyet_cap_1": (
                        str(don.ngay_duyet_cap_1) if don.ngay_duyet_cap_1 else None
                    ),
                }
            )
        )


@dataclass
class DuyetCap2DonNghiCommand:
    don_id: str
    nguoi_duyet_id: str
    ghi_chu: Optional[str] = None


@dataclass
class DuyetCap2DonNghiResult:
    don: dict
    phep_con_lai: Optional[float] = None


class DuyetCap2DonNghiUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DuyetCap2DonNghiCommand
    ) -> Result[DuyetCap2DonNghiResult, Error]:
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

            # Check status cho duyet cap 2
            if don.trang_thai != "cho_duyet_cap_2":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể duyệt cấp 2 đơn ở trạng thái: {don.trang_thai}",
                        reason="Invalid status - must be cho_duyet_cap_2",
                    )
                )

            from libs.datetime import get_utc_now

            don.trang_thai = "da_duyet_cap_2"
            don.nguoi_duyet_cap_2_id = command.nguoi_duyet_id
            don.ngay_duyet_cap_2 = get_utc_now()
            don.ghi_chu_duyet_cap_2 = command.ghi_chu

            # Trừ ngày phép nếu là phep_nam
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

            don = await uow.don_xin_nghi_repository.find_by_id(command.don_id)

        return Return.ok(
            DuyetCap2DonNghiResult(
                don={
                    "id": don.id,
                    "trang_thai": don.trang_thai,
                    "ngay_duyet_cap_2": (
                        str(don.ngay_duyet_cap_2) if don.ngay_duyet_cap_2 else None
                    ),
                },
                phep_con_lai=phep_con_lai,
            )
        )
