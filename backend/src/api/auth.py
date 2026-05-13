import logging
from typing import Optional

from fastapi import Cookie
from pydantic import BaseModel

from src.api.depends import auth_service
from libs.result import Error
from src.api.error import ClientError

logger = logging.getLogger(__name__)


class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None


async def get_cookie_user_context(
    token: Optional[str] = Cookie(None, alias="token"),
) -> UserContext:
    if not token:
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="missing_auth_cookie", message="Authentication cookie is missing"
            ),
        )
    decoded_token = await auth_service.decode_token(token)

    if not decoded_token:
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="invalid_auth_cookie", message="Invalid authentication cookie"
            ),
        )

    x_user_id = decoded_token.get("sub")
    email = decoded_token.get("email")

    try:
        context = UserContext(
            user_id=x_user_id,
            email=email,
        )
        return context
    except Exception as e:
        logger.warning(f"Error parsing user context headers: {str(e)}")
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="invalid_auth_cookie", message="Invalid authentication cookie"
            ),
        )


get_user_context = get_cookie_user_context
get_current_admin = get_user_context  # Alias for compatibility
