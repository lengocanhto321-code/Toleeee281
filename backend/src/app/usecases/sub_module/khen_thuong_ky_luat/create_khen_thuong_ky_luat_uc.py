import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional

from libs.result import Result, Error, Return
from src.domain.models.khen_thuong_ky_luat import KhenThuongKyLuat
from src.domain.models.audit_log import AuditLog
from src.api.schemas.sub_modules import (
    KhenThuongKyLuatCreateRequest,
    KhenThuongKyLuatResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


def _parse_optional_date(value: Optional[str]) -> Optional[date]:
    if value is None:
        return None
    return date.fromisoformat(value)


@dataclass
class CreateKhenThuongKyLuatCommand:
    nhan_vien_id: str
    data: KhenThuongKyLuatCreateRequest
    actor_id: str


@dataclass
class CreateKhenThuongKyLuatResult:
    item: KhenThuongKyLuatResponse


class CreateKhenThuongKyLuatUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: CreateKhenThuongKyLuatCommand
    ) -> Result[CreateKhenThuongKyLuatResult, Error]:
        logger.info(
            f"User {command.actor_id} creating KhenThuongKyLuat for nhan_vien={command.nhan_vien_id}"
        )

        async with self.unit_of_work as uow:
            data = command.data.model_dump()
            data["ngay_quyet_dinh"] = _parse_optional_date(data.get("ngay_quyet_dinh"))
            data["thoi_han_ky_luat"] = _parse_optional_date(
                data.get("thoi_han_ky_luat")
            )

            kt = KhenThuongKyLuat(nhan_vien_id=command.nhan_vien_id, **data)
            created = await uow.khen_thuong_ky_luat_repository.create(kt)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="khen_thuong_ky_luat",
                ban_ghi_id=created.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu=f"Thêm {command.data.loai} cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                CreateKhenThuongKyLuatResult(
                    item=KhenThuongKyLuatResponse(**serialize_model_to_dict(created))
                )
            )
