import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Scan, AuditLog
from ..schemas import (
    AdminPlatformStats, 
    AdminUserListItem, 
    UserStatusUpdate, 
    ScanResponse, 
    AuditLogResponse
)
from ..auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=AdminPlatformStats)
def get_admin_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Fetch platform-wide aggregated analytics computed from real database tables.
    Requires verified administrator credentials.
    """
    now = datetime.now(timezone.utc)
    one_day_ago = now - timedelta(hours=24)

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "active").count()
    suspended_users = db.query(User).filter(User.status == "suspended").count()

    total_scans = db.query(Scan).count()
    high_scans = db.query(Scan).filter(Scan.risk_category == "high").count()
    review_scans = db.query(Scan).filter(Scan.risk_category == "review").count()
    safe_scans = db.query(Scan).filter(Scan.risk_category == "safe").count()
    recent_24h = db.query(Scan).filter(Scan.created_at >= one_day_ago).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "total_scans": total_scans,
        "high_concern_scans": high_scans,
        "review_scans": review_scans,
        "safe_scans": safe_scans,
        "recent_scans_24h": recent_24h
    }


@router.get("/users", response_model=List[AdminUserListItem])
def list_admin_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    View registered users with account status and scan counts.
    Never exposes passwords, hashes, or authentication tokens.
    """
    q = db.query(User)

    if query and query.strip():
        search = f"%{query.strip().lower()}%"
        q = q.filter((func.lower(User.full_name).like(search)) | (func.lower(User.email).like(search)))

    if role and role.strip() and role != "all":
        q = q.filter(User.role == role.strip().lower())

    if status_filter and status_filter.strip() and status_filter != "all":
        q = q.filter(User.status == status_filter.strip().lower())

    users = q.order_by(User.created_at.desc()).all()

    items = []
    for u in users:
        scan_cnt = db.query(Scan).filter(Scan.user_id == u.id).count()
        items.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at,
            "scan_count": scan_cnt
        })

    return items


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    request: Request,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Suspend or reactivate an account.
    Logs action in AuditLog. Prevents self-suspension.
    """
    if status_in.status not in ["active", "suspended"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either 'active' or 'suspended'."
        )

    # Prevent admin from locking themselves out
    if user_id == current_admin.id and status_in.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot suspend their own account."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found."
        )

    prev_status = target_user.status
    target_user.status = status_in.status

    # Record Audit Log for administrative action
    action_type = "USER_SUSPENDED" if status_in.status == "suspended" else "USER_ACTIVATED"
    audit = AuditLog(
        admin_id=current_admin.id,
        admin_email=current_admin.email,
        action=action_type,
        target_type="user",
        target_id=str(target_user.id),
        details=json.dumps({
            "target_email": target_user.email,
            "previous_status": prev_status,
            "new_status": status_in.status
        }),
        ip_address=request.client.host if request.client else None
    )

    db.add(audit)
    db.commit()

    return {
        "message": f"User status successfully updated to {status_in.status}.",
        "user_id": target_user.id,
        "new_status": target_user.status
    }


@router.get("/scans", response_model=List[ScanResponse])
def list_admin_scans(
    type_filter: Optional[str] = Query(None, alias="type"),
    risk_filter: Optional[str] = Query(None, alias="risk"),
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Inspect platform-wide scan metadata with filters.
    Protects sensitive screenshot attachments while providing oversight on detection findings.
    """
    q = db.query(Scan)

    if type_filter and type_filter != "all":
        q = q.filter(Scan.type == type_filter)
    if risk_filter and risk_filter != "all":
        q = q.filter(Scan.risk_category == risk_filter)

    scans = q.order_by(Scan.created_at.desc()).limit(100).all()

    results = []
    for s in scans:
        try:
            findings = json.loads(s.findings_json)
        except Exception:
            findings = []
        try:
            next_steps = json.loads(s.next_steps_json)
        except Exception:
            next_steps = []

        results.append({
            "id": s.id,
            "user_id": s.user_id,
            "type": s.type,
            "type_label": s.type_label,
            "submitted_item": s.submitted_item,
            "risk_category": s.risk_category,
            "risk_label": s.risk_label,
            "status": s.status,
            "evidence_found": s.evidence_found,
            "total_indicators": s.total_indicators,
            "summary": s.summary,
            "findings": findings,
            "next_steps": next_steps,
            "disclaimer": s.disclaimer,
            "created_at": s.created_at,
            "dateFormatted": s.created_at.strftime("%b %d, %Y %H:%M") if s.created_at else ""
        })

    return results


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Fetch security audit trail of sensitive administrative operations.
    """
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(150).all()
    return logs
