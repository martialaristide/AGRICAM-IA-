"""
AGRICAM IA - Phase 1 Features Backend Tests
Tests for: Weather API, Zone Analysis API, Leads API
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://drone-analytics-3.preview.emergentagent.com')

class TestWeatherAPI:
    """Weather API endpoint tests"""
    
    def test_weather_current_default_location(self):
        """Test weather API with default location (Yaoundé)"""
        response = requests.get(f"{BASE_URL}/api/weather/current")
        assert response.status_code == 200
        
        data = response.json()
        # Weather API should return temperature data
        assert "temperature" in data or "success" in data
        if "temperature" in data:
            assert isinstance(data["temperature"], (int, float))
        
    def test_weather_current_custom_location(self):
        """Test weather API with custom coordinates"""
        response = requests.get(
            f"{BASE_URL}/api/weather/current",
            params={"lat": 5.9631, "lon": 10.1591, "lang": "fr"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "temperature" in data or "success" in data
        
    def test_weather_forecast(self):
        """Test weather forecast API"""
        response = requests.get(
            f"{BASE_URL}/api/weather/forecast",
            params={"lat": 3.848, "lon": 11.5021}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should return forecast data, success status, or simulated data
        # Note: Weather API may return simulated data as fallback
        assert "forecasts" in data or "success" in data or "source" in data


class TestZoneAnalysisAPI:
    """Zone Analysis API endpoint tests (Agremo-style)"""
    
    def test_zone_analysis_types(self):
        """Test getting available analysis types"""
        response = requests.get(f"{BASE_URL}/api/zones/analysis-types")
        assert response.status_code == 200
        
        data = response.json()
        assert "types" in data
        assert len(data["types"]) >= 6  # ndvi, stress, disease, humidity, thermal, crop_health
        
        # Verify expected analysis types
        type_ids = [t["id"] for t in data["types"]]
        assert "ndvi" in type_ids
        assert "stress" in type_ids
        assert "disease" in type_ids
        
    def test_zone_analyze_ndvi(self):
        """Test zone analysis with NDVI"""
        payload = {
            "zone_id": "test-zone-ndvi",
            "coordinates": [
                {"lat": 5.9631, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1601},
                {"lat": 5.9631, "lng": 10.1601}
            ],
            "analysis_types": ["ndvi"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/zones/analyze",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "zone_id" in data
        assert data["zone_id"] == "test-zone-ndvi"
        assert "analyses" in data
        assert "ndvi" in data["analyses"]
        
        # Verify NDVI data structure
        ndvi = data["analyses"]["ndvi"]
        assert "mean_ndvi" in ndvi
        assert 0 <= ndvi["mean_ndvi"] <= 1
        
    def test_zone_analyze_multiple_types(self):
        """Test zone analysis with multiple analysis types"""
        payload = {
            "zone_id": "test-zone-multi",
            "coordinates": [
                {"lat": 5.9631, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1601},
                {"lat": 5.9631, "lng": 10.1601}
            ],
            "analysis_types": ["ndvi", "stress", "disease", "humidity"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/zones/analyze",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "analyses" in data
        assert "ndvi" in data["analyses"]
        assert "stress" in data["analyses"]
        assert "disease" in data["analyses"]
        assert "humidity" in data["analyses"]
        
        # Verify overall score and recommendations
        assert "overall_score" in data
        assert "recommendations" in data
        
    def test_zone_analyze_stress_detection(self):
        """Test stress zone detection"""
        payload = {
            "zone_id": "test-zone-stress",
            "coordinates": [
                {"lat": 5.9631, "lng": 10.1591},
                {"lat": 5.9651, "lng": 10.1591},
                {"lat": 5.9651, "lng": 10.1611},
                {"lat": 5.9631, "lng": 10.1611}
            ],
            "analysis_types": ["stress"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/zones/analyze",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "analyses" in data
        assert "stress" in data["analyses"]
        
        stress = data["analyses"]["stress"]
        assert "overall_stress_level" in stress
        assert "stress_zones" in stress
        
    def test_zone_analyze_disease_detection(self):
        """Test disease detection analysis"""
        payload = {
            "zone_id": "test-zone-disease",
            "coordinates": [
                {"lat": 5.9631, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1591},
                {"lat": 5.9641, "lng": 10.1601},
                {"lat": 5.9631, "lng": 10.1601}
            ],
            "analysis_types": ["disease"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/zones/analyze",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "analyses" in data
        assert "disease" in data["analyses"]
        
        disease = data["analyses"]["disease"]
        assert "diseases_detected" in disease
        assert "detections" in disease


class TestLeadsAPI:
    """Leads capture API endpoint tests"""
    
    def test_create_lead_success(self):
        """Test creating a new lead"""
        import time
        unique_email = f"test_{int(time.time())}@example.com"
        
        payload = {
            "full_name": "Test User Phase1",
            "email": unique_email,
            "phone": "+237652646824",
            "source": "test_suite",
            "accepted_privacy": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "lead_id" in data
        
    def test_create_lead_missing_fields(self):
        """Test lead creation with missing required fields"""
        payload = {
            "email": "incomplete@example.com"
            # Missing full_name and phone
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=payload
        )
        # Should return validation error
        assert response.status_code == 422
        
    def test_create_lead_duplicate_email(self):
        """Test lead creation with duplicate email"""
        import time
        unique_email = f"duplicate_{int(time.time())}@example.com"
        
        payload = {
            "full_name": "First User",
            "email": unique_email,
            "phone": "+237652646824",
            "source": "test_suite"
        }
        
        # Create first lead
        response1 = requests.post(f"{BASE_URL}/api/leads", json=payload)
        assert response1.status_code == 200
        
        # Try to create duplicate
        payload["full_name"] = "Second User"
        response2 = requests.post(f"{BASE_URL}/api/leads", json=payload)
        
        # Should handle duplicate gracefully (either 200 with message or 400)
        assert response2.status_code in [200, 400]
        
    def test_get_leads_list(self):
        """Test getting leads list"""
        response = requests.get(f"{BASE_URL}/api/leads")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


class TestHealthAndBasicEndpoints:
    """Basic health and endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
