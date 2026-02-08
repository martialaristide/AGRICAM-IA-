import React, { useEffect, useState } from "react";
import { getIrrigationSystems, getIrrigationStats, controlIrrigation, getParcels } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Droplets, TrendingUp, Clock, Zap, Plus,
  Pause, Square, Settings, Calendar, Brain,
  Play, AlertTriangle, CheckCircle, Activity,
  Gauge, Thermometer, RefreshCw, Video, Wifi,
  MapPin, Power, Eye, BarChart3, Cloud
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const IrrigationAuto = () => {
  const [systems, setSystems] = useState([]);
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    name: "",
    parcel_id: "",
    mode: "auto",
    min_humidity: 40,
    max_humidity: 80,
    water_volume_liters: 500,
    schedule_enabled: false,
    schedule_times: ["06:00", "18:00"]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [systemsRes, statsRes, parcelsRes] = await Promise.all([
        getIrrigationSystems(),
        getIrrigationStats(),
        getParcels()
      ]);
      setSystems(systemsRes.data);
      setStats(statsRes.data);
      setParcels(parcelsRes.data);
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
      const messages = {
        start: "Irrigation démarrée - Arrosage en cours",
        pause: "Irrigation en pause",
        stop: "Irrigation arrêtée"
      };
      toast.success(messages[action] || "Action effectuée");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du contrôle de l'irrigation");
    }
  };

  const handleManualTrigger = async (systemId, liters) => {
    try {
      await api.post(`/irrigation/${systemId}/manual-trigger`, { liters });
      toast.success(`Arrosage manuel déclenché: ${liters}L`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors du déclenchement manuel");
    }
  };

  const handleAddSystem = async () => {
    if (!config.name || !config.parcel_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Simulated - would call API
    const newSystem = {
      id: `irr_${Date.now()}`,
      name: config.name,
      parcel_id: config.parcel_id,
      parcel_name: parcels.find(p => p.id === config.parcel_id)?.name || "Non défini",
      status: "arrete",
      mode: config.mode,
      current_humidity: 0,
      target_humidity_min: config.min_humidity,
      target_humidity_max: config.max_humidity,
      water_used_today_liters: 0,
      efficiency_percent: 0,
      zones: []
    };

    setSystems([...systems, newSystem]);
    toast.success(`Système "${config.name}" ajouté avec succès`);
    setShowConfigDialog(false);
    setConfig({
      name: "",
      parcel_id: "",
      mode: "auto",
      min_humidity: 40,
      max_humidity: 80,
      water_volume_liters: 500,
      schedule_enabled: false,
      schedule_times: ["06:00", "18:00"]
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-emerald-100 text-emerald-700 gap-1"><Activity className="h-3 w-3" /> Actif</Badge>;
      case "pause":
        return <Badge className="bg-amber-100 text-amber-700 gap-1"><Pause className="h-3 w-3" /> Pause</Badge>;
      case "arrete":
        return <Badge className="bg-slate-100 text-slate-600 gap-1"><Square className="h-3 w-3" /> Arrêté</Badge>;
      case "maintenance":
        return <Badge className="bg-rose-100 text-rose-700 gap-1"><AlertTriangle className="h-3 w-3" /> Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNetworkHealth = (system) => {
    // Simulated network health check
    const issues = [];
    if (system.efficiency_percent < 70) issues.push("Efficacité faible");
    if (system.status === "maintenance") issues.push("Maintenance requise");
    return {
      healthy: issues.length === 0,
      issues
    };
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Irrigation Intelligente</h1>
            </div>
            <p className="text-white/80">Gestion automatisée de l'arrosage basée sur l'IA et les capteurs IoT</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <ActionTooltip content="Ajouter et configurer un nouveau système d'irrigation">
                <DialogTrigger asChild>
                  <Button className="bg-white text-cyan-600 hover:bg-white/90" data-testid="add-irrigation-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau système
                  </Button>
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-cyan-600" />
                    Configurer un système d'irrigation
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom du système *</Label>
                    <Input
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      placeholder="Ex: Irrigation Zone Nord"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Parcelle associée *</Label>
                    <select
                      value={config.parcel_id}
                      onChange={(e) => setConfig({ ...config, parcel_id: e.target.value })}
                      className="w-full h-10 px-3 border rounded-md"
                    >
                      <option value="">Sélectionner une parcelle</option>
                      {parcels.map(parcel => (
                        <option key={parcel.id} value={parcel.id}>
                          {parcel.name} - {parcel.crop_type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mode de fonctionnement</Label>
                    <select
                      value={config.mode}
                      onChange={(e) => setConfig({ ...config, mode: e.target.value })}
                      className="w-full h-10 px-3 border rounded-md"
                    >
                      <option value="auto">Automatique (IA)</option>
                      <option value="schedule">Programmé</option>
                      <option value="manual">Manuel</option>
                    </select>
                  </div>

                  <div className="bg-cyan-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-cyan-600" />
                      <h4 className="font-semibold">Seuils d'humidité</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Minimum (%)</Label>
                        <Input
                          type="number"
                          value={config.min_humidity}
                          onChange={(e) => setConfig({ ...config, min_humidity: parseInt(e.target.value) })}
                          min={0}
                          max={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum (%)</Label>
                        <Input
                          type="number"
                          value={config.max_humidity}
                          onChange={(e) => setConfig({ ...config, max_humidity: parseInt(e.target.value) })}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      L'irrigation se déclenche automatiquement quand l'humidité passe sous le seuil minimum
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Volume d'eau par cycle (litres)</Label>
                    <Input
                      type="number"
                      value={config.water_volume_liters}
                      onChange={(e) => setConfig({ ...config, water_volume_liters: parseInt(e.target.value) })}
                      min={0}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddSystem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le système
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <ActionTooltip content="Actualiser les données d'irrigation">
              <Button 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActionTooltip content="Systèmes d'irrigation actuellement en fonctionnement">
          <Card className="card-hover cursor-help">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.active_systems || 0}</p>
                  <p className="text-sm text-slate-500">Systèmes actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Volume total d'eau utilisé aujourd'hui">
          <Card className="card-hover cursor-help">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.water_used_today || 0}</p>
                  <p className="text-sm text-slate-500">Litres aujourd'hui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Efficacité moyenne de l'irrigation (eau absorbée vs eau utilisée)">
          <Card className="card-hover cursor-help">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.average_efficiency || 0}%</p>
                  <p className="text-sm text-slate-500">Efficacité moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Économies d'eau réalisées grâce à l'irrigation intelligente">
          <Card className="card-hover cursor-help">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.water_saved_percent || 0}%</p>
                  <p className="text-sm text-slate-500">Eau économisée</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((system) => {
          const networkHealth = getNetworkHealth(system);
          
          return (
            <Card key={system.id} className="overflow-hidden" data-testid={`irrigation-system-${system.id}`}>
              <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">{system.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
                      <MapPin className="h-4 w-4" />
                      {system.parcel_name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(system.status)}
                    {networkHealth.healthy ? (
                      <Badge className="bg-emerald-500 text-white gap-1">
                        <CheckCircle className="h-3 w-3" /> Réseau OK
                      </Badge>
                    ) : (
                      <ActionTooltip content={networkHealth.issues.join(", ")}>
                        <Badge className="bg-rose-500 text-white gap-1 cursor-help">
                          <AlertTriangle className="h-3 w-3" /> Alerte réseau
                        </Badge>
                      </ActionTooltip>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Current Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <ActionTooltip content="Niveau d'humidité actuel du sol">
                    <div className="text-center p-3 bg-blue-50 rounded-xl cursor-help">
                      <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-700">{system.current_humidity || 0}%</p>
                      <p className="text-xs text-slate-500">Humidité</p>
                    </div>
                  </ActionTooltip>
                  <ActionTooltip content="Volume d'eau utilisé aujourd'hui">
                    <div className="text-center p-3 bg-cyan-50 rounded-xl cursor-help">
                      <Activity className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-cyan-700">{system.water_used_today_liters || 0}L</p>
                      <p className="text-xs text-slate-500">Utilisé</p>
                    </div>
                  </ActionTooltip>
                  <ActionTooltip content="Efficacité du système (eau absorbée par les plantes)">
                    <div className="text-center p-3 bg-emerald-50 rounded-xl cursor-help">
                      <Gauge className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-emerald-700">{system.efficiency_percent || 0}%</p>
                      <p className="text-xs text-slate-500">Efficacité</p>
                    </div>
                  </ActionTooltip>
                </div>

                {/* Humidity Range */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Plage d'humidité cible</span>
                    <span className="text-sm text-slate-500">
                      {system.target_humidity_min || 40}% - {system.target_humidity_max || 80}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-blue-500 rounded-full"
                      style={{ 
                        left: `${system.target_humidity_min || 40}%`, 
                        width: `${(system.target_humidity_max || 80) - (system.target_humidity_min || 40)}%` 
                      }}
                    />
                    <div 
                      className="absolute h-full w-1 bg-slate-800 rounded-full transform -translate-x-1/2"
                      style={{ left: `${system.current_humidity || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Zones */}
                {system.zones && system.zones.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Zones d'irrigation</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {system.zones.map((zone, idx) => (
                        <ActionTooltip key={idx} content={`Zone ${zone.name}: ${zone.status}`}>
                          <div className={cn(
                            "p-2 rounded-lg text-sm flex items-center gap-2",
                            zone.status === "actif" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
                          )}>
                            {zone.status === "actif" ? (
                              <Droplets className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            {zone.name}
                          </div>
                        </ActionTooltip>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Prediction */}
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-violet-600" />
                    <h4 className="font-semibold text-violet-800">Prédiction IA AGRICAM</h4>
                  </div>
                  <p className="text-sm text-violet-700">
                    {system.current_humidity < (system.target_humidity_min || 40) 
                      ? "Les plantes auront besoin d'eau dans les 2 prochaines heures. Arrosage automatique recommandé."
                      : system.current_humidity > (system.target_humidity_max || 80)
                      ? "Niveau d'humidité optimal. Pas d'arrosage nécessaire avant demain."
                      : "Conditions optimales. Prochain arrosage prévu dans 6-8 heures."}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-violet-600">
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Météo: Ensoleillé
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      28°C prévu
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-2">
                  {system.status !== "actif" ? (
                    <ActionTooltip content="Démarrer l'irrigation automatique">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleControl(system.id, "start")}
                        data-testid={`start-irrigation-${system.id}`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer
                      </Button>
                    </ActionTooltip>
                  ) : (
                    <>
                      <ActionTooltip content="Mettre l'irrigation en pause">
                        <Button 
                          variant="outline"
                          className="text-amber-600 border-amber-300 hover:bg-amber-50"
                          onClick={() => handleControl(system.id, "pause")}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip content="Arrêter complètement l'irrigation">
                        <Button 
                          variant="outline"
                          className="text-rose-600 border-rose-300 hover:bg-rose-50"
                          onClick={() => handleControl(system.id, "stop")}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Arrêter
                        </Button>
                      </ActionTooltip>
                    </>
                  )}
                  <ActionTooltip content="Déclencher un arrosage manuel de 100 litres">
                    <Button 
                      variant="outline"
                      onClick={() => handleManualTrigger(system.id, 100)}
                    >
                      <Droplets className="h-4 w-4 mr-2" />
                      Manuel (100L)
                    </Button>
                  </ActionTooltip>
                  <ActionTooltip content="Programmer les horaires d'arrosage">
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Programmer
                    </Button>
                  </ActionTooltip>
                  <ActionTooltip content="Voir le flux vidéo des caméras d'irrigation">
                    <Button variant="outline">
                      <Video className="h-4 w-4" />
                    </Button>
                  </ActionTooltip>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Info Card */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-cyan-800">Système d'Irrigation IA AGRICAM</h3>
              <p className="text-cyan-700 mt-1">
                Notre IA analyse en temps réel les données des capteurs, la météo et l'état des plantes pour:
              </p>
              <ul className="mt-2 text-sm text-cyan-600 space-y-1">
                <li>• Détecter automatiquement les besoins en eau de chaque zone</li>
                <li>• Prédire la consommation optimale pour éviter le gaspillage</li>
                <li>• Identifier les défaillances du réseau avant qu'elles ne causent des dégâts</li>
                <li>• Ajuster l'arrosage selon les prévisions météo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IrrigationAuto;
