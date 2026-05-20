import os
import sys
import argparse
from datetime import datetime, timedelta
from sqlalchemy import select, distinct

# Add backend directory to sys.path if running outside
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import sessionLocal
from app.models.user import User
from app.models.assessment import Assessment_Result
from app.models.chat_history import Chat_History
from app.models.message import Message
from app.models.clinic import Clinic
from app.models.pass_token import Password_Token
from app.models.daily_journal import DailyJournal
from app.models.recent_activity import RecentActivity
from app.models.mental_health import WeeklyReport, PolaritySnapshot
from app.services.mental_health import trigger_weekly_analysis
from app.services.inference import init_model

def run_scheduler(target_user_id=None):
    print("Initializing Mental Health Classifier...")
    # We must initialize the model here since we aren't starting the FastAPI server
    init_model()
    
    db = sessionLocal()
    try:
        # Determine start of the current week (Monday at 00:00:00)
        now = datetime.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        if target_user_id:
            print(f"Running manual analysis for specific user ID: {target_user_id}")
            users_to_process = [target_user_id]
        else:
            print(f"Finding all users with diary entries since {start_of_week.strftime('%Y-%m-%d %H:%M:%S')}")
            # Query distinct users who wrote entries this week
            query = select(distinct(DailyJournal.user_id)).where(DailyJournal.created_at >= start_of_week)
            users_to_process = db.execute(query).scalars().all()
            
        if not users_to_process:
            print("No users found to process for this week.")
            return

        print(f"Found {len(users_to_process)} user(s) to process.\n")
        
        success_count = 0
        failure_count = 0
        
        for uid in users_to_process:
            try:
                report = trigger_weekly_analysis(db, uid)
                if report:
                    entry_count = len(report.per_entry_breakdown)
                    print(f"[SUCCESS] User {uid:03d} | Score: {report.weekly_polarity:.2f} | Label: {report.polarity_label} | Entries: {entry_count}")
                    success_count += 1
                else:
                    print(f"[SKIPPED] User {uid:03d} | No entries found or analysis returned empty.")
            except Exception as e:
                db.rollback()
                print(f"[ERROR]   User {uid:03d} | Failed to process: {str(e)}")
                failure_count += 1
                
        print("\n" + "="*30)
        print("--- Weekly Analysis Summary ---")
        print(f"Total Processed : {len(users_to_process)}")
        print(f"Successful      : {success_count}")
        print(f"Failed          : {failure_count}")
        print("="*30 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mental Health Weekly Scheduler")
    parser.add_argument("--user_id", type=int, help="Run analysis for a specific user ID", default=None)
    args = parser.parse_args()
    
    run_scheduler(args.user_id)
