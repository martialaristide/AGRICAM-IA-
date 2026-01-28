import React, { useEffect, useState } from "react";
import { getIrrigationSystems, getIrrigationStats, controlIrrigation } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Droplets, TrendingUp, Clock, Zap, 
  Pause, Square, Settings, Calendar, Brain
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const IrrigationAuto = () => {
  const [systems, setSystems] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [systemsRes, statsRes] = await Promise.all([
        getIrrigationSystems(),
        getIrrigationStats()
      ]);
      setSystems(systemsRes.data);
      setStats(statsRes.data);
      if (systemsRes.data.length > 0) {
        setSelectedSystem(systemsRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching irrigation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (systemId, action) => {
    try {
      await controlIrrigation(systemId, action);
      toast.success(`Irrigation ${action === 'start' ? 'activée' : action === 'pause' ? 'en pause' : 'arrêtée'}`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du contrôle de l'irrigation");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-emerald-100 text-emerald-700">Actif</Badge>;
      case "pause":
        return <Badge className="bg-amber-100 text-amber-700">Pause</Badge>;
      case "arrete":
        return <Badge className="bg-slate-100 text-slate-600">Arrêté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="irrigation-page">
      {/* Header */}
      <div className="gradient-irrigation rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Système d'Irrigation Automatisé</h1>
        </div>
        <p className="text-white/80">Gestion intelligente de l'arrosage basée sur l'IA et les capteurs IoT</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.active_systems || 0}</p>
                <p className="text-sm text-slate-500">Systèmes actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_efficiency || 0}%</p>
                <p className="text-sm text-slate-500">Efficacité moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.water_used_today || 0}L</p>
                <p className="text-sm text-slate-500">Eau utilisée aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">24/7</p>
                <p className="text-sm text-slate-500">Surveillance auto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Systems List */}
        <Card data-testid="irrigation-systems">
          <CardHeader>
            <CardTitle className="text-lg">Systèmes d'irrigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systems.map((system) => (
              <div
                key={system.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer",
                  selectedSystem?.id === system.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                onClick={() => setSelectedSystem(system)}
                data-testid={`system-${system.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{system.parcel_name}</h4>
                  <div className="flex gap-2">
                    {getStatusBadge(system.status)}
                    {system.is_automatic && (
                      <Badge className="bg-violet-100 text-violet-700">Automatique</Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{system.water_used_today_liters}L utilisés</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>{system.efficiency_percent}% efficacité</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{system.zones?.length || 0} zones</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Zap className="h-4 w-4 text-violet-500" />
                    <span>Temps réel</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {system.status === "actif" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600"
                        onClick={(e) => { e.stopPropagation(); handleControl(system.id, "pause"); }}
                        data-testid={`pause-${system.id}`}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={(e) => { e.stopPropagation(); handleControl(system.id, "stop"); }}
                        data-testid={`stop-${system.id}`}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Arrêter
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    data-testid={`config-${system.id}`}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Zones Details */}
        <Card data-testid="irrigation-zones">
          <CardHeader>
            <CardTitle className="text-lg">Zones d'irrigation</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSystem?.zones && selectedSystem.zones.length > 0 ? (
              <div className="space-y-3">
                {selectedSystem.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 bg-slate-50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">{zone.name}</h4>
                      <p className="text-sm text-slate-500">{zone.water_used_liters}L utilisés</p>
                    </div>
                    <Badge className={zone.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {zone.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Droplets className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>Sélectionnez un système pour voir les détails des zones</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Section */}
      <div className="gradient-irrigation rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Intelligence d'irrigation</h3>
        <p className="text-white/80 mb-4">
          Système automatisé basé sur l'IA, les prévisions météo et les données des capteurs IoT
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white/20 text-white">
            <Brain className="h-3 w-3 mr-1" />
            IA prédictive
          </Badge>
          <Badge className="bg-white/20 text-white">Météo intégrée</Badge>
          <Badge className="bg-white/20 text-white">Optimisation continue</Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-white text-cyan-600 hover:bg-slate-100" data-testid="program-btn">
            <Calendar className="h-4 w-4 mr-2" />
            Programmer
          </Button>
          <Button variant="secondary" className="bg-white text-cyan-600 hover:bg-slate-100" data-testid="configure-btn">
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IrrigationAuto;
