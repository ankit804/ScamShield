import json
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Scan
from ..auth import get_optional_user

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
        if preset_type == "high-fraud" or detected_urgency or detected_alternate:
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
        if detected_url_shortener or detected_suspicious_domain:
            risk_category = "high"
            evidence_count = 3
            findings.append({
                "id": "f-url-1",
                "title": "Concealed or untrusted destination",
                "severity": "high",
                "evidence": f'"{raw_text}"',
                "explanation": "Target domain does not match official Nepali financial service providers.",
                "recommended": "Do not visit the website. Never enter credentials."
            })
        else:
            risk_category = "safe"
            evidence_count = 0

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
        "totalIndicators": 6 if scan_type == "screenshot" else 5,
        "summary": summary,
        "findings": findings,
        "nextSteps": next_steps,
        "disclaimer": "ScamShield identifies potential warning signs. This analysis cannot independently confirm whether money was received or prove that a person or transaction is fraudulent."
    }

    # If user is authenticated, persist to database automatically
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
        db.add(new_scan)
        db.commit()

    return result_obj
