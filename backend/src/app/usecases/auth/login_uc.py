import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any

from libs.result import Result, Error, Return
from src.service.auth_service import AuthService

logger = logging.getLogger(__name__)


@dataclass
class LoginCommand:
    """Command for login use case."""
    username: str
    password: str


@dataclass
class LoginResult:
    """Result of successful login."""
    access_token: str
    refresh_token: str
    user: Dict[str, Any]
    access_expire: datetime
    refresh_expire: datetime


class LoginUseCase:
    """Use case for user login."""

    def __init__(self, unit_of_work, auth_service: AuthService):
        self.unit_of_work = unit_of_work
        self.auth_service = auth_service

    async def execute(self, command: LoginCommand) -> Result[LoginResult, Error]:
        """Execute login use case."""
        logger.info(f"Login attempt for username: '{command.username}'")

        async with self.unit_of_work as uow:
            user_repository = uow.user_repository

            # Find user by username
            user = await user_repository.find_by_username(command.username)

            if not user:
                logger.warning(f"Login failed: User not found with username='{command.username}'")
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Sai tên đăng nhập hoặc mật khẩu",
                        reason="User not found",
                    )
                )

            logger.debug(f"User found: id='{user.id}', username='{user.ten_dang_nhap}'")

            # Check if user is active (trang_thai)
            if not user.trang_thai:
                logger.warning(f"Login failed: User account is inactive, id='{user.id}'")
                return Return.err(
                    Error(
                        code="inactive_account",
                        message="Tài khoản của bạn đã bị khóa",
                        reason="User account is inactive",
                    )
                )

            # Verify password
            valid = await AuthService.verify_password(command.password, user.mat_khau_hash)
            if not valid:
                logger.warning(f"Login failed: Invalid password for user id='{user.id}'")
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Sai tên đăng nhập hoặc mật khẩu",
                        reason="Invalid password",
                    )
                )

            # Generate access token
            logger.info(f"Generating JWT token for user '{user.id}'")
            token, expire = await self.auth_service.create_access_token(
                user.id,
                email=user.email,
                username=user.ten_dang_nhap,
            )

            # Generate refresh token
            logger.info(f"Generating refresh token for user '{user.id}'")
            refresh_token, refresh_expire = (
                await self.auth_service.create_refresh_token(user.id)
            )

            await uow.commit()

            # Return success result
            return Return.ok(
                LoginResult(
                    access_token=token,
                    refresh_token=refresh_token,
                    user={
                        "id": str(user.id),
                        "username": user.ten_dang_nhap,
                        "email": user.email,
                        "role": user.vai_tro,
                        "is_active": user.trang_thai,
                        "nhan_vien_id": str(user.nhan_vien_id) if user.nhan_vien_id else None,
                    },
                    access_expire=expire,
                    refresh_expire=refresh_expire,
                )
            )