import React, { useEffect, useState } from "react";
import { getDashboardStats, getParcels, getAlerts } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Zap, Droplets, Thermometer, AlertTriangle, 
  MapPin, TrendingUp, Clock
} from "lucide-react";
import { cn } from "../lib/utils";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, parcelsRes, alertsRes] = await Promise.all([
          getDashboardStats(),
          getParcels(),
          getAlerts(true)
        ]);
        setStats(statsRes.data);
        setParcels(parcelsRes.data);
        setAlerts(alertsRes.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent": return "bg-emerald-500";
      case "bon": return "bg-blue-500";
      case "attention": return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "excellent": return "Excellent";
      case "bon": return "Bon";
      case "attention": return "Attention";
      default: return status;
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case "critique": return "border-l-red-500 bg-red-50";
      case "warning": return "border-l-amber-500 bg-amber-50";
      case "info": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-slate-500 bg-slate-50";
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
    <div className="space-y-6 animate-slide-in" data-testid="dashboard-page">
      {/* Header */}
      <div className="gradient-dashboard rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold font-[Manrope] mb-2">
          Bienvenue sur AGRICAM IA
        </h1>
        <p className="text-white/80 text-lg">
          Votre assistant intelligent pour l'agriculture de précision
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <Zap className="h-4 w-4" />
          <span>Système opérationnel • {stats?.active_sensors || 0} capteurs actifs</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover" data-testid="stat-parcels">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Parcelles actives</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.parcels_count || 0}</p>
                <p className="text-xs text-slate-500 mt-1">parcelles</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <MapPin className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-emerald-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-humidity">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Humidité moyenne</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_humidity || 0}</p>
                <p className="text-xs text-slate-500 mt-1">%</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Droplets className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-blue-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-temperature">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Température moyenne</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_temperature || 0}</p>
                <p className="text-xs text-slate-500 mt-1">°C</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Thermometer className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-alerts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Alertes actives</p>
                <p className="text-3xl font-bold text-slate-900">{stats?.active_alerts || 0}</p>
                <p className="text-xs text-slate-500 mt-1">alertes</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parcels and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parcels Status */}
        <Card data-testid="parcels-status">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">État des parcelles</CardTitle>
            <Zap className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            {parcels.map((parcel) => (
              <div
                key={parcel.id}
                className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                data-testid={`parcel-${parcel.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{parcel.name}</h4>
                    <p className="text-sm text-slate-500">
                      {parcel.crop_type} • {parcel.area_hectares} ha
                    </p>
                  </div>
                  <Badge className={cn(
                    "text-white",
                    getStatusColor(parcel.status)
                  )}>
                    {getStatusLabel(parcel.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{parcel.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span>{parcel.temperature}°C</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card data-testid="recent-alerts">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Alertes récentes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune alerte</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border-l-4 transition-colors",
                    getAlertColor(alert.priority)
                  )}
                  data-testid={`alert-${alert.id}`}
                >
                  <h4 className="font-semibold text-slate-900 mb-1">{alert.title}</h4>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
