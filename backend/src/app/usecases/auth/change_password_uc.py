from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.service.auth_service import AuthService


@dataclass
class ChangePasswordCommand:
    user_id: str
    old_password: str
    new_password: str


class ChangePasswordUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(self, command: ChangePasswordCommand) -> Result[bool, Error]:
        async with self.unit_of_work as uow:
            tai_khoan = await uow.user_repository.find_by_id(command.user_id)
            if not tai_khoan:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy tài khoản",
                        reason="AccountNotFound",
                    )
                )

            valid = await AuthService.verify_password(
                command.old_password, tai_khoan.mat_khau_hash
            )
            if not valid:
                return Return.err(
                    Error(
                        code="wrong_password",
                        message="Mật khẩu cũ không đúng",
                        reason="WrongPassword",
                    )
                )

            if len(command.new_password) < 6:
                return Return.err(
                    Error(
                        code="weak_password",
                        message="Mật khẩu mới phải có ít nhất 6 ký tự",
                        reason="WeakPassword",
                    )
                )

            tai_khoan.mat_khau_hash = await AuthService.hash_password(
                command.new_password
            )
            await uow.user_repository._session.flush()

        return Return.ok(True)
