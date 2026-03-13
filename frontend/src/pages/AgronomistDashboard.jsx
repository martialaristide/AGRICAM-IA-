import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Leaf, MapPin, Users, FileText, TrendingUp, Calendar,
  Droplets, Thermometer, Bug, Microscope, Target,
  ClipboardCheck, BarChart3, Plus, Sprout, Activity,
  AlertTriangle, Sun, Wind, FlaskConical, Globe,
  TreePine, Zap, Shield, Bell, Brain
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const AgronomistDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const fieldVisits = [
    { id: 1, farmer: "Jean Dupont", parcel: "Parcelle Nord", crop: "Mais", date: "2026-03-10", status: "done", score: 87, issues: ["Stress hydrique leger"] },
    { id: 2, farmer: "Marie Nkolo", parcel: "Champ Banane-1", crop: "Banane Plantain", date: "2026-03-12", status: "scheduled", score: null, issues: [] },
    { id: 3, farmer: "Paul Tagne", parcel: "Riziere Est", crop: "Riz", date: "2026-03-08", status: "done", score: 72, issues: ["Pyriculariose detectee", "Carence azote"] },
    { id: 4, farmer: "Awa Sow", parcel: "Parcelle Cacao", crop: "Cacao", date: "2026-03-15", status: "scheduled", score: null, issues: [] },
  ];

  const diseaseAlerts = [
    { disease: "Rouille du mais", zone: "Centre", risk: 78, spread: "Haute", affected: "12 exploitations", action: "Traitement fongicide urgent" },
    { disease: "Pyriculariose du riz", zone: "Extreme-Nord", risk: 65, spread: "Moyenne", affected: "8 exploitations", action: "Surveillance renforcee" },
    { disease: "Pourriture brune cacao", zone: "Sud-Ouest", risk: 42, spread: "Faible", affected: "3 exploitations", action: "Prevention recommandee" },
  ];

  const carbonData = {
    sequestration: 2.4, biodiversityIndex: 0.72, soilOrganicMatter: 3.8,
    credits: 45, certification: "En cours", practices: [
      { name: "Couverture vegetale", impact: "+0.8 tCO2/ha/an", adopted: 67 },
      { name: "Agroforesterie", impact: "+1.2 tCO2/ha/an", adopted: 34 },
      { name: "Semis direct", impact: "+0.5 tCO2/ha/an", adopted: 52 },
      { name: "Rotation diversifiee", impact: "+0.3 tCO2/ha/an", adopted: 78 },
    ]
  };

  const dynamicAlerts = [
    { type: "frost", msg: t("roles.agronomist.frostAlert") + " cette nuit. Procedure de protection a activer.", time: "Il y a 30min", priority: "critical" },
    { type: "rain", msg: t("roles.agronomist.rainAlert") + ". " + t("roles.agronomist.treatmentDelay") + " phytosanitaire a demain.", time: "Il y a 2h", priority: "warning" },
    { type: "pest", msg: "Chenille legionnaire detectee dans zone Est. Intervention rapide recommandee.", time: "Il y a 5h", priority: "high" },
  ];

  return (
    <div className="space-y-6 animate-slide-in" data-testid="agronomist-dashboard">
      <div className="gradient-parcels rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
            <Sprout className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">{t("roles.agronomist.title")}</h1>
            <p className="text-slate-400">{t("roles.agronomist.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: t("pages.dashboard.overview"), icon: BarChart3 },
          { id: "visits", label: t("roles.agronomist.fieldVisits"), icon: MapPin },
          { id: "copilot", label: t("roles.agronomist.aiCopilot"), icon: Brain },
          { id: "epidemiology", label: t("roles.agronomist.epidemiology"), icon: Bug },
          { id: "carbon", label: t("roles.agronomist.carbonSimulator"), icon: TreePine },
          { id: "dynamic", label: t("roles.agronomist.dynamicRecommendations"), icon: Zap },
        ].map(tab => (
          <Button key={tab.id} size="sm" className={cn("gap-2 whitespace-nowrap", activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700")} onClick={() => setActiveTab(tab.id)}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("roles.agronomist.farmerSupervised"), value: "47", icon: Users, color: "emerald" },
              { label: t("roles.agronomist.monthlyVisits"), value: "12", icon: MapPin, color: "blue" },
              { label: t("pages.dashboard.activeAlerts"), value: "5", icon: AlertTriangle, color: "amber" },
              { label: t("roles.agronomist.healthScore"), value: "82%", icon: Activity, color: "green" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-5 text-center">
                <s.icon className={`h-8 w-8 mx-auto mb-2 text-${s.color}-400`} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">{t("roles.agronomist.supervisedCrops")}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {[{crop: "Mais", area: "156 ha", health: 85, farmers: 18}, {crop: "Cacao", area: "89 ha", health: 78, farmers: 12}, {crop: "Riz paddy", area: "67 ha", health: 71, farmers: 9}, {crop: "Banane", area: "45 ha", health: 92, farmers: 8}].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30">
                    <Leaf className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{c.crop}</span><span className="text-xs text-slate-500">{c.area} - {c.farmers} agriculteurs</span></div>
                      <div className="flex items-center gap-2 mt-1"><Progress value={c.health} className="h-1.5 flex-1" /><span className={cn("text-xs font-medium", c.health >= 80 ? "text-emerald-400" : "text-amber-400")}>{c.health}%</span></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Conditions climatiques</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {[{label: "Temperature", value: "28C", icon: Thermometer, color: "orange"}, {label: "Humidite", value: "72%", icon: Droplets, color: "blue"}, {label: "Ensoleillement", value: "8.5h/j", icon: Sun, color: "yellow"}, {label: "Vent", value: "12 km/h", icon: Wind, color: "cyan"}].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-3"><w.icon className={`h-5 w-5 text-${w.color}-400`} /><span className="text-sm text-slate-400">{w.label}</span></div>
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
            <CardTitle className="text-white">{t("roles.agronomist.fieldVisits")}</CardTitle>
            <Button size="sm" className="bg-emerald-600 gap-2" onClick={() => toast.success("Visite planifiee")}><Plus className="h-4 w-4" />Planifier</Button>
          </CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-slate-800/30">
            {fieldVisits.map(v => (
              <div key={v.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div><span className="font-medium text-white">{v.farmer}</span><span className="text-slate-500 mx-2">-</span><span className="text-sm text-slate-400">{v.parcel} ({v.crop})</span></div>
                  <Badge className={v.status === "done" ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"}>{v.status === "done" ? "Effectuee" : "Planifiee"}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{v.date}</div>
                  {v.score && <div className="flex items-center gap-1"><Target className="h-3.5 w-3.5" />Score: <span className={v.score >= 80 ? "text-emerald-400" : "text-amber-400"}>{v.score}/100</span></div>}
                  {v.issues.length > 0 && <div className="flex items-center gap-1 text-amber-400"><AlertTriangle className="h-3.5 w-3.5" />{v.issues.length} probleme(s)</div>}
                </div>
                {v.issues.length > 0 && <div className="flex gap-2 mt-2">{v.issues.map((issue, j) => <Badge key={j} variant="outline" className="text-xs border-amber-700 text-amber-400">{issue}</Badge>)}</div>}
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}

      {activeTab === "copilot" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><Brain className="h-5 w-5 text-violet-400" />{t("roles.agronomist.aiCopilot")}</CardTitle></CardHeader>
          <CardContent className="p-6 text-center">
            <Brain className="h-16 w-16 mx-auto text-violet-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Agri-GPT Expert</h3>
            <p className="text-sm text-slate-400 mb-6">Generation automatique de rapports, synthese de litterature scientifique, diagnostic avance</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
              <Button className="bg-violet-600 hover:bg-violet-500 gap-2" onClick={() => toast.success("Rapport en generation...")}><FileText className="h-4 w-4" />{t("roles.agronomist.generateReport")}</Button>
              <Button variant="outline" className="border-slate-700 text-slate-400 gap-2" onClick={() => window.location.href = "/agribot-ia"}><FlaskConical className="h-4 w-4" />AGRI GENIUS</Button>
            </div>
            <div className="space-y-2 text-left max-w-md mx-auto">
              {["Rapport conseil personnalise (PDF)", "Synthese publications agronomiques", "Diagnostic phytosanitaire avance", "Plan de culture optimise"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-400 p-2 rounded-lg bg-slate-800/30"><Zap className="h-4 w-4 text-emerald-400" />{f}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "epidemiology" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.agronomist.diseasePropagation")} - {t("roles.agronomist.riskMap")}</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {diseaseAlerts.map((d, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", d.risk >= 70 ? "border-l-red-500 bg-red-900/10" : d.risk >= 50 ? "border-l-amber-500 bg-amber-900/10" : "border-l-blue-500 bg-blue-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Bug className="h-4 w-4 text-red-400" /><span className="text-white font-medium">{d.disease}</span></div>
                  <Badge className={cn("text-white text-xs", d.risk >= 70 ? "bg-red-500" : d.risk >= 50 ? "bg-amber-500" : "bg-blue-500")}>Risque: {d.risk}%</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                  <div><span className="text-slate-500">Zone: </span><span className="text-white">{d.zone}</span></div>
                  <div><span className="text-slate-500">Propagation: </span><span className="text-white">{d.spread}</span></div>
                  <div><span className="text-slate-500">Affectes: </span><span className="text-white">{d.affected}</span></div>
                </div>
                <p className="text-xs text-emerald-400 p-2 rounded bg-emerald-900/20">Action: {d.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "carbon" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("roles.agronomist.carbonSequestration"), value: `${carbonData.sequestration} tCO2/ha`, icon: TreePine, color: "emerald" },
              { label: t("roles.agronomist.biodiversity"), value: carbonData.biodiversityIndex, icon: Leaf, color: "green" },
              { label: t("roles.agronomist.soilHealth"), value: `${carbonData.soilOrganicMatter}%`, icon: Globe, color: "amber" },
              { label: t("roles.agronomist.carbonCredits"), value: carbonData.credits, icon: Shield, color: "cyan" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-2 text-${s.color}-400`} />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">Pratiques agroecologiques</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {carbonData.practices.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30">
                  <TreePine className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm text-white">{p.name}</span><span className="text-sm text-emerald-400">{p.impact}</span></div><div className="flex items-center gap-2"><Progress value={p.adopted} className="h-1.5 flex-1" /><span className="text-xs text-slate-500">{p.adopted}% adoption</span></div></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "dynamic" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><Bell className="h-5 w-5 text-amber-400" />{t("roles.agronomist.dynamicRecommendations")} temps reel</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {dynamicAlerts.map((a, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", a.priority === "critical" ? "border-l-red-500 bg-red-900/10" : a.priority === "high" ? "border-l-amber-500 bg-amber-900/10" : "border-l-blue-500 bg-blue-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{a.msg}</p>
                  <Badge className={cn("text-white text-xs", a.priority === "critical" ? "bg-red-500" : a.priority === "high" ? "bg-amber-500" : "bg-blue-500")}>{a.priority}</Badge>
                </div>
                <p className="text-xs text-slate-500">{a.time}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500 text-center pt-2">Les alertes sont mises a jour en temps reel en fonction des donnees meteo et satellite</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgronomistDashboard;
