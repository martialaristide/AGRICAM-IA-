import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader2, Video, Plus, ScanSearch, Trash2, Upload, Cpu, KeyRound, Copy, Timer, Camera } from "lucide-react";
import { Switch } from "../ui/switch";
import { toast } from "sonner";

export default function CamerasVision({ refreshKey }) {
  const [engine, setEngine] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [farms, setFarms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ farm_id: "", name: "", stream_url: "", camera_type: "rgb" });
  const [detectingId, setDetectingId] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gateway, setGateway] = useState(null);
  const [monitoring, setMonitoring] = useState({ enabled: false, interval_minutes: 15, last_run: null, last_result: null });
  const [datasetStats, setDatasetStats] = useState(null);
  const [datasetSpecies, setDatasetSpecies] = useState("porcin");
  const fileRef = useRef(null);
  const datasetRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [e, c, f] = await Promise.all([
        api.get("/elevage/vision/engine"),
        api.get("/elevage/cameras"),
        api.get("/elevage/farms"),
      ]);
      setEngine(e.data);
      setCameras(c.data.cameras);
      setFarms(f.data.farms);
      if (f.data.farms.length && !form.farm_id) setForm((s) => ({ ...s, farm_id: f.data.farms[0].id }));
      api.get("/elevage/cameras/monitoring").then((m) => setMonitoring(m.data)).catch(() => {});
      api.get("/elevage/vision/dataset/stats").then((d) => setDatasetStats(d.data)).catch(() => {});
    } catch {
      toast.error("Erreur de chargement des caméras");
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load, refreshKey]);

  const addCamera = async () => {
    if (!form.name || !form.stream_url) { toast.error("Nom et URL du flux requis"); return; }
    try {
      await api.post("/elevage/cameras", form);
      toast.success("Caméra ajoutée — vous pouvez en connecter plus de 20 par ferme");
      setShowAdd(false);
      setForm((s) => ({ ...s, name: "", stream_url: "" }));
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Échec de l'ajout");
    }
  };

  const removeCamera = async (id) => {
    try { await api.delete(`/elevage/cameras/${id}`); load(); } catch { toast.error("Échec suppression"); }
  };

  const detect = async (cam) => {
    setDetectingId(cam.id);
    setResult(null);
    try {
      const res = await api.post(`/elevage/cameras/${cam.id}/detect`, {}, { timeout: 90000 });
      setResult(res.data.result);
      toast.success(`Détection sur ${cam.name} : ${res.data.result.total_animals} animaux (${res.data.result.engine})`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Caméra injoignable — vérifiez l'URL RTSP et le réseau");
    } finally {
      setDetectingId(null);
    }
  };

  const handleFrame = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setAnalyzing(true);
      setResult(null);
      try {
        const res = await api.post("/elevage/vision/detect-frame", { image_base64: reader.result, farm_id: form.farm_id || null }, { timeout: 90000 });
        setResult(res.data.result);
        toast.success(`${res.data.result.total_animals} animaux détectés (${res.data.result.engine})`);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Échec de la détection");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateMonitoring = async (patch) => {
    const next = { enabled: monitoring.enabled, interval_minutes: monitoring.interval_minutes || 15, ...patch };
    try {
      const res = await api.post("/elevage/cameras/monitoring", next);
      setMonitoring((m) => ({ ...m, ...next }));
      toast.success(res.data.message);
    } catch { toast.error("Échec de la configuration"); }
  };

  const handleDatasetPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api.post("/elevage/vision/dataset", { image_base64: reader.result, species: datasetSpecies });
        toast.success(res.data.message);
        api.get("/elevage/vision/dataset/stats").then((d) => setDatasetStats(d.data)).catch(() => {});
      } catch (err) { toast.error(err.response?.data?.detail || "Échec de l'ajout au dataset"); }
    };
    reader.readAsDataURL(file);
  };

  const getGatewayKey = async () => {
    if (!form.farm_id) return;
    try {
      const res = await api.post(`/elevage/farms/${form.farm_id}/gateway`);
      setGateway(res.data);
    } catch { toast.error("Erreur de génération de la clé passerelle"); }
  };

  return (
    <div className="space-y-4" data-testid="cameras-vision">
      {engine && (
        <div className={`rounded-lg border px-3 py-2 text-xs flex items-center gap-2 flex-wrap ${engine.yolo_available ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`} data-testid="vision-engine-banner">
          <Cpu className="h-4 w-4 shrink-0" />
          {engine.yolo_available
            ? `Moteur de détection : YOLO (${engine.model}) actif — vision par ordinateur en temps réel. Secours : ${engine.fallback}.`
            : `YOLO en cours d'installation — détection via ${engine.fallback} en attendant. Rechargez dans quelques minutes.`}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowAdd(true)} className="bg-lime-500 hover:bg-lime-400 text-slate-900" data-testid="add-camera-btn">
          <Plus className="h-4 w-4 mr-1.5" />Connecter une caméra (RTSP/HTTP)
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFrame} data-testid="frame-file-input" />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={analyzing} data-testid="frame-detect-btn" className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10">
          {analyzing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
          Tester la détection sur une photo
        </Button>
        <Button variant="outline" onClick={getGatewayKey} data-testid="gateway-key-btn" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
          <KeyRound className="h-4 w-4 mr-1.5" />Clé passerelle VitaBif
        </Button>
      </div>

      <Card data-testid="monitoring-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${monitoring.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}>
              <Timer className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Surveillance continue automatique</p>
              <p className="text-[11px] text-slate-400">
                {monitoring.enabled
                  ? `Actif — scan de toutes les caméras toutes les ${monitoring.interval_minutes} min, alertes automatiques`
                  : "Inactif — activez pour scanner les caméras sans clic manuel"}
                {monitoring.last_result && ` · Dernier scan : ${monitoring.last_result.cameras_ok} OK / ${monitoring.last_result.cameras_failed} KO, ${monitoring.last_result.animals_detected} animaux`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(monitoring.interval_minutes || 15)} onValueChange={(v) => updateMonitoring({ interval_minutes: parseInt(v) })}>
              <SelectTrigger className="w-32" data-testid="monitoring-interval-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2, 5, 10, 15, 30, 60].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
              </SelectContent>
            </Select>
            <Switch checked={!!monitoring.enabled} onCheckedChange={(v) => updateMonitoring({ enabled: v })} data-testid="monitoring-toggle" />
          </div>
        </CardContent>
      </Card>

      {cameras.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-slate-400">
          <Video className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Aucune caméra connectée. Ajoutez vos caméras IP (RTSP) — le système en supporte plus de 20 par ferme.
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cameras.map((cam) => (
            <Card key={cam.id} data-testid={`camera-card-${cam.name.replace(/\s/g, "-")}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5"><Video className="h-4 w-4 text-lime-400 shrink-0" />{cam.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{cam.farm_name} · {cam.camera_type.toUpperCase()}</p>
                  </div>
                  <Badge className={`border-0 text-[10px] ${cam.status === "online" ? "bg-emerald-500/20 text-emerald-400" : cam.status === "offline" ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"}`}>
                    {cam.status === "online" ? "En ligne" : cam.status === "offline" ? "Hors ligne" : "Configurée"}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-600 truncate mb-2">{cam.stream_url}</p>
                {cam.last_counts && (
                  <p className="text-[11px] text-slate-400 mb-2">Dernier comptage : {Object.entries(cam.last_counts).map(([k, v]) => `${v} ${k}`).join(", ") || "aucun animal"}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => detect(cam)} disabled={detectingId === cam.id} className="flex-1 bg-lime-500/90 hover:bg-lime-400 text-slate-900" data-testid="camera-detect-btn">
                    {detectingId === cam.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5 mr-1.5" />}
                    Détecter (YOLO)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeCamera(cam.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {result && (
        <Card data-testid="detection-result">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-lime-500/20 text-lime-400 border-0">{result.engine}</Badge>
              <p className="font-semibold text-sm">{result.total_animals} animaux détectés</p>
              {result.human_detected && <Badge className="bg-red-500/20 text-red-400 border-0">⚠ Personne détectée — alerte sécurité créée</Badge>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(result.counts || {}).map(([k, v]) => <Badge key={k} variant="outline" className="text-xs">{k} : {v}</Badge>)}
            </div>
            {result.observations && <p className="text-xs text-slate-400">{result.observations}</p>}
            {result.annotated_image && (
              <img src={result.annotated_image} alt="Détections YOLO annotées" className="max-h-80 rounded-lg border border-slate-700/50" data-testid="annotated-image" />
            )}
          </CardContent>
        </Card>
      )}

      <Card data-testid="dataset-card">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Dataset d'entraînement YOLO (porcins & races locales)</p>
              <p className="text-[11px] text-slate-400">
                {datasetStats
                  ? `Photos : ${Object.entries(datasetStats.photos).map(([k, v]) => `${k} ${v}`).join(" · ")} (objectif ${datasetStats.target_per_species}/espèce) ${datasetStats.custom_model_installed ? "· ✓ Modèle personnalisé installé" : "· Guide : GUIDE_YOLO_PORCINS.md"}`
                  : "Contribuez avec les photos de vos fermes pilotes pour entraîner le modèle qui détectera les porcs"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={datasetSpecies} onValueChange={setDatasetSpecies}>
              <SelectTrigger className="w-32" data-testid="dataset-species-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="porcin">Porcin</SelectItem>
                <SelectItem value="bovin">Bovin</SelectItem>
                <SelectItem value="ovin">Ovin</SelectItem>
                <SelectItem value="volaille">Volaille</SelectItem>
              </SelectContent>
            </Select>
            <input ref={datasetRef} type="file" accept="image/*" className="hidden" onChange={handleDatasetPhoto} data-testid="dataset-file-input" />
            <Button size="sm" variant="outline" onClick={() => datasetRef.current?.click()} data-testid="dataset-add-btn" className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Contribuer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent data-testid="add-camera-dialog">
          <DialogHeader><DialogTitle>Connecter une caméra IP</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.farm_id} onValueChange={(v) => setForm((s) => ({ ...s, farm_id: v }))}>
              <SelectTrigger data-testid="camera-farm-select"><SelectValue placeholder="Installation" /></SelectTrigger>
              <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Nom (ex: Enclos Nord — Cam 1)" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} data-testid="camera-name-input" />
            <Input placeholder="rtsp://user:pass@192.168.1.10:554/stream1 ou http://.../snapshot.jpg" value={form.stream_url} onChange={(e) => setForm((s) => ({ ...s, stream_url: e.target.value }))} data-testid="camera-url-input" />
            <Select value={form.camera_type} onValueChange={(v) => setForm((s) => ({ ...s, camera_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rgb">RGB (jour/nuit)</SelectItem>
                <SelectItem value="ir">Infrarouge</SelectItem>
                <SelectItem value="thermique">Thermique</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addCamera} className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900" data-testid="camera-save-btn">Ajouter la caméra</Button>
            <p className="text-[11px] text-slate-500">Compatible caméras IP standard (RTSP), DVR/NVR, et snapshots HTTP. Aucune limite : 20+ caméras par ferme.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!gateway} onOpenChange={(o) => !o && setGateway(null)}>
        <DialogContent className="max-w-lg" data-testid="gateway-dialog">
          <DialogHeader><DialogTitle>Passerelle LoRa VitaBif — connexion réelle</DialogTitle></DialogHeader>
          {gateway && (
            <div className="space-y-3 text-sm">
              <p className="text-xs text-slate-400">Configurez votre passerelle (Raspberry Pi) pour envoyer les paquets colliers toutes les 5-15 min :</p>
              <div className="rounded-lg bg-slate-500/10 p-3 font-mono text-xs break-all">
                POST {gateway.endpoint}<br />
                X-Gateway-Key: {gateway.gateway_key}
              </div>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(gateway.gateway_key); toast.success("Clé copiée"); }} data-testid="copy-gateway-key-btn">
                <Copy className="h-3.5 w-3.5 mr-1.5" />Copier la clé
              </Button>
              <pre className="rounded-lg bg-slate-500/10 p-3 text-[10px] overflow-x-auto max-h-48">{JSON.stringify(gateway.payload_example, null, 2)}</pre>
              <p className="text-[11px] text-slate-500">Champs : rythme cardiaque (MAX30102), température (DS18B20), activité (MPU6050 : marche/rumination/immobilité/boiterie), clôture virtuelle ultrasonore (inside/near_limit/outside), sonde eau/aliment. Anomalies → alertes WhatsApp automatiques.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
