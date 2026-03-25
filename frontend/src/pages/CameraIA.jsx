import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Camera, SwitchCamera, Zap, Leaf, Bug, Droplets,
  Sun, ScanSearch, Loader2, X, Upload, History,
  Maximize, Minimize, ChevronDown, Monitor, ShieldCheck,
  AlertTriangle, CheckCircle2, Info
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

const STATUS_CONFIG = {
  excellent: { color: "text-emerald-400", bg: "bg-emerald-900/30", icon: CheckCircle2 },
  bon: { color: "text-blue-400", bg: "bg-blue-900/30", icon: Info },
  attention: { color: "text-amber-400", bg: "bg-amber-900/30", icon: AlertTriangle },
  critique: { color: "text-red-400", bg: "bg-red-900/30", icon: AlertTriangle },
};

// Permission Request Screen
const PermissionScreen = ({ onRequestPermission, loading }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6" data-testid="permission-screen">
    <div className="relative mb-8">
      <div className="h-28 w-28 rounded-full bg-emerald-900/20 flex items-center justify-center ring-2 ring-emerald-500/30">
        <Camera className="h-14 w-14 text-emerald-400" />
      </div>
      <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-[#111827] border-2 border-emerald-500/30 flex items-center justify-center">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
      </div>
    </div>

    <h2 className="text-2xl font-bold text-white mb-3 text-center">Camera IA - Analyse Intelligente</h2>
    <p className="text-slate-400 text-center max-w-md mb-2 text-sm leading-relaxed">
      Pour analyser vos cultures en temps reel, AGRICAM IA a besoin d'acceder a votre camera.
      Vos images sont analysees par l'IA et ne sont jamais partagees.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 w-full max-w-lg">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 text-center">
        <ScanSearch className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-300 font-medium">Reconnaissance</p>
        <p className="text-[10px] text-slate-500">Plantes & cultures</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 text-center">
        <Bug className="h-5 w-5 text-red-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-300 font-medium">Detection</p>
        <p className="text-[10px] text-slate-500">Maladies & ravageurs</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 text-center">
        <Leaf className="h-5 w-5 text-green-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-300 font-medium">Diagnostic</p>
        <p className="text-[10px] text-slate-500">Nutrition & sante</p>
      </div>
    </div>

    <Button
      onClick={onRequestPermission}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-base gap-2 rounded-xl shadow-lg shadow-emerald-500/20"
      data-testid="request-permission-btn"
    >
      {loading ? (
        <><Loader2 className="h-5 w-5 animate-spin" /> Demarrage...</>
      ) : (
        <><Camera className="h-5 w-5" /> Autoriser la Camera</>
      )}
    </Button>

    <p className="text-xs text-slate-600 mt-4 text-center max-w-sm">
      Vous pouvez aussi importer une photo depuis votre galerie sans activer la camera.
    </p>
  </div>
);

// Permission Denied Screen
const PermissionDeniedScreen = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6" data-testid="permission-denied-screen">
    <div className="h-20 w-20 rounded-full bg-red-900/20 flex items-center justify-center ring-2 ring-red-500/30 mb-6">
      <AlertTriangle className="h-10 w-10 text-red-400" />
    </div>
    <h2 className="text-xl font-bold text-white mb-2">Acces camera refuse</h2>
    <p className="text-slate-400 text-center max-w-md mb-6 text-sm">
      Vous avez refuse l'acces a la camera. Pour utiliser la Camera IA, vous devez autoriser l'acces dans les parametres de votre navigateur.
    </p>
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 mb-6 max-w-md">
      <p className="text-xs text-slate-300 font-medium mb-2">Comment autoriser :</p>
      <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
        <li>Cliquez sur l'icone cadenas dans la barre d'adresse</li>
        <li>Trouvez "Camera" dans les permissions</li>
        <li>Changez en "Autoriser"</li>
        <li>Rechargez la page</li>
      </ol>
    </div>
    <Button onClick={onRetry} className="bg-emerald-600 hover:bg-emerald-500 gap-2" data-testid="retry-permission-btn">
      <Camera className="h-4 w-4" /> Reessayer
    </Button>
  </div>
);

