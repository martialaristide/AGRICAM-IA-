"""
AGRICAM IA - Backend API Tests for Robot and Irrigation Features
Tests: Robot Status, Control, 3D Map, Move, Telemetry, Waypoint, History
       Irrigation Control, Parcels, Dashboard Stats, Sensors, Alerts
"""

import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@agricam-ia.com"
ADMIN_PASSWORD = "admin123"


class TestAuthentication:
    """Authentication tests - must pass before other tests"""
    
    def test_admin_login(self):
        """Test admin login and get token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful, token received")
        return data["access_token"]


class TestRobotStatus:
    """Robot Status GET /api/robot/status - doit retourner 2 robots"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_status_returns_2_robots(self, auth_token):
        """GET /api/robot/status should return 2 robots"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/robot/status", headers=headers)
        
        assert response.status_code == 200, f"Robot status failed: {response.text}"
        robots = response.json()
        
        assert isinstance(robots, list), "Response should be a list"
        assert len(robots) == 2, f"Expected 2 robots, got {len(robots)}"
        
        # Verify robot IDs
        robot_ids = [r["id"] for r in robots]
        assert "agribot-001" in robot_ids, "agribot-001 not found"
        assert "agribot-002" in robot_ids, "agribot-002 not found"
        
        # Verify robot data structure
        for robot in robots:
            assert "id" in robot
            assert "name" in robot
            assert "status" in robot
            assert "battery_percent" in robot
            assert "position" in robot
        
        print(f"✓ Robot status returns {len(robots)} robots: {robot_ids}")


class TestRobotControl:
    """Robot Control POST /api/robot/agribot-001/control"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_control_start(self, auth_token):
        """POST /api/robot/agribot-001/control - action: start"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/control",
            headers=headers,
            json={"action": "start", "parameters": {}}
        )
        
        assert response.status_code == 200, f"Robot control start failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["action"] == "start"
        assert "robot_id" in data
        print(f"✓ Robot control START successful: {data.get('message')}")
    
    def test_robot_control_stop(self, auth_token):
        """POST /api/robot/agribot-001/control - action: stop"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/control",
            headers=headers,
            json={"action": "stop", "parameters": {}}
        )
        
        assert response.status_code == 200, f"Robot control stop failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["action"] == "stop"
        print(f"✓ Robot control STOP successful: {data.get('message')}")
    
    def test_robot_control_scan_area(self, auth_token):
        """POST /api/robot/agribot-001/control - action: scan_area"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/control",
            headers=headers,
            json={"action": "scan_area", "parameters": {}}
        )
        
        assert response.status_code == 200, f"Robot control scan_area failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["action"] == "scan_area"
        print(f"✓ Robot control SCAN_AREA successful: {data.get('message')}")
    
    def test_robot_control_move_forward(self, auth_token):
        """POST /api/robot/agribot-001/control - action: move_forward"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/control",
            headers=headers,
            json={"action": "move_forward", "parameters": {"speed": 2.5}}
        )
        
        assert response.status_code == 200, f"Robot control move_forward failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["action"] == "move_forward"
        print(f"✓ Robot control MOVE_FORWARD successful: {data.get('message')}")
    
    def test_robot_control_invalid_action(self, auth_token):
        """POST /api/robot/agribot-001/control - invalid action should return 400"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/control",
            headers=headers,
            json={"action": "invalid_action", "parameters": {}}
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid action, got {response.status_code}"
        print(f"✓ Invalid action correctly rejected with 400")


class TestRobot3DMap:
    """Robot 3D Map GET /api/robot/agribot-001/3d-map"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_3d_map_returns_point_cloud(self, auth_token):
        """GET /api/robot/agribot-001/3d-map - should return point_cloud with 125000 points"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/robot/agribot-001/3d-map", headers=headers)
        
        assert response.status_code == 200, f"3D map failed: {response.text}"
        data = response.json()
        
        assert "point_cloud" in data, "Response should contain point_cloud"
        assert "total_points" in data["point_cloud"], "point_cloud should have total_points"
        assert data["point_cloud"]["total_points"] == 125000, f"Expected 125000 points, got {data['point_cloud']['total_points']}"
        
        # Verify additional 3D map data
        assert "sample_points" in data["point_cloud"]
        assert "detected_features" in data
        assert "terrain_analysis" in data
        assert "ai_analysis" in data
        
        print(f"✓ 3D Map returns {data['point_cloud']['total_points']} points with full analysis")


class TestRobotMove:
    """Robot Move POST /api/robot/agribot-001/move"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_move_forward(self, auth_token):
        """POST /api/robot/agribot-001/move - direction: forward"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/move",
            headers=headers,
            json={"direction": "forward", "speed": 1.0}
        )
        
        assert response.status_code == 200, f"Robot move forward failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["movement"] == "forward"
        assert "new_position" in data
        print(f"✓ Robot move FORWARD successful, new position: {data['new_position']}")
    
    def test_robot_move_backward(self, auth_token):
        """POST /api/robot/agribot-001/move - direction: backward"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/move",
            headers=headers,
            json={"direction": "backward", "speed": 0.5}
        )
        
        assert response.status_code == 200, f"Robot move backward failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["movement"] == "backward"
        print(f"✓ Robot move BACKWARD successful")
    
    def test_robot_move_left(self, auth_token):
        """POST /api/robot/agribot-001/move - direction: left"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/move",
            headers=headers,
            json={"direction": "left", "speed": 1.0}
        )
        
        assert response.status_code == 200, f"Robot move left failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["movement"] == "left"
        assert "new_heading" in data
        print(f"✓ Robot move LEFT successful, new heading: {data['new_heading']}")
    
    def test_robot_move_right(self, auth_token):
        """POST /api/robot/agribot-001/move - direction: right"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/move",
            headers=headers,
            json={"direction": "right", "speed": 1.0}
        )
        
        assert response.status_code == 200, f"Robot move right failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["movement"] == "right"
        print(f"✓ Robot move RIGHT successful")
    
    def test_robot_move_invalid_robot(self, auth_token):
        """POST /api/robot/invalid-robot/move - should return 404"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/invalid-robot/move",
            headers=headers,
            json={"direction": "forward", "speed": 1.0}
        )
        
        assert response.status_code == 404, f"Expected 404 for invalid robot, got {response.status_code}"
        print(f"✓ Invalid robot correctly rejected with 404")


class TestRobotTelemetry:
    """Robot Telemetry GET /api/robot/agribot-001/telemetry"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_telemetry(self, auth_token):
        """GET /api/robot/agribot-001/telemetry - battery, position, speed"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/robot/agribot-001/telemetry", headers=headers)
        
        assert response.status_code == 200, f"Telemetry failed: {response.text}"
        data = response.json()
        
        # Verify telemetry data structure
        assert "robot_id" in data
        assert "battery" in data
        assert "position" in data
        assert "speed_kmh" in data
        
        # Verify battery data
        assert "percent" in data["battery"]
        assert isinstance(data["battery"]["percent"], (int, float))
        
        # Verify position data
        assert "lat" in data["position"]
        assert "lng" in data["position"]
        
        print(f"✓ Telemetry: battery={data['battery']['percent']}%, position={data['position']}, speed={data['speed_kmh']}km/h")


class TestRobotWaypoint:
    """Robot Waypoint POST /api/robot/agribot-001/waypoint"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_add_waypoint(self, auth_token):
        """POST /api/robot/agribot-001/waypoint - add navigation waypoint"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/robot/agribot-001/waypoint",
            headers=headers,
            json={
                "latitude": 5.9650,
                "longitude": 10.1600,
                "action_on_arrival": "scan_area"
            }
        )
        
        assert response.status_code == 200, f"Add waypoint failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "waypoint_id" in data
        assert "total_waypoints" in data
        print(f"✓ Waypoint added: {data['waypoint_id']}, total waypoints: {data['total_waypoints']}")


class TestRobotHistory:
    """Robot History GET /api/robot/agribot-001/history"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_robot_history(self, auth_token):
        """GET /api/robot/agribot-001/history - command history"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/robot/agribot-001/history", headers=headers)
        
        assert response.status_code == 200, f"History failed: {response.text}"
        data = response.json()
        
        assert "robot_id" in data
        assert "commands" in data
        assert "statistics" in data
        assert isinstance(data["commands"], list)
        
        print(f"✓ Robot history: {data['total_commands']} commands, stats: {data['statistics']}")


class TestIrrigationControl:
    """Irrigation Control POST /api/irrigation/irr-001/control"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_irrigation_control_start(self, auth_token):
        """POST /api/irrigation/irr-001/control - action: start"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/irrigation/irr-001/control",
            headers=headers,
            json={"action": "start", "duration_minutes": 30}
        )
        
        assert response.status_code == 200, f"Irrigation start failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["new_status"] == "actif"
        print(f"✓ Irrigation START successful: {data}")
    
    def test_irrigation_control_stop(self, auth_token):
        """POST /api/irrigation/irr-001/control - action: stop"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/irrigation/irr-001/control",
            headers=headers,
            json={"action": "stop"}
        )
        
        assert response.status_code == 200, f"Irrigation stop failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["new_status"] == "arrete"
        print(f"✓ Irrigation STOP successful")
    
    def test_irrigation_control_pause(self, auth_token):
        """POST /api/irrigation/irr-001/control - action: pause"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/irrigation/irr-001/control",
            headers=headers,
            json={"action": "pause"}
        )
        
        assert response.status_code == 200, f"Irrigation pause failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["new_status"] == "pause"
        print(f"✓ Irrigation PAUSE successful")


class TestCreateParcel:
    """Create Parcel POST /api/parcels"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_create_parcel_with_culture_type(self, auth_token):
        """POST /api/parcels - with culture_type and surface_hectares"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/parcels",
            headers=headers,
            json={
                "name": "TEST_Parcelle_Robot_Test",
                "culture_type": "Maïs",
                "surface_hectares": 5.5,
                "humidity": 65,
                "temperature": 28
            }
        )
        
        assert response.status_code == 200, f"Create parcel failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        assert data["name"] == "TEST_Parcelle_Robot_Test"
        assert data["culture_type"] == "Maïs" or data["crop_type"] == "Maïs"
        assert data["surface_hectares"] == 5.5 or data["area_hectares"] == 5.5
        
        print(f"✓ Parcel created: {data['id']}, culture: {data.get('culture_type') or data.get('crop_type')}, surface: {data.get('surface_hectares') or data.get('area_hectares')} ha")
        
        # Cleanup - delete test parcel
        requests.delete(f"{BASE_URL}/api/parcels/{data['id']}", headers=headers)


class TestDashboardStats:
    """Dashboard Stats GET /api/dashboard/stats"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_dashboard_stats(self, auth_token):
        """GET /api/dashboard/stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        
        assert response.status_code == 200, f"Dashboard stats failed: {response.text}"
        data = response.json()
        
        # Verify expected fields
        expected_fields = ["parcels_count", "average_humidity", "average_temperature", 
                          "active_alerts", "active_sensors"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Dashboard stats: parcels={data['parcels_count']}, humidity={data['average_humidity']}%, temp={data['average_temperature']}°C")


class TestSensors:
    """Sensors GET /api/sensors"""
    
    def test_get_sensors(self):
        """GET /api/sensors - no auth required"""
        response = requests.get(f"{BASE_URL}/api/sensors")
        
        assert response.status_code == 200, f"Get sensors failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Sensors: {len(data)} sensors found")


class TestAlerts:
    """Alerts GET /api/alerts"""
    
    @pytest.fixture
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_alerts(self, auth_token):
        """GET /api/alerts"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/alerts", headers=headers)
        
        assert response.status_code == 200, f"Get alerts failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Alerts: {len(data)} alerts found")


class TestHealthCheck:
    """Health check endpoint"""
    
    def test_health(self):
        """GET /api/health"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200, f"Health check failed: {response.text}"
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check: {data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
