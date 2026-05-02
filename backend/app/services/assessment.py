from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.schemas.assessment import AssessmentCreate
from app.models.assessment import Assessment_Result
from app.models.user import User
from app.settings import settings
from app import db


mail_connection_confg = ConnectionConfig(
    MAIL_USERNAME = settings.MAIL_USERNAME,
    MAIL_PASSWORD = settings.MAIL_PASSWORD,
    MAIL_FROM = settings.MAIL_FROM,
    MAIL_PORT = settings.MAIL_PORT,
    MAIL_SERVER = settings.MAIL_SERVER,
    MAIL_STARTTLS = settings.MAIL_STARTTLS,
    MAIL_SSL_TLS = settings.MAIL_SSL_TLS
)

async def create_assessment(db: Session, assessment_data: AssessmentCreate, current_user: int):
    user = db.query(User).filter(User.user_id == current_user).first()
    try:
        assessment_instance = Assessment_Result(**assessment_data.model_dump(exclude={"isEmailPreference"}))
        assessment_instance.user_id = current_user
        db.add(assessment_instance)
        db.commit()
        db.refresh(assessment_instance)
        if user.email_notifications:
            mail_message = MessageSchema(
                subject="Your Assessment Results 🌿",
                recipients=[user.email],
                body=f"""
Hi {user.name},

Your latest assessment results:
🧠 Anxiety:    {assessment_data.anxiety_score} ({assessment_data.anxiety_severity})
😔 Depression: {assessment_data.depression_score} ({assessment_data.depression_severity})
😤 Stress:     {assessment_data.stress_score} ({assessment_data.stress_severity})

We're here whenever you need us. 💙
""",
                subtype="plain"
            )
            fm = FastMail(mail_connection_confg)
            await fm.send_message(mail_message)
        return assessment_instance
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail= str(e))
    
def get_all_assessments_of_user(db: Session, current_user: int):
    return db.query(Assessment_Result).filter(Assessment_Result.user_id == current_user).all()

def get_last_assessment(db: Session, current_user: int):
    return db.query(Assessment_Result).filter(Assessment_Result.user_id == current_user).order_by(Assessment_Result.created_at.desc()).first()

def delete_assessments(db: Session, current_user: int):
    assessments = db.query(Assessment_Result).filter(Assessment_Result.user_id == current_user).all()
    try:
        for assessment in assessments:
            db.delete(assessment)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))