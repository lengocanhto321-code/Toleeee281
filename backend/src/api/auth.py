import logging
from typing import Optional, List

from fastapi import Cookie, Depends, Header
from pydantic import BaseModel

from src.api.depends import auth_service
from libs.result import Error
from src.api.error import ClientError

logger = logging.getLogger(__name__)


class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    username: Optional[str] = None
    roles: List[str] = []
    permissions: List[str] = []
    nhan_vien_id: Optional[str] = None

    def has_role(self, role: str) -> bool:
        """Check if user has a specific role."""
        return role in self.roles

    def has_any_role(self, roles: List[str]) -> bool:
        """Check if user has any of the specified roles."""
        return any(role in self.roles for role in roles)

    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission."""
        return permission in self.permissions

    def has_any_permission(self, permissions: List[str]) -> bool:
        """Check if user has any of the specified permissions."""
        return any(perm in self.permissions for perm in permissions)

    def has_all_permissions(self, permissions: List[str]) -> bool:
        """Check if user has all of the specified permissions."""
        return all(perm in self.permissions for perm in permissions)


async def get_cookie_user_context(
    token: Optional[str] = Cookie(None, alias="token"),
    authorization: Optional[str] = Header(None),
) -> UserContext:
    # Support both cookie and Bearer token
    auth_token = token
    if not auth_token and authorization:
        if authorization.startswith("Bearer "):
            auth_token = authorization[7:]
        else:
            auth_token = authorization

    if not auth_token:
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="missing_auth_token", message="Authentication token is missing"
            ),
        )
    decoded_token = await auth_service.decode_token(auth_token)

    if not decoded_token:
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="invalid_auth_cookie", message="Invalid authentication cookie"
            ),
        )

    user_id = decoded_token.get("sub")
    email = decoded_token.get("email")
    username = decoded_token.get("username")
    roles = decoded_token.get("roles", [])
    permissions = decoded_token.get("permissions", [])
    nhan_vien_id = decoded_token.get("nhan_vien_id")

    try:
        context = UserContext(
            user_id=user_id,
            email=email,
            username=username,
            roles=roles,
            permissions=permissions,
            nhan_vien_id=nhan_vien_id,
        )
        return context
    except Exception as e:
        logger.warning(f"Error parsing user context: {str(e)}")
        raise ClientError(
            status_code=401,
            base_error=Error(
                code="invalid_auth_cookie", message="Invalid authentication cookie"
            ),
        )


def require_permission(*permissions: str):
    """Dependency factory for permission-based authorization.

    Usage:
        @router.post("/items")
        async def create_item(
            user: UserContext = Depends(require_permission("items:create"))
        ):
            ...

        # Multiple permissions (any match)
        @router.post("/items")
        async def create_item(
            user: UserContext = Depends(require_permission("items:create", "items:manage"))
        ):
            ...
    """

    def dependency(
        current_user: UserContext = Depends(get_cookie_user_context),
    ) -> UserContext:
        if not current_user.has_any_permission(list(permissions)):
            raise ClientError(
                status_code=403,
                base_error=Error(
                    code="forbidden",
                    message=f"Requires one of permissions: {', '.join(permissions)}",
                ),
            )
        return current_user

    return dependency
