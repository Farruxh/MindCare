from pydantic import BaseModel
from datetime import datetime

class ChatResponse(BaseModel):
    chat_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True