from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.daily_journal import DailyJournalCreate, DailyJournalResponse
from app.schemas.ApiResponse import ApiResponse
from app.services.daily_journal import create_journal_entry, get_user_journals
from app.dependency.auth import auth_dependency
from typing import List

router = APIRouter(prefix="/api/v1/journal", tags=["Journal"])

@router.post("/create", response_model=ApiResponse[DailyJournalResponse])
def create_journal(
    data: DailyJournalCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    try:
        journal = create_journal_entry(db, current_user, data)
        return ApiResponse(status_code=201, data=journal, message="Journal entry saved successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/all", response_model=ApiResponse[List[DailyJournalResponse]])
def get_all_journals(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    try:
        journals = get_user_journals(db, current_user)
        return ApiResponse(status_code=200, data=journals, message="Journal entries fetched successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
