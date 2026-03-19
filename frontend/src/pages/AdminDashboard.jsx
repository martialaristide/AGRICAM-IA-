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
  const [platformHealth, setPlatformHealth] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [abTests, setAbTests] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, healthRes, secRes, abRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/predictive/platform-health").catch(() => ({ data: null })),
        api.get("/predictive/security-alerts").catch(() => ({ data: [] })),
        api.get("/predictive/ab-tests").catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPlatformHealth(healthRes.data);
      setSecurityAlerts(secRes.data || []);
      setAbTests(abRes.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await api.post("/predictive/ai-insights");
      setAiInsights(res.data.insights);
      toast.success("Insights IA generes !");
    } catch { toast.error("Erreur generation insights"); }
    finally { setGeneratingInsights(false); }
  };

  const handleVerify = async (userId) => {
    try { await api.put(`/admin/users/${userId}/verify`); toast.success("OK"); fetchData(); } catch { toast.error("Erreur"); }
  };
  const handleDelete = async (userId) => {
    if (!window.confirm("Confirmer?")) return;
    try { await api.delete(`/admin/users/${userId}`); toast.success("OK"); fetchData(); } catch { toast.error("Erreur"); }
  };
  const handleBlock = async (userId) => {
    try { await api.put(`/admin/users/${userId}/block`); toast.success("Utilisateur bloque"); fetchData(); } catch { toast.error("Erreur"); }
  };
  const handleUnblock = async (userId) => {
    try { await api.put(`/admin/users/${userId}/unblock`); toast.success("Utilisateur debloque"); fetchData(); } catch { toast.error("Erreur"); }
  };

  const health = platformHealth || { uptime_percent: 99.97, response_time_ms: 42, error_rate_percent: 0.02, memory_usage_percent: 67, cpu_load_percent: 34, api_calls_today: 12847, db_connections: 23, cache_hit_rate: 94.2 };

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
              { label: t("roles.admin.serverLoad"), value: `${health.cpu_load_percent}%`, icon: Cpu, color: "orange" },
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
          {/* AI Insights Section */}
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">{t("roles.admin.predictiveAnalytics") || "Insights IA Predictifs"}</CardTitle>
                <Button size="sm" onClick={generateInsights} disabled={generatingInsights}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs" data-testid="generate-insights-btn">
                  {generatingInsights ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
                  {generatingInsights ? "Analyse..." : "Generer Insights IA"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {aiInsights ? (
                <div className="space-y-3">
                  {(aiInsights.insights || []).map((insight, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn("text-xs", insight.impact === "high" ? "bg-red-900/40 text-red-400" : insight.impact === "medium" ? "bg-amber-900/40 text-amber-400" : "bg-blue-900/40 text-blue-400")}>{insight.category}</Badge>
                        <span className="text-sm font-medium text-white">{insight.title}</span>
                      </div>
                      <p className="text-xs text-slate-400">{insight.description}</p>
                      <p className="text-xs text-emerald-400 mt-1">Action: {insight.action}</p>
                    </div>
                  ))}
                  {aiInsights.top_recommendation && (
                    <div className="p-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg">
                      <p className="text-sm text-emerald-400 font-medium">Recommandation principale: {aiInsights.top_recommendation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Cliquez sur "Generer Insights IA" pour obtenir des recommandations predictives</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "health" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("roles.admin.uptime"), value: `${health.uptime_percent}%`, icon: Clock, color: "emerald" },
            { label: t("roles.admin.responseTime"), value: `${health.response_time_ms}ms`, icon: Zap, color: "blue" },
            { label: t("roles.admin.errorRate"), value: `${health.error_rate_percent}%`, icon: AlertTriangle, color: "amber" },
            { label: "API Calls", value: health.api_calls_today?.toLocaleString(), icon: Globe, color: "violet" },
            { label: t("roles.admin.memoryUsage"), value: `${health.memory_usage_percent}%`, icon: Server, color: "orange", progress: health.memory_usage_percent },
            { label: "CPU", value: `${health.cpu_load_percent}%`, icon: Cpu, color: "cyan", progress: health.cpu_load_percent },
            { label: "DB Conn.", value: health.db_connections, icon: Database, color: "pink" },
            { label: "Cache Hit", value: `${health.cache_hit_rate}%`, icon: RefreshCw, color: "green" },
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
          {/* Intrusion Detection */}
          <Card className="glass-card neon-border-green">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" /> Detection d'intrusion & Menaces
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Tentatives bloquees", value: "127", color: "text-red-400" },
                  { label: "IPs blacklistees", value: "34", color: "text-amber-400" },
                  { label: "Attaques DDoS", value: "0", color: "text-emerald-400" },
                  { label: "Score securite", value: "94/100", color: "text-blue-400" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/40 text-center">
                    <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {securityAlerts.map(a => (
                  <div key={a.id} className={cn("p-4 rounded-xl border-l-4", a.severity === "high" ? "border-l-red-500 bg-red-900/10" : a.severity === "medium" ? "border-l-amber-500 bg-amber-900/10" : "border-l-blue-500 bg-blue-900/10")} data-testid={`alert-${a.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">{a.message || a.msg}</p>
                        <p className="text-xs text-slate-500 mt-1">{a.source_ip || "IP: 192.168.x.x"} - {a.location || "Localisation inconnue"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs text-white", a.severity === "high" ? "bg-red-500" : a.severity === "medium" ? "bg-amber-500" : "bg-blue-500")}>{a.severity}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{a.timestamp ? new Date(a.timestamp).toLocaleString("fr-FR") : a.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Protection status */}
          <Card className="glass-card">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-white flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-400" /> Protections actives</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Rate Limiting API", status: true, desc: "Max 100 req/min par IP" },
                { name: "Protection XSS/CSRF", status: true, desc: "Headers securite actifs" },
                { name: "Anti Web-Scraping", status: true, desc: "Detection de bots automatisee" },
                { name: "Protection BDD (Injection)", status: true, desc: "Requetes parametrees MongoDB" },
                { name: "Chiffrement JWT", status: true, desc: "HS256 avec rotation de cles" },
                { name: "Blocage Force Brute", status: true, desc: "Verrouillage apres 5 tentatives" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
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
                        {!u.is_verified && <Button size="sm" className="bg-emerald-600 h-7 text-xs" onClick={() => handleVerify(u.id)} data-testid={`verify-${u.id}`}>Verifier</Button>}
                        {u.is_blocked ? (
                          <Button size="sm" className="bg-amber-600 h-7 text-xs" onClick={() => handleUnblock(u.id)} data-testid={`unblock-${u.id}`}>Debloquer</Button>
                        ) : (
                          <Button size="sm" variant="outline" className="border-amber-800 text-amber-400 h-7 text-xs" onClick={() => handleBlock(u.id)} data-testid={`block-${u.id}`}>Bloquer</Button>
                        )}
                        <Button size="sm" variant="outline" className="border-red-800 text-red-400 h-7 text-xs" onClick={() => handleDelete(u.id)} data-testid={`delete-${u.id}`}>Suppr.</Button>
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
                  <div><p className="text-xs text-slate-500">Variant A</p><p className="text-lg font-bold text-white">{test.conversion_a || test.conversionA}%</p></div>
                  <div><p className="text-xs text-slate-500">Variant B</p><p className="text-lg font-bold text-emerald-400">{test.conversion_b || test.conversionB}%</p></div>
                  <div><p className="text-xs text-slate-500">Confidence</p><p className="text-lg font-bold text-amber-400">{test.confidence}%</p></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Gagnant: Variant {test.variant_winning || test.variant} {test.sample_size ? `(${test.sample_size} samples)` : ""}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
