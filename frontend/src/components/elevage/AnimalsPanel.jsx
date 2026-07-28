import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader2, HeartPulse, Weight, Utensils, ShoppingCart, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const STATUS_BADGES = {
  sain: "bg-emerald-500/20 text-emerald-400",
  surveillance: "bg-amber-500/20 text-amber-400",
  malade: "bg-red-500/20 text-red-400",
};
const AGE_LABELS = { adulte: "Adulte", juvenile: "Juvénile", nouveau_ne: "Nouveau-né" };

export default function AnimalsPanel({ refreshKey }) {
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedReco, setFeedReco] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/elevage/farms").then((res) => {
      setFarms(res.data.farms);
      if (res.data.farms.length > 0 && !farmId) setFarmId(res.data.farms[0].id);
    }).catch(() => {});
  }, [refreshKey]); // eslint-disable-line

  const loadAnimals = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await api.get(`/elevage/farms/${farmId}/animals`);
      setAnimals(res.data.animals);
    } catch {
      toast.error("Erreur de chargement des animaux");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { loadAnimals(); }, [loadAnimals, refreshKey]);

  const openDetail = async (animal) => {
    setFeedReco(null);
    try {
      const res = await api.get(`/elevage/animals/${animal.id}`);
      setSelected(res.data);
    } catch {
      toast.error("Erreur de chargement de la fiche");
    }
  };

  const loadFeedReco = async () => {
    if (!selected) return;
    setLoadingFeed(true);
    try {
      const res = await api.get(`/elevage/animals/${selected.animal.id}/feed-recommendation`);
      setFeedReco(res.data);
    } catch {
      toast.error("Erreur de calcul de la ration");
    } finally {
      setLoadingFeed(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="animals-panel">
      <Select value={farmId} onValueChange={setFarmId}>
        <SelectTrigger className="w-full sm:w-80" data-testid="animals-farm-select">
          <SelectValue placeholder="Choisir une installation" />
        </SelectTrigger>
        <SelectContent>
          {farms.map((f) => (
            <SelectItem key={f.id} value={f.id}>{f.name} ({f.stats.total})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {animals.map((a) => (
            <Card
              key={a.id}
              data-testid={`animal-card-${a.tag}`}
              className="cursor-pointer hover:border-lime-500/40 transition-colors"
              onClick={() => openDetail(a)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm">{a.tag}</p>
                  <Badge className={`border-0 text-[10px] ${STATUS_BADGES[a.status] || STATUS_BADGES.sain}`}>{a.status}</Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {a.is_group ? `Lot de ${a.group_count} sujets` : `${a.sex === "male" ? "♂ Mâle" : "♀ Femelle"} · ${AGE_LABELS[a.age_class]}`}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-300"><Weight className="h-3 w-3" />{a.weight_kg} kg</span>
                  <span className={`flex items-center gap-1 font-semibold ${a.health_score >= 75 ? "text-emerald-400" : a.health_score >= 55 ? "text-amber-400" : "text-red-400"}`}>
                    <HeartPulse className="h-3 w-3" />{a.health_score}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.health_score >= 75 ? "bg-emerald-500" : a.health_score >= 55 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${a.health_score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="animal-detail-dialog">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  Fiche {selected.animal.tag}
                  <Badge className={`border-0 ${STATUS_BADGES[selected.animal.status]}`}>{selected.animal.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {[
                  ["Sexe", selected.animal.is_group ? "Mixte" : selected.animal.sex === "male" ? "♂ Mâle" : "♀ Femelle"],
                  ["Âge", AGE_LABELS[selected.animal.age_class]],
                  ["Poids", `${selected.animal.weight_kg} kg`],
                  ["Score santé", `${selected.animal.health_score}/100`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-slate-500/10 py-2 px-1">
                    <p className="font-semibold text-sm">{v}</p>
                    <p className="text-[10px] text-slate-400">{l}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Weight className="h-4 w-4 text-lime-400" />Courbe de croissance</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(selected.animal.weight_history || []).map((h) => ({ date: new Date(h.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }), poids: h.weight }))}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={35} />
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="poids" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ClipboardList className="h-4 w-4 text-sky-400" />Carnet sanitaire digital</p>
                {selected.health_events.length === 0 ? (
                  <p className="text-xs text-slate-500">Aucun événement sanitaire — animal en bonne santé.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selected.health_events.map((e) => (
                      <div key={e.id} className="flex items-start gap-2 text-xs rounded-lg bg-slate-500/10 p-2">
                        <HeartPulse className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium">{e.label}</p>
                          <p className="text-slate-500">{new Date(e.detected_at).toLocaleString("fr-FR")} · confiance {e.confidence}% · {e.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700/50 pt-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5"><Utensils className="h-4 w-4 text-lime-400" />Recommandation alimentaire IA</p>
                  <Button size="sm" variant="outline" onClick={loadFeedReco} disabled={loadingFeed} data-testid="feed-reco-btn" className="border-lime-500/40 text-lime-400 hover:bg-lime-500/10">
                    {loadingFeed ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Utensils className="h-3.5 w-3.5 mr-1.5" />}
                    Calculer la ration
                  </Button>
                </div>
                {feedReco && (
                  <div className="mt-3 rounded-lg bg-lime-500/10 border border-lime-500/20 p-3 text-sm" data-testid="feed-reco-result">
                    <p className="text-slate-200">{feedReco.advice}</p>
                    <p className="text-xs text-slate-400 mt-1">Ration : {feedReco.daily_ration_kg} kg/jour · Ingrédients : {feedReco.ingredients.join(", ")}</p>
                    {feedReco.marketplace_products?.length > 0 && (
                      <Button size="sm" className="mt-2 bg-lime-500 hover:bg-lime-400 text-slate-900" onClick={() => navigate("/marketplace")} data-testid="feed-marketplace-btn">
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Commander l'aliment sur la Marketplace
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
