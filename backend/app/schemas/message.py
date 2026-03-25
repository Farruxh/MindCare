from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    role: str
    message_text: str

class MessageResponse(BaseModel):
    message_id: int
    chat_id: int
    role: str
    message_text: str
    created_at: datetime

    class Config:
        from_attributes = True