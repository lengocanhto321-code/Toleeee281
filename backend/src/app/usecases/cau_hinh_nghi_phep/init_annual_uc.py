from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class InitAnnualLeaveCommand:
    nam: int


@dataclass
class InitAnnualLeaveResult:
    created: int
    skipped: int


class InitAnnualLeaveUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: InitAnnualLeaveCommand
    ) -> Result[InitAnnualLeaveResult, Error]:
        async with self.unit_of_work as uow:
            phep_nam_config = await uow.cau_hinh_nghi_phep_repository.find_by_loai(
                "phep_nam"
            )
            so_ngay = phep_nam_config.so_ngay_moi_nam if phep_nam_config else 12.0

            nhan_viens = await uow.nhan_vien_repository.find_by_trang_thai("dang_lam")

            created = 0
            skipped = 0

            for nv in nhan_viens:
                existing = await uow.so_ngay_phep_repository.find_by_nhan_vien_and_year(
                    nv.id, command.nam
                )
                if existing:
                    skipped += 1
                    continue

                await uow.so_ngay_phep_repository.create(
                    nhan_vien_id=nv.id,
                    nam=command.nam,
                    phep_nam_duoc_phep=so_ngay,
                    phep_nam_da_su_dung=0.0,
                    phep_nam_con_lai=so_ngay,
                )
                created += 1

            return Return.ok(InitAnnualLeaveResult(created=created, skipped=skipped))
