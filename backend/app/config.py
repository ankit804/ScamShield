import os
from typing import List

class Settings:
    PROJECT_NAME: str = "ScamShield Nepal API"
    VERSION: str = "1.0.0"
    
    # Security & Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "scamshield_nepal_fintech_production_secret_key_2026_secured")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    REMEMBER_ME_EXPIRE_MINUTES: int = 43200 # 30 days
    
    # Database: Supports PostgreSQL or local SQLite persistence fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./scamshield.db")
    
    # CORS: Allowed origins for local dev and Vercel production
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://scamshield-nepal.vercel.app",
        "https://*.vercel.app"
    ]
    
    # Environment mode
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
