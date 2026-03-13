import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../App";
import {
  Camera, Video, StopCircle, RotateCcw, Zap, Leaf, Bug,
  Droplets, Mountain, Download, History, ChevronRight, X,
  AlertTriangle, CheckCircle, Loader2, Eye, Maximize2, ScanLine
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const ANALYSIS_MODES = [
  { id: "general", icon: ScanLine, label: "Analyse generale", color: "emerald" },
  { id: "disease", icon: Leaf, label: "Detection maladies", color: "red" },
  { id: "pest", icon: Bug, label: "Detection ravageurs", color: "amber" },
  { id: "nutrition", icon: Droplets, label: "Carences nutritives", color: "blue" },
  { id: "soil", icon: Mountain, label: "Analyse du sol", color: "orange" },
];

const HEALTH_COLORS = {
  excellent: "text-emerald-400 bg-emerald-900/30",
  bon: "text-green-400 bg-green-900/30",
  attention: "text-amber-400 bg-amber-900/30",
  critique: "text-red-400 bg-red-900/30",
};

const CameraIA = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("general");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchHistory();
    return () => stopCamera();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/camera/scans?limit=10");
      setScanHistory(res.data);
    } catch {}
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedImage(null);
      setAnalysisResult(null);
    } catch (err) {
      toast.error("Impossible d'acceder a la camera. Verifiez les permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setTimeout(startCamera, 300);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    setAnalysisResult(null);
    stopCamera();
  }, []);

  const analyzeImage = async () => {
    if (!capturedImage) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const base64Data = capturedImage.split(",")[1];
      const res = await api.post("/camera/analyze", {
        image_base64: base64Data,
        analysis_mode: analysisMode,
        role: user?.role || "farmer",
        language: language
      });
      setAnalysisResult(res.data);
      fetchHistory();
      toast.success("Analyse terminee !");
    } catch (err) {
      toast.error("Erreur lors de l'analyse. Reessayez.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Format non supporte"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setAnalysisResult(null);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const result = analysisResult?.result;
  const healthClass = result ? HEALTH_COLORS[result.health_status] || HEALTH_COLORS.bon : "";

  return (
    <div className="space-y-6 animate-slide-in" data-testid="camera-ia-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[Manrope]">
            {t("pages.camera.title")} <span className="text-emerald-400">Intelligente</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Analyse IA en temps reel avec basculement automatique</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="border-slate-700 text-slate-300 hover:text-emerald-400"
            data-testid="camera-history-btn"
          >
            <History className="h-4 w-4 mr-1" /> Historique
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera / Preview Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#111827] border-slate-800 overflow-hidden">
            <CardContent className="p-0 relative">
              <div className="aspect-video bg-black relative flex items-center justify-center min-h-[360px]">
                {cameraActive && !capturedImage && (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted data-testid="camera-feed" />
                    {/* AR Overlay Grid */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-emerald-500/10" />
                        ))}
                      </div>
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-white/70 font-mono">LIVE</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-emerald-900/60 text-emerald-400 text-xs">
                          {ANALYSIS_MODES.find(m => m.id === analysisMode)?.label}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
                {capturedImage && (
                  <img src={capturedImage} alt="Capture" className="w-full h-full object-contain" data-testid="captured-image" />
                )}
                {!cameraActive && !capturedImage && (
                  <div className="text-center p-8">
                    <Camera className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">Demarrez la camera ou importez une image</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700" data-testid="start-camera-btn">
                        <Camera className="h-4 w-4 mr-2" /> {t("pages.camera.startCamera")}
                      </Button>
                      <label className="cursor-pointer">
                        <Button variant="outline" className="border-slate-700 text-slate-300" asChild>
                          <span><Download className="h-4 w-4 mr-2" /> Importer image</span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} data-testid="upload-image-input" />
                      </label>
                    </div>
                  </div>
                )}
                {/* AR Overlay for results */}
                {result?.ar_zones && capturedImage && (
                  <div className="absolute inset-0 pointer-events-none">
                    {result.ar_zones.map((zone, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute rounded-lg border-2 p-1",
                          zone.color === "red" ? "border-red-500/60 bg-red-500/10" :
                          zone.color === "yellow" ? "border-amber-500/60 bg-amber-500/10" :
                          "border-emerald-500/60 bg-emerald-500/10"
                        )}
                        style={{
                          top: `${10 + i * 20}%`, left: `${5 + i * 10}%`,
                          width: `${zone.area_percent || 30}%`, height: "25%"
                        }}
                      >
                        <span className="text-[10px] text-white font-mono bg-black/50 px-1 rounded">
                          {zone.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {/* Camera Controls */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {cameraActive && (
              <>
                <Button onClick={capturePhoto} size="lg" className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-14 h-14" data-testid="capture-btn">
                  <Camera className="h-6 w-6" />
                </Button>
                <Button onClick={switchCamera} variant="outline" className="border-slate-700 text-slate-300 rounded-full w-10 h-10 p-0" data-testid="switch-camera-btn">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button onClick={stopCamera} variant="outline" className="border-red-800 text-red-400 rounded-full w-10 h-10 p-0" data-testid="stop-camera-btn">
                  <StopCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {capturedImage && (
              <>
                <Button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="analyze-btn"
                >
                  {analyzing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Zap className="h-5 w-5 mr-2" />}
                  {analyzing ? "Analyse en cours..." : "Analyser avec IA"}
                </Button>
                <Button onClick={resetCapture} variant="outline" className="border-slate-700 text-slate-300" data-testid="reset-capture-btn">
                  <RotateCcw className="h-4 w-4 mr-2" /> Reprendre
                </Button>
                <Button onClick={startCamera} variant="outline" className="border-slate-700 text-slate-300">
                  <Camera className="h-4 w-4 mr-2" /> Nouvelle capture
                </Button>
              </>
            )}
          </div>

          {/* Analysis Result */}
          {result && (
            <Card className="bg-[#111827] border-slate-800" data-testid="analysis-result">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Resultat de l'analyse</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={healthClass}>
                      {result.health_status === "excellent" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {result.health_status === "critique" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {(result.health_status || "").toUpperCase()}
                    </Badge>
                    {analysisResult?.model && (
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                        {analysisResult.model} - {analysisResult.response_time_ms}ms
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Confiance</span>
                    <span className="text-emerald-400">{result.confidence || 0}%</span>
                  </div>
                  <Progress value={result.confidence || 0} className="h-2" />
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-slate-300">{result.summary}</p>
                  </div>
                )}

                {/* Crop type */}
                {result.crop_type && (
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-slate-400">Culture detectee:</span>
                    <span className="text-sm text-white font-medium">{result.crop_type}</span>
                  </div>
                )}

                {/* Detections */}
                {result.detections && result.detections.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Detections</h4>
                    <div className="space-y-2">
                      {result.detections.map((d, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
                          <Badge className={cn("text-xs",
                            d.severity === "high" ? "bg-red-900/40 text-red-400" :
                            d.severity === "medium" ? "bg-amber-900/40 text-amber-400" :
                            "bg-emerald-900/40 text-emerald-400"
                          )}>
                            {d.severity}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-white">{d.name}</p>
                            <p className="text-xs text-slate-500">{d.description}</p>
                          </div>
                          <span className="text-xs text-slate-400">{d.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Recommandations</h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Mode Selection & History */}
        <div className="space-y-4">
          {/* Analysis Mode Selector */}
          <Card className="bg-[#111827] border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Mode d'analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ANALYSIS_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setAnalysisMode(mode.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                    analysisMode === mode.id
                      ? "bg-emerald-900/30 border border-emerald-500/40 text-emerald-400"
                      : "bg-slate-800/30 hover:bg-slate-800/60 text-slate-400"
                  )}
                  data-testid={`mode-${mode.id}`}
                >
                  <mode.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{mode.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#111827] border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                  <p className="text-xl font-bold text-emerald-400">{scanHistory.length}</p>
                  <p className="text-xs text-slate-500">Scans total</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                  <p className="text-xl font-bold text-blue-400">
                    {scanHistory.filter(s => s.result?.detections?.length > 0).length}
                  </p>
                  <p className="text-xs text-slate-500">Detections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent History */}
          {showHistory && (
            <Card className="bg-[#111827] border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Historique recent</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="h-6 w-6 p-0 text-slate-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Aucun scan</p>
                ) : scanHistory.map((scan, i) => (
                  <button
                    key={scan.id || i}
                    onClick={() => setSelectedScan(scan)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className={cn("w-2 h-2 rounded-full",
                      scan.result?.health_status === "critique" ? "bg-red-500" :
                      scan.result?.health_status === "attention" ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{scan.mode}</p>
                      <p className="text-[10px] text-slate-500">{new Date(scan.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                      {scan.result?.health_status}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Selected Scan Detail */}
          {selectedScan && (
            <Card className="bg-[#111827] border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Detail du scan</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedScan(null)} className="h-6 w-6 p-0 text-slate-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mode</span>
                  <span className="text-white">{selectedScan.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statut</span>
                  <Badge className={HEALTH_COLORS[selectedScan.result?.health_status] || ""}>
                    {selectedScan.result?.health_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Modele</span>
                  <span className="text-xs text-emerald-400">{selectedScan.model}</span>
                </div>
                {selectedScan.result?.summary && (
                  <p className="text-xs text-slate-400 p-2 bg-slate-800/50 rounded">{selectedScan.result.summary}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraIA;
