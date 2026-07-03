from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Literal

class UserBase(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: str

class UserCreate(UserBase):
    pass

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_email_notification: bool | None = None

class ThemeUpdate(BaseModel):
    theme: Literal['light', 'dark']

class UserPasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str

class UserForgotPassword(BaseModel):
    email: EmailStr

class UserVerifyToken(BaseModel):
    email: EmailStr
    token: str

class UserResetPassword(BaseModel):
    new_password: str
    confirm_new_password: str
    
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    dark_mode: str
    is_email_notification: bool
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime

class User(UserBase):
    user_id: int

    class Config:
        from_attributes = True

class ActivityCreate(BaseModel):
    activity_type: str

class ActivityOut(BaseModel):
    activity_type: str
    created_at: datetime

    class Config:
        from_attributes = True

