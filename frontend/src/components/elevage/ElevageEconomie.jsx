import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, TrendingUp, Banknote, CalendarClock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { toast } from "sonner";

export default function ElevageEconomie({ refreshKey }) {
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [data, setData] = useState(null);
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
      const res = await api.get(`/elevage/farms/${farmId}/price-prediction`);
      setData(res.data);
    } catch {
      toast.error("Erreur de prédiction des prix");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => { load(); }, [load]);

  const chartData = data ? [{ month: "Actuel", price_kg: data.current_price_kg }, ...data.forecast] : [];

  return (
    <div className="space-y-4" data-testid="elevage-economie">
      <Select value={farmId} onValueChange={setFarmId}>
        <SelectTrigger className="w-full sm:w-80" data-testid="eco-farm-select">
          <SelectValue placeholder="Choisir une installation" />
        </SelectTrigger>
        <SelectContent>
          {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card data-testid="eco-current-price">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lime-500/15 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-lime-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{data.current_price_kg.toLocaleString("fr-FR")} FCFA/kg</p>
                  <p className="text-xs text-slate-400">Prix actuel — {data.region}</p>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="eco-herd-value">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                  <Banknote className="h-5 w-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{(data.herd_value_fcfa / 1000000).toFixed(2)}M FCFA</p>
                  <p className="text-xs text-slate-400">Valeur estimée du cheptel</p>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="eco-optimal-sale">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <CalendarClock className="h-5 w-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{data.optimal_sale.month}</p>
                  <p className="text-xs text-slate-400">Vente optimale <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] ml-1">+{data.optimal_sale.gain_pct}%</Badge></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="font-semibold text-sm mb-3">Prévision du prix du kg — {data.farm.species_label} (6 mois)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={45} domain={["dataMin - 100", "dataMax + 100"]} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v.toLocaleString("fr-FR")} FCFA/kg`, "Prix"]} />
                    <Line type="monotone" dataKey="price_kg" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} />
                    <ReferenceDot x={data.optimal_sale.month} y={data.optimal_sale.price_kg} r={6} fill="#f59e0b" stroke="#fff" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 rounded-lg bg-lime-500/10 border border-lime-500/20 p-3 text-sm text-slate-200" data-testid="eco-advice">
                {data.advice}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Modèle : régression saisonnière alimentée par les prix de la Marketplace AgriCam + données de marché régionales. Utile aussi pour le scoring de crédit bancaire.
              </p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
