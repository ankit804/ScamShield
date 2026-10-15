from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


# User Output Schemas
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Scan Schemas
class FindingItem(BaseModel):
    id: Optional[str] = None
    title: str
    severity: str
    evidence: Optional[str] = None
    explanation: str
    recommended: Optional[str] = None


class ScanCreate(BaseModel):
    id: Optional[str] = None
    type: str # 'screenshot', 'message', 'url'
    type_label: str
    submitted_item: str
    risk_category: str # 'high', 'review', 'safe'
    risk_label: str
    status: str = "Completed"
    evidence_found: int = 0
    total_indicators: int = 6
    summary: str
    findings: List[Any] = []
    next_steps: List[str] = []
    disclaimer: Optional[str] = None


class ScanResponse(BaseModel):
    id: str
    user_id: int
    type: str
    type_label: str
    submitted_item: str
    risk_category: str
    risk_label: str
    status: str
    evidence_found: int
    total_indicators: int
    summary: str
    findings: List[Any] = []
    next_steps: List[str] = []
    disclaimer: Optional[str] = None
    created_at: datetime
    dateFormatted: Optional[str] = None

    class Config:
        from_attributes = True


# User Statistics
class UserStats(BaseModel):
    total_scans: int
    high_concern_count: int
    review_count: int
    safe_count: int


# Admin Schemas
class AdminPlatformStats(BaseModel):
    total_users: int
    active_users: int
    suspended_users: int
    total_scans: int
    high_concern_scans: int
    review_scans: int
    safe_scans: int
    recent_scans_24h: int


class AdminUserListItem(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    status: str
    created_at: datetime
    scan_count: int

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    status: str # 'active' or 'suspended'


class AuditLogResponse(BaseModel):
    id: int
    admin_id: Optional[int]
    admin_email: str
    action: str
    target_type: str
    target_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
