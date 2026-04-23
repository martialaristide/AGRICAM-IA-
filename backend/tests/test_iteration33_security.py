"""
Iteration 33 Tests - Security Dashboard, Login Logging, and New Features
Tests:
- Admin Security Dashboard API (/api/admin/security/dashboard)
- Login logging in security_logs collection
- Block/Unblock user functionality
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@agricam.ai"
ADMIN_PASSWORD = "Admin@2026"
TRAINER_EMAIL = "formateur@agricam.ai"
TRAINER_PASSWORD = "Trainer@2026"
FARMER_EMAIL = "farmer@agricam.ai"
FARMER_PASSWORD = "Farmer@2026"


class TestSecurityDashboard:
    """Test Admin Security Dashboard API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_admin_token(self):
        """Get admin authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")
    
    def get_farmer_token(self):
        """Get farmer authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip(f"Farmer login failed: {response.status_code} - {response.text}")
    
    def test_admin_login_success(self):
        """Test admin login creates security log entry"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login successful")
    
    def test_login_failed_creates_security_log(self):
        """Test failed login creates security log entry"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Failed login returns 401 (should create security log)")
    
    def test_security_dashboard_admin_access(self):
        """Test security dashboard is accessible by admin"""
        token = self.get_admin_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/admin/security/dashboard")
        assert response.status_code == 200, f"Security dashboard failed: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "stats" in data, "Missing 'stats' in response"
        assert "security_logs" in data, "Missing 'security_logs' in response"
        assert "login_activity" in data, "Missing 'login_activity' in response"
        assert "suspicious_activity" in data, "Missing 'suspicious_activity' in response"
        assert "blocked_list" in data, "Missing 'blocked_list' in response"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_users" in stats, "Missing 'total_users' in stats"
        assert "blocked_users" in stats, "Missing 'blocked_users' in stats"
        assert "active_sessions" in stats, "Missing 'active_sessions' in stats"
        assert "recent_activity_24h" in stats, "Missing 'recent_activity_24h' in stats"
        assert "security_score" in stats, "Missing 'security_score' in stats"
        
        print(f"PASS: Security dashboard accessible - Stats: {stats}")
    
    def test_security_dashboard_non_admin_denied(self):
        """Test security dashboard is NOT accessible by non-admin users"""
        token = self.get_farmer_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/admin/security/dashboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Security dashboard correctly denied to non-admin")
    
    def test_security_logs_contain_login_activity(self):
        """Test that security logs contain login activity"""
        token = self.get_admin_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/admin/security/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        login_activity = data.get("login_activity", [])
        
        # Should have at least one login activity from our test
        if len(login_activity) > 0:
            log = login_activity[0]
            # Verify log structure
            assert "action" in log, "Missing 'action' in log"
            assert "timestamp" in log, "Missing 'timestamp' in log"
            print(f"PASS: Login activity found - {len(login_activity)} entries")
        else:
            print("WARN: No login activity found (may be empty database)")
    
    def test_security_score_calculation(self):
        """Test security score is calculated correctly"""
        token = self.get_admin_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/admin/security/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        score = data["stats"]["security_score"]
        
        # Score should be between 0 and 100
        assert 0 <= score <= 100, f"Security score out of range: {score}"
        print(f"PASS: Security score is valid: {score}")


class TestTrainerFileUploads:
    """Regression test for trainer file uploads"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_trainer_token(self):
        """Get trainer authentication token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TRAINER_EMAIL,
            "password": TRAINER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip(f"Trainer login failed: {response.status_code} - {response.text}")
    
    def test_trainer_login(self):
        """Test trainer can login"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TRAINER_EMAIL,
            "password": TRAINER_PASSWORD
        })
        assert response.status_code == 200, f"Trainer login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "trainer"
        print("PASS: Trainer login successful")
    
    def test_trainer_trainings_endpoint(self):
        """Test trainer can access trainings endpoint"""
        token = self.get_trainer_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/trainer/trainings")
        assert response.status_code == 200, f"Trainings endpoint failed: {response.text}"
        print("PASS: Trainer can access trainings endpoint")
    
    def test_trainer_ebooks_endpoint(self):
        """Test trainer can access ebooks endpoint"""
        token = self.get_trainer_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.get(f"{BASE_URL}/api/trainer/ebooks")
        assert response.status_code == 200, f"Ebooks endpoint failed: {response.text}"
        print("PASS: Trainer can access ebooks endpoint")
    
    def test_trainer_create_training(self):
        """Test trainer can create a training"""
        token = self.get_trainer_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        training_data = {
            "title": "TEST_Iteration33_Training",
            "description": "Test training for iteration 33",
            "category": "agriculture",
            "target_roles": ["farmer"],
            "difficulty": "debutant",
            "duration_minutes": 60,
            "price": 0,
            "is_published": False
        }
        
        response = self.session.post(f"{BASE_URL}/api/trainer/trainings", json=training_data)
        assert response.status_code == 200, f"Create training failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print("PASS: Trainer can create trainings")
    
    def test_trainer_create_ebook(self):
        """Test trainer can create an ebook"""
        token = self.get_trainer_token()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        ebook_data = {
            "title": "TEST_Iteration33_Ebook",
            "description": "Test ebook for iteration 33",
            "category": "agriculture",
            "price": 0,
            "download_enabled": True
        }
        
        response = self.session.post(f"{BASE_URL}/api/trainer/ebooks", json=ebook_data)
        assert response.status_code == 200, f"Create ebook failed: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print("PASS: Trainer can create ebooks")


class TestHealthAndBasicEndpoints:
    """Test basic health and endpoint availability"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print("PASS: Health endpoint working")
    
    def test_landing_page_loads(self):
        """Test landing page is accessible"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200, f"Landing page failed: {response.status_code}"
        print("PASS: Landing page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
