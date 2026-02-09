import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Settings, User, Bell, Shield, Database, 
  Wifi, Plane, Key, Globe, Save, Bot, Camera,
  Plus, Trash2, RefreshCcw, Check, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const Parametres = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState([]);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDroneDialog, setShowAddDroneDialog] = useState(false);
  const [showAddRobotDialog, setShowAddRobotDialog] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const [dronesRes, robotsRes] = await Promise.all([
        api.get("/drones"),
        api.get("/robots")
      ]);
      setDrones(dronesRes.data);
      setRobots(robotsRes.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrone = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await api.post("/drones", {
        name: formData.get("name"),
        type: formData.get("type"),
        model: formData.get("model"),
        cameras: formData.get("cameras").split(",").map(c => c.trim()),
        max_flight_time_min: parseInt(formData.get("max_flight_time"))
      });
      toast.success("Drone ajouté avec succès !");
      setShowAddDroneDialog(false);
      fetchEquipment();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du drone");
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
      toast.success("Robot ajouté avec succès !");
      setShowAddRobotDialog(false);
      fetchEquipment();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du robot");
    }
  };

  const handleDeleteDrone = async (droneId) => {
    if (!confirm("Supprimer ce drone ?")) return;
    try {
      await api.delete(`/drones/${droneId}`);
      toast.success("Drone supprimé");
      fetchEquipment();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const handleDeleteRobot = async (robotId) => {
    if (!confirm("Supprimer ce robot ?")) return;
    try {
      await api.delete(`/robots/${robotId}`);
      toast.success("Robot supprimé");
      fetchEquipment();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const handleConnectWifi = async (type, id) => {
    const ssid = prompt("Nom du réseau WiFi (SSID):");
    const password = prompt("Mot de passe WiFi:");
    
    if (!ssid) return;

    try {
      await api.post(`/${type}/${id}/connect-wifi`, {
        wifi_ssid: ssid,
        wifi_password: password || ""
      });
      toast.success("Connecté au WiFi !");
      fetchEquipment();
    } catch (error) {
      toast.error("Erreur de connexion WiFi");
    }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="parametres-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Paramètres</h1>
        </div>
        <p className="text-white/80">Configuration de votre compte et de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card data-testid="profile-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profil utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" defaultValue="Jean Dupont" data-testid="input-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jean@ferme.fr" data-testid="input-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="+33 6 12 34 56 78" data-testid="input-phone" />
            </div>
            <Button className="w-full" data-testid="save-profile">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card data-testid="notifications-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertes email</p>
                <p className="text-sm text-slate-500">Recevoir les alertes par email</p>
              </div>
              <Switch defaultChecked data-testid="switch-email" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertes SMS</p>
                <p className="text-sm text-slate-500">Recevoir les alertes par SMS</p>
              </div>
              <Switch data-testid="switch-sms" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-slate-500">Notifications dans l'application</p>
              </div>
              <Switch defaultChecked data-testid="switch-push" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rapport hebdomadaire</p>
                <p className="text-sm text-slate-500">Recevoir un résumé chaque semaine</p>
              </div>
              <Switch defaultChecked data-testid="switch-weekly" />
            </div>
          </CardContent>
        </Card>

        {/* Drones Configuration */}
        <Card data-testid="drones-config-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-violet-600" />
                Configuration Drones
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate("/drones-avance")}>
                  Piloter
                </Button>
                <Dialog open={showAddDroneDialog} onOpenChange={setShowAddDroneDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un drone</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddDrone} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom</Label>
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
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Modèle</Label>
                          <Input name="model" required placeholder="DJI Agras T40" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Caméras (virgule)</Label>
                          <Input name="cameras" placeholder="RGB, Thermal" />
                        </div>
                        <div className="space-y-2">
                          <Label>Temps vol max (min)</Label>
                          <Input name="max_flight_time" type="number" defaultValue="30" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Ajouter</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : drones.length > 0 ? (
              drones.map((drone) => (
                <div key={drone.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${drone.wifi_connected ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div>
                      <p className="font-medium">{drone.name}</p>
                      <p className="text-xs text-slate-500">{drone.model} • {drone.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {drone.wifi_connected ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Connecté</Badge>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleConnectWifi("drones", drone.id)}>
                        <Wifi className="h-4 w-4 mr-1" /> WiFi
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDeleteDrone(drone.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-slate-400">Aucun drone configuré</p>
            )}
          </CardContent>
        </Card>

        {/* Robots Configuration */}
        <Card data-testid="robots-config-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-600" />
                Configuration Robots
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate("/robots-avance")}>
                  Piloter
                </Button>
                <Dialog open={showAddRobotDialog} onOpenChange={setShowAddRobotDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un robot</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddRobot} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom</Label>
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
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Modèle</Label>
                          <Input name="model" required placeholder="AGRICAM RB-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Outils (virgule)</Label>
                        <Input name="tools" placeholder="bras_articulé, caméra" />
                      </div>
                      <Button type="submit" className="w-full">Ajouter</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : robots.length > 0 ? (
              robots.map((robot) => (
                <div key={robot.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${robot.wifi_connected ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <div>
                      <p className="font-medium">{robot.name}</p>
                      <p className="text-xs text-slate-500">{robot.model} • {robot.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {robot.wifi_connected ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Connecté</Badge>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleConnectWifi("robots", robot.id)}>
                        <Wifi className="h-4 w-4 mr-1" /> WiFi
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDeleteRobot(robot.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-slate-400">Aucun robot configuré</p>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card data-testid="security-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentification 2FA</p>
                <p className="text-sm text-slate-500">Double authentification</p>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connexion biométrique</p>
                <p className="text-sm text-slate-500">Face ID / Empreinte</p>
              </div>
              <Switch data-testid="switch-biometric" />
            </div>
            <Button variant="outline" className="w-full" data-testid="change-password">
              <Key className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card data-testid="language-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-600" />
              Langue et région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-language">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-timezone">
                  <option value="africa/douala">Africa/Douala (UTC+1)</option>
                  <option value="africa/dakar">Africa/Dakar (UTC+0)</option>
                  <option value="europe/paris">Europe/Paris (UTC+1)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Format de date</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-dateformat">
                  <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                  <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Unités</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-units">
                  <option value="metric">Métrique (ha, °C, L)</option>
                  <option value="imperial">Impérial (acres, °F, gal)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Parametres;
