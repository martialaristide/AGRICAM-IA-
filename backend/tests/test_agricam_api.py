"""
AGRICAM IA API Tests - Comprehensive Backend Testing
Tests for: Authentication, Chatbot, Learning Modules, Payments, Dashboard, Parcels
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_CREDENTIALS = {"email": "admin@agricam-ia.com", "password": "admin123"}
FARMER_CREDENTIALS = {"email": "agriculteur@demo.com", "password": "farmer123"}


class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "AGRICAM IA" in data.get("message", "")
        assert data.get("version") == "3.0.0"
        print(f"✓ Root endpoint passed: {data}")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_admin_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == ADMIN_CREDENTIALS["email"]
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['full_name']}")
        return data["access_token"]
    
    def test_login_farmer_success(self):
        """Test farmer login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=FARMER_CREDENTIALS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == FARMER_CREDENTIALS["email"]
        assert data["user"]["role"] == "farmer"
        print(f"✓ Farmer login successful: {data['user']['full_name']}")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_auth_me_with_token(self):
        """Test /api/auth/me returns user info with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        token = login_response.json()["access_token"]
        
        # Then test /me endpoint
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_CREDENTIALS["email"]
        print(f"✓ Auth/me endpoint working: {data['full_name']}")
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Auth/me correctly requires authentication")


class TestChatbot:
    """Chatbot API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for chatbot tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_chatbot_message_success(self, auth_token):
        """Test sending message to chatbot"""
        response = requests.post(
            f"{BASE_URL}/api/chatbot/message",
            json={"message": "Comment cultiver le maïs?", "context": ""},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "source" in data
        assert len(data["response"]) > 0
        print(f"✓ Chatbot response received: {data['response'][:100]}...")
    
    def test_chatbot_message_without_auth(self):
        """Test chatbot requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/chatbot/message",
            json={"message": "Test message"}
        )
        assert response.status_code == 401
        print("✓ Chatbot correctly requires authentication")
    
    def test_chatbot_history(self, auth_token):
        """Test getting chat history"""
        response = requests.get(
            f"{BASE_URL}/api/chatbot/history",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Chat history retrieved: {len(data)} messages")


class TestLearningModules:
    """Learning module API tests"""
    
    def test_get_all_modules(self):
        """Test getting all learning modules"""
        response = requests.get(f"{BASE_URL}/api/learning/modules")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3  # Should have 3 modules
        print(f"✓ Learning modules retrieved: {len(data)} modules")
        
        # Verify module structure
        for module in data:
            assert "id" in module
            assert "title" in module
            assert "description" in module
            assert "category" in module
            assert "difficulty" in module
            assert "duration_minutes" in module
            print(f"  - {module['title']} ({module['difficulty']})")
    
    def test_get_module_by_id(self):
        """Test getting specific learning module"""
        response = requests.get(f"{BASE_URL}/api/learning/modules/learn-001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "learn-001"
        assert "content" in data
        assert "quiz" in data
        print(f"✓ Module learn-001 retrieved: {data['title']}")
    
    def test_get_module_not_found(self):
        """Test getting non-existent module returns 404"""
        response = requests.get(f"{BASE_URL}/api/learning/modules/invalid-id")
        assert response.status_code == 404
        print("✓ Non-existent module correctly returns 404")
    
    def test_filter_modules_by_category(self):
        """Test filtering modules by category"""
        response = requests.get(f"{BASE_URL}/api/learning/modules?category=irrigation")
        assert response.status_code == 200
        data = response.json()
        assert all(m["category"] == "irrigation" for m in data)
        print(f"✓ Filtered by category 'irrigation': {len(data)} modules")
    
    def test_filter_modules_by_difficulty(self):
        """Test filtering modules by difficulty"""
        response = requests.get(f"{BASE_URL}/api/learning/modules?difficulty=debutant")
        assert response.status_code == 200
        data = response.json()
        assert all(m["difficulty"] == "debutant" for m in data)
        print(f"✓ Filtered by difficulty 'debutant': {len(data)} modules")


class TestPayments:
    """Payment/Stripe API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_create_checkout_session(self, auth_token):
        """Test creating Stripe checkout session"""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout?package_id=premium_monthly",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        print(f"✓ Checkout session created: {data['session_id'][:30]}...")
    
    def test_create_checkout_invalid_package(self, auth_token):
        """Test creating checkout with invalid package returns 400"""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout?package_id=invalid_package",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400
        print("✓ Invalid package correctly rejected")
    
    def test_create_checkout_without_auth(self):
        """Test checkout requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payments/create-checkout?package_id=premium_monthly"
        )
        assert response.status_code == 401
        print("✓ Checkout correctly requires authentication")


class TestDashboard:
    """Dashboard stats API tests"""
    
    def test_dashboard_stats_public(self):
        """Test dashboard stats accessible without auth (returns limited data)"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "parcels_count" in data
        assert "average_humidity" in data
        assert "average_temperature" in data
        print(f"✓ Dashboard stats retrieved: {data['parcels_count']} parcels")
    
    def test_dashboard_stats_authenticated(self):
        """Test dashboard stats with authentication"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        token = login_response.json()["access_token"]
        
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "parcels_count" in data
        assert "active_alerts" in data
        print(f"✓ Authenticated dashboard stats: {data}")


class TestParcels:
    """Parcels CRUD API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_get_parcels(self, auth_token):
        """Test getting all parcels"""
        response = requests.get(
            f"{BASE_URL}/api/parcels",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Parcels retrieved: {len(data)} parcels")
        
        # Verify parcel structure if any exist
        if data:
            parcel = data[0]
            assert "id" in parcel
            assert "name" in parcel
            assert "crop_type" in parcel
            print(f"  - First parcel: {parcel['name']} ({parcel['crop_type']})")
    
    def test_create_parcel(self, auth_token):
        """Test creating a new parcel"""
        new_parcel = {
            "name": "TEST_Parcelle_Test",
            "crop_type": "Maïs",
            "variety": "Hybride F1",
            "area_hectares": 5.5,
            "humidity": 65,
            "temperature": 28,
            "soil_analysis": {
                "nitrogen": 60,
                "phosphorus": 45,
                "potassium": 55,
                "ph": 6.8
            },
            "planting_date": "2025-03-15",
            "status": "bon",
            "latitude": 7.54,
            "longitude": -5.55
        }
        
        response = requests.post(
            f"{BASE_URL}/api/parcels",
            json=new_parcel,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == new_parcel["name"]
        assert data["crop_type"] == new_parcel["crop_type"]
        assert "id" in data
        print(f"✓ Parcel created: {data['name']} (ID: {data['id'][:8]}...)")
        return data["id"]


class TestAdminEndpoints:
    """Admin-specific API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_admin_dashboard(self, admin_token):
        """Test admin dashboard endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "users_by_role" in data
        print(f"✓ Admin dashboard: {data['total_users']} total users")
    
    def test_admin_users_list(self, admin_token):
        """Test getting all users as admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin users list: {len(data)} users")


class TestWeather:
    """Weather API tests"""
    
    def test_get_weather(self):
        """Test getting weather data"""
        response = requests.get(f"{BASE_URL}/api/weather/Abidjan")
        assert response.status_code == 200
        data = response.json()
        assert "location" in data
        assert "temperature" in data
        assert "humidity" in data
        print(f"✓ Weather for Abidjan: {data['temperature']}°C, {data['humidity']}% humidity")


class TestSensors:
    """Sensors API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_get_sensors(self, auth_token):
        """Test getting all sensors"""
        response = requests.get(
            f"{BASE_URL}/api/sensors",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sensors retrieved: {len(data)} sensors")
    
    def test_get_sensors_stats(self, auth_token):
        """Test getting sensors statistics"""
        response = requests.get(
            f"{BASE_URL}/api/sensors/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_sensors" in data
        print(f"✓ Sensors stats: {data}")


class TestAlerts:
    """Alerts API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        return response.json()["access_token"]
    
    def test_get_alerts(self, auth_token):
        """Test getting all alerts"""
        response = requests.get(
            f"{BASE_URL}/api/alerts",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Alerts retrieved: {len(data)} alerts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
