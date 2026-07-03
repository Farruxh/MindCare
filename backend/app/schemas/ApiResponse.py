from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    status_code: int
    data: Optional[T] = None
    message: str = "Success"