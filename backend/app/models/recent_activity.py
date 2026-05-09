from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.db import Base

class RecentActivity(Base):
    __tablename__ = "recent_activity"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    activity_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())