"""
Test cases for AGRICAM IA Agremo-style API endpoints
Tests plant counting, prescription maps, weed/pest detection, reports, exports, spray missions
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAgremoPlantCounting:
    """Test plant counting API endpoints"""
    
    def test_get_crop_types(self):
        """GET /api/agremo/plant-counting/crop-types should return list of supported crops"""
        response = requests.get(f"{BASE_URL}/api/agremo/plant-counting/crop-types")
        assert response.status_code == 200
        data = response.json()
        assert "crops" in data
        assert len(data["crops"]) >= 10  # Should have at least 10 crop types
        # Verify crop structure
        crop = data["crops"][0]
        assert "id" in crop
        assert "name" in crop
        assert "optimal_density" in crop
    
    def test_plant_counting_mais(self):
        """POST /api/agremo/plant-counting should count plants for maize field"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/plant-counting",
            json={
                "field_id": "TEST-FIELD-001",
                "area_hectares": 10,
                "crop_type": "mais"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Verify response structure
        assert data["field_id"] == "TEST-FIELD-001"
        assert data["analysis_type"] == "plant_counting"
        assert "accuracy" in data
        assert data["accuracy"] == 98.3  # Expected Agremo accuracy
        # Verify results
        results = data["results"]
        assert "total_plants" in results
        assert "plants_per_hectare" in results
        assert "germination_rate" in results
        assert "density_status" in results
        assert results["crop_type"] == "mais"
        assert results["area_hectares"] == 10.0
        # Verify zones
        assert "zones" in data
        assert len(data["zones"]) > 0
        # Verify yield estimate
        assert "yield_estimate" in data
        assert "estimated_yield_tonnes" in data["yield_estimate"]
    
    def test_plant_counting_ble(self):
        """POST /api/agremo/plant-counting should work for wheat (blé)"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/plant-counting",
            json={
                "field_id": "TEST-FIELD-002",
                "area_hectares": 5,
                "crop_type": "ble"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["results"]["crop_type"] == "ble"
        # Wheat has higher density than maize
        assert data["results"]["plants_per_hectare"] > 100000


class TestAgremoPrescriptionMap:
    """Test prescription map generation API"""
    
    def test_generate_prescription_map_herbicide(self):
        """POST /api/agremo/prescription-map should generate prescription map"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/prescription-map",
            json={
                "field_id": "TEST-FIELD-001",
                "area_hectares": 10,
                "product_type": "herbicide",
                "full_dose": 3.0,
                "reduced_dose": 1.5
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert data["field_id"] == "TEST-FIELD-001"
        assert "prescription_id" in data
        assert data["product_type"] == "herbicide"
        # Verify zones
        assert "zones" in data
        assert len(data["zones"]) == 9  # 3x3 grid
        # Verify summary
        summary = data["summary"]
        assert "total_area_ha" in summary
        assert "savings_percentage" in summary
        assert "cost_savings_estimate_fcfa" in summary
        # Verify equipment compatibility
        assert "compatible_equipment" in data
        assert len(data["compatible_equipment"]) > 0
    
    def test_get_prescription_products(self):
        """GET /api/agremo/prescription-map/products should return available products"""
        response = requests.get(f"{BASE_URL}/api/agremo/prescription-map/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        categories = [p["category"] for p in data["products"]]
        assert "herbicides" in categories
        assert "insecticides" in categories


class TestAgremoWeedPestDetection:
    """Test weed and pest detection API"""
    
    def test_detect_weeds_pests(self):
        """POST /api/agremo/weed-pest-detection should detect weeds and pests"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/weed-pest-detection",
            json={
                "field_id": "TEST-FIELD-001",
                "area_hectares": 10
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert data["field_id"] == "TEST-FIELD-001"
        assert data["analysis_type"] == "weed_pest_detection"
        assert "detection_accuracy" in data
        # Verify weeds data
        assert "weeds" in data
        weeds = data["weeds"]
        assert "detected_count" in weeds
        assert "infestation_level" in weeds
        assert weeds["infestation_level"] in ["minimal", "light", "moderate", "severe"]
        # Verify pests data
        assert "pests" in data
        pests = data["pests"]
        assert "detected_count" in pests
        assert "estimated_total_yield_loss" in pests
        # Verify recommendations
        assert "treatment_recommendations" in data
        assert "urgency" in data


class TestAgremoWeeklyReport:
    """Test weekly health report generation"""
    
    def test_generate_weekly_report(self):
        """POST /api/agremo/weekly-report should generate health report"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/weekly-report",
            json={
                "field_id": "TEST-FIELD-001",
                "field_name": "Parcelle Test",
                "area_hectares": 10,
                "crop_type": "mais"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert "report_id" in data
        assert data["field_id"] == "TEST-FIELD-001"
        assert data["field_name"] == "Parcelle Test"
        # Verify summary
        summary = data["summary"]
        assert "health_status" in summary
        assert summary["health_status"] in ["excellent", "good", "moderate", "poor"]
        assert "overall_score" in summary
        # Verify vegetation data
        vegetation = data["vegetation"]
        assert "current_ndvi" in vegetation
        assert "previous_ndvi" in vegetation
        assert "ndvi_trend" in vegetation
        assert "biomass_estimate_kg_ha" in vegetation
        # Verify stress indicators
        stress = data["stress_indicators"]
        assert "water_stress" in stress
        assert "nutrient_stress" in stress
        assert "disease_pressure" in stress
        # Verify next_report_date exists and is valid ISO format
        assert "next_report_date" in data
        # Should be 7 days in the future
        next_report = datetime.fromisoformat(data["next_report_date"].replace("Z", "+00:00"))
        report_date = datetime.fromisoformat(data["report_date"].replace("Z", "+00:00"))
        delta = (next_report - report_date).days
        assert delta == 7


class TestAgremoExport:
    """Test export functionality"""
    
    def test_get_export_formats(self):
        """GET /api/agremo/export-formats should return available formats"""
        response = requests.get(f"{BASE_URL}/api/agremo/export-formats")
        assert response.status_code == 200
        data = response.json()
        assert "formats" in data
        format_ids = [f["id"] for f in data["formats"]]
        assert "pdf" in format_ids
        assert "shp" in format_ids
        assert "kml" in format_ids
        assert "geojson" in format_ids
        assert "csv" in format_ids
    
    def test_export_pdf(self):
        """POST /api/agremo/export should export as PDF"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/export",
            json={
                "report_data": {"type": "analysis", "date": "2026-02-27"},
                "format": "pdf"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "export_id" in data
        assert data["format"] == "pdf"
        assert data["status"] == "completed"
        assert "download_url" in data
        assert "pages" in data  # PDF specific
    
    def test_export_shapefile(self):
        """POST /api/agremo/export should export as Shapefile"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/export",
            json={
                "report_data": {"type": "prescription"},
                "format": "shp"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "shp"
        assert "included_files" in data  # Shapefile specific
        assert "coordinate_system" in data


class TestAgremoSprayMission:
    """Test spray mission creation"""
    
    def test_get_equipment(self):
        """GET /api/agremo/equipment should return compatible equipment"""
        response = requests.get(f"{BASE_URL}/api/agremo/equipment")
        assert response.status_code == 200
        data = response.json()
        assert "drones" in data
        assert "tractors" in data
        assert "controllers" in data
        # Verify drones
        assert len(data["drones"]) >= 3
        drone = data["drones"][0]
        assert "model" in drone
        assert "type" in drone
        assert "tank_l" in drone
    
    def test_create_spray_mission_drone(self):
        """POST /api/agremo/spray-mission should create a drone mission"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/spray-mission",
            json={
                "field_id": "TEST-FIELD-001",
                "prescription_id": "RX-TEST-001",
                "equipment_type": "drone",
                "equipment_model": "DJI AGRAS T40",
                "operator_name": "Test Operator",
                "scheduled_date": "2026-03-01"
            }
        )
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert "mission_id" in data
        assert data["field_id"] == "TEST-FIELD-001"
        assert data["status"] == "scheduled"
        # Verify equipment
        equipment = data["equipment"]
        assert equipment["type"] == "drone"
        assert equipment["model"] == "DJI AGRAS T40"
        assert "specs" in equipment
        # Verify flight plan
        flight_plan = data["flight_plan"]
        assert "waypoints_count" in flight_plan
        assert "total_distance_km" in flight_plan
        assert "estimated_duration_minutes" in flight_plan
        # Verify integration
        assert data["integration_ready"] == True
        assert "export_formats" in data
    
    def test_create_spray_mission_tractor(self):
        """POST /api/agremo/spray-mission should create a tractor mission"""
        response = requests.post(
            f"{BASE_URL}/api/agremo/spray-mission",
            json={
                "field_id": "TEST-FIELD-001",
                "prescription_id": "RX-TEST-002",
                "equipment_type": "tractor",
                "equipment_model": "John Deere R4045",
                "operator_name": "Tractor Operator",
                "scheduled_date": "2026-03-02"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["equipment"]["model"] == "John Deere R4045"


class TestAgremoHealthCheck:
    """Basic health check for Agremo endpoints"""
    
    def test_api_health(self):
        """Health check endpoint should be healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


# Fixture for pytest
@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session
