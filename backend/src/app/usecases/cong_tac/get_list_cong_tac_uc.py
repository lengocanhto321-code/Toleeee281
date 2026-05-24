import logging
from dataclasses import dataclass
from typing import List

from libs.result import Result, Error, Return
from src.api.schemas.cong_tac import CongTacResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListCongTacQuery:
    nhan_vien_id: str


@dataclass
class GetListCongTacResult:
    items: List[CongTacResponse]


class GetListCongTacUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListCongTacQuery
    ) -> Result[GetListCongTacResult, Error]:
        logger.info(f"Getting CongTac list for nhan_vien={query.nhan_vien_id}")

        async with self.unit_of_work as uow:
            items = await uow.cong_tac_repository.get_by_nhan_vien_id(
                query.nhan_vien_id
            )
            response_items = []
            for i in items:
                item_dict = serialize_model_to_dict(i)
                phong_ban = await uow.phong_ban_repository.find_by_id(i.phong_ban_id)
                if phong_ban:
                    item_dict["phong_ban"] = {
                        "id": phong_ban.id,
                        "ten_phong_ban": phong_ban.ten_phong_ban,
                    }
                chuc_vu = await uow.chuc_vu_repository.find_by_id(i.chuc_vu_id)
                if chuc_vu:
                    item_dict["chuc_vu"] = {
                        "id": chuc_vu.id,
                        "ten_chuc_vu": chuc_vu.ten_chuc_vu,
                    }
                response_items.append(CongTacResponse(**item_dict))
            return Return.ok(GetListCongTacResult(items=response_items))
