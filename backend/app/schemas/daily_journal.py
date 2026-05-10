from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DailyJournalBase(BaseModel):
    content: str
    polarity_score: Optional[int] = None

class DailyJournalCreate(DailyJournalBase):
    pass

class DailyJournalResponse(DailyJournalBase):
    journal_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
