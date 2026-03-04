"""
AGRICAM IA - P3 Features Test Suite
Tests for: PWA, Export PDF/Word, Mobile Money, Backend Refactoring
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://agricam-ia-preview.preview.emergentagent.com')

class TestPWAFiles:
    """Test PWA static files accessibility"""
    
    def test_manifest_json_accessible(self):
        """PWA: manifest.json should be accessible at /manifest.json"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200, f"manifest.json not accessible: {response.status_code}"
        
        data = response.json()
        assert "short_name" in data, "manifest.json missing short_name"
        assert data["short_name"] == "AGRICAM IA", f"Unexpected short_name: {data['short_name']}"
        assert "icons" in data, "manifest.json missing icons"
        assert len(data["icons"]) >= 2, "manifest.json should have at least 2 icons"
        print(f"✓ manifest.json accessible with name: {data['name']}")
    
    def test_service_worker_accessible(self):
        """PWA: service-worker.js should be accessible at /service-worker.js"""
        response = requests.get(f"{BASE_URL}/service-worker.js")
        assert response.status_code == 200, f"service-worker.js not accessible: {response.status_code}"
        
        content = response.text
        assert "CACHE_NAME" in content, "service-worker.js missing CACHE_NAME"
        assert "agricam-ia" in content.lower(), "service-worker.js should reference agricam-ia"
        print("✓ service-worker.js accessible and contains cache configuration")
    
    def test_offline_html_accessible(self):
        """PWA: offline.html should be accessible at /offline.html"""
        response = requests.get(f"{BASE_URL}/offline.html")
        assert response.status_code == 200, f"offline.html not accessible: {response.status_code}"
        
        content = response.text
        assert "Mode Hors Ligne" in content or "offline" in content.lower(), "offline.html should indicate offline mode"
        assert "AGRICAM" in content, "offline.html should reference AGRICAM"
        print("✓ offline.html accessible with offline mode content")


class TestMobileMoneyPayment:
    """Test Mobile Money payment endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam-ia.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_mobile_money_orange_payment(self, auth_token):
        """Mobile Money: Orange Money payment initiation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/payment/mobile-money", 
            headers=headers,
            json={
                "phone_number": "698226903",
                "amount_xaf": 5000,
                "provider": "orange_money",
                "description": "Test Orange Money payment"
            }
        )
        assert response.status_code == 200, f"Orange Money payment failed: {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Payment should be successful"
        assert "payment_id" in data, "Response should contain payment_id"
        assert "reference" in data, "Response should contain reference"
        assert "instructions" in data, "Response should contain instructions"
        assert "698226903" in data.get("merchant_number", ""), "Should use Orange Money merchant number"
        print(f"✓ Orange Money payment initiated: {data['reference']}")
    
    def test_mobile_money_mtn_payment(self, auth_token):
        """Mobile Money: MTN MoMo payment initiation"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/payment/mobile-money", 
            headers=headers,
            json={
                "phone_number": "653722443",
                "amount_xaf": 10000,
                "provider": "mtn_momo",
                "description": "Test MTN MoMo payment"
            }
        )
        assert response.status_code == 200, f"MTN MoMo payment failed: {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Payment should be successful"
        assert "payment_id" in data, "Response should contain payment_id"
        assert "653722443" in data.get("merchant_number", ""), "Should use MTN MoMo merchant number"
        print(f"✓ MTN MoMo payment initiated: {data['reference']}")
    
    def test_mobile_money_requires_auth(self):
        """Mobile Money: Should require authentication"""
        response = requests.post(f"{BASE_URL}/api/payment/mobile-money", json={
            "phone_number": "698226903",
            "amount_xaf": 5000,
            "provider": "orange_money"
        })
        assert response.status_code == 401, "Should return 401 without auth"
        print("✓ Mobile Money endpoint requires authentication")


class TestBackendServices:
    """Test backend service files exist and are properly structured"""
    
    def test_config_file_exists(self):
        """Backend: config.py should exist"""
        config_path = "/app/backend/config.py"
        assert os.path.exists(config_path), f"config.py not found at {config_path}"
        
        with open(config_path, 'r') as f:
            content = f.read()
        
        assert "MONGO_URL" in content, "config.py should define MONGO_URL"
        assert "JWT_SECRET" in content, "config.py should define JWT_SECRET"
        assert "CINETPAY" in content or "PAYDUNYA" in content, "config.py should have Mobile Money config"
        print("✓ config.py exists with required configurations")
    
    def test_database_file_exists(self):
        """Backend: database.py should exist"""
        db_path = "/app/backend/database.py"
        assert os.path.exists(db_path), f"database.py not found at {db_path}"
        
        with open(db_path, 'r') as f:
            content = f.read()
        
        assert "AsyncIOMotorClient" in content or "motor" in content, "database.py should use motor for MongoDB"
        print("✓ database.py exists with MongoDB configuration")
    
    def test_payment_service_exists(self):
        """Backend: payment_service.py should exist"""
        service_path = "/app/backend/services/payment_service.py"
        assert os.path.exists(service_path), f"payment_service.py not found at {service_path}"
        
        with open(service_path, 'r') as f:
            content = f.read()
        
        assert "MobileMoneyService" in content, "payment_service.py should define MobileMoneyService"
        assert "orange_money" in content.lower() or "ORANGE" in content, "Should support Orange Money"
        assert "mtn" in content.lower() or "MTN" in content, "Should support MTN MoMo"
        print("✓ payment_service.py exists with Mobile Money support")


class TestAPIHealth:
    """Test API health and basic endpoints"""
    
    def test_api_health(self):
        """API: Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "healthy", f"Unexpected status: {data.get('status')}"
        print("✓ API health check passed")
    
    def test_admin_login(self):
        """API: Admin login should work"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam-ia.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.status_code}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert data.get("user", {}).get("role") == "admin", "User should be admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_parcels_endpoint(self):
        """API: Parcels endpoint should return data"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam-ia.com",
            "password": "admin123"
        })
        token = login_response.json().get("access_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/parcels", headers=headers)
        assert response.status_code == 200, f"Parcels endpoint failed: {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Parcels should return a list"
        print(f"✓ Parcels endpoint returned {len(data)} parcels")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
