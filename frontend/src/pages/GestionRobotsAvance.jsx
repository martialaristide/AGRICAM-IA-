import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Bot, Play, Pause, Square, Home, Scan, Box, Camera, 
  Wifi, WifiOff, Battery, Navigation, Plus, Trash2,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw,
  Zap, AlertTriangle, Settings, Radio, Activity, Target,
  Droplets, Leaf, Eye, CheckCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const GestionRobotsAvance = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [controlling, setControlling] = useState(false);

  useEffect(() => {
    fetchRobots();
  }, []);

  useEffect(() => {
    if (selectedRobot) {
      fetchTelemetry(selectedRobot.id);
      fetch3DMap(selectedRobot.id);
      
      const interval = setInterval(() => fetchTelemetry(selectedRobot.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRobot?.id]);

  const fetchRobots = async () => {
    try {
      const response = await api.get("/robots");
      setRobots(response.data);
      if (response.data.length > 0 && !selectedRobot) {
        setSelectedRobot(response.data[0]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des robots");
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetry = async (robotId) => {
    try {
      const response = await api.get(`/robots/${robotId}/telemetry`);
      setTelemetry(response.data);
    } catch (error) {
      console.error("Erreur télémétrie:", error);
    }
  };

  const fetch3DMap = async (robotId) => {
    try {
      const response = await api.get(`/robot/${robotId}/3d-map`);
      setMapData(response.data);
    } catch (error) {
      console.error("Erreur 3D map:", error);
    }
  };

  const handleConnectWifi = async (robotId) => {
    const ssid = prompt("Nom du réseau WiFi (SSID):");
    const password = prompt("Mot de passe WiFi:");
    
    if (!ssid) return;

    try {
      await api.post(`/robots/${robotId}/connect-wifi`, {
        wifi_ssid: ssid,
        wifi_password: password || ""
      });
      toast.success("Robot connecté au WiFi !");
      fetchRobots();
    } catch (error) {
      toast.error("Erreur de connexion WiFi");
    }
  };

  const handleDisconnectWifi = async (robotId) => {
    try {
      await api.post(`/robots/${robotId}/disconnect-wifi`);
      toast.info("Robot déconnecté");
      fetchRobots();
    } catch (error) {
      toast.error("Erreur de déconnexion");
    }
  };

  const handleControl = async (action, parameters = {}) => {
    if (!selectedRobot) return;
    
    setControlling(true);
    try {
      const response = await api.post(`/robots/${selectedRobot.id}/control`, {
        action,
        parameters
      });
      toast.success(response.data.message);
      fetchTelemetry(selectedRobot.id);
      
      if (action === "scan_area" || action === "capture_3d") {
        setTimeout(() => fetch3DMap(selectedRobot.id), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de contrôle");
    } finally {
      setControlling(false);
    }
  };

  const handleAddRobot = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await api.post("/robots", {
        name: formData.get("name"),
        type: formData.get("type"),
        model: formData.get("model"),
        tools: formData.get("tools").split(",").map(t => t.trim())
      });
      toast.success("Robot ajouté !");
      setShowAddDialog(false);
      fetchRobots();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteRobot = async (robotId) => {
    if (!confirm("Supprimer ce robot ?")) return;
    
    try {
      await api.delete(`/robots/${robotId}`);
      toast.success("Robot supprimé");
      fetchRobots();
      if (selectedRobot?.id === robotId) {
        setSelectedRobot(null);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      offline: "bg-slate-400",
      connecting: "bg-amber-500 animate-pulse",
      connected: "bg-blue-500",
      idle: "bg-emerald-500",
      working: "bg-violet-500 animate-pulse",
      paused: "bg-amber-500",
      charging: "bg-yellow-500",
      maintenance: "bg-orange-500",
      error: "bg-rose-500"
    };
    return colors[status] || "bg-slate-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="robots-avance-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Contrôle des Robots</h1>
            </div>
            <p className="text-white/80">Configuration, pilotage et cartographie 3D</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white text-indigo-600 hover:bg-white/90 mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un robot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau robot</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRobot} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du robot</Label>
                  <Input name="name" required placeholder="Ex: AgriBot 3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select name="type" className="w-full p-2 border rounded-lg">
                      <option value="multipurpose">Polyvalent</option>
                      <option value="weeding">Désherbage</option>
                      <option value="spraying">Pulvérisation</option>
                      <option value="harvesting">Récolte</option>
                      <option value="monitoring">Surveillance</option>
                      <option value="seeding">Semis</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Modèle</Label>
                    <Input name="model" required placeholder="Ex: AGRICAM RB-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Outils (séparés par virgule)</Label>
                  <Input name="tools" placeholder="bras_articulé, pulvérisateur, caméra" />
                </div>
                <Button type="submit" className="w-full">Ajouter le robot</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Robot List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Mes Robots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {robots.map((robot) => (
              <div
                key={robot.id}
                className={cn(
                  "p-3 rounded-xl border-2 cursor-pointer transition-all",
                  selectedRobot?.id === robot.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                onClick={() => setSelectedRobot(robot)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{robot.name}</span>
                  <Badge className={cn("text-white", getStatusColor(robot.status))}>
                    {robot.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{robot.type}</span>
                  <span className="flex items-center gap-1">
                    <Battery className="h-3 w-3" /> {robot.battery_percent}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {robot.wifi_connected ? (
                    <Button size="sm" variant="ghost" className="h-7 text-emerald-600" onClick={(e) => { e.stopPropagation(); handleDisconnectWifi(robot.id); }}>
                      <Wifi className="h-3 w-3 mr-1" /> Connecté
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 text-slate-400" onClick={(e) => { e.stopPropagation(); handleConnectWifi(robot.id); }}>
                      <WifiOff className="h-3 w-3 mr-1" /> Connecter
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-rose-600" onClick={(e) => { e.stopPropagation(); handleDeleteRobot(robot.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {robots.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Aucun robot configuré</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Panel */}
        {selectedRobot && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-indigo-600" />
                  Pilotage - {selectedRobot.name}
                </CardTitle>
                {selectedRobot.wifi_connected && (
                  <Badge className="bg-emerald-500 text-white">
                    <Radio className="h-3 w-3 mr-1 animate-pulse" /> En ligne
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedRobot.wifi_connected ? (
                <div className="space-y-6">
                  {/* Movement Controls */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handleControl("move_forward", { distance_m: 1, speed_kmh: 2 })}
                      disabled={controlling}
                    >
                      <ArrowUp className="h-6 w-6" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handleControl("turn_left", { degrees: 45 })}
                      disabled={controlling}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button 
                      className="h-14 bg-indigo-600 hover:bg-indigo-700" 
                      onClick={() => handleControl("stop")}
                      disabled={controlling}
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handleControl("turn_right", { degrees: 45 })}
                      disabled={controlling}
                    >
                      <RotateCw className="h-5 w-5" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="h-14" 
                      onClick={() => handleControl("move_backward", { distance_m: 1 })}
                      disabled={controlling}
                    >
                      <ArrowDown className="h-6 w-6" />
                    </Button>
                    <div></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => handleControl("start", { task: "Mode autonome" })}
                      disabled={controlling}
                    >
                      <Play className="h-4 w-4 mr-1" /> Démarrer
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleControl("pause")}
                      disabled={controlling}
                    >
                      <Pause className="h-4 w-4 mr-1" /> Pause
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleControl("return_home")}
                      disabled={controlling}
                    >
                      <Home className="h-4 w-4 mr-1" /> Base
                    </Button>
                    <Button 
                      className="bg-rose-600 hover:bg-rose-700" 
                      onClick={() => handleControl("emergency_stop")}
                      disabled={controlling}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" /> URGENCE
                    </Button>
                  </div>

                  {/* Task Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={() => handleControl("scan_area")}
                      disabled={controlling}
                    >
                      <Scan className="h-4 w-4 mr-1" /> Scanner
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700" 
                      onClick={() => handleControl("capture_3d")}
                      disabled={controlling}
                    >
                      <Box className="h-4 w-4 mr-1" /> 3D LIDAR
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleControl("take_soil_sample")}
                      disabled={controlling}
                    >
                      <Droplets className="h-4 w-4 mr-1" /> Échantillon
                    </Button>
                  </div>

                  {/* Work Tasks */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline"
                      className="text-emerald-600 border-emerald-300"
                      onClick={() => handleControl("start_weeding")}
                      disabled={controlling}
                    >
                      <Leaf className="h-4 w-4 mr-1" /> Désherber
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-blue-600 border-blue-300"
                      onClick={() => handleControl("start_spraying", { product: "eau", amount_liters: 10 })}
                      disabled={controlling}
                    >
                      <Droplets className="h-4 w-4 mr-1" /> Pulvériser
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-violet-600 border-violet-300"
                      onClick={() => handleControl("patrol")}
                      disabled={controlling}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Patrouille
                    </Button>
                  </div>

                  {/* Mode Switch */}
                  <div className="flex justify-center gap-2">
                    <Button 
                      variant={telemetry?.mode === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleControl("set_mode", { mode: "manual" })}
                    >
                      Mode Manuel
                    </Button>
                    <Button 
                      variant={telemetry?.mode === "autonomous" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleControl("set_mode", { mode: "autonomous" })}
                    >
                      Mode Autonome
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <WifiOff className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Robot non connecté</p>
                  <p className="text-sm">Connectez le robot au WiFi pour le piloter</p>
                  <Button className="mt-4" onClick={() => handleConnectWifi(selectedRobot.id)}>
                    <Wifi className="h-4 w-4 mr-2" /> Connecter au WiFi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Telemetry & Status */}
        {selectedRobot && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                État & Télémétrie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {telemetry ? (
                <>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-slate-500">Tâche actuelle</p>
                    <p className="font-semibold text-indigo-700">{telemetry.current_task}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Mode</p>
                    <p className="font-semibold">{telemetry.mode}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Vitesse</p>
                    <p className="text-xl font-bold text-blue-600">{telemetry.speed_kmh} km/h</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Orientation</p>
                    <p className="font-semibold">{telemetry.orientation?.heading}°</p>
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
                  
                  {/* Sensors Status */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500 mb-2">Capteurs</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(telemetry.sensors || {}).map(([sensor, data]) => (
                        <div 
                          key={sensor}
                          className={cn(
                            "flex items-center gap-1 p-1 rounded text-xs",
                            data?.status === "actif" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100"
                          )}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {sensor.replace("_", " ")}
                        </div>
                      ))}
                    </div>
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

      {/* 3D Map Visualization */}
      {selectedRobot && mapData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-purple-600" />
              Reconstruction 3D - LIDAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl overflow-hidden">
              {/* Grid */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Robot position */}
              <div className="absolute h-4 w-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"
                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
              />

              {/* HUD */}
              <div className="absolute top-4 left-4 text-white text-xs bg-black/40 p-2 rounded">
                <p>Points 3D: {mapData.point_cloud?.total_points?.toLocaleString() || 0}</p>
                <p>Obstacles: {mapData.detected_features?.obstacles?.length || 0}</p>
              </div>

              <div className="absolute bottom-4 left-4 text-white text-xs bg-black/40 p-2 rounded">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-full"></span> Robot</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-500 rounded-full"></span> Obstacle</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GestionRobotsAvance;
