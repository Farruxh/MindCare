from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse

def save_message(db: Session, chat_id: int, payload: MessageCreate):
    try:
        new_message = Message(
        chat_id=chat_id,
        role= payload.role,
        message_text=payload.message_text
    )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_chat_messages(db: Session, chat_id: int):
    return db.query(Message).filter(Message.chat_id == chat_id).all()


def get_chat_history_for_gemini(db: Session, chat_id: int):
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    return [
        {
            "role": msg.role,
            "parts": [{"text": msg.message_text}]
        }
        for msg in messages
    ]

def delete_message(db: Session, chat_id: int):
    messages =  db.query(Message).filter(Message.chat_id == chat_id).all()
    for msg in messages:
        db.delete(msg)
    db.commit()