import React, { useEffect, useState, useCallback } from "react";
import { 
  getParcels, getSatelliteNDVI, getSatelliteTrueColor, getSatelliteMoisture,
  getSatelliteWeather, getSatelliteStressAnalysis, analyzeSatelliteImage,
  getWorldCropsCartography, getSatelliteHistory
} from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Satellite, Camera, TrendingUp, AlertTriangle, Download, Info, Calendar,
  Droplets, Thermometer, Wind, Cloud, Sun, Leaf, MapPin, RefreshCw,
  Upload, Eye, Target, Globe, BarChart3, Loader2, CheckCircle, FileImage
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const ImagesSatellites = () => {
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("ndvi");
  
  // Data states
  const [ndviData, setNdviData] = useState(null);
  const [trueColorData, setTrueColorData] = useState(null);
  const [moistureData, setMoistureData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [worldCrops, setWorldCrops] = useState(null);
  const [history, setHistory] = useState([]);
  const [uploadedAnalysis, setUploadedAnalysis] = useState(null);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await getParcels();
      setParcels(response.data);
      if (response.data.length > 0) {
        setSelectedParcel(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
      toast.error("Erreur de chargement des parcelles");
    } finally {
      setLoading(false);
    }
  };

  const fetchSatelliteData = useCallback(async (parcelId) => {
    if (!parcelId) return;
    
    setAnalyzing(true);
    try {
      const [ndvi, weather, stress] = await Promise.all([
        getSatelliteNDVI(parcelId).catch(() => null),
        getSatelliteWeather(parcelId).catch(() => null),
        getSatelliteStressAnalysis(parcelId).catch(() => null)
      ]);
      
      if (ndvi?.data) setNdviData(ndvi.data);
      if (weather?.data) setWeatherData(weather.data);
      if (stress?.data) setStressData(stress.data);
      
      toast.success("Données satellite chargées!");
    } catch (error) {
      console.error("Satellite data error:", error);
      toast.error("Erreur de chargement des données satellite");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedParcel) {
      fetchSatelliteData(selectedParcel.id);
    }
  }, [selectedParcel, fetchSatelliteData]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const response = await analyzeSatelliteImage(file, selectedParcel?.id, "full");
      setUploadedAnalysis(response.data);
      toast.success("Image analysée avec succès!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchWorldCrops = async () => {
    try {
      const response = await getWorldCropsCartography("cameroon");
      setWorldCrops(response.data);
    } catch (error) {
      console.error("World crops error:", error);
    }
  };

  useEffect(() => {
    fetchWorldCrops();
  }, []);

  const getNDVIColor = (value) => {
    if (value >= 0.7) return "bg-emerald-500";
    if (value >= 0.5) return "bg-green-500";
    if (value >= 0.3) return "bg-yellow-500";
    if (value >= 0.1) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHealthStatus = (ndvi) => {
    if (ndvi >= 0.7) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (ndvi >= 0.5) return { label: "Bon", color: "text-green-600", bg: "bg-green-50" };
    if (ndvi >= 0.3) return { label: "Moyen", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { label: "Attention", color: "text-red-600", bg: "bg-red-50" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="satellites-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Satellite className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Images Satellite & Analyse IA</h1>
            </div>
            <p className="text-white/80">Données Sentinel-2 en temps réel • NDVI • Analyse de stress • Météo</p>
          </div>
          <div className="flex gap-2">
            <Select 
              value={selectedParcel?.id || ""} 
              onValueChange={(value) => {
                const parcel = parcels.find(p => p.id === value);
                setSelectedParcel(parcel);
              }}
            >
              <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Sélectionner une parcelle" />
              </SelectTrigger>
              <SelectContent>
                {parcels.map(parcel => (
                  <SelectItem key={parcel.id} value={parcel.id}>
                    {parcel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="secondary" 
              onClick={() => fetchSatelliteData(selectedParcel?.id)}
              disabled={analyzing}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NDVI */}
        <Card className="card-hover border-2 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center", getNDVIColor(ndviData?.ndvi_mean || 0))}>
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {ndviData?.ndvi_mean ? (ndviData.ndvi_mean * 100).toFixed(0) : "--"}%
                </p>
                <p className="text-sm text-slate-500">NDVI Moyen</p>
                {ndviData && (
                  <Badge className={cn("mt-1", getHealthStatus(ndviData.ndvi_mean).bg, getHealthStatus(ndviData.ndvi_mean).color)}>
                    {getHealthStatus(ndviData.ndvi_mean).label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stress Zones */}
        <Card className="card-hover border-2 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stressData?.total_stress_zones || 0}</p>
                <p className="text-sm text-slate-500">Zones de Stress</p>
                {stressData && (
                  <Badge className={cn("mt-1", 
                    stressData.total_stress_zones === 0 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {stressData.overall_health || "Analyse en cours"}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="card-hover border-2 border-red-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-red-100 flex items-center justify-center">
                <Thermometer className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {weatherData?.temperature ? `${weatherData.temperature.toFixed(1)}°C` : "--"}
                </p>
                <p className="text-sm text-slate-500">Température</p>
                <p className="text-xs text-slate-400 mt-1">
                  Ressenti: {weatherData?.feels_like?.toFixed(1) || "--"}°C
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wind */}
        <Card className="card-hover border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wind className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {weatherData?.wind_speed ? `${weatherData.wind_speed.toFixed(1)}` : "--"} km/h
                </p>
                <p className="text-sm text-slate-500">Vitesse du Vent</p>
                <Badge className={cn("mt-1", 
                  weatherData?.flight_conditions === "favorable" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                )}>
                  {weatherData?.flight_conditions === "favorable" ? "Vol OK" : "Vol risqué"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="ndvi" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            NDVI
          </TabsTrigger>
          <TabsTrigger value="stress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Stress
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Météo
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="world" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Monde
          </TabsTrigger>
        </TabsList>

        {/* NDVI Tab */}
        <TabsContent value="ndvi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NDVI Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-blue-600" />
                  Image NDVI - {selectedParcel?.name || "Parcelle"}
                </CardTitle>
                <CardDescription>
                  Indice de végétation par satellite Sentinel-2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
                  {ndviData?.image_base64 ? (
                    <img 
                      src={`data:image/png;base64,${ndviData.image_base64}`}
                      alt="NDVI"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      {analyzing ? (
                        <>
                          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                          <p>Chargement des données Sentinel...</p>
                        </>
                      ) : (
                        <>
                          <Satellite className="h-16 w-16 text-slate-300 mb-4" />
                          <p>Image NDVI</p>
                          <p className="text-sm text-slate-400">Sélectionnez une parcelle</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* NDVI Legend */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Légende NDVI</p>
                    <div className="flex gap-1">
                      <div className="flex-1 h-3 bg-red-500 rounded-l" title="0-0.1"></div>
                      <div className="flex-1 h-3 bg-orange-500" title="0.1-0.3"></div>
                      <div className="flex-1 h-3 bg-yellow-500" title="0.3-0.5"></div>
                      <div className="flex-1 h-3 bg-green-500" title="0.5-0.7"></div>
                      <div className="flex-1 h-3 bg-emerald-600 rounded-r" title="0.7-1.0"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Sol nu</span>
                      <span>Végétation dense</span>
                    </div>
                  </div>
                </div>
                
                {ndviData && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Historique
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NDVI Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Analyse NDVI Détaillée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ndviData ? (
                  <>
                    {/* NDVI Values */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-2xl font-bold text-red-700">{(ndviData.ndvi_min * 100).toFixed(0)}%</p>
                        <p className="text-xs text-slate-600">Minimum</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-700">{(ndviData.ndvi_mean * 100).toFixed(0)}%</p>
                        <p className="text-xs text-slate-600">Moyen</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-700">{(ndviData.ndvi_max * 100).toFixed(0)}%</p>
                        <p className="text-xs text-slate-600">Maximum</p>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Indice de santé</span>
                          <span className="font-semibold text-emerald-700">{ndviData.health_index}%</span>
                        </div>
                        <Progress value={ndviData.health_index} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Couverture végétale</span>
                          <span className="font-semibold text-green-700">{ndviData.vegetation_coverage}%</span>
                        </div>
                        <Progress value={ndviData.vegetation_coverage} className="h-3 [&>div]:bg-green-500" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">Informations</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">Source:</span>
                          <span className="ml-2 font-medium">{ndviData.source}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Date:</span>
                          <span className="ml-2 font-medium">{ndviData.capture_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Culture:</span>
                          <span className="ml-2 font-medium">{ndviData.crop_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Stress:</span>
                          <span className="ml-2 font-medium">{ndviData.stress_zones} zones</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Leaf className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p>Sélectionnez une parcelle pour voir les données NDVI</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stress Tab */}
        <TabsContent value="stress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stress Summary */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Résumé de l'Analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stressData ? (
                  <>
                    <div className={cn("p-4 rounded-xl text-center", 
                      stressData.overall_health === "excellent" ? "bg-emerald-100" :
                      stressData.overall_health === "bon" ? "bg-green-100" :
                      "bg-orange-100"
                    )}>
                      <p className="text-4xl font-bold mb-2">
                        {stressData.total_stress_zones}
                      </p>
                      <p className="text-sm text-slate-600">Zones de stress détectées</p>
                      <Badge className="mt-2" variant="outline">
                        État: {stressData.overall_health}
                      </Badge>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Confiance IA</p>
                      <div className="flex items-center gap-2">
                        <Progress value={stressData.ai_confidence || 90} className="flex-1" />
                        <span className="text-sm font-medium">{stressData.ai_confidence || 90}%</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Recommandation</p>
                      <p className="text-sm text-slate-600">
                        {stressData.recommendations?.[0] || "Surveillance régulière recommandée"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Target className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p>Chargement de l'analyse...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stress Zones List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Zones de Stress Détectées
                </CardTitle>
                <CardDescription>
                  Analyse IA des anomalies détectées par satellite
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stressData?.stress_zones?.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {stressData.stress_zones.map((zone, index) => (
                        <div 
                          key={zone.id || index}
                          className={cn("p-4 rounded-xl border-2",
                            zone.severity === "élevé" ? "border-red-200 bg-red-50" :
                            zone.severity === "modéré" ? "border-orange-200 bg-orange-50" :
                            "border-yellow-200 bg-yellow-50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={cn("h-5 w-5",
                                zone.severity === "élevé" ? "text-red-600" :
                                zone.severity === "modéré" ? "text-orange-600" :
                                "text-yellow-600"
                              )} />
                              <span className="font-semibold">Zone {index + 1} - {zone.type}</span>
                            </div>
                            <Badge className={cn(
                              zone.severity === "élevé" ? "bg-red-500" :
                              zone.severity === "modéré" ? "bg-orange-500" :
                              "bg-yellow-500",
                              "text-white"
                            )}>
                              {zone.severity}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-slate-500">Surface:</span>
                              <span className="ml-2 font-medium">{zone.area_hectares} ha</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Position:</span>
                              <span className="ml-2 font-medium">
                                {zone.center?.lat?.toFixed(4)}, {zone.center?.lon?.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          {zone.recommendations?.length > 0 && (
                            <div className="mt-2 p-2 bg-white/50 rounded-lg">
                              <p className="text-xs font-semibold text-slate-700 mb-1">Actions:</p>
                              <ul className="text-xs text-slate-600 space-y-1">
                                {zone.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
                    <p className="text-lg font-semibold text-emerald-700">Aucune zone de stress détectée</p>
                    <p className="text-sm text-slate-500">Votre parcelle est en excellent état!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weatherData ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <Sun className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{weatherData.temperature?.toFixed(1)}°C</p>
                        <p className="text-slate-500">{weatherData.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Ressenti</p>
                        <p className="font-semibold">{weatherData.feels_like?.toFixed(1)}°C</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">UV Index</p>
                        <p className="font-semibold">{weatherData.uv_index}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Droplets className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{weatherData.humidity}%</p>
                        <p className="text-slate-500">Humidité</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Pression</p>
                        <p className="font-semibold">{weatherData.pressure} hPa</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Visibilité</p>
                        <p className="font-semibold">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                        <Wind className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-4xl font-bold">{weatherData.wind_speed?.toFixed(1)}</p>
                        <p className="text-slate-500">km/h Vent</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Direction</p>
                        <p className="font-semibold">{weatherData.wind_direction}°</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Rafales</p>
                        <p className="font-semibold">{weatherData.wind_gust?.toFixed(1)} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Conditions de vol drone</h3>
                      <Badge className={cn(
                        weatherData.flight_conditions === "favorable" ? "bg-emerald-500" : "bg-orange-500",
                        "text-white"
                      )}>
                        {weatherData.flight_conditions === "favorable" ? "Favorable" : "Défavorable"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={cn("p-4 rounded-xl text-center",
                        weatherData.wind_speed < 8 ? "bg-emerald-50" : "bg-orange-50"
                      )}>
                        <Wind className={cn("h-6 w-6 mx-auto mb-2",
                          weatherData.wind_speed < 8 ? "text-emerald-600" : "text-orange-600"
                        )} />
                        <p className="text-sm font-medium">Vent</p>
                        <p className="text-xs text-slate-500">
                          {weatherData.wind_speed < 8 ? "OK < 8 km/h" : `Attention: ${weatherData.wind_speed.toFixed(1)} km/h`}
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-xl text-center",
                        weatherData.visibility > 5000 ? "bg-emerald-50" : "bg-orange-50"
                      )}>
                        <Eye className={cn("h-6 w-6 mx-auto mb-2",
                          weatherData.visibility > 5000 ? "text-emerald-600" : "text-orange-600"
                        )} />
                        <p className="text-sm font-medium">Visibilité</p>
                        <p className="text-xs text-slate-500">
                          {weatherData.visibility > 5000 ? "Bonne" : "Réduite"}
                        </p>
                      </div>
                      <div className={cn("p-4 rounded-xl text-center",
                        weatherData.clouds < 80 ? "bg-emerald-50" : "bg-orange-50"
                      )}>
                        <Cloud className={cn("h-6 w-6 mx-auto mb-2",
                          weatherData.clouds < 80 ? "text-emerald-600" : "text-orange-600"
                        )} />
                        <p className="text-sm font-medium">Couverture</p>
                        <p className="text-xs text-slate-500">{weatherData.clouds}% nuages</p>
                      </div>
                      <div className="p-4 rounded-xl text-center bg-blue-50">
                        <Satellite className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-sm font-medium">Source</p>
                        <p className="text-xs text-slate-500">{weatherData.source}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="p-12 text-center">
                  <Cloud className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Chargement des données météo...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-violet-600" />
                  Analyser une Image Satellite/Drone
                </CardTitle>
                <CardDescription>
                  Téléversez une image pour analyse IA complète
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="satellite-upload"
                    disabled={analyzing}
                  />
                  <label htmlFor="satellite-upload" className="cursor-pointer">
                    {analyzing ? (
                      <>
                        <Loader2 className="h-12 w-12 mx-auto text-violet-600 animate-spin mb-4" />
                        <p className="text-slate-600">Analyse IA en cours...</p>
                      </>
                    ) : (
                      <>
                        <FileImage className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-600 font-medium">Cliquez pour uploader</p>
                        <p className="text-sm text-slate-400">ou glissez-déposez une image</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="p-4 bg-violet-50 rounded-xl">
                  <h4 className="font-semibold text-violet-800 mb-2">L'IA analysera:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      Type de culture et état de santé
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      Zones de stress et anomalies
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      NDVI estimé et rendement prévu
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Maladies et ravageurs détectés
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Résultats de l'Analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedAnalysis ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <p className="font-semibold text-emerald-800 mb-2">Analyse réussie</p>
                        <p className="text-sm text-slate-600">
                          ID: {uploadedAnalysis.analysis_id}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <pre className="text-xs text-slate-600 overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(uploadedAnalysis.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p>Aucune analyse en cours</p>
                    <p className="text-sm">Uploadez une image pour commencer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* World Tab */}
        <TabsContent value="world" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Cartographie des Cultures - Cameroun
              </CardTitle>
              <CardDescription>
                Données de production agricole par région
              </CardDescription>
            </CardHeader>
            <CardContent>
              {worldCrops ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {worldCrops.data?.crops?.map((crop, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border">
                      <h4 className="font-bold text-lg text-slate-800 mb-2">{crop.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Production:</span>
                          <span className="font-medium">{(crop.production_mt / 1000).toFixed(0)}K tonnes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Surface:</span>
                          <span className="font-medium">{(crop.area_ha / 1000).toFixed(0)}K ha</span>
                        </div>
                        {crop.regions && (
                          <div className="pt-2 border-t">
                            <span className="text-xs text-slate-500">Régions: </span>
                            <span className="text-xs font-medium">{crop.regions.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 mx-auto text-slate-300 mb-4 animate-pulse" />
                  <p className="text-slate-500">Chargement des données...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagesSatellites;
