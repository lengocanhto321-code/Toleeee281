import logging

from fastapi import APIRouter, Depends, status, Response

from libs.result import is_err
from src.api.depends import get_unit_of_work, get_auth_service
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
    command = LoginCommand(email=body.email, password=body.password)

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
