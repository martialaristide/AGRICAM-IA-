import React, { useEffect, useState } from "react";
import { getDroneMissions, getDroneStats, controlDroneMission } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Plane, Calendar, Clock, Wind, MapPin, 
  Play, Settings, Pause, Square, Camera, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const GestionDrones = () => {
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [missionsRes, statsRes] = await Promise.all([
        getDroneMissions(),
        getDroneStats()
      ]);
      setMissions(missionsRes.data);
      setStats(statsRes.data);
      if (missionsRes.data.length > 0 && !selectedMission) {
        setSelectedMission(missionsRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching drone data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (missionId, action) => {
    try {
      await controlDroneMission(missionId, action);
      toast.success(`Mission ${action === 'start' ? 'démarrée' : action === 'complete' ? 'terminée' : action}`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du contrôle de la mission");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "planifie":
        return <Badge className="bg-blue-100 text-blue-700">Planifié</Badge>;
      case "en_cours":
        return <Badge className="bg-amber-100 text-amber-700">En cours</Badge>;
      case "termine":
        return <Badge className="bg-emerald-100 text-emerald-700">Terminé</Badge>;
      case "echoue":
        return <Badge className="bg-rose-100 text-rose-700">Échoué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="drones-page">
      {/* Header */}
      <div className="gradient-drones rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Plane className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Gestion des Drones</h1>
        </div>
        <p className="text-white/80">Planification et contrôle des vols automatisés</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Plane className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.active_drones || 0}</p>
                <p className="text-sm text-slate-500">Drones actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.planned_missions || 0}</p>
                <p className="text-sm text-slate-500">Missions planifiées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.images_captured || 0}</p>
                <p className="text-sm text-slate-500">Images capturées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_efficiency || 0}%</p>
                <p className="text-sm text-slate-500">Efficacité moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions List */}
        <Card data-testid="missions-list">
          <CardHeader>
            <CardTitle className="text-lg">Missions de vol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer",
                  selectedMission?.id === mission.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                onClick={() => setSelectedMission(mission)}
                data-testid={`mission-${mission.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{mission.name}</h4>
                  {getStatusBadge(mission.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{mission.parcel_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{mission.duration_minutes}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="h-4 w-4 text-slate-400" />
                    <span>{mission.progress_percent}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-4 w-4 text-slate-400" />
                    <span>{mission.weather_conditions} - Vent {mission.wind_speed_kmh}km/h</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {mission.status === "planifie" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={(e) => { e.stopPropagation(); handleControl(mission.id, "start"); }}
                      data-testid={`start-mission-${mission.id}`}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    data-testid={`config-mission-${mission.id}`}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Map & Details */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <Card data-testid="flight-map">
            <CardHeader>
              <CardTitle className="text-lg">Carte des vols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-slate-200">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Carte interactive des trajectoires</p>
                  <p className="text-sm text-slate-500">Visualisation en temps réel des vols</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Details */}
          {selectedMission && (
            <Card data-testid="flight-details">
              <CardHeader>
                <CardTitle className="text-lg">Détails du vol sélectionné</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Altitude:</span>
                    <span className="font-semibold">{selectedMission.altitude_meters}m</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Vitesse:</span>
                    <span className="font-semibold">{selectedMission.speed_mps} m/s</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Intervalle capture:</span>
                    <span className="font-semibold">{selectedMission.capture_interval_seconds}s</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Date prévue:</span>
                    <span className="font-semibold">{selectedMission.scheduled_date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Mission Section */}
      <div className="gradient-ai-analysis rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Planifier une nouvelle mission</h3>
        <p className="text-white/80 mb-4">
          Configurez et planifiez une nouvelle mission de surveillance drone
        </p>
        <Button 
          variant="secondary" 
          className="bg-white text-violet-600 hover:bg-slate-100"
          data-testid="new-mission-btn"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Nouvelle mission
        </Button>
      </div>
    </div>
  );
};

export default GestionDrones;
