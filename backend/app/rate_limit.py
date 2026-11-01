"""Database-backed fixed-window limits for sensitive authentication routes."""
import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from .config import settings
from .models import AuthAttempt


def request_ip(request: Request) -> str:
    # Do not trust X-Forwarded-For unless a trusted proxy is explicitly configured.
    return request.client.host if request.client else "unknown"


def _key_hash(bucket: str, identity: str) -> str:
    message = f"{bucket}:{identity}".encode("utf-8")
    return hmac.new(settings.SECRET_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()


def check_limit(db: Session, *, bucket: str, identity: str, limit: int, window_minutes: int) -> str:
    hashed = _key_hash(bucket, identity)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=window_minutes)
    count = db.query(AuthAttempt).filter(
        AuthAttempt.key_hash == hashed,
        AuthAttempt.created_at >= cutoff,
    ).count()
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please wait before trying again.",
            headers={"Retry-After": str(window_minutes * 60)},
        )
    return hashed


def record_attempt(db: Session, key_hash: str) -> None:
    try:
        db.add(AuthAttempt(key_hash=key_hash))
        db.commit()
        # Bound growth without retaining authentication metadata beyond a day.
        if datetime.now(timezone.utc).minute % 10 == 0:
            db.query(AuthAttempt).filter(
                AuthAttempt.created_at < datetime.now(timezone.utc) - timedelta(days=1)
            ).delete(synchronize_session=False)
            db.commit()
    except Exception:
        db.rollback()
        raise
