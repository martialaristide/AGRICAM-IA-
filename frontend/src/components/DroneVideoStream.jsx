import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  Video, Camera, Thermometer, Layers, Eye, 
  AlertTriangle, Bug, Droplets, Leaf, Target,
  Play, Pause, RefreshCw, Download, ZoomIn, ZoomOut,
  Crosshair, MapPin, Scan
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

// Simulated video frame analysis data
const generateAnalysisData = () => ({
  stressZones: [
    { id: 1, x: 25, y: 30, width: 15, height: 12, severity: "high", type: "hydrique" },
    { id: 2, x: 60, y: 45, width: 10, height: 8, severity: "medium", type: "thermique" },
    { id: 3, x: 40, y: 70, width: 12, height: 10, severity: "low", type: "nutritif" }
  ],
  diseases: [
    { id: 1, x: 35, y: 25, radius: 8, name: "Mildiou", confidence: 87 },
    { id: 2, x: 70, y: 60, radius: 6, name: "Rouille", confidence: 72 }
  ],
  hotSpots: [
    { id: 1, x: 20, y: 40, temp: 38.5 },
    { id: 2, x: 55, y: 35, temp: 36.2 },
    { id: 3, x: 75, y: 55, temp: 37.8 }
  ],
  humidityZones: [
    { id: 1, x: 15, y: 60, width: 20, height: 15, level: "low" },
    { id: 2, x: 50, y: 20, width: 25, height: 18, level: "high" }
  ],
  ndviScore: Math.random() * 0.4 + 0.5,
  overallHealth: Math.random() * 30 + 65,
  cropCoverage: Math.random() * 20 + 75
});

