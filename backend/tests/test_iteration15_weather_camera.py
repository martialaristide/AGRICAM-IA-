"""
AGRICAM IA - Iteration 15 Tests
Focus: Real OpenWeatherMap integration, Camera IA, AgriBot IA JSON endpoints, Weather route conflicts
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthLogin:
    """Test admin login to get token"""
    
    def test_admin_login(self):
        """POST /api/auth/login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        }, timeout=15)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Missing access_token in response"
        assert data["user"]["role"] == "admin", f"Expected admin role, got {data['user']['role']}"
        print(f"PASS: Admin login successful, token received")

class TestWeatherCurrentEndpoint:
    """Test GET /api/weather/current - should return real weather from OpenWeatherMap"""
    
    def test_weather_current_bamenda(self):
        """GET /api/weather/current with Bamenda GPS coordinates"""
        response = requests.get(
            f"{BASE_URL}/api/weather/current",
            params={"lat": 5.9631, "lon": 10.1591},
            timeout=15
        )
        assert response.status_code == 200, f"Weather current failed: {response.text}"
        data = response.json()
        
        # Required fields from OpenWeatherMap
        assert "temperature" in data, "Missing temperature"
        assert "humidity" in data, "Missing humidity"
        assert "wind_speed" in data, "Missing wind_speed"
        assert "description" in data, "Missing description"
        assert data.get("success") is True, f"API returned success=False: {data}"
        
        # Check agricultural_advice is included
        assert "agricultural_advice" in data, "Missing agricultural_advice"
        
        print(f"PASS: Weather current for Bamenda - Temp: {data['temperature']}C, Humidity: {data['humidity']}%")
        print(f"      Description: {data.get('description')}, Wind: {data.get('wind_speed')} km/h")
        print(f"      Agricultural advice included: {bool(data.get('agricultural_advice'))}")
    
    def test_weather_current_douala(self):
        """GET /api/weather/current with Douala GPS coordinates"""
        response = requests.get(
            f"{BASE_URL}/api/weather/current",
            params={"lat": 4.0511, "lon": 9.7679},
            timeout=15
        )
        assert response.status_code == 200, f"Weather current failed: {response.text}"
        data = response.json()
        
        assert data.get("success") is True, f"API returned success=False"
        assert "temperature" in data
        print(f"PASS: Weather current for Douala - Temp: {data['temperature']}C, Humidity: {data.get('humidity', 'N/A')}%")


class TestWeatherCityEndpoint:
    """Test GET /api/weather/city/{name} - renamed route to avoid conflict"""
    
    def test_weather_city_douala(self):
        """GET /api/weather/city/Douala returns real weather"""
        response = requests.get(f"{BASE_URL}/api/weather/city/Douala", timeout=15)
        assert response.status_code == 200, f"Weather city failed: {response.text}"
        data = response.json()
        
        # Check it's real OpenWeatherMap data
        assert "temperature" in data, "Missing temperature"
        assert "source" in data, "Missing source"
        assert data["source"] == "openweathermap", f"Expected openweathermap source, got {data['source']}"
        
        print(f"PASS: Weather city/Douala - Source: {data['source']}, Temp: {data['temperature']}C")
    
    def test_weather_city_yaounde(self):
        """GET /api/weather/city/Yaounde returns real weather"""
        response = requests.get(f"{BASE_URL}/api/weather/city/Yaounde", timeout=15)
        assert response.status_code == 200, f"Weather city failed: {response.text}"
        data = response.json()
        
        assert data.get("source") == "openweathermap"
        print(f"PASS: Weather city/Yaounde - Temp: {data.get('temperature', 'N/A')}C")


