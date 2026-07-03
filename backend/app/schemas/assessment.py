from pydantic import BaseModel
from datetime import datetime

class AssessmentBase(BaseModel):
    anxiety_score : int | None = None
    anxiety_severity : str | None = None
    depression_score : int | None = None
    depression_severity : str | None = None
    stress_score : int | None = None
    stress_severity : str | None = None

class AssessmentResponse(AssessmentBase):
    result_id: int
    created_at: datetime

class Assessment(AssessmentBase):
    result_id: int

    class Config:
        from_attribute = True