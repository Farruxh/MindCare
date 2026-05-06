from fastapi import HTTPException
from sqlalchemy.orm import Session
import jwt
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import secrets
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.schemas.user import ThemeUpdate, UserCreate, UserUpdate, UserLogin, UserForgotPassword, UserVerifyToken, UserPasswordUpdate, UserResetPassword, ActivityCreate
from app.models.user import User
from app.models.pass_token import Password_Token
from app.models.recent_activity import RecentActivity
from app.settings import settings


password_hasher = PasswordHash.recommended()

def pasword_hash(password):
    return password_hasher.hash(password)

def generateAccessAndRefreshTokens(db: Session, user_instance):
    payload_access = {
        "sub": str(user_instance.user_id),
        "email": user_instance.email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_TIME)
    }
    payload_refresh = {
        "sub": str(user_instance.user_id),
        "email": user_instance.email,
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_TIME)
    }
    access_token = jwt.encode(
        payload_access, 
        settings.ACCESS_TOKEN_SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    refresh_token = jwt.encode(
        payload_refresh, 
        settings.REFRESH_TOKEN_SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )

    user_instance.refresh_token = pasword_hash(refresh_token)
    db.commit()
    return access_token, refresh_token

mail_connection_confg = ConnectionConfig(
    MAIL_USERNAME = settings.MAIL_USERNAME,
    MAIL_PASSWORD = settings.MAIL_PASSWORD,
    MAIL_FROM = settings.MAIL_FROM,
    MAIL_PORT = settings.MAIL_PORT,
    MAIL_SERVER = settings.MAIL_SERVER,
    MAIL_STARTTLS = settings.MAIL_STARTTLS,
    MAIL_SSL_TLS = settings.MAIL_SSL_TLS
)


#  Service functions for user operations
def register_user(db: Session, data: UserCreate):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_instance = User(**data.model_dump())
    user_instance.password = pasword_hash(data.password)
    db.add(user_instance)
    db.commit()
    db.refresh(user_instance)
    return user_instance

def login_user(db: Session, data: UserLogin):
    if not data.email or not data.password:
        raise HTTPException(status_code=404, detail="Email and password are required")
    user_instance = db.query(User).filter(User.email == data.email).first()
    if not user_instance:
        raise HTTPException(status_code=404, detail="Email is incorrect")
    elif not password_hasher.verify(data.password, user_instance.password):
        raise HTTPException(status_code=404, detail="Password is incorrect")
    
    access_token, refresh_token = generateAccessAndRefreshTokens(db, user_instance)
    return user_instance, access_token, refresh_token

def update_user_dark_mode(db: Session, user_id: int, is_dark_mode: ThemeUpdate):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.isDarkMode = is_dark_mode.theme
    db.commit()

def get_users(db: Session):
    return db.query(User).all()

def get_current_user(db: Session, id: int):
    return db.query(User).filter(User.user_id == id).first()

async def forget_password(db: Session, email: UserForgotPassword):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found in our database")
    
    db.query(Password_Token).filter(Password_Token.user_email == email).delete()
    db.commit()

    token = str(secrets.randbelow(10000))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=6)
    expiry_local = expiry.astimezone(timezone(timedelta(hours=5))).strftime('%I:%M:%S')

    token_instance = Password_Token(
        user_email=email,
        token=token,
        expires_at=expiry,
        is_verified=False
    )
    db.add(token_instance)
    db.commit()
    db.refresh(token_instance)

    mail_message = MessageSchema(
        subject="Password Reset Token",
        recipients=[email],
        body=f"Your password reset token is: {token}. This token is valid for 6 minutes and will expire at {expiry_local}.",
        subtype="plain"
    )
    fm = FastMail(mail_connection_confg)
    await fm.send_message(mail_message)
    
def verifyPasswordToken(db: Session, data: UserVerifyToken):
    record = db.query(Password_Token).filter(
        Password_Token.token == data.token
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Invalid token")
    elif record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=404, detail="Token has expired")
    
    record.is_verified = True
    db.commit()

    return True
    
def reset_password(db: Session, data: UserResetPassword, reset_token: str):
    record = db.query(Password_Token).filter(Password_Token.token == reset_token).first()
    if not record:
        raise HTTPException(status_code=404, detail="Invalid Token")
    if record.expires_at < datetime.now(timezone.utc):
        db.delete(record)
        db.commit()
        raise HTTPException(status_code=404, detail="Token has expired")
    if not record.is_verified:
        raise HTTPException(status_code=404, detail="Token has not been verified")
    if data.new_password != data.confirm_new_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    user = db.query(User).filter(User.email == record.user_email).first()
    user.password = pasword_hash(data.new_password)

    db.delete(record)
    db.commit()
    return {"message": "Password reset successfully"}

def refreshAccessToken(db: Session, incomingRefreshToken: str):
    try:
        payload = jwt.decode(incomingRefreshToken, settings.REFRESH_TOKEN_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        
        user = db.query(User).filter(User.user_id == int(user_id)).first()
        
        if not user or not password_hasher.verify(incomingRefreshToken, user.refresh_token):
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        access_token, refresh_token = generateAccessAndRefreshTokens(db, user)    
        return access_token, refresh_token
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token expired or invalid")

def updateAccountDetails(db: Session, id: int, data: UserUpdate):
    user = db.query(User).filter(User.user_id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found") 
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def updateCurrentPassword(db: Session, id: int, data: UserPasswordUpdate):
    user = db.query(User).filter(User.user_id == id).first()
    if not data.currentPassword or not data.newPassword or not data.confirmPassword:
        raise HTTPException(status_code = 400, detail = "All fields are required")
    if not password_hasher.verify(data.currentPassword , user.password):
        raise HTTPException(status_code = 400, detail = "Current password is incorrect")
    if data.newPassword != data.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    user.password = pasword_hash(data.newPassword)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, id: int):
    user =  db.query(User).filter(User.user_id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return user
    
def delete_all_users(db: Session):
    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    for user in users:
        db.delete(user)
    db.commit()

def insert_recent_activity(activity_type: ActivityCreate, db: Session, user_id: int):
    recent_activity_instance = RecentActivity(user_id=user_id, activity_type=activity_type.activity_type)
    db.add(recent_activity_instance)
    db.commit()
    db.refresh(recent_activity_instance)
    return recent_activity_instance

def get_recent_activities(db: Session, user_id: int):
    recent_activities = db.query(RecentActivity).filter(RecentActivity.user_id == user_id).order_by(RecentActivity.created_at.desc()).all()
    return recent_activities[:4]

def del_recent_activity(db: Session, user_id: int):
    recent_activity = db.query(RecentActivity).filter(RecentActivity.user_id == user_id).all()
    try:
        for activity in recent_activity:
            db.delete(activity)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    