"""Iteration 35 - Parcel creation bug fix & UX validation tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback read from frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

FARMER = {"email": "agriculteur@agricam.ai", "password": "Farmer@2026"}


@pytest.fixture(scope="module")
def farmer_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=FARMER, timeout=30)
    assert r.status_code == 200, f"Farmer login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("access_token") or data.get("token")
    assert tok, f"No token in response: {data}"
    return tok


@pytest.fixture
def headers(farmer_token):
    return {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}


# Parcels API
class TestParcelsAPI:
    def test_create_minimal_payload(self, headers):
        payload = {"name": "TEST_Parcel_Minimal_I35", "crop_type": "Maïs"}
        r = requests.post(f"{BASE_URL}/api/parcels", json=payload, headers=headers, timeout=30)
        assert r.status_code in (200, 201), f"Expected 2xx, got {r.status_code}: {r.text}"
        data = r.json()
        assert data.get("name") == payload["name"]
        assert data.get("crop_type") == payload["crop_type"]
        assert "id" in data

    def test_create_full_payload(self, headers):
        payload = {
            "name": "TEST_Parcel_Full_I35",
            "crop_type": "Cacao",
            "variety": "Hybride",
            "area_hectares": 2.5,
            "humidity": 60,
            "temperature": 26,
            "soil_analysis": {"nitrogen": 55, "phosphorus": 45, "potassium": 60, "ph": 6.8},
            "planting_date": "2026-01-15",
            "status": "bon",
            "latitude": 5.9631,
            "longitude": 10.1591,
        }
        r = requests.post(f"{BASE_URL}/api/parcels", json=payload, headers=headers, timeout=30)
        assert r.status_code in (200, 201), f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["area_hectares"] == 2.5

    def test_create_missing_name_returns_422(self, headers):
        payload = {"crop_type": "Blé"}
        r = requests.post(f"{BASE_URL}/api/parcels", json=payload, headers=headers, timeout=30)
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    def test_create_empty_name_behavior(self, headers):
        """Empty string may be accepted by Pydantic by default (not constrained)."""
        payload = {"name": "", "crop_type": "Blé"}
        r = requests.post(f"{BASE_URL}/api/parcels", json=payload, headers=headers, timeout=30)
        # Document actual behavior - this is informational
        assert r.status_code in (200, 201, 422)
        print(f"Empty name status: {r.status_code}")

    def test_list_parcels(self, headers):
        r = requests.get(f"{BASE_URL}/api/parcels", headers=headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Verify our created parcel is present
        names = [p.get("name") for p in data]
        assert "TEST_Parcel_Minimal_I35" in names or any("TEST_Parcel" in (n or "") for n in names)

    def test_unauthorized_create_rejected(self):
        payload = {"name": "TEST_NoAuth", "crop_type": "X"}
        r = requests.post(f"{BASE_URL}/api/parcels", json=payload, timeout=30)
        assert r.status_code in (401, 403), f"Expected 401/403, got {r.status_code}"
