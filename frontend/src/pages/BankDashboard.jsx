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

  useEffect(() => {
    const fetchLoans = async () => {
      try { const res = await api.get("/financial/loans"); setLoans(res.data); } catch {}
      finally { setLoading(false); }
    };
    fetchLoans();
  }, []);

  const monthlyPayment = () => {
    const r = loanSim.rate / 100 / 12;
    const n = loanSim.months;
    const p = loanSim.amount;
    if (r === 0) return Math.round(p / n);
    return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const totalCost = () => monthlyPayment() * loanSim.months;

  const agriScores = [
    { farmer: "Jean Dupont", score: 87, yield: "4.2 t/ha", sustainability: 92, sales: 78, climate: "Faible", trend: "up" },
    { farmer: "Marie Nkolo", score: 74, yield: "3.1 t/ha", sustainability: 68, sales: 85, climate: "Moyen", trend: "up" },
    { farmer: "Paul Tagne", score: 61, yield: "2.8 t/ha", sustainability: 55, sales: 62, climate: "Eleve", trend: "down" },
    { farmer: "Awa Sow", score: 93, yield: "5.1 t/ha", sustainability: 95, sales: 91, climate: "Faible", trend: "up" },
  ];

  const riskZones = [
    { zone: "Extreme-Nord", exposure: "15%", risk: "Secheresse severe", level: "critical", amount: "45M XAF" },
    { zone: "Sud-Ouest", exposure: "8%", risk: "Inondation moderee", level: "warning", amount: "24M XAF" },
    { zone: "Centre", exposure: "22%", risk: "Normal", level: "safe", amount: "66M XAF" },
    { zone: "Ouest", exposure: "18%", risk: "Faible", level: "safe", amount: "54M XAF" },
  ];

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
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.bank.agriScore")} - {t("roles.bank.creditScore")} Dynamique</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-800/50">
                  {["Agriculteur", "AgriScore", t("roles.bank.yieldHistory"), t("roles.bank.sustainability"), t("roles.bank.salesRegularity"), t("roles.bank.climateRisk"), "Tendance"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>{agriScores.map((a, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                    <td className="p-3 text-sm text-white font-medium">{a.farmer}</td>
                    <td className="p-3"><div className="flex items-center gap-2"><Progress value={a.score} className="h-2 w-16" /><span className={cn("text-sm font-bold", a.score >= 80 ? "text-emerald-400" : a.score >= 60 ? "text-amber-400" : "text-red-400")}>{a.score}</span></div></td>
                    <td className="p-3 text-sm text-slate-400">{a.yield}</td>
                    <td className="p-3"><span className={`text-sm font-bold text-${a.sustainability >= 80 ? "emerald" : a.sustainability >= 60 ? "amber" : "red"}-400`}>{a.sustainability}%</span></td>
                    <td className="p-3 text-sm text-white">{a.sales}%</td>
                    <td className="p-3"><Badge className={cn("text-xs text-white", a.climate === "Faible" ? "bg-emerald-500" : a.climate === "Moyen" ? "bg-amber-500" : "bg-red-500")}>{a.climate}</Badge></td>
                    <td className="p-3"><TrendingUp className={cn("h-4 w-4", a.trend === "up" ? "text-emerald-400" : "text-red-400 rotate-180")} /></td>
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
              <div key={i} className={cn("p-4 rounded-xl border-l-4", z.level === "critical" ? "border-l-red-500 bg-red-900/10" : z.level === "warning" ? "border-l-amber-500 bg-amber-900/10" : "border-l-emerald-500 bg-emerald-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /><span className="text-white font-medium">{z.zone}</span></div>
                  <Badge className={cn("text-white text-xs", z.level === "critical" ? "bg-red-500" : z.level === "warning" ? "bg-amber-500" : "bg-emerald-500")}>{z.risk}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Exposition: {z.exposure} du portefeuille</span>
                  <span className="text-white font-bold">{z.amount}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "insurance" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><Umbrella className="h-5 w-5 text-cyan-400" />{t("roles.bank.parametricInsurance")}</CardTitle></CardHeader>
          <CardContent className="p-6 text-center">
            <Umbrella className="h-16 w-16 mx-auto text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Assurance declenchement automatique</h3>
            <p className="text-sm text-slate-400 mb-6">Indemnisation automatique basee sur les donnees satellites. Aucun dossier a remplir.</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: t("roles.bank.droughtAlert"), threshold: "Precipitations < 40mm/mois", color: "amber" },
                { label: t("roles.bank.floodAlert"), threshold: "Precipitations > 200mm/j", color: "blue" },
                { label: "Gel", threshold: "Temperature < 2C", color: "cyan" },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                  <p className={`text-sm font-medium text-${p.color}-400`}>{p.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.threshold}</p>
                </div>
              ))}
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-500 gap-2"><ShieldCheck className="h-4 w-4" />Configurer les seuils</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankDashboard;
