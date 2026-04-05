import logging
from datetime import datetime, timedelta
from datetime import timezone
from typing import Dict, Any, List, Optional, Tuple

import bcrypt
import jwt

from libs.result import Result, Return, Error

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(
        self,
        jwt_secret: str,
        jwt_algorithm: str,
        jwt_expiration_minutes: int,
        refresh_token_expiration_seconds: int,
    ):
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm
        self.jwt_expiration_minutes = jwt_expiration_minutes
        self.refresh_token_expiration_seconds = refresh_token_expiration_seconds

    @staticmethod
    async def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    @staticmethod
    async def hash_password(password: str) -> str:
        """Hash a password."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    async def create_access_token(
        self,
        user_id: str,
        email: Optional[str] = None,
        username: Optional[str] = None,
        expires_delta: Optional[timedelta] = None,
    ) -> Tuple[str, datetime]:
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=self.jwt_expiration_minutes
            )

        logger.debug(f"Creating token for user {user_id}")

        # Basic payload with user ID and expiration
        payload = {"sub": str(user_id), "exp": expire}

        # Include user identity data when available
        if email:
            payload["email"] = email
        if username:
            payload["username"] = username

        return (
            jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm),
            expire,
        )

    async def create_refresh_token(
        self, user_id: str, expires_delta: Optional[timedelta] = None
    ) -> Tuple[str, datetime]:
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                seconds=self.refresh_token_expiration_seconds
            )

        logger.debug(f"Creating refresh token for user {user_id}")

        payload = {"sub": str(user_id), "type": "refresh", "exp": expire}

        return (
            jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm),
            expire,
        )

    async def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode a JWT token."""
        try:
            payload = jwt.decode(
                token, self.jwt_secret, algorithms=[self.jwt_algorithm]
            )

            logger.debug(
                f"Token decoded successfully. Payload keys: {list(payload.keys())}"
            )

            return payload
        except jwt.PyJWTError as e:
            logger.error(f"JWT error while decoding token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error while decoding token: {str(e)}")
            return None

    async def decode_refresh_token(self, token: str) -> Result[dict, Error]:
        try:
            payload = jwt.decode(
                token, self.jwt_secret, algorithms=[self.jwt_algorithm]
            )

            logger.debug(
                f"Token decoded successfully. Payload keys: {list(payload.keys())}"
            )

            token_type = payload.get("type")
            if token_type != "refresh":
                logger.error(f"Unexpected type for token: {type}")
                return Return.err(
                    Error(
                        code="invalid_token_type",
                        message="Invalid token type",
                        reason=f"Expected 'refresh', got '{token_type}'",
                    )
                )

            return Return.ok(payload)
        except jwt.PyJWTError as e:
            logger.error(f"JWT error while decoding refresh token: {str(e)}")
            return Return.err(
                Error(
                    code="token_decode_error",
                    message="Failed to decode refresh token",
                    reason=str(e),
                )
            )
        except Exception as e:
            logger.error(f"Unexpected error while decoding refresh token: {str(e)}")
            return Return.err(
                Error(
                    code="token_decode_unexpected_error",
                    message="Unexpected error decoding refresh token",
                    reason=str(e),
                )
            )
