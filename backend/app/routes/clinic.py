from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.ApiResponse import ApiResponse
from app.db import get_db
from app.services.clinic import create_clinic, get_nearest_clinics, delete_clinic, get_all_clinics, update_clinic
from app.schemas.clinic import ClinicAdd, Clinic, ClinicUpdate

router = APIRouter(prefix="/api/v1/clinics", tags=["Clinics"])

@router.post("/create", response_model=ApiResponse[Clinic])
def create_new_clinic(clinic_data: ClinicAdd, db: Session = Depends(get_db)):
    try:
        clinic = create_clinic(db, clinic_data)
        return ApiResponse(status_code=201, data=clinic, message="Clinic created successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.put("/update/{clinic_id}", response_model=ApiResponse[Clinic])
def update_existing_clinic(clinic_id: int, clinic_data: ClinicUpdate, db: Session = Depends(get_db)):
    try:
        clinic = update_clinic(db, clinic_id, clinic_data)
        return ApiResponse(status_code=200, data=clinic, message="Clinic updated successfully")
    except HTTPException as httpe:
        raise httpe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=ApiResponse[list[Clinic]])
def get_all_saved_clinics(db: Session = Depends(get_db)):
    try:
        clinics = get_all_clinics(db)
        return ApiResponse(status_code=200, data=clinics, message="All clinics fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nearest", response_model=ApiResponse[list[Clinic]])
def get_clinics_near_user(user_lat: float, user_lon: float, db: Session = Depends(get_db)):
    try:
        clinics = get_nearest_clinics(db, user_lat, user_lon)
        return ApiResponse(status_code=200, data=clinics, message="Nearest clinics fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{clinic_id}", response_model=ApiResponse)
def remove_clinic(clinic_id: int, db: Session = Depends(get_db)):
    try:
        delete_clinic(db, clinic_id)
        return ApiResponse(status_code=200, message="Clinic deleted successfully")
    except HTTPException as httpe:
        raise httpe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
