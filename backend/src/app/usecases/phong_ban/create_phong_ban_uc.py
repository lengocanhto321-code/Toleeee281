import logging
from dataclasses import dataclass
from sqlalchemy.exc import IntegrityError

from libs.result import Result, Error, Return
from src.domain.models.phong_ban import PhongBan
from src.domain.models.audit_log import AuditLog
from src.api.schemas.phong_ban import PhongBanCreateRequest, PhongBanDataResponse
from src.app.usecases.phong_ban.helpers import serialize_model_to_dict

logger = logging.getLogger(__name__)


@dataclass
class CreatePhongBanCommand:
    data: PhongBanCreateRequest
    actor_id: str


@dataclass
class CreatePhongBanResult:
    phong_ban: PhongBanDataResponse


class CreatePhongBanUseCase:
    """Use case for creating a PhongBan."""

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: CreatePhongBanCommand) -> Result[CreatePhongBanResult, Error]:
        """Execute create phong ban use case."""
        logger.info(f"User {command.actor_id} is creating PhongBan {command.data.ma_phong_ban}")

        async with self.unit_of_work as uow:
            phong_ban_repo = uow.phong_ban_repository
            audit_repo = uow.audit_log_repository

            # Create new PhongBan
            new_pb = PhongBan(
                ma_phong_ban=command.data.ma_phong_ban,
                ten_phong_ban=command.data.ten_phong_ban,
                loai=command.data.loai,
                mo_ta=command.data.mo_ta,
                truong_phong=command.data.truong_phong,
                so_dien_thoai=command.data.so_dien_thoai,
                email=command.data.email,
                trang_thai=command.data.trang_thai,
            )
            
            try:
                created_pb = await phong_ban_repo.create(new_pb)
            except IntegrityError as e:
                return Return.err(
                    Error(
                        code="code_already_exists",
                        message="Mã phòng ban đã tồn tại.",
                        reason="Conflict"
                    )
                )

            # Audit Log
            audit_log = AuditLog(
                tai_khoan_id=command.actor_id,
                hanh_dong="CREATE",
                bang_du_lieu="phong_ban",
                ban_ghi_id=created_pb.id,
                du_lieu_cu=None,
                du_lieu_moi=command.data.model_dump(),
                ghi_chu="Tạo mới phòng ban"
            )
            await audit_repo.create(audit_log)

            # For response mapping
            resp = serialize_model_to_dict(created_pb)
            resp["so_luong_nhan_vien"] = 0
            resp["so_luong_dang_lam"] = 0
            
            response_data = PhongBanDataResponse(**resp)

            return Return.ok(CreatePhongBanResult(phong_ban=response_data))
