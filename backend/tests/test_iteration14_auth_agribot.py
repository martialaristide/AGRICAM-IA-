"""
AGRICAM IA - Iteration 14 Tests
Tests for: New credentials, AgriBot IA endpoints, Camera IA, DevAnalytics
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNewCredentialsLogin:
    """Test login with new credentials (Admin@2026, Farmer@2026, etc.)"""
    
    def test_admin_login_new_credentials(self):
        """Test admin login with new password Admin@2026"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=30)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data.get("user", {}).get("role") == "admin", "Admin role not returned"
        print(f"✓ Admin login success: {data.get('user', {}).get('email')}")
    
    def test_farmer_login_new_credentials(self):
        """Test farmer login with new password Farmer@2026"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        }, timeout=30)
        assert response.status_code == 200, f"Farmer login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data.get("user", {}).get("role") == "farmer", "Farmer role not returned"
        print(f"✓ Farmer login success: {data.get('user', {}).get('email')}")
    
    def test_supplier_login_new_credentials(self):
        """Test supplier login with new password Supplier@2026"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "fournisseur@agricam.ai",
            "password": "Supplier@2026"
        }, timeout=30)
        assert response.status_code == 200, f"Supplier login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data.get("user", {}).get("role") == "supplier", "Supplier role not returned"
        print(f"✓ Supplier login success: {data.get('user', {}).get('email')}")
    
    def test_bank_login_new_credentials(self):
        """Test bank/financial login with new password Bank@2026"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "banque@agricam.ai",
            "password": "Bank@2026"
        }, timeout=30)
        assert response.status_code == 200, f"Bank login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert data.get("user", {}).get("role") == "financial", "Financial role not returned"
        print(f"✓ Bank login success: {data.get('user', {}).get('email')}")

    def test_old_credentials_should_fail(self):
        """Test that old password 'adminpassword' no longer works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "adminpassword"
        }, timeout=30)
        assert response.status_code in [401, 400], f"Old credentials should fail but got: {response.status_code}"
        print("✓ Old credentials correctly rejected")


class TestAgribotIAEndpoints:
    """Test AgriBot IA endpoints - they use Gemini LLM (can be slow 15-30s)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=30)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Auth failed")
    
    def test_agribot_chat(self, auth_token):
        """Test AgriBot IA chat endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/chat",
            json={"message": "Bonjour AgriBot"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60  # LLM calls can be slow
        )
        assert response.status_code == 200, f"AgriBot chat failed: {response.text}"
        data = response.json()
        assert "response" in data or "message" in data, f"No response in data: {data}"
        print(f"✓ AgriBot chat response received")
    
    def test_predict_yield_json_body(self, auth_token):
        """Test yield prediction with JSON body (not form data)"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-yield",
            json={"crop_type": "mais", "surface_ha": 5, "country": "Cameroun", "soil_quality": "moyen", "irrigation": False},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        assert response.status_code == 200, f"Predict yield failed: {response.text}"
        data = response.json()
        print(f"✓ Predict yield response: {data}")
    
    def test_ecological_advice_json_body(self, auth_token):
        """Test ecological advice with JSON body"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/ecological-advice",
            json={"problem": "agriculture tropicale", "crop_type": "mais"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        assert response.status_code == 200, f"Ecological advice failed: {response.text}"
        data = response.json()
        print(f"✓ Ecological advice response received")
    
    def test_predict_disease_spread_json_body(self, auth_token):
        """Test disease spread prediction with JSON body"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-disease-spread",
            json={"disease_name": "mildiou", "current_zone": "Centre", "crop_type": "mais"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        assert response.status_code == 200, f"Disease prediction failed: {response.text}"
        data = response.json()
        print(f"✓ Disease prediction response received")
    
    def test_analyze_soil_json_body(self, auth_token):
        """Test soil analysis with JSON body (sensor_data)"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/analyze-soil",
            json={"sensor_data": {"nitrogen": 45, "phosphorus": 30, "potassium": 50, "ph": 6.5, "humidity": 60}},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        assert response.status_code == 200, f"Soil analysis failed: {response.text}"
        data = response.json()
        print(f"✓ Soil analysis response: {data}")


class TestCameraIAEndpoint:
    """Test Camera IA live stats endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=30)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Auth failed")
    
    def test_camera_live_stats(self, auth_token):
        """Test Camera IA live stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/camera-ai/live-stats",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        assert response.status_code == 200, f"Camera live stats failed: {response.text}"
        print(f"✓ Camera live stats: {response.json()}")


class TestDevAnalyticsEndpoints:
    """Test DevAnalytics/Tour de Controle endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=30)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Auth failed")
    
    def test_dev_analytics_overview(self, auth_token):
        """Test DevAnalytics overview endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/overview",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        assert response.status_code == 200, f"Overview failed: {response.text}"
        print(f"✓ DevAnalytics overview: {response.json()}")
    
    def test_dev_analytics_users(self, auth_token):
        """Test DevAnalytics users endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/users",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        assert response.status_code == 200, f"Users endpoint failed: {response.text}"
        print(f"✓ DevAnalytics users response received")


class TestClimateNotifications:
    """Test climate notifications endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=30)
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Auth failed")
    
    def test_climate_notifications(self, auth_token):
        """Test climate notifications (MOCKED - random alerts)"""
        response = requests.get(
            f"{BASE_URL}/api/climate-notifications",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        assert response.status_code == 200, f"Climate notifications failed: {response.text}"
        data = response.json()
        assert "alerts" in data or isinstance(data, list), f"Unexpected response format: {data}"
        print(f"✓ Climate notifications received")


class TestRegistrationEndpoint:
    """Test registration endpoint"""
    
    def test_registration_endpoint_exists(self):
        """Test that registration endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "test_registration_check@test.com",
                "password": "TestPass@2026",
                "full_name": "Test User",
                "role": "farmer"
            },
            timeout=30
        )
        # 201 = created, 400 = validation error (expected), 409 = already exists
        assert response.status_code in [201, 400, 409, 422], f"Registration endpoint issue: {response.status_code} - {response.text}"
        print(f"✓ Registration endpoint exists: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
