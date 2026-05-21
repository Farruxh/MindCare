from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from app.db import Base

class DailyJournal(Base):
    __tablename__ = "daily_journals"
    journal_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
