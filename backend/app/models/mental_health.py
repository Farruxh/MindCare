from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON, func
from app.db import Base

class WeeklyReport(Base):
    __tablename__ = "weekly_reports"
    report_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    weekly_polarity = Column(Float, nullable=False)
    polarity_label = Column(String(50), nullable=False)
    dominant_state = Column(String(50), nullable=False)
    trend = Column(String(50), nullable=False)
    state_counts = Column(JSON, nullable=False)
    per_entry_breakdown = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PolaritySnapshot(Base):
    __tablename__ = "polarity_snapshots"
    snapshot_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    score = Column(Float, nullable=False)
    label = Column(String(50), nullable=False)
    dominant_state = Column(String(50), nullable=False)
    trend = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
