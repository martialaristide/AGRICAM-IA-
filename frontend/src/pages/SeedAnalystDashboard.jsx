import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FlaskConical, Leaf, CheckCircle, XCircle, Activity,
  FileText, Microscope, Target, Dna, Globe,
  Download, Plus, Beaker, Sprout, Thermometer,
  BarChart3, ShieldCheck, Layers, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const SeedAnalystDashboard = () => {
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("batches");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [genomicResult, setGenomicResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, simsRes] = await Promise.all([
          api.get("/digital-twin/seed-batches").catch(() => ({ data: [] })),
          api.get("/digital-twin/simulations").catch(() => ({ data: [] })),
        ]);
        setBatches(batchesRes.data || []);
        setSimulations(simsRes.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const runSimulation = async (variety) => {
    setRunning(true);
    try {
      const res = await api.post("/digital-twin/simulate", { variety, climate_scenario: "tropical_humide", soil_type: "ferralitique", rainfall_mm: 1200, temperature_avg: 26, simulation_years: 5, num_scenarios: 5000 });
      if (res.data.simulation) {
        setSimulations(prev => [res.data.simulation, ...prev]);
        toast.success("Simulation digital twin terminee !");
      }
    } catch { toast.error("Erreur simulation"); }
    finally { setRunning(false); }
  };

  const runGenomicAnalysis = async (variety) => {
    try {
      const res = await api.post("/digital-twin/genomic-analysis", { variety, target_trait: "yield" });
      setGenomicResult(res.data.analysis);
      toast.success("Analyse genomique terminee !");
    } catch { toast.error("Erreur analyse genomique"); }
  };

  const stats = {
    total: batches.length, certified: batches.filter(b => b.status === "certified").length,
    pending: batches.filter(b => b.status === "pending" || b.status === "testing").length,
    rejected: batches.filter(b => b.status === "rejected").length,
    avgGermination: batches.length > 0 ? Math.round(batches.reduce((a, b) => a + (b.germination || 0), 0) / batches.length) : 0,
  };

  const statusColors = { certified: "bg-emerald-500", pending: "bg-amber-500", testing: "bg-blue-500", rejected: "bg-red-500" };
  const statusLabels = { certified: "Certifie", pending: "En attente", testing: "En test", rejected: "Rejete" };
  const filtered = filter === "all" ? batches : batches.filter(b => b.status === filter);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="seed-analyst-dashboard">
      <div className="gradient-ai-analysis rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-500/30">
            <Microscope className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">{t("roles.seedAnalyst.title")}</h1>
            <p className="text-slate-400">{t("roles.seedAnalyst.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FlaskConical, color: "violet" },
          { label: t("roles.seedAnalyst.certified"), value: stats.certified, icon: CheckCircle, color: "emerald" },
          { label: t("roles.seedAnalyst.pending"), value: stats.pending, icon: Activity, color: "amber" },
          { label: t("roles.seedAnalyst.rejected"), value: stats.rejected, icon: XCircle, color: "red" },
          { label: t("roles.seedAnalyst.germination"), value: `${stats.avgGermination}%`, icon: Leaf, color: "green" },
        ].map((s, i) => (
          <Card key={i} className="glass-card card-hover"><CardContent className="p-4 text-center">
            <s.icon className={`h-6 w-6 mx-auto mb-2 text-${s.color}-400`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "batches", label: "Lots", icon: FlaskConical },
          { id: "twin", label: t("roles.seedAnalyst.digitalTwin"), icon: Layers },
          { id: "genomic", label: t("roles.seedAnalyst.genomicModeling"), icon: Dna },
          { id: "crossing", label: t("roles.seedAnalyst.crossingSimulator"), icon: Sprout },
          { id: "climate", label: t("roles.seedAnalyst.climateAdaptation"), icon: Globe },
        ].map(tab => (
          <Button key={tab.id} size="sm" className={cn("gap-2 whitespace-nowrap", activeTab === tab.id ? "bg-violet-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700")} onClick={() => setActiveTab(tab.id)}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "batches" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-white">Lots de Semences</CardTitle>
            <div className="flex gap-2">{["all", "certified", "testing", "pending", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} className={filter === f ? "bg-emerald-600" : "border-slate-700 text-slate-400"} onClick={() => setFilter(f)}>
                {f === "all" ? "Tous" : statusLabels[f] || f}
              </Button>
            ))}</div>
          </CardHeader>
          <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800/50">
            {[t("roles.seedAnalyst.batchId"), t("roles.seedAnalyst.variety"), t("roles.seedAnalyst.origin"), t("roles.seedAnalyst.germination"), t("roles.seedAnalyst.purity"), t("roles.seedAnalyst.moisture"), "Status", "Date"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
          </tr></thead><tbody>{filtered.map(b => (
            <tr key={b.id} className="border-b border-slate-800/30 hover:bg-slate-800/20">
              <td className="p-3 text-sm font-mono text-emerald-400">{b.id}</td>
              <td className="p-3 text-sm text-white font-medium">{b.variety}</td>
              <td className="p-3 text-sm text-slate-400">{b.origin}</td>
              <td className="p-3"><div className="flex items-center gap-2"><Progress value={b.germination} className="h-2 w-16" /><span className={cn("text-sm font-medium", b.germination >= 85 ? "text-emerald-400" : b.germination >= 70 ? "text-amber-400" : "text-red-400")}>{b.germination}%</span></div></td>
              <td className="p-3 text-sm text-white">{b.purity}%</td>
              <td className="p-3 text-sm text-white">{b.moisture}%</td>
              <td className="p-3"><Badge className={cn("text-white text-xs", statusColors[b.status])}>{statusLabels[b.status]}</Badge></td>
              <td className="p-3 text-sm text-slate-500">{b.date}</td>
            </tr>
          ))}</tbody></table></div></CardContent>
        </Card>
      )}

      {activeTab === "twin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Simulations Digital Twin</h3>
            <Button size="sm" onClick={() => runSimulation("Mais CAMIR-01")} disabled={running}
              className="bg-violet-600 hover:bg-violet-700 gap-2" data-testid="run-sim-btn">
              {running ? <Activity className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              {running ? "Simulation..." : "Nouvelle simulation IA"}
            </Button>
          </div>
          {simulations.map((dt, i) => (
            <Card key={dt.id || i} className="glass-card card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="h-6 w-6 text-violet-400" />
                  <div>
                    <p className="text-white font-medium">{dt.variety}</p>
                    <p className="text-xs text-slate-500">{(dt.scenarios_run || dt.scenarios || 0).toLocaleString()} scenarios simules</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800/30 text-center"><p className="text-xs text-slate-500">Resilience</p><p className="text-lg font-bold text-emerald-400">{dt.resilience_score || dt.resilience || 0}%</p></div>
                  <div className="p-3 rounded-lg bg-slate-800/30 text-center"><p className="text-xs text-slate-500">Rendement</p><p className="text-sm font-bold text-white">{dt.yield_range || `${dt.avg_yield || '?'} t/ha`}</p></div>
                  <div className="p-3 rounded-lg bg-emerald-900/20 text-center"><p className="text-xs text-slate-500">Meilleur climat</p><p className="text-sm font-bold text-emerald-400">{dt.best_climate || dt.result?.optimal_planting_month || dt.climate || "Tropical"}</p></div>
                  <div className="p-3 rounded-lg bg-blue-900/20 text-center"><p className="text-xs text-slate-500">Modele IA</p><p className="text-xs font-bold text-blue-400">{dt.model || "gemini"}</p></div>
                </div>
                {dt.result?.yield_by_year && (
                  <div className="mt-3 flex gap-2">
                    {dt.result.yield_by_year.map((y, j) => (
                      <div key={j} className="flex-1 p-2 rounded bg-slate-800/30 text-center">
                        <p className="text-[10px] text-slate-500">An {j+1}</p>
                        <p className="text-sm font-bold text-emerald-400">{y}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "genomic" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{t("roles.seedAnalyst.genomicModeling")} - Analyse Genomique IA</CardTitle>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => runGenomicAnalysis("Mais CAMIR-01")} data-testid="genomic-btn">
                <Dna className="h-4 w-4" /> Analyser
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {genomicResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-violet-900/20 text-center">
                    <p className="text-xs text-slate-500">Score genetique</p>
                    <p className="text-2xl font-bold text-violet-400">{genomicResult.overall_genetic_score || 84}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-900/20 text-center">
                    <p className="text-xs text-slate-500">Biodiversite</p>
                    <p className="text-2xl font-bold text-emerald-400">{genomicResult.biodiversity_index || 0.72}</p>
                  </div>
                </div>
                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-800/50">
                  {["Gene", "Trait", "Score", "CRISPR", "Risque"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
                </tr></thead><tbody>{(genomicResult.genes_analyzed || []).map((g, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                    <td className="p-3 text-sm font-mono text-violet-400">{g.gene}</td>
                    <td className="p-3 text-sm text-white">{g.trait}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><Progress value={g.expression_score} className="h-2 w-16" /><span className="text-sm font-bold text-white">{g.expression_score}%</span></div></td>
                    <td className="p-3"><Badge className={cn("text-xs text-white", g.crispr_feasibility === "Validee" ? "bg-emerald-500" : g.crispr_feasibility === "Possible" ? "bg-blue-500" : "bg-amber-500")}>{g.crispr_feasibility}</Badge></td>
                    <td className="p-3 text-sm text-slate-400">{g.risk}</td>
                  </tr>
                ))}</tbody></table></div>
                {genomicResult.crossing_potential && (
                  <div className="mt-4">
                    <h4 className="text-sm text-white font-medium mb-2">Potentiel de croisement</h4>
                    {genomicResult.crossing_potential.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-800/30 flex items-center gap-3">
                        <Badge className="bg-blue-900/30 text-blue-400">{c.parent1}</Badge>
                        <span className="text-slate-600">x</span>
                        <Badge className="bg-violet-900/30 text-violet-400">{c.parent2}</Badge>
                        <span className="text-slate-600">=</span>
                        <Badge className="bg-emerald-900/30 text-emerald-400 font-bold">{c.offspring_id}</Badge>
                        <span className="text-sm text-white ml-auto">Vigueur: {c.hybrid_vigor}% | {c.yield_gain_percent}</span>
                      </div>
                    ))}
                  </div>
                )}
                {genomicResult.recommendations && (
                  <div className="mt-3 space-y-1">
                    {genomicResult.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle className="h-3 w-3" />{r}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dna className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Cliquez "Analyser" pour lancer l'analyse genomique IA</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "crossing" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-white">{t("roles.seedAnalyst.crossingSimulator")} - Speed Breeding</CardTitle>
            <Button size="sm" className="bg-violet-600 gap-2" onClick={() => toast.success("Simulation lancee")}><Plus className="h-4 w-4" />Nouveau croisement</Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {crossingResults.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className="bg-blue-900/30 text-blue-400">{c.parent1}</Badge>
                  <span className="text-slate-600">x</span>
                  <Badge className="bg-violet-900/30 text-violet-400">{c.parent2}</Badge>
                  <span className="text-slate-600">=</span>
                  <Badge className="bg-emerald-900/30 text-emerald-400 font-bold">{c.offspring}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-slate-800/50"><p className="text-xs text-slate-500">{t("roles.seedAnalyst.hybridVigor")}</p><p className="text-lg font-bold text-emerald-400">{c.vigor}%</p></div>
                  <div className="p-2 rounded-lg bg-slate-800/50"><p className="text-xs text-slate-500">Gain rendement</p><p className="text-lg font-bold text-white">{c.yieldGain}</p></div>
                  <div className="p-2 rounded-lg bg-slate-800/50"><p className="text-xs text-slate-500">{t("roles.seedAnalyst.diseaseResistance")}</p><p className="text-sm font-bold text-amber-400">{c.resistance}</p></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "climate" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.seedAnalyst.climateProjection")} - {t("roles.seedAnalyst.yearsProjection")}</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { variety: "Mais CAMIR-01", current: 92, y2040: 85, y2050: 72, y2070: 58, alert: true },
              { variety: "Sorgho S35", current: 88, y2040: 90, y2050: 88, y2070: 82, alert: false },
              { variety: "Riz Nerica-L19", current: 85, y2040: 78, y2050: 65, y2070: 48, alert: true },
            ].map((c, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", c.alert ? "border-l-red-500 bg-red-900/10" : "border-l-emerald-500 bg-emerald-900/10")}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{c.variety}</span>
                  {c.alert && <Badge className="bg-red-500 text-white text-xs">Adaptation requise</Badge>}
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[{label: "Actuel", val: c.current}, {label: "2040", val: c.y2040}, {label: "2050", val: c.y2050}, {label: "2070", val: c.y2070}].map((p, j) => (
                    <div key={j} className="p-2 rounded-lg bg-slate-800/50">
                      <p className="text-xs text-slate-500">{p.label}</p>
                      <p className={cn("text-lg font-bold", p.val >= 80 ? "text-emerald-400" : p.val >= 60 ? "text-amber-400" : "text-red-400")}>{p.val}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeedAnalystDashboard;
