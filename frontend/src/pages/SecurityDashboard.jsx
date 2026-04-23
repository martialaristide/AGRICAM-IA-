import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Shield, ShieldAlert, ShieldCheck, Users, Lock, Unlock,
  Activity, AlertTriangle, Eye, Clock, Wifi, WifiOff,
  RefreshCw, UserX, CheckCircle, XCircle, Globe, Search
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";

const SecurityDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchFilter, setSearchFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/security/dashboard");
      setData(res.data);
    } catch (e) {
      toast.error("Erreur chargement securite");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlock = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/block`);
      toast.success("Utilisateur bloque");
      fetchData();
    } catch { toast.error("Erreur"); }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unblock`);
      toast.success("Utilisateur debloque");
      fetchData();
    } catch { toast.error("Erreur"); }
  };

  const stats = data?.stats || {};
  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: Shield },
    { id: "logs", label: "Logs Securite", icon: Activity },
    { id: "blocked", label: "Utilisateurs Bloques", icon: UserX },
    { id: "threats", label: "Menaces", icon: AlertTriangle },
  ];

  const scoreColor = stats.security_score >= 80 ? "text-emerald-400" : stats.security_score >= 50 ? "text-amber-400" : "text-red-400";
  const scoreBg = stats.security_score >= 80 ? "bg-emerald-900/20 border-emerald-500/30" : stats.security_score >= 50 ? "bg-amber-900/20 border-amber-500/30" : "bg-red-900/20 border-red-500/30";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="security-loading">
        <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="security-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            {t("security.title") || "Centre de Securite"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{t("security.subtitle") || "Surveillance et protection de la plateforme"}</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="border-slate-700 text-slate-300" data-testid="refresh-security">
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className={cn("rounded-xl p-4 border", scoreBg)} data-testid="security-score">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck className={cn("h-5 w-5", scoreColor)} /><span className="text-xs text-slate-400">Score Securite</span></div>
          <p className={cn("text-3xl font-bold", scoreColor)}>{stats.security_score || 0}%</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/50" data-testid="total-users">
          <div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-blue-400" /><span className="text-xs text-slate-400">Utilisateurs</span></div>
          <p className="text-3xl font-bold text-white">{stats.total_users || 0}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/50" data-testid="active-sessions">
          <div className="flex items-center gap-2 mb-2"><Activity className="h-5 w-5 text-emerald-400" /><span className="text-xs text-slate-400">Actifs</span></div>
          <p className="text-3xl font-bold text-emerald-400">{stats.active_sessions || 0}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/50" data-testid="blocked-users">
          <div className="flex items-center gap-2 mb-2"><Lock className="h-5 w-5 text-red-400" /><span className="text-xs text-slate-400">Bloques</span></div>
          <p className="text-3xl font-bold text-red-400">{stats.blocked_users || 0}</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-800/40 border border-slate-700/50" data-testid="recent-activity">
          <div className="flex items-center gap-2 mb-2"><Clock className="h-5 w-5 text-amber-400" /><span className="text-xs text-slate-400">Activite 24h</span></div>
          <p className="text-3xl font-bold text-amber-400">{stats.recent_activity_24h || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
              activeTab === tab.id ? "bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/30" : "text-slate-400 hover:bg-slate-800/50"
            )} data-testid={`tab-${tab.id}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Login Activity */}
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Eye className="h-4 w-4 text-blue-400" /> Activite de Connexion Recente</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(data?.login_activity || []).map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 text-sm">
                  <div className="flex items-center gap-2">
                    {log.action === "login_success" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : log.action === "block" ? <Lock className="h-4 w-4 text-red-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                    <span className="text-slate-300">{log.email || log.target_user_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px]",
                      log.action === "login_success" ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"
                    )}>{log.action}</Badge>
                    <span className="text-[10px] text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleString("fr-FR") : ""}</span>
                  </div>
                </div>
              ))}
              {(data?.login_activity || []).length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucune activite recente</p>}
            </div>
          </div>
          
          {/* Threat Summary */}
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Resume des Menaces</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-red-400" /><span className="text-sm text-slate-300">Tentatives echouees</span></div>
                <span className="text-lg font-bold text-red-400">{(data?.suspicious_activity || []).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2"><UserX className="h-5 w-5 text-amber-400" /><span className="text-sm text-slate-300">Comptes bloques</span></div>
                <span className="text-lg font-bold text-amber-400">{stats.blocked_users || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /><span className="text-sm text-slate-300">Niveau de securite</span></div>
                <span className={cn("text-lg font-bold", scoreColor)}>
                  {stats.security_score >= 80 ? "Eleve" : stats.security_score >= 50 ? "Moyen" : "Faible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Filtrer les logs..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50" data-testid="logs-search" />
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {(data?.security_logs || []).filter(l => !searchFilter || JSON.stringify(l).toLowerCase().includes(searchFilter.toLowerCase())).map((log, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/50 text-sm border-b border-slate-800/30">
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-[10px] min-w-[80px] justify-center",
                    log.action?.includes("success") ? "bg-emerald-900/40 text-emerald-400"
                    : log.action?.includes("block") ? "bg-red-900/40 text-red-400"
                    : "bg-amber-900/40 text-amber-400"
                  )}>{log.action}</Badge>
                  <span className="text-slate-300">{log.email || log.target_user_id || log.user_id || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Globe className="h-3 w-3" />{log.ip || "-"}</span>
                  <span className="text-[10px] text-slate-600">{log.timestamp ? new Date(log.timestamp).toLocaleString("fr-FR") : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "blocked" && (
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Utilisateurs Bloques ({(data?.blocked_list || []).length})</h3>
          <div className="space-y-2">
            {(data?.blocked_list || []).map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-900/10 border border-red-900/20">
                <div>
                  <p className="text-sm font-medium text-white">{u.full_name}</p>
                  <p className="text-xs text-slate-400">{u.email} - {u.role}</p>
                </div>
                <Button size="sm" onClick={() => handleUnblock(u.id)} className="bg-emerald-600 hover:bg-emerald-500 text-xs" data-testid={`unblock-${u.id}`}>
                  <Unlock className="h-3 w-3 mr-1" /> Debloquer
                </Button>
              </div>
            ))}
            {(data?.blocked_list || []).length === 0 && <p className="text-sm text-slate-500 text-center py-8">Aucun utilisateur bloque</p>}
          </div>
        </div>
      )}

      {activeTab === "threats" && (
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-400" /> Tentatives de Connexion Echouees</h3>
          <div className="space-y-2">
            {(data?.suspicious_activity || []).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-900/10 border border-red-900/20">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm text-white">{s.email}</p>
                    <p className="text-xs text-slate-500">IP: {s.ip || "inconnu"}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{s.timestamp ? new Date(s.timestamp).toLocaleString("fr-FR") : ""}</span>
              </div>
            ))}
            {(data?.suspicious_activity || []).length === 0 && <p className="text-sm text-emerald-400 text-center py-8 flex items-center justify-center gap-2"><ShieldCheck className="h-5 w-5" /> Aucune menace detectee</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
