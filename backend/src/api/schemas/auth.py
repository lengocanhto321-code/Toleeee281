from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginDataResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
