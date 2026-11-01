"""Delete expired scan metadata according to the configured retention window."""
from datetime import datetime, timedelta, timezone

from .config import settings
from .database import SessionLocal
from .models import Scan


def purge_expired_scans() -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=settings.SCAN_RETENTION_DAYS)
    db = SessionLocal()
    try:
        removed = db.query(Scan).filter(Scan.created_at < cutoff).delete(synchronize_session=False)
        db.commit()
        return removed
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Removed {purge_expired_scans()} expired scan records.")
