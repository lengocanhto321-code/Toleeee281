import logging

from fastapi import APIRouter, Depends, status, Response
from pydantic import BaseModel

from libs.result import is_err
from src.api.depends import get_unit_of_work, get_auth_service
from src.api.auth import get_cookie_user_context, require_permission, UserContext
from src.api.error import ClientError, ServerError
from libs.result import Error
from src.api.schemas.auth import LoginRequest, LoginDataResponse
from src.api.schemas.common import APIResponse
from src.app.usecases.auth.login_uc import LoginCommand, LoginUseCase
from src.app.usecases.auth.change_password_uc import (
    ChangePasswordCommand,
    ChangePasswordUseCase,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=APIResponse[LoginDataResponse])
async def login(
    body: LoginRequest,
    response: Response,
    unit_of_work=Depends(get_unit_of_work),
    auth_service=Depends(get_auth_service),
):
    logger.info(f"Request: {body}")
    command = LoginCommand(username=body.username, password=body.password)

    use_case = LoginUseCase(unit_of_work, auth_service)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in ["invalid_credentials", "inactive_account"]:
            raise ClientError(
                base_error=error, status_code=status.HTTP_401_UNAUTHORIZED
            )
        raise ServerError(base_error=error)

    result_value = result.value
    logger.info(f"Result: {result_value}")

    # set cookie
    response.set_cookie(
        key="token",
        value=result_value.access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        expires=result_value.access_expire,
    )

    response.set_cookie(
        key="refresh_token",
        value=result_value.refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        expires=result_value.refresh_expire,
    )

    return APIResponse(
        message="Login successful",
        data=LoginDataResponse(
            access_token=result_value.access_token,
            refresh_token=result_value.refresh_token,
            user=result_value.user,
        ),
    )


@router.post("/refresh", response_model=APIResponse[LoginDataResponse])
async def refresh(
    response: Response,
    unit_of_work=Depends(get_unit_of_work),
    auth_service=Depends(get_auth_service),
):
    """
    Refresh access token using refresh token from cookie.
    """
    # TODO: Implement refresh logic using refresh_token cookie
    # For now, return error
    raise ClientError(
        base_error=Error(code="not_implemented", message="Refresh not implemented yet"),
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
    )


@router.get("/me", response_model=APIResponse[dict])
async def me(
    current_user=Depends(require_permission("profile:read")),
):
    """Get current user info from token. Requires authentication."""
    return APIResponse(
        message="User info",
        data={
            "id": current_user.user_id,
            "email": current_user.email,
            "username": current_user.username,
            "roles": current_user.roles,
        },
    )


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/change-password", response_model=APIResponse[dict])
async def change_password(
    body: ChangePasswordRequest,
    current_user: UserContext = Depends(require_permission("profile:update")),
    uow=Depends(get_unit_of_work),
):
    """Đổi mật khẩu cho user hiện tại."""
    command = ChangePasswordCommand(
        user_id=current_user.user_id,
        old_password=body.old_password,
        new_password=body.new_password,
    )

    use_case = ChangePasswordUseCase(uow)
    result = await use_case.execute(command)

    if is_err(result):
        error = result.value
        if error.code in ["wrong_password", "weak_password"]:
            raise ClientError(base_error=error, status_code=400)
        raise ServerError(base_error=error)

    return APIResponse(message="Đổi mật khẩu thành công", data={})


@router.post("/logout", response_model=APIResponse[dict])
async def logout(response: Response):
    """
    Logout - clear cookies.
    """
    response.delete_cookie("token")
    response.delete_cookie("refresh_token")

    return APIResponse(
        message="Logout successful",
        data={},
    )
