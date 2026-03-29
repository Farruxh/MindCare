from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.dependency.auth import auth_dependency
from app.schemas.chat_history import ChatResponse
from app.schemas.ApiResponse import ApiResponse
from app.services.chat_history import create_chat_history, get_user_chats, get_chat_by_id, del_chat_history_by_id, del_chat_history

router = APIRouter(prefix="/api/v1/chats", tags=["Chat History"])

@router.post("/", response_model=ApiResponse[ChatResponse])
def create_chatHistory(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    chat = create_chat_history(db, current_user)
    return ApiResponse(status_code=200, data=chat, message="Chat History created successfully")


@router.get("/all", response_model=ApiResponse[list[ChatResponse]])
def get_chats(
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    chats = get_user_chats(db, current_user)
    return ApiResponse(status_code=200, data=chats, message="All Chats fetched successfully")


@router.get("/{chat_id}", response_model=ApiResponse[ChatResponse])
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(auth_dependency)
):
    chat = get_chat_by_id(db, chat_id)
    return ApiResponse(status_code=200, data=chat, message=" Chat fetched successfully ")

@router.delete("/{chat_id}/delete-by-id")
def delete_by_id(chat_id: int, db: Session = Depends(get_db)):
    return del_chat_history_by_id(db, chat_id)

@router.delete("/delete")
def delete_chat_history(db: Session = Depends(get_db)):
    del_chat_history(db)