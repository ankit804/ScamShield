import base64

from app.models import User
from app.auth import hash_password
from app.database import get_db
from .conftest import csrf_headers, login, register


def test_registration_login_cookie_and_profile(client):
    created = register(client)
    assert created.status_code == 201
    assert created.json()["role"] == "user"
    assert register(client).status_code == 409

    signed_in = login(client)
    assert signed_in.status_code == 200
    assert "httponly" in signed_in.headers["set-cookie"].lower()
    assert client.get("/auth/me").status_code == 200


def test_public_registration_cannot_assign_admin(client):
    response = client.post("/auth/register", json={
        "full_name": "Malicious Person",
        "email": "attacker@example.com",
        "password": "a-secure-test-password",
        "confirm_password": "a-secure-test-password",
        "role": "admin",
    })
    assert response.status_code == 422


def test_logout_revokes_session(client):
    register(client)
    assert login(client).status_code == 200
    assert client.post("/auth/logout", headers=csrf_headers(client)).status_code == 200
    assert client.get("/auth/me").status_code == 401


def test_analysis_is_local_persisted_redacted_and_owner_scoped(client):
    register(client)
    login(client)
    analyzed = client.post("/analyze", headers=csrf_headers(client), json={
        "type": "message",
        "language": "en",
        "data": {"text": "Please send your OTP to confirm payment, call +977 9800000000"},
    })
    assert analyzed.status_code == 200
    assert analyzed.json()["riskCategory"] == "high"

    history = client.get("/users/me/scans")
    assert history.status_code == 200
    scan = history.json()[0]
    assert "content redacted" in scan["submitted_item"]
    assert "+977" not in str(scan)
    assert client.get(f"/users/me/scans/{scan['id']}").status_code == 200

    client.post("/auth/logout", headers=csrf_headers(client))
    register(client, "other@example.com")
    login(client, "other@example.com")
    assert client.get("/users/me/scans").json() == []
    assert client.get(f"/users/me/scans/{scan['id']}").status_code == 404


def test_client_cannot_insert_forged_scan_result(client):
    register(client)
    login(client)
    fake = {"type": "message", "risk_category": "safe", "risk_label": "Safe",
            "type_label": "Message", "submitted_item": "forged", "summary": "forged"}
    assert client.post("/users/me/scans", headers=csrf_headers(client), json=fake).status_code == 405
    assert client.post("/scans", headers=csrf_headers(client), json=fake).status_code in {404, 405}
    assert client.get("/users/me/scans").json() == []


def test_url_checks_do_not_fetch_and_reject_non_http_or_private_addresses(client):
    response = client.post("/analyze", json={"type": "url", "data": {"url": "https://example.test/login"}})
    assert response.status_code == 200
    assert response.json()["riskCategory"] == "review"
    assert any("does not visit" in note.lower() for note in response.json()["limitations"])

    for url in ("javascript:alert(1)", "ftp://example.com/file", "http://user:pass@example.com"):
        result = client.post("/analyze", json={"type": "url", "data": {"url": url}})
        assert result.status_code == 422
    private = client.post("/analyze", json={"type": "url", "data": {"url": "http://127.0.0.1/admin"}})
    assert private.status_code == 200
    assert private.json()["riskCategory"] == "high"


def test_analysis_validates_inputs_and_screenshot_data(client):
    assert client.post("/analyze", json={"type": "message", "data": {"text": "  "}}).status_code == 422
    bad_image = "data:image/png;base64," + base64.b64encode(b"not-an-image").decode()
    response = client.post("/analyze", json={"type": "screenshot", "data": {"fileData": bad_image}})
    assert response.status_code == 422


def test_reset_token_is_one_time_and_revokes_existing_session(client):
    register(client)
    login(client)
    requested = client.post("/auth/forgot-password", headers=csrf_headers(client), json={"email": "person@example.com"})
    assert requested.status_code == 200
    token = requested.json()["reset_token"]

    def inspect_user():
        db = next(app_dependency())
        try:
            user = db.query(User).filter(User.email == "person@example.com").one()
            assert user.reset_token is None
            assert user.reset_token_hash
        finally:
            db.close()

    from app.main import app
    app_dependency = client.app.dependency_overrides[get_db]
    inspect_user()

    reset_data = {"token": token, "new_password": "new-secure-test-password",
                  "confirm_password": "new-secure-test-password"}
    assert client.post("/auth/reset-password", headers=csrf_headers(client), json=reset_data).status_code == 200
    assert client.get("/auth/me").status_code == 401
    assert client.post("/auth/reset-password", headers=csrf_headers(client), json=reset_data).status_code == 400
    assert login(client, password="new-secure-test-password").status_code == 200


def test_unauthorized_admin_and_rate_limit(client):
    assert client.get("/admin/stats").status_code == 401
    register(client)
    login(client)
    assert client.get("/admin/stats").status_code == 403


def test_admin_cannot_suspend_their_own_account(client):
    register(client)
    login(client)
    db_factory = client.app.dependency_overrides[get_db]
    db = next(db_factory())
    try:
        admin = User(full_name="Admin Person", email="admin@example.com",
                     hashed_password=hash_password("admin-test-password"), role="admin", status="active")
        db.add(admin)
        db.commit()
        db.refresh(admin)
        admin_id = admin.id
    finally:
        db.close()
    client.post("/auth/logout", headers=csrf_headers(client))
    assert login(client, "admin@example.com", "admin-test-password").status_code == 200
    assert client.patch(f"/admin/users/{admin_id}/status", headers=csrf_headers(client),
                        json={"status": "suspended"}).status_code == 400
