from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, List

class WeeklyReportResponse(BaseModel):
    report_id: int
    user_id: int
    weekly_polarity: float
    polarity_label: str
    dominant_state: str
    trend: str
    state_counts: Dict[str, Any]
    per_entry_breakdown: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

class PolaritySnapshotResponse(BaseModel):
    snapshot_id: int
    user_id: int
    score: float
    label: str
    dominant_state: str
    trend: str
    created_at: datetime

    class Config:
        from_attributes = True
