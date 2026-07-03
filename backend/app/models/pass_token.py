from sqlalchemy import Column, DateTime, Integer, String, func, ForeignKey, Boolean, CHAR
from app.db import Base

class Password_Token(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    token = Column(CHAR(4))
    expires_at = Column(DateTime(timezone=True))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())