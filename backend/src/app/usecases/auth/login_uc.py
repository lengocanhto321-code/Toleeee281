import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, List

from libs.result import Result, Error, Return
from src.service.auth_service import AuthService
from src.service.rbac_service import RBACService

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

            user = await user_repository.find_by_username(command.username)

            if not user:
                logger.warning(
                    f"Login failed: User not found with username='{command.username}'"
                )
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Sai tên đăng nhập hoặc mật khẩu",
                        reason="User not found",
                    )
                )

            logger.debug(f"User found: id='{user.id}', username='{user.ten_dang_nhap}'")

            if not user.trang_thai:
                logger.warning(
                    f"Login failed: User account is inactive, id='{user.id}'"
                )
                return Return.err(
                    Error(
                        code="inactive_account",
                        message="Tài khoản của bạn đã bị khóa",
                        reason="User account is inactive",
                    )
                )

            valid = await AuthService.verify_password(
                command.password, user.mat_khau_hash
            )
            if not valid:
                logger.warning(
                    f"Login failed: Invalid password for user id='{user.id}'"
                )
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Sai tên đăng nhập hoặc mật khẩu",
                        reason="Invalid password",
                    )
                )

            # Get roles and permissions from RBAC
            rbac_service = RBACService(uow)
            roles = await rbac_service.get_user_roles(user.id)
            permissions = await rbac_service.get_user_permissions(user.id)

            role_names: List[str] = [r.name for r in roles]

            # If user has no roles assigned, use the legacy vai_tro field
            if not role_names:
                raw_role = user.vai_tro.upper() if user.vai_tro else ""
                admin_roles = {"ADMIN", "HIEU_TRUONG", "HIEU_PHO", "TO_TRUONG"}
                if raw_role in admin_roles:
                    role_names = ["ADMIN"]
                else:
                    role_names = ["NHAN_VIEN"]
                # Map legacy role to permissions
                from src.service.rbac_service import ROLE_PERMISSIONS

                permissions = []
                for role in role_names:
                    perms = ROLE_PERMISSIONS.get(role, [])
                    permissions.extend(perms)
                permissions = list(set(permissions))

            logger.info(
                f"User roles: {role_names}, permissions count: {len(permissions)}"
            )

            # Generate access token with roles and permissions
            token, expire = await self.auth_service.create_access_token(
                user_id=user.id,
                email=user.email,
                username=user.ten_dang_nhap,
                roles=role_names,
                permissions=permissions,
                nhan_vien_id=str(user.nhan_vien_id) if user.nhan_vien_id else None,
            )

            # Generate refresh token
            logger.info(f"Generating refresh token for user '{user.id}'")
            (
                refresh_token,
                refresh_expire,
            ) = await self.auth_service.create_refresh_token(user.id)

            await uow.commit()

            return Return.ok(
                LoginResult(
                    access_token=token,
                    refresh_token=refresh_token,
                    user={
                        "id": str(user.id),
                        "username": user.ten_dang_nhap,
                        "email": user.email,
                        "role": role_names[0] if role_names else "NHAN_VIEN",
                        "roles": role_names,
                        "permissions": permissions,
                        "is_active": user.trang_thai,
                        "nhan_vien_id": str(user.nhan_vien_id)
                        if user.nhan_vien_id
                        else None,
                    },
                    access_expire=expire,
                    refresh_expire=refresh_expire,
                )
            )
