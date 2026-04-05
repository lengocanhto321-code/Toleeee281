import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any

from libs.result import Result, Error, Return
from src.service.auth_service import AuthService

logger = logging.getLogger(__name__)


@dataclass
class LoginCommand:
    email: str
    password: str


@dataclass
class LoginResult:
    access_token: str
    refresh_token: str
    user: Dict[str, Any]
    access_expire: datetime
    refresh_expire: datetime


class LoginUseCase:
    def __init__(self, unit_of_work, auth_service: AuthService):
        self.unit_of_work = unit_of_work
        self.auth_service = auth_service

    async def execute(self, command: LoginCommand) -> Result[LoginResult, Error]:
        # Log command input (mask password for security)
        logger.info(f"Received LoginCommand: email='{command.email}'")

        async with self.unit_of_work as uow:
            # Access repositories directly from the UnitOfWork
            user_repository = uow.user_repository

            # Log repository call
            logger.debug(f"Finding user by email: '{command.email}'")

            # Find user by email
            user = await user_repository.find_by_email(command.email)

            if not user:
                logger.warning(
                    f"Login failed: User not found with email='{command.email}'"
                )
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Invalid email or password",
                        reason="User not found",
                    )
                )

            logger.debug(f"User found: id='{user.id}', email='{user.email}'")

            # Check if user is active
            if not user.is_active:
                logger.warning(
                    f"Login failed: User account is inactive, id='{user.id}', email='{user.email}'"
                )
                return Return.err(
                    Error(
                        code="inactive_account",
                        message="Your account is inactive",
                        reason="User account is inactive",
                    )
                )

            # Verify password
            valid = await AuthService.verify_password(command.password, user.password)
            if not valid:
                logger.warning(
                    f"Login failed: Invalid password for user id='{user.id}', email='{user.email}'"
                )
                return Return.err(
                    Error(
                        code="invalid_credentials",
                        message="Invalid email or password",
                        reason="Invalid password",
                    )
                )

            # Log repository call
            logger.info(f"Finding organizations with roles for user: '{user.id}'")

            # Generate access token
            logger.info(f"Generating JWT token for user '{user.id}'")
            token, expire = await self.auth_service.create_access_token(
                user.id,
                email=user.email,
                username=user.name,
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
                        "email": user.email,
                        "name": user.name,
                        "avatar": user.avatar,
                        "last_login": user.last_login,
                    },
                    access_expire=expire,
                    refresh_expire=refresh_expire,
                )
            )
