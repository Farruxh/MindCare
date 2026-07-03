from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.db import Base

class Clinic(Base):
    __tablename__ = "clinics"
    clinic_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    location = Column(String)
    contact_no = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
