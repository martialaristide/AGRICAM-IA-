import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import {
  Shield, Users, Clock, Eye, UserCheck, UserX, Gift,
  Activity, TrendingUp, BarChart3, Loader2, RefreshCw,
  ChevronRight, AlertTriangle, CheckCircle2, Ban,
  DollarSign, Download, Mail, Phone
} from "lucide-react";
import api from "../services/api";

const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [expiredTrials, setExpiredTrials] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [trackingStats, setTrackingStats] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [crmContacts, setCrmContacts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  // Grant access form
  const [grantForm, setGrantForm] = useState({ user_id: "", access_level: "basic", trial_days: 7, note: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, expiredRes, onlineRes, statsRes, campRes, crmRes, txRes, revRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/access/logs"),
        api.get("/admin/access/expired"),
        api.get("/admin/tracking/users-online"),
        api.get("/admin/tracking/stats"),
        api.get("/admin/campaigns/stats"),
        api.get("/admin/crm/contacts").catch(() => ({data: []})),
        api.get("/admin/crm/transactions").catch(() => ({data: []})),
        api.get("/admin/crm/revenue-stats").catch(() => ({data: {}}))
      ]);
      setUsers(usersRes.data || []);
      setAccessLogs(logsRes.data || []);
      setExpiredTrials(expiredRes.data || []);
      setOnlineUsers(onlineRes.data?.online_users || []);
      setTrackingStats(statsRes.data);
      setCampaignStats(campRes.data);
      setCrmContacts(crmRes.data || []);
      setTransactions(txRes.data || []);
      setRevenueStats(revRes.data);
    } catch (e) {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const grantAccess = async () => {
    if (!grantForm.user_id) { toast.error("Selectionnez un utilisateur"); return; }
    setActionLoading("grant");
    try {
      await api.post("/admin/access/grant", grantForm);
      toast.success("Acces accorde avec succes !");
      fetchAll();
      setGrantForm({ user_id: "", access_level: "basic", trial_days: 7, note: "" });
    } catch (e) {
      toast.error("Erreur: " + (e.response?.data?.detail || "Echec"));
    }
    setActionLoading("");
  };

  const updateAccess = async (userId, action, extra = {}) => {
    setActionLoading(`${action}-${userId}`);
    try {
      await api.post("/admin/access/update", { user_id: userId, action, ...extra });
      toast.success(`Acces ${action} avec succes !`);
      fetchAll();
    } catch (e) {
      toast.error("Erreur: " + (e.response?.data?.detail || "Echec"));
    }
    setActionLoading("");
  };

  const getSubBadge = (sub) => {
    if (sub === "premium") return <Badge className="bg-violet-500 text-white text-xs">Premium</Badge>;
    if (sub === "basic") return <Badge className="bg-blue-500 text-white text-xs">Basic</Badge>;
    return <Badge className="bg-slate-400 text-white text-xs">Freemium</Badge>;
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="access-control-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield className="h-6 w-6 text-emerald-600" /> Controle d'Acces</h1>
        <p className="text-slate-500 text-sm">Gerez les acces, suivez l'activite et convertissez les utilisateurs</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Users, label: "Total utilisateurs", val: users.length, color: "emerald" },
          { icon: Eye, label: "En ligne", val: onlineUsers.length, color: "blue" },
          { icon: Activity, label: "Pages vues (7j)", val: trackingStats?.week_page_views || 0, color: "teal" },
          { icon: TrendingUp, label: "Taux conversion", val: `${campaignStats?.conversion_rate || 0}%`, color: "violet" },
          { icon: Gift, label: "Offres acceptees", val: campaignStats?.total_claims || 0, color: "amber" },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{s.val}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="manage" className="text-xs" data-testid="tab-manage"><Shield className="h-3.5 w-3.5 mr-1" /> Acces</TabsTrigger>
          <TabsTrigger value="crm" className="text-xs" data-testid="tab-crm"><Users className="h-3.5 w-3.5 mr-1" /> CRM</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs" data-testid="tab-revenue"><DollarSign className="h-3.5 w-3.5 mr-1" /> Revenus</TabsTrigger>
          <TabsTrigger value="online" className="text-xs" data-testid="tab-online"><Eye className="h-3.5 w-3.5 mr-1" /> En ligne</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs" data-testid="tab-campaigns"><Gift className="h-3.5 w-3.5 mr-1" /> Campagnes</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs" data-testid="tab-logs"><Clock className="h-3.5 w-3.5 mr-1" /> Logs</TabsTrigger>
        </TabsList>

        {/* Tab: Manage Access */}
        <TabsContent value="manage" className="space-y-6">
          {/* Grant access form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><UserCheck className="h-5 w-5 text-emerald-600" /> Accorder un acces</CardTitle>
              <CardDescription>Accordez un acces temporaire a un utilisateur pour une periode de test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Utilisateur</Label>
                  <Select value={grantForm.user_id} onValueChange={v => setGrantForm(p => ({...p, user_id: v}))}>
                    <SelectTrigger data-testid="grant-user-select"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.id && u.role !== "admin").map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name} ({u.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Niveau d'acces</Label>
                  <Select value={grantForm.access_level} onValueChange={v => setGrantForm(p => ({...p, access_level: v}))}>
                    <SelectTrigger data-testid="grant-level-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duree (jours)</Label>
                  <Input type="number" value={grantForm.trial_days} onChange={e => setGrantForm(p => ({...p, trial_days: parseInt(e.target.value) || 7}))} data-testid="grant-days" />
                </div>
                <div>
                  <Label>Note</Label>
                  <Input value={grantForm.note} onChange={e => setGrantForm(p => ({...p, note: e.target.value}))} placeholder="Raison..." data-testid="grant-note" />
                </div>
              </div>
              <Button onClick={grantAccess} disabled={actionLoading === "grant"} className="mt-4 bg-emerald-600 hover:bg-emerald-700" data-testid="grant-btn">
                {actionLoading === "grant" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                Accorder l'acces
              </Button>
            </CardContent>
          </Card>

          {/* Users list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /> Utilisateurs ({users.length})</span>
                <Button variant="ghost" size="sm" onClick={fetchAll}><RefreshCw className="h-3.5 w-3.5" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.filter(u => u.role !== "admin").map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors" data-testid={`user-row-${u.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                        {u.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{u.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSubBadge(u.subscription_type)}
                      {u.subscription_end && (
                        <Badge variant="outline" className={isExpired(u.subscription_end) ? "border-red-300 text-red-600" : "border-emerald-300 text-emerald-600"}>
                          {isExpired(u.subscription_end) ? "Expire" : `Jusqu'au ${new Date(u.subscription_end).toLocaleDateString("fr-FR")}`}
                        </Badge>
                      )}
                      {!u.is_active && <Badge className="bg-red-500 text-white text-xs">Bloque</Badge>}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Prolonger 7j"
                          onClick={() => updateAccess(u.id, "extend", { extra_days: 7 })}
                          disabled={!!actionLoading}
                          data-testid={`extend-${u.id}`}>
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title="Reduire a Basic"
                          onClick={() => updateAccess(u.id, "reduce", { access_level: "basic" })}
                          disabled={!!actionLoading}
                          data-testid={`reduce-${u.id}`}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Revoquer l'acces"
                          onClick={() => updateAccess(u.id, "revoke")}
                          disabled={!!actionLoading}
                          data-testid={`revoke-${u.id}`}>
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expired trials */}
          {expiredTrials.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-600"><UserX className="h-5 w-5" /> Essais expires ({expiredTrials.length})</CardTitle>
                <CardDescription>Utilisateurs dont la periode d'essai est terminee sans paiement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiredTrials.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{u.full_name}</p>
                        <p className="text-xs text-slate-500">{u.email} - Expire: {new Date(u.subscription_end).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateAccess(u.id, "extend", { extra_days: 3, note: "Extension de courtoisie" })}>
                          +3 jours
                        </Button>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600" onClick={() => updateAccess(u.id, "revoke", { note: "Essai expire" })}>
                          Revoquer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: CRM */}
        <TabsContent value="crm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /> Contacts CRM ({crmContacts.length})</span>
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = "Nom,Email,Type,Abonnement,Date\n" + crmContacts.map(c => `"${c.name}","${c.email}","${c.type}","${c.subscription}","${c.created_at}"`).join("\n");
                  const blob = new Blob([csv], {type: "text/csv"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "crm_contacts.csv"; a.click();
                  toast.success("Contacts exportes en CSV");
                }} data-testid="export-crm"><Download className="h-3.5 w-3.5 mr-1" /> Exporter</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {crmContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`crm-${c.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${c.type === "user" ? "bg-blue-500" : "bg-amber-500"}`}>
                        {c.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3 w-3" />{c.email}
                          {c.phone && <><Phone className="h-3 w-3 ml-2" />{c.phone}</>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={c.type === "user" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>{c.type === "user" ? "Utilisateur" : "Lead"}</Badge>
                      {getSubBadge(c.subscription)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Revenue */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-4 text-center">
                <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-700">{(revenueStats.total_revenue || 0).toLocaleString()} FCFA</p>
                <p className="text-xs text-slate-500">Revenu total</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-blue-700">{revenueStats.total_transactions}</p>
                <p className="text-xs text-slate-500">Transactions</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-violet-700">{revenueStats.paying_users}/{revenueStats.total_users}</p>
                <p className="text-xs text-slate-500">Payants / Total</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <BarChart3 className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-700">{(revenueStats.arpu || 0).toLocaleString()} FCFA</p>
                <p className="text-xs text-slate-500">ARPU</p>
              </CardContent></Card>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Transactions recentes</span>
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = "Email,Type,Montant,Devise,Plan,Statut,Date\n" + transactions.map(t => `"${t.user_email}","${t.type}","${t.amount}","${t.currency}","${t.plan}","${t.status}","${t.created_at}"`).join("\n");
                  const blob = new Blob([csv], {type: "text/csv"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "transactions.csv"; a.click();
                  toast.success("Transactions exportees");
                }}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{t.user_email}</p>
                      <p className="text-xs text-slate-500">{t.type} - {t.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{t.amount?.toLocaleString()} {t.currency}</p>
                      <Badge className={t.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{t.status}</Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune transaction</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Online Users */}
        <TabsContent value="online" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2"><Eye className="h-5 w-5 text-blue-600" /> Utilisateurs en ligne ({onlineUsers.length})</span>
                <Button variant="ghost" size="sm" onClick={fetchAll}><RefreshCw className="h-3.5 w-3.5" /></Button>
              </CardTitle>
              <CardDescription>Activite des 15 dernieres minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {onlineUsers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun utilisateur en ligne actuellement</p>
              ) : (
                <div className="space-y-2">
                  {onlineUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-medium">{u.email || u._id}</p>
                          <p className="text-xs text-slate-500">Page: {u.last_page} - {u.page_views} vues</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(u.last_seen).toLocaleTimeString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {trackingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Statistiques</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between p-2 bg-slate-50 rounded"><span className="text-sm text-slate-500">Pages vues aujourd'hui</span><span className="font-bold">{trackingStats.today_page_views}</span></div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded"><span className="text-sm text-slate-500">Pages vues (7 jours)</span><span className="font-bold">{trackingStats.week_page_views}</span></div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded"><span className="text-sm text-slate-500">Utilisateurs uniques aujourd'hui</span><span className="font-bold">{trackingStats.unique_users_today}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Pages populaires</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {(trackingStats.top_pages || []).map((p, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">{p._id}</span>
                      <Badge variant="outline">{p.views} vues</Badge>
                    </div>
                  ))}
                  {(!trackingStats.top_pages || trackingStats.top_pages.length === 0) && (
                    <p className="text-sm text-slate-400 text-center py-4">Pas encore de donnees</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /> Campagnes de conversion</CardTitle>
              <CardDescription>Offres automatiques pour convertir les utilisateurs gratuits</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-700">{campaignStats.paying_users}</p>
                    <p className="text-xs text-slate-500">Utilisateurs payants</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{campaignStats.total_users - campaignStats.paying_users}</p>
                    <p className="text-xs text-slate-500">Utilisateurs gratuits</p>
                  </div>
                  <div className="p-3 bg-violet-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-violet-700">{campaignStats.conversion_rate}%</p>
                    <p className="text-xs text-slate-500">Taux conversion</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-700">{campaignStats.total_claims}</p>
                    <p className="text-xs text-slate-500">Offres acceptees</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Chargement...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Offres actives</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                <div className="flex items-center gap-2 mb-1"><Gift className="h-4 w-4 text-violet-600" /><span className="font-semibold text-sm">Essai Premium 7 jours</span></div>
                <p className="text-xs text-slate-500">Declenchee quand un utilisateur gratuit tente de quitter l'application</p>
                <Badge className="mt-2 bg-violet-500">{campaignStats?.trial_claims || 0} reclamations</Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-amber-600" /><span className="font-semibold text-sm">-50% sur Basic</span></div>
                <p className="text-xs text-slate-500">2500 FCFA au lieu de 5000 FCFA pour le premier mois</p>
                <Badge className="mt-2 bg-amber-500">{campaignStats?.discount_claims || 0} reclamations</Badge>
              </div>
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-sm">Upgrade Premium - 1er mois offert</span></div>
                <p className="text-xs text-slate-500">Pour les utilisateurs Basic qui hesitent a passer au Premium</p>
                <Badge className="mt-2 bg-emerald-500">{campaignStats?.upgrade_claims || 0} reclamations</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Access Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-5 w-5 text-slate-600" /> Historique des acces</CardTitle>
            </CardHeader>
            <CardContent>
              {accessLogs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucun historique</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {accessLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={log.action === "grant_trial" ? "bg-emerald-500" : log.action === "revoke" ? "bg-red-500" : log.action === "extend" ? "bg-blue-500" : "bg-amber-500"}>
                            {log.action === "grant_trial" ? "Acces accorde" : log.action === "revoke" ? "Revoque" : log.action === "extend" ? "Prolonge" : "Reduit"}
                          </Badge>
                          <span className="text-sm font-medium">{log.target_email}</span>
                        </div>
                        {log.note && <p className="text-xs text-slate-400 mt-1">{log.note}</p>}
                      </div>
                      <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccessControl;
