"""
AGRICAM IA v3.0 API Tests - New Features Testing
Tests for: Sensors CRUD, IoT Import/Export/Analyze, Marketplace (Products, Chat, Contracts),
Drones, Robots, AI Weather/Satellite, Alerts AI, Currency, Analytics
"""
import pytest
import requests
import os
import io
import csv

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_CREDENTIALS = {"email": "admin@agricam-ia.com", "password": "admin123"}
FARMER_CREDENTIALS = {"email": "agriculteur@demo.com", "password": "farmer123"}


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
    if response.status_code != 200:
        pytest.skip("Admin login failed - skipping tests")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def farmer_token():
    """Get farmer authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=FARMER_CREDENTIALS)
    if response.status_code != 200:
        pytest.skip("Farmer login failed - skipping tests")
    return response.json()["access_token"]


class TestSensorsCRUD:
    """Sensors CRUD API tests - Admin only"""
    
    def test_create_sensor_admin(self, admin_token):
        """Test creating a sensor as admin"""
        sensor_data = {
            "name": "TEST_Capteur_Humidite_01",
            "type": "humidity",
            "parcel_id": "test-parcel-001",
            "location": "Zone Nord",
            "status": "actif"
        }
        response = requests.post(
            f"{BASE_URL}/api/sensors",
            json=sensor_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        assert data["name"] == sensor_data["name"]
        print(f"✓ Sensor created: {data['name']} (ID: {data.get('id', 'N/A')[:8]}...)")
        return data.get("id")
    
    def test_get_sensors_list(self, admin_token):
        """Test getting all sensors"""
        response = requests.get(
            f"{BASE_URL}/api/sensors",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sensors list retrieved: {len(data)} sensors")
    
    def test_update_sensor(self, admin_token):
        """Test updating a sensor"""
        # First create a sensor
        sensor_data = {
            "name": "TEST_Capteur_Update",
            "type": "temperature",
            "parcel_id": "test-parcel-001",
            "status": "actif"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/sensors",
            json=sensor_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if create_response.status_code not in [200, 201]:
            pytest.skip("Could not create sensor for update test")
        
        sensor_id = create_response.json().get("id")
        
        # Update the sensor
        update_data = {"name": "TEST_Capteur_Updated", "status": "inactif"}
        response = requests.put(
            f"{BASE_URL}/api/sensors/{sensor_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        print(f"✓ Sensor updated: {data['name']}")
    
    def test_delete_sensor(self, admin_token):
        """Test deleting a sensor"""
        # First create a sensor
        sensor_data = {
            "name": "TEST_Capteur_Delete",
            "type": "ph",
            "parcel_id": "test-parcel-001",
            "status": "actif"
        }
        create_response = requests.post(
            f"{BASE_URL}/api/sensors",
            json=sensor_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if create_response.status_code not in [200, 201]:
            pytest.skip("Could not create sensor for delete test")
        
        sensor_id = create_response.json().get("id")
        
        # Delete the sensor
        response = requests.delete(
            f"{BASE_URL}/api/sensors/{sensor_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code in [200, 204]
        print(f"✓ Sensor deleted: {sensor_id[:8]}...")


class TestIoTImportExport:
    """IoT Import/Export/Analyze API tests"""
    
    def test_iot_export_csv(self, admin_token):
        """Test exporting IoT data as CSV"""
        response = requests.get(
            f"{BASE_URL}/api/iot/export?format=csv",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        # Check content type or data
        print(f"✓ IoT export CSV: Status {response.status_code}")
    
    def test_iot_export_json(self, admin_token):
        """Test exporting IoT data as JSON"""
        response = requests.get(
            f"{BASE_URL}/api/iot/export?format=json",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ IoT export JSON: Status {response.status_code}")
    
    def test_iot_import_csv(self, admin_token):
        """Test importing IoT data from CSV"""
        # Create a simple CSV file in memory
        csv_content = "sensor_id,value,timestamp\ntest-sensor-001,65.5,2025-01-28T10:00:00\ntest-sensor-002,28.3,2025-01-28T10:00:00"
        files = {"file": ("test_sensors.csv", csv_content, "text/csv")}
        
        response = requests.post(
            f"{BASE_URL}/api/iot/import",
            files=files,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "records_imported" in data or "success" in data
        print(f"✓ IoT import CSV: {data}")
    
    def test_iot_analyze(self, admin_token):
        """Test IoT data analysis"""
        analyze_data = {
            "sensor_ids": ["test-sensor-001"],
            "analysis_type": "trend"
        }
        response = requests.post(
            f"{BASE_URL}/api/iot/analyze",
            json=analyze_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ IoT analyze: {data}")


class TestMarketplace:
    """Marketplace API tests - Products, Chat, Contracts"""
    
    def test_create_product(self, farmer_token):
        """Test creating a marketplace product"""
        product_data = {
            "title": "TEST_Maïs Bio Premium",
            "description": "Maïs biologique de haute qualité",
            "category": "cereales",
            "price_per_unit": 25000,
            "unit": "tonne",
            "quantity": 50,
            "location": "Abidjan, Côte d'Ivoire",
            "harvest_date": "2025-03-15"
        }
        response = requests.post(
            f"{BASE_URL}/api/marketplace/products/create",
            json=product_data,
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        print(f"✓ Product created: {data.get('title', 'N/A')}")
        return data.get("id")
    
    def test_get_marketplace_products(self, farmer_token):
        """Test getting marketplace products"""
        response = requests.get(
            f"{BASE_URL}/api/marketplace/products",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Marketplace products: {len(data)} products")
    
    def test_get_my_products(self, farmer_token):
        """Test getting user's own products"""
        response = requests.get(
            f"{BASE_URL}/api/marketplace/my-products",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ My products: {len(data)} products")
    
    def test_get_conversations(self, farmer_token):
        """Test getting chat conversations"""
        response = requests.get(
            f"{BASE_URL}/api/marketplace/chat/conversations",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Conversations: {len(data)} conversations")
    
    def test_get_contracts(self, farmer_token):
        """Test getting contracts"""
        response = requests.get(
            f"{BASE_URL}/api/marketplace/contracts",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Contracts: {len(data)} contracts")


class TestDrones:
    """Drones CRUD API tests"""
    
    def test_create_drone(self, admin_token):
        """Test creating a drone"""
        drone_data = {
            "name": "TEST_Drone_DJI_01",
            "model": "DJI Phantom 4",
            "serial_number": "TEST-DJI-001",
            "status": "disponible",
            "battery_level": 100,
            "flight_hours": 0
        }
        response = requests.post(
            f"{BASE_URL}/api/drones",
            json=drone_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        print(f"✓ Drone created: {data.get('name', 'N/A')}")
        return data.get("id")
    
    def test_get_drones(self, admin_token):
        """Test getting all drones"""
        response = requests.get(
            f"{BASE_URL}/api/drones",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Drones list: {len(data)} drones")


class TestRobots:
    """Robots CRUD API tests"""
    
    def test_create_robot(self, admin_token):
        """Test creating a robot"""
        robot_data = {
            "name": "TEST_Robot_Desherbage_01",
            "type": "desherbage",
            "model": "AgriBot Pro",
            "serial_number": "TEST-ROBOT-001",
            "status": "disponible",
            "battery_level": 100
        }
        response = requests.post(
            f"{BASE_URL}/api/robots",
            json=robot_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert "id" in data
        print(f"✓ Robot created: {data.get('name', 'N/A')}")
        return data.get("id")
    
    def test_get_robots(self, admin_token):
        """Test getting all robots"""
        response = requests.get(
            f"{BASE_URL}/api/robots",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Robots list: {len(data)} robots")


class TestAIFeatures:
    """AI Features API tests - Weather Prediction, Satellite Analysis"""
    
    def test_ai_weather_prediction(self, admin_token):
        """Test AI weather prediction"""
        response = requests.get(
            f"{BASE_URL}/api/ai/weather-prediction/Abidjan",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "location" in data or "prediction" in data or "forecast" in data
        print(f"✓ AI Weather prediction: {data}")
    
    def test_ai_satellite_analysis(self, admin_token):
        """Test AI satellite analysis"""
        response = requests.get(
            f"{BASE_URL}/api/ai/satellite-analysis/test-parcel-001",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ AI Satellite analysis: {data}")


class TestAlertsAI:
    """AI Alerts generation tests"""
    
    def test_generate_ai_alerts(self, admin_token):
        """Test generating AI alerts"""
        response = requests.post(
            f"{BASE_URL}/api/alerts/generate-ai",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ AI Alerts generated: {data}")
    
    def test_get_alerts(self, admin_token):
        """Test getting alerts"""
        response = requests.get(
            f"{BASE_URL}/api/alerts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Alerts list: {len(data)} alerts")


class TestCurrency:
    """Currency conversion API tests"""
    
    def test_currency_convert(self, admin_token):
        """Test currency conversion"""
        response = requests.get(
            f"{BASE_URL}/api/currency/convert?amount=1000&from_currency=XAF&to_currency=USD",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "converted_amount" in data or "result" in data or "amount" in data
        print(f"✓ Currency conversion: {data}")


class TestAnalytics:
    """Analytics API tests"""
    
    def test_get_analytics_metrics(self, admin_token):
        """Test getting analytics metrics"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/metrics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Analytics metrics: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
