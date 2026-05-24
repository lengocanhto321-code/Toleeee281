import logging
from dataclasses import dataclass
from typing import Optional, List

from libs.result import Result, Error, Return
from src.api.schemas.sub_modules import KhenThuongKyLuatResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListKhenThuongKyLuatQuery:
    nhan_vien_id: str
    loai: Optional[str] = None


@dataclass
class GetListKhenThuongKyLuatResult:
    items: List[KhenThuongKyLuatResponse]


class GetListKhenThuongKyLuatUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListKhenThuongKyLuatQuery
    ) -> Result[GetListKhenThuongKyLuatResult, Error]:
        logger.info(f"Getting KhenThuongKyLuat list for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            items = await uow.khen_thuong_ky_luat_repository.get_by_nhan_vien_id(
                query.nhan_vien_id, loai=query.loai
            )
            response_items = [
                KhenThuongKyLuatResponse(**serialize_model_to_dict(i)) for i in items
            ]
            return Return.ok(GetListKhenThuongKyLuatResult(items=response_items))
