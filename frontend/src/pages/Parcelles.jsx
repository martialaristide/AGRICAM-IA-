import React, { useEffect, useState } from "react";
import { getParcels } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Droplets, Thermometer, MapPin, Calendar, FlaskConical } from "lucide-react";
import { cn } from "../lib/utils";

const Parcelles = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await getParcels();
        setParcels(response.data);
      } catch (error) {
        console.error("Error fetching parcels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "excellent":
        return { label: "EXCELLENT", color: "bg-emerald-500" };
      case "bon":
        return { label: "BON", color: "bg-blue-500" };
      case "attention":
        return { label: "ATTENTION", color: "bg-amber-500" };
      default:
        return { label: status, color: "bg-slate-500" };
    }
  };

  const getCardGradient = (status) => {
    switch (status) {
      case "excellent":
        return "bg-gradient-to-br from-emerald-600 to-teal-600";
      case "bon":
        return "bg-gradient-to-br from-emerald-700 to-emerald-600";
      case "attention":
        return "bg-gradient-to-br from-emerald-800 to-teal-700";
      default:
        return "bg-gradient-to-br from-emerald-600 to-teal-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="parcelles-page">
      {/* Header */}
      <div className="gradient-parcels rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">Gestion des parcelles</h1>
        <p className="text-white/80">Vue d'ensemble de vos {parcels.length} parcelles agricoles</p>
      </div>

      {/* Parcels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parcels.map((parcel) => {
          const statusConfig = getStatusConfig(parcel.status);
          return (
            <Card 
              key={parcel.id} 
              className="overflow-hidden card-hover"
              data-testid={`parcel-card-${parcel.id}`}
            >
              {/* Card Header with Gradient */}
              <div className={cn(
                "p-6 text-white relative",
                getCardGradient(parcel.status)
              )}>
                <Badge className={cn(
                  "absolute top-4 left-4 text-white font-semibold",
                  statusConfig.color
                )}>
                  {statusConfig.label}
                </Badge>
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold font-[Manrope]">{parcel.name}</h3>
                  <p className="text-white/80 mt-1">
                    {parcel.crop_type} • {parcel.area_hectares} hectares
                  </p>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Humidity & Temperature */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Humidité</p>
                      <p className="text-xl font-bold text-blue-700">{parcel.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-slate-500">Température</p>
                      <p className="text-xl font-bold text-orange-700">{parcel.temperature}°C</p>
                    </div>
                  </div>
                </div>

                {/* Soil Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-semibold text-slate-700">Analyse du sol</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Nitrogen */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Azote (N)</span>
                        <span className="font-semibold">{parcel.soil_analysis.nitrogen}/100</span>
                      </div>
                      <Progress 
                        value={parcel.soil_analysis.nitrogen} 
                        className="h-2 bg-slate-100"
                      />
                    </div>

                    {/* Phosphorus */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Phosphore (P)</span>
                        <span className="font-semibold">{parcel.soil_analysis.phosphorus}/100</span>
                      </div>
                      <Progress 
                        value={parcel.soil_analysis.phosphorus} 
                        className="h-2 bg-slate-100 [&>div]:bg-blue-500"
                      />
                    </div>

                    {/* Potassium */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Potassium (K)</span>
                        <span className="font-semibold">{parcel.soil_analysis.potassium}/100</span>
                      </div>
                      <Progress 
                        value={parcel.soil_analysis.potassium} 
                        className="h-2 bg-slate-100 [&>div]:bg-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* pH and Planting Date */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FlaskConical className="h-4 w-4 text-violet-500" />
                    <span>pH du sol</span>
                    <span className="font-semibold text-slate-900">{parcel.soil_analysis.ph}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>Planté le</span>
                  <span className="font-semibold">{parcel.planting_date}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Parcelles;
