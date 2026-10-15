import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"detail": err_body}

def run_tests():
    print("=== SCAMSHIELD NEPAL BACKEND API AUTOMATED TESTS ===")

    # 1. Health check
    code, res = make_req("/health")
    assert code == 200, f"Health check failed: {code}"
    print("[PASS] 1. Health check -> 200 OK")

    # 2. Registration validation: password too short (< 8)
    code, res = make_req("/auth/register", "POST", {
        "full_name": "Test User",
        "email": "short@example.np",
        "password": "123",
        "confirm_password": "123"
    })
    assert code == 422, f"Expected 422 for short password, got {code}: {res}"
    print("[PASS] 2. Short password rejected -> 422 Unprocessable Entity")

    # 3. Registration validation: passwords don't match
    code, res = make_req("/auth/register", "POST", {
        "full_name": "Test User",
        "email": "mismatch@example.np",
        "password": "ValidPassword@2026",
        "confirm_password": "DifferentPassword@2026"
    })
    assert code == 422, f"Expected 422 for mismatched passwords, got {code}: {res}"
    print("[PASS] 3. Mismatched passwords rejected -> 422 Unprocessable Entity")

    # 4. Valid registration
    test_email = "newmerchant@example.np"
    code, res = make_req("/auth/register", "POST", {
        "full_name": "Sunil Merchant",
        "email": test_email,
        "password": "SecurePassword@2026",
        "confirm_password": "SecurePassword@2026"
    })
    assert code in [201, 409], f"Unexpected registration code {code}: {res}"
    print(f"[PASS] 4. Registration handled cleanly -> {code}")

    # 5. Duplicate registration rejection
    code, res = make_req("/auth/register", "POST", {
        "full_name": "Duplicate Sunil",
        "email": test_email,
        "password": "SecurePassword@2026",
        "confirm_password": "SecurePassword@2026"
    })
    assert code == 409, f"Expected 409 for duplicate email, got {code}: {res}"
    print("[PASS] 5. Duplicate email rejected -> 409 Conflict")

    # 6. User Login with valid credentials
    code, user_login = make_req("/auth/login", "POST", {
        "email": "ankit.seller@example.np",
        "password": "SellerPassword@2026"
    })
    assert code == 200, f"User login failed: {code}: {user_login}"
    user_token = user_login["access_token"]
    assert user_login["user"]["role"] == "user", "Expected role 'user'"
    print("[PASS] 6. Regular user login -> 200 OK (JWT issued)")

    # 7. User access their own profile
    code, profile = make_req("/auth/me", token=user_token)
    assert code == 200 and profile["email"] == "ankit.seller@example.np"
    print("[PASS] 7. User profile /auth/me -> 200 OK")

    # 8. User access their real stats
    code, stats = make_req("/users/me/stats", token=user_token)
    assert code == 200 and "total_scans" in stats
    print(f"[PASS] 8. User personal stats -> 200 OK (Total scans: {stats['total_scans']})")

    # 9. RBAC Security Check: Regular user attempts to access /admin/stats -> MUST FAIL WITH 403!
    code, admin_denied = make_req("/admin/stats", token=user_token)
    assert code == 403, f"SECURITY VULNERABILITY! Regular user accessed admin endpoint! Code: {code}"
    print("[PASS] 9. Regular user blocked from /admin/stats -> 403 Forbidden")

    # 10. Admin Login
    code, admin_login = make_req("/auth/login", "POST", {
        "email": "admin@scamshield.np",
        "password": "AdminSecurePassword@2026"
    })
    assert code == 200, f"Admin login failed: {code}: {admin_login}"
    admin_token = admin_login["access_token"]
    assert admin_login["user"]["role"] == "admin", "Expected role 'admin'"
    print("[PASS] 10. Administrator login -> 200 OK (Admin JWT issued)")

    # 11. Admin access platform stats
    code, admin_stats = make_req("/admin/stats", token=admin_token)
    assert code == 200 and admin_stats["total_users"] >= 2
    print(f"[PASS] 11. Admin /admin/stats -> 200 OK (Platform users: {admin_stats['total_users']}, Scans: {admin_stats['total_scans']})")

    # 12. Admin list users
    code, users_list = make_req("/admin/users", token=admin_token)
    assert code == 200 and len(users_list) >= 2
    # Verify no passwords or hashes leaked
    for u in users_list:
        assert "hashed_password" not in u and "password" not in u
    print(f"[PASS] 12. Admin /admin/users -> 200 OK (Found {len(users_list)} users, 0 password leaks)")

    # 13. Admin moderation: Suspend a user
    target_user = [u for u in users_list if u["role"] == "user" and u["email"] == test_email][0]
    code, susp_res = make_req(f"/admin/users/{target_user['id']}/status", "PATCH", {"status": "suspended"}, token=admin_token)
    assert code == 200 and susp_res["new_status"] == "suspended"
    print(f"[PASS] 13. Admin suspended user {test_email} -> 200 OK")

    # 14. Suspended user login blocked
    code, susp_login = make_req("/auth/login", "POST", {
        "email": test_email,
        "password": "SecurePassword@2026"
    })
    assert code == 403, f"Expected 403 for suspended user, got {code}: {susp_login}"
    print("[PASS] 14. Suspended user login rejected -> 403 Forbidden")

    # 15. Admin reactivate user
    code, react_res = make_req(f"/admin/users/{target_user['id']}/status", "PATCH", {"status": "active"}, token=admin_token)
    assert code == 200 and react_res["new_status"] == "active"
    print(f"[PASS] 15. Admin reactivated user {test_email} -> 200 OK")

    # 16. Admin Audit Log Verification
    code, audit_logs = make_req("/admin/audit-logs", token=admin_token)
    assert code == 200 and len(audit_logs) >= 2
    print(f"[PASS] 16. Admin /admin/audit-logs -> 200 OK ({len(audit_logs)} audit trails logged)")

    # 17. Forgot Password Flow
    code, forgot_res = make_req("/auth/forgot-password", "POST", {"email": test_email})
    assert code == 200 and "reset_token" in forgot_res
    reset_token = forgot_res["reset_token"]
    print(f"[PASS] 17. Forgot password token generated -> 200 OK")

    # Reset with token
    code, reset_res = make_req("/auth/reset-password", "POST", {
        "token": reset_token,
        "new_password": "NewUpdatedPassword@2026",
        "confirm_password": "NewUpdatedPassword@2026"
    })
    assert code == 200, f"Password reset failed: {code}: {reset_res}"
    print("[PASS] 18. Password reset with token -> 200 OK")

    # Login with new password
    code, new_login = make_req("/auth/login", "POST", {
        "email": test_email,
        "password": "NewUpdatedPassword@2026"
    })
    assert code == 200, "Login with updated password failed!"
    print("[PASS] 19. Login with new password -> 200 OK")

    print("\n=======================================================")
    print("ALL 19 BACKEND AUTHENTICATION & RBAC SECURITY TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
