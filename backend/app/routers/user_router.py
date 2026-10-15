import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Scan
from ..schemas import UserResponse, ScanCreate, ScanResponse, UserStats
from ..auth import get_current_user

# Initialize router instance
router = APIRouter(prefix="/users/me", tags=["User Dashboard"])

@router.get("", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch current user profile"""
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch scan history strictly belonging to the authenticated user.
    """
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .all()
    )

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


@router.post("/scans", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
def create_user_scan(
    scan_in: ScanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record a new verified scan associated exclusively with the authenticated user.
    """
    scan_id = scan_in.id or f"scan-{int(datetime.now().timestamp() * 1000)}"

    new_scan = Scan(
        id=scan_id,
        user_id=current_user.id,
        type=scan_in.type,
        type_label=scan_in.type_label,
        submitted_item=scan_in.submitted_item,
        risk_category=scan_in.risk_category,
        risk_label=scan_in.risk_label,
        status=scan_in.status,
        evidence_found=scan_in.evidence_found,
        total_indicators=scan_in.total_indicators,
        summary=scan_in.summary,
        findings_json=json.dumps(scan_in.findings),
        next_steps_json=json.dumps(scan_in.next_steps),
        disclaimer=scan_in.disclaimer
    )

    try:
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save scan record to database."
        )

    return {
        "id": new_scan.id,
        "user_id": new_scan.user_id,
        "type": new_scan.type,
        "type_label": new_scan.type_label,
        "submitted_item": new_scan.submitted_item,
        "risk_category": new_scan.risk_category,
        "risk_label": new_scan.risk_label,
        "status": new_scan.status,
        "evidence_found": new_scan.evidence_found,
        "total_indicators": new_scan.total_indicators,
        "summary": new_scan.summary,
        "findings": scan_in.findings,
        "next_steps": scan_in.next_steps,
        "disclaimer": new_scan.disclaimer,
        "created_at": new_scan.created_at,
        "dateFormatted": new_scan.created_at.strftime("%b %d, %Y %H:%M")
    }


@router.delete("/scans/{scan_id}")
def delete_user_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a scan record, strictly verifying user ownership to prevent IDOR attacks.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    # Enforce strict ownership check
    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this scan record."
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