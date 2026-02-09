"""
AGRICAM IA - Advanced Features API Tests
Tests for AgriBot IA, Drones, Robots, and Reports
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAgribotIA:
    """AgriBot IA Chat and Prediction Tests"""
    
    def test_agribot_chat_simple_question(self):
        """Test AgriBot IA chat with simple agricultural question"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/chat",
            json={"message": "Quelle est la meilleure période pour planter le maïs?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "response" in data
        assert len(data["response"]) > 50  # Should have substantial response
        assert "timestamp" in data
        
    def test_agribot_predict_yield(self):
        """Test yield prediction for maize in Cameroon"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-yield",
            json={
                "crop_type": "maïs",
                "surface_ha": 5.0,
                "country": "Cameroun",
                "soil_quality": "bon",
                "irrigation": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["crop_type"] == "maïs"
        assert data["surface_ha"] == 5.0
        assert data["country"] == "Cameroun"
        assert "prediction" in data
        
    def test_agribot_predict_yield_different_crop(self):
        """Test yield prediction for cacao in Côte d'Ivoire"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-yield",
            json={
                "crop_type": "cacao",
                "surface_ha": 10.0,
                "country": "Côte d'Ivoire",
                "soil_quality": "moyen",
                "irrigation": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "prediction" in data


class TestDroneManagement:
    """Drone CRUD and Management Tests"""
    
    def test_get_all_drones(self):
        """Test listing all drones"""
        response = requests.get(f"{BASE_URL}/api/drones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # Should have at least 2 predefined drones
        
        # Verify drone structure
        drone = data[0]
        assert "id" in drone
        assert "name" in drone
        assert "status" in drone
        assert "battery_percent" in drone
        assert "wifi_connected" in drone
        
    def test_get_drone_by_id(self):
        """Test getting specific drone"""
        response = requests.get(f"{BASE_URL}/api/drones/drone-001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "drone-001"
        assert data["name"] == "AgriDrone Alpha"
        
    def test_get_nonexistent_drone(self):
        """Test 404 for nonexistent drone"""
        response = requests.get(f"{BASE_URL}/api/drones/nonexistent-drone")
        assert response.status_code == 404
        
    def test_create_drone(self):
        """Test creating a new drone"""
        response = requests.post(
            f"{BASE_URL}/api/drones",
            json={
                "name": "TEST_NewDrone",
                "type": "surveillance",
                "model": "DJI Mini 3 Pro",
                "cameras": ["RGB 4K"],
                "max_payload_kg": 5,
                "max_flight_time_min": 25
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_NewDrone"
        assert data["type"] == "surveillance"
        
        # Cleanup - delete the test drone
        drone_id = data["id"]
        delete_response = requests.delete(f"{BASE_URL}/api/drones/{drone_id}")
        assert delete_response.status_code == 200


class TestDronePiloting:
    """Drone Piloting Commands Tests"""
    
    def test_drone_takeoff(self):
        """Test drone takeoff command"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "takeoff", "parameters": {"altitude_m": 30}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "altitude" in data or "message" in data
        
    def test_drone_move_forward(self):
        """Test drone move forward command"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "move_forward", "parameters": {"distance_m": 20, "speed_mps": 5}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "position" in data
        
    def test_drone_capture_photo(self):
        """Test drone photo capture"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "capture_photo", "parameters": {"camera": "RGB 4K"}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "photo_id" in data
        
    def test_drone_hover(self):
        """Test drone hover command"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "hover"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_drone_land(self):
        """Test drone landing command"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "land"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_drone_invalid_command(self):
        """Test invalid drone command returns error"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/pilot",
            json={"command": "invalid_command"}
        )
        assert response.status_code == 400
        
    def test_drone_pilot_disconnected(self):
        """Test piloting disconnected drone fails"""
        # First disconnect drone-002
        requests.post(f"{BASE_URL}/api/drones/drone-002/disconnect-wifi")
        
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-002/pilot",
            json={"command": "takeoff"}
        )
        assert response.status_code == 400


class TestDroneWifi:
    """Drone WiFi Connection Tests"""
    
    def test_drone_connect_wifi(self):
        """Test connecting drone to WiFi"""
        response = requests.post(
            f"{BASE_URL}/api/drones/drone-001/connect-wifi",
            json={"wifi_ssid": "TestNetwork", "wifi_password": "testpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "signal_strength" in data
        
    def test_drone_disconnect_wifi(self):
        """Test disconnecting drone from WiFi"""
        # First ensure connected
        requests.post(
            f"{BASE_URL}/api/drones/drone-002/connect-wifi",
            json={"wifi_ssid": "TestNetwork", "wifi_password": "testpass123"}
        )
        
        response = requests.post(f"{BASE_URL}/api/drones/drone-002/disconnect-wifi")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestDroneTelemetry:
    """Drone Telemetry Tests"""
    
    def test_get_drone_telemetry(self):
        """Test getting drone telemetry data"""
        response = requests.get(f"{BASE_URL}/api/drones/drone-001/telemetry")
        assert response.status_code == 200
        data = response.json()
        assert "drone_id" in data
        assert "status" in data
        assert "position" in data
        assert "battery_percent" in data
        assert "altitude_m" in data
        assert "speed_mps" in data
        assert "timestamp" in data


class TestRobotManagement:
    """Robot CRUD and Management Tests"""
    
    def test_get_all_robots(self):
        """Test listing all robots"""
        response = requests.get(f"{BASE_URL}/api/robots")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # Should have at least 2 predefined robots
        
        # Verify robot structure
        robot = data[0]
        assert "id" in robot
        assert "name" in robot
        assert "status" in robot
        assert "battery_percent" in robot
        
    def test_get_robot_by_id(self):
        """Test getting specific robot"""
        response = requests.get(f"{BASE_URL}/api/robots/robot-001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "robot-001"
        assert data["name"] == "AgriBot Alpha"
        
    def test_get_nonexistent_robot(self):
        """Test 404 for nonexistent robot"""
        response = requests.get(f"{BASE_URL}/api/robots/nonexistent-robot")
        assert response.status_code == 404
        
    def test_create_robot(self):
        """Test creating a new robot"""
        response = requests.post(
            f"{BASE_URL}/api/robots",
            json={
                "name": "TEST_NewRobot",
                "type": "weeding",
                "model": "AGRICAM WB-300",
                "tools": ["désherbeuse", "caméra"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_NewRobot"
        assert data["type"] == "weeding"
        
        # Cleanup - delete the test robot
        robot_id = data["id"]
        delete_response = requests.delete(f"{BASE_URL}/api/robots/{robot_id}")
        assert delete_response.status_code == 200


class TestRobotControl:
    """Robot Control Commands Tests"""
    
    def test_robot_start(self):
        """Test robot start command"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "start", "parameters": {"task": "Surveillance"}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_robot_move_forward(self):
        """Test robot move forward command"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "move_forward", "parameters": {"distance_m": 5, "speed_kmh": 2}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "position" in data
        
    def test_robot_scan_area(self):
        """Test robot scan area command"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "scan_area"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_robot_stop(self):
        """Test robot stop command"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "stop"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_robot_return_home(self):
        """Test robot return home command"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "return_home"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
    def test_robot_invalid_action(self):
        """Test invalid robot action returns error"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/control",
            json={"action": "invalid_action"}
        )
        assert response.status_code == 400


class TestRobotWifi:
    """Robot WiFi Connection Tests"""
    
    def test_robot_connect_wifi(self):
        """Test connecting robot to WiFi"""
        response = requests.post(
            f"{BASE_URL}/api/robots/robot-001/connect-wifi",
            json={"wifi_ssid": "AgriNet-5G", "wifi_password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestRobotTelemetry:
    """Robot Telemetry Tests"""
    
    def test_get_robot_telemetry(self):
        """Test getting robot telemetry data"""
        response = requests.get(f"{BASE_URL}/api/robots/robot-001/telemetry")
        assert response.status_code == 200
        data = response.json()
        assert "robot_id" in data
        assert "status" in data
        assert "position" in data
        assert "battery_percent" in data
        assert "speed_kmh" in data
        assert "sensors" in data


class TestReportGeneration:
    """Report Generation Tests"""
    
    def test_generate_pdf_report(self):
        """Test PDF report generation"""
        response = requests.post(
            f"{BASE_URL}/api/reports/generate",
            json={
                "data": {
                    "title": "Test Report",
                    "parcels": [{"name": "Parcelle A", "surface": 10}]
                },
                "report_type": "parcels",
                "title": "Rapport Test",
                "format": "pdf"
            }
        )
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/pdf"
        assert len(response.content) > 100  # Should have content
        
    def test_generate_csv_report(self):
        """Test CSV report generation"""
        response = requests.post(
            f"{BASE_URL}/api/reports/generate",
            json={
                "data": {
                    "items": [
                        {"name": "Item 1", "value": 100},
                        {"name": "Item 2", "value": 200}
                    ]
                },
                "report_type": "inventory",
                "title": "Inventaire Test",
                "format": "csv"
            }
        )
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        
    def test_generate_invalid_format(self):
        """Test invalid report format returns error"""
        response = requests.post(
            f"{BASE_URL}/api/reports/generate",
            json={
                "data": {"test": "data"},
                "report_type": "test",
                "title": "Test",
                "format": "invalid_format"
            }
        )
        assert response.status_code == 400


class TestHealthAndBasics:
    """Basic Health Check Tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
