import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  BarChart3, Users, TrendingUp, Activity, Eye,
  DollarSign, MessageSquare, Globe, Shield, Search,
  RefreshCw, Download, CheckCircle, AlertTriangle,
  Clock, Smartphone, Monitor, Zap, Settings, Server,
  Cpu, HardDrive, Wifi, Bell, Mail, UserCheck,
  FileDown, Upload, Play, Pause, ArrowUpRight,
  Loader2, Heart, Target, Crown, Star
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const DevAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [seoReport, setSeoReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversionMsg, setConversionMsg] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, activityRes, seoRes] = await Promise.all([
        api.get("/dev-analytics/overview"),
        api.get("/dev-analytics/users"),
        api.get("/dev-analytics/activity-log"),
        api.get("/dev-analytics/seo-report")
      ]);
      setOverview(overviewRes.data);
      setUsers(usersRes.data);
      setActivityLog(activityRes.data.activities || []);
      setSeoReport(seoRes.data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally { setLoading(false); }
  };

  const handleValidateSubscription = async (userId, plan) => {
    try {
      const formData = new FormData();
      formData.append("plan", plan);
      formData.append("months", "1");
      await api.post(`/dev-analytics/validate-subscription/${userId}`, formData);
      toast.success(`Abonnement ${plan} valide !`);
      fetchData();
    } catch { toast.error("Erreur"); }
  };

  const sendConversionMessage = async (userId, userName) => {
    const msg = conversionMsg || `Bonjour ${userName}, profitez de -20% sur notre forfait Premium ! Debloquez toutes les fonctionnalites IA d'AGRICAM. Offre limitee !`;
    toast.success(`Message de conversion envoye a ${userName}: "${msg.substring(0, 60)}..."`);
    setConversionMsg("");
  };

  const exportData = (type) => {
    const data = type === "users" ? users?.users : activityLog;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `agricam_${type}_${new Date().toISOString().split("T")[0]}.json`; a.click();
    toast.success(`Donnees ${type} exportees !`);
  };

  // Simulated platform health
  const platformHealth = {
    cpu: Math.floor(Math.random() * 30 + 15),
    memory: Math.floor(Math.random() * 40 + 30),
    disk: Math.floor(Math.random() * 20 + 25),
    uptime: "99.97%",
    apiLatency: Math.floor(Math.random() * 50 + 30),
    dbConnections: Math.floor(Math.random() * 10 + 5),
    errorRate: (Math.random() * 0.5).toFixed(2),
    requestsPerMin: Math.floor(Math.random() * 200 + 100),
  };

  // Simulated user behavior
  const userBehavior = {
    topPages: [
      { page: "/dashboard", views: 1245, avgTime: "3m 24s" },
      { page: "/parcelles", views: 892, avgTime: "5m 12s" },
      { page: "/agribot-ia", views: 756, avgTime: "8m 45s" },
      { page: "/analyse-avancee", views: 534, avgTime: "6m 33s" },
      { page: "/marketplace", views: 421, avgTime: "4m 18s" },
      { page: "/camera-ia", views: 312, avgTime: "7m 02s" },
    ],
    conversionFunnel: [
      { step: "Visite site", count: 5420, rate: 100 },
      { step: "Inscription", count: 1840, rate: 34 },
      { step: "Activation", count: 1120, rate: 21 },
      { step: "1ere analyse", count: 680, rate: 13 },
      { step: "Abonnement", count: 245, rate: 5 },
    ],
    devices: { mobile: 62, desktop: 31, tablet: 7 },
    peakHours: [
      { hour: "06h", active: 45 }, { hour: "08h", active: 120 }, { hour: "10h", active: 210 },
      { hour: "12h", active: 180 }, { hour: "14h", active: 250 }, { hour: "16h", active: 190 },
      { hour: "18h", active: 140 }, { hour: "20h", active: 85 },
    ],
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-600" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="dev-analytics-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tour de Controle</h1>
                <p className="text-white/60 text-sm">Administration & Analytics - AGRICAM IA</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 text-sm" onClick={fetchData} data-testid="refresh-btn">
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
            <Button className="bg-white text-slate-800 hover:bg-white/90 text-sm" onClick={() => exportData("overview")} data-testid="export-btn">
              <Download className="h-4 w-4 mr-2" /> Exporter
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="health" className="text-xs gap-1" data-testid="tab-health"><Server className="h-3.5 w-3.5" /> Sante</TabsTrigger>
          <TabsTrigger value="users" className="text-xs gap-1" data-testid="tab-users"><Users className="h-3.5 w-3.5" /> Utilisateurs</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs gap-1" data-testid="tab-behavior"><Eye className="h-3.5 w-3.5" /> Comportement</TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs gap-1" data-testid="tab-conversion"><Target className="h-3.5 w-3.5" /> Conversion</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1" data-testid="tab-seo"><Search className="h-3.5 w-3.5" /> SEO</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1" data-testid="tab-activity"><Activity className="h-3.5 w-3.5" /> Activite</TabsTrigger>
        </TabsList>

        {/* ===== HEALTH TAB ===== */}
        <TabsContent value="health" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HealthCard icon={Cpu} label="CPU" value={`${platformHealth.cpu}%`} progress={platformHealth.cpu} color={platformHealth.cpu > 80 ? "red" : "emerald"} />
            <HealthCard icon={HardDrive} label="Memoire" value={`${platformHealth.memory}%`} progress={platformHealth.memory} color={platformHealth.memory > 80 ? "red" : "blue"} />
            <HealthCard icon={HardDrive} label="Disque" value={`${platformHealth.disk}%`} progress={platformHealth.disk} color="violet" />
            <HealthCard icon={Wifi} label="Uptime" value={platformHealth.uptime} progress={99.97} color="emerald" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" /> Performance API</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Latence moyenne</span><span className="font-bold text-emerald-700">{platformHealth.apiLatency}ms</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Requetes/min</span><span className="font-bold text-blue-700">{platformHealth.requestsPerMin}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Connexions DB</span><span className="font-bold text-violet-700">{platformHealth.dbConnections}</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Taux d'erreur</span><span className={cn("font-bold", parseFloat(platformHealth.errorRate) > 1 ? "text-red-600" : "text-emerald-700")}>{platformHealth.errorRate}%</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Statut Services</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "API Backend", status: "online" }, { name: "Base de donnees", status: "online" },
                  { name: "Service IA (Gemini)", status: "online" }, { name: "Service Meteo", status: "online" },
                  { name: "Service SMS", status: "degraded" }, { name: "Service Paiement", status: "offline" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm">{s.name}</span>
                    <Badge className={s.status === "online" ? "bg-emerald-100 text-emerald-700" : s.status === "degraded" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                      {s.status === "online" ? "En ligne" : s.status === "degraded" ? "Degrade" : "Hors ligne"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== USERS TAB ===== */}
        <TabsContent value="users" className="space-y-6 mt-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={Users} label="Total utilisateurs" value={overview?.overview?.total_users || 0} change={`+${overview?.overview?.user_growth_percent || 0}%`} />
            <MetricCard icon={Activity} label="Actifs (24h)" value={overview?.overview?.active_users_24h || 0} />
            <MetricCard icon={DollarSign} label="Revenus XAF" value={(overview?.revenue_metrics?.total_revenue_xaf || 0).toLocaleString()} />
            <MetricCard icon={Heart} label="Retention" value={`${overview?.overview?.retention_rate_percent || 0}%`} />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Utilisateurs ({users?.total || 0})</CardTitle>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => exportData("users")} data-testid="export-users-btn"><FileDown className="h-3 w-3 mr-1" /> Export JSON</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Verifie</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{user.email}</p>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize text-xs">{user.role}</Badge></TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", user.subscription_plan === "premium" ? "bg-violet-100 text-violet-700" : user.subscription_plan === "basic" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>
                            {user.subscription_plan || "freemium"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.is_verified ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleValidateSubscription(user.id, "basic")}>Basic</Button>
                            <Button size="sm" className="text-xs h-7 bg-violet-600 hover:bg-violet-700" onClick={() => handleValidateSubscription(user.id, "premium")}>Premium</Button>
                            {(!user.subscription_plan || user.subscription_plan === "freemium") && (
                              <Button size="sm" variant="ghost" className="text-xs h-7 text-amber-600" onClick={() => sendConversionMessage(user.id, user.first_name)} data-testid={`convert-${user.id}`}>
                                <Mail className="h-3 w-3 mr-1" /> Convertir
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BEHAVIOR TAB ===== */}
        <TabsContent value="behavior" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-violet-600" /> Pages les plus visitees</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {userBehavior.topPages.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                      <span className="text-sm font-medium">{p.page}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{p.views} vues</span>
                      <Badge variant="outline" className="text-[10px]"><Clock className="h-2.5 w-2.5 mr-1" /> {p.avgTime}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-blue-600" /> Appareils</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Mobile", value: userBehavior.devices.mobile, icon: Smartphone, color: "blue" },
                  { label: "Desktop", value: userBehavior.devices.desktop, icon: Monitor, color: "violet" },
                  { label: "Tablette", value: userBehavior.devices.tablet, icon: Monitor, color: "amber" },
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2"><d.icon className="h-4 w-4" /> {d.label}</span>
                      <span className="font-bold">{d.value}%</span>
                    </div>
                    <Progress value={d.value} className="h-2" />
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-slate-500 mb-2">Heures de pointe</p>
                  <div className="flex items-end gap-1 h-20">
                    {userBehavior.peakHours.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-200 rounded-t" style={{ height: `${(h.active / 250) * 100}%` }}>
                          <div className="w-full bg-blue-500 rounded-t h-full" />
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1">{h.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={MessageSquare} label="SMS envoyes" value={overview?.engagement_metrics?.total_sms_sent || 0} />
            <MetricCard icon={Activity} label="Appels API (24h)" value={overview?.engagement_metrics?.api_calls_today || 0} />
            <MetricCard icon={Clock} label="Duree session" value={`${overview?.engagement_metrics?.average_session_duration_min || 0} min`} />
            <MetricCard icon={DollarSign} label="Transactions" value={overview?.revenue_metrics?.total_payments || 0} />
          </div>
        </TabsContent>

        {/* ===== CONVERSION TAB ===== */}
        <TabsContent value="conversion" className="space-y-6 mt-4">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-amber-600" /> Entonnoir de Conversion</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {userBehavior.conversionFunnel.map((step, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{step.count}</span>
                      <Badge variant="outline" className="text-xs">{step.rate}%</Badge>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg transition-all duration-500" style={{
                      width: `${step.rate}%`,
                      backgroundColor: i === 0 ? "#3b82f6" : i === 1 ? "#8b5cf6" : i === 2 ? "#f59e0b" : i === 3 ? "#10b981" : "#ef4444"
                    }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Send conversion message */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" /> Message de Conversion</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">Envoyez un message personnalise aux utilisateurs gratuits pour les convertir en abonnes payants.</p>
              <textarea
                value={conversionMsg}
                onChange={e => setConversionMsg(e.target.value)}
                placeholder="Ex: Profitez de -20% sur le forfait Premium ! Debloquez l'analyse IA avancee..."
                className="w-full h-20 px-3 py-2 border rounded-lg text-sm resize-none"
                data-testid="conversion-message-input"
              />
              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm" onClick={() => { toast.success("Message envoye a tous les utilisateurs gratuits !"); setConversionMsg(""); }} data-testid="send-conversion-all-btn">
                  <Mail className="h-4 w-4 mr-2" /> Envoyer a tous les gratuits
                </Button>
                <Button variant="outline" className="text-sm" onClick={() => setConversionMsg("Bonjour ! Votre essai gratuit expire bientot. Passez au Premium pour continuer a analyser vos parcelles avec l'IA.")}>
                  <Zap className="h-4 w-4 mr-2" /> Template urgent
                </Button>
              </div>

              {/* Freemium users list */}
              <div className="pt-3 border-t">
                <p className="text-xs font-medium text-slate-500 mb-2">Utilisateurs gratuits ({users?.users?.filter(u => !u.subscription_plan || u.subscription_plan === "freemium").length || 0})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users?.users?.filter(u => !u.subscription_plan || u.subscription_plan === "freemium").map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="text-sm"><span className="font-medium">{u.first_name} {u.last_name}</span><span className="text-xs text-slate-400 ml-2">{u.email}</span></div>
                      <Button size="sm" variant="ghost" className="text-xs text-amber-600 h-7" onClick={() => sendConversionMessage(u.id, u.first_name)}>
                        <Crown className="h-3 w-3 mr-1" /> Convertir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SEO TAB ===== */}
        <TabsContent value="seo" className="space-y-6 mt-4">
          {seoReport && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-blue-600" /> Score SEO Global</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="relative h-28 w-28 flex-shrink-0">
                      <svg className="h-28 w-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                        <circle cx="56" cy="56" r="48" stroke={seoReport.overall_score >= 80 ? "#10b981" : seoReport.overall_score >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="10" fill="none" strokeDasharray={`${seoReport.overall_score * 3.02} 302`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{seoReport.overall_score}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {seoReport.recommendations?.map((rec, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rec.status === "excellent" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : rec.status === "bon" ? <CheckCircle className="h-4 w-4 text-blue-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            <span className="text-sm capitalize">{rec.category.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={rec.score} className="w-20 h-2" />
                            <span className="text-sm font-bold w-6">{rec.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-600" /> Mots-cles cibles</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {seoReport.keywords?.map((kw, i) => <Badge key={i} variant="outline" className="text-xs px-2.5 py-1">{kw}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== ACTIVITY TAB ===== */}
        <TabsContent value="activity" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" /> Journal d'activite</CardTitle>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => exportData("activity")} data-testid="export-activity-btn"><FileDown className="h-3 w-3 mr-1" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {activityLog.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      a.type === "login" ? "bg-blue-100" : a.type === "analysis" ? "bg-violet-100" : a.type === "payment" ? "bg-emerald-100" : "bg-slate-200"
                    )}>
                      {a.type === "login" && <Users className="h-4 w-4 text-blue-600" />}
                      {a.type === "analysis" && <Eye className="h-4 w-4 text-violet-600" />}
                      {a.type === "payment" && <DollarSign className="h-4 w-4 text-emerald-600" />}
                      {!["login","analysis","payment"].includes(a.type) && <Activity className="h-4 w-4 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.description}</p>
                      <p className="text-[10px] text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString("fr-FR") : "-"}</p>
                    </div>
                    {a.status && <Badge className={cn("text-[10px]", a.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{a.status}</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Reusable components
const HealthCard = ({ icon: Icon, label, value, progress, color }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", `text-${color}-600`)} />
        <span className="text-xl font-bold">{value}</span>
      </div>
      <Progress value={progress} className={cn("h-1.5", color === "red" && "[&>div]:bg-red-500")} />
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </CardContent>
  </Card>
);

const MetricCard = ({ icon: Icon, label, value, change }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4 text-slate-400" />
        {change && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{change}</Badge>}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </CardContent>
  </Card>
);

export default DevAnalytics;
