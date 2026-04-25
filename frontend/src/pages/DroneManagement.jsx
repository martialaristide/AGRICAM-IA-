import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Plane, Battery, Wifi, MapPin, Camera, Play, Square, 
  RotateCcw, Plus, Trash2, Eye, AlertTriangle, 
  Navigation, Wind, Thermometer, Satellite, ChevronDown,
  Image, Crosshair, ArrowUp, Clock, BarChart3, CheckCircle,
  Settings, RefreshCw, Loader2, Signal, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

const DroneManagement = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [fleet, setFleet] = useState([]);
  const [missions, setMissions] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState({});
  const [telemetry, setTelemetry] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewMission, setShowNewMission] = useState(false);
  const [showNewDrone, setShowNewDrone] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const simRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fleetRes, missionsRes, photosRes, statsRes] = await Promise.all([
        api.get("/drone-manager/fleet"), api.get("/drone-manager/missions"),
        api.get("/drone-manager/photos"), api.get("/drone-manager/stats")
      ]);
      setFleet(fleetRes.data.drones || []);
      setMissions(missionsRes.data.missions || []);
      setPhotos(photosRes.data.photos || []);
      setStats(statsRes.data || {});
    } catch { toast.error("Erreur chargement drones"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Simulation mode - poll telemetry
  useEffect(() => {
    if (simulating) {
      const poll = async () => {
        try {
          const res = await api.get("/drone-manager/simulation/telemetry");
          setTelemetry(res.data);
        } catch {}
      };
      poll();
      simRef.current = setInterval(poll, 2000);
    } else {
      if (simRef.current) clearInterval(simRef.current);
      setTelemetry(null);
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [simulating]);

  const createDrone = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post("/drone-manager/fleet", { name: fd.get("name"), model: fd.get("model") || "DJI Mini 3 Pro", controller_type: "DJI RC" });
      toast.success("Drone enregistre !");
      setShowNewDrone(false);
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const createMission = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post("/drone-manager/missions", {
        name: fd.get("name"), drone_id: fd.get("drone_id") || "drone-001",
        mission_type: fd.get("mission_type") || "survey",
        altitude_m: parseFloat(fd.get("altitude")) || 50,
        speed_ms: parseFloat(fd.get("speed")) || 5,
        overlap_percent: parseFloat(fd.get("overlap")) || 75,
        waypoints: []
      });
      toast.success("Mission creee !");
      setShowNewMission(false);
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "fleet", label: "Flotte", icon: Plane },
    { id: "missions", label: "Missions", icon: Navigation },
    { id: "live", label: "Vol en Direct", icon: Satellite },
    { id: "gallery", label: "Galerie IA", icon: Image },
  ];

  const missionTypes = { survey: "Surveillance", inspection: "Inspection", spray: "Pulverisation", mapping: "Cartographie" };
  const statusColors = { ready: "text-emerald-400", flying: "text-blue-400", maintenance: "text-amber-400", offline: "text-red-400", completed: "text-emerald-400", planned: "text-blue-400", in_progress: "text-amber-400", aborted: "text-red-400" };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 text-emerald-400 animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="drone-management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plane className="h-6 w-6 text-emerald-400" />
            Gestion Drones DJI
          </h1>
          <p className="text-sm text-slate-400 mt-1">Planification de missions, telemetrie et analyse IA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSimulating(!simulating)} variant={simulating ? "destructive" : "outline"} size="sm"
            className={simulating ? "" : "border-emerald-700 text-emerald-400"} data-testid="sim-toggle">
            {simulating ? <><Square className="h-4 w-4 mr-2" /> Arreter Simulation</> : <><Play className="h-4 w-4 mr-2" /> Mode Simulation</>}
          </Button>
          <Button onClick={fetchAll} variant="outline" size="sm" className="border-slate-700" data-testid="refresh-drones">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
              activeTab === tab.id ? "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30" : "text-slate-400 hover:bg-slate-800/50"
            )} data-testid={`drone-tab-${tab.id}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* === DASHBOARD === */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Drones", value: stats.total_drones, icon: Plane, color: "text-blue-400" },
              { label: "Missions", value: stats.total_missions, icon: Navigation, color: "text-emerald-400" },
              { label: "Photos IA", value: stats.total_photos, icon: Camera, color: "text-violet-400" },
              { label: "Surface (ha)", value: stats.total_area_surveyed_ha, icon: MapPin, color: "text-amber-400" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/50" data-testid={`stat-${i}`}>
                <div className="flex items-center gap-2 mb-2"><s.icon className={cn("h-5 w-5", s.color)} /><span className="text-xs text-slate-400">{s.label}</span></div>
                <p className="text-2xl font-bold text-white">{s.value || 0}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Missions */}
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Navigation className="h-4 w-4 text-emerald-400" /> Missions Recentes</h3>
              <div className="space-y-2">
                {missions.slice(0, 5).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50">
                    <div><p className="text-sm text-white">{m.name}</p><p className="text-xs text-slate-500">{missionTypes[m.mission_type] || m.mission_type}</p></div>
                    <Badge className={cn("text-xs", statusColors[m.status] || "text-slate-400")}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Fleet Status */}
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Plane className="h-4 w-4 text-blue-400" /> Etat de la Flotte</h3>
              <div className="space-y-2">
                {fleet.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <Plane className={cn("h-5 w-5", statusColors[d.status])} />
                      <div><p className="text-sm text-white">{d.name}</p><p className="text-xs text-slate-500">{d.model}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><Battery className={cn("h-4 w-4", d.battery > 50 ? "text-emerald-400" : d.battery > 20 ? "text-amber-400" : "text-red-400")} /><span className="text-xs text-slate-400">{d.battery}%</span></div>
                      <Badge className={cn("text-xs", statusColors[d.status])}>{d.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === FLEET === */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Flotte de Drones ({fleet.length})</h3>
            <Button onClick={() => setShowNewDrone(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-500" data-testid="add-drone-btn">
              <Plus className="h-4 w-4 mr-2" /> Ajouter Drone
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fleet.map((d, i) => (
              <div key={i} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-5" data-testid={`drone-card-${i}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", d.status === "ready" ? "bg-emerald-900/30" : "bg-amber-900/30")}>
                      <Plane className={cn("h-6 w-6", statusColors[d.status])} />
                    </div>
                    <div><h4 className="font-semibold text-white">{d.name}</h4><p className="text-xs text-slate-500">{d.model} • SN: {d.serial_number}</p></div>
                  </div>
                  <Badge className={cn("text-xs", statusColors[d.status])}>{d.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-800/50 p-2"><p className="text-lg font-bold text-white">{d.flights_count}</p><p className="text-[10px] text-slate-500">Vols</p></div>
                  <div className="rounded-lg bg-slate-800/50 p-2"><p className="text-lg font-bold text-white">{d.total_area_ha}</p><p className="text-[10px] text-slate-500">Ha couv.</p></div>
                  <div className="rounded-lg bg-slate-800/50 p-2">
                    <div className="flex items-center justify-center gap-1"><Battery className={cn("h-4 w-4", d.battery > 50 ? "text-emerald-400" : "text-amber-400")} /><span className="text-lg font-bold text-white">{d.battery}%</span></div>
                    <p className="text-[10px] text-slate-500">Batterie</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                  <span>Firmware: {d.firmware}</span><span>RC: {d.controller_type}</span>
                </div>
              </div>
            ))}
          </div>
          {/* New Drone Dialog */}
          {showNewDrone && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <form onSubmit={createDrone} className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-semibold text-white">Enregistrer un Drone</h3>
                <div><Label className="text-slate-400">Nom du drone</Label><Input name="name" required placeholder="Mon Mini 3 Pro" className="bg-slate-800 border-slate-700 text-white" /></div>
                <div><Label className="text-slate-400">Modele</Label><Input name="model" defaultValue="DJI Mini 3 Pro" className="bg-slate-800 border-slate-700 text-white" /></div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowNewDrone(false)}>Annuler</Button>
                  <Button type="submit" className="bg-emerald-600">Enregistrer</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* === MISSIONS === */}
      {activeTab === "missions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Missions ({missions.length})</h3>
            <Button onClick={() => setShowNewMission(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-500" data-testid="new-mission-btn">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Mission
            </Button>
          </div>
          <div className="space-y-3">
            {missions.map((m, i) => (
              <div key={i} className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4" data-testid={`mission-card-${i}`}>
                <div className="flex items-center justify-between mb-3">
                  <div><h4 className="font-semibold text-white">{m.name}</h4><p className="text-xs text-slate-500">{missionTypes[m.mission_type]} • Drone: {m.drone_id}</p></div>
                  <Badge className={cn("text-xs", statusColors[m.status])}>{m.status}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400"><ArrowUp className="h-4 w-4" /><span>{m.altitude_m}m</span></div>
                  <div className="flex items-center gap-2 text-slate-400"><Zap className="h-4 w-4" /><span>{m.speed_ms} m/s</span></div>
                  <div className="flex items-center gap-2 text-slate-400"><Camera className="h-4 w-4" /><span>{m.photos_taken} photos</span></div>
                  <div className="flex items-center gap-2 text-slate-400"><MapPin className="h-4 w-4" /><span>{m.area_covered_ha} ha</span></div>
                </div>
                {m.waypoints?.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">{m.waypoints.length} waypoints configures</div>
                )}
              </div>
            ))}
          </div>
          {/* New Mission Dialog */}
          {showNewMission && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <form onSubmit={createMission} className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-semibold text-white">Planifier une Mission</h3>
                <div><Label className="text-slate-400">Nom de la mission</Label><Input name="name" required placeholder="Surveillance Zone Nord" className="bg-slate-800 border-slate-700 text-white" /></div>
                <div><Label className="text-slate-400">Type de mission</Label>
                  <select name="mission_type" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
                    <option value="survey">Surveillance</option><option value="inspection">Inspection</option>
                    <option value="spray">Pulverisation</option><option value="mapping">Cartographie</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-slate-400">Altitude (m)</Label><Input name="altitude" type="number" defaultValue={50} className="bg-slate-800 border-slate-700 text-white" /></div>
                  <div><Label className="text-slate-400">Vitesse (m/s)</Label><Input name="speed" type="number" defaultValue={5} step={0.5} className="bg-slate-800 border-slate-700 text-white" /></div>
                </div>
                <div><Label className="text-slate-400">Chevauchement (%)</Label><Input name="overlap" type="number" defaultValue={75} className="bg-slate-800 border-slate-700 text-white" /></div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowNewMission(false)}>Annuler</Button>
                  <Button type="submit" className="bg-emerald-600">Planifier</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* === LIVE TELEMETRY === */}
      {activeTab === "live" && (
        <div className="space-y-4">
          {!simulating && !telemetry && (
            <div className="text-center py-12 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <Satellite className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucune telemetrie en direct</h3>
              <p className="text-sm text-slate-500 mb-4">Activez le mode simulation ou connectez un drone via l'app compagnon</p>
              <Button onClick={() => setSimulating(true)} className="bg-emerald-600" data-testid="start-sim-live">
                <Play className="h-4 w-4 mr-2" /> Demarrer Simulation
              </Button>
            </div>
          )}
          {telemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main telemetry display */}
              <div className="lg:col-span-2 rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Telemetrie Temps Reel
                  </h3>
                  <Badge className="bg-emerald-900/30 text-emerald-400 text-xs">LIVE</Badge>
                </div>
                {/* Map placeholder with GPS coordinates */}
                <div className="relative rounded-xl bg-gradient-to-br from-emerald-900/20 to-slate-800 h-64 flex items-center justify-center border border-slate-700/50 mb-4">
                  <div className="text-center">
                    <Crosshair className="h-12 w-12 text-emerald-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-emerald-400 font-mono">{telemetry.latitude?.toFixed(6)}, {telemetry.longitude?.toFixed(6)}</p>
                    <p className="text-xs text-slate-500 mt-1">Altitude: {telemetry.altitude?.toFixed(1)}m • Cap: {telemetry.heading?.toFixed(0)}°</p>
                  </div>
                  {/* Flight path indicator */}
                  <div className="absolute top-3 left-3 bg-black/60 rounded-lg px-3 py-1.5">
                    <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1"><Signal className="h-3 w-3" /> GPS: {telemetry.gps_signal}/5</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 rounded-lg px-3 py-1.5">
                    <p className="text-[10px] text-slate-300">drone-001</p>
                  </div>
                </div>
                {/* Telemetry grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: "Vitesse", value: `${telemetry.speed?.toFixed(1)} m/s`, icon: Zap, color: "text-blue-400" },
                    { label: "Altitude", value: `${telemetry.altitude?.toFixed(1)} m`, icon: ArrowUp, color: "text-emerald-400" },
                    { label: "Batterie", value: `${telemetry.battery_percent?.toFixed(0)}%`, icon: Battery, color: telemetry.battery_percent > 50 ? "text-emerald-400" : "text-amber-400" },
                    { label: "Vent", value: `${telemetry.wind_speed || 0} m/s`, icon: Wind, color: "text-cyan-400" },
                    { label: "Temp", value: `${telemetry.temperature || 0}°C`, icon: Thermometer, color: "text-amber-400" },
                    { label: "Statut", value: telemetry.status, icon: CheckCircle, color: "text-emerald-400" },
                  ].map((t, i) => (
                    <div key={i} className="rounded-lg bg-slate-800/50 p-2 text-center">
                      <t.icon className={cn("h-4 w-4 mx-auto mb-1", t.color)} />
                      <p className="text-sm font-bold text-white">{t.value}</p>
                      <p className="text-[10px] text-slate-500">{t.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Side panel */}
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Controles</h4>
                  <div className="space-y-2">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500" size="sm"><Play className="h-4 w-4 mr-2" /> Demarrer Mission</Button>
                    <Button className="w-full" variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-2" /> Retour Base</Button>
                    <Button className="w-full" variant="outline" size="sm"><Camera className="h-4 w-4 mr-2" /> Capturer Photo</Button>
                    <Button className="w-full bg-red-600 hover:bg-red-500" size="sm"><Square className="h-4 w-4 mr-2" /> Atterrissage Urgence</Button>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Info Drone</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Modele</span><span className="text-white">DJI Mini 3 Pro</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">RC</span><span className="text-white">DJI RC (ecran)</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Mode</span><span className="text-emerald-400">Simulation</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Firmware</span><span className="text-white">v01.00.0700</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === PHOTO GALLERY === */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Galerie Photos & Analyse IA ({photos.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((p, i) => (
              <div key={i} className="rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-colors"
                onClick={() => setSelectedPhoto(p)} data-testid={`photo-${i}`}>
                <div className="relative h-48">
                  <img src={p.url} alt={p.filename} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    {p.analysis?.disease_detected ? (
                      <Badge className="bg-red-600 text-white text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> Maladie</Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Sain</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1">
                    <p className="text-[10px] text-white">NDVI: {p.analysis?.ndvi || "N/A"}</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white">{p.analysis?.crop_type || "Culture"}</p>
                  <p className="text-xs text-slate-500">{p.analysis?.health || "Analyse en cours"}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Photo Detail Modal */}
          {selectedPhoto && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
              <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <img src={selectedPhoto.url} alt="" className="w-full h-64 object-cover rounded-t-2xl" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Analyse IA</h3>
                    <button onClick={() => setSelectedPhoto(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-500">NDVI</p>
                      <p className={cn("text-2xl font-bold", (selectedPhoto.analysis?.ndvi || 0) > 0.6 ? "text-emerald-400" : (selectedPhoto.analysis?.ndvi || 0) > 0.3 ? "text-amber-400" : "text-red-400")}>{selectedPhoto.analysis?.ndvi || "N/A"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-500">Sante</p>
                      <p className="text-lg font-bold text-white">{selectedPhoto.analysis?.health}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-500">Culture</p>
                      <p className="text-lg font-bold text-white">{selectedPhoto.analysis?.crop_type}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 p-3">
                      <p className="text-xs text-slate-500">Stade</p>
                      <p className="text-lg font-bold text-white">{selectedPhoto.analysis?.growth_stage || "N/A"}</p>
                    </div>
                  </div>
                  {selectedPhoto.analysis?.disease_detected && (
                    <div className="rounded-lg bg-red-900/20 border border-red-900/30 p-4">
                      <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-red-400" /><span className="font-semibold text-red-400">Maladie Detectee</span></div>
                      <p className="text-sm text-red-300">{selectedPhoto.analysis?.disease}</p>
                      {selectedPhoto.analysis?.recommendation && <p className="text-sm text-amber-300 mt-2">Recommandation: {selectedPhoto.analysis.recommendation}</p>}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Coordonnees: {selectedPhoto.latitude}, {selectedPhoto.longitude} • Alt: {selectedPhoto.altitude}m
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DroneManagement;
