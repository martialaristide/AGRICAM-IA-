import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Bot,
  Plus,
  Play,
  Pause,
  Square,
  Settings,
  Battery,
  Wifi,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Tractor,
  Sprout,
  Camera
} from "lucide-react";
import api from "../services/api";
import { getRobots, createRobot } from "../services/api";
import { toast } from "sonner";

const ROBOT_TYPES = [
  { id: "surveillance", name: "Surveillance", icon: Camera, color: "bg-blue-500" },
  { id: "harvesting", name: "Récolte", icon: Tractor, color: "bg-amber-500" },
  { id: "spraying", name: "Pulvérisation", icon: Sprout, color: "bg-emerald-500" },
  { id: "seeding", name: "Semis", icon: Sprout, color: "bg-violet-500" }
];

const Robots = () => {
  const [robots, setRobots] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [telemetry, setTelemetry] = useState({});
  
  const [newRobot, setNewRobot] = useState({
    name: "",
    model: "",
    robot_type: "surveillance",
    serial_number: "",
    max_operation_hours: 8
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Poll telemetry for selected robot
    if (selectedRobot) {
      const interval = setInterval(() => fetchTelemetry(selectedRobot.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRobot]);

  const fetchData = async () => {
    try {
      const [robotsRes, parcelsRes] = await Promise.all([
        getRobots(),
        api.get("/parcels")
      ]);
      setRobots(robotsRes.data);
      setParcels(parcelsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetry = async (robotId) => {
    try {
      const response = await api.get(`/robots/${robotId}/telemetry`);
      setTelemetry(prev => ({ ...prev, [robotId]: response.data }));
    } catch (error) {
      console.error("Telemetry error:", error);
    }
  };

  const handleAddRobot = async () => {
    if (!newRobot.name || !newRobot.serial_number) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await createRobot(newRobot);
      toast.success("Robot ajouté avec succès!");
      setShowAddDialog(false);
      fetchData();
      setNewRobot({
        name: "",
        model: "",
        robot_type: "surveillance",
        serial_number: "",
        max_operation_hours: 8
      });
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleStartRobot = async (robotId, taskType, parcelId) => {
    try {
      await api.post(`/robots/${robotId}/start`, null, {
        params: { task_type: taskType, parcel_id: parcelId }
      });
      toast.success("Robot démarré!");
      fetchData();
    } catch (error) {
      toast.error("Erreur de démarrage");
    }
  };

  const handleStopRobot = async (robotId) => {
    try {
      await api.post(`/robots/${robotId}/stop`);
      toast.success("Robot arrêté");
      fetchData();
    } catch (error) {
      toast.error("Erreur d'arrêt");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-emerald-500 text-white gap-1"><Zap className="h-3 w-3" />Prêt</Badge>;
      case "working":
        return <Badge className="bg-blue-500 text-white gap-1"><Play className="h-3 w-3" />En marche</Badge>;
      case "idle":
        return <Badge className="bg-amber-500 text-white gap-1"><Pause className="h-3 w-3" />En veille</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRobotTypeConfig = (type) => {
    return ROBOT_TYPES.find(t => t.id === type) || ROBOT_TYPES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="robots-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Robots Agricoles</h1>
            </div>
            <p className="text-white/80">Gestion et contrôle de vos robots autonomes</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600" data-testid="add-robot-btn">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un robot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un robot agricole</DialogTitle>
                <DialogDescription>
                  Configurez votre robot pour le connecter à la plateforme
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom du robot *</Label>
                  <Input
                    value={newRobot.name}
                    onChange={(e) => setNewRobot({...newRobot, name: e.target.value})}
                    placeholder="Ex: AgriBot Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modèle</Label>
                  <Input
                    value={newRobot.model}
                    onChange={(e) => setNewRobot({...newRobot, model: e.target.value})}
                    placeholder="Ex: AB-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de robot *</Label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={newRobot.robot_type}
                    onChange={(e) => setNewRobot({...newRobot, robot_type: e.target.value})}
                  >
                    {ROBOT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Numéro de série *</Label>
                  <Input
                    value={newRobot.serial_number}
                    onChange={(e) => setNewRobot({...newRobot, serial_number: e.target.value})}
                    placeholder="Ex: AGR-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Autonomie max (heures)</Label>
                  <Input
                    type="number"
                    value={newRobot.max_operation_hours}
                    onChange={(e) => setNewRobot({...newRobot, max_operation_hours: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddRobot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Bot className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{robots.length}</p>
                <p className="text-sm text-slate-500">Total robots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wifi className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {robots.filter(r => r.is_connected).length}
                </p>
                <p className="text-sm text-slate-500">Connectés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {robots.filter(r => r.status === "working").length}
                </p>
                <p className="text-sm text-slate-500">En activité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {robots.reduce((acc, r) => acc + (r.total_operation_hours || 0), 0).toFixed(0)}h
                </p>
                <p className="text-sm text-slate-500">Total heures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Robots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {robots.map(robot => {
          const typeConfig = getRobotTypeConfig(robot.robot_type);
          const TypeIcon = typeConfig.icon;
          const robotTelemetry = telemetry[robot.id];

          return (
            <Card 
              key={robot.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRobot(robot)}
              data-testid={`robot-${robot.id}`}
            >
              <div className={`h-24 ${typeConfig.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <TypeIcon className="h-16 w-16 text-white/30" />
                </div>
                <div className="absolute top-4 right-4">
                  {getStatusBadge(robot.status)}
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{robot.name}</h3>
                  <p className="text-white/80 text-sm">{typeConfig.name}</p>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Battery className={`h-4 w-4 ${
                      robot.battery_level > 50 ? "text-emerald-500" :
                      robot.battery_level > 20 ? "text-amber-500" : "text-rose-500"
                    }`} />
                    <span>{robot.battery_level}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi className={`h-4 w-4 ${robot.is_connected ? "text-emerald-500" : "text-slate-400"}`} />
                    <span>{robot.is_connected ? "Connecté" : "Déconnecté"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{robot.total_operation_hours || 0}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>{robot.model || "N/A"}</span>
                  </div>
                </div>

                {robot.current_task && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700">
                      Tâche: {robot.current_task.type}
                    </p>
                    <Progress value={robot.current_task.progress_percent || 30} className="mt-2" />
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 gap-2">
                {robot.status === "working" ? (
                  <Button 
                    className="flex-1" 
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopRobot(robot.id);
                    }}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                        disabled={!robot.is_connected}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Démarrer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Démarrer {robot.name}</DialogTitle>
                        <DialogDescription>
                          Sélectionnez une tâche et une parcelle
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Parcelle</Label>
                          <select
                            id={`parcel-${robot.id}`}
                            className="w-full p-2 border rounded-lg"
                          >
                            {parcels.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            const parcelSelect = document.getElementById(`parcel-${robot.id}`);
                            handleStartRobot(robot.id, robot.robot_type, parcelSelect?.value);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Lancer la mission
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchTelemetry(robot.id);
                    setSelectedRobot(robot);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {robots.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Bot className="h-16 w-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium">Aucun robot configuré</h3>
            <p className="text-slate-500 mt-2">Ajoutez votre premier robot agricole</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un robot
            </Button>
          </Card>
        )}
      </div>

      {/* Telemetry Panel */}
      {selectedRobot && telemetry[selectedRobot.id] && (
        <Card className="border-2 border-emerald-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Télémétrie - {selectedRobot.name}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedRobot(null)}>
                Fermer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500">Batterie</p>
                <p className="text-2xl font-bold">{telemetry[selectedRobot.id].battery_level}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500">Vitesse</p>
                <p className="text-2xl font-bold">{telemetry[selectedRobot.id].speed_kmh} km/h</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500">Latitude</p>
                <p className="text-xl font-bold">{telemetry[selectedRobot.id].location?.latitude?.toFixed(4)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500">Longitude</p>
                <p className="text-xl font-bold">{telemetry[selectedRobot.id].location?.longitude?.toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Robots;
