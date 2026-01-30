import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Camera,
  Video,
  Upload,
  Pause,
  Play,
  Square,
  Leaf,
  Bug,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
  Apple,
  Flower2,
  TreePine,
  Scan,
  Sparkles,
  FlaskConical,
  Target,
  TrendingUp,
  Download,
  RefreshCw,
  Maximize2,
  Grid3X3
} from "lucide-react";
import { aiCameraRecognize, aiSoilAnalysis, aiPredictHarvest, getParcels } from "../services/api";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const CameraIA = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("full"); // full, soil, harvest
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchParcels();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await getParcels();
      setParcels(response.data);
    } catch (error) {
      console.error("Error fetching parcels:", error);
    }
  };

  const startCamera = async () => {
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
        setCameraPermission(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setCameraPermission(false);
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await analyzeImage(blob, 'capture.jpg');
    }, 'image/jpeg', 0.9);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await analyzeImage(file, file.name);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeImage = async (blob, filename) => {
    setIsAnalyzing(true);

    try {
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
      let response;

      switch (analysisMode) {
        case "soil":
          response = await aiSoilAnalysis(file, selectedParcel?.id);
          break;
        case "harvest":
          response = await aiPredictHarvest(file, selectedParcel?.id, selectedParcel?.crop_type);
          break;
        default:
          response = await aiCameraRecognize(file, selectedParcel?.id);
      }
      
      if (response.data) {
        const result = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          mode: analysisMode,
          parcel: selectedParcel?.name,
          ...response.data
        };
        setCurrentAnalysis(result);
        setRecognitionResults(prev => [result, ...prev.slice(0, 19)]);
        toast.success("Analyse IA terminée!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erreur lors de l'analyse IA");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "plante": return <Leaf className="h-4 w-4" />;
      case "fruit": return <Apple className="h-4 w-4" />;
      case "legume": return <Flower2 className="h-4 w-4" />;
      case "insecte": return <Bug className="h-4 w-4" />;
      case "maladie": return <AlertTriangle className="h-4 w-4" />;
      case "sol": return <FlaskConical className="h-4 w-4" />;
      case "rongeur": return <Target className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category, isDangerous) => {
    if (isDangerous) return "bg-rose-500 border-rose-300";
    switch (category?.toLowerCase()) {
      case "plante": return "bg-emerald-500 border-emerald-300";
      case "fruit": return "bg-orange-500 border-orange-300";
      case "maladie": return "bg-rose-500 border-rose-300";
      case "insecte": return "bg-yellow-500 border-yellow-300";
      case "sol": return "bg-amber-600 border-amber-300";
      default: return "bg-blue-500 border-blue-300";
    }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="camera-ia-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Scan className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-[Manrope]">Caméra IA Agricole</h1>
                <p className="text-white/80">Reconnaissance en temps réel • Gemini Vision AI</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={analysisMode} onValueChange={setAnalysisMode}>
              <SelectTrigger className="w-[160px] bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">
                  <span className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" /> Complet
                  </span>
                </SelectItem>
                <SelectItem value="soil">
                  <span className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" /> Sol
                  </span>
                </SelectItem>
                <SelectItem value="harvest">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Récolte
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={selectedParcel?.id || "none"} 
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedParcel(null);
                } else {
                  const parcel = parcels.find(p => p.id === value);
                  setSelectedParcel(parcel);
                }
              }}
            >
              <SelectTrigger className="w-[180px] bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Parcelle (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune parcelle</SelectItem>
                {parcels.map(parcel => (
                  <SelectItem key={parcel.id} value={parcel.id}>
                    {parcel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-violet-600" />
                  Flux Caméra
                  {isStreaming && (
                    <Badge className="bg-red-500 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-white mr-1"></span>
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Uploader
                  </Button>
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
                <canvas ref={canvasRef} className="hidden" />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="relative mb-6">
                      <Camera className="h-20 w-20 text-violet-400" />
                      <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <p className="text-slate-400 mb-2 text-lg">
                      {cameraPermission === false 
                        ? "Accès caméra refusé. Vérifiez vos paramètres."
                        : "Caméra non active"}
                    </p>
                    <p className="text-slate-500 text-sm mb-6 max-w-md text-center">
                      Pointez la caméra vers une plante, un insecte, ou le sol pour une analyse IA instantanée
                    </p>
                    <Button onClick={startCamera} className="bg-violet-600 hover:bg-violet-700" size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Activer la Caméra
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-violet-400" />
                        <Sparkles className="h-6 w-6 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
                      </div>
                      <p className="text-lg font-semibold">Analyse IA en cours...</p>
                      <p className="text-sm text-slate-300">Gemini Vision analyse votre image</p>
                    </div>
                  </div>
                )}

                {/* Real-time Detection Overlay */}
                {currentAnalysis?.recognition?.objects && currentAnalysis.recognition.objects.length > 0 && isStreaming && (
                  <div className="absolute top-4 left-4 right-4 space-y-2">
                    {currentAnalysis.recognition.objects.slice(0, 3).map((obj, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border-2 text-white backdrop-blur-sm",
                          getCategoryColor(obj.category, obj.is_dangerous || obj.is_disease)
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(obj.category)}
                            <span className="font-bold">{obj.name}</span>
                          </div>
                          <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
                            {Math.round((obj.confidence || 0.9) * 100)}%
                          </span>
                        </div>
                        {obj.scientific_name && (
                          <p className="text-xs italic mt-1 text-white/80">{obj.scientific_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Analysis Mode Indicator */}
                {isStreaming && (
                  <div className="absolute bottom-4 right-4">
                    <Badge className={cn(
                      "text-white",
                      analysisMode === "full" ? "bg-violet-600" :
                      analysisMode === "soil" ? "bg-amber-600" : "bg-emerald-600"
                    )}>
                      {analysisMode === "full" ? "Reconnaissance complète" :
                       analysisMode === "soil" ? "Analyse du sol" : "Prédiction récolte"}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4 flex gap-2 justify-center bg-gradient-to-r from-slate-100 to-slate-50">
                {isStreaming ? (
                  <>
                    <Button onClick={stopCamera} variant="destructive" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Arrêter
                    </Button>
                    <Button 
                      onClick={captureAndAnalyze} 
                      disabled={isAnalyzing}
                      className="bg-violet-600 hover:bg-violet-700"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Scan className="h-5 w-5 mr-2" />
                      )}
                      Analyser Maintenant
                    </Button>
                  </>
                ) : (
                  <Button onClick={startCamera} className="bg-violet-600 hover:bg-violet-700" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Démarrer la Caméra
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {/* Current Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                Résultat de l'Analyse
              </CardTitle>
              {currentAnalysis && (
                <CardDescription>
                  {currentAnalysis.parcel && `Parcelle: ${currentAnalysis.parcel} • `}
                  {new Date(currentAnalysis.timestamp).toLocaleTimeString("fr-FR")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {currentAnalysis ? (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Overall Assessment */}
                    {(currentAnalysis.recognition?.overall_assessment || currentAnalysis.soil_analysis || currentAnalysis.prediction) && (
                      <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                        <p className="text-sm text-slate-700">
                          {currentAnalysis.recognition?.overall_assessment || 
                           currentAnalysis.soil_analysis?.raw_analysis?.substring(0, 200) ||
                           currentAnalysis.prediction?.raw_analysis?.substring(0, 200) ||
                           "Analyse complète effectuée"}
                        </p>
                      </div>
                    )}
                    
                    {/* Objects Detected (Full mode) */}
                    {currentAnalysis.recognition?.objects?.map((obj, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "p-4 rounded-xl border-2",
                          obj.is_dangerous || obj.is_disease
                            ? "border-rose-200 bg-rose-50"
                            : "border-emerald-200 bg-emerald-50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(obj.category)}
                            <span className="font-bold text-slate-800">{obj.name}</span>
                          </div>
                          <Badge className={cn(
                            "text-white",
                            obj.is_dangerous || obj.is_disease ? "bg-rose-500" : "bg-emerald-500"
                          )}>
                            {obj.is_disease ? "Maladie" : obj.is_dangerous ? "Danger" : "Sain"}
                          </Badge>
                        </div>
                        
                        {obj.scientific_name && (
                          <p className="text-xs italic text-slate-500 mb-2">
                            {obj.scientific_name}
                          </p>
                        )}
                        
                        {obj.description && (
                          <p className="text-sm text-slate-600 mb-3">{obj.description}</p>
                        )}

                        {/* Confidence */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Confiance</span>
                            <span className="font-medium">{Math.round((obj.confidence || 0.9) * 100)}%</span>
                          </div>
                          <Progress value={(obj.confidence || 0.9) * 100} className="h-2" />
                        </div>
                        
                        {obj.recommendations?.length > 0 && (
                          <div className="mt-3 p-3 bg-white/70 rounded-lg">
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                              Recommandations:
                            </p>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {obj.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Soil Analysis Results */}
                    {currentAnalysis.soil_analysis && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          <FlaskConical className="h-5 w-5" />
                          Analyse du Sol
                        </h4>
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-auto">
                          {typeof currentAnalysis.soil_analysis === 'string' 
                            ? currentAnalysis.soil_analysis 
                            : JSON.stringify(currentAnalysis.soil_analysis, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Harvest Prediction */}
                    {currentAnalysis.prediction && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Prédiction de Récolte
                        </h4>
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-auto">
                          {typeof currentAnalysis.prediction === 'string' 
                            ? currentAnalysis.prediction 
                            : JSON.stringify(currentAnalysis.prediction, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Immediate Actions */}
                    {currentAnalysis.recognition?.immediate_actions?.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Actions Immédiates</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {currentAnalysis.recognition.immediate_actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="relative inline-block mb-4">
                    <Camera className="h-16 w-16 text-slate-300" />
                    <Sparkles className="h-6 w-6 text-violet-400 absolute -top-1 -right-1" />
                  </div>
                  <p className="font-medium">Aucune analyse en cours</p>
                  <p className="text-sm text-slate-400 mt-1">Capturez ou uploadez une image</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Historique</CardTitle>
                <Badge variant="outline">{recognitionResults.length} analyses</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {recognitionResults.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Aucun historique
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recognitionResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => setCurrentAnalysis(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "text-xs",
                              result.mode === "full" ? "bg-violet-100 text-violet-700" :
                              result.mode === "soil" ? "bg-amber-100 text-amber-700" :
                              "bg-emerald-100 text-emerald-700"
                            )}>
                              {result.mode === "full" ? "Complet" : 
                               result.mode === "soil" ? "Sol" : "Récolte"}
                            </Badge>
                            <span className="text-sm font-medium">
                              {result.recognition?.objects?.[0]?.name || 
                               (result.mode === "soil" ? "Analyse sol" : "Prédiction")}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(result.timestamp).toLocaleTimeString("fr-FR")}
                          </span>
                        </div>
                        {result.parcel && (
                          <p className="text-xs text-slate-500 mt-1">
                            Parcelle: {result.parcel}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Info */}
      <Card className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-violet-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-violet-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Capacités de Reconnaissance IA
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Leaf className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Plantes</p>
              <p className="text-xs text-slate-500">Cultures & variétés</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Apple className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Fruits</p>
              <p className="text-xs text-slate-500">Maturité & qualité</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <Bug className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Insectes</p>
              <p className="text-xs text-slate-500">Nuisibles & auxiliaires</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <AlertTriangle className="h-8 w-8 mx-auto text-rose-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Maladies</p>
              <p className="text-xs text-slate-500">Diagnostic & traitement</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <FlaskConical className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Sol</p>
              <p className="text-xs text-slate-500">NPK & composition</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-xl">
              <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-700">Récolte</p>
              <p className="text-xs text-slate-500">Prédiction rendement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraIA;
