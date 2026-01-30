import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  getParcels, getAdvancedDrones, connectDroneAdvanced, disconnectDroneAdvanced,
  getDroneStatus, createFlightPlan, getDroneFlightPlans, startDroneMission,
  controlDroneAdvanced, captureDroneImage, getDroneCaptures, getSatelliteWeather
} from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Plane, Calendar, Clock, Wind, MapPin, Play, Settings, Pause, Square, 
  Camera, Zap, Wifi, WifiOff, Video, RefreshCw, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, AlertTriangle, Battery, Signal,
  Compass, Gauge, Upload, Download, Plus, Eye, RotateCcw, Target,
  Map, Loader2, CheckCircle, X, Navigation, Satellite
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const GestionDrones = () => {
  const [drones, setDrones] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [droneStatus, setDroneStatus] = useState(null);
  const [flightPlans, setFlightPlans] = useState([]);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  
  // Stream states
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamPermission, setStreamPermission] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Connection dialog
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    connection_type: "wifi",
    ssid: "",
    password: "",
    ip_address: ""
  });
  
  // Flight plan dialog
  const [showFlightPlanDialog, setShowFlightPlanDialog] = useState(false);
  const [flightPlanConfig, setFlightPlanConfig] = useState({
    parcel_id: "",
    altitude: 50,
    speed: 5,
    capture_interval: 5,
    waypoints: []
  });

  useEffect(() => {
    fetchData();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const [dronesRes, parcelsRes] = await Promise.all([
        getAdvancedDrones().catch(() => ({ data: [] })),
        getParcels().catch(() => ({ data: [] }))
      ]);
      
      setDrones(dronesRes.data || []);
      setParcels(parcelsRes.data || []);
      
      if (dronesRes.data?.length > 0) {
        setSelectedDrone(dronesRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchDroneStatus = useCallback(async () => {
    if (!selectedDrone?.id) return;
    
    try {
      const [statusRes, plansRes, capturesRes] = await Promise.all([
        getDroneStatus(selectedDrone.id).catch(() => null),
        getDroneFlightPlans(selectedDrone.id).catch(() => ({ data: [] })),
        getDroneCaptures(selectedDrone.id, 20).catch(() => ({ data: [] }))
      ]);
      
      if (statusRes?.data) setDroneStatus(statusRes.data);
      if (plansRes?.data) setFlightPlans(plansRes.data);
      if (capturesRes?.data) setCaptures(capturesRes.data);
    } catch (error) {
      console.error("Status fetch error:", error);
    }
  }, [selectedDrone]);

  useEffect(() => {
    if (selectedDrone) {
      fetchDroneStatus();
      const interval = setInterval(fetchDroneStatus, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [selectedDrone, fetchDroneStatus]);

  const handleConnect = async () => {
    if (!selectedDrone) return;
    
    setConnecting(true);
    try {
      await connectDroneAdvanced(
        selectedDrone.id,
        connectionConfig.connection_type,
        connectionConfig.ssid,
        connectionConfig.password,
        connectionConfig.ip_address
      );
      toast.success("Drone connecté avec succès!");
      setShowConnectionDialog(false);
      fetchDroneStatus();
      fetchData();
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Erreur de connexion au drone");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedDrone) return;
    
    try {
      await disconnectDroneAdvanced(selectedDrone.id);
      toast.success("Drone déconnecté");
      stopStream();
      fetchData();
    } catch (error) {
      toast.error("Erreur de déconnexion");
    }
  };

  const handleControl = async (action) => {
    if (!selectedDrone) return;
    
    try {
      await controlDroneAdvanced(selectedDrone.id, action);
      toast.success(`Commande '${action}' envoyée`);
      fetchDroneStatus();
    } catch (error) {
      toast.error(`Erreur: ${action}`);
    }
  };

  const handleCapture = async () => {
    if (!selectedDrone) return;
    
    try {
      await captureDroneImage(selectedDrone.id);
      toast.success("Image capturée!");
      fetchDroneStatus();
    } catch (error) {
      toast.error("Erreur de capture");
    }
  };

  const handleCreateFlightPlan = async () => {
    if (!selectedDrone || !flightPlanConfig.parcel_id) {
      toast.error("Sélectionnez une parcelle");
      return;
    }
    
    // Generate waypoints based on parcel
    const parcel = parcels.find(p => p.id === flightPlanConfig.parcel_id);
    const lat = parcel?.latitude || 5.9631;
    const lon = parcel?.longitude || 10.1591;
    
    const waypoints = [
      { lat: lat, lng: lon, altitude: flightPlanConfig.altitude },
      { lat: lat + 0.001, lng: lon, altitude: flightPlanConfig.altitude },
      { lat: lat + 0.001, lng: lon + 0.001, altitude: flightPlanConfig.altitude },
      { lat: lat, lng: lon + 0.001, altitude: flightPlanConfig.altitude },
      { lat: lat, lng: lon, altitude: flightPlanConfig.altitude }
    ];
    
    try {
      await createFlightPlan(
        selectedDrone.id,
        flightPlanConfig.parcel_id,
        waypoints,
        flightPlanConfig.altitude,
        flightPlanConfig.speed,
        flightPlanConfig.capture_interval
      );
      toast.success("Plan de vol créé!");
      setShowFlightPlanDialog(false);
      fetchDroneStatus();
    } catch (error) {
      toast.error("Erreur de création du plan");
    }
  };

  const handleStartMission = async (planId) => {
    if (!selectedDrone) return;
    
    try {
      await startDroneMission(selectedDrone.id, planId);
      toast.success("Mission démarrée!");
      fetchDroneStatus();
    } catch (error) {
      toast.error("Erreur de démarrage de mission");
    }
  };

  // Camera/Video Stream Functions
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setStreamPermission(true);
      }
    } catch (error) {
      console.error("Stream error:", error);
      setStreamPermission(false);
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureFromStream = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Save capture locally
    const newCapture = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      thumbnail: canvas.toDataURL('image/jpeg', 0.5)
    };
    setCaptures(prev => [newCapture, ...prev]);
    toast.success("Image capturée du flux!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ready": return "bg-emerald-500";
      case "in_flight": return "bg-blue-500";
      case "landing": return "bg-orange-500";
      case "charging": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 60) return "text-emerald-500";
    if (level >= 30) return "text-yellow-500";
    return "text-red-500";
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
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Plane className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Gestion des Drones</h1>
            </div>
            <p className="text-white/80">Connexion • Pilotage • Streaming vidéo • Capture d'images</p>
          </div>
          <div className="flex gap-2">
            <Select 
              value={selectedDrone?.id || ""} 
              onValueChange={(value) => {
                const drone = drones.find(d => d.id === value);
                setSelectedDrone(drone);
              }}
            >
              <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Sélectionner un drone" />
              </SelectTrigger>
              <SelectContent>
                {drones.map(drone => (
                  <SelectItem key={drone.id} value={drone.id}>
                    {drone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("border-2", selectedDrone?.is_connected ? "border-emerald-200" : "border-slate-200")}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center",
                selectedDrone?.is_connected ? "bg-emerald-100" : "bg-slate-100"
              )}>
                {selectedDrone?.is_connected ? (
                  <Wifi className="h-6 w-6 text-emerald-600" />
                ) : (
                  <WifiOff className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {selectedDrone?.is_connected ? "Connecté" : "Déconnecté"}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedDrone?.connection_type || "Non connecté"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Battery className={cn("h-6 w-6", getBatteryColor(droneStatus?.battery_level || 0))} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {droneStatus?.battery_level || selectedDrone?.battery_level || 0}%
                </p>
                <p className="text-sm text-slate-500">Batterie</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", getStatusColor(droneStatus?.status || "idle"))}>
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 capitalize">
                  {droneStatus?.status || selectedDrone?.status || "En attente"}
                </p>
                <p className="text-sm text-slate-500">Statut</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{captures.length}</p>
                <p className="text-sm text-slate-500">Images capturées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Stream */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-violet-600" />
                  Flux Vidéo en Temps Réel
                </CardTitle>
                <div className="flex gap-2">
                  {!selectedDrone?.is_connected && (
                    <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <Wifi className="h-4 w-4 mr-2" />
                          Connecter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connexion au Drone</DialogTitle>
                          <DialogDescription>
                            Configurez la connexion WiFi ou Bluetooth
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Type de connexion</Label>
                            <Select 
                              value={connectionConfig.connection_type}
                              onValueChange={(v) => setConnectionConfig({...connectionConfig, connection_type: v})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wifi">WiFi</SelectItem>
                                <SelectItem value="bluetooth">Bluetooth</SelectItem>
                                <SelectItem value="direct">Direct (USB)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {connectionConfig.connection_type === "wifi" && (
                            <>
                              <div className="space-y-2">
                                <Label>SSID du drone</Label>
                                <Input 
                                  placeholder="DJI_DRONE_XXXX"
                                  value={connectionConfig.ssid}
                                  onChange={(e) => setConnectionConfig({...connectionConfig, ssid: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Mot de passe</Label>
                                <Input 
                                  type="password"
                                  value={connectionConfig.password}
                                  onChange={(e) => setConnectionConfig({...connectionConfig, password: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Adresse IP (optionnel)</Label>
                                <Input 
                                  placeholder="192.168.4.1"
                                  value={connectionConfig.ip_address}
                                  onChange={(e) => setConnectionConfig({...connectionConfig, ip_address: e.target.value})}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleConnect} disabled={connecting}>
                            {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
                            Connecter
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {selectedDrone?.is_connected && (
                    <Button size="sm" variant="destructive" onClick={handleDisconnect}>
                      <WifiOff className="h-4 w-4 mr-2" />
                      Déconnecter
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-slate-900 aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Video className="h-16 w-16 text-slate-500 mb-4" />
                    <p className="text-slate-400 mb-4">
                      {!selectedDrone?.is_connected 
                        ? "Connectez d'abord le drone pour voir le flux vidéo"
                        : streamPermission === false
                        ? "Accès caméra refusé"
                        : "Flux vidéo non actif"}
                    </p>
                    <Button 
                      onClick={startStream} 
                      className="bg-violet-600 hover:bg-violet-700"
                      disabled={!selectedDrone?.is_connected}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer le flux
                    </Button>
                  </div>
                )}

                {/* Telemetry Overlay */}
                {isStreaming && droneStatus?.telemetry && (
                  <>
                    <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 text-white text-sm">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-slate-400">Alt:</span>
                        <span className="font-mono">{droneStatus.telemetry.altitude?.toFixed(1)}m</span>
                        <span className="text-slate-400">Vit:</span>
                        <span className="font-mono">{droneStatus.telemetry.speed?.toFixed(1)}m/s</span>
                        <span className="text-slate-400">Cap:</span>
                        <span className="font-mono">{droneStatus.telemetry.heading}°</span>
                        <span className="text-slate-400">GPS:</span>
                        <span className="font-mono">{droneStatus.telemetry.satellites_connected} sat</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 text-white">
                      <div className="flex items-center gap-2">
                        <Battery className={cn("h-5 w-5", getBatteryColor(droneStatus.battery_level))} />
                        <span className="font-mono">{droneStatus.battery_level}%</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Recording indicator */}
                {isStreaming && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-white text-sm">EN DIRECT</span>
                  </div>
                )}
              </div>

              {/* Stream Controls */}
              <div className="p-4 flex gap-2 justify-center bg-slate-100">
                {isStreaming ? (
                  <>
                    <Button onClick={stopStream} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Arrêter
                    </Button>
                    <Button onClick={captureFromStream} className="bg-violet-600 hover:bg-violet-700" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Capturer
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={startStream} 
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled={!selectedDrone?.is_connected}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer le flux
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flight Controls */}
          {selectedDrone?.is_connected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  Contrôles de Vol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Main Controls */}
                  <div className="col-span-2 grid grid-cols-3 gap-2">
                    <div></div>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handleControl("takeoff")}
                      className="aspect-square"
                    >
                      <ArrowUp className="h-6 w-6" />
                    </Button>
                    <div></div>
                    
                    <Button variant="outline" size="lg" className="aspect-square">
                      <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handleControl("hover")}
                      className="aspect-square bg-blue-50"
                    >
                      <Pause className="h-6 w-6 text-blue-600" />
                    </Button>
                    <Button variant="outline" size="lg" className="aspect-square">
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handleControl("land")}
                      className="aspect-square"
                    >
                      <ArrowDown className="h-6 w-6" />
                    </Button>
                    <div></div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleControl("takeoff")}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Décollage
                    </Button>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => handleControl("land")}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Atterrissage
                    </Button>
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => handleControl("return_home")}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Retour base
                    </Button>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleControl("emergency_stop")}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      URGENCE
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="status">Statut</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="captures">Images</TabsTrigger>
            </TabsList>

            {/* Status Tab */}
            <TabsContent value="status" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {selectedDrone?.name || "Aucun drone"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDrone?.model} • {selectedDrone?.serial_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {droneStatus ? (
                    <>
                      {/* Telemetry */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                            <Gauge className="h-3 w-3" />
                            Altitude
                          </div>
                          <p className="font-bold">{droneStatus.telemetry?.altitude?.toFixed(1) || 0}m</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                            <Zap className="h-3 w-3" />
                            Vitesse
                          </div>
                          <p className="font-bold">{droneStatus.telemetry?.speed?.toFixed(1) || 0}m/s</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                            <Compass className="h-3 w-3" />
                            Cap
                          </div>
                          <p className="font-bold">{droneStatus.telemetry?.heading || 0}°</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                            <Satellite className="h-3 w-3" />
                            GPS
                          </div>
                          <p className="font-bold">{droneStatus.telemetry?.satellites_connected || 0} sat</p>
                        </div>
                      </div>

                      {/* Weather */}
                      {droneStatus.weather && (
                        <div className={cn("p-4 rounded-xl",
                          droneStatus.flight_recommended ? "bg-emerald-50 border border-emerald-200" : "bg-orange-50 border border-orange-200"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Conditions de vol</span>
                            <Badge className={droneStatus.flight_recommended ? "bg-emerald-500" : "bg-orange-500"}>
                              {droneStatus.flight_recommended ? "Favorable" : "Risqué"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Vent: {droneStatus.weather.wind_speed?.toFixed(1)} km/h</div>
                            <div>Visibilité: {(droneStatus.weather.visibility / 1000).toFixed(1)} km</div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Plane className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <p>Connectez un drone pour voir les données</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Plans de Vol</CardTitle>
                    <Dialog open={showFlightPlanDialog} onOpenChange={setShowFlightPlanDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nouveau Plan de Vol</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Parcelle cible</Label>
                            <Select 
                              value={flightPlanConfig.parcel_id}
                              onValueChange={(v) => setFlightPlanConfig({...flightPlanConfig, parcel_id: v})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une parcelle" />
                              </SelectTrigger>
                              <SelectContent>
                                {parcels.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Altitude (m)</Label>
                              <Input 
                                type="number"
                                value={flightPlanConfig.altitude}
                                onChange={(e) => setFlightPlanConfig({...flightPlanConfig, altitude: parseInt(e.target.value)})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Vitesse (m/s)</Label>
                              <Input 
                                type="number"
                                value={flightPlanConfig.speed}
                                onChange={(e) => setFlightPlanConfig({...flightPlanConfig, speed: parseInt(e.target.value)})}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Intervalle capture (s)</Label>
                            <Input 
                              type="number"
                              value={flightPlanConfig.capture_interval}
                              onChange={(e) => setFlightPlanConfig({...flightPlanConfig, capture_interval: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowFlightPlanDialog(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleCreateFlightPlan}>
                            Créer le plan
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {flightPlans.length > 0 ? (
                      <div className="space-y-3">
                        {flightPlans.map((plan) => (
                          <div key={plan.id} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{plan.parcel_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {plan.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 mb-2">
                              <div>Alt: {plan.altitude_m}m</div>
                              <div>Vit: {plan.speed_mps}m/s</div>
                              <div>~{plan.estimated_duration_min}min</div>
                              <div>~{plan.estimated_images} images</div>
                            </div>
                            {plan.status === "planned" && (
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleStartMission(plan.id)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Démarrer
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Map className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">Aucun plan de vol</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Captures Tab */}
            <TabsContent value="captures" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Images Capturées</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {captures.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {captures.map((capture) => (
                          <div key={capture.id} className="relative group">
                            {capture.thumbnail ? (
                              <img 
                                src={capture.thumbnail}
                                alt="Capture"
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                                <Camera className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button size="icon" variant="secondary" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="secondary" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 text-center">
                              {new Date(capture.timestamp).toLocaleTimeString("fr-FR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Camera className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">Aucune capture</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GestionDrones;
