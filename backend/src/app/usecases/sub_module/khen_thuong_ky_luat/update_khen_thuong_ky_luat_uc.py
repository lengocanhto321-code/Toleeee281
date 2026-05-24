import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional

from libs.result import Result, Error, Return
from src.domain.models.audit_log import AuditLog
from src.api.schemas.sub_modules import (
    KhenThuongKyLuatUpdateRequest,
    KhenThuongKyLuatResponse,
)
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


def _parse_optional_date(value: Optional[str]) -> Optional[date]:
    if value is None:
        return None
    return date.fromisoformat(value)


@dataclass
class UpdateKhenThuongKyLuatCommand:
    nhan_vien_id: str
    item_id: str
    data: KhenThuongKyLuatUpdateRequest
    actor_id: str


@dataclass
class UpdateKhenThuongKyLuatResult:
    item: KhenThuongKyLuatResponse


class UpdateKhenThuongKyLuatUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateKhenThuongKyLuatCommand
    ) -> Result[UpdateKhenThuongKyLuatResult, Error]:
        logger.info(
            f"User {command.actor_id} updating KhenThuongKyLuat {command.item_id}"
        )

        async with self.unit_of_work as uow:
            item = await uow.khen_thuong_ky_luat_repository.find_by_id(command.item_id)
            if not item or item.nhan_vien_id != command.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy khen thưởng/kỷ luật",
                        reason="NotFound",
                    )
                )

            old_data = serialize_model_to_dict(item)

            update_data = command.data.model_dump(exclude_unset=True)
            update_data["ngay_quyet_dinh"] = _parse_optional_date(
                update_data.get("ngay_quyet_dinh")
            )
            update_data["thoi_han_ky_luat"] = _parse_optional_date(
                update_data.get("thoi_han_ky_luat")
            )

            for field, value in update_data.items():
                setattr(item, field, value)

            updated = await uow.khen_thuong_ky_luat_repository.update(item)

            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="UPDATE",
                bang_du_lieu="khen_thuong_ky_luat",
                ban_ghi_id=updated.id,
                du_lieu_cu=old_data,
                du_lieu_moi=serialize_model_to_dict(updated),
                ghi_chu=f"Cập nhật khen thưởng/kỷ luật cho nhân viên {command.nhan_vien_id}",
            )
            await uow.audit_log_repository.create(audit_log)

            return Return.ok(
                UpdateKhenThuongKyLuatResult(
                    item=KhenThuongKyLuatResponse(**serialize_model_to_dict(updated))
                )
            )
