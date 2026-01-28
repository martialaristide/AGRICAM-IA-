import React, { useEffect, useState, useRef } from "react";
import { getSensors, getSensorsStats, importSensorsData } from "../services/api";
import api from "../services/api";
import { useAuth } from "../App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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
  Download, Plus, Trash2, Edit, Brain, FileSpreadsheet,
  BarChart3, RefreshCw, Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const CapteursIoT = () => {
  const { user } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [parcels, setParcels] = useState([]);
  const fileInputRef = useRef(null);
  
  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "humidity",
    parcel_id: "",
    unit: "%"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sensorsRes, statsRes, parcelsRes] = await Promise.all([
        getSensors(),
        getSensorsStats(),
        api.get("/parcels")
      ]);
      setSensors(sensorsRes.data);
      setStats(statsRes.data);
      setParcels(parcelsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur de chargement des capteurs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSensor = async () => {
    if (!newSensor.name || !newSensor.parcel_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await api.post("/sensors", newSensor);
      toast.success("Capteur ajouté avec succès!");
      setShowAddDialog(false);
      fetchData();
      setNewSensor({ name: "", type: "humidity", parcel_id: "", unit: "%" });
    } catch (error) {
      console.error("Error adding sensor:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'ajout du capteur");
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce capteur?")) return;
    
    try {
      await api.delete(`/sensors/${sensorId}`);
      toast.success("Capteur supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const response = await importSensorsData(file);
      toast.success(`${response.data.records_imported} enregistrements importés!`);
      
      if (response.data.ai_analysis) {
        setAiAnalysis(response.data.ai_analysis);
      }
      
      fetchData();
      setShowImportDialog(false);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  const handleExportData = async (format = "csv") => {
    try {
      const response = await api.get(`/iot/export?format=${format}`, {
        responseType: format === "csv" ? "blob" : "json"
      });
      
      if (format === "csv") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `iot_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Export CSV téléchargé!");
      } else {
        // JSON - display in console or download
        console.log("Exported data:", response.data);
        toast.success("Données exportées!");
      }
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await api.post("/iot/analyze", {
        sensor_ids: sensors.map(s => s.id),
        analysis_type: "general"
      });
      setAiAnalysis(response.data.analysis);
      toast.success("Analyse IA terminée!");
    } catch (error) {
      toast.error("Erreur lors de l'analyse IA");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case "humidity": return <Droplets className="h-5 w-5 text-blue-500" />;
      case "temperature": return <Thermometer className="h-5 w-5 text-orange-500" />;
      case "ph": return <FlaskConical className="h-5 w-5 text-cyan-500" />;
      case "npk": return <FlaskConical className="h-5 w-5 text-green-500" />;
      case "camera": return <Camera className="h-5 w-5 text-purple-500" />;
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

  const getUnitByType = (type) => {
    switch (type) {
      case "humidity": return "%";
      case "temperature": return "°C";
      case "ph": return "pH";
      case "npk": return "ppm";
      case "camera": return "active";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 animate-slide-in" data-testid="capteurs-page">
      {/* Header */}
      <div className="gradient-sensors rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Wifi className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Capteurs IoT</h1>
            </div>
            <p className="text-white/80">Surveillance en temps réel de vos parcelles</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-pink-600 hover:bg-white/90" data-testid="add-sensor-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter capteur
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau capteur</DialogTitle>
                    <DialogDescription>
                      Configurez les paramètres du capteur IoT
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nom du capteur *</Label>
                      <Input
                        value={newSensor.name}
                        onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                        placeholder="Ex: Humidité Zone A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type de capteur *</Label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={newSensor.type}
                        onChange={(e) => setNewSensor({
                          ...newSensor, 
                          type: e.target.value,
                          unit: getUnitByType(e.target.value)
                        })}
                      >
                        <option value="humidity">Humidité</option>
                        <option value="temperature">Température</option>
                        <option value="ph">pH</option>
                        <option value="npk">NPK</option>
                        <option value="camera">Caméra</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Parcelle *</Label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={newSensor.parcel_id}
                        onChange={(e) => setNewSensor({...newSensor, parcel_id: e.target.value})}
                      >
                        <option value="">Sélectionnez une parcelle</option>
                        {parcels.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddSensor}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover" data-testid="stat-total">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Wifi className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
                <p className="text-sm text-slate-500">Total capteurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-actif">
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

        <Card className="card-hover" data-testid="stat-inactif">
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

        <Card className="card-hover" data-testid="stat-erreur">
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
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des capteurs</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="analysis">Analyse IA</TabsTrigger>
        </TabsList>

        {/* Sensors List Tab */}
        <TabsContent value="list">
          <Card data-testid="sensors-table">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-500" />
                <CardTitle>Liste des capteurs ({sensors.length})</CardTitle>
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
                    <TableHead className="font-semibold text-slate-700">État</TableHead>
                    {isAdmin && <TableHead className="font-semibold text-slate-700">Actions</TableHead>}
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
                            <p className="text-xs text-slate-500">{sensor.type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{sensor.parcel_name}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900">
                          {sensor.value}
                        </span>
                        <span className="text-sm text-slate-500 ml-1">{sensor.unit}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={sensor.battery_level || 0} className="w-16 h-2" />
                          <span className="text-xs text-slate-500">{sensor.battery_level || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDeleteSensor(sensor.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-600" />
                  Importer des données
                </CardTitle>
                <CardDescription>
                  Importez vos données IoT depuis CSV ou Excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  {importing ? (
                    <Loader2 className="h-12 w-12 mx-auto text-emerald-600 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-400" />
                  )}
                  <p className="mt-4 font-medium text-slate-700">
                    {importing ? "Import en cours..." : "Cliquez pour sélectionner un fichier"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Formats acceptés: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Colonnes attendues:</p>
                  <p className="text-xs text-slate-500">
                    sensor_id, sensor_name, value, unit, timestamp
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Exporter les données
                </CardTitle>
                <CardDescription>
                  Téléchargez vos données en différents formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportData("csv")}
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3 text-emerald-600" />
                  Exporter en CSV
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleExportData("json")}
                >
                  <BarChart3 className="h-5 w-5 mr-3 text-blue-600" />
                  Exporter en JSON
                </Button>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    L'export inclut l'historique complet des mesures de tous vos capteurs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-600" />
                    Analyse IA des données IoT
                  </CardTitle>
                  <CardDescription>
                    Obtenez des insights et recommandations basés sur vos données
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleAIAnalysis} 
                  disabled={analyzing}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Lancer l'analyse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiAnalysis ? (
                <div className="prose prose-slate max-w-none">
                  <div className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <h4 className="text-lg font-semibold text-violet-800 mb-3">Résultats de l'analyse IA</h4>
                    <div className="whitespace-pre-wrap text-slate-700">
                      {typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis, null, 2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">
                    Cliquez sur "Lancer l'analyse" pour obtenir des insights IA
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    L'IA analysera vos données et fournira des recommandations personnalisées
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CapteursIoT;
