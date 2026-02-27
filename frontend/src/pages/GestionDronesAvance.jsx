import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Plane, Play, Pause, Square, Home, Camera, Video, Settings,
  Wifi, WifiOff, Battery, Navigation, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, RotateCcw, RotateCw, Plus, Trash2,
  MapPin, Calendar, Zap, AlertTriangle, Eye, Radio, Target,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import DroneVideoStream from "../components/DroneVideoStream";

const GestionDronesAvance = () => {
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [missions, setMissions] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [controlling, setControlling] = useState(false);

  useEffect(() => {
    fetchDrones();
  }, []);

  useEffect(() => {
    if (selectedDrone) {
      fetchTelemetry(selectedDrone.id);
      fetchMissions(selectedDrone.id);
      
      // Polling télémétrie
      const interval = setInterval(() => fetchTelemetry(selectedDrone.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedDrone?.id]);

  const fetchDrones = async () => {
    try {
      const response = await api.get("/drones");
      setDrones(response.data);
      if (response.data.length > 0 && !selectedDrone) {
        setSelectedDrone(response.data[0]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des drones");
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetry = async (droneId) => {
    try {
      const response = await api.get(`/drones/${droneId}/telemetry`);
      setTelemetry(response.data);
    } catch (error) {
      console.error("Erreur télémétrie:", error);
    }
  };

  const fetchMissions = async (droneId) => {
    try {
      const response = await api.get(`/drones/${droneId}/missions`);
      setMissions(response.data);
    } catch (error) {
      console.error("Erreur missions:", error);
    }
  };

  const handleConnectWifi = async (droneId) => {
    const ssid = prompt("Nom du réseau WiFi (SSID):");
    const password = prompt("Mot de passe WiFi:");
    
    if (!ssid) return;

    try {
      await api.post(`/drones/${droneId}/connect-wifi`, {
        wifi_ssid: ssid,
        wifi_password: password || ""
      });
      toast.success("Drone connecté au WiFi !");
      fetchDrones();
    } catch (error) {
      toast.error("Erreur de connexion WiFi");
    }
  };

  const handleDisconnectWifi = async (droneId) => {
    try {
      await api.post(`/drones/${droneId}/disconnect-wifi`);
      toast.info("Drone déconnecté");
      fetchDrones();
    } catch (error) {
      toast.error("Erreur de déconnexion");
    }
  };

  const handlePilot = async (command, parameters = {}) => {
    if (!selectedDrone) return;
    
    setControlling(true);
    try {
      const response = await api.post(`/drones/${selectedDrone.id}/pilot`, {
        command,
        parameters
      });
      toast.success(response.data.message);
      fetchTelemetry(selectedDrone.id);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de pilotage");
    } finally {
      setControlling(false);
    }
  };

  const handleAddDrone = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await api.post("/drones", {
        name: formData.get("name"),
        type: formData.get("type"),
        model: formData.get("model"),
        cameras: formData.get("cameras").split(",").map(c => c.trim()),
        max_flight_time_min: parseInt(formData.get("max_flight_time"))
      });
      toast.success("Drone ajouté !");
      setShowAddDialog(false);
      fetchDrones();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteDrone = async (droneId) => {
    if (!confirm("Supprimer ce drone ?")) return;
    
    try {
      await api.delete(`/drones/${droneId}`);
      toast.success("Drone supprimé");
      fetchDrones();
      if (selectedDrone?.id === droneId) {
        setSelectedDrone(null);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleProgramMission = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await api.post(`/drones/${selectedDrone.id}/missions`, {
        name: formData.get("mission_name"),
        type: formData.get("mission_type"),
        altitude_m: parseFloat(formData.get("altitude")),
        speed_mps: parseFloat(formData.get("speed")),
        capture_interval_seconds: parseInt(formData.get("capture_interval")),
        waypoints: [],
        auto_return: true
      });
      toast.success("Mission programmée !");
      setShowMissionDialog(false);
      fetchMissions(selectedDrone.id);
    } catch (error) {
      toast.error("Erreur lors de la programmation");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      offline: "bg-slate-400",
      connecting: "bg-amber-500 animate-pulse",
      connected: "bg-blue-500",
      ready: "bg-emerald-500",
      flying: "bg-violet-500 animate-pulse",
      returning: "bg-amber-500",
      charging: "bg-yellow-500"
    };
    return colors[status] || "bg-slate-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="drones-avance-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Plane className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Gestion des Drones</h1>
            </div>
            <p className="text-white/80">Configuration, pilotage et programmation de vols</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white text-violet-600 hover:bg-white/90 mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un drone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau drone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDrone} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du drone</Label>
                  <Input name="name" required placeholder="Ex: AgriDrone 3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select name="type" className="w-full p-2 border rounded-lg">
                      <option value="agriculture">Agriculture</option>
                      <option value="surveillance">Surveillance</option>
                      <option value="mapping">Cartographie</option>
                      <option value="multispectral">Multispectral</option>
                      <option value="thermal">Thermique</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Modèle</Label>
                    <Input name="model" required placeholder="Ex: DJI Agras T40" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Caméras (séparées par virgule)</Label>
                    <Input name="cameras" placeholder="RGB 4K, Thermal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temps de vol max (min)</Label>
                    <Input name="max_flight_time" type="number" defaultValue="30" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Ajouter le drone</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Drone List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Mes Drones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className={cn(
                  "p-3 rounded-xl border-2 cursor-pointer transition-all",
                  selectedDrone?.id === drone.id
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                onClick={() => setSelectedDrone(drone)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{drone.name}</span>
                  <Badge className={cn("text-white", getStatusColor(drone.status))}>
                    {drone.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{drone.model}</span>
                  <span className="flex items-center gap-1">
                    <Battery className="h-3 w-3" /> {drone.battery_percent}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {drone.wifi_connected ? (
                    <Button size="sm" variant="ghost" className="h-7 text-emerald-600" onClick={(e) => { e.stopPropagation(); handleDisconnectWifi(drone.id); }}>
                      <Wifi className="h-3 w-3 mr-1" /> Connecté
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-slate-400" onClick={(e) => { e.stopPropagation(); handleConnectWifi(drone.id); }}>
                      <WifiOff className="h-3 w-3 mr-1" /> Connecter
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-rose-600" onClick={(e) => { e.stopPropagation(); handleDeleteDrone(drone.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {drones.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucun drone configuré</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Piloting & Control */}
        {selectedDrone && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-violet-600" />
                  Pilotage - {selectedDrone.name}
                </CardTitle>
                {selectedDrone.wifi_connected && (
                  <Badge className="bg-emerald-500 text-white">
                    <Radio className="h-3 w-3 mr-1 animate-pulse" /> En ligne
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedDrone.wifi_connected ? (
                <div className="space-y-6">
                  {/* Control Pad */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handlePilot("move_up", { distance_m: 5 })}
                      disabled={controlling}
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handlePilot("rotate_left", { degrees: 45 })}
                      disabled={controlling}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button 
                      className="h-14 bg-violet-600 hover:bg-violet-700" 
                      onClick={() => handlePilot("hover")}
                      disabled={controlling}
                    >
                      <Target className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handlePilot("rotate_right", { degrees: 45 })}
                      disabled={controlling}
                    >
                      <RotateCw className="h-5 w-5" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handlePilot("move_down", { distance_m: 5 })}
                      disabled={controlling}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                    <div></div>
                  </div>

                  {/* Direction Pad */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    <div></div>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("move_forward", { distance_m: 10, speed_mps: 5 })}
                      disabled={controlling}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("move_left", { distance_m: 10 })}
                      disabled={controlling}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("move_backward", { distance_m: 10 })}
                      disabled={controlling}
                    >
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("move_right", { distance_m: 10 })}
                      disabled={controlling}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => handlePilot("takeoff", { altitude_m: 10 })}
                      disabled={controlling}
                    >
                      <Play className="h-4 w-4 mr-1" /> Décoller
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("land")}
                      disabled={controlling}
                    >
                      <Square className="h-4 w-4 mr-1" /> Atterrir
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePilot("return_home")}
                      disabled={controlling}
                    >
                      <Home className="h-4 w-4 mr-1" /> Base
                    </Button>
                    <Button 
                      className="bg-rose-600 hover:bg-rose-700" 
                      onClick={() => handlePilot("emergency_stop")}
                      disabled={controlling}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" /> URGENCE
                    </Button>
                  </div>

                  {/* Camera Controls */}
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => handlePilot("capture_photo")} disabled={controlling}>
                      <Camera className="h-4 w-4 mr-1" /> Photo
                    </Button>
                    <Button variant="outline" onClick={() => handlePilot("start_video")} disabled={controlling}>
                      <Video className="h-4 w-4 mr-1" /> Vidéo
                    </Button>
                    <Button variant="outline" onClick={() => handlePilot("scan_area")} disabled={controlling}>
                      <Eye className="h-4 w-4 mr-1" /> Scanner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <WifiOff className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Drone non connecté</p>
                  <p className="text-sm">Connectez le drone au WiFi pour le piloter</p>
                  <Button className="mt-4" onClick={() => handleConnectWifi(selectedDrone.id)}>
                    <Wifi className="h-4 w-4 mr-2" /> Connecter au WiFi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Telemetry */}
        {selectedDrone && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Télémétrie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {telemetry ? (
                <>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Altitude</p>
                    <p className="text-2xl font-bold text-violet-600">{telemetry.altitude_m} m</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Vitesse</p>
                    <p className="text-2xl font-bold text-blue-600">{telemetry.speed_mps} m/s</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Cap</p>
                    <p className="text-xl font-bold">{telemetry.heading_degrees}°</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Batterie</span>
                      <span>{telemetry.battery_percent}%</span>
                    </div>
                    <Progress value={telemetry.battery_percent} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Signal WiFi</span>
                    <span className="font-semibold">{telemetry.wifi_signal}%</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="text-slate-500">Position GPS</p>
                    <p className="font-mono text-xs">
                      {telemetry.position?.lat?.toFixed(6)}, {telemetry.position?.lng?.toFixed(6)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>Données non disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missions */}
      {selectedDrone && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Missions Programmées
              </CardTitle>
              <Dialog open={showMissionDialog} onOpenChange={setShowMissionDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Nouvelle mission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Programmer une mission</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProgramMission} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom de la mission</Label>
                      <Input name="mission_name" required placeholder="Ex: Surveillance parcelle Nord" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <select name="mission_type" className="w-full p-2 border rounded-lg">
                          <option value="survey">Surveillance</option>
                          <option value="spray">Pulvérisation</option>
                          <option value="mapping">Cartographie</option>
                          <option value="monitor">Monitoring</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Altitude (m)</Label>
                        <Input name="altitude" type="number" defaultValue="50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vitesse (m/s)</Label>
                        <Input name="speed" type="number" defaultValue="8" />
                      </div>
                      <div className="space-y-2">
                        <Label>Intervalle capture (s)</Label>
                        <Input name="capture_interval" type="number" defaultValue="3" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Programmer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {missions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {missions.map((mission) => (
                  <div key={mission.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{mission.name}</h4>
                    <p className="text-sm text-slate-500">{mission.type}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{mission.altitude_m}m</Badge>
                      <Badge variant="outline">{mission.speed_mps}m/s</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucune mission programmée</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Drone Video Stream */}
      {selectedDrone && (
        <DroneVideoStream droneId={selectedDrone.id} droneName={selectedDrone.name || "AgriDrone"} />
      )}
    </div>
  );
};

export default GestionDronesAvance;
