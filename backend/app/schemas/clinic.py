from pydantic import BaseModel
from datetime import datetime

class ClinicAdd(BaseModel):
    name: str
    location: str
    contact_no: str | None = ""
    latitude: float
    longitude: float

class Clinic(ClinicAdd):
    clinic_id: int
    created_at: datetime | None = None

    class Config:
        from_attribute = True
