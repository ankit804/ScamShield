"""Secure local administrator bootstrap; no credentials are included in source."""
import argparse
import getpass

from pydantic import TypeAdapter, EmailStr, ValidationError
from sqlalchemy.orm import Session

from .auth import hash_password
from .database import SessionLocal
from .models import AuditLog, User


def _validated_email(value: str) -> str:
    try:
        return str(TypeAdapter(EmailStr).validate_python(value)).strip().lower()
    except ValidationError as exc:
        raise SystemExit("Enter a valid email address.") from exc


def _prompt_password() -> str:
    password = getpass.getpass("New administrator password (minimum 12 characters): ")
    confirmation = getpass.getpass("Confirm password: ")
    if len(password) < 12:
        raise SystemExit("Administrator passwords must contain at least 12 characters.")
    if password != confirmation:
        raise SystemExit("The passwords did not match.")
    return password


def bootstrap_admin(email: str) -> None:
    email = _validated_email(email)
    password = _prompt_password()
    db: Session = SessionLocal()
    try:
        if db.query(User).filter(User.role == "admin", User.status == "active").count():
            raise SystemExit("An active administrator already exists. Use the explicit rotate-admin command if you own that account.")
        user = db.query(User).filter(User.email == email).first()
        if user:
            if user.role != "admin":
                raise SystemExit("That email belongs to a regular user. Choose a different email or promote it through a reviewed database operation.")
            if user.status != "active":
                raise SystemExit("The existing administrator is suspended; resolve the account status before bootstrapping.")
            raise SystemExit("This administrator already exists.")
        user = User(full_name="ScamShield Administrator", email=email,
                    hashed_password=hash_password(password), role="admin", status="active")
        db.add(user)
        db.flush()
        db.add(AuditLog(
            admin_id=user.id,
            admin_email=user.email,
            action="ADMIN_BOOTSTRAPPED",
            target_type="platform",
            target_id=str(user.id),
            details='{"event":"First administrator created by local CLI"}',
        ))
        db.commit()
        print(f"Administrator created: {email}")
    except SystemExit:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def rotate_admin(email: str) -> None:
    email = _validated_email(email)
    password = _prompt_password()
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email, User.role == "admin").with_for_update().first()
        if not user:
            raise SystemExit("No administrator account exists for that email.")
        user.hashed_password = hash_password(password)
        user.token_version += 1
        user.reset_token = None
        user.reset_token_hash = None
        user.reset_token_expires_at = None
        db.add(AuditLog(
            admin_id=user.id,
            admin_email=user.email,
            action="ADMIN_PASSWORD_ROTATED",
            target_type="user",
            target_id=str(user.id),
            details='{"event":"Administrator password rotated by local CLI; sessions revoked"}',
        ))
        db.commit()
        print(f"Administrator password rotated and sessions revoked: {email}")
    except SystemExit:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="ScamShield Nepal secure administrator bootstrap")
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("bootstrap-admin", "rotate-admin"):
        sub = commands.add_parser(command)
        sub.add_argument("--email", required=True)
    args = parser.parse_args()
    if args.command == "bootstrap-admin":
        bootstrap_admin(args.email)
    else:
        rotate_admin(args.email)


if __name__ == "__main__":
    main()
