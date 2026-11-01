import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..auth import get_optional_user
from ..database import get_db
from ..models import Scan, User
from ..schemas import AnalysisRequest
from ..services.detector import analyze, redact_for_storage

router = APIRouter(tags=["Analysis Engine"])


def _store_analysis(result: dict[str, Any], user: User, db: Session) -> None:
    safe_item, safe_findings = redact_for_storage(
        result["type"], result["submittedItem"], result["findings"]
    )
    scan = Scan(
        id=result["id"],
        user_id=user.id,
        type=result["type"],
        type_label=result["typeLabel"],
        submitted_item=safe_item,
        risk_category=result["riskCategory"],
        risk_label=result["riskLabel"],
        status="Completed",
        evidence_found=result["evidenceFound"],
        total_indicators=result["totalIndicators"],
        summary=result["summary"],
        findings_json=json.dumps(safe_findings),
        next_steps_json=json.dumps(result["nextSteps"]),
        disclaimer=result["disclaimer"],
        created_at=datetime.fromisoformat(result["timestamp"]),
    )
    try:
        db.add(scan)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The scan was analyzed but could not be saved to your history. Please retry.",
        ) from exc


@router.post("/analyze")
def analyze_submission(
    payload: AnalysisRequest,
    request: Request,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Run explainable local checks. Submitted URLs are never fetched by this server."""
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 8 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Analysis request exceeds the 8 MB limit.")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid Content-Length header.")
    result = analyze(payload.model_dump())
    if current_user:
        _store_analysis(result, current_user, db)
    return result
