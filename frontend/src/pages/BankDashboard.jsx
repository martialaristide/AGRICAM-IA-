import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../App";
import {
  Banknote, TrendingUp, ShieldCheck, AlertTriangle, Users,
  BarChart3, Calculator, Umbrella, MapPin, Clock,
  CheckCircle, XCircle, FileText, Activity, Target,
  Zap, ArrowRight, DollarSign, Leaf, Droplets
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";
import { toast } from "sonner";

const BankDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loanSim, setLoanSim] = useState({ amount: 500000, rate: 8.5, months: 12 });
  const [agriScores, setAgriScores] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [computingScore, setComputingScore] = useState(false);
  const [insuranceSim, setInsuranceSim] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansRes, scoresRes, risksRes] = await Promise.all([
          api.get("/financial/loans").catch(() => ({ data: [] })),
          api.get("/agriscore/scores").catch(() => ({ data: [] })),
          api.get("/agriscore/risk-zones").catch(() => ({ data: [] })),
        ]);
        setLoans(loansRes.data);
        setAgriScores(scoresRes.data || []);
        setRiskZones(risksRes.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const monthlyPayment = () => {
    const r = loanSim.rate / 100 / 12;
    const n = loanSim.months;
    const p = loanSim.amount;
    if (r === 0) return Math.round(p / n);
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const totalCost = () => monthlyPayment() * loanSim.months;

  const computeNewScore = async () => {
    setComputingScore(true);
    try {
      const res = await api.post("/agriscore/compute", {
        farmer_name: "Nouveau agriculteur",
        region: "Centre",
        crop_type: "Mais",
        area_ha: 10,
        years_experience: 5,
        previous_yield: 3.8,
        loan_amount: loanSim.amount,
        loan_duration_months: loanSim.months
      });
      if (res.data.agriscore) {
        setAgriScores(prev => [res.data.agriscore, ...prev]);
        toast.success("AgriScore calcule avec succes !");
      }
    } catch { toast.error("Erreur calcul AgriScore"); }
    finally { setComputingScore(false); }
  };

  const simulateInsurance = async () => {
    try {
      const res = await api.post("/agriscore/insurance-simulate", {
        farmer_name: "Simulation",
        crop_type: "Mais",
        loan_amount: loanSim.amount,
        loan_duration_months: loanSim.months,
        previous_yield: 3.5
      });
      setInsuranceSim(res.data);
      toast.success("Simulation assurance generee !");
    } catch { toast.error("Erreur simulation"); }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="bank-dashboard">
      <div className="gradient-dashboard rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center ring-1 ring-violet-500/30">
            <Banknote className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">{t("roles.bank.title")}</h1>
            <p className="text-slate-400">{t("roles.bank.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: t("pages.dashboard.overview"), icon: BarChart3 },
          { id: "agriscore", label: t("roles.bank.agriScore"), icon: ShieldCheck },
          { id: "simulator", label: t("roles.bank.loanSimulator"), icon: Calculator },
          { id: "risk", label: t("roles.bank.riskManagement"), icon: AlertTriangle },
          { id: "insurance", label: t("roles.bank.parametricInsurance"), icon: Umbrella },
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
              { label: "Portefeuille total", value: "189M XAF", icon: Banknote, color: "violet" },
              { label: "Prets actifs", value: loans.length || 12, icon: FileText, color: "emerald" },
              { label: "Taux defaut", value: "2.3%", icon: AlertTriangle, color: "amber" },
              { label: "Score moyen", value: "78/100", icon: ShieldCheck, color: "blue" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-slate-500">{s.label}</p><p className="text-2xl font-bold text-white mt-1">{s.value}</p></div>
                  <s.icon className={`h-8 w-8 text-${s.color}-400`} />
                </div>
              </CardContent></Card>
            ))}
          </div>
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Prets recents</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {(loans.length > 0 ? loans.slice(0, 5) : [
                { farmer_name: "Jean Dupont", amount: 500000, status: "approved", purpose: "Engrais saison" },
                { farmer_name: "Marie Nkolo", amount: 1200000, status: "pending", purpose: "Equipement irrigation" },
                { farmer_name: "Paul Tagne", amount: 350000, status: "rejected", purpose: "Semences" },
              ]).map((l, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                  <div>
                    <p className="text-sm text-white">{l.farmer_name || "Agriculteur"} - {(l.amount || 0).toLocaleString()} XAF</p>
                    <p className="text-xs text-slate-500">{l.purpose || "Pret agricole"}</p>
                  </div>
                  <Badge className={cn("text-white text-xs", l.status === "approved" ? "bg-emerald-500" : l.status === "pending" ? "bg-amber-500" : "bg-red-500")}>{l.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "agriscore" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">{t("roles.bank.agriScore")} - {t("roles.bank.creditScore")} Dynamique</CardTitle>
              <Button size="sm" onClick={computeNewScore} disabled={computingScore} className="bg-emerald-600 hover:bg-emerald-700 text-xs" data-testid="compute-score-btn">
                {computingScore ? <Activity className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                {computingScore ? "Calcul IA..." : "Calculer AgriScore"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-800/50">
                  {["Agriculteur", "AgriScore", "Risque", "Pret max", "Taux", "Region", "Tendance"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>{agriScores.map((a, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                    <td className="p-3 text-sm text-white font-medium">{a.farmer_name || a.farmer}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><Progress value={a.score} className="h-2 w-16" /><span className={cn("text-sm font-bold", a.score >= 80 ? "text-emerald-400" : a.score >= 60 ? "text-amber-400" : "text-red-400")}>{a.score}</span></div></td>
                    <td className="p-3"><Badge className={cn("text-xs text-white", a.risk_level === "low" ? "bg-emerald-500" : a.risk_level === "medium" ? "bg-amber-500" : "bg-red-500")}>{a.risk_level}</Badge></td>
                    <td className="p-3 text-sm text-white">{(a.max_loan || a.max_loan_recommended || 0).toLocaleString()} XAF</td>
                    <td className="p-3 text-sm text-emerald-400">{a.rate_suggestion || a.interest_rate_suggestion || 8}%</td>
                    <td className="p-3 text-sm text-slate-400">{a.region || "-"}</td>
                    <td className="p-3"><TrendingUp className={cn("h-4 w-4", a.score >= 70 ? "text-emerald-400" : "text-red-400 rotate-180")} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "simulator" && (
        <Card className="glass-card max-w-lg mx-auto">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><Calculator className="h-5 w-5 text-violet-400" />{t("roles.bank.loanSimulator")}</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="text-slate-400">{t("roles.bank.loanAmount")}: {loanSim.amount.toLocaleString()} XAF</Label>
              <Slider value={[loanSim.amount]} min={100000} max={10000000} step={50000} onValueChange={v => setLoanSim({...loanSim, amount: v[0]})} className="mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">{t("roles.bank.interestRate")}: {loanSim.rate}%</Label>
              <Slider value={[loanSim.rate]} min={3} max={25} step={0.5} onValueChange={v => setLoanSim({...loanSim, rate: v[0]})} className="mt-2" />
            </div>
            <div>
              <Label className="text-slate-400">{t("roles.bank.duration")}: {loanSim.months} mois</Label>
              <Slider value={[loanSim.months]} min={3} max={60} step={3} onValueChange={v => setLoanSim({...loanSim, months: v[0]})} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
              <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30 text-center">
                <p className="text-xs text-slate-500">{t("roles.bank.monthlyPayment")}</p>
                <p className="text-2xl font-bold text-emerald-400">{monthlyPayment().toLocaleString()}</p>
                <p className="text-xs text-slate-500">XAF/mois</p>
              </div>
              <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-800/30 text-center">
                <p className="text-xs text-slate-500">{t("roles.bank.totalCost")}</p>
                <p className="text-2xl font-bold text-violet-400">{totalCost().toLocaleString()}</p>
                <p className="text-xs text-slate-500">XAF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "risk" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.bank.portfolioExposure")} - {t("roles.bank.zoneRisk")}</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            {riskZones.map((z, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", z.risk_level === "high" ? "border-l-red-500 bg-red-900/10" : z.risk_level === "medium" ? "border-l-amber-500 bg-amber-900/10" : "border-l-emerald-500 bg-emerald-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /><span className="text-white font-medium">{z.zone}</span></div>
                  <Badge className={cn("text-white text-xs", z.risk_level === "high" ? "bg-red-500" : z.risk_level === "medium" ? "bg-amber-500" : "bg-emerald-500")}>{z.risk_type}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Exposition: {z.exposure_percent}% ({z.farmers_count} agriculteurs)</span>
                  <span className="text-white font-bold">{(z.total_exposure_xaf / 1000000).toFixed(0)}M XAF</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Taux defaut: {z.default_rate}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "insurance" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><Umbrella className="h-5 w-5 text-cyan-400" />{t("roles.bank.parametricInsurance")}</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <Umbrella className="h-12 w-12 mx-auto text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Assurance parametrique automatique</h3>
              <p className="text-sm text-slate-400 mb-4">Indemnisation automatique basee sur les donnees satellites.</p>
              <Button onClick={simulateInsurance} className="bg-cyan-600 hover:bg-cyan-500 gap-2" data-testid="simulate-insurance-btn">
                <ShieldCheck className="h-4 w-4" />Simuler assurance parametrique
              </Button>
            </div>
            {insuranceSim && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-cyan-900/20 border border-cyan-800/30 text-center">
                    <p className="text-xs text-slate-500">Prime annuelle</p>
                    <p className="text-xl font-bold text-cyan-400">{insuranceSim.premium_annual?.toLocaleString()} XAF</p>
                    <p className="text-xs text-slate-500">{insuranceSim.premium_rate_percent}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-800/30 text-center">
                    <p className="text-xs text-slate-500">Couverture</p>
                    <p className="text-xl font-bold text-violet-400">{insuranceSim.coverage_amount?.toLocaleString()} XAF</p>
                    <p className="text-xs text-slate-500">{insuranceSim.coverage_percent}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30 text-center">
                    <p className="text-xs text-slate-500">Culture</p>
                    <p className="text-xl font-bold text-emerald-400">{insuranceSim.crop}</p>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-white">Scenarios de sinistres</h4>
                {insuranceSim.scenarios?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <span className="text-sm text-white">{s.scenario}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">Prob: {s.probability_percent}%</span>
                      <span className="text-sm font-medium text-emerald-400">{s.payout_amount?.toLocaleString()} XAF</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankDashboard;
