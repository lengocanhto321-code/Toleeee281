from typing import TypeVar, Optional, Generic, Any

from pydantic import BaseModel

T = TypeVar("T")


class Metadata(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
    thong_ke: Optional[Any] = None
    phong_ban_list: Optional[Any] = None


class APIResponseWithMetadata(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
    metadata: Metadata


class APIResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
