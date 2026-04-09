from datetime import datetime
from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: str
    password: str
    gender: str

class UserCreate(UserBase):
    pass

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    latitude: float | None = None
    longitude: float | None = None

class UserPasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str

class UserForgotPassword(BaseModel):
    email: str

class UserVerifyToken(BaseModel):
    token: str

class UserResetPassword(BaseModel):
    new_password: str
    confirm_new_password: str
    
class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime

class User(UserBase):
    user_id: int

    class Config:
        from_attribute = True