import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
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
  TreePine
} from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const CameraIA = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      
      setIsAnalyzing(true);
      
      try {
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');
        
        const response = await api.post('/ai/camera/recognize', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          const result = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...response.data.recognition
          };
          setCurrentAnalysis(result);
          setRecognitionResults(prev => [result, ...prev.slice(0, 9)]);
          toast.success("Analyse terminée!");
        }
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("Erreur lors de l'analyse");
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/ai/camera/recognize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const result = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...response.data.recognition
        };
        setCurrentAnalysis(result);
        setRecognitionResults(prev => [result, ...prev.slice(0, 9)]);
        toast.success("Analyse terminée!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "plante": return <Leaf className="h-4 w-4" />;
      case "fruit": return <Apple className="h-4 w-4" />;
      case "legume": return <Flower2 className="h-4 w-4" />;
      case "insecte": return <Bug className="h-4 w-4" />;
      case "maladie": return <AlertTriangle className="h-4 w-4" />;
      case "tubercule": return <TreePine className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getObjectBadge = (obj) => {
    if (obj.is_disease || obj.is_dangerous) {
      return (
        <Badge className="bg-rose-500 text-white">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {obj.is_disease ? "Maladie" : "Danger"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500 text-white">
        <CheckCircle className="h-3 w-3 mr-1" />
        Sain
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="camera-ia-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Camera className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Caméra IA - Reconnaissance Agricole</h1>
        </div>
        <p className="text-white/80">
          Identifiez instantanément plantes, fruits, insectes et maladies avec l'IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-violet-600" />
                  Flux caméra
                </CardTitle>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="h-16 w-16 text-slate-500 mb-4" />
                    <p className="text-slate-400 mb-4">
                      {cameraPermission === false 
                        ? "Accès caméra refusé. Vérifiez vos paramètres."
                        : "Caméra non active"}
                    </p>
                    <Button onClick={startCamera} className="bg-violet-600 hover:bg-violet-700">
                      <Play className="h-4 w-4 mr-2" />
                      Activer la caméra
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <p>Analyse en cours...</p>
                    </div>
                  </div>
                )}

                {/* Detection Overlay */}
                {currentAnalysis?.objects && currentAnalysis.objects.length > 0 && (
                  <div className="absolute top-4 left-4 right-4">
                    {currentAnalysis.objects.map((obj, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg mb-2 border-2 ${
                          obj.is_dangerous || obj.is_disease
                            ? "bg-rose-500/90 border-rose-300"
                            : "bg-emerald-500/90 border-emerald-300"
                        } text-white`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(obj.category)}
                            <span className="font-bold">{obj.name}</span>
                          </div>
                          <span className="text-sm">{Math.round(obj.confidence * 100)}%</span>
                        </div>
                        {obj.scientific_name && (
                          <p className="text-xs italic mt-1">{obj.scientific_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 flex gap-2 justify-center bg-slate-100">
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
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-2" />
                      )}
                      Capturer & Analyser
                    </Button>
                  </>
                ) : (
                  <Button onClick={startCamera} className="bg-violet-600 hover:bg-violet-700">
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer la caméra
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
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Analyse actuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAnalysis ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                    {currentAnalysis.overall_assessment || "Analyse complète"}
                  </p>
                  
                  {currentAnalysis.objects?.map((obj, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border-2 ${
                        obj.is_dangerous || obj.is_disease
                          ? "border-rose-200 bg-rose-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(obj.category)}
                          <span className="font-bold">{obj.name}</span>
                        </div>
                        {getObjectBadge(obj)}
                      </div>
                      
                      {obj.scientific_name && (
                        <p className="text-xs italic text-slate-500 mb-2">
                          {obj.scientific_name}
                        </p>
                      )}
                      
                      <p className="text-sm text-slate-600">{obj.description}</p>
                      
                      {obj.recommendations?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            Recommandations:
                          </p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {obj.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Camera className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <p>Aucune analyse en cours</p>
                  <p className="text-xs mt-1">Capturez une image pour commencer</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique</CardTitle>
              <CardDescription>
                {recognitionResults.length} analyse(s) récente(s)
              </CardDescription>
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
                        className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100"
                        onClick={() => setCurrentAnalysis(result)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {result.objects?.[0]?.name || "Analyse"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(result.timestamp).toLocaleTimeString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {result.objects?.length || 0} objet(s) détecté(s)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-violet-800 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Guide d'utilisation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-violet-700">Plantes</p>
              <p className="text-slate-600">Identification des cultures et plantes sauvages</p>
            </div>
            <div>
              <p className="font-medium text-violet-700">Fruits & Légumes</p>
              <p className="text-slate-600">Reconnaissance et évaluation de maturité</p>
            </div>
            <div>
              <p className="font-medium text-violet-700">Insectes</p>
              <p className="text-slate-600">Détection des nuisibles et auxiliaires</p>
            </div>
            <div>
              <p className="font-medium text-violet-700">Maladies</p>
              <p className="text-slate-600">Diagnostic visuel des pathologies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraIA;
