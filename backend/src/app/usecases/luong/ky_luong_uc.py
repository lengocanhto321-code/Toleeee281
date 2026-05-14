import logging
from dataclasses import dataclass
from typing import Optional

from libs.result import Result, Error, Return
from src.api.schemas.luong import KyLuongResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class GetListKyLuongQuery:
    page: int = 1
    page_size: int = 10
    thang: Optional[int] = None
    nam: Optional[int] = None
    trang_thai: Optional[str] = None


@dataclass
class GetListKyLuongResult:
    total: int
    items: list[KyLuongResponse]


@dataclass
class DuyetKyLuongCommand:
    ky_luong_id: str
    actor_id: str


@dataclass
class DuyetKyLuongResult:
    ky_luong: KyLuongResponse


@dataclass
class ChotKyLuongCommand:
    ky_luong_id: str
    actor_id: str


@dataclass
class ChotKyLuongResult:
    ky_luong: KyLuongResponse


class GetListKyLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, query: GetListKyLuongQuery
    ) -> Result[GetListKyLuongResult, Error]:
        logger.info(f"Getting ky luong list: page={query.page}")

        async with self.unit_of_work as uow:
            total, items = await uow.ky_luong_repository.get_paginated(
                page=query.page,
                page_size=query.page_size,
                thang=query.thang,
                nam=query.nam,
                trang_thai=query.trang_thai,
            )

        response_items = [
            KyLuongResponse(**serialize_model_to_dict(item)) for item in items
        ]
        return Return.ok(GetListKyLuongResult(total=total, items=response_items))


class DuyetKyLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: DuyetKyLuongCommand
    ) -> Result[DuyetKyLuongResult, Error]:
        from libs.datetime import get_utc_now

        logger.info(f"Approving ky luong: {command.ky_luong_id}")

        async with self.unit_of_work as uow:
            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

            if not ky_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy kỳ lương",
                        reason="KyLuong not found",
                    )
                )

            if ky_luong.trang_thai != "chua_duyet":
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Kỳ lương đã được duyệt hoặc đã chốt",
                        reason="Invalid status",
                    )
                )

            await uow.ky_luong_repository.update_trang_thai(
                command.ky_luong_id,
                trang_thai="da_duyet",
                ngay_duyet=get_utc_now(),
                nguoi_duyet=command.actor_id,
            )

            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

        resp = serialize_model_to_dict(ky_luong)
        return Return.ok(DuyetKyLuongResult(ky_luong=KyLuongResponse(**resp)))


class ChotKyLuongUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: ChotKyLuongCommand
    ) -> Result[ChotKyLuongResult, Error]:
        from libs.datetime import get_utc_now

        logger.info(f"Locking ky luong: {command.ky_luong_id}")

        async with self.unit_of_work as uow:
            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

            if not ky_luong:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy kỳ lương",
                        reason="KyLuong not found",
                    )
                )

            if ky_luong.trang_thai not in ["da_duyet"]:
                return Return.err(
                    Error(
                        code="invalid_status",
                        message="Kỳ lương chưa được duyệt",
                        reason="Invalid status",
                    )
                )

            await uow.ky_luong_repository.update_trang_thai(
                command.ky_luong_id,
                trang_thai="da_chot",
            )
            await uow.tra_luong_repository.update_trang_thai_by_ky_luong(
                command.ky_luong_id, "da_chot"
            )

            ky_luong = await uow.ky_luong_repository.find_by_id(command.ky_luong_id)

        resp = serialize_model_to_dict(ky_luong)
        return Return.ok(ChotKyLuongResult(ky_luong=KyLuongResponse(**resp)))
