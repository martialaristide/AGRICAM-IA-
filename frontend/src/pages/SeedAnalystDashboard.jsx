import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  FlaskConical, Leaf, CheckCircle, XCircle, BarChart3,
  FileText, TrendingUp, AlertTriangle, Search, Plus,
  Download, Calendar, Microscope, Target, Activity
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const seedBatches = [
  { id: "SB-001", variety: "Mais CAMIR-01", origin: "IRAD Nkolbisson", germination: 94, purity: 98.5, moisture: 11.2, status: "certified", date: "2026-01-15" },
  { id: "SB-002", variety: "Riz Nerica-L19", origin: "IRAD Wakwa", germination: 88, purity: 97.8, moisture: 12.1, status: "pending", date: "2026-02-01" },
  { id: "SB-003", variety: "Sorgho S35", origin: "Import Nigeria", germination: 72, purity: 95.2, moisture: 13.5, status: "rejected", date: "2026-02-10" },
  { id: "SB-004", variety: "Arachide RMP-12", origin: "IRAD Maroua", germination: 91, purity: 99.1, moisture: 8.4, status: "certified", date: "2026-01-28" },
  { id: "SB-005", variety: "Haricot MAC-44", origin: "Local Bafoussam", germination: 85, purity: 96.7, moisture: 10.8, status: "testing", date: "2026-02-20" },
];

const SeedAnalystDashboard = () => {
  const [batches] = useState(seedBatches);
  const [filter, setFilter] = useState("all");

  const stats = {
    total: batches.length,
    certified: batches.filter(b => b.status === "certified").length,
    pending: batches.filter(b => b.status === "pending" || b.status === "testing").length,
    rejected: batches.filter(b => b.status === "rejected").length,
    avgGermination: Math.round(batches.reduce((a, b) => a + b.germination, 0) / batches.length),
  };

  const statusConfig = {
    certified: { label: "Certifie", color: "bg-emerald-500", icon: CheckCircle },
    pending: { label: "En attente", color: "bg-amber-500", icon: Activity },
    testing: { label: "En test", color: "bg-blue-500", icon: FlaskConical },
    rejected: { label: "Rejete", color: "bg-red-500", icon: XCircle },
  };

  const filtered = filter === "all" ? batches : batches.filter(b => b.status === filter);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="seed-analyst-dashboard">
      <div className="gradient-ai-analysis rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-500/30">
            <Microscope className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">Analyse des Semences</h1>
            <p className="text-slate-400">Laboratoire de certification et controle qualite</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total lots", value: stats.total, icon: FlaskConical, color: "violet" },
          { label: "Certifies", value: stats.certified, icon: CheckCircle, color: "emerald" },
          { label: "En cours", value: stats.pending, icon: Activity, color: "amber" },
          { label: "Rejetes", value: stats.rejected, icon: XCircle, color: "red" },
          { label: "Germination moy.", value: `${stats.avgGermination}%`, icon: Leaf, color: "green" },
        ].map((s, i) => (
          <Card key={i} className="glass-card card-hover">
            <CardContent className="p-4 text-center">
              <div className={cn("mx-auto h-10 w-10 rounded-xl flex items-center justify-center mb-2",
                `bg-${s.color}-900/30 ring-1 ring-${s.color}-500/20`)}>
                <s.icon className={`h-5 w-5 text-${s.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter + Batches Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
          <CardTitle className="text-white">Lots de Semences</CardTitle>
          <div className="flex gap-2">
            {["all", "certified", "testing", "pending", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
                className={filter === f ? "bg-emerald-600" : "border-slate-700 text-slate-400"}
                onClick={() => setFilter(f)}>
                {f === "all" ? "Tous" : statusConfig[f]?.label || f}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  {["Lot", "Variete", "Origine", "Germination", "Purete", "Humidite", "Statut", "Date"].map(h => (
                    <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(batch => {
                  const sc = statusConfig[batch.status];
                  return (
                    <tr key={batch.id} className="border-b border-slate-800/30 hover:bg-slate-800/20" data-testid={`batch-${batch.id}`}>
                      <td className="p-3 text-sm font-mono text-emerald-400">{batch.id}</td>
                      <td className="p-3 text-sm text-white font-medium">{batch.variety}</td>
                      <td className="p-3 text-sm text-slate-400">{batch.origin}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={batch.germination} className="h-2 w-16" />
                          <span className={cn("text-sm font-medium", batch.germination >= 85 ? "text-emerald-400" : batch.germination >= 70 ? "text-amber-400" : "text-red-400")}>
                            {batch.germination}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-white">{batch.purity}%</td>
                      <td className="p-3 text-sm text-white">{batch.moisture}%</td>
                      <td className="p-3"><Badge className={cn("text-white text-xs", sc.color)}>{sc.label}</Badge></td>
                      <td className="p-3 text-sm text-slate-500">{batch.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white text-base">Normes de Certification</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { label: "Germination min.", threshold: 85, color: "emerald" },
              { label: "Purete min.", threshold: 95, color: "blue" },
              { label: "Humidite max.", threshold: 13, color: "amber" },
            ].map((norm, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <span className="text-sm text-slate-400">{norm.label}</span>
                <span className={`text-sm font-bold text-${norm.color}-400`}>{norm.threshold}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white text-base">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button className="w-full bg-violet-600 hover:bg-violet-500 justify-start gap-3" onClick={() => toast.success("Nouveau test initie")}>
              <Plus className="h-4 w-4" /> Nouveau test de germination
            </Button>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 justify-start gap-3" onClick={() => toast.success("Rapport genere")}>
              <FileText className="h-4 w-4" /> Generer certificat
            </Button>
            <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:text-white justify-start gap-3" onClick={() => toast.success("Export en cours")}>
              <Download className="h-4 w-4" /> Exporter resultats CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedAnalystDashboard;
