import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Camera, Play, Pause, Eye, Leaf, Bug,
  Droplets, Thermometer, Wind, Sun, Cloud,
  Activity, Zap, CheckCircle, AlertTriangle,
  BarChart3, TrendingUp, RefreshCw, Settings,
  Smartphone, Monitor, Video, ImageIcon, Loader2,
  SwitchCamera, Maximize, Download, X
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
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchLiveStats();
    enumerateDevices();
    const iv = setInterval(fetchLiveStats, 10000);
    return () => { clearInterval(iv); stopCamera(); };
  }, []);

  const enumerateDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) setSelectedDevice(videoDevices[0].deviceId);
    } catch { setDevices([]); }
  };

  const fetchLiveStats = async () => {
    try {
      const response = await api.get("/camera-ai/live-stats");
      setLiveStats(response.data);
    } catch {} finally { setLoading(false); }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: selectedDevice
          ? { deviceId: { exact: selectedDevice }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
      toast.success("Camera connectee avec succes !");
      await enumerateDevices();
    } catch (err) {
      setCameraError(err.message);
      toast.error("Impossible d'acceder a la camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);
    setAutoAnalyze(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    setTimeout(startCamera, 300);
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const analyzeCurrentFrame = async () => {
    setAnalyzing(true);
    try {
      const frameDataUrl = captureFrame();
      if (frameDataUrl) {
        setCapturedImage(frameDataUrl);
        const base64 = frameDataUrl.split(",")[1];
        const response = await api.post("/camera-ai/analyze-frame", {
          image_data: base64
        });
        setAnalysisResult(response.data.analysis_results || response.data);
        toast.success("Analyse terminee !");
      } else {
        const response = await api.post("/camera-ai/analyze-frame", {
          image_data: "simulated_frame"
        });
        setAnalysisResult(response.data.analysis_results || response.data);
        toast.success("Analyse terminee (mode demo) !");
      }
    } catch {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAutoAnalyze = () => {
    if (autoAnalyze) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setAutoAnalyze(false);
      toast.info("Analyse automatique desactivee");
    } else {
      analyzeCurrentFrame();
      intervalRef.current = setInterval(analyzeCurrentFrame, 5000);
      setAutoAnalyze(true);
      toast.success("Analyse automatique activee (toutes les 5s)");
    }
  };

  const downloadCapture = () => {
    const img = capturedImage || captureFrame();
    if (!img) return;
    const a = document.createElement("a");
    a.href = img;
    a.download = `agricam_capture_${Date.now()}.jpg`;
    a.click();
    toast.success("Image telechargee !");
  };

  const getHealthBadge = (status) => {
    const map = { "excellent": "bg-emerald-100 text-emerald-700", "bon": "bg-blue-100 text-blue-700", "attention": "bg-amber-100 text-amber-700", "critique": "bg-rose-100 text-rose-700" };
    return <Badge className={map[status?.toLowerCase()] || "bg-slate-100"}>{status || "N/A"}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="camera-ia-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Camera className="h-7 w-7" />
              <h1 className="text-2xl font-bold">Camera IA Temps Reel</h1>
              {isStreaming && <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>}
            </div>
            <p className="text-white/80 text-sm">Connectez votre camera pour analyser en temps reel</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className={cn("text-white", isStreaming ? "bg-rose-500 hover:bg-rose-600" : "bg-white/20 hover:bg-white/30")} onClick={isStreaming ? stopCamera : startCamera} data-testid="toggle-camera-btn">
              {isStreaming ? <><Pause className="h-4 w-4 mr-2" /> Arreter</> : <><Play className="h-4 w-4 mr-2" /> Demarrer</>}
            </Button>
            <Button className="bg-white text-teal-600 hover:bg-white/90" onClick={analyzeCurrentFrame} disabled={analyzing} data-testid="analyze-btn">
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />} Analyser
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Eye, label: "Frames analysees", val: liveStats?.total_frames_analyzed_today || 0, color: "teal" },
          { icon: Activity, label: "Temps moyen", val: `${liveStats?.average_processing_time_ms || 0}ms`, color: "blue" },
          { icon: AlertTriangle, label: "Alertes", val: liveStats?.alerts_generated || 0, color: "amber" },
          { icon: Leaf, label: "Sante moyenne", val: `${liveStats?.health_score_average || 0}%`, color: "emerald" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", `bg-${s.color}-100`)}>
                <s.icon className={cn("h-4 w-4", `text-${s.color}-600`)} />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">{s.val}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Camera className="h-4 w-4 text-teal-600" /> Flux Camera</span>
              {isStreaming && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={switchCamera} data-testid="switch-camera"><SwitchCamera className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadCapture} data-testid="download-capture"><Download className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Device selector */}
            <div className="flex gap-2 items-center">
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="text-xs h-8 flex-1" data-testid="device-select">
                  <SelectValue placeholder="Selectionnez un appareil..." />
                </SelectTrigger>
                <SelectContent>
                  {devices.length > 0 ? devices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${devices.indexOf(d) + 1}`}</SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>Aucun appareil detecte</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={enumerateDevices}><RefreshCw className="h-3 w-3 mr-1" /> Rafraichir</Button>
            </div>

            {/* Video */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", !isStreaming && "hidden")} data-testid="video-feed" />
              <canvas ref={canvasRef} className="hidden" />

              {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                  {cameraError ? (
                    <>
                      <AlertTriangle className="h-12 w-12 text-amber-400" />
                      <p className="text-sm text-center px-4">{cameraError}</p>
                      <Button size="sm" onClick={startCamera} className="bg-teal-600 text-white">Reessayer</Button>
                    </>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 opacity-30" />
                      <p className="text-sm">Cliquez "Demarrer" pour connecter votre camera</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline"><Smartphone className="h-3 w-3 mr-1" /> Telephone</Badge>
                        <Badge variant="outline"><Monitor className="h-3 w-3 mr-1" /> Webcam</Badge>
                        <Badge variant="outline"><Video className="h-3 w-3 mr-1" /> USB</Badge>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* HUD overlay when streaming */}
              {isStreaming && (
                <>
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-[10px]">
                    <span className="text-emerald-400 mr-1">&#9679;</span>
                    {devices.find(d => d.deviceId === selectedDevice)?.label || "Camera active"}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-white text-[10px]">
                    {new Date().toLocaleTimeString("fr-FR")}
                  </div>
                  {analysisResult && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg p-2 flex gap-2 flex-wrap text-[10px] text-white">
                      <span className="bg-emerald-500/80 px-1.5 py-0.5 rounded">Sante: {analysisResult.plant_analysis?.health_status || "N/A"}</span>
                      <span className="bg-blue-500/80 px-1.5 py-0.5 rounded">Humidite: {analysisResult.soil_analysis?.moisture_percent || "N/A"}%</span>
                      <span className="bg-amber-500/80 px-1.5 py-0.5 rounded">Temp: {analysisResult.environment_analysis?.temperature_estimate_c || "N/A"}C</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button variant={autoAnalyze ? "default" : "outline"} size="sm" className={cn("flex-1 text-xs", autoAnalyze && "bg-teal-600")} onClick={toggleAutoAnalyze} disabled={!isStreaming && !analysisResult} data-testid="auto-analyze-btn">
                <RefreshCw className={cn("h-3 w-3 mr-1", autoAnalyze && "animate-spin")} /> Auto-analyse {autoAnalyze ? "ON" : "OFF"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={analyzeCurrentFrame} disabled={analyzing} data-testid="manual-analyze-btn">
                <ImageIcon className="h-3 w-3 mr-1" /> Capturer & Analyser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-teal-600" /> Analyse en Temps Reel</CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {/* Soil */}
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><Droplets className="h-4 w-4 text-amber-600" /><span className="text-sm font-semibold text-amber-800">Sol</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">Humidite</span><p className="font-semibold">{analysisResult.soil_analysis?.moisture_percent}%</p></div>
                    <div><span className="text-slate-500">Texture</span><p className="font-semibold">{analysisResult.soil_analysis?.texture}</p></div>
                    <div><span className="text-slate-500">Couleur</span><p className="font-semibold">{analysisResult.soil_analysis?.color_index}</p></div>
                    <div><span className="text-slate-500">Matiere organique</span><p className="font-semibold">{analysisResult.soil_analysis?.organic_matter_estimate}</p></div>
                  </div>
                </div>

                {/* Plants */}
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-600" /><span className="text-sm font-semibold text-emerald-800">Plantes</span></div>
                    {getHealthBadge(analysisResult.plant_analysis?.health_status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">Croissance</span><p className="font-semibold">{analysisResult.plant_analysis?.growth_stage}</p></div>
                    <div><span className="text-slate-500">Hauteur</span><p className="font-semibold">{analysisResult.plant_analysis?.estimated_height_cm} cm</p></div>
                    <div><span className="text-slate-500">Indice foliaire</span><p className="font-semibold">{analysisResult.plant_analysis?.leaf_color_index}</p></div>
                    <div><span className="text-slate-500">Stress</span><p className="font-semibold text-emerald-600">{analysisResult.plant_analysis?.stress_indicators?.length === 0 ? "Aucun" : "Detecte"}</p></div>
                  </div>
                </div>

                {/* Environment */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><Cloud className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold text-blue-800">Environnement</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-orange-500" /><span>{analysisResult.environment_analysis?.temperature_estimate_c}C</span></div>
                    <div className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" /><span>{analysisResult.environment_analysis?.humidity_estimate_percent}%</span></div>
                    <div className="flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500" /><span>{analysisResult.environment_analysis?.light_level}</span></div>
                    <div className="flex items-center gap-1"><Wind className="h-3 w-3 text-slate-500" /><span>{analysisResult.environment_analysis?.wind_detected}</span></div>
                  </div>
                </div>

                {/* Pests */}
                <div className="p-3 bg-rose-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Bug className="h-4 w-4 text-rose-600" /><span className="text-sm font-semibold text-rose-800">Ravageurs</span></div>
                    <Badge className={analysisResult.pest_detection?.risk_level === "faible" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                      {analysisResult.pest_detection?.risk_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{analysisResult.pest_detection?.insects_detected?.length === 0 ? "Aucun insecte nuisible" : "Detectes: " + analysisResult.pest_detection?.insects_detected?.join(", ")}</p>
                </div>

                {/* Yield */}
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-violet-600" /><span className="text-sm font-semibold text-violet-800">Rendement</span></div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="text-lg font-bold text-violet-700">{analysisResult.yield_prediction?.estimated_yield_kg_ha}</p><p className="text-slate-500">kg/ha</p></div>
                    <div><p className="text-lg font-bold text-violet-700">{analysisResult.yield_prediction?.confidence_percent}%</p><p className="text-slate-500">Confiance</p></div>
                    <div><p className="text-lg font-bold text-violet-700">{analysisResult.yield_prediction?.harvest_window_days}j</p><p className="text-slate-500">Recolte</p></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Connectez une camera et cliquez "Analyser"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CameraIA;
