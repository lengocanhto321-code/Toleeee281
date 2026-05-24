from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class DeleteCauHinhCommand:
    id: str


@dataclass
class DeleteCauHinhResult:
    pass


class DeleteCauHinhNghiPhepUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DeleteCauHinhCommand
    ) -> Result[DeleteCauHinhResult, Error]:
        async with self.unit_of_work as uow:
            success = await uow.cau_hinh_nghi_phep_repository.delete(command.id)

            if not success:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy cấu hình")
                )

            return Return.ok(DeleteCauHinhResult())
