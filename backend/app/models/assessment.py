from app.db import Base
from sqlalchemy import Column, VARCHAR, Integer, ForeignKey, DateTime, func

class Assessment_Result(Base):
    __tablename__ = "assessment_result"
    result_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    anxiety_score = Column(Integer)
    anxiety_severity = Column(VARCHAR(20))
    depression_score = Column(Integer)
    depression_severity = Column(VARCHAR(20))
    stress_score = Column(Integer)
    stress_severity = Column(VARCHAR(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
