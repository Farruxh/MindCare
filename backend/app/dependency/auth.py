from fastapi import Request, Depends, HTTPException
import jwt
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.settings import settings

def auth_dependency(request: Request, db: Session = Depends(get_db)):
    try:
        access_token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
        if not access_token:
            raise Exception("Unauthorized Request")
        decodedToken = jwt.decode(access_token, settings.ACCESS_TOKEN_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(decodedToken["sub"])
        current_user = db.query(User).filter(User.user_id == user_id).first()
        if not current_user:
            raise Exception("Invalid Access Token")
        return current_user.user_id

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
