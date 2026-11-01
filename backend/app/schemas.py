from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List, Any, Literal
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    model_config = ConfigDict(extra="forbid")
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_full_name(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).strip().lower()

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
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = False

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).strip().lower()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=32, max_length=256)
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

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    full_name: str = Field(..., min_length=2, max_length=100)

    @field_validator("full_name", mode="before")
    @classmethod
    def normalize_full_name(cls, value):
        return value.strip() if isinstance(value, str) else value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Scan Schemas
class FindingItem(BaseModel):
    id: Optional[str] = None
    title: str
    severity: Literal["low", "medium", "high"]
    evidence: Optional[str] = None
    explanation: str
    recommended: Optional[str] = None


class ScanCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: Optional[str] = None
    type: Literal["screenshot", "message", "url"]
    type_label: str = Field(..., min_length=1, max_length=100)
    submitted_item: str = Field(..., min_length=1, max_length=500)
    risk_category: Literal["high", "review", "safe"]
    risk_label: str = Field(..., min_length=1, max_length=100)
    status: str = "Completed"
    evidence_found: int = Field(default=0, ge=0, le=100)
    total_indicators: int = Field(default=6, ge=0, le=100)
    summary: str = Field(..., min_length=1, max_length=4000)
    findings: List[FindingItem] = Field(default_factory=list, max_length=30)
    next_steps: List[str] = Field(default_factory=list, max_length=20)
    disclaimer: Optional[str] = Field(default=None, max_length=1000)


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
    findings: List[FindingItem] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    disclaimer: Optional[str] = None
    created_at: datetime
    dateFormatted: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)


class UserStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["active", "suspended"]


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

    model_config = ConfigDict(from_attributes=True)


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["screenshot", "message", "url"]
    data: dict[str, Any]
    language: Literal["en", "ne"] = "en"


class ScanDetailResponse(ScanResponse):
    payment_status: str = "unverified"
