import logging

from fastapi import APIRouter, Depends, status, Response

from libs.result import is_err
from src.api.depends import get_unit_of_work, get_auth_service
from src.api.auth import get_user_context
from src.api.error import ClientError, ServerError
from src.api.schemas.auth import LoginRequest, LoginDataResponse
from src.api.schemas.common import APIResponse
from src.app.usecases.auth.login_uc import LoginCommand, LoginUseCase

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
async def me(current_user=Depends(get_user_context)):
    """
    Get current user info from token.
    """
    from src.domain.models.tai_khoan import TaiKhoan
    from src.repository.user_repository import UserRepository

    # TODO: Implement proper user fetch
    return APIResponse(
        message="User info",
        data={
            "id": current_user.user_id,
            "email": current_user.email,
        },
    )


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
