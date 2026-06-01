import sys
import asyncio
sys.path.insert(0, '.')
from src.service.unit_of_work import UnitOfWork
from src.app.usecases.nhan_vien.batch_phan_bo_uc import BatchPhanBoUseCase, BatchPhanBoCommand
import config
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

async def main():
    settings = config.config
    engine = create_async_engine(settings.DB_URI, future=True, echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with UnitOfWork(Session) as uow:
        use_case = BatchPhanBoUseCase(uow)
        cmd = BatchPhanBoCommand(
            nhan_vien_ids=['65120996eedf4c1ca33455dd7bd12314'],
            phong_ban_id='164afeb549f640999763a0c2e53771bc',
            actor_id='77c75524357d45268112de350986946d'
        )
        result = await use_case.execute(cmd)
        print('type', type(result))
        print('is_ok', getattr(result,'is_ok',None))
        print('value', result.value)

asyncio.run(main())
