import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { LifeBuoy, Search, RefreshCw, Send, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_COLORS = { low: "bg-slate-500", medium: "bg-blue-500", high: "bg-amber-500", critical: "bg-red-600" };
const STATUS_COLORS = { open: "bg-blue-500", in_progress: "bg-amber-500", resolved: "bg-emerald-500", closed: "bg-slate-500" };

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: "", priority: "", category: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/support/admin/tickets?${params}`);
      setTickets(res.data.tickets);
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Erreur de chargement");
    } finally { setLoading(false); }
  };

  const openTicket = async (t) => {
    const res = await api.get(`/support/tickets/${t.id}`);
    setSelectedTicket(res.data);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/messages`, { message: reply });
      const refreshed = await api.get(`/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(refreshed.data);
      setReply("");
      toast.success("Réponse envoyée");
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Erreur");
    } finally { setSubmitting(false); }
  };

  const setStatus = async (ticketId, status) => {
    try {
      await api.post(`/support/admin/tickets/${ticketId}/status?status=${status}`);
      toast.success(`Statut mis à jour: ${status}`);
      fetchTickets();
      if (selectedTicket) {
        const refreshed = await api.get(`/support/tickets/${ticketId}`);
        setSelectedTicket(refreshed.data);
      }
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6" data-testid="admin-support-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LifeBuoy className="h-8 w-8 text-lime-500" />
          Administration Support
        </h1>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total || 0, color: "text-slate-700" },
          { label: "Ouverts", value: stats.open || 0, color: "text-blue-600" },
          { label: "En cours", value: stats.in_progress || 0, color: "text-amber-600" },
          { label: "Résolus", value: stats.resolved || 0, color: "text-emerald-600" },
          { label: "Fermés", value: stats.closed || 0, color: "text-slate-500" },
          { label: "Critiques", value: stats.critical || 0, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 uppercase mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Recherche (sujet, email, n°)..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} data-testid="admin-search" />
            <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Tous statuts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="open">Ouverts</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="closed">Fermés</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority || "all"} onValueChange={(v) => setFilters({ ...filters, priority: v === "all" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Toutes priorités" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchTickets}><Search className="h-4 w-4 mr-2" /> Filtrer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets list */}
      {loading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-lime-500" /></div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md" onClick={() => openTicket(t)}>
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className="font-mono">{t.ticket_number}</Badge>
                    <Badge className={`${PRIORITY_COLORS[t.priority]} text-white`}>{t.priority}</Badge>
                    <Badge className={`${STATUS_COLORS[t.status]} text-white`}>{t.status}</Badge>
                    {t.priority === "critical" && t.status !== "closed" && <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />}
                  </div>
                  <p className="font-semibold truncate">{t.subject}</p>
                  <p className="text-sm text-slate-500">{t.user_email} · {t.category_label} · {t.messages?.length || 1} msg</p>
                </div>
                <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString("fr-FR")}</p>
              </CardContent>
            </Card>
          ))}
          {tickets.length === 0 && <p className="text-center text-slate-500 p-8">Aucun ticket trouvé</p>}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono">{selectedTicket.ticket_number}</span>
                  <Badge className={`${PRIORITY_COLORS[selectedTicket.priority]} text-white`}>{selectedTicket.priority}</Badge>
                  <Badge className={`${STATUS_COLORS[selectedTicket.status]} text-white`}>{selectedTicket.status}</Badge>
                </DialogTitle>
                <p className="font-semibold">{selectedTicket.subject}</p>
                <p className="text-sm text-slate-500">{selectedTicket.user_name} • {selectedTicket.user_email}</p>
              </DialogHeader>

              <div className="flex gap-2 mb-3">
                <Button size="sm" variant="outline" onClick={() => setStatus(selectedTicket.id, "in_progress")}>En cours</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(selectedTicket.id, "resolved")}>Résolu</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(selectedTicket.id, "closed")}>Fermer</Button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {selectedTicket.messages?.map((m) => (
                  <div key={m.id} className={`p-3 rounded ${m.author_role === "admin" ? "bg-lime-50 dark:bg-lime-900/20 ml-8" : "bg-slate-50 dark:bg-slate-800/50 mr-8"}`}>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <strong>{m.author_name} ({m.author_role === "admin" ? "Support" : "Client"})</strong>
                      <span>{new Date(m.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="space-y-2 pt-3 border-t">
                  <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Réponse au client..." rows={3} />
                  <Button onClick={sendReply} disabled={submitting || !reply.trim()} className="w-full bg-lime-600 hover:bg-lime-700">
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Envoyer la réponse
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
