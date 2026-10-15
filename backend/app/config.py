import os
from typing import List, Optional

MIN_SECRET_KEY_LENGTH = 32
PRODUCTION_ENVIRONMENTS = {"production", "prod"}


def load_secret_key(raw: Optional[str] = None) -> str:
    """Require a non-default JWT signing secret from the environment."""
    key = (os.getenv("SECRET_KEY") if raw is None else raw) or ""
    key = key.strip()
    if not key:
        raise RuntimeError(
            "SECRET_KEY is not set. Configure a strong secret in the environment "
            "before starting the API. Do not use a value committed in source control."
        )
    if len(key) < MIN_SECRET_KEY_LENGTH:
        raise RuntimeError(
            f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters."
        )
    return key


def is_production(environment: Optional[str] = None) -> bool:
    env = (environment if environment is not None else os.getenv("ENVIRONMENT", "development"))
    return env.strip().lower() in PRODUCTION_ENVIRONMENTS


def should_disclose_reset_token(environment: Optional[str] = None) -> bool:
    """Reset tokens may be returned only outside production (local/demo without SMTP)."""
    return not is_production(environment)


def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


def parse_cors_origins(default: List[str]) -> List[str]:
    origins = list(default)
    extra = os.getenv("FRONTEND_ORIGIN", "").strip()
    if extra and extra not in origins:
        origins.append(extra.rstrip("/"))
    csv = os.getenv("CORS_ORIGINS", "").strip()
    if csv:
        for item in csv.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned and cleaned not in origins and "*" not in cleaned:
                origins.append(cleaned)
    return origins


class Settings:
    PROJECT_NAME: str = "ScamShield Nepal API"
    VERSION: str = "1.0.0"
    ALGORITHM: str = "HS256"
    REMEMBER_ME_EXPIRE_MINUTES: int = 43200  # 30 days

    def __init__(self) -> None:
        self.SECRET_KEY: str = load_secret_key()
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
        self.DATABASE_URL: str = normalize_database_url(
            os.getenv("DATABASE_URL", "sqlite:///./scamshield.db")
        )
        self.ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        self.CORS_ORIGINS: List[str] = parse_cors_origins(
            [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "https://scamshield-nepal.vercel.app",
            ]
        )


settings = Settings()