from dataclasses import dataclass

from libs.result import Result, Error, Return


@dataclass
class GetQRDetailQuery:
    qr_id: str


@dataclass
class GetQRDetailResult:
    data: dict


class GetQRDetailUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetQRDetailQuery
    ) -> Result[GetQRDetailResult, Error]:
        async with self.unit_of_work as uow:
            qr = await uow.qr_config_repository.find_by_id(query.qr_id)

            if not qr:
                return Return.err(
                    Error(code="not_found", message="Không tìm thấy QR code")
                )

            return Return.ok(GetQRDetailResult(data=qr.to_dict()))
