from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.ApiResponse import ApiResponse
from app.dependency.auth import auth_dependency
from app.db import get_db
from app.services.assessment import create_assessment, get_all_assessments_of_user, delete_assessments
from app.schemas.assessment import AssessmentCreate, AssessmentResponse

router = APIRouter(prefix="/api/v1/assessments", tags = ["Assessments"])

@router.post("/create", response_model= ApiResponse[AssessmentResponse])
async def creare_assessment_result(assessment_data: AssessmentCreate, db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    try:
        assessment = await create_assessment(db, assessment_data, current_user)
        return ApiResponse(status_code=201, data=assessment, message="Assessment result saved successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/my-assessment", response_model= ApiResponse[list[AssessmentResponse]])
def get_current_user_assessment(db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    assessment = get_all_assessments_of_user(db, current_user)
    return ApiResponse(status_code=200, data= assessment, message= "Assessment result of current user fetched successfully")

@router.delete("/delete")
def delete_all_assessments(db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    try:
        delete_assessments(db, current_user)
        return ApiResponse(status_code=200, message="All assessments deleted successfully")
    except Exception as e:      
        raise HTTPException(status_code=500, detail=str(e))