"""Explainable local scam indicators. This service never fetches submitted URLs."""
import base64
import binascii
import ipaddress
import re
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlsplit

from fastapi import HTTPException

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:  # OCR is optional at runtime and degrades explicitly.
    Image = ImageOps = None
    UnidentifiedImageError = Exception

try:
    import pytesseract
except ImportError:
    pytesseract = None

from ..config import settings

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_TEXT_CHARS = 12_000
OFFICIAL_PAYMENT_DOMAINS = ("esewa.com.np", "khalti.com", "connectips.com", "fonepay.com")
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy"}
SUSPICIOUS_TLDS = {"top", "xyz", "club", "online", "site", "tk", "work", "click"}


def _finding(kind: str, severity: str, evidence: str, explanation: str, recommended: str) -> dict[str, str]:
    return {
        "id": f"finding-{uuid.uuid4().hex[:12]}",
        "type": kind,
        "title": kind.replace("_", " ").title(),
        "severity": severity,
        "evidence": evidence[:240],
        "explanation": explanation,
        "recommended": recommended,
    }


def _normalize_url(raw_url: str) -> tuple[str, str, list[dict[str, str]]]:
    value = raw_url.strip()
    candidate = value if "://" in value else f"https://{value}"
    try:
        parts = urlsplit(candidate)
        hostname = (parts.hostname or "").rstrip(".").encode("idna").decode("ascii").lower()
        port = parts.port
    except (ValueError, UnicodeError):
        raise HTTPException(status_code=422, detail="Enter a valid HTTP or HTTPS URL.")
    if parts.scheme.lower() not in {"http", "https"} or not hostname or not parts.netloc:
        raise HTTPException(status_code=422, detail="Only valid HTTP and HTTPS URLs can be checked.")
    if parts.username is not None or parts.password is not None:
        raise HTTPException(status_code=422, detail="URLs containing embedded credentials cannot be checked.")
    if port is not None and not (1 <= port <= 65535):
        raise HTTPException(status_code=422, detail="The URL contains an invalid network port.")
    return candidate, hostname, []


def _is_private_host(hostname: str) -> bool:
    try:
        address = ipaddress.ip_address(hostname)
        return not address.is_global
    except ValueError:
        return hostname in {"localhost", "localhost.localdomain"} or hostname.endswith((".localhost", ".local", ".internal"))