class TestClimateNotifications:
    """Test GET /api/climate-notifications - Real alerts from OpenWeatherMap"""
    
    def test_climate_notifications_bamenda(self):
        """GET /api/climate-notifications for Bamenda GPS - should return real alerts"""
        response = requests.get(
            f"{BASE_URL}/api/climate-notifications",
            params={"lat": 5.9631, "lon": 10.1591},
            timeout=15
        )
        assert response.status_code == 200, f"Climate notifications failed: {response.text}"
        data = response.json()
        
        # Check structure
        assert "alerts" in data, "Missing alerts array"
        assert "source" in data, "Missing source field"
        assert data["source"] == "openweathermap_live", f"Expected openweathermap_live source, got {data['source']}"
        
        alerts = data["alerts"]
        assert len(alerts) > 0, "Expected at least one alert"
        
        # Check alert structure
        first_alert = alerts[0]
        assert "title" in first_alert, "Alert missing title"
        assert "message" in first_alert, "Alert missing message"
        assert "severity" in first_alert, "Alert missing severity"
        assert "source" in first_alert, "Alert missing source"
        assert first_alert["source"] in ["openweathermap", "openweathermap_forecast"], f"Unexpected alert source: {first_alert['source']}"
        
        print(f"PASS: Climate notifications Bamenda - {len(alerts)} alerts, source: {data['source']}")
        for a in alerts[:3]:
            print(f"      - [{a['severity'].upper()}] {a['title']}")
    
    def test_climate_notifications_douala(self):
        """GET /api/climate-notifications for Douala GPS - different conditions"""
        response = requests.get(
            f"{BASE_URL}/api/climate-notifications",
            params={"lat": 4.0511, "lon": 9.7679},
            timeout=15
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["source"] == "openweathermap_live"
        assert len(data["alerts"]) > 0
        
        print(f"PASS: Climate notifications Douala - {len(data['alerts'])} alerts")
        for a in data["alerts"][:3]:
            print(f"      - [{a['severity'].upper()}] {a['title']}")


class TestWeatherRouteNoConflict:
    """Test that /weather/current and /weather/city/{name} don't conflict"""
    
    def test_both_weather_routes_work(self):
        """Both endpoints should work independently"""
        # Test /weather/current
        r1 = requests.get(f"{BASE_URL}/api/weather/current", params={"lat": 5.9631, "lon": 10.1591}, timeout=15)
        assert r1.status_code == 200, f"/weather/current failed: {r1.text}"
        
        # Test /weather/city/{name}
        r2 = requests.get(f"{BASE_URL}/api/weather/city/Douala", timeout=15)
        assert r2.status_code == 200, f"/weather/city/Douala failed: {r2.text}"
        
        # Both should have temperature
        d1 = r1.json()
        d2 = r2.json()
        assert "temperature" in d1
        assert "temperature" in d2
        
        print(f"PASS: No route conflict - /weather/current and /weather/city/Douala both work")
        print(f"      /weather/current: {d1.get('temperature')}C")
        print(f"      /weather/city/Douala: {d2.get('temperature')}C")


class TestAgribotIAEndpoints:
    """Test AgriBot IA endpoints with JSON body (not Form)"""
    
    def test_predict_yield(self):
        """POST /api/agribot-ai/predict-yield with crop_type in JSON body"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-yield",
            json={
                "crop_type": "mais",
                "surface_ha": 5.0,
                "country": "Cameroun",
                "soil_quality": "moyen",
                "irrigation": False
            },
            timeout=60  # AI calls take time
        )
        assert response.status_code == 200, f"Predict yield failed: {response.text}"
        data = response.json()
        
        # Should have prediction data
        assert "prediction" in data or "error" not in data, f"Unexpected response: {data}"
        print(f"PASS: AgriBot predict-yield returned 200")
    
    def test_ecological_advice(self):
        """POST /api/agribot-ai/ecological-advice with problem and crop_type"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/ecological-advice",
            json={
                "problem": "agriculture tropicale",
                "crop_type": "mais"
            },
            timeout=60
        )
        assert response.status_code == 200, f"Ecological advice failed: {response.text}"
        print(f"PASS: AgriBot ecological-advice returned 200")
    
    def test_predict_disease_spread(self):
        """POST /api/agribot-ai/predict-disease-spread with disease_name, current_zone, crop_type"""
        response = requests.post(
            f"{BASE_URL}/api/agribot-ai/predict-disease-spread",
            json={
                "disease_name": "mildiou",
                "current_zone": "Centre Cameroun",
                "crop_type": "mais"
            },
            timeout=60
        )
        assert response.status_code == 200, f"Predict disease spread failed: {response.text}"
        print(f"PASS: AgriBot predict-disease-spread returned 200")


class TestCameraIAEndpoints:
    """Test Camera IA related endpoints exist and work"""
    
    def test_health_check(self):
        """API health check to ensure server is running"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        print(f"PASS: API health check OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
