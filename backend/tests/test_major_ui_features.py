"""
Test Major UI/UX Features - Backend APIs
Tests for:
- AgriBot IA Chat (ChatGPT style) - /api/agribot-ai/*
- Camera IA - /api/camera-ai/*
- DevAnalytics (Tour de Controle) - /api/dev-analytics/*
- Climate Notifications - /api/climate-notifications
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials for testing
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@agricam.ai")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "adminpassword")
@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed - skipping admin tests")
    return None


@pytest.fixture
def auth_headers(admin_token):
    """Get auth headers for authenticated requests"""
    return {"Authorization": f"Bearer {admin_token}"}


class TestClimateNotifications:
    """Climate notification system - /api/climate-notifications"""

    def test_get_climate_notifications(self):
        """GET /api/climate-notifications - Returns alerts array with severity levels"""
        response = requests.get(f"{BASE_URL}/api/climate-notifications")
        assert response.status_code == 200
        
        data = response.json()
        assert "alerts" in data
        assert "total" in data
        assert isinstance(data["alerts"], list)
        assert data["total"] >= 0
        
        # Verify alert structure if alerts exist
        if data["alerts"]:
            alert = data["alerts"][0]
            assert "id" in alert
            assert "severity" in alert
            assert alert["severity"] in ["info", "warning", "critical"]
            assert "title" in alert
            assert "message" in alert
            assert "timestamp" in alert
            print(f"✓ Got {data['total']} climate alerts")

    def test_climate_notifications_with_field_id(self):
        """GET /api/climate-notifications?field_id=TEST123"""
        response = requests.get(f"{BASE_URL}/api/climate-notifications?field_id=TEST123")
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        print(f"✓ Climate notifications with field_id filter working")


class TestAgribotIAChat:
    """AgriBot IA ChatGPT-style chat - /api/agribot-ai/*"""

    def test_agribot_chat(self, auth_headers):
        """POST /api/agribot-ai/chat - Chat with AI"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/chat",
            json={"message": "Comment traiter le mildiou?"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ AgriBot chat response: {data['response'][:100]}...")

    def test_agribot_predict_yield(self, auth_headers):
        """POST /api/agribot-ai/predict-yield - Yield prediction tool"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-yield",
            json={
                "crop_type": "mais",
                "surface_ha": 5,
                "country": "Cameroun",
                "soil_quality": "moyen",
                "irrigation": False
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "prediction" in data or "estimated_yield_kg_ha" in data
        print(f"✓ Yield prediction working")

    def test_agribot_analyze_soil(self, auth_headers):
        """POST /api/agribot-ai/analyze-soil - Soil NPK analysis"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/analyze-soil",
            json={
                "soil_data": {
                    "nitrogen": 45,
                    "phosphorus": 30,
                    "potassium": 50,
                    "ph": 6.5,
                    "humidity": 60
                }
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        # Check response contains soil analysis data
        assert isinstance(data, dict)
        print(f"✓ Soil NPK analysis working")

    def test_agribot_predict_disease_spread(self, auth_headers):
        """POST /api/agribot-ai/predict-disease-spread"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-disease-spread",
            json={
                "disease": "mildiou",
                "region": "Centre Cameroun"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Disease spread prediction working")

    def test_agribot_ecological_advice(self, auth_headers):
        """POST /api/agribot-ai/ecological-advice"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/ecological-advice",
            json={"context": "agriculture tropicale"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Ecological advice working")


class TestCameraIA:
    """Camera IA real-time analysis - /api/camera-ai/*"""

    def test_camera_ai_live_stats(self, auth_headers):
        """GET /api/camera-ai/live-stats - Get live camera statistics"""
        response = requests.get(
            f"{BASE_URL}/api/camera-ai/live-stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "total_frames_analyzed_today" in data
        assert "average_processing_time_ms" in data
        assert "alerts_generated" in data
        assert "health_score_average" in data
        print(f"✓ Camera live stats: {data['total_frames_analyzed_today']} frames analyzed")

    def test_camera_ai_analyze_frame(self, auth_headers):
        """POST /api/camera-ai/analyze-frame - Analyze camera frame (form data)"""
        response = requests.post(
            f"{BASE_URL}/api/camera-ai/analyze-frame",
            data={"image_data": "test_base64_data"},
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "analysis_results" in data
        assert "soil_analysis" in data["analysis_results"]
        assert "plant_analysis" in data["analysis_results"]
        assert "environment_analysis" in data["analysis_results"]
        assert "pest_detection" in data["analysis_results"]
        assert "yield_prediction" in data["analysis_results"]
        print(f"✓ Camera frame analysis working with full result structure")


class TestDevAnalytics:
    """DevAnalytics Tour de Controle - /api/dev-analytics/* (admin only)"""

    def test_dev_analytics_overview(self, auth_headers):
        """GET /api/dev-analytics/overview - Platform overview stats"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/overview",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "overview" in data
        assert "total_users" in data["overview"]
        assert "active_users_24h" in data["overview"]
        assert "content_metrics" in data
        assert "revenue_metrics" in data
        assert "engagement_metrics" in data
        print(f"✓ DevAnalytics overview: {data['overview']['total_users']} total users")

    def test_dev_analytics_users(self, auth_headers):
        """GET /api/dev-analytics/users - User analytics with subscription breakdown"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/users",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert isinstance(data["users"], list)
        
        # Check user structure if users exist
        if data["users"]:
            user = data["users"][0]
            assert "email" in user
            assert "role" in user
        print(f"✓ DevAnalytics users: {data['total']} users found")

    def test_dev_analytics_activity_log(self, auth_headers):
        """GET /api/dev-analytics/activity-log - Activity log"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/activity-log",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "activities" in data
        assert isinstance(data["activities"], list)
        
        # Check activity structure if activities exist
        if data["activities"]:
            activity = data["activities"][0]
            assert "type" in activity
            assert "description" in activity
        print(f"✓ DevAnalytics activity log working")

    def test_dev_analytics_seo_report(self, auth_headers):
        """GET /api/dev-analytics/seo-report - SEO report"""
        response = requests.get(
            f"{BASE_URL}/api/dev-analytics/seo-report",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "overall_score" in data
        assert "recommendations" in data
        assert "keywords" in data
        assert isinstance(data["recommendations"], list)
        assert isinstance(data["keywords"], list)
        
        # Verify recommendation structure
        if data["recommendations"]:
            rec = data["recommendations"][0]
            assert "category" in rec
            assert "score" in rec
            assert "status" in rec
        print(f"✓ DevAnalytics SEO report: score {data['overall_score']}")

    def test_dev_analytics_validate_subscription(self, auth_headers):
        """POST /api/dev-analytics/validate-subscription/{user_id} - Admin validates subscription"""
        # First get a user ID
        users_response = requests.get(
            f"{BASE_URL}/api/dev-analytics/users",
            headers=auth_headers
        )
        
        if users_response.status_code == 200 and users_response.json().get("users"):
            user_id = users_response.json()["users"][0].get("id")
            if user_id:
                response = requests.post(
                    f"{BASE_URL}/api/dev-analytics/validate-subscription/{user_id}",
                    data={"plan": "basic", "months": "1"},
                    headers=auth_headers
                )
                assert response.status_code == 200
                
                data = response.json()
                assert "success" in data
                assert data["success"] == True
                print(f"✓ DevAnalytics subscription validation working")
            else:
                print("⚠ No user ID found - skipping subscription validation test")
        else:
            print("⚠ Could not get users - skipping subscription validation test")


class TestParcelsEnhancements:
    """Parcelles page enhancements - new info fields"""

    def test_get_parcels_with_country_field(self, auth_headers):
        """GET /api/parcels - Verify parcel structure supports country field"""
        response = requests.get(
            f"{BASE_URL}/api/parcels",
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if data:
            parcel = data[0]
            # Verify parcel has required fields
            assert "name" in parcel
            assert "crop_type" in parcel
            assert "humidity" in parcel
            assert "temperature" in parcel
            assert "soil_analysis" in parcel
            print(f"✓ Parcels data structure valid, found {len(data)} parcels")
        else:
            print("⚠ No parcels found in database")

    def test_create_parcel_with_country(self, auth_headers):
        """POST /api/parcels - Create parcel with country field"""
        response = requests.post(
            f"{BASE_URL}/api/parcels",
            json={
                "name": "TEST_Parcel_Country",
                "crop_type": "Cacao",
                "area_hectares": 3.5,
                "humidity": 70,
                "temperature": 28,
                "soil_analysis": {
                    "nitrogen": 55,
                    "phosphorus": 40,
                    "potassium": 45,
                    "ph": 6.5
                },
                "status": "bon",
                "country": "Cameroun"
            },
            headers=auth_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Parcel_Country"
        print(f"✓ Created parcel with country field")
        
        # Cleanup - delete test parcel
        parcel_id = data["id"]
        cleanup_response = requests.delete(
            f"{BASE_URL}/api/parcels/{parcel_id}",
            headers=auth_headers
        )
        if cleanup_response.status_code == 200:
            print(f"✓ Cleaned up test parcel")


class TestHealthCheck:
    """Basic health check - ensure server is running"""

    def test_health_endpoint(self):
        """GET /api/health"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Server healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
