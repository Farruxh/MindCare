from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ACCESS_TOKEN_SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_TIME: int
    REFRESH_TOKEN_SECRET_KEY: str
    REFRESH_TOKEN_EXPIRE_TIME: int
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    CORS_ORIGIN: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    
    class Config:
        env_file = ".env"

settings = Settings()