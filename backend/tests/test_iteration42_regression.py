"""Iteration 42 — express non-regression tests after structural refactor
(env-based creds + conftest, dependencies.get_db, explicit model imports).
"""
import os
import random
import string

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")

ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@agricam.ai")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "Admin@2026")
FARMER_EMAIL = os.environ.get("TEST_FARMER_EMAIL", "agriculteur@agricam.ai")
FARMER_PASSWORD = os.environ.get("TEST_FARMER_PASSWORD", "Farmer@2026")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(client, email, password):
    return client.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=30)


@pytest.fixture(scope="module")
def admin_token(client):
    r = _login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
    if r.status_code != 200:
        pytest.fail(f"Admin login failed {r.status_code}: {r.text[:300]}")
    tok = r.json().get("access_token") or r.json().get("token")
    assert tok, f"No token in response: {r.text[:300]}"
    return tok


# --- Auth module ---
class TestAuth:
    def test_admin_login(self, client):
        r = _login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert (d.get("access_token") or d.get("token"))
        assert d.get("user", {}).get("email") == ADMIN_EMAIL

    def test_farmer_login(self, client):
        r = _login(client, FARMER_EMAIL, FARMER_PASSWORD)
        assert r.status_code == 200, r.text[:300]
        assert r.json().get("user", {}).get("email") == FARMER_EMAIL

    def test_login_bad_password(self, client):
        r = _login(client, ADMIN_EMAIL, "WrongPass@000")
        assert r.status_code in (400, 401), r.status_code

    def test_register_new_user(self, client):
        suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"test_reg_{suffix}@example.com"
        payload = {
            "email": email,
            "password": "Test@2026",
            "full_name": "TEST Regression User",
            "phone": f"6{random.randint(70000000, 99999999)}",
            "role": "farmer",
        }
        r = client.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=30)
        assert r.status_code in (200, 201), f"{r.status_code}: {r.text[:400]}"
        d = r.json()
        assert (d.get("access_token") or d.get("token"))
        assert d.get("user", {}).get("email") == email
        # verify login works with new account (persistence)
        r2 = _login(client, email, "Test@2026")
        assert r2.status_code == 200, r2.text[:300]


# --- Drone manager (validates dependencies.get_db / no circular import) ---
class TestDroneManager:
    def test_fleet(self, client, admin_token):
        r = client.get(f"{BASE_URL}/api/drone-manager/fleet",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"
        d = r.json()
        drones = d if isinstance(d, list) else d.get("drones", d.get("fleet", []))
        assert isinstance(drones, list)
        assert "_id" not in str(d)


# --- Pydantic models / parcels ---
class TestParcels:
    def test_list_parcels(self, client, admin_token):
        r = client.get(f"{BASE_URL}/api/parcels",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"
        d = r.json()
        items = d if isinstance(d, list) else d.get("parcels", [])
        assert isinstance(items, list)


# --- Élevage module smoke ---
class TestElevage:
    def test_status(self, client, admin_token):
        r = client.get(f"{BASE_URL}/api/elevage/status",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=30)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"

    def test_dashboard(self, client, admin_token):
        r = client.get(f"{BASE_URL}/api/elevage/dashboard",
                       headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert r.status_code == 200, f"{r.status_code}: {r.text[:400]}"
        assert isinstance(r.json(), dict)
