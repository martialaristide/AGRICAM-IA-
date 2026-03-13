"""
AGRICAM IA - Iteration 24 Tests
Tests for Trainer role, password change, profile update, admin analytics export

Test Coverage:
1. Trainer authentication and role validation
2. Trainer endpoints: trainings, ebooks, profile, stats
3. Password change functionality
4. Profile update with language, theme, photo, linkedin
5. Admin analytics export (JSON/CSV formats)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TRAINER_EMAIL = "formateur@agricam.ai"
TRAINER_PASSWORD = "Trainer@2026"
FARMER_EMAIL = "agriculteur@agricam.ai"
FARMER_PASSWORD = "Farmer@2026"
ADMIN_EMAIL = "admin@agricam.ai"
ADMIN_PASSWORD = "Admin@2026"


class TestTrainerAuthentication:
    """Trainer login and role validation"""
    
    def test_trainer_login_returns_valid_token_with_role(self):
        """POST /api/auth/login with trainer credentials returns token with role=trainer"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TRAINER_EMAIL,
            "password": TRAINER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["role"] == "trainer", f"Expected role=trainer, got {data['user']['role']}"
        assert data["user"]["email"] == TRAINER_EMAIL


class TestTrainerEndpoints:
    """Trainer-specific API endpoints"""
    
    @pytest.fixture
    def trainer_token(self):
        """Get trainer auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TRAINER_EMAIL,
            "password": TRAINER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Trainer login failed: {response.text}")
        return response.json()["access_token"]
    
    def test_get_trainings_list(self, trainer_token):
        """GET /api/trainer/trainings returns list of trainings"""
        response = requests.get(
            f"{BASE_URL}/api/trainer/trainings",
            headers={"Authorization": f"Bearer {trainer_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of trainings"
        # Verify training structure if data exists
        if len(data) > 0:
            training = data[0]
            assert "title" in training or "id" in training, "Training missing title or id"
    
    def test_get_ebooks_list(self, trainer_token):
        """GET /api/trainer/ebooks returns list of ebooks"""
        response = requests.get(
            f"{BASE_URL}/api/trainer/ebooks",
            headers={"Authorization": f"Bearer {trainer_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of ebooks"
    
    def test_get_trainer_profile(self, trainer_token):
        """GET /api/trainer/profile returns trainer profile"""
        response = requests.get(
            f"{BASE_URL}/api/trainer/profile",
            headers={"Authorization": f"Bearer {trainer_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, dict), "Expected profile dict"
        # Profile should have user_id or basic fields
        assert "user_id" in data or "full_name" in data or "bio" in data
    
    def test_get_trainer_stats(self, trainer_token):
        """GET /api/trainer/stats returns trainer statistics"""
        response = requests.get(
            f"{BASE_URL}/api/trainer/stats",
            headers={"Authorization": f"Bearer {trainer_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert isinstance(data, dict), "Expected stats dict"
        # Stats should have count fields
        assert "total_trainings" in data or "total_ebooks" in data or "total_students" in data
    
    def test_create_training(self, trainer_token):
        """POST /api/trainer/trainings creates a new training"""
        response = requests.post(
            f"{BASE_URL}/api/trainer/trainings",
            headers={"Authorization": f"Bearer {trainer_token}"},
            json={
                "title": "TEST_Training - Agriculture de precision",
                "description": "Formation test pour les agriculteurs",
                "category": "technologie",
                "target_roles": ["farmer", "agronomist"],
                "difficulty": "intermediaire",
                "duration_minutes": 90,
                "price": 0,
                "is_published": True
            }
        )
        assert response.status_code == 200, f"Failed to create training: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Expected success=True"
        assert "training" in data, "No training in response"
        assert data["training"]["title"] == "TEST_Training - Agriculture de precision"


class TestPasswordChange:
    """Change password functionality"""
    
    @pytest.fixture
    def farmer_token(self):
        """Get farmer auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Farmer login failed: {response.text}")
        return response.json()["access_token"]
    
    def test_change_password_rejects_wrong_current_password(self, farmer_token):
        """PUT /api/user/change-password rejects wrong current password"""
        response = requests.put(
            f"{BASE_URL}/api/user/change-password",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={
                "current_password": "WrongPassword123",
                "new_password": "NewPassword@2026"
            }
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail"
        assert "incorrect" in data["detail"].lower() or "actuel" in data["detail"].lower()
    
    def test_change_password_accepts_correct_password(self, farmer_token):
        """PUT /api/user/change-password accepts correct current password"""
        # Change to a new password
        response = requests.put(
            f"{BASE_URL}/api/user/change-password",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={
                "current_password": FARMER_PASSWORD,
                "new_password": "NewFarmer@2026"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "message" in data, "Expected success message"
        
        # Change it back to original password for other tests
        # Re-login with new password
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": "NewFarmer@2026"
        })
        assert login_res.status_code == 200, "Login with new password failed"
        new_token = login_res.json()["access_token"]
        
        # Reset to original
        reset_res = requests.put(
            f"{BASE_URL}/api/user/change-password",
            headers={"Authorization": f"Bearer {new_token}"},
            json={
                "current_password": "NewFarmer@2026",
                "new_password": FARMER_PASSWORD
            }
        )
        assert reset_res.status_code == 200, "Failed to reset password to original"


class TestProfileUpdate:
    """Profile update with language, theme, photo, linkedin"""
    
    @pytest.fixture
    def farmer_token(self):
        """Get farmer auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Farmer login failed: {response.text}")
        return response.json()["access_token"]
    
    def test_update_profile_language(self, farmer_token):
        """PUT /api/user/update-profile updates language"""
        response = requests.put(
            f"{BASE_URL}/api/user/update-profile",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={"language": "en"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "user" in data or "updated_fields" in data
        if "updated_fields" in data:
            assert "language" in data["updated_fields"]
    
    def test_update_profile_theme(self, farmer_token):
        """PUT /api/user/update-profile updates theme"""
        response = requests.put(
            f"{BASE_URL}/api/user/update-profile",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={"theme": "emerald"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        if "updated_fields" in data:
            assert "theme" in data["updated_fields"]
    
    def test_update_profile_linkedin(self, farmer_token):
        """PUT /api/user/update-profile updates linkedin_url"""
        response = requests.put(
            f"{BASE_URL}/api/user/update-profile",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={"linkedin_url": "https://linkedin.com/in/testuser"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        if "updated_fields" in data:
            assert "linkedin_url" in data["updated_fields"]
    
    def test_update_profile_photo(self, farmer_token):
        """PUT /api/user/update-profile updates profile_photo"""
        # Using a small base64 test image
        test_photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        response = requests.put(
            f"{BASE_URL}/api/user/update-profile",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={"profile_photo": test_photo}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        if "updated_fields" in data:
            assert "profile_photo" in data["updated_fields"]
    
    def test_update_profile_multiple_fields(self, farmer_token):
        """PUT /api/user/update-profile updates multiple fields at once"""
        response = requests.put(
            f"{BASE_URL}/api/user/update-profile",
            headers={"Authorization": f"Bearer {farmer_token}"},
            json={
                "language": "fr",
                "theme": "dark",
                "full_name": "Agriculteur Test",
                "company_name": "Ferme Test"
            }
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "user" in data or "updated_fields" in data


class TestAdminAnalyticsExport:
    """Admin analytics export endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        return response.json()["access_token"]
    
    def test_export_analytics_json(self, admin_token):
        """GET /api/admin/analytics/export?format=json returns JSON report"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics/export?format=json",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "summary" in data, "Expected summary in report"
        assert "users_by_role" in data, "Expected users_by_role in report"
        assert "report_date" in data, "Expected report_date in report"
        # Verify summary fields
        assert "total_users" in data["summary"], "Expected total_users in summary"
    
    def test_export_analytics_csv(self, admin_token):
        """GET /api/admin/analytics/export?format=csv returns CSV data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics/export?format=csv",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        assert response.headers.get("content-type", "").startswith("text/csv") or "csv" in response.headers.get("content-disposition", "").lower(), "Expected CSV content type or disposition"
        # Verify CSV content
        content = response.text
        assert "Metric" in content or "total_users" in content, "CSV should contain metrics"
    
    def test_export_requires_admin_role(self):
        """GET /api/admin/analytics/export requires admin role"""
        # Get farmer token
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if login_res.status_code != 200:
            pytest.skip("Farmer login failed")
        farmer_token = login_res.json()["access_token"]
        
        # Try to access admin endpoint
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics/export",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 403, f"Expected 403 forbidden, got {response.status_code}"


class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_health(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data.get("status") == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
