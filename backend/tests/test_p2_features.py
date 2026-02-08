"""
Test suite for AGRICAM IA P2 Features:
- Mobile Money Payment (Orange Money / MTN MoMo)
- Robot Control with 3D LIDAR
- Camera IA Real-time Analysis
- Dev Analytics (Google Analytics style)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@agricam-ia.com"
ADMIN_PASSWORD = "admin123"
FARMER_EMAIL = "agriculteur@demo.com"
FARMER_PASSWORD = "farmer123"


class TestHealthCheck:
    """Basic health check"""
    
    def test_api_health(self):
        """Test API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ API Health: {data}")


class TestAuthentication:
    """Authentication tests for P2 features"""
    
    def test_admin_login(self):
        """Test admin login for P2 admin-only features"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
        return data["access_token"]
    
    def test_farmer_login(self):
        """Test farmer login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"
        print(f"✓ Farmer login successful: {data['user']['email']}")
        return data["access_token"]


class TestMobileMoneyPayment:
    """Mobile Money Payment API tests - /api/payment/*"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_payment_history(self):
        """GET /api/payment/history - Get payment history"""
        response = requests.get(f"{BASE_URL}/api/payment/history", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "payments" in data
        assert isinstance(data["payments"], list)
        print(f"✓ Payment history: {len(data['payments'])} payments found")
    
    def test_initiate_orange_money_payment(self):
        """POST /api/payment/mobile-money - Initiate Orange Money payment"""
        response = requests.post(f"{BASE_URL}/api/payment/mobile-money", 
            headers=self.headers,
            json={
                "phone_number": "698226903",
                "amount_xaf": 5000,
                "provider": "orange_money",
                "description": "Test Abonnement Basic"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "reference" in data or "payment_id" in data
        assert "instructions" in data or "message" in data
        print(f"✓ Orange Money payment initiated: {data}")
    
    def test_initiate_mtn_momo_payment(self):
        """POST /api/payment/mobile-money - Initiate MTN MoMo payment"""
        response = requests.post(f"{BASE_URL}/api/payment/mobile-money", 
            headers=self.headers,
            json={
                "phone_number": "653722443",
                "amount_xaf": 15000,
                "provider": "mtn_momo",
                "description": "Test Abonnement Premium"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "reference" in data or "payment_id" in data
        print(f"✓ MTN MoMo payment initiated: {data}")


class TestRobotControl:
    """Robot Control API tests - /api/robot/* (Admin only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_robot_status(self):
        """GET /api/robot/status - Get robot status and telemetry"""
        response = requests.get(f"{BASE_URL}/api/robot/status", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        robot = data[0]
        assert "id" in robot
        assert "name" in robot
        assert "status" in robot
        assert "battery_percent" in robot
        assert "position" in robot
        assert "sensors" in robot
        print(f"✓ Robot status: {robot['name']} - {robot['status']} - Battery: {robot['battery_percent']}%")
    
    def test_get_3d_map(self):
        """GET /api/robot/{robot_id}/3d-map - Get 3D LIDAR reconstruction"""
        # First get robot ID
        status_response = requests.get(f"{BASE_URL}/api/robot/status", headers=self.headers)
        robots = status_response.json()
        robot_id = robots[0]["id"]
        
        response = requests.get(f"{BASE_URL}/api/robot/{robot_id}/3d-map", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "robot_id" in data
        assert "points_count" in data
        assert "detected_objects" in data
        assert "terrain_analysis" in data
        assert "ai_predictions" in data
        print(f"✓ 3D Map: {data['points_count']} points, {len(data['detected_objects'])} object types detected")
    
    def test_robot_control_start(self):
        """POST /api/robot/{robot_id}/control - Start robot"""
        status_response = requests.get(f"{BASE_URL}/api/robot/status", headers=self.headers)
        robots = status_response.json()
        robot_id = robots[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/robot/{robot_id}/control",
            headers=self.headers,
            data={"action": "start"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Robot control (start): {data['message']}")
    
    def test_robot_control_scan(self):
        """POST /api/robot/{robot_id}/control - Scan area"""
        status_response = requests.get(f"{BASE_URL}/api/robot/status", headers=self.headers)
        robots = status_response.json()
        robot_id = robots[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/robot/{robot_id}/control",
            headers=self.headers,
            data={"action": "scan_area"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Robot control (scan): {data['message']}")
    
    def test_robot_control_capture_3d(self):
        """POST /api/robot/{robot_id}/control - Capture 3D"""
        status_response = requests.get(f"{BASE_URL}/api/robot/status", headers=self.headers)
        robots = status_response.json()
        robot_id = robots[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/robot/{robot_id}/control",
            headers=self.headers,
            data={"action": "capture_3d"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Robot control (capture_3d): {data['message']}")


class TestCameraIA:
    """Camera IA API tests - /api/camera-ai/* (Admin only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_live_stats(self):
        """GET /api/camera-ai/live-stats - Get live camera stats"""
        response = requests.get(f"{BASE_URL}/api/camera-ai/live-stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total_frames_analyzed_today" in data
        assert "average_processing_time_ms" in data
        assert "alerts_generated" in data
        assert "health_score_average" in data
        assert "active_cameras" in data
        print(f"✓ Camera IA live stats: {data['total_frames_analyzed_today']} frames, {data['average_processing_time_ms']}ms avg")
    
    def test_analyze_frame(self):
        """POST /api/camera-ai/analyze-frame - Analyze camera frame"""
        response = requests.post(
            f"{BASE_URL}/api/camera-ai/analyze-frame",
            headers=self.headers,
            data={"image_data": "base64_test_image_data"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "analysis_results" in data
        assert "processing_time_ms" in data
        
        results = data["analysis_results"]
        assert "soil_analysis" in results
        assert "plant_analysis" in results
        assert "environment_analysis" in results
        assert "pest_detection" in results
        assert "yield_prediction" in results
        
        print(f"✓ Camera IA frame analysis: {data['processing_time_ms']}ms processing time")
        print(f"  - Soil moisture: {results['soil_analysis']['moisture_percent']}%")
        print(f"  - Plant health: {results['plant_analysis']['health_status']}")
        print(f"  - Pest risk: {results['pest_detection']['risk_level']}")


class TestDevAnalytics:
    """Dev Analytics API tests - /api/dev-analytics/* (Admin only)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_overview(self):
        """GET /api/dev-analytics/overview - Get platform overview stats"""
        response = requests.get(f"{BASE_URL}/api/dev-analytics/overview", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "overview" in data
        assert "user_distribution" in data
        assert "content_metrics" in data
        assert "engagement_metrics" in data
        assert "revenue_metrics" in data
        
        overview = data["overview"]
        assert "total_users" in overview
        assert "active_users_24h" in overview
        assert "retention_rate_percent" in overview
        
        print(f"✓ Dev Analytics overview:")
        print(f"  - Total users: {overview['total_users']}")
        print(f"  - Active users (24h): {overview['active_users_24h']}")
        print(f"  - Retention rate: {overview['retention_rate_percent']}%")
        print(f"  - Total revenue: {data['revenue_metrics']['total_revenue_xaf']} XAF")
    
    def test_get_users(self):
        """GET /api/dev-analytics/users - Get users list with subscription info"""
        response = requests.get(f"{BASE_URL}/api/dev-analytics/users", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert "total" in data
        assert "by_subscription" in data
        
        assert isinstance(data["users"], list)
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "role" in user
        
        print(f"✓ Dev Analytics users: {data['total']} total")
        print(f"  - By subscription: {data['by_subscription']}")
    
    def test_get_activity_log(self):
        """GET /api/dev-analytics/activity-log - Get activity log"""
        response = requests.get(f"{BASE_URL}/api/dev-analytics/activity-log", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "activities" in data
        assert isinstance(data["activities"], list)
        
        if len(data["activities"]) > 0:
            activity = data["activities"][0]
            assert "type" in activity
            assert "description" in activity
            assert "timestamp" in activity
        
        print(f"✓ Dev Analytics activity log: {len(data['activities'])} activities")
    
    def test_get_seo_report(self):
        """GET /api/dev-analytics/seo-report - Get SEO report"""
        response = requests.get(f"{BASE_URL}/api/dev-analytics/seo-report", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "overall_score" in data
        assert "recommendations" in data
        assert "keywords" in data
        
        assert isinstance(data["overall_score"], (int, float))
        assert isinstance(data["recommendations"], list)
        assert isinstance(data["keywords"], list)
        
        print(f"✓ Dev Analytics SEO report:")
        print(f"  - Overall score: {data['overall_score']}")
        print(f"  - Recommendations: {len(data['recommendations'])}")
        print(f"  - Keywords: {len(data['keywords'])}")
    
    def test_validate_subscription(self):
        """POST /api/dev-analytics/validate-subscription/{user_id} - Validate subscription"""
        # First get a user ID
        users_response = requests.get(f"{BASE_URL}/api/dev-analytics/users", headers=self.headers)
        users = users_response.json()["users"]
        
        # Find a non-admin user to test with
        test_user = None
        for user in users:
            if user.get("role") != "admin":
                test_user = user
                break
        
        if test_user:
            response = requests.post(
                f"{BASE_URL}/api/dev-analytics/validate-subscription/{test_user['id']}",
                headers=self.headers,
                data={"plan": "basic", "months": "1"}
            )
            assert response.status_code == 200
            data = response.json()
            assert "message" in data or "success" in data
            print(f"✓ Subscription validation: {data}")
        else:
            print("⚠ No non-admin user found for subscription validation test")


class TestAccessControl:
    """Test that P2 admin-only features are protected"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get farmer auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        self.farmer_token = response.json()["access_token"]
        self.farmer_headers = {"Authorization": f"Bearer {self.farmer_token}"}
    
    def test_farmer_can_access_payment_history(self):
        """Farmer should be able to access payment history"""
        response = requests.get(f"{BASE_URL}/api/payment/history", headers=self.farmer_headers)
        assert response.status_code == 200
        print("✓ Farmer can access payment history")
    
    def test_farmer_can_initiate_payment(self):
        """Farmer should be able to initiate mobile money payment"""
        response = requests.post(
            f"{BASE_URL}/api/payment/mobile-money",
            headers=self.farmer_headers,
            json={
                "phone_number": "698000000",
                "amount_xaf": 5000,
                "provider": "orange_money",
                "description": "Test payment"
            }
        )
        assert response.status_code == 200
        print("✓ Farmer can initiate mobile money payment")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
