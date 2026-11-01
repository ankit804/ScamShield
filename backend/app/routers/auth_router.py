import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from ..models import User, AuditLog
from ..schemas import (
    UserRegister, 
    UserLogin, 
    UserResponse, 
    TokenResponse, 
    ForgotPasswordRequest, 
    ResetPasswordRequest
)
from ..auth import (
    hash_password, 
    verify_password, 
    needs_password_rehash,
    create_access_token, 
    get_current_user,
    decode_token,
    security,
)
from ..config import settings, should_disclose_reset_token
from ..rate_limit import check_limit, record_attempt, request_ip

# Initialize router instance
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/csrf")
def csrf_token(request: Request, response: Response):
    token = request.cookies.get("scamshield_csrf") or secrets.token_urlsafe(32)
    response.set_cookie(
        key="scamshield_csrf",
        value=token,
        httponly=False,
        secure=settings.ENVIRONMENT.lower() in {"production", "prod"},
        samesite="none" if settings.ENVIRONMENT.lower() in {"production", "prod"} else "lax",
        path="/",
    )
    return {"csrf_token": token}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    """
    Public registration endpoint.
    Strictly creates regular 'user' accounts. Never allows role escalation.
    """
    limit_key = check_limit(db, bucket="register", identity=request_ip(request), limit=5, window_minutes=60)
    record_attempt(db, limit_key)
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in or use another email."
        )

    hashed = hash_password(user_in.password)

    new_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email,
        hashed_password=hashed,
        role="user",
        status="active"
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation during registration."
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while registering the user."
        )

    return new_user


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate user and return signed JWT token.
    Supports extended 30-day session if remember_me is true.
    """
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        rate_key = check_limit(db, bucket="login", identity=f"{request_ip(request)}|{login_in.email}", limit=10, window_minutes=15)
        record_attempt(db, rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by administration. Please contact support."
        )

    if login_in.remember_me:
        expires_delta = timedelta(minutes=settings.REMEMBER_ME_EXPIRE_MINUTES)
    else:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    if needs_password_rehash(user.hashed_password):
        # Upgrade legacy bcrypt accounts to Argon2id after a successful login.
        user.hashed_password = hash_password(login_in.password)
        db.commit()

    token_data = {
        "sub": str(user.id),
        "ver": user.token_version,
    }
    access_token = create_access_token(token_data, expires_delta=expires_delta)
    response.set_cookie(
        key="scamshield_session",
        value=access_token,
        max_age=int(expires_delta.total_seconds()) if login_in.remember_me else None,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() in {"production", "prod"},
        samesite="none" if settings.ENVIRONMENT.lower() in {"production", "prod"} else "lax",
        path="/",
    )

    if user.role == "admin":
        audit = AuditLog(
            admin_id=user.id,
            admin_email=user.email,
            action="ADMIN_LOGIN",
            target_type="platform",
            target_id=str(user.id),
            details='{"event": "Admin authenticated successfully"}',
            ip_address=request.client.host if request.client else None
        )
        try:
            db.add(audit)
            db.commit()
        except Exception:
            db.rollback()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    credentials=Depends(security),
    db: Session = Depends(get_db),
):
    """Revoke outstanding sessions when possible and always clear stale cookies."""
    raw_token = credentials.credentials if credentials else request.cookies.get("scamshield_session")
    if raw_token:
        try:
            payload = decode_token(raw_token)
            user_id = int(payload.get("sub"))
            current_user = db.query(User).filter(User.id == user_id).first()
            if current_user and payload.get("ver", 0) == current_user.token_version:
                current_user.token_version += 1
                db.commit()
        except Exception:
            db.rollback()
    response.delete_cookie("scamshield_session", path="/")
    return {"message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user"""
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """
    Generate secure password reset token with 15-minute expiration.
    """
    key = check_limit(db, bucket="password-reset", identity=f"{request_ip(request)}|{req.email}", limit=5, window_minutes=60)
    record_attempt(db, key)
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"message": "If the account exists, reset email delivery is not configured. Contact the service administrator."}

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = None
    user.reset_token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate password reset token."
        )

    response = {"message": "If the account exists, reset email delivery is not configured. Contact the service administrator."}
    # Local demos have no configured mailer. Never return a live reset token in production.
    if should_disclose_reset_token(settings.ENVIRONMENT):
        response["reset_token"] = reset_token
        response["expires_in_minutes"] = settings.RESET_TOKEN_EXPIRE_MINUTES
        response["note"] = "Development only: SMTP delivery is not configured, so this token is shown for local verification."
    return response


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """
    Validate reset token and update user password securely.
    """
    key = check_limit(db, bucket="password-reset-submit", identity=request_ip(request), limit=10, window_minutes=15)
    record_attempt(db, key)
    reset_hash = hashlib.sha256(req.token.encode("utf-8")).hexdigest()
    user = db.query(User).filter(User.reset_token_hash == reset_hash).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    if not user.reset_token_expires_at or user.reset_token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )

    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    user.token_version += 1
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password."
        )

    return {"message": "Your password has been successfully reset. You may now log in with your new password."}
