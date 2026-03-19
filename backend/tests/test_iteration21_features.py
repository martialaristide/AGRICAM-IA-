"""
Test iteration 21 - AGRICAM IA Features
Testing:
- Login with demo accounts (admin, farmer)
- Camera IA API endpoints (/camera/analyze, /camera/scans, /camera/satellite-analyze)
- User profile update (/user/update-profile)
- i18n/language switching
"""
import pytest
import requests
import os
import base64
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://i18n-rtl-stage.preview.emergentagent.com').rstrip('/')

# Demo credentials
ADMIN_CREDS = {"email": "admin@agricam.ai", "password": "Admin@2026"}
FARMER_CREDS = {"email": "agriculteur@agricam.ai", "password": "Farmer@2026"}

# Minimal valid test image (16x16 red PNG) for image testing
# This is a small PNG image with actual visual content (not blank)
SMALL_TEST_IMAGE_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAADklEQVQ4jWNgGAWjgFIAAALmAAEA5cI1AAAAAElFTkSuQmCC"
)


class TestAuthLogin:
    """Authentication tests for demo accounts"""

    def test_admin_login(self):
        """Test login with admin demo account"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_CREDS["email"]
        assert data["user"]["role"] == "admin"
        print(f"Admin login SUCCESS: {data['user']['email']}")

    def test_farmer_login(self):
        """Test login with farmer demo account"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=FARMER_CREDS)
        assert response.status_code == 200, f"Farmer login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == FARMER_CREDS["email"]
        assert data["user"]["role"] == "farmer"
        print(f"Farmer login SUCCESS: {data['user']['email']}")

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401


@pytest.fixture
def farmer_token():
    """Get auth token for farmer account"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=FARMER_CREDS)
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Farmer authentication failed")


@pytest.fixture
def admin_token():
    """Get auth token for admin account"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Admin authentication failed")


class TestCameraIAEndpoints:
    """Test Camera IA API endpoints"""

    def test_get_camera_scans(self, farmer_token):
        """Test GET /api/camera/scans - should return array"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/camera/scans", headers=headers)
        assert response.status_code == 200, f"Get camera scans failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Camera scans should return an array"
        print(f"Camera scans returned {len(data)} items")

    def test_camera_analyze_general_mode(self, farmer_token):
        """Test POST /api/camera/analyze with general mode"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "general",
            "role": "farmer",
            "language": "fr"
        }
        response = requests.post(f"{BASE_URL}/api/camera/analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Camera analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Camera analyze response: model={data.get('model', 'unknown')}, response_time={data.get('response_time_ms', 'N/A')}ms")

    def test_camera_analyze_disease_mode(self, farmer_token):
        """Test POST /api/camera/analyze with disease detection mode"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "disease",
            "role": "farmer",
            "language": "fr"
        }
        response = requests.post(f"{BASE_URL}/api/camera/analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Camera disease analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Disease detection mode SUCCESS")

    def test_camera_analyze_pest_mode(self, farmer_token):
        """Test POST /api/camera/analyze with pest detection mode"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "pest",
            "role": "farmer",
            "language": "fr"
        }
        response = requests.post(f"{BASE_URL}/api/camera/analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Camera pest analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Pest detection mode SUCCESS")

    def test_camera_analyze_nutrition_mode(self, farmer_token):
        """Test POST /api/camera/analyze with nutrition deficiency mode"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "nutrition",
            "role": "farmer",
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/api/camera/analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Camera nutrition analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Nutrition detection mode SUCCESS")

    def test_camera_analyze_soil_mode(self, farmer_token):
        """Test POST /api/camera/analyze with soil analysis mode"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "soil",
            "role": "farmer",
            "language": "fr"
        }
        response = requests.post(f"{BASE_URL}/api/camera/analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Camera soil analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Soil analysis mode SUCCESS")


class TestSatelliteAnalysis:
    """Test Satellite zone analysis API"""

    def test_satellite_zone_analyze(self, farmer_token):
        """Test POST /api/camera/satellite-analyze"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "image_base64": SMALL_TEST_IMAGE_BASE64,
            "analysis_mode": "satellite",
            "role": "farmer",
            "language": "fr"
        }
        response = requests.post(f"{BASE_URL}/api/camera/satellite-analyze", json=payload, headers=headers, timeout=60)
        assert response.status_code == 200, f"Satellite analyze failed: {response.text}"
        data = response.json()
        assert "result" in data or "success" in data
        print(f"Satellite analyze response: model={data.get('model', 'unknown')}")


class TestUserProfileUpdate:
    """Test user profile update endpoint"""

    def test_update_onboarding_completed(self, farmer_token):
        """Test PUT /api/user/update-profile with onboarding_completed"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {"onboarding_completed": True}
        response = requests.put(f"{BASE_URL}/api/user/update-profile", json=payload, headers=headers)
        assert response.status_code == 200, f"Profile update failed: {response.text}"
        data = response.json()
        assert "message" in data
        assert "onboarding_completed" in data.get("updated_fields", [])
        print(f"Profile update SUCCESS: {data}")

    def test_update_multiple_fields(self, farmer_token):
        """Test updating multiple profile fields"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        payload = {
            "onboarding_completed": True,
            "phone": "+237600000000",
            "address": "Bamenda, Cameroun"
        }
        response = requests.put(f"{BASE_URL}/api/user/update-profile", json=payload, headers=headers)
        assert response.status_code == 200, f"Profile update failed: {response.text}"
        data = response.json()
        assert len(data.get("updated_fields", [])) >= 2
        print(f"Multi-field profile update SUCCESS")


class TestAPIBasics:
    """Basic API health and functionality tests"""

    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("Health check PASS")

    def test_dashboard_stats_auth(self, farmer_token):
        """Test dashboard stats endpoint with auth"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "parcels_count" in data or "active_sensors" in data
        print(f"Dashboard stats: {data}")

    def test_parcels_list(self, farmer_token):
        """Test parcels list endpoint"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/parcels", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Parcels count: {len(data)}")

    def test_alerts_list(self, farmer_token):
        """Test alerts list endpoint"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Alerts count: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
