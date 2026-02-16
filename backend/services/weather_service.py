"""
AGRICAM IA - Service Météo Temps Réel
Utilise OpenWeatherMap API
"""

import os
import httpx
from datetime import datetime, timezone
from typing import Dict, Optional

OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
BASE_URL = "https://api.openweathermap.org/data/2.5"

class WeatherService:
    def __init__(self):
        self.api_key = OPENWEATHER_API_KEY
        self.cache = {}
        self.cache_duration = 600  # 10 minutes
    
    async def get_current_weather(self, lat: float, lon: float, lang: str = "fr") -> Dict:
        """Obtenir la météo actuelle pour une position"""
        cache_key = f"{lat:.2f},{lon:.2f}"
        
        # Check cache
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if (datetime.now(timezone.utc) - cached['timestamp']).seconds < self.cache_duration:
                return cached['data']
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{BASE_URL}/weather",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric",
                        "lang": lang
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    result = {
                        "success": True,
                        "location": data.get("name", "Unknown"),
                        "country": data.get("sys", {}).get("country", ""),
                        "temperature": round(data["main"]["temp"], 1),
                        "feels_like": round(data["main"]["feels_like"], 1),
                        "humidity": data["main"]["humidity"],
                        "pressure": data["main"]["pressure"],
                        "wind_speed": round(data["wind"]["speed"] * 3.6, 1),  # Convert m/s to km/h
                        "wind_direction": data["wind"].get("deg", 0),
                        "clouds": data["clouds"]["all"],
                        "visibility": data.get("visibility", 10000) / 1000,  # Convert to km
                        "description": data["weather"][0]["description"].capitalize(),
                        "icon": data["weather"][0]["icon"],
                        "icon_url": f"https://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png",
                        "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"], tz=timezone.utc).isoformat(),
                        "sunset": datetime.fromtimestamp(data["sys"]["sunset"], tz=timezone.utc).isoformat(),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    
                    # Cache result
                    self.cache[cache_key] = {
                        'data': result,
                        'timestamp': datetime.now(timezone.utc)
                    }
                    
                    return result
                else:
                    return {
                        "success": False,
                        "error": f"API Error: {response.status_code}"
                    }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_forecast(self, lat: float, lon: float, lang: str = "fr") -> Dict:
        """Obtenir les prévisions météo sur 5 jours"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{BASE_URL}/forecast",
                    params={
                        "lat": lat,
                        "lon": lon,
                        "appid": self.api_key,
                        "units": "metric",
                        "lang": lang
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    forecasts = []
                    
                    # Group by day
                    daily = {}
                    for item in data["list"]:
                        date = item["dt_txt"].split(" ")[0]
                        if date not in daily:
                            daily[date] = {
                                "date": date,
                                "temp_min": item["main"]["temp_min"],
                                "temp_max": item["main"]["temp_max"],
                                "humidity": item["main"]["humidity"],
                                "description": item["weather"][0]["description"],
                                "icon": item["weather"][0]["icon"],
                                "wind_speed": item["wind"]["speed"] * 3.6,
                                "rain_probability": item.get("pop", 0) * 100
                            }
                        else:
                            daily[date]["temp_min"] = min(daily[date]["temp_min"], item["main"]["temp_min"])
                            daily[date]["temp_max"] = max(daily[date]["temp_max"], item["main"]["temp_max"])
                    
                    return {
                        "success": True,
                        "location": data["city"]["name"],
                        "country": data["city"]["country"],
                        "forecasts": list(daily.values())[:5]
                    }
                else:
                    return {"success": False, "error": f"API Error: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_agricultural_advice(self, weather_data: Dict) -> Dict:
        """Générer des conseils agricoles basés sur la météo"""
        advice = []
        alerts = []
        
        temp = weather_data.get("temperature", 25)
        humidity = weather_data.get("humidity", 50)
        wind_speed = weather_data.get("wind_speed", 0)
        
        # Temperature advice
        if temp > 35:
            alerts.append({
                "type": "danger",
                "message": "Température très élevée - Risque de stress thermique pour les cultures"
            })
            advice.append("Augmentez l'irrigation et protégez les jeunes plants")
        elif temp < 10:
            alerts.append({
                "type": "warning", 
                "message": "Température basse - Risque de gel possible"
            })
            advice.append("Protégez les cultures sensibles au froid")
        elif 20 <= temp <= 30:
            advice.append("Température idéale pour la croissance des cultures")
        
        # Humidity advice
        if humidity > 85:
            alerts.append({
                "type": "warning",
                "message": "Humidité très élevée - Risque de maladies fongiques"
            })
            advice.append("Surveillez les signes de mildiou et de pourriture")
        elif humidity < 30:
            advice.append("Humidité basse - Augmentez la fréquence d'irrigation")
        
        # Wind advice
        if wind_speed > 40:
            alerts.append({
                "type": "danger",
                "message": "Vents forts - Évitez la pulvérisation"
            })
            advice.append("Reportez les traitements phytosanitaires")
        elif wind_speed > 20:
            advice.append("Vent modéré - Conditions moyennes pour la pulvérisation")
        else:
            advice.append("Conditions de vent favorables pour les traitements")
        
        return {
            "alerts": alerts,
            "advice": advice,
            "irrigation_recommendation": "high" if temp > 30 or humidity < 40 else "normal",
            "spray_conditions": "good" if wind_speed < 15 else "poor" if wind_speed > 30 else "moderate"
        }

weather_service = WeatherService()