def _url_analysis(raw_url: str, language: str) -> tuple[str, int, list[dict[str, str]], str]:
    normalized, hostname, _ = _normalize_url(raw_url)
    parts = urlsplit(normalized)
    official = any(hostname == domain or hostname.endswith(f".{domain}") for domain in OFFICIAL_PAYMENT_DOMAINS)
    suspicious_ip = _is_private_host(hostname)
    shortener = any(hostname == domain or hostname.endswith(f".{domain}") for domain in URL_SHORTENERS)
    tld = hostname.rsplit(".", 1)[-1]
    brand_mismatch = any(brand in hostname and not (hostname == domain or hostname.endswith(f".{domain}"))
                         for brand, domain in (("esewa", "esewa.com.np"), ("khalti", "khalti.com"), ("fonepay", "fonepay.com"), ("connectips", "connectips.com")))
    punycode = "xn--" in hostname
    findings: list[dict[str, str]] = []

    if suspicious_ip:
        findings.append(_finding("private_or_nonpublic_host", "high", hostname,
            "This URL points to a local or non-public network address. ScamShield does not connect to it.",
            "Do not enter payment or account information on local or private-network links."))
        return "high", 1, findings, normalized
    if brand_mismatch:
        findings.append(_finding("possible_brand_impersonation", "high", hostname,
            "A known payment-provider name appears in a hostname that is not the provider's recognized domain.",
            "Do not sign in. Open the provider's official app or type its address yourself."))
    if parts.scheme.lower() != "https":
        findings.append(_finding("unencrypted_connection", "medium", normalized,
            "This link does not use HTTPS, so data sent to the site may not be protected in transit.",
            "Do not submit passwords or payment information over an unencrypted connection."))
    if not official and re.search(r"(?:^|/|[?&=._-])(?:login|signin|verify|kyc|password|otp|wallet)(?:$|/|[?&=._-])", parts.path + "?" + parts.query, re.I):
        findings.append(_finding("credential_prompt_path", "medium", f"{hostname}{parts.path}",
            "The URL contains a sign-in or verification keyword on a host not recognized as a payment provider.",
            "Do not enter credentials until you confirm the exact host through an independent source."))
    if shortener:
        findings.append(_finding("shortened_destination", "medium", hostname,
            "A URL shortener hides the final destination; this checker does not follow redirects.",
            "Confirm the final destination through a trusted source before opening it."))
    if tld in SUSPICIOUS_TLDS:
        findings.append(_finding("unusual_domain_suffix", "medium", hostname,
            "This domain suffix is often used by throwaway sites, but the suffix alone does not prove fraud.",
            "Check the complete hostname and the source of the link before entering information."))
    if punycode:
        findings.append(_finding("encoded_hostname", "medium", hostname,
            "The hostname uses internationalized encoding that can make look-alike characters harder to spot.",
            "Compare the displayed hostname with the provider's official address."))
    if official and not findings:
        findings.append(_finding("recognized_payment_domain", "low", hostname,
            "The hostname matches a recognized Nepali payment provider. This is not a live reputation or page-content check.",
            "For payments, open the official app independently and verify any transaction there."))
        return "safe", 0, findings, normalized
    if not findings:
        findings.append(_finding("unverified_destination", "low", hostname,
            "No live reputation lookup or page scan is performed, and this host is not in the small payment-provider allowlist.",
            "This is not a scam finding. Verify the destination independently before entering sensitive information."))
        return "review", 0, findings, normalized
    return ("high" if brand_mismatch else "review"), len(findings), findings, normalized


def _extract_screenshot_text(data: dict[str, Any]) -> tuple[str, str]:
    image_data = data.get("fileData") or data.get("image_data")
    if not image_data:
        return "", "No image data was submitted for OCR."
    if not isinstance(image_data, str) or len(image_data) > int(MAX_IMAGE_BYTES * 1.45):
        raise HTTPException(status_code=413, detail="Screenshot exceeds the 5 MB upload limit.")
    match = re.fullmatch(r"data:image/(png|jpeg);base64,([A-Za-z0-9+/=\r\n]+)", image_data, re.IGNORECASE)
    if not match:
        raise HTTPException(status_code=422, detail="Upload a valid PNG or JPEG screenshot.")
    try:
        raw = base64.b64decode(match.group(2), validate=True)
    except (binascii.Error, ValueError):
        raise HTTPException(status_code=422, detail="The screenshot data is malformed.")
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Screenshot exceeds the 5 MB upload limit.")
    if Image is None:
        return "", "Image validation is unavailable because Pillow is not installed."
    try:
        import io
        image = Image.open(io.BytesIO(raw))
        if image.format not in {"PNG", "JPEG"}:
            raise HTTPException(status_code=422, detail="Only PNG and JPEG screenshots are supported.")
        if image.width * image.height > 25_000_000:
            raise HTTPException(status_code=413, detail="The screenshot dimensions are too large to process safely.")
        image.verify()
        image = Image.open(io.BytesIO(raw))
        image = ImageOps.exif_transpose(image).convert("RGB")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=422, detail="The uploaded file is not a readable PNG or JPEG image.")
    if pytesseract is None:
        return "", "OCR is not configured on this server."
    try:
        recognized_text = pytesseract.image_to_string(image, lang=settings.OCR_LANGUAGES).strip()
    except Exception:
        return "", "OCR could not read this image."
    if not recognized_text:
        return "", "No readable text was found in the screenshot."
    return recognized_text[:MAX_TEXT_CHARS], ""


