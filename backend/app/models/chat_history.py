from sqlalchemy import Column, DateTime, Integer, ForeignKey ,func
from sqlalchemy.orm import relationship
from app.db import Base

class Chat_History(Base):
    __tablename__ = "ChatHistory"
    chat_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    Message = relationship("Message" , cascade="all, delete-orphan")