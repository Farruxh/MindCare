from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.chat_history import Chat_History
from app.schemas.chat_history import ChatResponse


def create_chat_history(db: Session, current_user: int):
    try:
        new_chat = Chat_History(user_id=current_user)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat
    except Exception as e: 
        return HTTPException(status_code=500, detail=str(e))
    

def get_user_chats(db: Session, current_user: int):
    return db.query(Chat_History).filter(Chat_History.user_id == current_user).order_by(Chat_History.created_at.desc()).all()


def get_chat_by_id(db: Session, chat_id: int):
    return db.query(Chat_History).filter(Chat_History.chat_id == chat_id).first()

def del_chat_history_by_id(db: Session, chat_id: int):
    chat = db.query(Chat_History).filter(Chat_History.chat_id == chat_id).first()
    db.delete(chat)
    db.commit()
    return "True"


def del_chat_history(db: Session):
    chat = db.query(Chat_History).all()
    for ch in chat:
        db.delete(ch)
    db.commit()