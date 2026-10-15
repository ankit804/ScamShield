from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False) # 'user' or 'admin'
    status = Column(String(20), default="active", nullable=False) # 'active' or 'suspended'
    
    # Password reset support
    reset_token = Column(String(255), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False) # 'screenshot', 'message', 'url'
    type_label = Column(String(100), nullable=False)
    submitted_item = Column(String(500), nullable=False)
    risk_category = Column(String(50), nullable=False) # 'high', 'review', 'safe'
    risk_label = Column(String(100), nullable=False)
    status = Column(String(50), default="Completed", nullable=False)
    evidence_found = Column(Integer, default=0, nullable=False)
    total_indicators = Column(Integer, default=6, nullable=False)
    summary = Column(Text, nullable=False)
    findings_json = Column(Text, default="[]", nullable=False)
    next_steps_json = Column(Text, default="[]", nullable=False)
    disclaimer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="scans")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False) # e.g., 'USER_SUSPENDED', 'USER_ACTIVATED', 'ADMIN_LOGIN'
    target_type = Column(String(50), nullable=False) # 'user', 'scan', 'platform'
    target_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)