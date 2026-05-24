import logging
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.api.schemas.luong import TraLuongResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetTraLuongByKyLuongQuery:
    ky_luong_id: str
    page: int = 1
    page_size: int = 10


@dataclass
class GetTraLuongByKyLuongResult:
    total: int
    items: list[TraLuongResponse]


@dataclass
class GetTraLuongDetailQuery:
    tra_luong_id: str


@dataclass
class GetTraLuongDetailResult:
    tra_luong: TraLuongResponse


class GetTraLuongByKyLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetTraLuongByKyLuongQuery
    ) -> Result[GetTraLuongByKyLuongResult, Error]:
        logger.info(f"Getting tra luong by ky luong: {query.ky_luong_id}")

        async with self.unit_of_work as uow:
            total, items = await uow.tra_luong_repository.get_paginated_by_ky_luong(
                ky_luong_id=query.ky_luong_id,
                page=query.page,
                page_size=query.page_size,
            )

            for item in items:
                nhan_vien = await uow.nhan_vien_repository.find_by_id(item.nhan_vien_id)
                if nhan_vien:
                    item.nhan_vien_ho_ten = nhan_vien.ho_ten

        response_items = []
        for item in items:
            d = serialize_model_to_dict(item)
            if hasattr(item, "nhan_vien_ho_ten"):
                d["nhan_vien_ho_ten"] = item.nhan_vien_ho_ten
            response_items.append(TraLuongResponse(**d))
        return Return.ok(GetTraLuongByKyLuongResult(total=total, items=response_items))


class GetTraLuongDetailUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetTraLuongDetailQuery
    ) -> Result[GetTraLuongDetailResult, Error]:
        logger.info(f"Getting tra luong detail: {query.tra_luong_id}")

        async with self.unit_of_work as uow:
            tra_luong = await uow.tra_luong_repository.find_by_id(query.tra_luong_id)

            if not tra_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy phiếu trả lương",
                        reason="TraLuong not found",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(
                tra_luong.nhan_vien_id
            )
            if nhan_vien:
                tra_luong.nhan_vien_ho_ten = nhan_vien.ho_ten

        resp = serialize_model_to_dict(tra_luong)
        if hasattr(tra_luong, "nhan_vien_ho_ten"):
            resp["nhan_vien_ho_ten"] = tra_luong.nhan_vien_ho_ten
        return Return.ok(GetTraLuongDetailResult(tra_luong=TraLuongResponse(**resp)))
