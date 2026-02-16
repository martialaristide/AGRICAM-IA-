import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Cloud, Sun, CloudRain, Wind, Droplets, 
  Thermometer, Eye, Sunrise, Sunset, RefreshCw,
  CloudSnow, CloudLightning, CloudFog
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";

const WeatherWidget = ({ lat = 3.848, lon = 11.5021, compact = false, className }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/weather/current?lat=${lat}&lon=${lon}`);
      if (response.data.success) {
        setWeather(response.data);
        setError(null);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError("Impossible de charger la météo");
      // Use mock data as fallback
      setWeather({
        success: true,
        location: "Yaoundé",
        country: "CM",
        temperature: 28,
        feels_like: 31,
        humidity: 75,
        pressure: 1013,
        wind_speed: 12,
        description: "Partiellement nuageux",
        icon: "02d",
        clouds: 40
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Refresh every 10 min
    return () => clearInterval(interval);
  }, [lat, lon]);

  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return <Cloud className="h-8 w-8" />;
    
    const iconMap = {
      "01": <Sun className="h-8 w-8 text-yellow-500" />,
      "02": <Cloud className="h-8 w-8 text-slate-400" />,
      "03": <Cloud className="h-8 w-8 text-slate-500" />,
      "04": <Cloud className="h-8 w-8 text-slate-600" />,
      "09": <CloudRain className="h-8 w-8 text-blue-500" />,
      "10": <CloudRain className="h-8 w-8 text-blue-400" />,
      "11": <CloudLightning className="h-8 w-8 text-yellow-600" />,
      "13": <CloudSnow className="h-8 w-8 text-blue-200" />,
      "50": <CloudFog className="h-8 w-8 text-slate-400" />
    };
    
    return iconMap[iconCode.substring(0, 2)] || <Cloud className="h-8 w-8" />;
  };

  if (loading && !weather) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="h-20 bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2", className)}>
        {weather && (
          <>
            {getWeatherIcon(weather.icon)}
            <div>
              <div className="text-lg font-bold">{weather.temperature}°C</div>
              <div className="text-xs opacity-80">{weather.location}</div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}%</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg">{weather?.location || "Chargement..."}</h3>
            <p className="text-sm opacity-80">{weather?.country}</p>
          </div>
          <button 
            onClick={fetchWeather} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
        
        {weather && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-4xl font-bold">{weather.temperature}°C</div>
                <div className="text-sm opacity-80">Ressenti {weather.feels_like}°C</div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium capitalize">{weather.description}</p>
              <p className="text-sm opacity-80">Nuages: {weather.clouds}%</p>
            </div>
          </div>
        )}
      </div>
      
      {weather && (
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <div className="text-sm font-medium">{weather.humidity}%</div>
              <div className="text-xs text-slate-500">Humidité</div>
            </div>
            <div>
              <Wind className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
              <div className="text-sm font-medium">{weather.wind_speed} km/h</div>
              <div className="text-xs text-slate-500">Vent</div>
            </div>
            <div>
              <Thermometer className="h-5 w-5 mx-auto text-orange-500 mb-1" />
              <div className="text-sm font-medium">{weather.pressure} hPa</div>
              <div className="text-xs text-slate-500">Pression</div>
            </div>
            <div>
              <Eye className="h-5 w-5 mx-auto text-violet-500 mb-1" />
              <div className="text-sm font-medium">{weather.visibility || 10} km</div>
              <div className="text-xs text-slate-500">Visibilité</div>
            </div>
          </div>
          
          {weather.advice && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-medium text-emerald-800 mb-1">Conseil agricole</h4>
              <p className="text-sm text-emerald-700">{weather.advice[0]}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default WeatherWidget;
