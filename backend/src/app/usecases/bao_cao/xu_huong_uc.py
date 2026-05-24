from libs.result import Result, Error, Return


class GetXuHuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, so_thang: int = 12) -> Result[dict, Error]:
        async with self.unit_of_work as uow:
            from src.service.bao_cao_service import BaoCaoService

            service = BaoCaoService(uow.session)
            result = await service.get_xu_huong(so_thang)
            return Return.ok(result)
