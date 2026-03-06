import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Bot, Play, Pause, RotateCcw, Eye,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Maximize2, Move3d, Wifi, Battery, Thermometer,
  Navigation, Activity, Droplets, Leaf, Camera, Video, Scan
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const Robot3DViewer = ({ robotId, robotName = "AgriBot-01" }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [taskType, setTaskType] = useState("patrol");
  const [controlMode, setControlMode] = useState("auto");
  const [robotAngle, setRobotAngle] = useState(0);
  const [robotPos, setRobotPos] = useState({ x: 50, y: 50 });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [aiDetections, setAiDetections] = useState([]);
  const videoRef = useRef(null);
  const [telemetry, setTelemetry] = useState({
    battery: 87, speed: 0, temperature: 42, signal: 95,
    latitude: 5.9631, longitude: 10.1591, heading: 0
  });
  const animRef = useRef(null);

  const connectRobotCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" }
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      toast.success("Camera robot connectee !");
      // Start AI detection simulation
      const interval = setInterval(() => {
        setAiDetections([
          { label: "Mais (Zea mays)", conf: 94, x: 15, y: 20, w: 25, h: 30, color: "#22c55e" },
          { label: "Ravageur detecte", conf: 78, x: 55, y: 35, w: 15, h: 15, color: "#ef4444" },
          { label: "Sol fertile", conf: 88, x: 10, y: 65, w: 35, h: 20, color: "#3b82f6" },
          { label: "Feuille saine", conf: 91, x: 65, y: 55, w: 20, h: 25, color: "#22c55e" },
        ].map(d => ({...d, conf: Math.min(99, d.conf + Math.floor(Math.random() * 5 - 2))})));
      }, 2000);
      return () => clearInterval(interval);
    } catch { toast.error("Camera non disponible"); }
  };

  const disconnectRobotCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setShowCamera(false);
    setAiDetections([]);
  };

  // Animate robot movement
  useEffect(() => {
    if (isMoving) {
      const iv = setInterval(() => {
        setRobotAngle(prev => (prev + 2) % 360);
        setRobotPos(prev => ({
          x: 50 + Math.cos((Date.now() / 2000)) * 25,
          y: 50 + Math.sin((Date.now() / 2000)) * 20
        }));
        setTelemetry(prev => ({
          ...prev,
          speed: Math.round(Math.random() * 3 + 1.5),
          heading: (prev.heading + 5) % 360,
          battery: Math.max(prev.battery - 0.01, 10)
        }));
      }, 100);
      return () => clearInterval(iv);
    } else {
      setTelemetry(prev => ({ ...prev, speed: 0 }));
    }
  }, [isMoving]);

  const moveRobot = (dir) => {
    setRobotPos(prev => {
      const step = 5;
      if (dir === "up") return { ...prev, y: Math.max(5, prev.y - step) };
      if (dir === "down") return { ...prev, y: Math.min(95, prev.y + step) };
      if (dir === "left") return { ...prev, x: Math.max(5, prev.x - step) };
      if (dir === "right") return { ...prev, x: Math.min(95, prev.x + step) };
      return prev;
    });
    setRobotAngle(prev => {
      if (dir === "up") return 0;
      if (dir === "down") return 180;
      if (dir === "left") return 270;
      if (dir === "right") return 90;
      return prev;
    });
  };

  const taskColors = { patrol: "#3b82f6", weed: "#ef4444", spray: "#f59e0b", sample: "#8b5cf6" };
  const taskLabels = { patrol: "Patrouille", weed: "Desherbage", spray: "Pulverisation", sample: "Echantillonnage" };

  return (
    <Card data-testid="robot-3d-viewer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-violet-600" /> {robotName} - Vue Temps Reel
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", isMoving ? "bg-emerald-500 animate-pulse" : "bg-slate-400")}>
              {isMoving ? "En mouvement" : "Arrete"}
            </Badge>
            <Badge style={{ backgroundColor: taskColors[taskType] }} className="text-white text-xs">
              {taskLabels[taskType]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Robot Map View */}
          <div className="lg:col-span-2 relative bg-slate-900 rounded-xl overflow-hidden" style={{ height: 320 }}>
            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Field zones */}
            <div className="absolute" style={{ left: "10%", top: "15%", width: "35%", height: "30%", backgroundColor: "rgba(34,197,94,0.15)", border: "1px dashed rgba(34,197,94,0.4)", borderRadius: 8 }}>
              <span className="text-[9px] text-emerald-400 p-1">Zone A</span>
            </div>
            <div className="absolute" style={{ left: "55%", top: "45%", width: "35%", height: "35%", backgroundColor: "rgba(59,130,246,0.15)", border: "1px dashed rgba(59,130,246,0.4)", borderRadius: 8 }}>
              <span className="text-[9px] text-blue-400 p-1">Zone B</span>
            </div>

            {/* Waypoints */}
            {controlMode === "auto" && [
              { x: 20, y: 25 }, { x: 40, y: 30 }, { x: 60, y: 55 }, { x: 80, y: 65 }, { x: 70, y: 80 }
            ].map((wp, i) => (
              <div key={i} className="absolute w-3 h-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20" style={{ left: `${wp.x}%`, top: `${wp.y}%`, transform: "translate(-50%,-50%)" }}>
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-cyan-400">{i + 1}</span>
              </div>
            ))}

            {/* Robot SVG */}
            <div
              className="absolute transition-all"
              style={{
                left: `${robotPos.x}%`, top: `${robotPos.y}%`,
                transform: `translate(-50%, -50%) rotate(${robotAngle}deg)`,
                transitionDuration: isMoving ? "100ms" : "300ms"
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40">
                {/* Body */}
                <rect x="10" y="8" width="20" height="24" rx="4" fill={taskColors[taskType]} stroke="white" strokeWidth="1.5" />
                {/* Wheels */}
                <rect x="5" y="10" width="5" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" className={isMoving ? "animate-pulse" : ""} />
                <rect x="30" y="10" width="5" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" className={isMoving ? "animate-pulse" : ""} />
                <rect x="5" y="22" width="5" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" className={isMoving ? "animate-pulse" : ""} />
                <rect x="30" y="22" width="5" height="8" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" className={isMoving ? "animate-pulse" : ""} />
                {/* Direction indicator */}
                <polygon points="20,2 16,8 24,8" fill="#22c55e" />
                {/* Camera eye */}
                <circle cx="20" cy="14" r="3" fill="white" opacity="0.8" />
                <circle cx="20" cy="14" r="1.5" fill={isMoving ? "#22c55e" : "#94a3b8"} className={isMoving ? "animate-pulse" : ""} />
              </svg>
              {/* Label */}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white whitespace-nowrap bg-black/60 px-1 rounded">{robotName}</span>
            </div>

            {/* HUD */}
            <div className="absolute top-2 left-2 bg-black/70 rounded-lg px-2 py-1.5 text-[10px] text-white space-y-0.5">
              <div className="flex items-center gap-1"><Navigation className="h-3 w-3 text-cyan-400" /> {telemetry.heading}deg | {telemetry.speed} km/h</div>
              <div className="flex items-center gap-1"><Battery className="h-3 w-3 text-emerald-400" /> {Math.round(telemetry.battery)}%</div>
              <div className="flex items-center gap-1"><Wifi className="h-3 w-3 text-blue-400" /> {telemetry.signal}%</div>
            </div>
            <div className="absolute top-2 right-2 bg-black/70 rounded-lg px-2 py-1 text-[10px] text-white">
              <span className="text-emerald-400 mr-1">&#9679;</span> GPS: {telemetry.latitude.toFixed(4)}, {telemetry.longitude.toFixed(4)}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Mode */}
            <div className="flex gap-1">
              <Button size="sm" variant={controlMode === "auto" ? "default" : "outline"} className={cn("flex-1 text-xs", controlMode === "auto" && "bg-violet-600")} onClick={() => setControlMode("auto")} data-testid="mode-auto">
                <Activity className="h-3 w-3 mr-1" /> Auto
              </Button>
              <Button size="sm" variant={controlMode === "manual" ? "default" : "outline"} className={cn("flex-1 text-xs", controlMode === "manual" && "bg-blue-600")} onClick={() => setControlMode("manual")} data-testid="mode-manual">
                <Move3d className="h-3 w-3 mr-1" /> Manuel
              </Button>
            </div>

            {/* Task selection */}
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(taskLabels).map(([key, label]) => (
                <Button key={key} size="sm" variant={taskType === key ? "default" : "outline"} className={cn("text-xs", taskType === key && `text-white`)} style={taskType === key ? { backgroundColor: taskColors[key] } : {}} onClick={() => setTaskType(key)} data-testid={`task-${key}`}>
                  {key === "patrol" && <Eye className="h-3 w-3 mr-1" />}
                  {key === "weed" && <Leaf className="h-3 w-3 mr-1" />}
                  {key === "spray" && <Droplets className="h-3 w-3 mr-1" />}
                  {key === "sample" && <Thermometer className="h-3 w-3 mr-1" />}
                  {label}
                </Button>
              ))}
            </div>

            {/* Play/Stop */}
            <div className="flex gap-2">
              <Button className={cn("flex-1", isMoving ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700")} onClick={() => setIsMoving(!isMoving)} data-testid="robot-play-stop">
                {isMoving ? <><Pause className="h-4 w-4 mr-1" /> Stop</> : <><Play className="h-4 w-4 mr-1" /> Demarrer</>}
              </Button>
              <Button variant="outline" onClick={() => { setRobotPos({ x: 50, y: 50 }); setRobotAngle(0); }} data-testid="robot-reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Manual control pad */}
            {controlMode === "manual" && (
              <div className="bg-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 text-center mb-2">Controle directionnel</p>
                <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                  <div />
                  <Button size="sm" variant="outline" className="h-9" onClick={() => moveRobot("up")}><ArrowUp className="h-4 w-4" /></Button>
                  <div />
                  <Button size="sm" variant="outline" className="h-9" onClick={() => moveRobot("left")}><ArrowLeft className="h-4 w-4" /></Button>
                  <div className="h-9 rounded-md bg-slate-200 flex items-center justify-center"><Bot className="h-4 w-4 text-slate-400" /></div>
                  <Button size="sm" variant="outline" className="h-9" onClick={() => moveRobot("right")}><ArrowRight className="h-4 w-4" /></Button>
                  <div />
                  <Button size="sm" variant="outline" className="h-9" onClick={() => moveRobot("down")}><ArrowDown className="h-4 w-4" /></Button>
                  <div />
                </div>
              </div>
            )}

            {/* Telemetry */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span className="text-slate-500">Batterie</span><span className="font-bold">{Math.round(telemetry.battery)}%</span></div>
              <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span className="text-slate-500">Vitesse</span><span className="font-bold">{telemetry.speed} km/h</span></div>
              <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span className="text-slate-500">Temperature</span><span className="font-bold">{telemetry.temperature}C</span></div>
              <div className="flex justify-between p-1.5 bg-slate-50 rounded"><span className="text-slate-500">Signal</span><span className="font-bold">{telemetry.signal}%</span></div>
            </div>

            {/* Camera Toggle */}
            <Button className={cn("w-full", showCamera ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700")} size="sm" onClick={showCamera ? disconnectRobotCamera : connectRobotCamera} data-testid="robot-camera-btn">
              <Camera className="h-4 w-4 mr-1" /> {showCamera ? "Deconnecter camera" : "Connecter camera robot"}
            </Button>
          </div>
        </div>

        {/* Robot Camera Feed with AI Detection */}
        {showCamera && (
          <div className="relative rounded-lg overflow-hidden bg-black mt-4" data-testid="robot-camera-feed">
            <video ref={videoRef} className="w-full" autoPlay playsInline muted style={{ maxHeight: "320px", objectFit: "cover" }} />
            {/* AI Detection Overlays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {aiDetections.map((d, i) => (
                <g key={i}>
                  <rect x={`${d.x}%`} y={`${d.y}%`} width={`${d.w}%`} height={`${d.h}%`} fill="none" stroke={d.color} strokeWidth="2" strokeDasharray="4" rx="4" />
                  <rect x={`${d.x}%`} y={`${d.y - 4}%`} width={`${d.w}%`} height="4%" fill={d.color} opacity="0.8" rx="2" />
                  <text x={`${d.x + 0.5}%`} y={`${d.y - 1}%`} fill="white" fontSize="10" fontWeight="bold">{d.label} ({d.conf}%)</text>
                </g>
              ))}
            </svg>
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
              <Scan className="h-3 w-3 text-emerald-400 animate-pulse" /> IA Active - {aiDetections.length} detections
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button size="sm" variant="outline" className="bg-black/50 text-white border-white/20 text-xs h-7" onClick={() => {
                if (videoRef.current) {
                  const canvas = document.createElement("canvas");
                  canvas.width = videoRef.current.videoWidth;
                  canvas.height = videoRef.current.videoHeight;
                  canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
                  const a = document.createElement("a");
                  a.href = canvas.toDataURL("image/png");
                  a.download = `robot_capture_${Date.now()}.png`;
                  a.click();
                  toast.success("Capture exportee !");
                }
              }}><Camera className="h-3 w-3 mr-1" /> Capture</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Robot3DViewer;