const CameraIA = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const { t, isRTL } = useLanguage();

  // States
  const [permissionState, setPermissionState] = useState("prompt"); // "prompt" | "requesting" | "granted" | "denied"
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
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    fetchHistory();
    // Check if camera permission was already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "camera" }).then(status => {
        if (status.state === "granted") {
          setPermissionState("granted");
          initCamera();
        } else if (status.state === "denied") {
          setPermissionState("denied");
        }
        // "prompt" stays as default
      }).catch(() => {
        // permissions API not supported, show prompt
      });
    }
    return () => stopCamera();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/camera/scans");
      setHistory(res.data || []);
    } catch {}
  };

  const requestPermission = async () => {
    setPermissionState("requesting");
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      tempStream.getTracks().forEach(t => t.stop());
      setPermissionState("granted");
      await initCamera();
    } catch (err) {
      console.warn("Camera permission error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        toast.error("Permission camera refusee.");
      } else if (err.name === "NotFoundError") {
        toast.error("Aucune camera detectee sur cet appareil.");
        setPermissionState("denied");
      } else {
        toast.error("Erreur d'acces a la camera: " + err.message);
        setPermissionState("prompt");
      }
    }
  };

  const initCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
      const firstDeviceId = videoDevices.length > 0 ? videoDevices[0].deviceId : "";
      if (firstDeviceId) {
        setSelectedDeviceId(firstDeviceId);
        await startCamera(firstDeviceId);
      }
    } catch (err) {
      console.warn("Init camera error:", err);
    }
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

      // Re-enumerate to get labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
    } catch (err) {
      console.warn("Camera start error:", err);
      toast.error("Impossible d'acceder a cette camera.");
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
    setCapturedImage(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1];

      // Save the captured image for display
      setCapturedImage(dataUrl);

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
      console.error("Analyze error:", e);
      toast.error("Erreur d'analyse: " + (e.response?.data?.detail || e.message));
    } finally {
      setAnalyzing(false);
    }
  }, [mode, analyzing]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setCapturedImage(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target.result;
        const base64 = dataUrl.split(",")[1];
        setCapturedImage(dataUrl);

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
      } catch (err) {
        toast.error("Erreur: " + (err.response?.data?.detail || err.message));
      } finally {
        setAnalyzing(false);
      }
    };
    reader.onerror = () => {
      setAnalyzing(false);
      toast.error("Erreur de lecture du fichier");
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = "";
  };

  const currentMode = MODES.find(m => m.id === mode) || MODES[0];
  const currentCameraLabel = availableCameras.find(c => c.deviceId === selectedDeviceId)?.label || "Camera";

  // Extract analysis data from result
  const analysisData = result?.result || null;
  const statusConfig = analysisData ? STATUS_CONFIG[analysisData.health_status] || STATUS_CONFIG.bon : null;
  const StatusIcon = statusConfig?.icon || Info;

  // =========================================
  // PERMISSION SCREENS
  // =========================================
  if (permissionState === "prompt" || permissionState === "requesting") {
    return (
      <div className="space-y-4" data-testid="camera-ia-page">
        <PermissionScreen
          onRequestPermission={requestPermission}
          loading={permissionState === "requesting"}
        />
        {/* Still allow file upload without camera */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-400 gap-2"
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-without-camera-btn"
          >
            <Upload className="h-4 w-4" /> Importer une photo
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Show result even without camera */}
        {analyzing && (
          <Card className="bg-[#111827] border-slate-800">
            <CardContent className="p-5 flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
              <span className="text-emerald-400">Analyse IA en cours...</span>
            </CardContent>
          </Card>
        )}
        <ResultDisplay result={result} analysisData={analysisData} statusConfig={statusConfig} StatusIcon={StatusIcon} currentMode={currentMode} capturedImage={capturedImage} onClose={() => { setResult(null); setCapturedImage(null); }} />
      </div>
    );
  }

  if (permissionState === "denied") {
    return (
      <div className="space-y-4" data-testid="camera-ia-page">
        <PermissionDeniedScreen onRetry={requestPermission} />
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-400 gap-2"
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-without-camera-btn"
          >
            <Upload className="h-4 w-4" /> Importer une photo
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
        {analyzing && (
          <Card className="bg-[#111827] border-slate-800">
            <CardContent className="p-5 flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
              <span className="text-emerald-400">Analyse IA en cours...</span>
            </CardContent>
          </Card>
        )}
        <ResultDisplay result={result} analysisData={analysisData} statusConfig={statusConfig} StatusIcon={StatusIcon} currentMode={currentMode} capturedImage={capturedImage} onClose={() => { setResult(null); setCapturedImage(null); }} />
      </div>
    );
  }

  // =========================================
  // CAMERA ACTIVE VIEW
  // =========================================
  return (
    <div className={cn("relative", fullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-4")} data-testid="camera-ia-page">
      {/* Camera viewport */}
      <div className={cn("relative overflow-hidden rounded-2xl bg-black", fullscreen ? "h-full" : "aspect-video max-h-[70vh]")}>
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
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            <p className="text-slate-400">Demarrage de la camera...</p>
          </div>
        )}

        {/* Scanning overlay */}
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
          <Badge className={cn("bg-black/60 backdrop-blur-sm text-white gap-1.5 px-3 py-1.5", cameraActive && "border border-emerald-500/30")} data-testid="camera-status-badge">
            <div className={cn("h-2 w-2 rounded-full", cameraActive ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
            {cameraActive ? "LIVE" : "OFF"}
          </Badge>

          <div className="flex gap-2">
            {/* Camera selector */}
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
                  <span className="max-w-[100px] truncate hidden sm:inline">{currentCameraLabel}</span>
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
            {/* Single camera indicator */}
            {availableCameras.length === 1 && (
              <Badge className="bg-black/60 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1">
                <Camera className="h-3 w-3 mr-1" />
                {availableCameras[0]?.label?.substring(0, 20) || "Camera"}
              </Badge>
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {/* Capture & Analyze */}
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

            {/* Switch camera */}
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
      {!fullscreen && (
        <ResultDisplay
          result={result}
          analysisData={analysisData}
          statusConfig={statusConfig}
          StatusIcon={StatusIcon}
          currentMode={currentMode}
          capturedImage={capturedImage}
          onClose={() => { setResult(null); setCapturedImage(null); }}
        />
      )}

      {/* History */}
      {!fullscreen && (
        <div>
          <Button variant="outline" className="border-slate-700 text-slate-400 gap-2 mb-3" onClick={() => setShowHistory(!showHistory)} data-testid="history-toggle">
            <History className="h-4 w-4" /> Historique ({history.length})
          </Button>
          {showHistory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.slice(0, 8).map((h, i) => {
                const hResult = h.result || {};
                const hStatus = STATUS_CONFIG[hResult.health_status] || STATUS_CONFIG.bon;
                const HIcon = hStatus.icon;
                return (
                  <Card key={h.id || i} className="bg-[#111827] border-slate-800 hover:border-slate-700 transition-colors cursor-pointer" data-testid={`history-item-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-700 text-slate-300 text-xs">{h.mode || "general"}</Badge>
                          <Badge className={cn("text-xs", hStatus.bg, hStatus.color)}>
                            <HIcon className="h-3 w-3 mr-1" />
                            {hResult.health_status || "N/A"}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">{h.created_at ? new Date(h.created_at).toLocaleString("fr-FR") : ""}</span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium">{hResult.crop_type || "Culture non identifiee"}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{hResult.summary || "Aucun resume"}</p>
                      {hResult.confidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hResult.confidence}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{hResult.confidence}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Extracted Result Display Component
const ResultDisplay = ({ result, analysisData, statusConfig, StatusIcon, currentMode, capturedImage, onClose }) => {
  if (!result) return null;
  return (
    <Card className="bg-[#111827] border-slate-800" data-testid="analysis-result">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-900/40 flex items-center justify-center">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Resultat d'analyse</h3>
              <p className="text-xs text-slate-500">Mode: {currentMode.label} | Modele: {result.model || "AI"} | {result.response_time_ms}ms</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-slate-400 h-8 w-8 p-0" onClick={onClose} data-testid="close-result-btn">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Captured image */}
          {capturedImage && (
            <div className="md:col-span-1">
              <img src={capturedImage} alt="Capture" className="w-full rounded-xl border border-slate-700 object-cover max-h-48" data-testid="captured-image" />
            </div>
          )}

          {/* Analysis details */}
          <div className={cn(capturedImage ? "md:col-span-2" : "md:col-span-3", "space-y-3")}>
            {/* Status header */}
            {analysisData && (
              <div className={cn("flex items-center gap-3 p-3 rounded-xl", statusConfig?.bg)}>
                <StatusIcon className={cn("h-6 w-6", statusConfig?.color)} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold uppercase", statusConfig?.color)}>
                      {analysisData.health_status}
                    </span>
                    {analysisData.confidence && (
                      <Badge className="bg-slate-800 text-slate-300 text-xs">{analysisData.confidence}% confiance</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">{analysisData.crop_type || ""}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            {analysisData?.summary && (
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1 font-medium">Resume</p>
                <p className="text-sm text-slate-300 leading-relaxed">{analysisData.summary}</p>
              </div>
            )}

            {/* Detections */}
            {analysisData?.detections?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Detections</p>
                <div className="space-y-2">
                  {analysisData.detections.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-800/30 rounded-lg p-2.5">
                      <Badge className={cn(
                        "text-[10px] mt-0.5",
                        d.severity === "high" ? "bg-red-900/40 text-red-400" :
                        d.severity === "medium" ? "bg-amber-900/40 text-amber-400" :
                        "bg-emerald-900/40 text-emerald-400"
                      )}>
                        {d.severity || "low"}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{d.name}</p>
                        <p className="text-xs text-slate-400">{d.description}</p>
                      </div>
                      {d.confidence && (
                        <span className="text-xs text-slate-500">{d.confidence}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisData?.recommendations?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 font-medium">Recommandations</p>
                <ul className="space-y-1.5">
                  {analysisData.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraIA;
