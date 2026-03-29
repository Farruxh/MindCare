from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from app.db import get_db
from app.dependency.auth import auth_dependency
from app.schemas.ApiResponse import ApiResponse
from app.schemas.message import MessageResponse, MessageCreate
from app.services.assessment import get_last_assessment
from app.services.message import save_message, get_chat_history_for_gemini, get_chat_messages,delete_message
from app.services.gemini import ask_gemini

router = APIRouter(prefix="/api/v1/messages" , tags= ["Messages"])

@router.post("/{chat_id}/message", response_model= ApiResponse[MessageResponse])
def new_message(chat_id: int, payload: MessageCreate, db: Session = Depends(get_db), current_user: int = Depends(auth_dependency)):
    
    save_message(db, chat_id, payload)

    chatHistory = get_chat_history_for_gemini(db, chat_id)

    last_assessment = get_last_assessment(db, current_user)

    gemini_response = ask_gemini(chatHistory, last_assessment)

    ai_message = save_message(db, chat_id, MessageCreate(
        role="model",
        message_text=gemini_response
    ))

    return ApiResponse(status_code= 200, data = ai_message, message = "Message from Assisstant received successfully")

@router.get("/{chat_id}/get", response_model=ApiResponse[list[MessageResponse]])
def get_message_by_chat_id(chat_id: int, db: Session = Depends(get_db)):
    messages = get_chat_messages(db, chat_id)
    return ApiResponse(status_code= 200, data= messages, message="All messages for chat_id fetched successfully")

@router.delete("/{chat_id}/delete")
def delete_message_for_chat(chat_id: int, db: Session = Depends(get_db)):
    delete_message(db, chat_id)