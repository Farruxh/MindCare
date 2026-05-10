from app.db import Base
from sqlalchemy import Column, DateTime, Integer, String, Float, Boolean, func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    gender = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    refresh_token = Column(String, nullable=True)
    isDarkMode = Column(String, default="light")
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    Chat = relationship("Chat_History", cascade="all, delete-orphan")
    Assessment = relationship("Assessment_Result", cascade="all, delete-orphan")
    PasswordResetToken = relationship("Password_Token", cascade="all, delete-orphan")
    RecentActivity = relationship("RecentActivity", cascade="all, delete-orphan")
    DailyJournal = relationship("DailyJournal", cascade="all, delete-orphan")