"""Tests for AgriCam Élevage IA module (/api/elevage/*)."""
import os
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")

ADMIN = {"email": "admin@agricam.ai", "password": "Admin@2026"}


@pytest.fixture(scope="module")
def auth_headers():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=ADMIN, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:300]}"
    token = r.json().get("access_token") or r.json().get("token")
    assert token, f"No token in login: {r.json()}"
    return {"Authorization": f"Bearer {token}"}


class TestElevage:
    def test_status(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/elevage/status", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert isinstance(data, dict)

    def test_dashboard(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/elevage/dashboard", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        # expect totals
        assert isinstance(data, dict)

    def test_farms_list_and_scan(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/elevage/farms", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        farms = r.json()
        # Might be list or wrapper
        if isinstance(farms, dict):
            farms = farms.get("farms") or farms.get("data") or []
        assert isinstance(farms, list) and len(farms) >= 1, f"expected farms, got {farms}"
        pytest.farms = farms
        farm_id = farms[0].get("id") or farms[0].get("_id") or farms[0].get("farm_id")
        assert farm_id, f"no farm id field in {farms[0]}"
        pytest.farm_id = farm_id

        # scan
        r2 = requests.post(f"{BASE_URL}/api/elevage/farms/{farm_id}/scan", headers=auth_headers, timeout=30)
        assert r2.status_code == 200, r2.text[:300]

        # environment
        r3 = requests.get(f"{BASE_URL}/api/elevage/farms/{farm_id}/environment", headers=auth_headers, timeout=30)
        assert r3.status_code == 200, r3.text[:300]

        # collars
        r4 = requests.get(f"{BASE_URL}/api/elevage/farms/{farm_id}/collars", headers=auth_headers, timeout=30)
        assert r4.status_code == 200, r4.text[:300]
        c = r4.json()
        assert "escaped_count" in c or (isinstance(c, dict) and any("escaped" in k for k in c))

        # price prediction
        r5 = requests.get(f"{BASE_URL}/api/elevage/farms/{farm_id}/price-prediction", headers=auth_headers, timeout=30)
        assert r5.status_code == 200, r5.text[:300]

    def test_alerts_and_ack(self, auth_headers):
        # simulate to ensure alert exists
        rs = requests.post(f"{BASE_URL}/api/elevage/simulate", headers=auth_headers, timeout=30)
        assert rs.status_code == 200, rs.text[:300]

        r = requests.get(f"{BASE_URL}/api/elevage/alerts", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        alerts = r.json()
        if isinstance(alerts, dict):
            alerts = alerts.get("alerts") or alerts.get("data") or []
        assert isinstance(alerts, list)
        if alerts:
            aid = alerts[0].get("id") or alerts[0].get("_id") or alerts[0].get("alert_id")
            if aid:
                ra = requests.post(f"{BASE_URL}/api/elevage/alerts/{aid}/acknowledge", headers=auth_headers, timeout=30)
                assert ra.status_code in (200, 204), ra.text[:300]

    def test_cooperative(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/elevage/cooperative/dashboard", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert isinstance(data, dict)

    def test_whatsapp_config(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/elevage/whatsapp/config", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert data.get("configured") is False, f"expected configured False: {data}"
        assert data.get("provider") == "simulation", f"expected provider simulation: {data}"

    def test_feed_recommendation(self, auth_headers):
        # get an animal id via farms scan endpoint (need to grab animals from a farm)
        r = requests.get(f"{BASE_URL}/api/elevage/farms", headers=auth_headers, timeout=30)
        farms = r.json()
        if isinstance(farms, dict):
            farms = farms.get("farms") or farms.get("data") or []
        farm_id = farms[0].get("id") or farms[0].get("_id") or farms[0].get("farm_id")

        # try to get animals list
        ra = requests.get(f"{BASE_URL}/api/elevage/farms/{farm_id}/animals", headers=auth_headers, timeout=30)
        if ra.status_code != 200:
            pytest.skip(f"animals endpoint {ra.status_code}")
        animals = ra.json()
        if isinstance(animals, dict):
            animals = animals.get("animals") or animals.get("data") or []
        if not animals:
            pytest.skip("no animals")
        aid = animals[0].get("id") or animals[0].get("_id") or animals[0].get("animal_id")
        rf = requests.get(f"{BASE_URL}/api/elevage/animals/{aid}/feed-recommendation", headers=auth_headers, timeout=30)
        assert rf.status_code == 200, rf.text[:300]
