import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, Thermometer, Droplets, Wind, Waves, Wheat, RefreshCw, Flame } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = { ok: "text-emerald-400", attention: "text-amber-400", alerte: "text-red-400" };
const STATUS_BG = { ok: "bg-emerald-500/10 border-emerald-500/20", attention: "bg-amber-500/10 border-amber-500/20", alerte: "bg-red-500/10 border-red-500/20" };

const Gauge = ({ icon: Icon, label, value, unit, status, testId }) => (
  <Card className={`border ${STATUS_BG[status] || ""}`} data-testid={testId}>
    <CardContent className="p-4 text-center">
      <Icon className={`h-6 w-6 mx-auto mb-2 ${STATUS_COLORS[status] || "text-slate-400"}`} />
      <p className="text-xl font-bold">{value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      <p className={`text-[10px] uppercase font-semibold mt-1 ${STATUS_COLORS[status]}`}>
        {status === "ok" ? "Normal" : status === "attention" ? "À surveiller" : "Alerte"}
      </p>
    </CardContent>
  </Card>
);

export default function ElevageEnvironment({ refreshKey }) {
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [env, setEnv] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/elevage/farms").then((res) => {
      setFarms(res.data.farms);
      if (res.data.farms.length > 0 && !farmId) setFarmId(res.data.farms[0].id);
    }).catch(() => {});
  }, [refreshKey]); // eslint-disable-line

  const load = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await api.get(`/elevage/farms/${farmId}/environment`);
      setEnv(res.data);
    } catch {
      toast.error("Erreur de lecture des capteurs");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { load(); }, [load]);

  const c = env?.current;
  return (
    <div className="space-y-4" data-testid="elevage-environment">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={farmId} onValueChange={setFarmId}>
          <SelectTrigger className="w-full sm:w-80" data-testid="env-farm-select">
            <SelectValue placeholder="Choisir une installation" />
          </SelectTrigger>
          <SelectContent>
            {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} data-testid="env-refresh-btn">
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          Relever les capteurs
        </Button>
      </div>

      {loading && !c ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>
      ) : c ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Gauge icon={Thermometer} label="Température ambiante" value={c.temperature} unit="°C" status={c.statuses.temperature} testId="env-temp" />
            <Gauge icon={Droplets} label="Humidité" value={c.humidity} unit="%" status="ok" testId="env-humidity" />
            <Gauge icon={Wind} label="Ammoniac (NH₃)" value={c.ammonia_ppm} unit="ppm" status={c.statuses.ammonia} testId="env-ammonia" />
            <Gauge icon={Wind} label="CO₂" value={c.co2_ppm} unit="ppm" status={c.statuses.co2} testId="env-co2" />
            <Gauge icon={Waves} label="Qualité de l'eau" value={c.water_quality_index} unit="/100" status={c.statuses.water} testId="env-water" />
            <Gauge icon={Wheat} label="Niveau mangeoire" value={c.feed_level_pct} unit="%" status={c.statuses.feed} testId="env-feed" />
          </div>

          <Card data-testid="env-thermal">
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Caméra thermique — température corporelle moyenne : {c.thermal_body_temp}°C</p>
                <p className="text-xs text-slate-400">
                  Plage idéale pour {env.farm.species === "volaille" ? "les volailles" : `les ${env.farm.species}s`} : {env.ideal_temp[0]}–{env.ideal_temp[1]}°C ambiant ·
                  {c.thermal_body_temp > 39.8 ? " ⚠ Fièvre possible détectée — dépistage recommandé" : " Aucune fièvre détectée dans le troupeau"}
                </p>
              </div>
            </CardContent>
          </Card>
          <p className="text-[11px] text-slate-500">
            Capteurs simulés (démo) : caméra RGB + thermique, capteur qualité eau (pH/turbidité), capteur NH₃/CO₂, micro audio.
            Dernier relevé : {new Date(c.recorded_at).toLocaleString("fr-FR")}
          </p>
        </>
      ) : null}
    </div>
  );
}
