from libs.result import Result, Error, Return


class GetLuongSoSanhUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, thang: int, nam: int) -> Result[dict, Error]:
        async with self.unit_of_work as uow:
            from src.service.bao_cao_service import BaoCaoService

            service = BaoCaoService(uow.session)
            result = await service.get_luong_so_sanh(thang, nam)
            return Return.ok(result)
