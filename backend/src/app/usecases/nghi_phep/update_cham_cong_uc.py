from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.service.cham_cong_service import ChamCongService


@dataclass
class UpdateChamCongThangCommand:
    cham_cong_id: str
    so_ngay_co_mat: Optional[int] = None
    so_ngay_vang_co_phep: Optional[int] = None
    so_ngay_vang_khong_phep: Optional[int] = None
    so_ngay_nghi_le_tet: Optional[int] = None
    so_ngay_cong_tac: Optional[int] = None
    ghi_chu: Optional[str] = None


@dataclass
class UpdateChamCongThangResult:
    id: str


class UpdateChamCongThangUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work
        self.service = ChamCongService()

    async def execute(
        self, command: UpdateChamCongThangCommand
    ) -> Result[UpdateChamCongThangResult, Error]:
        async with self.unit_of_work as uow:
            cham_cong = await uow.cham_cong_thang_repository.find_by_id(
                command.cham_cong_id
            )
            if not cham_cong:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy chấm công")
                )

            if cham_cong.trang_thai not in ("chua_chot", "da_mock"):
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Không thể sửa khi đã xác nhận (status: {cham_cong.trang_thai})",
                    )
                )

            if command.so_ngay_co_mat is not None:
                cham_cong.so_ngay_co_mat = command.so_ngay_co_mat
            if command.so_ngay_vang_co_phep is not None:
                cham_cong.so_ngay_vang_co_phep = command.so_ngay_vang_co_phep
            if command.so_ngay_vang_khong_phep is not None:
                cham_cong.so_ngay_vang_khong_phep = command.so_ngay_vang_khong_phep
            if command.so_ngay_nghi_le_tet is not None:
                cham_cong.so_ngay_nghi_le_tet = command.so_ngay_nghi_le_tet
            if command.so_ngay_cong_tac is not None:
                cham_cong.so_ngay_cong_tac = command.so_ngay_cong_tac

            he_so = self.service.tinh_he_so_ngay_cong(
                so_ngay_co_mat=float(cham_cong.so_ngay_co_mat or 0),
                so_ngay_vang_co_phep=float(cham_cong.so_ngay_vang_co_phep or 0),
                so_ngay_cong_tac=float(cham_cong.so_ngay_cong_tac or 0),
                so_ngay_nghi_le_tet=float(cham_cong.so_ngay_nghi_le_tet or 0),
                so_ngay_lam_chuan=float(cham_cong.so_ngay_lam_chuan or 26),
                so_ngay_vang_khong_phep=float(cham_cong.so_ngay_vang_khong_phep or 0),
            )
            cham_cong.he_so_ngay_cong = he_so

            if cham_cong.trang_thai == "da_mock":
                cham_cong.trang_thai = "chua_chot"

            return Return.ok(UpdateChamCongThangResult(id=cham_cong.id))
