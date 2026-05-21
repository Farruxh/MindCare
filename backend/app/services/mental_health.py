from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.daily_journal import DailyJournal
from app.models.mental_health import WeeklyReport, PolaritySnapshot
from app.services.inference import weekly_report as compute_weekly_report

def trigger_weekly_analysis(db: Session, user_id: int):
    # Get current date and find start of week (Monday)
    now = datetime.now()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    entries = db.query(DailyJournal).filter(
        DailyJournal.user_id == user_id,
        DailyJournal.created_at >= start_of_week
    ).all()
    
    if not entries:
        return None
        
    texts = [entry.content for entry in entries]
    report_data = compute_weekly_report(texts)
    
    if not report_data:
        return None
        
    # Save WeeklyReport
    new_report = WeeklyReport(
        user_id=user_id,
        weekly_polarity=report_data["weekly_polarity"],
        polarity_label=report_data["polarity_label"],
        dominant_state=report_data["dominant_state"],
        trend=report_data["trend"],
        state_counts=report_data["state_counts"],
        per_entry_breakdown=report_data["per_entry_breakdown"]
    )
    db.add(new_report)
    
    # Save PolaritySnapshot
    new_snapshot = PolaritySnapshot(
        user_id=user_id,
        score=report_data["weekly_polarity"],
        label=report_data["polarity_label"],
        dominant_state=report_data["dominant_state"],
        trend=report_data["trend"]
    )
    db.add(new_snapshot)
    
    db.commit()
    db.refresh(new_report)
    
    return new_report

def get_latest_weekly_report(db: Session, user_id: int):
    return db.query(WeeklyReport).filter(WeeklyReport.user_id == user_id).order_by(WeeklyReport.created_at.desc()).first()

def get_polarity_snapshot(db: Session, user_id: int):
    return db.query(PolaritySnapshot).filter(PolaritySnapshot.user_id == user_id).order_by(PolaritySnapshot.created_at.desc()).first()
