import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError

from libs.result import Result, Error, Return
from src.domain.models.chuc_vu import ChucVu
from src.domain.models.audit_log import AuditLog
from src.api.schemas.chuc_vu import ChucVuCreateRequest, ChucVuDataResponse
from src.app.usecases.nhan_vien.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreateChucVuCommand:
    data: ChucVuCreateRequest
    actor_id: str


@dataclass
class CreateChucVuResult:
    chuc_vu: ChucVuDataResponse


class CreateChucVuUseCase:
    """Use case for creating a ChucVu."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: CreateChucVuCommand) -> Result[CreateChucVuResult, Error]:
        """Execute create chuc vu use case."""
        logger.info(f"User {command.actor_id} is creating ChucVu {command.data.ma_chuc_vu}")

        async with self.unit_of_work as uow:
            chuc_vu_repo = uow.chuc_vu_repository
            audit_repo = uow.audit_log_repository

            # Create new ChucVu
            new_cv = ChucVu(
                ma_chuc_vu=command.data.ma_chuc_vu,
                ten_chuc_vu=command.data.ten_chuc_vu,
                he_so_phu_cap=command.data.he_so_phu_cap,
                mo_ta=command.data.mo_ta,
                tieu_chuan=command.data.tieu_chuan,
                trang_thai=command.data.trang_thai,
                cap_bac=command.data.cap_bac if hasattr(command.data, 'cap_bac') else 1,
            )

            try:
                created_cv = await chuc_vu_repo.create(new_cv)
            except IntegrityError as e:
                await uow.rollback()
                logger.error(f"IntegrityError creating ChucVu: {str(e)}")
                return Return.err(
                    Error(
                        code="code_exists",
                        message="Mã chức vụ đã tồn tại",
                        reason="Conflict"
                    )
                )

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="chuc_vu",
                ban_ghi_id=created_cv.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(mode="json"),
                ghi_chu="Tạo mới chức vụ"
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(created_cv)
            response_data = ChucVuDataResponse(**resp)

            logger.info(f"ChucVu {created_cv.ma_chuc_vu} created successfully")
            return Return.ok(CreateChucVuResult(chuc_vu=response_data))
