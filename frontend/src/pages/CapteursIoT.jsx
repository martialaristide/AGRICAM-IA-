import React, { useEffect, useState, useRef } from "react";
import { getSensors, getSensorsStats, getParcels } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import ExportButton from "../components/ExportButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { 
  Wifi, CheckCircle2, XCircle, AlertCircle, 
  Droplets, Thermometer, FlaskConical, Camera, Upload, Zap,
  Plus, Settings, Signal, Battery, RefreshCw, Trash2,
  WifiOff, Radio, MapPin, Activity, Eye
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const CapteursIoT = () => {
  const [sensors, setSensors] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showWifiDialog, setShowWifiDialog] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const fileInputRef = useRef(null);

  // New sensor form
  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "humidity",
    parcel_id: "",
    wifi_ssid: "",
    wifi_password: "",
  });

  // WiFi configuration
  const [wifiConfig, setWifiConfig] = useState({
    ssid: "",
    password: "",
    ip_address: "",
    gateway: "",
  });

  const [wifiScanning, setWifiScanning] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sensorsRes, statsRes, parcelsRes] = await Promise.all([
        getSensors(),
        getSensorsStats(),
        getParcels()
      ]);
      setSensors(sensorsRes.data);
      setStats(statsRes.data);
      setParcels(parcelsRes.data);
    } catch (error) {
      console.error("Error fetching sensors:", error);
      toast.error("Erreur lors du chargement des capteurs");
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case "humidity": return <Droplets className="h-5 w-5 text-blue-500" />;
      case "temperature": return <Thermometer className="h-5 w-5 text-orange-500" />;
      case "ph": return <FlaskConical className="h-5 w-5 text-cyan-500" />;
      case "npk": return <FlaskConical className="h-5 w-5 text-green-500" />;
      case "camera": return <Camera className="h-5 w-5 text-purple-500" />;
      case "pressure": return <Activity className="h-5 w-5 text-indigo-500" />;
      default: return <Wifi className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "actif":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
            <Zap className="h-3 w-3" />
            Actif
          </Badge>
        );
      case "erreur":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
            Erreur
          </Badge>
        );
      case "inactif":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
            Inactif
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getBatteryIcon = (level) => {
    if (level > 60) return <Battery className="h-4 w-4 text-emerald-500" />;
    if (level > 30) return <Battery className="h-4 w-4 text-amber-500" />;
    return <Battery className="h-4 w-4 text-rose-500" />;
  };

  const handleScanWifi = async () => {
    setWifiScanning(true);
    // Simulate WiFi scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAvailableNetworks([
      { ssid: "AGRICAM_IOT_2.4G", signal: 95, secured: true },
      { ssid: "FarmNetwork_5G", signal: 78, secured: true },
      { ssid: "AgriConnect", signal: 65, secured: true },
      { ssid: "Rural_Wifi", signal: 45, secured: false },
    ]);
    setWifiScanning(false);
    toast.success("Scan WiFi terminé - 4 réseaux trouvés");
  };

  const handleConnectWifi = async () => {
    if (!wifiConfig.ssid || !wifiConfig.password) {
      toast.error("Veuillez entrer le SSID et le mot de passe");
      return;
    }

    toast.loading("Connexion au réseau WiFi...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.dismiss();
    toast.success(`Capteur connecté à ${wifiConfig.ssid}`);
    
    // Update sensor status
    if (selectedSensor) {
      setSensors(sensors.map(s => 
        s.id === selectedSensor.id 
          ? { ...s, status: "actif", wifi_ssid: wifiConfig.ssid }
          : s
      ));
    }
    
    setShowWifiDialog(false);
    setWifiConfig({ ssid: "", password: "", ip_address: "", gateway: "" });
  };

  const handleAddSensor = async () => {
    if (!newSensor.name || !newSensor.parcel_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const parcel = parcels.find(p => p.id === newSensor.parcel_id);
      const sensorData = {
        id: `s${Date.now()}`,
        name: newSensor.name,
        type: newSensor.type,
        parcel_id: newSensor.parcel_id,
        parcel_name: parcel?.name || "Non défini",
        value: 0,
        unit: newSensor.type === "temperature" ? "°C" : newSensor.type === "humidity" ? "%" : "pH",
        status: "inactif",
        battery_level: 100,
        wifi_ssid: newSensor.wifi_ssid || null,
        last_update: new Date().toISOString(),
      };

      // Add to local state (in real app, would call API)
      setSensors([...sensors, sensorData]);
      toast.success(`Capteur "${newSensor.name}" ajouté avec succès`);
      setShowAddDialog(false);
      setNewSensor({ name: "", type: "humidity", parcel_id: "", wifi_ssid: "", wifi_password: "" });
    } catch (error) {
      toast.error("Erreur lors de l'ajout du capteur");
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    setSensors(sensors.filter(s => s.id !== sensorId));
    toast.success("Capteur supprimé");
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/import/sensors-data", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`${response.data.records_imported} enregistrements importés`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'import");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="capteurs-page">
      {/* Header */}
      <div className="gradient-sensors rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Capteurs IoT</h1>
            </div>
            <p className="text-white/80">Surveillance en temps réel de vos parcelles</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            {/* Export Button */}
            <ExportButton 
              data={sensors} 
              type="capteurs" 
              title="Rapport des Capteurs IoT AGRICAM IA"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            />
            
            {/* Add Sensor */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <ActionTooltip content="Ajouter un nouveau capteur et le configurer">
                <DialogTrigger asChild>
                  <Button className="bg-white text-pink-600 hover:bg-white/90" data-testid="add-sensor-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un capteur
                  </Button>
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-pink-600" />
                    Ajouter un nouveau capteur
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom du capteur *</Label>
                    <Input
                      value={newSensor.name}
                      onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                      placeholder="Ex: Capteur Humidité Nord"
                      data-testid="sensor-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de capteur *</Label>
                    <select
                      value={newSensor.type}
                      onChange={(e) => setNewSensor({ ...newSensor, type: e.target.value })}
                      className="w-full h-10 px-3 border rounded-md"
                      data-testid="sensor-type-select"
                    >
                      <option value="humidity">Humidité du sol</option>
                      <option value="temperature">Température</option>
                      <option value="ph">pH du sol</option>
                      <option value="npk">NPK (Nutriments)</option>
                      <option value="camera">Caméra</option>
                      <option value="pressure">Pression atmosphérique</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Parcelle associée *</Label>
                    <select
                      value={newSensor.parcel_id}
                      onChange={(e) => setNewSensor({ ...newSensor, parcel_id: e.target.value })}
                      className="w-full h-10 px-3 border rounded-md"
                      data-testid="sensor-parcel-select"
                    >
                      <option value="">Sélectionner une parcelle</option>
                      {parcels.map(parcel => (
                        <option key={parcel.id} value={parcel.id}>
                          {parcel.name} - {parcel.crop_type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WiFi Configuration */}
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-5 w-5 text-pink-600" />
                      <h4 className="font-semibold">Configuration WiFi</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>SSID WiFi</Label>
                        <Input
                          value={newSensor.wifi_ssid}
                          onChange={(e) => setNewSensor({ ...newSensor, wifi_ssid: e.target.value })}
                          placeholder="Nom du réseau"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mot de passe</Label>
                        <Input
                          type="password"
                          value={newSensor.wifi_password}
                          onChange={(e) => setNewSensor({ ...newSensor, wifi_password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Le capteur se connectera automatiquement au réseau WiFi configuré
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddSensor} data-testid="create-sensor-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le capteur
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Import Data */}
            <ActionTooltip content="Importer des données depuis CSV ou Excel">
              <Button 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={() => fileInputRef.current?.click()}
                data-testid="import-btn"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
            </ActionTooltip>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileImport}
              ref={fileInputRef}
              className="hidden"
            />

            {/* Refresh */}
            <ActionTooltip content="Actualiser les données des capteurs">
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
        <ActionTooltip content="Capteurs actuellement connectés et fonctionnels">
          <Card className="card-hover cursor-help" data-testid="stat-actif">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.actif || 0}</p>
                  <p className="text-sm text-slate-500">Capteurs actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Capteurs hors ligne ou non connectés">
          <Card className="card-hover cursor-help" data-testid="stat-inactif">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.inactif || 0}</p>
                  <p className="text-sm text-slate-500">Capteurs inactifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Capteurs présentant des dysfonctionnements">
          <Card className="card-hover cursor-help" data-testid="stat-erreur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.erreur || 0}</p>
                  <p className="text-sm text-slate-500">Capteurs en erreur</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Nombre total de capteurs installés">
          <Card className="card-hover cursor-help" data-testid="stat-total">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Radio className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats?.total || sensors.length}</p>
                  <p className="text-sm text-slate-500">Total capteurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>
      </div>

      {/* Sensors Table */}
      <Card data-testid="sensors-table">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-500" />
            <CardTitle>Liste des capteurs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Capteur</TableHead>
                <TableHead className="font-semibold text-slate-700">Parcelle</TableHead>
                <TableHead className="font-semibold text-slate-700">Valeur</TableHead>
                <TableHead className="font-semibold text-slate-700">Batterie</TableHead>
                <TableHead className="font-semibold text-slate-700">WiFi</TableHead>
                <TableHead className="font-semibold text-slate-700">État</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensors.map((sensor) => (
                <TableRow 
                  key={sensor.id}
                  className="hover:bg-slate-50 transition-colors"
                  data-testid={`sensor-row-${sensor.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getSensorIcon(sensor.type)}
                      <div>
                        <p className="font-medium text-slate-900">{sensor.name}</p>
                        <p className="text-xs text-slate-500">ID: {sensor.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3 w-3" />
                      {sensor.parcel_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">
                      {sensor.value}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">{sensor.unit}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getBatteryIcon(sensor.battery_level || 80)}
                      <span className="text-sm">{sensor.battery_level || 80}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sensor.wifi_ssid ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Signal className="h-4 w-4" />
                        <span className="text-xs">{sensor.wifi_ssid}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-xs">Non configuré</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ActionTooltip content="Configurer la connexion WiFi du capteur">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSensor(sensor);
                            setShowWifiDialog(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip content="Voir l'historique des données">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip content="Supprimer ce capteur">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          onClick={() => handleDeleteSensor(sensor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* WiFi Configuration Dialog */}
      <Dialog open={showWifiDialog} onOpenChange={setShowWifiDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-pink-600" />
              Configuration WiFi - {selectedSensor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Scan Networks */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Réseaux disponibles</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleScanWifi}
                disabled={wifiScanning}
              >
                {wifiScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scan en cours...
                  </>
                ) : (
                  <>
                    <Signal className="h-4 w-4 mr-2" />
                    Scanner
                  </>
                )}
              </Button>
            </div>

            {/* Available Networks */}
            {availableNetworks.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableNetworks.map((network, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      wifiConfig.ssid === network.ssid 
                        ? "border-pink-500 bg-pink-50" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    onClick={() => setWifiConfig({ ...wifiConfig, ssid: network.ssid })}
                  >
                    <div className="flex items-center gap-3">
                      <Signal className={cn(
                        "h-4 w-4",
                        network.signal > 70 ? "text-emerald-500" : 
                        network.signal > 40 ? "text-amber-500" : "text-rose-500"
                      )} />
                      <span className="font-medium">{network.ssid}</span>
                      {network.secured && (
                        <Badge variant="outline" className="text-xs">Sécurisé</Badge>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{network.signal}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Configuration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SSID WiFi</Label>
                <Input
                  value={wifiConfig.ssid}
                  onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                  placeholder="Nom du réseau"
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <Input
                  type="password"
                  value={wifiConfig.password}
                  onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">État de connexion</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedSensor?.status === "actif" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600">Connecté</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Non connecté</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowWifiDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleConnectWifi}>
                <Wifi className="h-4 w-4 mr-2" />
                Connecter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-pink-50 to-violet-50 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-pink-800">Configuration IoT AGRICAM</h3>
              <p className="text-pink-700 mt-1">
                Vos capteurs IoT collectent des données en temps réel pour optimiser vos cultures:
              </p>
              <ul className="mt-2 text-sm text-pink-600 space-y-1">
                <li>• Surveillance 24/7 de l'humidité et température</li>
                <li>• Analyse continue du pH et des nutriments NPK</li>
                <li>• Alertes automatiques en cas d'anomalie</li>
                <li>• Connexion WiFi sécurisée pour chaque capteur</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapteursIoT;
