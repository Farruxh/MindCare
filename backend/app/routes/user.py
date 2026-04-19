from fastapi import Depends, HTTPException, APIRouter, Request, Response, Cookie
from sqlalchemy.orm import Session
from app.services.user import del_recent_activity, get_recent_activities, insert_recent_activity, refreshAccessToken, register_user, login_user, get_users, get_current_user, forget_password, verifyPasswordToken, reset_password, updateAccountDetails, updateCurrentPassword, delete_user, delete_all_users
from app.schemas.user import ActivityOut, ActivityCreate, UserCreate, UserLogin, UserUpdate, UserResponse, UserPasswordUpdate, UserForgotPassword, UserVerifyToken, UserResetPassword, User
from app.schemas.ApiResponse import ApiResponse
from app.db import get_db
from app.dependency.auth import auth_dependency

router = APIRouter(prefix="/api/v1/users" , tags = ["Users"])

@router.post("/register-user", response_model = ApiResponse[User])
def register_new_user(data: UserCreate, db: Session = Depends(get_db)):
    user = register_user(db, data)
    return ApiResponse(
        status_code=201, 
        data=user, 
        message="Account created successfully"
    )

@router.post("/login", response_model = ApiResponse[UserResponse])
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    try:
        user, access_token, refresh_token = login_user(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        secure=True,
    )

    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure=True,
    )
    return ApiResponse(status_code=200, data=user, message="Log in successfully")

@router.get("/logout")
def logout_user(response: Response, _: int = Depends(auth_dependency)):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return ApiResponse(status_code=200, message="Log out successfully")  

@router.get("/all", response_model = list[UserResponse])
def get_all_users(db = Depends(get_db)):
    users = get_users(db)
    if not users:
        raise HTTPException(status_code=404, detail="Users not found")
    return users

@router.get("/me", response_model = ApiResponse[UserResponse])
def get_present_user(current_user: int = Depends(auth_dependency) , db: Session = Depends(get_db)):
    user = get_current_user(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return ApiResponse(status_code=200, data=user, message="User fetched successfully")

@router.post("/forget-password")
async def forget_pass(data: UserForgotPassword, db = Depends(get_db)):
    try:
        await forget_password(db, data.email)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(status_code=200, message="Password reset email sent successfully")

@router.post("/verify-password-token")
def verify_password_token(data: UserVerifyToken, response: Response, db = Depends(get_db)):
    try:
        if verifyPasswordToken(db, data):
            response.set_cookie(
            key="reset_token",
            value=data.token,
            httponly=True,
            max_age=100,  # seconds
            secure=False,  # HTTPS only
            # samesite="lax"
    )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(status_code=200, message="Token verified successfully")

@router.patch("/reset-password")
def reset_pass(
    data: UserResetPassword,
    reset_token:str = Cookie(None),
    db: Session = Depends(get_db)
    ):
    try:
        reset_password(db, data, reset_token)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(status_code=200, message="Password reset successfully")

@router.post("/refresh-token")
def refreshToken(request: Request, response: Response, db: Session = Depends(get_db)):
    incomingRefreshToken = request.cookies.get("refresh_token")
    if not incomingRefreshToken:
        raise HTTPException(status_code=401, detail="Unauthorized Request")
    try:
        access_token, refresh_token = refreshAccessToken(db, incomingRefreshToken)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True, 
        secure=True,
    )
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure=True,
    )
    return ApiResponse(status_code=200, data={"access_token": access_token, "refresh_token": refresh_token}, message="Access Token refreshed Successfully")

@router.patch("/update-account", response_model = ApiResponse[UserResponse])
def update_account(
    data: UserUpdate,  
    db: Session = Depends(get_db), 
    current_user: int = Depends(auth_dependency)
    ):
    user_update = updateAccountDetails(db, current_user, data)
    return ApiResponse(status_code=200, data=user_update, message="Account information updated successfully")

@router.patch("/update-current-password", response_model = ApiResponse[UserResponse])
def updatePassword(data: UserPasswordUpdate, db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    user = updateCurrentPassword(db, current_user, data)
    return ApiResponse(status_code=200, data=user, message="Password Updated Successfully")

@router.delete("/delete-account", response_model = ApiResponse[UserResponse])
def user_delete(db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    delete_user(db, current_user)
    return ApiResponse(status_code=200, message="Account deleted successfully")

@router.delete("/deleteAll")
def delete_all(db: Session = Depends(get_db)):
    delete_all_users(db)
    return "Deleted Successfully"

@router.post("/recent-activity/create", response_model=ApiResponse[ActivityOut])
def create_recent_activity(data: ActivityCreate, current_user: int = Depends(auth_dependency), db: Session = Depends(get_db)):
    recent_activity = insert_recent_activity(data, db, current_user)
    return ApiResponse(status_code=201, data=recent_activity, message="Recent activity created successfully")

@router.get("/recent-activity/get", response_model = ApiResponse[list[ActivityOut]])
def get_user_recent_activity(db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    try:
        activities = get_recent_activities(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(status_code=200, data=activities, message="Recent activity fetched successfully")

@router.delete("/recent-activity/delete")
def delete_recent_activity(db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    try:
        del_recent_activity(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return ApiResponse(status_code=200, message="Recent activity deleted successfully")