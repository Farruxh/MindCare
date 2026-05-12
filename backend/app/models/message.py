from sqlalchemy import Column, DateTime, Integer, VARCHAR, Text, ForeignKey, func
from app.db import Base

class Message(Base):
    __tablename__ = "messages"
    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    chat_id = Column(Integer, ForeignKey("chat_history.chat_id"), nullable=False)
    message_text = Column(Text)
    role = Column(VARCHAR(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())