const DroneVideoStream = ({ droneId, droneName = "AgriDrone Alpha" }) => {
  const [viewMode, setViewMode] = useState("real"); // real, infrared, lidar, ndvi
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [videoDetections, setVideoDetections] = useState([]);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animationRef = useRef(null);

  // Connect to real camera (WiFi drone camera or device camera)
  const connectCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" }
      });
      setCameraStream(stream);
      setUseRealCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      toast.success("Camera connectee !");
    } catch (err) {
      toast.error("Impossible de connecter la camera: " + err.message);
    }
  };

  const disconnectCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setUseRealCamera(false);
    toast.info("Camera deconnectee");
  };

  // Video stream backgrounds based on view mode
  const videoBackgrounds = {
    real: "linear-gradient(135deg, #2d5016 0%, #4a7c23 25%, #3d6b1c 50%, #5a8f2e 75%, #456b20 100%)",
    infrared: "linear-gradient(135deg, #1a0a2e 0%, #3d1a5c 25%, #5c2a7a 50%, #7a3a98 75%, #4a2060 100%)",
    lidar: "linear-gradient(135deg, #0a1628 0%, #1a2840 25%, #0d1f35 50%, #1e3a5f 75%, #0f2340 100%)",
    ndvi: "linear-gradient(135deg, #8B0000 0%, #FF4500 20%, #FFD700 40%, #90EE90 60%, #228B22 80%, #006400 100%)"
  };

  useEffect(() => {
    // Simulate real-time analysis updates
    const interval = setInterval(() => {
      if (isAnalyzing && isPlaying) {
        setAnalysisData(generateAnalysisData());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing, isPlaying]);

  useEffect(() => {
    // Animate the video canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame = 0;

    const animate = () => {
      if (!isPlaying) return;
      
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw simulated video frame based on view mode
      if (viewMode === "real") {
        drawRealView(ctx, canvas, frame);
      } else if (viewMode === "infrared") {
        drawInfraredView(ctx, canvas, frame);
      } else if (viewMode === "lidar") {
        drawLidarView(ctx, canvas, frame);
      } else if (viewMode === "ndvi") {
        drawNDVIView(ctx, canvas, frame);
      }

      // Draw overlays if enabled and analyzing
      if (showOverlays && isAnalyzing && analysisData) {
        drawAnalysisOverlays(ctx, canvas);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, isPlaying, showOverlays, isAnalyzing, analysisData]);

  const drawRealView = (ctx, canvas, frame) => {
    // Green field pattern
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#3d6b1c");
    gradient.addColorStop(0.5, "#4a7c23");
    gradient.addColorStop(1, "#2d5016");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw crop rows
    ctx.strokeStyle = "#5a8f2e";
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const offset = (frame * 0.5 + i * 30) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, offset);
      ctx.lineTo(canvas.width, offset);
      ctx.stroke();
    }

    // Add some texture
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(frame * 0.01 + i) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(frame * 0.01 + i * 2) * 0.5 + 0.5) * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawInfraredView = (ctx, canvas, frame) => {
    // Purple/magenta thermal gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, "#ff00ff");
    gradient.addColorStop(0.3, "#aa00aa");
    gradient.addColorStop(0.6, "#660066");
    gradient.addColorStop(1, "#330033");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw heat spots
    const spots = [
      { x: 0.25, y: 0.3, r: 40, color: "#ff6600" },
      { x: 0.6, y: 0.5, r: 50, color: "#ff3300" },
      { x: 0.4, y: 0.7, r: 35, color: "#ffcc00" }
    ];

    spots.forEach(spot => {
      const x = spot.x * canvas.width + Math.sin(frame * 0.02) * 5;
      const y = spot.y * canvas.height + Math.cos(frame * 0.02) * 5;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, spot.r);
      grad.addColorStop(0, spot.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawLidarView = (ctx, canvas, frame) => {
    // Dark background with point cloud
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw point cloud
    ctx.fillStyle = "#00ff00";
    for (let i = 0; i < 500; i++) {
      const x = (Math.sin(i * 0.1 + frame * 0.01) * 0.4 + 0.5) * canvas.width;
      const y = (Math.cos(i * 0.15 + frame * 0.01) * 0.4 + 0.5) * canvas.height;
      const z = Math.sin(i * 0.05 + frame * 0.02) * 0.5 + 0.5;
      ctx.globalAlpha = z * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, 2 * z + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw scan lines
    ctx.strokeStyle = "#00ff0033";
    ctx.lineWidth = 1;
    const scanY = (frame * 2) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(canvas.width, scanY);
    ctx.stroke();
  };

  const drawNDVIView = (ctx, canvas, frame) => {
    // NDVI color gradient
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const noise = Math.sin(x * 0.05 + frame * 0.02) * Math.cos(y * 0.05) * 0.3;
        const ndvi = (Math.sin(x * 0.02 + y * 0.02) * 0.5 + 0.5) + noise;
        
        // NDVI color scale: red (low) -> yellow -> green (high)
        if (ndvi < 0.3) {
          imageData.data[i] = 200;
          imageData.data[i + 1] = 50;
          imageData.data[i + 2] = 50;
        } else if (ndvi < 0.5) {
          imageData.data[i] = 255;
          imageData.data[i + 1] = 200;
          imageData.data[i + 2] = 50;
        } else if (ndvi < 0.7) {
          imageData.data[i] = 150;
          imageData.data[i + 1] = 220;
          imageData.data[i + 2] = 100;
        } else {
          imageData.data[i] = 50;
          imageData.data[i + 1] = 150;
          imageData.data[i + 2] = 50;
        }
        imageData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const drawAnalysisOverlays = (ctx, canvas) => {
    // Draw stress zones
    analysisData.stressZones.forEach(zone => {
      const x = (zone.x / 100) * canvas.width;
      const y = (zone.y / 100) * canvas.height;
      const w = (zone.width / 100) * canvas.width;
      const h = (zone.height / 100) * canvas.height;

      ctx.strokeStyle = zone.severity === "high" ? "#ef4444" : 
                        zone.severity === "medium" ? "#f59e0b" : "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = "12px sans-serif";
      ctx.fillText(`Stress ${zone.type}`, x, y - 5);
    });

    // Draw disease markers
    analysisData.diseases.forEach(disease => {
      const x = (disease.x / 100) * canvas.width;
      const y = (disease.y / 100) * canvas.height;
      const r = disease.radius;

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(x - r - 5, y);
      ctx.lineTo(x + r + 5, y);
      ctx.moveTo(x, y - r - 5);
      ctx.lineTo(x, y + r + 5);
      ctx.stroke();

      // Label
      ctx.fillStyle = "#ef4444";
      ctx.font = "11px sans-serif";
      ctx.fillText(`${disease.name} (${disease.confidence}%)`, x + r + 8, y);
    });

    // Draw hot spots (infrared mode)
    if (viewMode === "infrared") {
      analysisData.hotSpots.forEach(spot => {
        const x = (spot.x / 100) * canvas.width;
        const y = (spot.y / 100) * canvas.height;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`${spot.temp}°C`, x, y);
      });
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisData(generateAnalysisData());
    // Call AI video recognition API
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/video-recognize`, {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({source: "drone"})
    }).then(r => r.json()).then(data => {
      setVideoDetections(data.detections || []);
    }).catch(() => {});
    toast.success("Analyse IA demarree - reconnaissance video active");
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setVideoDetections([]);
    toast.info("Analyse IA arretee");
  };

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `drone_capture_${viewMode}_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("Capture sauvegardée");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-emerald-600" />
            Flux Vidéo - {droneName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "EN DIRECT" : "PAUSE"}
            </Badge>
            {isAnalyzing && (
              <Badge variant="destructive" className="animate-pulse">
                IA ACTIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* View Mode Selector */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="real" className="text-xs">
              <Eye className="h-4 w-4 mr-1" />
              Réel
            </TabsTrigger>
            <TabsTrigger value="infrared" className="text-xs">
              <Thermometer className="h-4 w-4 mr-1" />
              Infrarouge
            </TabsTrigger>
            <TabsTrigger value="lidar" className="text-xs">
              <Layers className="h-4 w-4 mr-1" />
              LIDAR
            </TabsTrigger>
            <TabsTrigger value="ndvi" className="text-xs">
              <Leaf className="h-4 w-4 mr-1" />
              NDVI
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Video Canvas / Real Camera */}
        <div className="relative rounded-lg overflow-hidden bg-slate-900" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          {useRealCamera ? (
            <video ref={videoRef} className="w-full" autoPlay playsInline muted style={{ maxHeight: "360px", objectFit: "cover" }} />
          ) : (
            <canvas ref={canvasRef} width={640} height={360} className="w-full" />
          )}
          
          {/* HUD Overlay */}
          <div className="absolute top-2 left-2 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
            <div>ALT: 50m | SPD: 8 m/s</div>
            <div>LAT: 3.8480 | LON: 11.5021</div>
          </div>

          <div className="absolute top-2 right-2 text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
            <div>{new Date().toLocaleTimeString()}</div>
            <div>MODE: {viewMode.toUpperCase()}</div>
          </div>

          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Crosshair className="h-12 w-12 text-white/30" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isPlaying ? "outline" : "default"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant={isAnalyzing ? "destructive" : "default"}
            size="sm"
            onClick={isAnalyzing ? stopAnalysis : startAnalysis}
          >
            <Scan className="h-4 w-4 mr-1" />
            {isAnalyzing ? "Stop IA" : "Analyse IA"}
          </Button>
          <Button variant="outline" size="sm" onClick={takeSnapshot}>
            <Camera className="h-4 w-4 mr-1" />
            Capture
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowOverlays(!showOverlays)}>
            <Target className="h-4 w-4 mr-1" />
            {showOverlays ? "Masquer" : "Afficher"} Zones
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(zoom + 0.2, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant={useRealCamera ? "destructive" : "outline"} size="sm" onClick={useRealCamera ? disconnectCamera : connectCamera} data-testid="connect-camera-btn">
            <Camera className="h-4 w-4 mr-1" />
            {useRealCamera ? "Deconnecter" : "Camera reelle"}
          </Button>
        </div>

        {/* Analysis Results */}
        {isAnalyzing && analysisData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg text-center">
              <Leaf className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
              <div className="text-lg font-bold text-emerald-700">
                {(analysisData.ndviScore * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-emerald-600">NDVI</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <Droplets className="h-5 w-5 mx-auto text-blue-600 mb-1" />
              <div className="text-lg font-bold text-blue-700">
                {analysisData.humidityZones.length}
              </div>
              <div className="text-xs text-blue-600">Zones Humides</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-orange-600 mb-1" />
              <div className="text-lg font-bold text-orange-700">
                {analysisData.stressZones.length}
              </div>
              <div className="text-xs text-orange-600">Zones Stress</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <Bug className="h-5 w-5 mx-auto text-red-600 mb-1" />
              <div className="text-lg font-bold text-red-700">
                {analysisData.diseases.length}
              </div>
              <div className="text-xs text-red-600">Maladies</div>
            </div>
          </div>
        )}

        {/* Overall Health */}
        {isAnalyzing && analysisData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Santé globale des cultures</span>
              <span className="font-bold">{analysisData.overallHealth.toFixed(1)}%</span>
            </div>
            <Progress value={analysisData.overallHealth} className="h-2" />
          </div>
        )}
        {/* Video AI Detections */}
        {videoDetections.length > 0 && (
          <div className="space-y-2" data-testid="video-detections">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-600" /> Reconnaissance Video IA ({videoDetections.length} detections)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {videoDetections.map((d, i) => (
                <div key={i} className={`p-2 rounded-lg border text-xs ${d.category === "ravageur" ? "bg-red-50 border-red-200" : d.category === "culture" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{d.label}</span>
                    <span className={`font-bold ${d.confidence > 85 ? "text-emerald-600" : "text-amber-600"}`}>{d.confidence}%</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{d.info}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DroneVideoStream;
