import React, { useState, useEffect } from "react";
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
  TreePine, Zap, Shield, Bell, Brain, Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const AgronomistDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [diseaseAlerts, setDiseaseAlerts] = useState([]);
  const [carbonData, setCarbonData] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [interventionPlan, setInterventionPlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, carbonRes] = await Promise.all([
          api.get("/epidemiology/alerts").catch(() => ({ data: [] })),
          api.get("/epidemiology/carbon-tracking").catch(() => ({ data: null })),
        ]);
        setDiseaseAlerts(alertsRes.data || []);
        setCarbonData(carbonRes.data);
      } catch {}
    };
    fetchData();
  }, []);

  const predictSpread = async (disease) => {
    setPredicting(true);
    try {
      const res = await api.post("/epidemiology/predict-spread", {
        disease_name: disease.disease, region: disease.zone, crop_type: "Mais",
        affected_area_ha: disease.affected_area_ha || 30, severity: "medium"
      });
      setPrediction(res.data.prediction);
      toast.success("Prediction epidemiologique generee !");
    } catch { toast.error("Erreur prediction"); }
    finally { setPredicting(false); }
  };

  const generatePlan = async (disease) => {
    try {
      const res = await api.post("/epidemiology/intervention-plan", {
        disease_name: disease.disease, region: disease.zone, crop_type: "Mais", budget_xaf: 500000
      });
      setInterventionPlan(res.data.plan);
      toast.success("Plan d'intervention genere !");
    } catch { toast.error("Erreur generation plan"); }
  };

  const fieldVisits = [
    { id: 1, farmer: "Jean Dupont", parcel: "Parcelle Nord", crop: "Mais", date: "2026-03-10", status: "done", score: 87, issues: ["Stress hydrique leger"] },
    { id: 2, farmer: "Marie Nkolo", parcel: "Champ Banane-1", crop: "Banane Plantain", date: "2026-03-12", status: "scheduled", score: null, issues: [] },
    { id: 3, farmer: "Paul Tagne", parcel: "Riziere Est", crop: "Riz", date: "2026-03-08", status: "done", score: 72, issues: ["Pyriculariose detectee", "Carence azote"] },
    { id: 4, farmer: "Awa Sow", parcel: "Parcelle Cacao", crop: "Cacao", date: "2026-03-15", status: "scheduled", score: null, issues: [] },
  ];

  const dynamicAlerts = [
    { type: "frost", msg: "Gel prevu cette nuit. Procedure de protection a activer.", time: "Il y a 30min", priority: "critical" },
    { type: "rain", msg: "Pluies fortes. Reporter traitement phytosanitaire a demain.", time: "Il y a 2h", priority: "warning" },
    { type: "pest", msg: "Chenille legionnaire detectee dans zone Est.", time: "Il y a 5h", priority: "high" },
  ];

  const carbon = carbonData || { sequestration_tco2_ha_yr: 2.4, biodiversity_index: 0.72, soil_organic_matter_percent: 3.8, carbon_credits_earned: 45, practices: [] };

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
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.agronomist.diseasePropagation")} - Modelisation IA</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {diseaseAlerts.map((d, i) => (
                <div key={i} className={cn("p-4 rounded-xl border-l-4", (d.risk_percent || d.risk) >= 70 ? "border-l-red-500 bg-red-900/10" : (d.risk_percent || d.risk) >= 50 ? "border-l-amber-500 bg-amber-900/10" : "border-l-blue-500 bg-blue-900/10")}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Bug className="h-4 w-4 text-red-400" /><span className="text-white font-medium">{d.disease}</span></div>
                    <div className="flex gap-2">
                      <Badge className={cn("text-white text-xs", (d.risk_percent || d.risk) >= 70 ? "bg-red-500" : (d.risk_percent || d.risk) >= 50 ? "bg-amber-500" : "bg-blue-500")}>Risque: {d.risk_percent || d.risk}%</Badge>
                      {d.trend && <Badge className={cn("text-xs", d.trend === "increasing" ? "bg-red-900/40 text-red-400" : d.trend === "stable" ? "bg-amber-900/40 text-amber-400" : "bg-emerald-900/40 text-emerald-400")}>{d.trend}</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                    <div><span className="text-slate-500">Zone: </span><span className="text-white">{d.zone}</span></div>
                    <div><span className="text-slate-500">Propagation: </span><span className="text-white">{d.spread_rate || d.spread}</span></div>
                    <div><span className="text-slate-500">Affectes: </span><span className="text-white">{d.affected_farms ? `${d.affected_farms} exploitations (${d.affected_area_ha}ha)` : d.affected}</span></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => predictSpread(d)} disabled={predicting} className="bg-emerald-600 hover:bg-emerald-700 text-xs" data-testid={`predict-${i}`}>
                      {predicting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Activity className="h-3 w-3 mr-1" />}
                      Predire propagation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generatePlan(d)} className="border-slate-700 text-slate-400 text-xs" data-testid={`plan-${i}`}>
                      <Shield className="h-3 w-3 mr-1" /> Plan intervention
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-400 p-2 rounded bg-emerald-900/20 mt-2">Action: {d.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Prediction result */}
          {prediction && (
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Prediction de propagation IA</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-red-900/20 text-center"><p className="text-xs text-slate-500">Risque actuel</p><p className="text-xl font-bold text-red-400">{prediction.current_risk_percent}%</p></div>
                  <div className="p-3 rounded-lg bg-amber-900/20 text-center"><p className="text-xs text-slate-500">Surface a risque</p><p className="text-xl font-bold text-amber-400">{prediction.total_area_at_risk_ha}ha</p></div>
                  <div className="p-3 rounded-lg bg-emerald-900/20 text-center"><p className="text-xs text-slate-500">Containment</p><p className="text-xl font-bold text-emerald-400">{prediction.containment_probability_percent}%</p></div>
                </div>
                {prediction.weekly_progression && (
                  <div className="flex gap-2">{prediction.weekly_progression.map((w, j) => (
                    <div key={j} className="flex-1 p-2 rounded bg-slate-800/30 text-center">
                      <p className="text-[10px] text-slate-500">Sem {w.week}</p>
                      <p className="text-sm font-bold text-amber-400">{w.area_ha}ha</p>
                      <Progress value={w.risk} className="h-1 mt-1" />
                    </div>
                  ))}</div>
                )}
                {prediction.summary && <p className="text-sm text-slate-300 p-3 bg-slate-800/30 rounded-lg">{prediction.summary}</p>}
              </CardContent>
            </Card>
          )}
          {/* Intervention plan */}
          {interventionPlan && (
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Plan d'intervention</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-400">Duree: <span className="text-white font-bold">{interventionPlan.duration_days}j</span></span>
                  <span className="text-slate-400">Cout: <span className="text-white font-bold">{interventionPlan.total_cost_xaf?.toLocaleString()} XAF</span></span>
                  <span className="text-slate-400">Efficacite: <span className="text-emerald-400 font-bold">{interventionPlan.expected_efficacy_percent}%</span></span>
                </div>
                {interventionPlan.phases?.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/30 border-l-2 border-emerald-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">Phase {p.phase}: {p.name}</span>
                      <span className="text-xs text-slate-400">{p.duration_days}j - {p.cost_xaf?.toLocaleString()} XAF</span>
                    </div>
                    <ul className="text-xs text-slate-400 space-y-0.5">{p.actions?.map((a, j) => <li key={j}>- {a}</li>)}</ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "carbon" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Sequestration carbone", value: `${carbon.sequestration_tco2_ha_yr} tCO2/ha`, icon: TreePine, color: "emerald" },
              { label: "Biodiversite", value: carbon.biodiversity_index, icon: Leaf, color: "green" },
              { label: "Matiere organique", value: `${carbon.soil_organic_matter_percent}%`, icon: Globe, color: "amber" },
              { label: "Credits carbone", value: carbon.carbon_credits_earned, icon: Shield, color: "cyan" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-2 text-${s.color}-400`} />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          {carbon.current_progress_percent && (
            <Card className="glass-card"><CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Objectif annuel: {carbon.annual_target_tco2} tCO2</span>
                <span className="text-emerald-400">{carbon.current_progress_percent}%</span>
              </div>
              <Progress value={carbon.current_progress_percent} className="h-3" />
            </CardContent></Card>
          )}
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">Pratiques agroecologiques</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {(carbon.practices || []).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30">
                  <TreePine className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm text-white">{p.name}</span><span className="text-sm text-emerald-400">{p.impact}</span></div><div className="flex items-center gap-2"><Progress value={p.adoption_percent || p.adopted} className="h-1.5 flex-1" /><span className="text-xs text-slate-500">{p.adoption_percent || p.adopted}% ({p.area_ha || 0}ha)</span></div></div>
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
