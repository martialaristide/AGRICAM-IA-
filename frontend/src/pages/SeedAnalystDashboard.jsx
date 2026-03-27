import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Dna, FlaskConical, Thermometer, Upload, Download, Plus, Eye,
  Microscope, BarChart3, Leaf, ShieldCheck, Droplets, Bug,
  FileText, Loader2, Check, X, Clock, Beaker, Shuffle,
  CloudRain, ChevronRight, Zap, Target, TrendingUp, AlertTriangle
} from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const STATUS_MAP = {
  certified: { label: "Certifie", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Check },
  testing: { label: "En test", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Beaker },
  pending: { label: "En attente", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  rejected: { label: "Rejete", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: X },
};

const ScoreBar = ({ label, value, max = 100, color = "emerald" }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold text-${color}-400`}>{value}%</span>
    </div>
    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full bg-${color}-500 rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const ConfidenceBadge = ({ value }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border" style={{
    background: value >= 85 ? 'rgba(16,185,129,0.15)' : value >= 70 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
    color: value >= 85 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444',
    borderColor: value >= 85 ? 'rgba(16,185,129,0.3)' : value >= 70 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
  }}>
    <Target className="h-3 w-3" /> Confiance: {value}%
  </div>
);

export default function SeedAnalystDashboard() {
  const [batches, setBatches] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState({});
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({ variety: "", origin: "", quantity_kg: 0, germination: 0, purity: 0, moisture: 0 });
  const [genomicResult, setGenomicResult] = useState(null);
  const [crossingResult, setCrossingResult] = useState(null);
  const [climateResult, setClimateResult] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [crossingForm, setCrossingForm] = useState({ parent1: "Mais CAMIR-01", parent2: "Riz Nerica-L19", target_traits: ["yield", "disease_resistance"], generations: 3 });
  const [climateForm, setClimateForm] = useState({ variety: "Mais CAMIR-01", region: "Centre Cameroun", scenario: "RCP4.5" });
  const [genomicForm, setGenomicForm] = useState({ variety: "Mais CAMIR-01", target_trait: "yield" });

  const fetchData = useCallback(async () => {
    try {
      const [b, s] = await Promise.all([api.get("/digital-twin/seed-batches"), api.get("/digital-twin/simulations")]);
      setBatches(b.data); setSimulations(s.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setL = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  const createBatch = async () => {
    setL("batch", true);
    try {
      const res = await api.post("/digital-twin/seed-batches", newBatch);
      if (res.data.success) { toast.success("Lot cree avec succes"); setBatches(p => [res.data.batch, ...p]); setShowNewBatch(false); setNewBatch({ variety: "", origin: "", quantity_kg: 0, germination: 0, purity: 0, moisture: 0 }); }
    } catch (e) { toast.error("Erreur creation lot"); }
    setL("batch", false);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/digital-twin/seed-batches/${id}/status?status=${status}`);
      setBatches(p => p.map(b => b.id === id ? { ...b, status } : b));
      toast.success("Statut mis a jour");
    } catch (e) { toast.error("Erreur"); }
  };

  const runGenomic = async () => {
    setL("genomic", true);
    try {
      const res = await api.post("/digital-twin/genomic-analysis", genomicForm);
      if (res.data.success) { setGenomicResult(res.data.analysis); toast.success("Analyse genomique terminee"); }
    } catch (e) { toast.error("Erreur analyse"); }
    setL("genomic", false);
  };

  const runCrossing = async () => {
    setL("crossing", true);
    try {
      const res = await api.post("/digital-twin/crossing-simulation", crossingForm);
      if (res.data.success) { setCrossingResult(res.data.crossing.result); toast.success("Simulation terminee"); }
    } catch (e) { toast.error("Erreur simulation"); }
    setL("crossing", false);
  };

  const runClimate = async () => {
    setL("climate", true);
    try {
      const res = await api.post("/digital-twin/climate-adaptation", climateForm);
      if (res.data.success) { setClimateResult(res.data.adaptation); toast.success("Evaluation climatique terminee"); }
    } catch (e) { toast.error("Erreur evaluation"); }
    setL("climate", false);
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData();
    fd.append("file", file); fd.append("data_type", type);
    if (selectedBatch) fd.append("batch_id", selectedBatch.id);
    try {
      await api.post("/digital-twin/upload-seed-data", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`${type} uploade avec succes`);
    } catch (e) { toast.error("Erreur upload"); }
  };

  const exportReport = async (fmt) => {
    try {
      const res = await api.get(`/digital-twin/export/${fmt}?variety=${climateForm.variety || "Mais CAMIR-01"}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = `rapport_semence.${fmt}`; a.click(); URL.revokeObjectURL(url);
      toast.success(`Export ${fmt.toUpperCase()} telecharge`);
    } catch (e) { toast.error("Erreur export"); }
  };

  const filtered = statusFilter === "all" ? batches : batches.filter(b => b.status === statusFilter);

  return (
    <div className="space-y-6" data-testid="seed-analyst-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl"><Dna className="h-6 w-6 text-purple-400" /></div>
            Analyse Avancee des Semences
          </h1>
          <p className="text-slate-400 mt-1">Jumeaux numeriques, modelisation genomique et simulation de croisement</p>
        </div>
        <div className="flex gap-2">
          {["csv", "json"].map(f => (
            <Button key={f} variant="outline" size="sm" onClick={() => exportReport(f)} className="border-slate-700 text-slate-300 hover:text-white">
              <Download className="h-4 w-4 mr-1" /> {f.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="lots" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="lots" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><FlaskConical className="h-4 w-4 mr-1.5" /> Lots</TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Upload className="h-4 w-4 mr-1.5" /> Upload</TabsTrigger>
          <TabsTrigger value="twin" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Microscope className="h-4 w-4 mr-1.5" /> Jumeaux Numeriques</TabsTrigger>
          <TabsTrigger value="genomic" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Dna className="h-4 w-4 mr-1.5" /> Genomique</TabsTrigger>
          <TabsTrigger value="crossing" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Shuffle className="h-4 w-4 mr-1.5" /> Croisement</TabsTrigger>
          <TabsTrigger value="climate" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"><CloudRain className="h-4 w-4 mr-1.5" /> Climat</TabsTrigger>
        </TabsList>

        {/* LOTS TAB */}
        <TabsContent value="lots" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {["all", "certified", "testing", "pending", "rejected"].map(s => (
                <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className={statusFilter === s ? "bg-purple-600 text-white" : "border-slate-700 text-slate-300"}>
                  {s === "all" ? "Tous" : STATUS_MAP[s]?.label} ({s === "all" ? batches.length : batches.filter(b => b.status === s).length})
                </Button>
              ))}
            </div>
            <Button onClick={() => setShowNewBatch(!showNewBatch)} className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-1" /> Nouveau Lot</Button>
          </div>

          {showNewBatch && (
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-white">Definir un nouveau lot</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input placeholder="Variete *" value={newBatch.variety} onChange={e => setNewBatch(p => ({ ...p, variety: e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
                <Input placeholder="Origine *" value={newBatch.origin} onChange={e => setNewBatch(p => ({ ...p, origin: e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
                <Input type="number" placeholder="Quantite (kg)" value={newBatch.quantity_kg || ""} onChange={e => setNewBatch(p => ({ ...p, quantity_kg: +e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
                <Input type="number" placeholder="Germination %" value={newBatch.germination || ""} onChange={e => setNewBatch(p => ({ ...p, germination: +e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
                <Input type="number" placeholder="Purete %" value={newBatch.purity || ""} onChange={e => setNewBatch(p => ({ ...p, purity: +e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
                <Input type="number" placeholder="Humidite %" value={newBatch.moisture || ""} onChange={e => setNewBatch(p => ({ ...p, moisture: +e.target.value }))} className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="flex gap-2">
                <Button onClick={createBatch} disabled={loading.batch || !newBatch.variety} className="bg-purple-600">
                  {loading.batch ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />} Creer le lot
                </Button>
                <Button variant="outline" onClick={() => setShowNewBatch(false)} className="border-slate-700 text-slate-300">Annuler</Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {filtered.map(batch => {
              const st = STATUS_MAP[batch.status] || STATUS_MAP.pending;
              const StIcon = st.icon;
              return (
                <div key={batch.id} className={`bg-slate-800/50 border rounded-xl p-5 transition-all hover:border-purple-500/50 cursor-pointer ${selectedBatch?.id === batch.id ? 'border-purple-500' : 'border-slate-700'}`}
                  onClick={() => setSelectedBatch(batch)} data-testid={`batch-${batch.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{batch.variety}</h3>
                        <p className="text-sm text-slate-400">{batch.id} - {batch.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${st.color} border`}><StIcon className="h-3 w-3 mr-1" />{st.label}</Badge>
                      <span className="text-sm text-slate-400">{batch.quantity_kg} kg</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <ScoreBar label="Germination" value={batch.germination} color="emerald" />
                    <ScoreBar label="Purete" value={batch.purity} color="blue" />
                    <ScoreBar label="Humidite" value={Math.min(100, batch.moisture * 5)} color="cyan" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {["certified", "testing", "pending", "rejected"].filter(s => s !== batch.status).map(s => (
                      <Button key={s} size="sm" variant="outline" className="border-slate-600 text-xs text-slate-300"
                        onClick={(e) => { e.stopPropagation(); updateStatus(batch.id, s); }}>
                        {STATUS_MAP[s].label}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* UPLOAD TAB */}
        <TabsContent value="upload" className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Upload className="h-5 w-5 text-purple-400" /> Upload de Donnees</h3>
            {selectedBatch && <p className="text-sm text-purple-400 mb-4">Lot selectionne: {selectedBatch.variety} ({selectedBatch.id})</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "image", label: "Images de Semences", icon: Eye, accept: "image/*", desc: "Photos macro/micro de graines" },
                { type: "genome", label: "Donnees Genomiques", icon: Dna, accept: ".csv,.txt,.fasta,.vcf", desc: "Fichiers FASTA, VCF, CSV" },
                { type: "growth", label: "Indices de Croissance", icon: TrendingUp, accept: ".csv,.xlsx,.json", desc: "Hauteur, biomasse, LAI" },
                { type: "climate", label: "Donnees Climatiques", icon: CloudRain, accept: ".csv,.json,.xlsx", desc: "Temperature, pluviometrie" },
                { type: "soil", label: "Analyses de Sol", icon: Droplets, accept: ".csv,.pdf,.json", desc: "NPK, pH, matiere organique" },
                { type: "phyto", label: "Etat Phytosanitaire", icon: Bug, accept: "image/*,.csv,.pdf", desc: "Maladies, ravageurs observes" },
              ].map(({ type, label, icon: Icon, accept, desc }) => (
                <label key={type} className="group relative border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-purple-500 transition-all cursor-pointer">
                  <input type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0], type)} />
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">{label}</h4>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* DIGITAL TWIN TAB */}
        <TabsContent value="twin" className="space-y-4">
          {selectedBatch ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Microscope className="text-purple-400" /> Jumeau Numerique</h3>
                    <p className="text-purple-300">{selectedBatch.variety} - {selectedBatch.id}</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-lg px-4 py-1">{selectedBatch.status.toUpperCase()}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Germination", value: `${selectedBatch.germination}%`, icon: Leaf, color: "emerald" },
                    { label: "Purete", value: `${selectedBatch.purity}%`, icon: ShieldCheck, color: "blue" },
                    { label: "Humidite", value: `${selectedBatch.moisture}%`, icon: Droplets, color: "cyan" },
                    { label: "Quantite", value: `${selectedBatch.quantity_kg} kg`, icon: FlaskConical, color: "amber" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                      <Icon className={`h-5 w-5 text-${color}-400 mb-2`} />
                      <p className="text-2xl font-bold text-white">{value}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <h4 className="font-bold text-white mb-3">Profil Genetique Estime</h4>
                    <div className="space-y-2">
                      <ScoreBar label="Rendement potentiel" value={Math.min(100, selectedBatch.germination + 5)} color="emerald" />
                      <ScoreBar label="Resistance maladies" value={Math.min(100, selectedBatch.purity - 5)} color="blue" />
                      <ScoreBar label="Tolerance secheresse" value={Math.round(selectedBatch.germination * 0.85)} color="amber" />
                      <ScoreBar label="Vigueur hybride" value={Math.round((selectedBatch.germination + selectedBatch.purity) / 2.2)} color="purple" />
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                    <h4 className="font-bold text-white mb-3">Metadonnees</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Origine", selectedBatch.origin],
                        ["Date d'entree", selectedBatch.date],
                        ["Statut actuel", STATUS_MAP[selectedBatch.status]?.label],
                        ["Cycle vegetatif estime", `${Math.round(90 + selectedBatch.moisture * 3)}j`],
                        ["Temperature optimale", `${Math.round(22 + selectedBatch.moisture * 0.3)}C`],
                        ["Pluviometrie recommandee", `${Math.round(800 + selectedBatch.germination * 5)}mm/an`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-400">{k}</span>
                          <span className="text-white font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <Microscope className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Selectionnez un lot dans l'onglet "Lots" pour voir son jumeau numerique</p>
            </div>
          )}
        </TabsContent>

        {/* GENOMIC TAB */}
        <TabsContent value="genomic" className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Dna className="h-5 w-5 text-purple-400" /> Modelisation Genomique</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select value={genomicForm.variety} onChange={e => setGenomicForm(p => ({ ...p, variety: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {["Mais CAMIR-01", "Riz Nerica-L19", "Sorgho S35", "Arachide RMP-12", "Haricot MAC-44", "Manioc TME-419", "Cacao GH-01"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={genomicForm.target_trait} onChange={e => setGenomicForm(p => ({ ...p, target_trait: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {[["yield", "Rendement"], ["disease_resistance", "Resistance maladies"], ["drought_tolerance", "Tolerance secheresse"], ["nutritional", "Valeur nutritive"], ["pest_resistance", "Resistance ravageurs"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Button onClick={runGenomic} disabled={loading.genomic} className="bg-purple-600 hover:bg-purple-700 h-10">
                {loading.genomic ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />} Analyser le Genome
              </Button>
            </div>
          </div>

          {genomicResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ConfidenceBadge value={genomicResult.confidence || genomicResult.overall_genetic_score} />
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">Score genetique: {genomicResult.overall_genetic_score}/100</Badge>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4">Genes Analyses</h4>
                <div className="space-y-3">
                  {(genomicResult.genes_analyzed || []).map((g, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center"><Dna className="h-5 w-5 text-purple-400" /></div>
                        <div><p className="font-bold text-white text-sm">{g.gene}</p><p className="text-xs text-slate-400">{g.trait}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{g.expression_score}%</p>
                          <p className="text-xs text-slate-400">Expression</p>
                        </div>
                        <Badge className={g.crispr_feasibility === "Validee" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}>{g.crispr_feasibility}</Badge>
                        <Badge className={g.risk === "Faible" || g.risk === "Tres faible" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>Risque: {g.risk}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {(genomicResult.recommendations || []).length > 0 && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-purple-300 mb-2">Recommandations</h4>
                  {genomicResult.recommendations.map((r, i) => (
                    <p key={i} className="text-sm text-slate-300 flex items-start gap-2"><ChevronRight className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />{r}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* CROSSING TAB */}
        <TabsContent value="crossing" className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Shuffle className="h-5 w-5 text-purple-400" /> Simulateur de Croisement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <select value={crossingForm.parent1} onChange={e => setCrossingForm(p => ({ ...p, parent1: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                <option value="">-- Parent 1 --</option>
                {["Mais CAMIR-01", "Riz Nerica-L19", "Sorgho S35", "Arachide RMP-12", "Haricot MAC-44", "Manioc TME-419", "Cacao GH-01", "Mais DT-STR", "Ble HD-2967"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={crossingForm.parent2} onChange={e => setCrossingForm(p => ({ ...p, parent2: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                <option value="">-- Parent 2 --</option>
                {["Mais DT-STR", "Riz WITA-4", "Sorgho Malisor", "Arachide ICG-7878", "Haricot CAL-96", "Manioc TMS-30572", "Cacao PA-150", "Mais CAMIR-01", "Mil Souna-3"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={crossingForm.generations} onChange={e => setCrossingForm(p => ({ ...p, generations: +e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Generations</option>)}
              </select>
              <Button onClick={runCrossing} disabled={loading.crossing} className="bg-purple-600 hover:bg-purple-700 h-10">
                {loading.crossing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Shuffle className="h-4 w-4 mr-1" />} Simuler le Croisement
              </Button>
            </div>
            <p className="text-xs text-slate-400">La simulation utilise l'IA pour predire les resultats du croisement sur plusieurs generations avec des donnees reelles de varietes africaines.</p>
          </div>

          {crossingResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ConfidenceBadge value={crossingResult.confidence} />
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Hybride: {crossingResult.offspring_id}</Badge>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4">Evolution par Generation</h4>
                <div className="grid gap-3">
                  {(crossingResult.generations || []).map((g, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-white">Generation F{g.gen}</h5>
                        <div className="flex gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400">Rendement: {g.yield_gain}</Badge>
                          <Badge className="bg-blue-500/20 text-blue-400">Vigueur: {g.vigor}%</Badge>
                          <Badge className="bg-amber-500/20 text-amber-400">Stabilite: {g.stability}%</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">{g.notes}</p>
                      <div className="mt-2"><Progress value={g.vigor} className="h-2" /></div>
                    </div>
                  ))}
                </div>
              </div>

              {crossingResult.final_variety && (
                <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/30 rounded-xl p-6">
                  <h4 className="font-bold text-white text-lg mb-4">Variete Finale: {crossingResult.final_variety.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {[
                      ["Rendement", `${crossingResult.final_variety.yield_t_ha} t/ha`],
                      ["Res. Maladies", `${crossingResult.final_variety.disease_resistance}%`],
                      ["Tol. Secheresse", `${crossingResult.final_variety.drought_tolerance}%`],
                      ["Maturite", `${crossingResult.final_variety.maturity_days}j`],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-emerald-400">{v}</p>
                        <p className="text-xs text-slate-400">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-bold text-emerald-300 mb-2">Avantages</h5>
                      {(crossingResult.final_variety.advantages || []).map((a, i) => (
                        <p key={i} className="text-sm text-slate-300 flex items-start gap-2"><Check className="h-4 w-4 text-emerald-400 shrink-0" />{a}</p>
                      ))}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-amber-300 mb-2">Risques</h5>
                      {(crossingResult.final_variety.risks || []).map((r, i) => (
                        <p key={i} className="text-sm text-slate-300 flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />{r}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {crossingResult.crossing_protocol && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-purple-300 mb-3">Protocole de Croisement Guide</h4>
                  {crossingResult.crossing_protocol.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 mb-2">
                      <div className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center text-xs text-purple-300 font-bold shrink-0">{i + 1}</div>
                      <p className="text-sm text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* CLIMATE TAB */}
        <TabsContent value="climate" className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CloudRain className="h-5 w-5 text-purple-400" /> Adaptation Climatique</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select value={climateForm.variety} onChange={e => setClimateForm(p => ({ ...p, variety: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {["Mais CAMIR-01", "Riz Nerica-L19", "Sorgho S35", "Arachide RMP-12", "Haricot MAC-44", "Manioc TME-419", "Cacao GH-01"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={climateForm.region} onChange={e => setClimateForm(p => ({ ...p, region: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {["Centre Cameroun", "Ouest Cameroun", "Littoral Cameroun", "Nord Cameroun", "Extreme-Nord", "Adamaoua", "Est Cameroun", "Sud Cameroun", "Nord-Ouest", "Sud-Ouest"].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select value={climateForm.scenario} onChange={e => setClimateForm(p => ({ ...p, scenario: e.target.value }))} className="h-10 px-3 border rounded-md bg-slate-900 border-slate-700 text-white">
                {[["RCP2.6", "RCP2.6 (Optimiste)"], ["RCP4.5", "RCP4.5 (Modere)"], ["RCP6.0", "RCP6.0 (Intermediaire)"], ["RCP8.5", "RCP8.5 (Pessimiste)"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <Button onClick={runClimate} disabled={loading.climate} className="bg-purple-600 hover:bg-purple-700 h-10">
                {loading.climate ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Thermometer className="h-4 w-4 mr-1" />} Evaluer
              </Button>
            </div>
          </div>

          {climateResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <ConfidenceBadge value={climateResult.confidence} />
                <Badge className={`border ${climateResult.overall_risk === "Faible" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : climateResult.overall_risk === "Modere" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                  Risque global: {climateResult.overall_risk}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Score actuel: {climateResult.current_score}/100</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4">Indices de Stress</h4>
                  <div className="space-y-4">
                    <ScoreBar label="Stress Hydrique" value={climateResult.water_stress_index} color="blue" />
                    <ScoreBar label="Stress Thermique" value={climateResult.heat_stress_index} color="red" />
                    <ScoreBar label="Adaptation actuelle" value={climateResult.current_score} color="emerald" />
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4">Projections</h4>
                  <div className="space-y-3">
                    {(climateResult.projections || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <span className="text-white font-bold">{p.year}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${p.yield_change?.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>{p.yield_change}</span>
                          <div className="w-16"><Progress value={p.adaptation_score} className="h-2" /></div>
                          <span className="text-xs text-slate-400">{p.adaptation_score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {climateResult.recommended_adaptations && (
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-300 mb-3">Strategies d'Adaptation Recommandees</h4>
                  {climateResult.recommended_adaptations.map((a, i) => (
                    <p key={i} className="text-sm text-slate-300 flex items-start gap-2 mb-1"><Check className="h-4 w-4 text-emerald-400 shrink-0" />{a}</p>
                  ))}
                </div>
              )}

              {climateResult.alternative_varieties && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-3">Varietes Alternatives</h4>
                  <div className="grid gap-2">
                    {climateResult.alternative_varieties.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div>
                          <p className="font-bold text-white">{v.name}</p>
                          <p className="text-xs text-slate-400">{v.reason}</p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400">Score: {v.score}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-400 italic bg-slate-800/30 rounded-lg p-3 border border-slate-700">{climateResult.summary}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