def _text_analysis(text: str, language: str) -> tuple[str, int, list[dict[str, str]]]:
    findings: list[dict[str, str]] = []
    normalized = text[:MAX_TEXT_CHARS]
    checks = [
        ("credential_request", re.compile(r"\b(?:otp|one[- ]time password|mpin|pin|password|passcode)\b", re.I), "high",
         "The text mentions a credential that should not be shared in a message.", "Never share an OTP, PIN, or password; contact the provider through its official app."),
        ("urgency_or_threat", re.compile(r"\b(?:immediately|urgent|right now|cancel (?:the )?order|hurry|within minutes|last chance)\b", re.I), "medium",
         "The text pressures the recipient to act quickly, which can discourage independent checks.", "Pause and verify the request using a separate trusted channel."),
        ("alternate_payment_or_refund", re.compile(r"\b(?:refund|another account|alternate number|different number|brother'?s account|send back)\b", re.I), "high",
         "The text requests a refund or redirection to another account or contact.", "Do not transfer funds to a different account until your own ledger confirms the original payment."),
        ("payment_claim", re.compile(r"\b(?:payment sent|transferred|paid via|esewa|khalti|fonepay|connectips|npr|rs\.)\b", re.I), "low",
         "The text includes a payment claim. A message alone cannot confirm that funds arrived.", "Check the transaction in your own bank or wallet statement before dispatching goods."),
        ("move_off_channel", re.compile(r"\b(?:whatsapp|telegram|viber|personal number|outside this platform)\b", re.I), "medium",
         "The request may move the conversation away from the channel where it started.", "Confirm the sender using a contact method you already trust."),
    ]
    for kind, pattern, severity, explanation, recommended in checks:
        match = pattern.search(normalized)
        if match:
            evidence_start = max(0, match.start() - 45)
            evidence_end = min(len(normalized), match.end() + 65)
            excerpt = re.sub(r"\s+", " ", normalized[evidence_start:evidence_end]).strip()
            findings.append(_finding(kind, severity, excerpt, explanation, recommended))
    if any(item["type"] in {"credential_request", "alternate_payment_or_refund"} for item in findings):
        risk = "high"
    elif findings:
        risk = "review"
    else:
        risk = "safe"
    if language == "ne":
        for finding in findings:
            finding["explanation"] = "सन्देशमा देखिएको संकेतलाई स्वतन्त्र रूपमा जाँच्नुहोस्; यो आफैँमा ठगीको प्रमाण होइन।"
            finding["recommended"] = "आफ्नो आधिकारिक बैंक वा वालेट एपबाट कारोबार पुष्टि गर्नुहोस्।"
    return risk, len(findings), findings


