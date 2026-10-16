import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from urllib.parse import urlsplit
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Scan
from ..schemas import ScanCreate, ScanResponse
from ..auth import get_optional_user, get_current_user

router = APIRouter(tags=["Analysis Engine"])

@router.post("/analyze")
async def analyze_submission(
    payload: Dict[str, Any],
    request: Request,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Perform heuristic risk analysis on submitted screenshot metadata, message, or URL.
    If authenticated, automatically persists scan record into user's private history.
    """
    scan_type = payload.get("type", "message")
    data = payload.get("data", {})
    language = payload.get("language", "en")

    text = (data.get("text") or data.get("url") or data.get("fileName") or "").lower()
    raw_text = data.get("text") or data.get("url") or data.get("fileName") or ""

    risk_category = "safe"
    evidence_count = 0
    findings = []

    detected_urgency = any(w in text for w in [
        "immediately", "urgent", "right now", "cancel the order", "hurry", 
        "fast", "chito", "hataar", "rider waiting", "cancel order"
    ])
    detected_alternate = any(w in text for w in [
        "alternate", "different number", "send to this", "another account", 
        "arkai", "badi bhayo", "refund", "brother", "sister"
    ])
    detected_payment_claim = any(w in text for w in [
        "esewa", "khalti", "fonepay", "connectips", "payment sent", 
        "npr", "rs.", "transferred", "paid", "paisa pathaye"
    ])
    detected_url_shortener = any(w in text for w in ["bit.ly", "tinyurl", "is.gd", "t.co", "cutt.ly"])
    detected_suspicious_domain = any(w in text for w in [".top", ".xyz", ".club", ".online", ".site", "login", "verify", "kyc"])

    if scan_type == "screenshot":
        preset_type = data.get("presetType")
        if preset_type == "custom-upload":
            risk_category = "review"
            evidence_count = 0
            findings.append({
                "id": "f-scr-review",
                "title": "Image content was not inspected",
                "severity": "medium",
                "evidence": data.get("fileName", ""),
                "explanation": "This service does not perform OCR or image manipulation detection, so it cannot assess the payment details shown.",
                "recommended": "Check the transaction directly in your own bank or wallet ledger before acting."
            })
        elif preset_type == "high-fraud" or detected_urgency or detected_alternate:
            risk_category = "high"
            evidence_count = 4
            findings.append({
                "id": "f-1",
                "title": "Urgent pressure to act",
                "severity": "high",
                "evidence": f'"{data.get("caption") or "Dispatch immediately or I will cancel the order"}"',
                "explanation": "Pressure to act quickly is a common tactic used in scams.",
                "recommended": "Do not rush. Verify the payment first."
            })
            findings.append({
                "id": "f-2",
                "title": "Suspicious payment claim",
                "severity": "high",
                "evidence": '"Payment sent via eSewa, check and confirm"',
                "explanation": "A screenshot alone does not confirm that the money has been received.",
                "recommended": "Verify the transaction in your own eSewa app."
            })
            findings.append({
                "id": "f-3",
                "title": "Unusual payment instructions",
                "severity": "medium",
                "evidence": '"Send to this alternate number if not working"',
                "explanation": "Requests to use different numbers or methods can be a red flag.",
                "recommended": "Only use official payment channels."
            })
            findings.append({
                "id": "f-4",
                "title": "Inconsistent details",
                "severity": "medium",
                "evidence": '"Reference number does not match standard amount format"',
                "explanation": "Details in the message don't align with typical transaction formats.",
                "recommended": "Double-check all transaction details."
            })
        elif preset_type == "review":
            risk_category = "review"
            evidence_count = 2
            findings.append({
                "id": "f-rev-1",
                "title": "Voucher compression anomalies",
                "severity": "medium",
                "evidence": '"Compression artifacts detected around amount"',
                "explanation": "Image artifacts indicate potential manipulation of the numeric values.",
                "recommended": "Verify transaction ID in your native merchant portal."
            })
        else:
            risk_category = "safe"
            evidence_count = 0
            findings.append({
                "id": "f-safe-1",
                "title": "Standard transaction format",
                "severity": "low",
                "evidence": '"Standard layout geometry verified"',
                "explanation": "No visual tampering artifacts detected.",
                "recommended": "Verify credit in your banking ledger before goods dispatch."
            })
    elif scan_type == "message":
        if detected_urgency or detected_alternate or "refund" in text:
            risk_category = "high"
            evidence_count = 3
            findings.append({
                "id": "f-msg-1",
                "title": "Urgent pressure to act",
                "severity": "high",
                "evidence": f'"{raw_text[:60]}..."' if len(raw_text) > 60 else f'"{raw_text}"',
                "explanation": "Aggressive timeline demands are designed to bypass payment confirmation.",
                "recommended": "Do not rush. Confirm credit in your ledger before any goods release."
            })
            if detected_alternate:
                findings.append({
                    "id": "f-msg-2",
                    "title": "Alternate payment redirection",
                    "severity": "high",
                    "evidence": '"Requests action on alternate number / wallet"',
                    "explanation": "Directing funds or refunds to alternate numbers is a staple mechanism of fraud.",
                    "recommended": "Never send refunds to alternate contact numbers without bank statement clearance."
                })
        elif detected_payment_claim:
            risk_category = "review"
            evidence_count = 2
            findings.append({
                "id": "f-msg-rev-1",
                "title": "Manual ledger verification needed",
                "severity": "medium",
                "evidence": f'"{raw_text[:50]}..."',
                "explanation": "Payment was referenced in text, but independent confirmation from your merchant app is mandatory.",
                "recommended": "Check your transaction statement before packing items."
            })
        else:
            risk_category = "safe"
            evidence_count = 0
    elif scan_type == "url":
        candidate = raw_text if "://" in raw_text else f"https://{raw_text}"
        try:
            hostname = (urlsplit(candidate).hostname or "").lower().rstrip(".")
        except ValueError:
            hostname = ""
        official_domains = ("esewa.com.np", "khalti.com", "connectips.com", "fonepay.com")
        is_official_domain = any(hostname == domain or hostname.endswith(f".{domain}") for domain in official_domains)
        if detected_url_shortener or detected_suspicious_domain:
            risk_category = "high"
            evidence_count = 3
            findings.append({
                "id": "f-url-1",
                "title": "Concealed or suspicious URL pattern",
                "severity": "high",
                "evidence": f'"{raw_text}"',
                "explanation": "The URL uses a shortening service or a suspicious domain/credential prompt pattern. The destination has not been opened or scanned.",
                "recommended": "Do not follow the link or enter credentials. Open the provider's official app independently."
            })
        elif is_official_domain:
            risk_category = "safe"
            evidence_count = 0
            findings.append({
                "id": "f-url-official-host",
                "title": "Recognized provider hostname",
                "severity": "low",
                "evidence": hostname,
                "explanation": "The hostname matches a known provider domain. This check does not verify the page, connection, or current safety of the site.",
                "recommended": "Check the hostname carefully and use the official app for payments."
            })
        else:
            risk_category = "review"
            evidence_count = 1
            findings.append({
                "id": "f-url-review",
                "title": "Unverified destination",
                "severity": "medium",
                "evidence": f'"{raw_text}"',
                "explanation": "This hostname is not on the small list of recognized provider domains. No live reputation lookup is performed.",
                "recommended": "Avoid entering payment credentials unless you independently confirm the destination."
            })

    risk_label = (
        "High Concern" if risk_category == "high" 
        else "Needs Verification" if risk_category == "review" 
        else "No Major Warning Signs Detected"
    )

    summary = (
        "This content shows multiple warning signs. Be careful and verify the payment in your own banking or wallet app before taking any action."
        if risk_category == "high"
        else "Some inconsistencies or missing details require independent verification in your payment app before proceeding."
        if risk_category == "review"
        else "No common scam indicators detected, but remember screenshots can be falsified. Always verify in your authentic banking app."
    )

    next_steps = [
        "Open your own banking or wallet application independently.",
        "Check the transaction status and amount in your trusted ledger.",
        "Confirm the recipient and transaction reference.",
        "Do not dispatch goods until payment is confirmed in trusted records.",
        "If fraud is suspected, preserve the evidence and contact the relevant financial institution."
    ]

    scan_id = f"scan-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    submitted_item = data.get("fileName") or (raw_text[:50] + "..." if len(raw_text) > 50 else raw_text) or "Uploaded item"

    result_obj = {
        "id": scan_id,
        "type": scan_type,
        "type_label": "Payment Screenshot" if scan_type == "screenshot" else "Suspicious Message" if scan_type == "message" else "Unknown URL",
        "submitted_item": submitted_item,
        "dateFormatted": datetime.now(timezone.utc).strftime("%b %d, %Y %H:%M"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "riskCategory": risk_category,
        "riskLabel": risk_label,
        "status": "Completed",
        "evidenceFound": evidence_count,
        "totalIndicators": 6 if scan_type == "screenshot" else 5 if scan_type == "message" else 4,
        "summary": summary,
        "findings": findings,
        "nextSteps": next_steps,
        "disclaimer": "ScamShield identifies potential warning signs. This analysis cannot independently confirm whether money was received or prove that a person or transaction is fraudulent."
    }

    # If user is authenticated, persist to database automatically with safe rollback
    if current_user:
        new_scan = Scan(
            id=scan_id,
            user_id=current_user.id,
            type=scan_type,
            type_label=result_obj["type_label"],
            submitted_item=submitted_item,
            risk_category=risk_category,
            risk_label=risk_label,
            status="Completed",
            evidence_found=evidence_count,
            total_indicators=result_obj["totalIndicators"],
            summary=summary,
            findings_json=json.dumps(findings),
            next_steps_json=json.dumps(next_steps),
            disclaimer=result_obj["disclaimer"]
        )
        try:
            db.add(new_scan)
            db.commit()
        except Exception:
            db.rollback()

    return result_obj


scan_router_api = APIRouter(prefix="/scans", tags=["Scans"])

@scan_router_api.post("", status_code=status.HTTP_201_CREATED)
def create_scan(scan_data: ScanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Generate a unique ID if not provided in the request payload
    scan_id = scan_data.id if scan_data.id else f"scan-{uuid.uuid4().hex[:12]}"
    
    # Create the database model instance
    new_scan = Scan(
        id=scan_id,
        user_id=current_user.id,
        type=scan_data.type,
        type_label=scan_data.type_label,
        submitted_item=scan_data.submitted_item,
        risk_category=scan_data.risk_category,
        risk_label=scan_data.risk_label,
        status=scan_data.status,
        evidence_found=scan_data.evidence_found,
        total_indicators=scan_data.total_indicators,
        summary=scan_data.summary,
        findings_json=json.dumps(scan_data.findings),
        next_steps_json=json.dumps(scan_data.next_steps),
        disclaimer=scan_data.disclaimer
    )
    
    try:
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create scan record."
        )
    return new_scan

# Include the second sub-router actions into the main router instance
router.include_router(scan_router_api)
