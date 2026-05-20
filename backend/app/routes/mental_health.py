from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.dependency.auth import auth_dependency
from app.schemas.ApiResponse import ApiResponse
from app.schemas.mental_health import WeeklyReportResponse, PolaritySnapshotResponse
from app.services.mental_health import trigger_weekly_analysis, get_latest_weekly_report, get_polarity_snapshot

router = APIRouter(prefix="/api/v1/mental_health", tags=["Mental Health"])

@router.post("/weekly-analysis", response_model=ApiResponse[WeeklyReportResponse])
def generate_weekly_analysis(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    try:
        report = trigger_weekly_analysis(db, current_user)
        if not report:
            return ApiResponse(status_code=404, data=None, message="No entries found for the current week to analyze.")
        return ApiResponse(status_code=201, data=report, message="Weekly analysis generated successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/latest-report", response_model=ApiResponse[WeeklyReportResponse])
def get_latest_report(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    try:
        report = get_latest_weekly_report(db, current_user)
        if not report:
            return ApiResponse(status_code=404, data=None, message="No weekly report found for this user.")
        return ApiResponse(status_code=200, data=report, message="Latest weekly report fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/snapshot", response_model=ApiResponse[PolaritySnapshotResponse])
def get_snapshot(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    try:
        snapshot = get_polarity_snapshot(db, current_user)
        if not snapshot:
            return ApiResponse(status_code=404, data=None, message="No polarity snapshot found for this user.")
        return ApiResponse(status_code=200, data=snapshot, message="Polarity snapshot fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
