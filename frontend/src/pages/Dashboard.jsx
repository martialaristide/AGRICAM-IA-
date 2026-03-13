import React, { useEffect, useState } from "react";
import { getDashboardStats, getParcels, getAlerts } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Zap, Droplets, Thermometer, AlertTriangle, 
  MapPin, TrendingUp, Clock
} from "lucide-react";
import { cn } from "../lib/utils";
import WeatherWidget from "../components/WeatherWidget";

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
      case "critique": return "border-l-red-500 bg-red-900/10";
      case "warning": return "border-l-amber-500 bg-amber-900/10";
      case "info": return "border-l-blue-500 bg-blue-900/10";
      default: return "border-l-slate-500 bg-slate-800/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="dashboard-page">
      {/* Header with Weather */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-dashboard rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold font-[Manrope] mb-2">
            Bienvenue sur AGRICAM <span className="text-emerald-400">IA</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Votre assistant intelligent pour l'agriculture de precision
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400/80">
            <Zap className="h-4 w-4" />
            <span>Systeme operationnel - {stats?.active_sensors || 0} capteurs actifs</span>
          </div>
        </div>
        <WeatherWidget lat={3.848} lon={11.5021} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Parcelles actives", value: stats?.parcels_count || 0, unit: "parcelles", icon: MapPin, color: "emerald", trend: "+8%", testId: "stat-parcels" },
          { label: "Humidite moyenne", value: stats?.average_humidity || 0, unit: "%", icon: Droplets, color: "blue", trend: "+12%", testId: "stat-humidity" },
          { label: "Temperature moyenne", value: stats?.average_temperature || 0, unit: "C", icon: Thermometer, color: "orange", testId: "stat-temperature" },
          { label: "Alertes actives", value: stats?.active_alerts || 0, unit: "alertes", icon: AlertTriangle, color: "red", testId: "stat-alerts" },
        ].map((stat) => (
          <Card key={stat.testId} className="glass-card card-hover" data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-600 mt-1">{stat.unit}</p>
                </div>
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center",
                  stat.color === "emerald" && "bg-emerald-900/30 ring-1 ring-emerald-500/20",
                  stat.color === "blue" && "bg-blue-900/30 ring-1 ring-blue-500/20",
                  stat.color === "orange" && "bg-orange-900/30 ring-1 ring-orange-500/20",
                  stat.color === "red" && "bg-red-900/30 ring-1 ring-red-500/20"
                )}>
                  <stat.icon className={cn("h-7 w-7",
                    stat.color === "emerald" && "text-emerald-400",
                    stat.color === "blue" && "text-blue-400",
                    stat.color === "orange" && "text-orange-400",
                    stat.color === "red" && "text-red-400"
                  )} />
                </div>
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-3 text-emerald-400 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stat.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Parcels and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card" data-testid="parcels-status">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-lg font-semibold text-white">Etat des parcelles</CardTitle>
            <Zap className="h-5 w-5 text-amber-400" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {parcels.map((parcel) => (
              <div key={parcel.id}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-emerald-500/20 transition-all"
                data-testid={`parcel-${parcel.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{parcel.name}</h4>
                    <p className="text-sm text-slate-500">{parcel.crop_type} - {parcel.area_hectares} ha</p>
                  </div>
                  <Badge className={cn("text-white", getStatusColor(parcel.status))}>
                    {getStatusLabel(parcel.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    <span>{parcel.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span>{parcel.temperature}C</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card" data-testid="recent-alerts">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-lg font-semibold text-white">Alertes recentes</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-900/30 flex items-center justify-center ring-1 ring-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {alerts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucune alerte</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id}
                  className={cn("p-4 rounded-xl border-l-4 transition-colors", getAlertColor(alert.priority))}
                  data-testid={`alert-${alert.id}`}>
                  <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                  <p className="text-sm text-slate-400">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
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
