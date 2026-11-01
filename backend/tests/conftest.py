import os

os.environ.setdefault("SECRET_KEY", "test-only-secret-key-long-enough-for-unit-tests")
os.environ.setdefault("ENVIRONMENT", "test")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


def register(client, email="person@example.com", password="a-secure-test-password"):
    return client.post("/auth/register", json={
        "full_name": "Test Person",
        "email": email,
        "password": password,
        "confirm_password": password,
    })


def login(client, email="person@example.com", password="a-secure-test-password"):
    csrf = client.get("/auth/csrf").json()["csrf_token"]
    return client.post("/auth/login", json={"email": email, "password": password},
                       headers={"X-CSRF-Token": csrf})


def csrf_headers(client):
    csrf = client.get("/auth/csrf").json()["csrf_token"]
    return {"X-CSRF-Token": csrf}
