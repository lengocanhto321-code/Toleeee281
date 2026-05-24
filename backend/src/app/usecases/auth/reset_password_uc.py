import secrets
import string
from dataclasses import dataclass

from libs.result import Result, Error, Return
from src.service.auth_service import AuthService


def generate_random_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%"
    while True:
        pw = "".join(secrets.choice(chars) for _ in range(length))
        has_upper = any(c.isupper() for c in pw)
        has_lower = any(c.islower() for c in pw)
        has_digit = any(c.isdigit() for c in pw)
        if has_upper and has_lower and has_digit:
            return pw


@dataclass
class ResetPasswordCommand:
    nhan_vien_id: str


@dataclass
class ResetPasswordResult:
    ten_dang_nhap: str
    mat_khau_moi: str


class ResetPasswordUseCase:
    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    async def execute(
        self, command: ResetPasswordCommand
    ) -> Result[ResetPasswordResult, Error]:
        new_password = generate_random_password()

        async with self.unit_of_work as uow:
            tai_khoan = await uow.user_repository.find_by_nhan_vien_id(
                command.nhan_vien_id
            )
            if not tai_khoan:
                return Return.err(
                    Error(
                        code="not_found",
                        message="Không tìm thấy tài khoản",
                        reason="AccountNotFound",
                    )
                )

            tai_khoan.mat_khau_hash = await AuthService.hash_password(new_password)
            await uow.user_repository._session.flush()

        return Return.ok(
            ResetPasswordResult(
                ten_dang_nhap=tai_khoan.ten_dang_nhap,
                mat_khau_moi=new_password,
            )
        )
