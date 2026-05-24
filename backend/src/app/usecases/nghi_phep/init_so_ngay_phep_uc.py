from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class InitSoNgayPhepCommand:
    nhan_vien_id: str
    nam: int
    so_ngay_phep: float = 12


@dataclass
class InitSoNgayPhepResult:
    so_ngay_phep: dict


class InitSoNgayPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: InitSoNgayPhepCommand
    ) -> Result[InitSoNgayPhepResult, Error]:
        async with self.unit_of_work as uow:
            so_ngay_phep = await uow.so_ngay_phep_repository.find_or_create(
                nhan_vien_id=command.nhan_vien_id,
                nam=command.nam,
                so_ngay_phep_mac_dinh=command.so_ngay_phep,
            )

        return Return.ok(
            InitSoNgayPhepResult(
                so_ngay_phep={
                    "id": so_ngay_phep.id,
                    "nhan_vien_id": so_ngay_phep.nhan_vien_id,
                    "nam": so_ngay_phep.nam,
                    "phep_nam_duoc_phep": float(so_ngay_phep.phep_nam_duoc_phep),
                    "phep_nam_da_su_dung": float(so_ngay_phep.phep_nam_da_su_dung),
                    "phep_nam_con_lai": float(so_ngay_phep.phep_nam_con_lai),
                }
            )
        )
