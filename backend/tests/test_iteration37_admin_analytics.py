"""Iteration 37 - Admin Analytics Presentation endpoint tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://i18n-rtl-stage.preview.emergentagent.com").rstrip("/")
ENDPOINT = f"{BASE_URL}/api/admin/analytics-presentation"

ADMIN_EMAIL = "admin@agricam.ai"
ADMIN_PASSWORD = "Admin@2026"
FARMER_EMAIL = "agriculteur@agricam.ai"
FARMER_PASSWORD = "Farmer@2026"


def _login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"Login failed for {email}: {r.status_code} {r.text[:300]}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture(scope="module")
def farmer_token():
    return _login(FARMER_EMAIL, FARMER_PASSWORD)


# ---- Admin Analytics Presentation endpoint ----
class TestAdminAnalyticsPresentation:
    def test_admin_can_access_returns_200(self, admin_token):
        r = requests.get(ENDPOINT, headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:500]}"

    def test_response_has_all_required_top_level_keys(self, admin_token):
        r = requests.get(ENDPOINT, headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        required = [
            "kpi",
            "role_distribution",
            "country_distribution",
            "subscription_distribution",
            "top_crops",
            "parcel_status",
            "user_growth",
            "revenue_growth",
            "alert_severity",
        ]
        missing = [k for k in required if k not in data]
        assert not missing, f"Missing keys in response: {missing}. Got keys: {list(data.keys())}"

    def test_kpi_values_are_nonzero_and_match_seed(self, admin_token):
        r = requests.get(ENDPOINT, headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        assert r.status_code == 200
        kpi = r.json()["kpi"]
        # Expected thresholds per request
        assert kpi.get("total_users", 0) >= 500, f"total_users too low: {kpi.get('total_users')}"
        assert kpi.get("total_parcels", 0) >= 800, f"total_parcels too low: {kpi.get('total_parcels')}"
        assert kpi.get("total_sensors", 0) >= 1500, f"total_sensors too low: {kpi.get('total_sensors')}"
        # types
        assert isinstance(kpi["total_users"], int)
        assert isinstance(kpi["total_parcels"], int)

    def test_chart_arrays_are_lists_and_not_empty(self, admin_token):
        r = requests.get(ENDPOINT, headers={"Authorization": f"Bearer {admin_token}"}, timeout=60)
        data = r.json()
        # role_distribution items must have role + count keys
        assert isinstance(data["role_distribution"], list) and len(data["role_distribution"]) > 0
        first = data["role_distribution"][0]
        assert "role" in first and "count" in first
        # top_crops should be non-empty given seeded parcels
        assert isinstance(data["top_crops"], list) and len(data["top_crops"]) > 0
        assert "crop" in data["top_crops"][0] and "count" in data["top_crops"][0]
        # alert_severity non-empty (246 alerts seeded)
        assert isinstance(data["alert_severity"], list)
        assert len(data["alert_severity"]) > 0

    def test_non_admin_gets_403(self, farmer_token):
        r = requests.get(ENDPOINT, headers={"Authorization": f"Bearer {farmer_token}"}, timeout=30)
        assert r.status_code == 403, f"Expected 403 for farmer, got {r.status_code}: {r.text[:300]}"

    def test_unauthenticated_gets_401_or_403(self):
        r = requests.get(ENDPOINT, timeout=30)
        assert r.status_code in (401, 403), f"Expected 401/403 unauth, got {r.status_code}"
