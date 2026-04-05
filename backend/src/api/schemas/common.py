from typing import TypeVar, Optional, Generic

from pydantic import BaseModel

T = TypeVar("T")


class Metadata(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class APIResponseWithMetadata(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
    metadata: Metadata


class APIResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None
