import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Camera, Play, Pause, Eye, Leaf, Bug, 
  Droplets, Thermometer, Wind, Sun, Cloud,
  Activity, Zap, CheckCircle, AlertTriangle,
  BarChart3, TrendingUp, RefreshCw, Settings
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const CameraIA = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchLiveStats();
    // Simulate real-time updates
    const interval = setInterval(fetchLiveStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStats = async () => {
    try {
      const response = await api.get("/camera-ai/live-stats");
      setLiveStats(response.data);
    } catch (error) {
      console.error("Error fetching live stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFrame = async () => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image_data", "base64_simulated_frame_data");
      
      const response = await api.post("/camera-ai/analyze-frame", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAnalysisResult(response.data.analysis_results);
      toast.success("Analyse terminée en " + response.data.processing_time_ms + "ms");
    } catch (error) {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      toast.success("Flux vidéo démarré");
      // Auto-analyze every 3 seconds when streaming
      handleAnalyzeFrame();
    } else {
      toast.info("Flux vidéo arrêté");
    }
  };

  const getHealthBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent": return <Badge className="bg-emerald-100 text-emerald-700">Excellent</Badge>;
      case "bon": return <Badge className="bg-blue-100 text-blue-700">Bon</Badge>;
      case "attention": return <Badge className="bg-amber-100 text-amber-700">Attention</Badge>;
      case "critique": return <Badge className="bg-rose-100 text-rose-700">Critique</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="camera-ia-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Camera className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Caméra IA Temps Réel</h1>
            </div>
            <p className="text-white/80">Analyse en direct du sol, des plantes, du climat et des insectes</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <ActionTooltip content={isStreaming ? "Arrêter le flux vidéo" : "Démarrer le flux vidéo"}>
              <Button 
                className={cn(
                  "text-white",
                  isStreaming ? "bg-rose-500 hover:bg-rose-600" : "bg-white/20 hover:bg-white/30"
                )}
                onClick={toggleStreaming}
              >
                {isStreaming ? (
                  <><Pause className="h-4 w-4 mr-2" /> Arrêter</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Démarrer</>
                )}
              </Button>
            </ActionTooltip>
            <ActionTooltip content="Analyser l'image actuelle">
              <Button 
                className="bg-white text-teal-600 hover:bg-white/90"
                onClick={handleAnalyzeFrame}
                disabled={analyzing}
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Analyser
              </Button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionTooltip content="Nombre d'images analysées aujourd'hui">
          <Card className="card-hover cursor-help">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStats?.total_frames_analyzed_today || 0}</p>
                  <p className="text-xs text-slate-500">Frames analysées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Temps moyen de traitement IA">
          <Card className="card-hover cursor-help">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStats?.average_processing_time_ms || 0}ms</p>
                  <p className="text-xs text-slate-500">Temps moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Alertes générées aujourd'hui">
          <Card className="card-hover cursor-help">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStats?.alerts_generated || 0}</p>
                  <p className="text-xs text-slate-500">Alertes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>

        <ActionTooltip content="Score de santé moyen des cultures">
          <Card className="card-hover cursor-help">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStats?.health_score_average || 0}%</p>
                  <p className="text-xs text-slate-500">Santé moyenne</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </ActionTooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-teal-600" />
                Flux Vidéo
              </CardTitle>
              {isStreaming && (
                <Badge className="bg-rose-500 text-white animate-pulse">
                  <span className="h-2 w-2 bg-white rounded-full mr-1 inline-block"></span>
                  LIVE
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
              {isStreaming ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simulated video feed with animated gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-teal-900/50 to-blue-900/50 animate-pulse"></div>
                  <div className="relative z-10 text-center text-white">
                    <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Analyse en cours...</p>
                  </div>
                  
                  {/* HUD Overlays */}
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                    <span className="text-emerald-400">●</span> Caméra 1 - 1080p
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                    30 FPS | {new Date().toLocaleTimeString('fr-FR')}
                  </div>
                  
                  {/* Analysis overlays */}
                  {analysisResult && (
                    <>
                      <div className="absolute bottom-16 left-2 bg-emerald-500/80 px-2 py-1 rounded text-white text-xs">
                        🌱 Santé: {analysisResult.plant_analysis?.health_status}
                      </div>
                      <div className="absolute bottom-10 left-2 bg-blue-500/80 px-2 py-1 rounded text-white text-xs">
                        💧 Humidité sol: {analysisResult.soil_analysis?.moisture_percent}%
                      </div>
                      <div className="absolute bottom-4 left-2 bg-amber-500/80 px-2 py-1 rounded text-white text-xs">
                        🌡️ Temp: {analysisResult.environment_analysis?.temperature_estimate_c}°C
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Cliquez sur "Démarrer" pour activer le flux</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-1" /> Configurer
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" /> Zoom
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Camera className="h-4 w-4 mr-1" /> Capture
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Analysis Results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Analyse en Temps Réel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult ? (
              <>
                {/* Soil Analysis */}
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-800">Analyse du Sol</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Humidité</p>
                      <p className="font-semibold">{analysisResult.soil_analysis?.moisture_percent}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Texture</p>
                      <p className="font-semibold">{analysisResult.soil_analysis?.texture}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Couleur</p>
                      <p className="font-semibold">{analysisResult.soil_analysis?.color_index}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Matière organique</p>
                      <p className="font-semibold">{analysisResult.soil_analysis?.organic_matter_estimate}</p>
                    </div>
                  </div>
                </div>

                {/* Plant Analysis */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-800">Analyse des Plantes</h4>
                    </div>
                    {getHealthBadge(analysisResult.plant_analysis?.health_status)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Stade de croissance</p>
                      <p className="font-semibold">{analysisResult.plant_analysis?.growth_stage}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Hauteur estimée</p>
                      <p className="font-semibold">{analysisResult.plant_analysis?.estimated_height_cm} cm</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Indice foliaire</p>
                      <p className="font-semibold">{analysisResult.plant_analysis?.leaf_color_index}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Stress détecté</p>
                      <p className="font-semibold text-emerald-600">
                        {analysisResult.plant_analysis?.stress_indicators?.length === 0 ? "Aucun" : "Oui"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Environment Analysis */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Environnement</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span>{analysisResult.environment_analysis?.temperature_estimate_c}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>{analysisResult.environment_analysis?.humidity_estimate_percent}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>{analysisResult.environment_analysis?.light_level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-slate-500" />
                      <span>{analysisResult.environment_analysis?.wind_detected}</span>
                    </div>
                  </div>
                </div>

                {/* Pest Detection */}
                <div className="p-4 bg-rose-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-rose-600" />
                      <h4 className="font-semibold text-rose-800">Détection Ravageurs</h4>
                    </div>
                    <Badge className={cn(
                      analysisResult.pest_detection?.risk_level === "faible" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    )}>
                      Risque {analysisResult.pest_detection?.risk_level}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-600">
                      {analysisResult.pest_detection?.insects_detected?.length === 0 
                        ? "Aucun insecte nuisible détecté" 
                        : "Insectes détectés: " + analysisResult.pest_detection?.insects_detected?.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Yield Prediction */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                    <h4 className="font-semibold text-violet-800">Prédiction de Rendement</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-violet-700">{analysisResult.yield_prediction?.estimated_yield_kg_ha}</p>
                      <p className="text-xs text-slate-500">kg/ha estimé</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-700">{analysisResult.yield_prediction?.confidence_percent}%</p>
                      <p className="text-xs text-slate-500">Confiance</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-700">{analysisResult.yield_prediction?.harvest_window_days}</p>
                      <p className="text-xs text-slate-500">Jours récolte</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Cliquez sur "Analyser" pour voir les résultats</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-teal-800">Caméra IA AGRICAM</h3>
              <p className="text-teal-700 mt-1">
                Notre système de vision par ordinateur analyse en temps réel:
              </p>
              <ul className="mt-2 text-sm text-teal-600 space-y-1">
                <li>• Sol: humidité, texture, couleur, matière organique</li>
                <li>• Plantes: santé, croissance, stress, hauteur</li>
                <li>• Environnement: température, humidité, vent, lumière</li>
                <li>• Ravageurs: insectes, maladies, risques</li>
                <li>• Prédiction de rendement avec confiance IA</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraIA;
