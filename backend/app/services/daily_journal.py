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
    if journal_data.created_at:
        new_entry.created_at = journal_data.created_at
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

def delete_journal_entry(db: Session, journal_id: int, user_id: int):
    entry = db.query(DailyJournal).filter(
        DailyJournal.journal_id == journal_id,
        DailyJournal.user_id == user_id
    ).first()
    if entry:
        db.delete(entry)
        db.commit()
        return True
    return False