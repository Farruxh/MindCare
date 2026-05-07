from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.clinic import ClinicAdd, ClinicUpdate
from app.models.clinic import Clinic

from haversine import haversine, Unit

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
    
def update_clinic(db: Session, clinic_id: int, clinic_data: ClinicUpdate):
    try:
        clinic = db.query(Clinic).filter(Clinic.clinic_id == clinic_id).first()
        if not clinic:
            raise HTTPException(status_code=404, detail="Clinic not found")
        
        for key, value in clinic_data.model_dump(exclude_unset=True).items():
            setattr(clinic, key, value)
        
        db.commit()
        db.refresh(clinic)
        return clinic
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
def get_nearest_clinics(db: Session, user_lat: float, user_lon: float):
    try:
        clinics = db.query(Clinic).all()
        if not clinics:
            return []

        clinics_with_distance = [
            {
                "clinic": clinic,
                "distance": haversine((user_lat, user_lon), (clinic.latitude, clinic.longitude), unit=Unit.KILOMETERS)  
            }
            for clinic in clinics
        ]
        
        clinics_with_distance = [c for c in clinics_with_distance if c['distance'] <= 5]
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
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_all_clinics(db: Session):
    try:
        clinics = db.query(Clinic).all()
        print(clinics)
        return clinics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

