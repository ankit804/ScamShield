"""Initialize schema and safely upgrade the original ScamShield tables."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect, text
import hashlib

from app.database import Base
from app import models  # noqa: F401 - register all model metadata

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)

    if inspector.has_table("users"):
        columns = {column["name"] for column in inspector.get_columns("users")}
        if "token_version" not in columns:
            op.add_column("users", sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"))
        if "reset_token_hash" not in columns:
            op.add_column("users", sa.Column("reset_token_hash", sa.String(length=64), nullable=True))
        refreshed = inspect(bind)
        columns = {column["name"] for column in refreshed.get_columns("users")}
        if "reset_token" in columns and "reset_token_hash" in columns:
            rows = bind.execute(text("SELECT id, reset_token FROM users WHERE reset_token IS NOT NULL")).all()
            for user_id, raw_token in rows:
                bind.execute(
                    text("UPDATE users SET reset_token_hash = :hashed, reset_token = NULL WHERE id = :id"),
                    {"hashed": hashlib.sha256(raw_token.encode("utf-8")).hexdigest(), "id": user_id},
                )

    Base.metadata.create_all(bind=bind)
    inspector = inspect(bind)
    indexes = {index["name"] for index in inspector.get_indexes("users")} if inspector.has_table("users") else set()
    if "ix_users_reset_token_hash" not in indexes:
        op.create_index("ix_users_reset_token_hash", "users", ["reset_token_hash"], unique=True)
    scan_indexes = {index["name"] for index in inspector.get_indexes("scans")} if inspector.has_table("scans") else set()
    if "ix_scans_user_created" not in scan_indexes:
        op.create_index("ix_scans_user_created", "scans", ["user_id", "created_at"], unique=False)


def downgrade():
    bind = op.get_bind()
    inspector = inspect(bind)
    scan_indexes = {index["name"] for index in inspector.get_indexes("scans")} if inspector.has_table("scans") else set()
    if "ix_scans_user_created" in scan_indexes:
        op.drop_index("ix_scans_user_created", table_name="scans")
    user_indexes = {index["name"] for index in inspector.get_indexes("users")} if inspector.has_table("users") else set()
    if "ix_users_reset_token_hash" in user_indexes:
        op.drop_index("ix_users_reset_token_hash", table_name="users")
    columns = {column["name"] for column in inspect(bind).get_columns("users")} if inspector.has_table("users") else set()
    if "reset_token_hash" in columns:
        with op.batch_alter_table("users") as batch:
            batch.drop_column("reset_token_hash")
    if "token_version" in columns:
        with op.batch_alter_table("users") as batch:
            batch.drop_column("token_version")
    if inspect(bind).has_table("auth_attempts"):
        op.drop_table("auth_attempts")
