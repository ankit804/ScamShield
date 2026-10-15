import sys
import json
import argparse
from datetime import datetime, timedelta, timezone
from .database import engine, SessionLocal, Base
from .models import User, Scan, AuditLog
from .auth import hash_password

def seed_database(admin_email="admin@scamshield.np", admin_password="AdminSecurePassword@2026"):
    print("[INFO] Initializing ScamShield Nepal Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create or update Admin User
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                full_name="Admin Security Lead",
                email=admin_email,
                hashed_password=hash_password(admin_password),
                role="admin",
                status="active"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[SUCCESS] Created Administrator account: {admin_email}")
        else:
            admin.role = "admin"
            admin.hashed_password = hash_password(admin_password)
            db.commit()
            print(f"[INFO] Updated existing Administrator account: {admin_email}")

        # Record Initial Audit Log
        audit_seed = AuditLog(
            admin_id=admin.id,
            admin_email=admin.email,
            action="SYSTEM_INITIALIZATION",
            target_type="system",
            target_id="database",
            details=json.dumps({"event": "Database seeded with default roles and security parameters"}),
            ip_address="127.0.0.1"
        )
        db.add(audit_seed)

        # 2. Create Regular Demo Merchant User: Ankit Sharma
        ankit = db.query(User).filter(User.email == "ankit.seller@example.np").first()
        if not ankit:
            ankit = User(
                full_name="Ankit Sharma",
                email="ankit.seller@example.np",
                hashed_password=hash_password("SellerPassword@2026"),
                role="user",
                status="active"
            )
            db.add(ankit)
            db.commit()
            db.refresh(ankit)
            print("[SUCCESS] Created Demo Merchant account: ankit.seller@example.np (password: SellerPassword@2026)")

        # 3. Create Second Active Merchant User: Riya Shrestha
        riya = db.query(User).filter(User.email == "riya.boutique@example.np").first()
        if not riya:
            riya = User(
                full_name="Riya Shrestha",
                email="riya.boutique@example.np",
                hashed_password=hash_password("SellerPassword@2026"),
                role="user",
                status="active"
            )
            db.add(riya)
            db.commit()
            db.refresh(riya)
            print("[SUCCESS] Created Demo Merchant account: riya.boutique@example.np")

        # 4. Create Suspended User: Ramesh Khadka (for testing admin moderation)
        ramesh = db.query(User).filter(User.email == "ramesh.store@example.np").first()
        if not ramesh:
            ramesh = User(
                full_name="Ramesh Khadka",
                email="ramesh.store@example.np",
                hashed_password=hash_password("SellerPassword@2026"),
                role="user",
                status="suspended"
            )
            db.add(ramesh)
            db.commit()
            db.refresh(ramesh)
            print("[SUCCESS] Created Demo Suspended account: ramesh.store@example.np (for moderation testing)")

        # 5. Seed Scans strictly for Ankit Sharma
        existing_scans = db.query(Scan).filter(Scan.user_id == ankit.id).count()
        if existing_scans == 0:
            sample_scans = [
                Scan(
                    id="scan-demo-101",
                    user_id=ankit.id,
                    type="screenshot",
                    type_label="Payment Screenshot",
                    submitted_item="eSewa payment image (NPR 2,500)",
                    risk_category="high",
                    risk_label="High Concern",
                    status="Completed",
                    evidence_found=4,
                    total_indicators=6,
                    summary="This content shows multiple warning signs. Be careful and verify the payment in your own banking or wallet app before taking any action.",
                    findings_json=json.dumps([
                        {
                            "id": "f-1",
                            "title": "Urgent pressure to act",
                            "severity": "high",
                            "evidence": '"Dispatch immediately or I will cancel the order"',
                            "explanation": "Pressure to act quickly is a common tactic used in scams.",
                            "recommended": "Do not rush. Verify the payment first in your own wallet app."
                        },
                        {
                            "id": "f-2",
                            "title": "Suspicious payment claim",
                            "severity": "high",
                            "evidence": '"Payment sent via eSewa, check and confirm"',
                            "explanation": "A screenshot alone does not confirm that the money has been received.",
                            "recommended": "Verify the transaction in your own eSewa app."
                        }
                    ]),
                    next_steps_json=json.dumps([
                        "Open your own banking or wallet application independently.",
                        "Check the transaction status and amount in your statement.",
                        "Confirm recipient and reference."
                    ]),
                    disclaimer="ScamShield identifies potential warning signs. This analysis cannot independently confirm whether money was received or prove that a person or transaction is fraudulent."
                ),
                Scan(
                    id="scan-demo-102",
                    user_id=ankit.id,
                    type="message",
                    type_label="Suspicious Message",
                    submitted_item="Payment received from 9841000000... (SMS claim)",
                    risk_category="high",
                    risk_label="High Concern",
                    status="Completed",
                    evidence_found=3,
                    total_indicators=5,
                    summary="Incoming SMS claimed payment was processed from a 10-digit mobile number rather than an official bank or eSewa shortcode.",
                    findings_json=json.dumps([
                        {
                            "id": "f-201",
                            "title": "Unofficial SMS Sender ID",
                            "severity": "high",
                            "evidence": "Sent from personal mobile number +977-9841234567 instead of registered sender ID",
                            "explanation": "Official eSewa or bank notifications are delivered through registered shortcodes.",
                            "recommended": "Disregard payment claims sent from private numbers."
                        }
                    ]),
                    next_steps_json=json.dumps([
                        "Open your mobile banking app independently.",
                        "Look for recent credit entries in your official statement."
                    ]),
                    disclaimer="ScamShield identifies potential warning signs."
                ),
                Scan(
                    id="scan-demo-103",
                    user_id=ankit.id,
                    type="screenshot",
                    type_label="Payment Screenshot",
                    submitted_item="Khalti payment (NPR 4,200)",
                    risk_category="review",
                    risk_label="Needs Verification",
                    status="Completed",
                    evidence_found=2,
                    total_indicators=5,
                    summary="Receipt shows minor font compression anomalies and a missing Nepali timestamp, requiring verification in your merchant portal.",
                    findings_json=json.dumps([
                        {
                            "id": "f-301",
                            "title": "Receipt Timestamp Discrepancy",
                            "severity": "medium",
                            "evidence": "Timestamp displays 12-hour format without AM/PM designation",
                            "explanation": "Official Khalti transaction receipts follow consistent time formatting.",
                            "recommended": "Check your Khalti merchant dashboard for the matching transaction ID."
                        }
                    ]),
                    next_steps_json=json.dumps([
                        "Open your Khalti Merchant or consumer app.",
                        "Confirm if transaction ID exists in your ledger."
                    ]),
                    disclaimer="ScamShield identifies potential warning signs."
                ),
                Scan(
                    id="scan-demo-104",
                    user_id=ankit.id,
                    type="screenshot",
                    type_label="Payment Screenshot",
                    submitted_item="ConnectIPS transfer receipt (NPR 18,500)",
                    risk_category="safe",
                    risk_label="No Major Warning Signs Detected",
                    status="Completed",
                    evidence_found=0,
                    total_indicators=6,
                    summary="Visual structure, reference format, and typography match authentic ConnectIPS transaction vouchers.",
                    findings_json=json.dumps([]),
                    next_steps_json=json.dumps([
                        "Log into your mobile banking app to confirm the funds.",
                        "Proceed with order fulfillment once credited."
                    ]),
                    disclaimer="ScamShield identifies potential warning signs."
                )
            ]
            db.bulk_save_objects(sample_scans)
            db.commit()
            print("[SUCCESS] Seeded 4 sample scans for Ankit Sharma")

        db.commit()
        print("[SUCCESS] Database seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed ScamShield Nepal Database")
    parser.add_argument("--admin-email", default="admin@scamshield.np", help="Administrator Email")
    parser.add_argument("--admin-password", default="AdminSecurePassword@2026", help="Administrator Password")
    args = parser.parse_args()

    seed_database(admin_email=args.admin_email, admin_password=args.admin_password)