import logging
from libs.result import Result, Error, Return
from src.app.usecases.employee.commands import (
    UpdateEmployeeProfileCommand,
    UpdateEmployeeProfileResult,
)

logger = logging.getLogger(__name__)


class UpdateEmployeeProfileUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: UpdateEmployeeProfileCommand
    ) -> Result[UpdateEmployeeProfileResult, Error]:
        logger.info(f"Updating profile for user_id={command.user_id}")

        async with self.unit_of_work as uow:
            tai_khoan = await uow.rbac_repository.get_tai_khoan_by_id(command.user_id)
            if not tai_khoan or not tai_khoan.nhan_vien_id:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy thông tin nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            nhan_vien = await uow.nhan_vien_repository.find_by_id(
                tai_khoan.nhan_vien_id
            )
            if not nhan_vien:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy nhân viên",
                        reason="NhanVienNotFound",
                    )
                )

            if command.email is not None:
                nhan_vien.email = command.email
            if command.so_dien_thoai is not None:
                nhan_vien.so_dien_thoai = command.so_dien_thoai
            if command.dia_chi is not None:
                nhan_vien.dia_chi_tam_tru = command.dia_chi

            await uow.nhan_vien_repository.update(nhan_vien)

            profile = {
                "id": nhan_vien.id,
                "email": nhan_vien.email,
                "so_dien_thoai": nhan_vien.so_dien_thoai,
                "dia_chi": nhan_vien.dia_chi_tam_tru,
            }

            return Return.ok(UpdateEmployeeProfileResult(profile=profile))
