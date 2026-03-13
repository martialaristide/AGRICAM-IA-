import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Leaf, MapPin, Users, FileText, TrendingUp, Calendar,
  Droplets, Thermometer, Bug, Microscope, Target,
  ClipboardCheck, BarChart3, Download, Plus, Sprout,
  Activity, AlertTriangle, Sun, Wind, FlaskConical
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const fieldVisits = [
  { id: 1, farmer: "Jean Dupont", parcel: "Parcelle Nord", crop: "Mais", date: "2026-03-10", status: "done", score: 87, issues: ["Stress hydrique leger"] },
  { id: 2, farmer: "Marie Nkolo", parcel: "Champ Banane-1", crop: "Banane Plantain", date: "2026-03-12", status: "scheduled", score: null, issues: [] },
  { id: 3, farmer: "Paul Tagne", parcel: "Riziere Est", crop: "Riz", date: "2026-03-08", status: "done", score: 72, issues: ["Pyriculariose detectee", "Carence azote"] },
  { id: 4, farmer: "Awa Sow", parcel: "Parcelle Cacao", crop: "Cacao", date: "2026-03-15", status: "scheduled", score: null, issues: [] },
];

const recommendations = [
  { crop: "Mais", region: "Centre", advice: "Appliquer NPK 20-10-10 a 200kg/ha avant le semis", priority: "high" },
  { crop: "Cacao", region: "Sud-Ouest", advice: "Tailler les branches mortes et appliquer fongicide cuprique", priority: "medium" },
  { crop: "Riz", region: "Extreme-Nord", advice: "Augmenter la lame d'eau a 5cm pendant la phase de tallage", priority: "high" },
  { crop: "Banane", region: "Littoral", advice: "Surveiller la cercosporiose noire, traitement preventif recommande", priority: "low" },
];

const AgronomistDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6 animate-slide-in" data-testid="agronomist-dashboard">
      <div className="gradient-parcels rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
            <Sprout className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">Espace Agronome</h1>
            <p className="text-slate-400">Suivi technique, diagnostics et recommandations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
          { id: "visits", label: "Visites terrain", icon: MapPin },
          { id: "reco", label: "Recommandations", icon: ClipboardCheck },
          { id: "diagnostics", label: "Diagnostics", icon: Microscope },
        ].map(tab => (
          <Button key={tab.id} size="sm"
            className={cn("gap-2", activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700")}
            onClick={() => setActiveTab(tab.id)}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Agriculteurs suivis", value: "47", icon: Users, color: "emerald" },
              { label: "Visites ce mois", value: "12", icon: MapPin, color: "blue" },
              { label: "Alertes actives", value: "5", icon: AlertTriangle, color: "amber" },
              { label: "Score moyen sante", value: "82%", icon: Activity, color: "green" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover">
                <CardContent className="p-4 text-center">
                  <s.icon className={`h-8 w-8 mx-auto mb-2 text-${s.color}-400`} />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-white text-base">Cultures supervisees</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { crop: "Mais", area: "156 ha", health: 85, farmers: 18 },
                  { crop: "Cacao", area: "89 ha", health: 78, farmers: 12 },
                  { crop: "Riz paddy", area: "67 ha", health: 71, farmers: 9 },
                  { crop: "Banane", area: "45 ha", health: 92, farmers: 8 },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <Leaf className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{c.crop}</span>
                        <span className="text-xs text-slate-500">{c.area} - {c.farmers} agriculteurs</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={c.health} className="h-1.5 flex-1" />
                        <span className={cn("text-xs font-medium", c.health >= 80 ? "text-emerald-400" : c.health >= 60 ? "text-amber-400" : "text-red-400")}>{c.health}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-white text-base">Conditions climatiques</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { label: "Temperature", value: "28°C", icon: Thermometer, color: "orange" },
                  { label: "Humidite", value: "72%", icon: Droplets, color: "blue" },
                  { label: "Ensoleillement", value: "8.5h/j", icon: Sun, color: "yellow" },
                  { label: "Vent", value: "12 km/h", icon: Wind, color: "cyan" },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <w.icon className={`h-5 w-5 text-${w.color}-400`} />
                      <span className="text-sm text-slate-400">{w.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{w.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "visits" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-white">Visites de terrain</CardTitle>
            <Button size="sm" className="bg-emerald-600 gap-2" onClick={() => toast.success("Visite planifiee")}>
              <Plus className="h-4 w-4" /> Planifier
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/30">
              {fieldVisits.map(v => (
                <div key={v.id} className="p-4 hover:bg-slate-800/20 transition-colors" data-testid={`visit-${v.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-white">{v.farmer}</span>
                      <span className="text-slate-500 mx-2">-</span>
                      <span className="text-sm text-slate-400">{v.parcel} ({v.crop})</span>
                    </div>
                    <Badge className={v.status === "done" ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"}>
                      {v.status === "done" ? "Effectuee" : "Planifiee"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {v.date}</div>
                    {v.score && <div className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Score: <span className={v.score >= 80 ? "text-emerald-400" : "text-amber-400"}>{v.score}/100</span></div>}
                    {v.issues.length > 0 && <div className="flex items-center gap-1 text-amber-400"><AlertTriangle className="h-3.5 w-3.5" /> {v.issues.length} probleme(s)</div>}
                  </div>
                  {v.issues.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {v.issues.map((issue, j) => <Badge key={j} variant="outline" className="text-xs border-amber-700 text-amber-400">{issue}</Badge>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "reco" && (
        <div className="space-y-4">
          {recommendations.map((r, i) => (
            <Card key={i} className="glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    r.priority === "high" ? "bg-red-900/30 ring-1 ring-red-500/20" : r.priority === "medium" ? "bg-amber-900/30 ring-1 ring-amber-500/20" : "bg-blue-900/30 ring-1 ring-blue-500/20")}>
                    <ClipboardCheck className={cn("h-5 w-5", r.priority === "high" ? "text-red-400" : r.priority === "medium" ? "text-amber-400" : "text-blue-400")} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{r.crop}</span>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{r.region}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{r.advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "diagnostics" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white">Diagnostic phytosanitaire</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <Microscope className="h-16 w-16 mx-auto text-violet-400 mb-4" />
            <p className="text-white font-medium mb-2">Analysez vos cultures</p>
            <p className="text-sm text-slate-500 mb-4">Utilisez AGRI GENIUS ou la Camera IA pour diagnostiquer les maladies et ravageurs</p>
            <div className="flex gap-3 justify-center">
              <Button className="bg-violet-600 hover:bg-violet-500 gap-2" onClick={() => window.location.href = "/agribot-ia"}>
                <FlaskConical className="h-4 w-4" /> AGRI GENIUS
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-400 gap-2" onClick={() => window.location.href = "/camera-ia"}>
                <Microscope className="h-4 w-4" /> Camera IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgronomistDashboard;
