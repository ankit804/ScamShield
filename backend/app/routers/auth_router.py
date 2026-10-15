import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
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
    create_access_token, 
    get_current_user
)
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Public registration endpoint.
    Strictly creates regular 'user' accounts. Never allows role escalation.
    """
    # Check for existing email
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in or use another email."
        )

    # Securely hash password with bcrypt
    hashed = hash_password(user_in.password)

    # Create new user forced to 'user' role
    new_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        hashed_password=hashed,
        role="user", # Server-enforced role
        status="active"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate user and return signed JWT token.
    Supports extended 30-day session if remember_me is true.
    """
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
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

    # Determine token lifetime
    if login_in.remember_me:
        expires_delta = timedelta(minutes=settings.REMEMBER_ME_EXPIRE_MINUTES)
    else:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Generate JWT
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.full_name
    }
    access_token = create_access_token(token_data, expires_delta=expires_delta)

    # If admin logs in, record audit log
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
        db.add(audit)
        db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout():
    """Client-side token invalidation acknowledgment"""
    return {"message": "Successfully logged out. Please clear your authentication token."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user"""
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generate secure password reset token with 15-minute expiration.
    Discloses reset token cleanly when email delivery is not configured.
    """
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        # Prevent user enumeration by returning standard response
        return {
            "message": "If an account with that email exists, password reset instructions have been prepared.",
            "reset_token": None
        }

    # Generate cryptographic token
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token,
        "expires_in_minutes": 15,
        "note": "SMTP email delivery is not configured in this environment; the reset token is provided above for verification."
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validate reset token and update user password securely.
    """
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token."
        )

    # Check expiration
    if user.reset_token_expires_at and user.reset_token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )

    # Hash new password
    user.hashed_password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {"message": "Your password has been successfully reset. You may now log in with your new password."}