def analyze(payload: dict[str, Any]) -> dict[str, Any]:
    scan_type = payload["type"]
    data = payload["data"]
    language = payload.get("language", "en")
    findings: list[dict[str, str]] = []
    evidence_count = 0
    scanned_text = ""
    limitations = ["This assessment cannot prove that a person or transaction is fraudulent."]

    if scan_type == "url":
        raw = data.get("url")
        if not isinstance(raw, str) or not raw.strip() or len(raw) > 2048:
            raise HTTPException(status_code=422, detail="Enter a URL up to 2,048 characters.")
        risk, evidence_count, findings, normalized = _url_analysis(raw, language)
        submitted_item = normalized
        type_label = "Suspicious URL"
        limitations.append("ScamShield does not visit the URL, follow redirects, or query live threat-intelligence services.")
    elif scan_type in {"message", "screenshot"}:
        if scan_type == "message":
            text = data.get("text")
            if not isinstance(text, str) or not text.strip() or len(text) > MAX_TEXT_CHARS:
                raise HTTPException(status_code=422, detail=f"Enter message text up to {MAX_TEXT_CHARS:,} characters.")
            scanned_text = text.strip()
            type_label = "Suspicious Message"
            submitted_item = scanned_text[:500]
        else:
            type_label = "Payment Screenshot"
            submitted_item = str(data.get("fileName") or "Uploaded screenshot")[:255]
            demo_caption = data.get("caption") if data.get("presetType") in {"high-fraud", "review", "safe"} else None
            if isinstance(demo_caption, str) and demo_caption.strip():
                scanned_text = demo_caption[:MAX_TEXT_CHARS]
                ocr_status = "This is a built-in demonstration scenario; its caption was analyzed, not image pixels."
                limitations.append(ocr_status)
            else:
                scanned_text, ocr_status = _extract_screenshot_text(data)
            if not scanned_text:
                risk = "review"
                findings = [_finding("ocr_unavailable", "medium", submitted_item,
                    ocr_status + " No screenshot contents were evaluated.",
                    "Use a screenshot with readable text or review the details in your official payment app.")]
                evidence_count = 0
                limitations.append(ocr_status)
            else:
                limitations.append("OCR can misread text and cannot verify a payment or detect all image manipulation.")
        if scanned_text:
            risk, evidence_count, findings = _text_analysis(scanned_text, language)
            if scan_type == "screenshot":
                for finding in findings:
                    finding["explanation"] = "OCR found a possible warning sign in screenshot text; the image and payment itself are not authenticated. " + finding["explanation"]
                if not findings:
                    findings = [_finding("no_text_warning", "low", "Readable text did not match these local rules.",
                        "This is not proof that the receipt or payment is genuine.",
                        "Verify the credit directly in your official banking or wallet app.")]
                    evidence_count = 0
        if scan_type == "screenshot":
            limitations.append("A screenshot alone cannot establish that funds were received.")
    else:
        raise HTTPException(status_code=422, detail="Unsupported analysis type.")

    risk_label = {"high": "High Concern", "review": "Needs Verification", "safe": "No Major Warning Signs Detected"}[risk]
    if risk == "high":
        summary = "Several warning signs were found. Pause and verify independently before acting."
    elif risk == "review":
        summary = "Some indicators or missing information require independent verification. This is not a confirmed scam finding."
    else:
        summary = "No major warning signs matched these checks. This is not proof that the content, site, or payment is safe."
    now = datetime.now(timezone.utc)
    return {
        "id": f"scan-{uuid.uuid4().hex}",
        "type": scan_type,
        "typeLabel": type_label,
        "submittedItem": submitted_item,
        "dateFormatted": now.strftime("%b %d, %Y %H:%M"),
        "timestamp": now.isoformat(),
        "riskCategory": risk,
        "riskLabel": risk_label,
        "paymentStatus": "unverified",
        "status": "Completed",
        "evidenceFound": evidence_count,
        "totalIndicators": 5 if scan_type == "message" else 4,
        "summary": summary,
        "findings": findings,
        "nextSteps": [
            "Open your bank or wallet app independently and verify the transaction there.",
            "Do not share credentials or release goods based only on a message or screenshot.",
            "If the link or request is unfamiliar, confirm it through a trusted contact method.",
        ],
        "limitations": limitations,
        "disclaimer": "ScamShield provides local warning-sign analysis. It cannot confirm fraud, website safety, or receipt of funds.",
    }


def redact_for_storage(scan_type: str, submitted_item: str, findings: list[dict[str, Any]]) -> tuple[str, list[dict[str, Any]]]:
    """Persist minimal display metadata; never retain original messages or OCR content."""
    if scan_type == "message":
        safe_item = "Message scan (content redacted)"
    elif scan_type == "screenshot":
        safe_item = "Payment screenshot (image not stored)"
    else:
        try:
            safe_item = f"URL scan: {urlsplit(submitted_item).hostname or 'unknown host'}"
        except ValueError:
            safe_item = "URL scan (host unavailable)"
    phone_or_long_id = re.compile(r"(?<!\w)(?:\+?\d[\d\s().-]{6,}\d)(?!\w)")
    email = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
    safe_findings = []
    for finding in findings:
        copied = dict(finding)
        evidence = str(copied.get("evidence") or "")
        evidence = email.sub("[email]", evidence)
        evidence = phone_or_long_id.sub("[number]", evidence)
        copied["evidence"] = evidence[:240]
        safe_findings.append(copied)
    return safe_item, safe_findings
