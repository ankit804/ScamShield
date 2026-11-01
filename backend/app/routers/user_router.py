import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Scan
from ..schemas import UserResponse, UserProfileUpdate, ScanResponse, UserStats
from ..auth import get_current_user

# Initialize router instance
router = APIRouter(prefix="/users/me", tags=["User Dashboard"])

@router.get("", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch current user profile"""
    return current_user


@router.patch("", response_model=UserResponse)
def update_user_profile(
    profile: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = profile.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/stats", response_model=UserStats)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch real dashboard metrics strictly for the authenticated user.
    Never exposes or mixes data from other users.
    """
    total = db.query(Scan).filter(Scan.user_id == current_user.id).count()
    high = db.query(Scan).filter(Scan.user_id == current_user.id, Scan.risk_category == "high").count()
    review = db.query(Scan).filter(Scan.user_id == current_user.id, Scan.risk_category == "review").count()
    safe = db.query(Scan).filter(Scan.user_id == current_user.id, Scan.risk_category == "safe").count()

    return {
        "total_scans": total,
        "high_concern_count": high,
        "review_count": review,
        "safe_count": safe
    }


@router.get("/scans", response_model=List[ScanResponse])
def get_user_scans(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0, le=1000000),
    risk: Optional[str] = Query(None, pattern="^(high|review|safe)$"),
    type_filter: Optional[str] = Query(None, alias="type", pattern="^(screenshot|message|url)$"),
    sort: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch scan history strictly belonging to the authenticated user.
    """
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    if risk:
        query = query.filter(Scan.risk_category == risk)
    if type_filter:
        query = query.filter(Scan.type == type_filter)
    order = Scan.created_at.asc() if sort == "asc" else Scan.created_at.desc()
    scans = query.order_by(order).offset(offset).limit(limit).all()

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

        date_formatted = s.created_at.strftime("%b %d, %Y %H:%M") if s.created_at else ""

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
            "dateFormatted": date_formatted
        })

    return results


@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_user_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")
    try:
        findings = json.loads(scan.findings_json)
    except (TypeError, ValueError):
        findings = []
    try:
        next_steps = json.loads(scan.next_steps_json)
    except (TypeError, ValueError):
        next_steps = []
    return {
        "id": scan.id, "user_id": scan.user_id, "type": scan.type,
        "type_label": scan.type_label, "submitted_item": scan.submitted_item,
        "risk_category": scan.risk_category, "risk_label": scan.risk_label,
        "status": scan.status, "evidence_found": scan.evidence_found,
        "total_indicators": scan.total_indicators, "summary": scan.summary,
        "findings": findings, "next_steps": next_steps,
        "disclaimer": scan.disclaimer, "created_at": scan.created_at,
        "dateFormatted": scan.created_at.strftime("%b %d, %Y %H:%M") if scan.created_at else "",
    }


@router.delete("/scans")
def clear_user_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        deleted = db.query(Scan).filter(Scan.user_id == current_user.id).delete(synchronize_session=False)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Could not clear scan history.") from exc
    return {"message": "Scan history cleared.", "deleted_count": deleted}


@router.delete("/scans/{scan_id}")
def delete_user_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a scan record, strictly verifying user ownership to prevent IDOR attacks.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    try:
        db.delete(scan)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete scan record."
        )
        
    return {"message": "Scan record successfully deleted."}
