from sqlalchemy import Column, DateTime, Integer, String, func, ForeignKey, Boolean
from app.db import Base

class Password_Token(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, ForeignKey("users.email"), nullable=False)
    token = Column(String(4))
    expires_at = Column(DateTime(timezone=True))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())