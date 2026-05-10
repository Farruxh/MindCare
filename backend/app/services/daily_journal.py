from sqlalchemy.orm import Session
from app.models.daily_journal import DailyJournal
from app.schemas.daily_journal import DailyJournalCreate
from datetime import datetime, timezone, timedelta

def get_user_journals(db: Session, user_id: int):
    return db.query(DailyJournal).filter(DailyJournal.user_id == user_id).all()

def create_journal_entry(db: Session, user_id: int, journal_data: DailyJournalCreate):
    new_entry = DailyJournal(
        user_id=user_id, 
        content=journal_data.content
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

def get_weekly_journals(db: Session, user_id: int):
    week = datetime.now(timezone.utc) - timedelta(days=7)
    return db.query(DailyJournal).filter(
        DailyJournal.user_id == user_id,
        DailyJournal.created_at >= week
    ).all()