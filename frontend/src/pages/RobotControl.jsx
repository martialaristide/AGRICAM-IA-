import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Bot, Play, Pause, Square, Home, Scan, Box,
  Camera, Radio, Wifi, Battery, Navigation, 
  Eye, Zap, AlertTriangle, CheckCircle, Activity,
  Compass, Wind, Thermometer, Map, Target
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const RobotControl = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [controlling, setControlling] = useState(false);

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const response = await api.get("/robot/status");
      setRobots(response.data);
      if (response.data.length > 0) {
        setSelectedRobot(response.data[0]);
        fetch3DMap(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching robots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetch3DMap = async (robotId) => {
    try {
      const response = await api.get(`/robot/${robotId}/3d-map`);
      setMapData(response.data);
    } catch (error) {
      console.error("Error fetching 3D map:", error);
    }
  };

  const handleControl = async (action) => {
    if (!selectedRobot) return;
    
    setControlling(true);
    try {
      const formData = new FormData();
      formData.append("action", action);
      
      const response = await api.post(`/robot/${selectedRobot.id}/control`, formData);
      toast.success(response.data.message);
      
      // Refresh robot status
      fetchRobots();
      
      // If 3D capture, fetch new map data
      if (action === "capture_3d") {
        setTimeout(() => fetch3DMap(selectedRobot.id), 2000);
      }
    } catch (error) {
      toast.error("Erreur lors du contrôle du robot");
    } finally {
      setControlling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "actif": return "bg-emerald-500";
      case "pause": return "bg-amber-500";
      case "inactif": return "bg-slate-400";
      default: return "bg-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="robot-control-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Contrôle Robot AGRICAM</h1>
            </div>
            <p className="text-white/80">Pilotage et reconstruction 3D de l'environnement agricole</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{robots.length}</p>
              <p className="text-xs">Robots</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{robots.filter(r => r.status === "actif").length}</p>
              <p className="text-xs">Actifs</p>
            </div>
          </div>
        </div>
      </div>

      {selectedRobot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Robot Status Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  {selectedRobot.name}
                </CardTitle>
                <Badge className={cn("text-white", getStatusColor(selectedRobot.status))}>
                  {selectedRobot.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Battery */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Battery className="h-4 w-4" /> Batterie
                  </span>
                  <span className="font-semibold">{selectedRobot.battery_percent}%</span>
                </div>
                <Progress value={selectedRobot.battery_percent} className="h-2" />
              </div>

              {/* WiFi Signal */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Wifi className="h-4 w-4" /> Signal WiFi
                </span>
                <span className="font-semibold text-emerald-600">{selectedRobot.wifi_signal}%</span>
              </div>

              {/* Speed */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Vitesse
                </span>
                <span className="font-semibold">{selectedRobot.speed_kmh} km/h</span>
              </div>

              {/* Mode */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm text-slate-600 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Mode
                </span>
                <Badge className="bg-indigo-100 text-indigo-700">{selectedRobot.mode}</Badge>
              </div>

              {/* Current Task */}
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-slate-500">Tâche actuelle</p>
                <p className="font-semibold text-emerald-700">{selectedRobot.current_task}</p>
              </div>

              {/* Sensors Status */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Capteurs</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedRobot.sensors || {}).map(([sensor, status]) => (
                    <div 
                      key={sensor}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-xs",
                        status === "actif" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {status === "actif" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {sensor.replace("_", " ")}
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <ActionTooltip content="Démarrer le robot en mode autonome">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleControl("start")}
                    disabled={controlling}
                  >
                    <Play className="h-4 w-4 mr-1" /> Démarrer
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Mettre le robot en pause">
                  <Button 
                    variant="outline"
                    onClick={() => handleControl("pause")}
                    disabled={controlling}
                  >
                    <Pause className="h-4 w-4 mr-1" /> Pause
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Arrêter complètement le robot">
                  <Button 
                    variant="outline"
                    className="text-rose-600 border-rose-300"
                    onClick={() => handleControl("stop")}
                    disabled={controlling}
                  >
                    <Square className="h-4 w-4 mr-1" /> Stop
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Retourner à la station de charge">
                  <Button 
                    variant="outline"
                    onClick={() => handleControl("return_home")}
                    disabled={controlling}
                  >
                    <Home className="h-4 w-4 mr-1" /> Base
                  </Button>
                </ActionTooltip>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ActionTooltip content="Scanner la zone environnante">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleControl("scan_area")}
                    disabled={controlling}
                  >
                    <Scan className="h-4 w-4 mr-1" /> Scanner
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Capturer et reconstruire l'environnement 3D">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleControl("capture_3d")}
                    disabled={controlling}
                  >
                    <Box className="h-4 w-4 mr-1" /> 3D
                  </Button>
                </ActionTooltip>
              </div>
            </CardContent>
          </Card>

          {/* 3D Map Visualization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-purple-600" />
                Reconstruction 3D - LIDAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 3D Visualization Placeholder */}
              <div className="relative h-80 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl overflow-hidden">
                {/* Grid overlay */}
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

                {/* Robot position indicator */}
                <div 
                  className="absolute h-4 w-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"
                  style={{ 
                    left: `${(selectedRobot.position?.x || 5) * 10}%`, 
                    top: `${(selectedRobot.position?.y || 5) * 10}%` 
                  }}
                />

                {/* Detected objects */}
                {mapData?.detected_objects?.map((obj, idx) => (
                  obj.positions ? obj.positions.map((pos, posIdx) => (
                    <div 
                      key={`${idx}-${posIdx}`}
                      className={cn(
                        "absolute h-3 w-3 rounded-full",
                        obj.type === "obstacle" ? "bg-rose-500" : 
                        obj.type === "water_source" ? "bg-blue-500" : "bg-emerald-400"
                      )}
                      style={{ left: `${pos[0] * 2}%`, top: `${pos[1] * 2}%` }}
                    />
                  )) : null
                ))}

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 text-white text-xs space-y-1 bg-black/40 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3 w-3" />
                    Position: ({selectedRobot.position?.x.toFixed(2)}, {selectedRobot.position?.y.toFixed(2)})
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="h-3 w-3" />
                    Orientation: {selectedRobot.orientation?.yaw}°
                  </div>
                </div>

                <div className="absolute top-4 right-4 text-white text-xs space-y-1 bg-black/40 p-2 rounded">
                  <div className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> LIDAR Actif
                  </div>
                  <div>Points: {mapData?.points_count?.toLocaleString() || 0}</div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 text-white text-xs bg-black/40 p-2 rounded">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500 rounded-full"></span> Robot</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 bg-rose-500 rounded-full"></span> Obstacle</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-500 rounded-full"></span> Eau</span>
                  </div>
                </div>
              </div>

              {/* Map Data Stats */}
              {mapData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Points 3D</p>
                    <p className="text-xl font-bold text-indigo-700">{(mapData.points_count / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Rang. cultures</p>
                    <p className="text-xl font-bold text-emerald-700">{mapData.detected_objects?.find(o => o.type === "plant_row")?.count || 0}</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Obstacles</p>
                    <p className="text-xl font-bold text-rose-700">{mapData.detected_objects?.find(o => o.type === "obstacle")?.count || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Pente</p>
                    <p className="text-xl font-bold text-blue-700">{mapData.terrain_analysis?.slope_percent}%</p>
                  </div>
                </div>
              )}

              {/* AI Predictions */}
              {mapData?.ai_predictions && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Prédictions IA SARSA</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Chemin dégagé</p>
                      <p className={cn("font-semibold", mapData.ai_predictions.path_clear ? "text-emerald-600" : "text-rose-600")}>
                        {mapData.ai_predictions.path_clear ? "OUI" : "NON"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Risque collision</p>
                      <p className="font-semibold text-amber-600">{mapData.ai_predictions.obstacle_collision_risk}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Vitesse recommandée</p>
                      <p className="font-semibold text-indigo-600">{mapData.ai_predictions.recommended_speed_kmh} km/h</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Feeds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Flux Caméras Robot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["RGB", "Infrarouge", "Multispectral"].map((type, idx) => (
              <div key={type} className="relative h-40 bg-slate-900 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-slate-600" />
                </div>
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                  {type}
                </div>
                <div className="absolute bottom-2 right-2 text-white text-xs bg-black/60 px-2 py-1 rounded">
                  30 FPS
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-indigo-800">Robot Autonome AGRICAM</h3>
              <p className="text-indigo-700 mt-1">
                Notre robot utilise l'algorithme SARSA pour une navigation intelligente:
              </p>
              <ul className="mt-2 text-sm text-indigo-600 space-y-1">
                <li>• Reconstruction 3D en temps réel via LIDAR</li>
                <li>• Détection et évitement d'obstacles par IA</li>
                <li>• Analyse multispectrale des cultures</li>
                <li>• Prédiction de trajectoire optimale</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RobotControl;
