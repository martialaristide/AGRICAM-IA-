import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Beef, Bird, PawPrint, Camera, Loader2, HeartPulse, Bell, Banknote, Users } from "lucide-react";
import { toast } from "sonner";

export const SPECIES_ICONS = { bovin: Beef, porcin: PawPrint, ovin: PawPrint, volaille: Bird };
export const SPECIES_COLORS = {
  bovin: "text-amber-400 bg-amber-500/15",
  porcin: "text-rose-400 bg-rose-500/15",
  ovin: "text-sky-400 bg-sky-500/15",
  volaille: "text-orange-400 bg-orange-500/15",
};

const StatCard = ({ icon: Icon, label, value, sub, color, testId }) => (
  <Card data-testid={testId}>
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg sm:text-xl font-bold truncate">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 truncate">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

export default function CheptelOverview({ refreshKey, onAlert }) {
  const [dashboard, setDashboard] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [d, f] = await Promise.all([api.get("/elevage/dashboard"), api.get("/elevage/farms")]);
      setDashboard(d.data);
      setFarms(f.data.farms);
    } catch {
      toast.error("Erreur de chargement du cheptel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleScan = async (farmId) => {
    setScanningId(farmId);
    try {
      const res = await api.post(`/elevage/farms/${farmId}/scan`);
      const s = res.data.scan;
      if (res.data.alert) {
        toast.warning("Écart de comptage", { description: res.data.alert.message });
        onAlert?.();
      } else {
        toast.success(`Scan caméra : ${s.detected} détectés (${s.males} ♂ / ${s.females} ♀ / ${s.juveniles} jeunes)`);
      }
      load();
    } catch {
      toast.error("Échec du scan caméra");
    } finally {
      setScanningId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>;

  return (
    <div className="space-y-4" data-testid="cheptel-overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Cheptel total" value={dashboard?.total_animals ?? 0} sub={`${dashboard?.farms_count ?? 0} installations`} color="text-lime-400 bg-lime-500/15" testId="stat-total-animals" />
        <StatCard icon={HeartPulse} label="Score santé moyen" value={`${dashboard?.avg_health_score ?? 0}/100`} sub={`${dashboard?.sick_count ?? 0} malades · ${dashboard?.watch_count ?? 0} à surveiller`} color="text-emerald-400 bg-emerald-500/15" testId="stat-health" />
        <StatCard icon={Bell} label="Alertes actives" value={dashboard?.active_alerts ?? 0} sub={`Mortalité : ${dashboard?.mortality_rate ?? 0}%`} color="text-amber-400 bg-amber-500/15" testId="stat-alerts" />
        <StatCard icon={Banknote} label="Valeur du cheptel" value={`${((dashboard?.herd_value_fcfa ?? 0) / 1000000).toFixed(1)}M`} sub="FCFA estimés" color="text-sky-400 bg-sky-500/15" testId="stat-value" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {farms.map((farm) => {
          const Icon = SPECIES_ICONS[farm.species] || PawPrint;
          return (
            <Card key={farm.id} data-testid={`farm-card-${farm.species}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${SPECIES_COLORS[farm.species]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{farm.name}</p>
                      <p className="text-xs text-slate-400 truncate">{farm.species_label} · {farm.building_type}</p>
                    </div>
                  </div>
                  <Badge className={farm.camera_status === "online" ? "bg-emerald-500/20 text-emerald-400 border-0" : "bg-red-500/20 text-red-400 border-0"}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                    Caméra {farm.camera_status === "online" ? "en ligne" : "hors ligne"}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                  <div className="rounded-lg bg-slate-500/10 py-2">
                    <p className="font-bold text-sm">{farm.stats.total}</p>
                    <p className="text-[10px] text-slate-400">Total</p>
                  </div>
                  <div className="rounded-lg bg-slate-500/10 py-2">
                    <p className="font-bold text-sm">{farm.stats.males}</p>
                    <p className="text-[10px] text-slate-400">Mâles</p>
                  </div>
                  <div className="rounded-lg bg-slate-500/10 py-2">
                    <p className="font-bold text-sm">{farm.stats.females}</p>
                    <p className="text-[10px] text-slate-400">Femelles</p>
                  </div>
                  <div className="rounded-lg bg-slate-500/10 py-2">
                    <p className="font-bold text-sm">{farm.stats.juveniles}</p>
                    <p className="text-[10px] text-slate-400">Jeunes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-semibold ${farm.stats.avg_health >= 75 ? "text-emerald-400" : farm.stats.avg_health >= 55 ? "text-amber-400" : "text-red-400"}`}>
                      Santé {farm.stats.avg_health}/100
                    </span>
                    {farm.stats.sick > 0 && <span className="text-red-400">{farm.stats.sick} malade(s)</span>}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid={`farm-scan-btn-${farm.species}`}
                    disabled={scanningId === farm.id}
                    onClick={() => handleScan(farm.id)}
                    className="border-lime-500/40 text-lime-400 hover:bg-lime-500/10"
                  >
                    {scanningId === farm.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 mr-1.5" />}
                    Scanner
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
