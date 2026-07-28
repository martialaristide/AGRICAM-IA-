import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, Building2, Users, PawPrint, Bell } from "lucide-react";
import { toast } from "sonner";

export default function CooperativeView({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    api.get("/elevage/cooperative/dashboard")
      .then((res) => setData(res.data))
      .catch((e) => {
        if (e.response?.status === 403) setForbidden(true);
        else toast.error("Erreur de chargement de la vue coopérative");
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>;
  if (forbidden) return (
    <Card><CardContent className="p-8 text-center text-slate-400">
      Vue réservée aux coopératives, agronomes et administrateurs.
    </CardContent></Card>
  );
  if (!data) return null;

  return (
    <div className="space-y-4" data-testid="cooperative-view">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [Building2, data.total_farms, "Fermes membres suivies", "text-lime-400 bg-lime-500/15", "coop-farms"],
          [Users, data.total_members, "Éleveurs membres", "text-sky-400 bg-sky-500/15", "coop-members"],
          [PawPrint, data.total_animals, `Cheptel total · santé ${data.avg_health}/100`, "text-emerald-400 bg-emerald-500/15", "coop-animals"],
          [Bell, data.total_active_alerts, `Alertes actives · mortalité ${data.mortality_rate}%`, "text-amber-400 bg-amber-500/15", "coop-alerts"],
        ].map(([Icon, value, label, color, tid]) => (
          <Card key={tid} data-testid={tid}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold">{value}</p>
                <p className="text-xs text-slate-400 truncate">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {data.by_species.map((s) => (
          <Badge key={s.species} variant="outline" className="text-xs">{s.label} : {s.count}</Badge>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm" data-testid="coop-farms-table">
            <thead>
              <tr className="border-b border-slate-700/50 text-left text-xs text-slate-400">
                <th className="p-3">Ferme</th>
                <th className="p-3">Éleveur</th>
                <th className="p-3">Filière</th>
                <th className="p-3 text-right">Cheptel</th>
                <th className="p-3 text-right">Santé</th>
                <th className="p-3 text-right">Alertes</th>
              </tr>
            </thead>
            <tbody>
              {data.farms.map((f) => (
                <tr key={f.id} className="border-b border-slate-800/50 hover:bg-slate-500/5">
                  <td className="p-3 font-medium whitespace-nowrap">{f.name}</td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">{f.owner}</td>
                  <td className="p-3"><Badge variant="outline" className="text-[10px]">{f.species_label}</Badge></td>
                  <td className="p-3 text-right">{f.total}</td>
                  <td className={`p-3 text-right font-semibold ${f.avg_health >= 75 ? "text-emerald-400" : f.avg_health >= 55 ? "text-amber-400" : "text-red-400"}`}>{f.avg_health}</td>
                  <td className="p-3 text-right">
                    {f.active_alerts > 0 ? <Badge className="bg-amber-500/20 text-amber-400 border-0">{f.active_alerts}</Badge> : <span className="text-slate-600">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-[11px] text-slate-500">
        Statistiques agrégées et anonymisées — utiles pour les coopératives, le scoring de crédit et les alertes épidémiologiques régionales (PATNUC).
      </p>
    </div>
  );
}
