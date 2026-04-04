from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db import Base, engine
from app.models.user import User
from app.models.assessment import Assessment_Result
from app.models.chat_history import Chat_History
from app.models.message import Message
from app.models.clinic import Clinic
from app.settings import settings


Base.metadata.create_all(bind = engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routes import user
from app.routes import assessment
from app.routes import chat_history
from app.routes import message
from app.routes import clinic

app.include_router(user.router)
app.include_router(assessment.router)
app.include_router(chat_history.router)
app.include_router(message.router)
app.include_router(clinic.router)


@app.exception_handler(HTTPException)
def exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "detail": exc.detail},
    )