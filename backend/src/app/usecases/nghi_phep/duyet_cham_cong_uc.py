from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class DuyetChamCongCommand:
    cham_cong_id: str


@dataclass
class DuyetChamCongResult:
    id: str


class DuyetChamCongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DuyetChamCongCommand
    ) -> Result[DuyetChamCongResult, Error]:
        async with self.unit_of_work as uow:
            cham_cong = await uow.cham_cong_thang_repository.find_by_id(
                command.cham_cong_id
            )
            if not cham_cong:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy chấm công")
                )

            if cham_cong.trang_thai != "da_xac_nhan":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message=f"Trạng thái không hợp lệ: {cham_cong.trang_thai}",
                    )
                )

            cham_cong.trang_thai = "da_duyet"

            return Return.ok(DuyetChamCongResult(id=cham_cong.id))
