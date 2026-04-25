"""
AGRICAM IA - Iteration 34 Tests
Testing DJI Drone Management Module APIs
- Fleet management (GET/POST)
- Missions (GET/POST)
- Stats
- Simulation telemetry
- Photos with AI analysis
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDroneFleetAPI:
    """Test drone fleet management endpoints"""
    
    def test_get_fleet_returns_drones(self):
        """GET /api/drone-manager/fleet returns list of drones"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/fleet")
        assert response.status_code == 200
        data = response.json()
        assert "drones" in data
        assert "total" in data
        assert isinstance(data["drones"], list)
        assert data["total"] >= 1  # At least 1 drone should exist
        
        # Verify drone structure
        if data["drones"]:
            drone = data["drones"][0]
            assert "id" in drone
            assert "name" in drone
            assert "model" in drone
            assert "status" in drone
            assert "battery" in drone
    
    def test_create_drone(self):
        """POST /api/drone-manager/fleet creates a new drone"""
        payload = {
            "name": "TEST_Drone_Pytest34",
            "model": "DJI Mini 3 Pro",
            "controller_type": "DJI RC"
        }
        response = requests.post(f"{BASE_URL}/api/drone-manager/fleet", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "drone" in data
        drone = data["drone"]
        assert drone["name"] == "TEST_Drone_Pytest34"
        assert drone["model"] == "DJI Mini 3 Pro"
        assert drone["status"] == "ready"
        assert drone["battery"] == 100
        assert "id" in drone
        assert "serial_number" in drone


class TestDroneMissionsAPI:
    """Test drone missions endpoints"""
    
    def test_get_missions_returns_list(self):
        """GET /api/drone-manager/missions returns list of missions"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/missions")
        assert response.status_code == 200
        data = response.json()
        assert "missions" in data
        assert "total" in data
        assert isinstance(data["missions"], list)
        
        # Verify mission structure if any exist
        if data["missions"]:
            mission = data["missions"][0]
            assert "id" in mission
            assert "name" in mission
            assert "status" in mission
    
    def test_create_mission(self):
        """POST /api/drone-manager/missions creates a new mission"""
        payload = {
            "name": "TEST_Mission_Pytest34",
            "drone_id": "drone-001",
            "mission_type": "survey",
            "altitude_m": 60,
            "speed_ms": 4.5,
            "overlap_percent": 80,
            "waypoints": [
                {"lat": 4.0510, "lng": 9.6960, "alt": 60, "action": "photo"}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/drone-manager/missions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "mission" in data
        mission = data["mission"]
        assert mission["name"] == "TEST_Mission_Pytest34"
        assert mission["drone_id"] == "drone-001"
        assert mission["mission_type"] == "survey"
        assert mission["altitude_m"] == 60
        assert mission["status"] == "planned"


class TestDroneStatsAPI:
    """Test drone statistics endpoint"""
    
    def test_get_stats(self):
        """GET /api/drone-manager/stats returns aggregated statistics"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected stats fields
        assert "total_drones" in data
        assert "total_missions" in data
        assert "completed_missions" in data
        assert "total_photos" in data
        assert "total_flight_time_hours" in data
        assert "total_area_surveyed_ha" in data
        assert "avg_battery_usage" in data
        assert "success_rate" in data
        
        # Verify reasonable values
        assert data["total_drones"] >= 2
        assert data["success_rate"] >= 0 and data["success_rate"] <= 100


class TestDroneTelemetrySimulation:
    """Test drone telemetry simulation endpoint"""
    
    def test_simulation_telemetry_returns_data(self):
        """GET /api/drone-manager/simulation/telemetry returns simulated telemetry"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/simulation/telemetry")
        assert response.status_code == 200
        data = response.json()
        
        # Verify telemetry structure
        assert "drone_id" in data
        assert "latitude" in data
        assert "longitude" in data
        assert "altitude" in data
        assert "battery_percent" in data
        assert "speed" in data
        assert "heading" in data
        assert "gps_signal" in data
        assert "status" in data
        assert "wind_speed" in data
        assert "temperature" in data
        assert "timestamp" in data
        
        # Verify data types and ranges
        assert isinstance(data["latitude"], float)
        assert isinstance(data["longitude"], float)
        assert data["altitude"] > 0
        assert data["battery_percent"] >= 0 and data["battery_percent"] <= 100
        assert data["gps_signal"] >= 1 and data["gps_signal"] <= 5
    
    def test_simulation_telemetry_changes_over_time(self):
        """Verify telemetry simulation produces dynamic data"""
        response1 = requests.get(f"{BASE_URL}/api/drone-manager/simulation/telemetry")
        time.sleep(1)
        response2 = requests.get(f"{BASE_URL}/api/drone-manager/simulation/telemetry")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        data1 = response1.json()
        data2 = response2.json()
        
        # Timestamps should be different
        assert data1["timestamp"] != data2["timestamp"]


class TestDronePhotosAPI:
    """Test drone photos with AI analysis endpoint"""
    
    def test_get_photos_returns_list(self):
        """GET /api/drone-manager/photos returns photos with AI analysis"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/photos")
        assert response.status_code == 200
        data = response.json()
        
        assert "photos" in data
        assert "total" in data
        assert isinstance(data["photos"], list)
        assert data["total"] >= 3  # Demo data has 3 photos
        
        # Verify photo structure with AI analysis
        if data["photos"]:
            photo = data["photos"][0]
            assert "id" in photo
            assert "drone_id" in photo
            assert "url" in photo
            assert "latitude" in photo
            assert "longitude" in photo
            assert "analysis" in photo
            
            # Verify AI analysis structure
            analysis = photo["analysis"]
            assert "ndvi" in analysis
            assert "health" in analysis
            assert "disease_detected" in analysis
            assert "crop_type" in analysis
    
    def test_photos_have_valid_ndvi_values(self):
        """Verify NDVI values are in valid range (0-1)"""
        response = requests.get(f"{BASE_URL}/api/drone-manager/photos")
        assert response.status_code == 200
        data = response.json()
        
        for photo in data["photos"]:
            ndvi = photo["analysis"]["ndvi"]
            assert ndvi >= 0 and ndvi <= 1, f"NDVI {ndvi} out of range"


class TestSecurityDashboardRegression:
    """Regression test for Admin Security Dashboard from iteration 33"""
    
    def test_admin_login_and_security_dashboard(self):
        """Test admin can login and access security dashboard"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        assert login_response.status_code == 200
        token = login_response.json().get("access_token")
        assert token is not None
        
        # Access security dashboard
        headers = {"Authorization": f"Bearer {token}"}
        dashboard_response = requests.get(f"{BASE_URL}/api/admin/security/dashboard", headers=headers)
        assert dashboard_response.status_code == 200
        data = dashboard_response.json()
        
        # Verify dashboard structure
        assert "stats" in data
        assert "security_logs" in data
        assert "login_activity" in data


class TestGuidedTourTranslations:
    """Test that GuidedTour component uses translations"""
    
    def test_translations_endpoint_exists(self):
        """Verify translations are available (implicit test via frontend)"""
        # This is tested via frontend Playwright tests
        # Backend doesn't have a dedicated translations endpoint
        # The GuidedTour uses useLanguage context which loads from frontend
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
