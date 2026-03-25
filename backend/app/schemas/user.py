from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: str
    password: str
    gender: str
    location: str | None = None

class UserCreate(UserBase):
    pass

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None

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

class User(UserBase):
    user_id: int

    class Config:
        from_attribute = True