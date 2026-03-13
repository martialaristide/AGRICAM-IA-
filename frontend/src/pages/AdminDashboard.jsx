import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Shield, Users, Activity, AlertTriangle, Server,
  Cpu, Database, Zap, TrendingUp, Eye, Lock,
  BarChart3, Clock, CheckCircle, XCircle, Globe,
  Layers, RefreshCw, Bell, FileText, Search, Settings
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../services/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try { await api.put(`/admin/users/${userId}/verify`); toast.success("OK"); fetchData(); } catch { toast.error("Erreur"); }
  };
  const handleDelete = async (userId) => {
    if (!window.confirm("Confirmer?")) return;
    try { await api.delete(`/admin/users/${userId}`); toast.success("OK"); fetchData(); } catch { toast.error("Erreur"); }
  };

  const systemMetrics = {
    uptime: "99.97%", responseTime: "42ms", errorRate: "0.02%",
    memoryUsage: 67, cpuLoad: 34, apiCalls: "12,847",
    dbConnections: 23, cacheHitRate: "94.2%"
  };

  const securityAlerts = [
    { id: 1, type: "warning", msg: t("roles.admin.suspiciousActivity") + ": 3 connexions depuis IP inconnue", time: "Il y a 12min", severity: "medium" },
    { id: 2, type: "info", msg: "Mise a jour de securite disponible v3.2.1", time: "Il y a 2h", severity: "low" },
    { id: 3, type: "critical", msg: t("roles.admin.fraudDetection") + ": Compte fournisseur suspect detecte", time: "Il y a 35min", severity: "high" },
  ];

  const abTests = [
    { name: "Nouveau dashboard agriculteur", variant: "B", conversionA: 12.3, conversionB: 18.7, status: "active", confidence: 94 },
    { name: "Onboarding simplifie", variant: "A", conversionA: 45.2, conversionB: 41.8, status: "completed", confidence: 97 },
    { name: "Prix affiche en XAF", variant: "B", conversionA: 8.1, conversionB: 14.5, status: "active", confidence: 88 },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="space-y-6 animate-slide-in" data-testid="admin-dashboard">
      <div className="gradient-dashboard rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center ring-1 ring-red-500/30">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">{t("roles.admin.title")}</h1>
            <p className="text-slate-400">{t("roles.admin.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: t("pages.dashboard.overview"), icon: BarChart3 },
          { id: "health", label: t("roles.admin.platformHealth"), icon: Activity },
          { id: "security", label: t("roles.admin.securityAlerts"), icon: Lock },
          { id: "users", label: t("roles.admin.totalUsers"), icon: Users },
          { id: "abtests", label: t("roles.admin.abTesting"), icon: Layers },
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("roles.admin.totalUsers"), value: stats?.users_count || users.length, icon: Users, color: "emerald" },
              { label: t("roles.admin.activeUsers"), value: stats?.active_users || Math.floor(users.length * 0.7), icon: Globe, color: "blue" },
              { label: t("roles.admin.monthlyRevenue"), value: `${((stats?.revenue || 2450000) / 1000).toFixed(0)}K`, icon: TrendingUp, color: "violet" },
              { label: t("roles.admin.serverLoad"), value: `${systemMetrics.cpuLoad}%`, icon: Cpu, color: "orange" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
                    </div>
                    <s.icon className={`h-8 w-8 text-${s.color}-400`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-white text-base">{t("roles.admin.featureAdoption")}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { name: "AGRI GENIUS", usage: 87 },
                  { name: "Camera IA", usage: 65 },
                  { name: t("nav.parcels"), usage: 92 },
                  { name: t("nav.marketplace"), usage: 54 },
                  { name: t("nav.irrigation"), usage: 41 },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-32 truncate">{f.name}</span>
                    <Progress value={f.usage} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-white w-10 text-right">{f.usage}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50">
                <CardTitle className="text-white text-base">{t("roles.admin.predictiveMaintenance")}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { task: "Nettoyage base de donnees", date: "Lundi 03h00", priority: "low" },
                  { task: "Reindexation Elasticsearch", date: "Mercredi 02h00", priority: "medium" },
                  { task: t("roles.admin.scalingRecommendation"), date: "Vendredi (pic prevu)", priority: "high" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div>
                      <p className="text-sm text-white">{m.task}</p>
                      <p className="text-xs text-slate-500">{m.date}</p>
                    </div>
                    <Badge className={cn("text-xs text-white", m.priority === "high" ? "bg-red-500" : m.priority === "medium" ? "bg-amber-500" : "bg-blue-500")}>{m.priority}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "health" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("roles.admin.uptime"), value: systemMetrics.uptime, icon: Clock, color: "emerald" },
            { label: t("roles.admin.responseTime"), value: systemMetrics.responseTime, icon: Zap, color: "blue" },
            { label: t("roles.admin.errorRate"), value: systemMetrics.errorRate, icon: AlertTriangle, color: "amber" },
            { label: "API Calls/h", value: systemMetrics.apiCalls, icon: Globe, color: "violet" },
            { label: t("roles.admin.memoryUsage"), value: `${systemMetrics.memoryUsage}%`, icon: Server, color: "orange", progress: systemMetrics.memoryUsage },
            { label: "CPU", value: `${systemMetrics.cpuLoad}%`, icon: Cpu, color: "cyan", progress: systemMetrics.cpuLoad },
            { label: "DB Conn.", value: systemMetrics.dbConnections, icon: Database, color: "pink" },
            { label: "Cache Hit", value: systemMetrics.cacheHitRate, icon: RefreshCw, color: "green" },
          ].map((m, i) => (
            <Card key={i} className="glass-card card-hover">
              <CardContent className="p-5 text-center">
                <m.icon className={`h-8 w-8 mx-auto mb-2 text-${m.color}-400`} />
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                {m.progress && <Progress value={m.progress} className="h-1.5 mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <Card className="glass-card neon-border-green">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-400" /> {t("roles.admin.anomalyDetection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {securityAlerts.map(a => (
                <div key={a.id} className={cn("p-4 rounded-xl border-l-4", a.severity === "high" ? "border-l-red-500 bg-red-900/10" : a.severity === "medium" ? "border-l-amber-500 bg-amber-900/10" : "border-l-blue-500 bg-blue-900/10")} data-testid={`alert-${a.id}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-medium">{a.msg}</p>
                    <Badge className={cn("text-xs text-white", a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-amber-500" : "bg-blue-500")}>{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{a.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white">{t("roles.admin.totalUsers")} ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-800/50">
                  {["Email", "Nom", "Role", "Status", "Actions"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.slice(0, 20).map(u => (
                    <tr key={u.id} className="border-b border-slate-800/30 hover:bg-slate-800/20" data-testid={`user-${u.id}`}>
                      <td className="p-3 text-sm text-emerald-400 font-mono">{u.email}</td>
                      <td className="p-3 text-sm text-white">{u.full_name}</td>
                      <td className="p-3"><Badge className="bg-slate-700 text-slate-300 text-xs">{u.role}</Badge></td>
                      <td className="p-3">{u.is_verified ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</td>
                      <td className="p-3 flex gap-2">
                        {!u.is_verified && <Button size="sm" className="bg-emerald-600 h-7 text-xs" onClick={() => handleVerify(u.id)}>Verifier</Button>}
                        <Button size="sm" variant="outline" className="border-red-800 text-red-400 h-7 text-xs" onClick={() => handleDelete(u.id)}>Suppr.</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "abtests" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white">{t("roles.admin.abTesting")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {abTests.map((test, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">{test.name}</h4>
                  <Badge className={test.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-600 text-white"}>{test.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-xs text-slate-500">Variant A</p><p className="text-lg font-bold text-white">{test.conversionA}%</p></div>
                  <div><p className="text-xs text-slate-500">Variant B</p><p className="text-lg font-bold text-emerald-400">{test.conversionB}%</p></div>
                  <div><p className="text-xs text-slate-500">Confidence</p><p className="text-lg font-bold text-amber-400">{test.confidence}%</p></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Gagnant: Variant {test.variant}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
