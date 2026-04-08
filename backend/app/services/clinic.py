from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.clinic import ClinicAdd
from app.models.clinic import Clinic
from app.settings import settings

import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def create_clinic(db: Session, clinic_data: ClinicAdd):
    try:
        clinic_instance = Clinic(**clinic_data.model_dump())
        db.add(clinic_instance)
        db.commit()
        db.refresh(clinic_instance)
        return clinic_instance
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
def get_nearest_clinics(db: Session, user_lat: float, user_lon: float, max_distance_km: int = 5):
    try:
        clinics = db.query(Clinic).all()
        if not clinics:
            return []
        
        clinics_with_distance = [
            {
                "clinic": clinic,
                "distance": haversine(user_lat, user_lon, clinic.latitude, clinic.longitude)
            }
            for clinic in clinics
        ]
        
        clinics_with_distance = [c for c in clinics_with_distance if c['distance'] <= max_distance_km]

        clinics_with_distance.sort(key=lambda x: x['distance'])
        return [item['clinic'] for item in clinics_with_distance[:5]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_clinic(db: Session, clinic_id: int):
    try:
        clinic = db.query(Clinic).filter(Clinic.clinic_id == clinic_id).first()
        if not clinic:
            raise HTTPException(status_code=404, detail="Clinic not found")
        db.delete(clinic)
        db.commit()
        return True
    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_clinics(db: Session):
    try:
        clinics = db.query(Clinic).all()
        print(clinics)
        return clinics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

