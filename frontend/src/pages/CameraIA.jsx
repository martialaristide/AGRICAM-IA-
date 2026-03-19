import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Camera, SwitchCamera, Zap, Leaf, Bug, Droplets,
  Sun, ScanSearch, Loader2, X, Upload, History,
  Maximize, Minimize, ChevronDown, Monitor
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../services/api";

const MODES = [
  { id: "general", label: "Analyse generale", icon: ScanSearch, color: "emerald" },
  { id: "disease", label: "Maladies", icon: Bug, color: "red" },
  { id: "nutrition", label: "Nutrition", icon: Leaf, color: "green" },
  { id: "hydration", label: "Hydratation", icon: Droplets, color: "blue" },
  { id: "growth", label: "Croissance", icon: Sun, color: "amber" },
];

const CameraIA = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const { t, isRTL } = useLanguage();

  const [cameraActive, setCameraActive] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [mode, setMode] = useState("general");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [showCameraList, setShowCameraList] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Enumerate cameras on mount
  useEffect(() => {
    enumerateCameras();
    fetchHistory();
    return () => stopCamera();
  }, []);

  // Auto-start camera when cameras are enumerated
  useEffect(() => {
    if (availableCameras.length > 0 && !cameraActive && !permissionDenied) {
      startCamera(selectedDeviceId || availableCameras[0]?.deviceId);
    }
  }, [availableCameras]);

  const enumerateCameras = async () => {
    try {
      // Request permission first to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tempStream.getTracks().forEach(t => t.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn("Camera enumeration error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        toast.error("Permission camera refusee. Veuillez autoriser l'acces.");
      } else {
        toast.error("Impossible de detecter les cameras.");
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/camera/scans");
      setHistory(res.data || []);
    } catch {}
  };

  const startCamera = async (deviceId) => {
    stopCamera();
    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setPermissionDenied(false);

      // Re-enumerate to get updated labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
    } catch (err) {
      console.warn("Camera start error:", err);
      if (err.name === "NotAllowedError") {
        setPermissionDenied(true);
        toast.error("Permission camera refusee.");
      } else {
        toast.error("Impossible d'acceder a la camera.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const switchToCamera = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setShowCameraList(false);
    startCamera(deviceId);
  };

  const switchToNextCamera = () => {
    if (availableCameras.length <= 1) return;
    const currentIdx = availableCameras.findIndex(c => c.deviceId === selectedDeviceId);
    const nextIdx = (currentIdx + 1) % availableCameras.length;
    switchToCamera(availableCameras[nextIdx].deviceId);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || analyzing) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

      const res = await api.post("/camera/analyze", {
        image_base64: base64,
        analysis_mode: mode,
      });

      if (res.data?.success) {
        setResult(res.data);
        toast.success("Analyse terminee !");
        fetchHistory();
      } else {
        toast.error("Echec de l'analyse");
      }
    } catch (e) {
      toast.error("Erreur d'analyse");
    } finally {
      setAnalyzing(false);
    }
  }, [mode, analyzing]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(",")[1];
        const res = await api.post("/camera/analyze", {
          image_base64: base64,
          analysis_mode: mode,
        });
        if (res.data?.success) {
          setResult(res.data);
          toast.success("Analyse terminee !");
          fetchHistory();
        }
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setAnalyzing(false);
      toast.error("Erreur");
    }
  };

  const currentMode = MODES.find(m => m.id === mode) || MODES[0];
  const currentCameraLabel = availableCameras.find(c => c.deviceId === selectedDeviceId)?.label || "Camera";

  return (
    <div className={cn("relative", fullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-4")} data-testid="camera-ia-page">
      {/* Camera viewport */}
      <div className={cn("relative overflow-hidden rounded-2xl bg-black", fullscreen ? "h-full" : "aspect-video max-h-[70vh]")}>
        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          data-testid="camera-video"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera not active overlay */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-4">
            <Camera className="h-16 w-16 text-slate-600" />
            <p className="text-slate-400 text-center px-4">
              {permissionDenied
                ? "Permission camera refusee. Veuillez autoriser l'acces dans les parametres du navigateur."
                : "Camera en cours de demarrage..."
              }
            </p>
            <Button onClick={() => { setPermissionDenied(false); enumerateCameras(); }} className="bg-emerald-600 gap-2" data-testid="activate-camera-btn">
              <Camera className="h-4 w-4" /> Activer la camera
            </Button>
          </div>
        )}

        {/* Scanning overlay when analyzing */}
        {analyzing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-emerald-500/5" />
            <div className="absolute inset-4 border-2 border-emerald-500/40 rounded-xl animate-pulse" />
            <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
              <span className="text-emerald-400 font-medium">Analyse IA en cours...</span>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Badge className={cn("bg-black/60 backdrop-blur-sm text-white gap-1.5 px-3 py-1.5", cameraActive && "border border-emerald-500/30")}>
            <div className={cn("h-2 w-2 rounded-full", cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            {cameraActive ? "Camera active" : "Camera inactive"}
          </Badge>

          {/* Camera selector button */}
          <div className="flex gap-2">
            {availableCameras.length > 1 && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-black/60 backdrop-blur-sm text-white h-9 px-3 gap-1.5 text-xs"
                  onClick={() => setShowCameraList(!showCameraList)}
                  data-testid="camera-selector-btn"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">{currentCameraLabel}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", showCameraList && "rotate-180")} />
                </Button>
                {showCameraList && (
                  <div className="absolute top-11 right-0 bg-[#111827] border border-slate-700 rounded-lg shadow-xl z-50 w-64 max-h-48 overflow-y-auto" data-testid="camera-list-dropdown">
                    {availableCameras.map((cam, idx) => (
                      <button
                        key={cam.deviceId}
                        onClick={() => switchToCamera(cam.deviceId)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors",
                          cam.deviceId === selectedDeviceId
                            ? "bg-emerald-900/30 text-emerald-400"
                            : "text-slate-300 hover:bg-slate-800"
                        )}
                        data-testid={`camera-option-${idx}`}
                      >
                        <Camera className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{cam.label || `Camera ${idx + 1}`}</span>
                        {cam.deviceId === selectedDeviceId && (
                          <span className="ml-auto text-emerald-400 flex-shrink-0">&#10003;</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button size="sm" variant="ghost" className="bg-black/60 backdrop-blur-sm text-white h-9 w-9 p-0" onClick={() => setFullscreen(!fullscreen)} data-testid="fullscreen-btn">
              {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            {fullscreen && (
              <Button size="sm" variant="ghost" className="bg-black/60 backdrop-blur-sm text-white h-9 w-9 p-0" onClick={() => setFullscreen(false)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center gap-4">
            {/* Upload */}
            <Button size="sm" className="bg-black/60 backdrop-blur-sm text-white h-12 w-12 rounded-full p-0" onClick={() => fileInputRef.current?.click()} data-testid="upload-btn">
              <Upload className="h-5 w-5" />
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

            {/* Capture & Analyze - Main button */}
            <Button
              onClick={captureAndAnalyze}
              disabled={analyzing || !cameraActive}
              className={cn(
                "h-20 w-20 rounded-full p-0 shadow-xl transition-all",
                analyzing ? "bg-amber-500 scale-95" : "bg-emerald-500 hover:bg-emerald-400 hover:scale-105"
              )}
              data-testid="capture-analyze-btn"
            >
              {analyzing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Zap className="h-8 w-8" />
              )}
            </Button>

            {/* Switch camera (cycle) */}
            <Button
              size="sm"
              className="bg-black/60 backdrop-blur-sm text-white h-12 w-12 rounded-full p-0"
              onClick={switchToNextCamera}
              disabled={availableCameras.length <= 1}
              data-testid="switch-camera-btn"
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          </div>

          {/* Mode selector */}
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowModes(!showModes)}
              className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm"
              data-testid="mode-selector"
            >
              <currentMode.icon className="h-4 w-4" />
              {currentMode.label}
              <ChevronDown className={cn("h-3 w-3 transition-transform", showModes && "rotate-180")} />
            </button>
          </div>
          {showModes && (
            <div className="flex justify-center mt-2 gap-2 flex-wrap">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setShowModes(false); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
                    mode === m.id ? "bg-emerald-500 text-white" : "bg-black/60 backdrop-blur-sm text-white/80 hover:text-white"
                  )}
                  data-testid={`mode-${m.id}`}
                >
                  <m.icon className="h-3 w-3" /> {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Result */}
      {result && !fullscreen && (
        <Card className="bg-[#111827] border-slate-800 animate-slide-in" data-testid="analysis-result">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-900/40 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Resultat d'analyse</h3>
                  <p className="text-xs text-slate-500">Mode: {currentMode.label} | Modele: {result.model || "AI"}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-slate-400 h-8 w-8 p-0" onClick={() => setResult(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed bg-slate-800/50 rounded-xl p-4">
                {result.analysis}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History toggle */}
      {!fullscreen && (
        <div>
          <Button variant="outline" className="border-slate-700 text-slate-400 gap-2 mb-3" onClick={() => setShowHistory(!showHistory)} data-testid="history-toggle">
            <History className="h-4 w-4" /> Historique ({history.length})
          </Button>
          {showHistory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.slice(0, 6).map((h, i) => (
                <Card key={i} className="bg-[#111827] border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-slate-700 text-slate-300 text-xs">{h.analysis_mode || "general"}</Badge>
                      <span className="text-xs text-slate-500">{h.created_at ? new Date(h.created_at).toLocaleString("fr-FR") : ""}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3">{h.analysis || h.result?.substring(0, 150)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraIA;
