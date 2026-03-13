import React, { useEffect, useState } from "react";
import { getDashboardStats, getParcels, getAlerts } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Zap, Droplets, Thermometer, AlertTriangle, MapPin, TrendingUp,
  Clock, Leaf, Activity, BarChart3, ShieldCheck, QrCode,
  ShoppingCart, Sprout, Sun, Target, FileText, Download
} from "lucide-react";
import { cn } from "../lib/utils";
import WeatherWidget from "../components/WeatherWidget";

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, parcelsRes, alertsRes] = await Promise.all([getDashboardStats(), getParcels(), getAlerts(true)]);
        setStats(statsRes.data);
        setParcels(parcelsRes.data);
        setAlerts(alertsRes.data.slice(0, 3));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const yieldPredictions = [
    { crop: "Mais", area: "12 ha", predicted: "4.8 t/ha", confidence: 87, trend: "+12%", optimal: "Recolte dans 3 semaines" },
    { crop: "Riz paddy", area: "8 ha", predicted: "3.2 t/ha", confidence: 79, trend: "+5%", optimal: "Phase tallage" },
    { crop: "Cacao", area: "5 ha", predicted: "1.1 t/ha", confidence: 91, trend: "+8%", optimal: "Floraison active" },
  ];

  const pricePredictions = [
    { crop: "Mais", current: 250, predicted: 310, peakWeek: "Sem. 14", alert: true },
    { crop: "Riz", current: 420, predicted: 395, peakWeek: "Sem. 12", alert: false },
    { crop: "Cacao", current: 1850, predicted: 2100, peakWeek: "Sem. 16", alert: true },
  ];

  const blockchainActions = [
    { action: t("roles.farmer.sowing"), date: "2026-01-15", hash: "0x7a3f...e2b1", verified: true },
    { action: t("roles.farmer.fertilization"), date: "2026-02-01", hash: "0x9c2d...f4a8", verified: true },
    { action: t("roles.farmer.irrigation"), date: "2026-02-15", hash: "0xb1e5...3c7d", verified: true },
    { action: "Traitement phyto", date: "2026-03-01", hash: "0xd4f2...8e91", verified: true },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="space-y-6 animate-slide-in" data-testid="dashboard-page">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-dashboard rounded-2xl p-8">
          <h1 className="text-3xl font-bold font-[Manrope] text-white mb-2">
            {t("pages.dashboard.welcome")} <span className="text-emerald-400">IA</span>
          </h1>
          <p className="text-slate-400 text-lg">{t("roles.farmer.subtitle")}</p>
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400/80">
            <Zap className="h-4 w-4" />
            <span>{t("pages.dashboard.systemOperational")} - {stats?.active_sensors || 0} {t("pages.dashboard.activeSensors")}</span>
          </div>
        </div>
        <WeatherWidget lat={3.848} lon={11.5021} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: t("pages.dashboard.overview"), icon: BarChart3 },
          { id: "health", label: t("roles.farmer.cropHealth"), icon: Leaf },
          { id: "yield", label: t("roles.farmer.yieldPrediction"), icon: TrendingUp },
          { id: "price", label: t("roles.farmer.pricePrediction"), icon: Target },
          { id: "blockchain", label: t("roles.farmer.blockchainTrace"), icon: ShieldCheck },
        ].map(tab => (
          <Button key={tab.id} size="sm"
            className={cn("gap-2 whitespace-nowrap", activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700")}
            onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t("pages.dashboard.activeParcels"), value: stats?.parcels_count || 0, icon: MapPin, color: "emerald" },
              { label: t("pages.dashboard.avgHumidity"), value: `${stats?.average_humidity || 0}%`, icon: Droplets, color: "blue" },
              { label: t("pages.dashboard.avgTemperature"), value: `${stats?.average_temperature || 0}C`, icon: Thermometer, color: "orange" },
              { label: t("pages.dashboard.activeAlerts"), value: stats?.active_alerts || 0, icon: AlertTriangle, color: "red" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover" data-testid={`stat-${i}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs text-slate-500">{s.label}</p><p className="text-2xl font-bold text-white mt-1">{s.value}</p></div>
                    <s.icon className={`h-8 w-8 text-${s.color}-400`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">{t("pages.dashboard.parcelStatus")}</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-4">
                {parcels.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50 hover:border-emerald-500/20 transition-all" data-testid={`parcel-${p.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div><h4 className="font-semibold text-white">{p.name}</h4><p className="text-sm text-slate-500">{p.crop_type} - {p.area_hectares} ha</p></div>
                      <Badge className={cn("text-white", p.status === "excellent" ? "bg-emerald-500" : p.status === "bon" ? "bg-blue-500" : "bg-amber-500")}>{p.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1"><Droplets className="h-4 w-4 text-blue-400" />{p.humidity}%</div>
                      <div className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-orange-400" />{p.temperature}C</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">{t("pages.dashboard.recentAlerts")}</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-4">
                {alerts.length === 0 ? <p className="text-slate-500 text-center py-8">{t("common.loading")}</p> : alerts.map(a => (
                  <div key={a.id} className={cn("p-4 rounded-xl border-l-4", a.priority === "critique" ? "border-l-red-500 bg-red-900/10" : "border-l-amber-500 bg-amber-900/10")} data-testid={`alert-${a.id}`}>
                    <h4 className="font-semibold text-white mb-1">{a.title}</h4>
                    <p className="text-sm text-slate-400">{a.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-600"><Clock className="h-3 w-3" />{new Date(a.created_at).toLocaleString('fr-FR')}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "health" && (
        <div className="space-y-4">
          <Card className="glass-card neon-border-green">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.farmer.spectralAnalysis")} - {t("roles.farmer.earlyDetection")} J-15</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              {parcels.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 text-emerald-400" />
                      <div><p className="text-white font-medium">{p.name} - {p.crop_type}</p><p className="text-xs text-slate-500">{p.area_hectares} ha</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">NDVI: <span className="text-emerald-400 font-bold">0.{Math.floor(70 + Math.random() * 25)}</span></p>
                      <p className="text-xs text-slate-500">Score sante: {Math.floor(75 + Math.random() * 20)}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Stress hydrique", value: `${Math.floor(Math.random() * 20)}%`, color: "blue" },
                      { label: "Carences", value: `${Math.floor(Math.random() * 10)}%`, color: "amber" },
                      { label: "Maladies", value: `${Math.floor(Math.random() * 5)}%`, color: "red" },
                    ].map((m, j) => (
                      <div key={j} className="p-2 rounded-lg bg-slate-800/50"><p className="text-xs text-slate-500">{m.label}</p><p className={`text-sm font-bold text-${m.color}-400`}>{m.value}</p></div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
                    <p className="text-xs text-emerald-400">{t("roles.farmer.treatmentMap")}: Traitement localise a 70% zone Nord-Est</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "yield" && (
        <div className="space-y-4">
          {yieldPredictions.map((y, i) => (
            <Card key={i} className="glass-card card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-900/30 ring-1 ring-emerald-500/20 flex items-center justify-center">
                      <Sprout className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div><p className="text-white font-medium">{y.crop}</p><p className="text-xs text-slate-500">{y.area}</p></div>
                  </div>
                  <Badge className="bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/20">{y.trend}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-800/30"><p className="text-xs text-slate-500">{t("roles.farmer.estimatedYield")}</p><p className="text-xl font-bold text-white">{y.predicted}</p></div>
                  <div className="p-3 rounded-lg bg-slate-800/30"><p className="text-xs text-slate-500">Confiance</p><p className="text-xl font-bold text-emerald-400">{y.confidence}%</p></div>
                  <div className="p-3 rounded-lg bg-slate-800/30"><p className="text-xs text-slate-500">Statut</p><p className="text-sm font-medium text-amber-400">{y.optimal}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "price" && (
        <div className="space-y-4">
          <Card className="glass-card neon-border-green">
            <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.farmer.pricePrediction")} - XAF/kg</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-3">
              {pricePredictions.map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{p.crop}</span>
                    {p.alert && <Badge className="bg-amber-500 text-white text-xs">{t("roles.farmer.priceAlert")}</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-xs text-slate-500">Prix actuel</p><p className="text-lg font-bold text-white">{p.current}</p></div>
                    <div><p className="text-xs text-slate-500">{t("roles.farmer.optimalPrice")}</p><p className={cn("text-lg font-bold", p.predicted > p.current ? "text-emerald-400" : "text-red-400")}>{p.predicted}</p></div>
                    <div><p className="text-xs text-slate-500">Pic prevu</p><p className="text-lg font-bold text-amber-400">{p.peakWeek}</p></div>
                  </div>
                  {p.alert && <p className="text-xs text-emerald-400 mt-2">Le prix devrait atteindre son pic dans 2 semaines. Vendez a {p.peakWeek}.</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "blockchain" && (
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-400" />{t("roles.farmer.traceability")}</CardTitle>
                <Button size="sm" className="bg-emerald-600 gap-2"><QrCode className="h-4 w-4" />{t("roles.farmer.qrCode")}</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative">
                {blockchainActions.map((a, i) => (
                  <div key={i} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", a.verified ? "bg-emerald-900/30 ring-1 ring-emerald-500/30" : "bg-slate-800")}>
                        <ShieldCheck className={cn("h-4 w-4", a.verified ? "text-emerald-400" : "text-slate-500")} />
                      </div>
                      {i < blockchainActions.length - 1 && <div className="w-px h-full bg-emerald-800/30 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{a.action}</p>
                        <p className="text-xs text-slate-500">{a.date}</p>
                      </div>
                      <p className="text-xs text-emerald-400/60 font-mono mt-1">Hash: {a.hash}</p>
                      {a.verified && <Badge className="mt-1 bg-emerald-900/30 text-emerald-400 text-xs">Verifie sur blockchain</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
