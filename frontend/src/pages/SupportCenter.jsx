import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { LifeBuoy, Plus, Send, Paperclip, Clock, CheckCircle2, AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const PRIORITY_COLORS = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  critical: "bg-red-600",
};

const STATUS_COLORS = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-500",
};

const STATUS_LABELS = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [form, setForm] = useState({ subject: "", category: "technical", priority: "medium", message: "" });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, catRes] = await Promise.all([
        api.get("/support/tickets"),
        api.get("/support/categories"),
      ]);
      setTickets(ticketsRes.data.tickets);
      setCategories(catRes.data.categories);
      setPriorities(catRes.data.priorities);
    } catch (err) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const dataUris = await Promise.all(
      files.map((f) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(f);
      }))
    );
    setAttachments(dataUris);
  };

  const handleCreate = async () => {
    if (!form.subject.trim() || form.subject.length < 3) {
      toast.error("Le sujet doit contenir au moins 3 caractères");
      return;
    }
    if (!form.message.trim() || form.message.length < 10) {
      toast.error("Le message doit contenir au moins 10 caractères");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/support/tickets", {
        ...form,
        attachments: attachments.length ? attachments : undefined,
      });
      toast.success(res.data.message);
      setShowCreate(false);
      setForm({ subject: "", category: "technical", priority: "medium", message: "" });
      setAttachments([]);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    try {
      const res = await api.get(`/support/tickets/${ticket.id}`);
      setSelectedTicket(res.data);
    } catch (err) {
      toast.error("Erreur de chargement");
    }
  };

  const handleReply = async () => {
    if (!newReply.trim() || newReply.length < 1) return;
    setSubmitting(true);
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/messages`, { message: newReply });
      const refreshed = await api.get(`/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(refreshed.data);
      setNewReply("");
      toast.success("Message envoyé");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (ticketId) => {
    try {
      await api.post(`/support/tickets/${ticketId}/close`);
      toast.success("Ticket fermé");
      setSelectedTicket(null);
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-lime-500" /></div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-6" data-testid="support-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-lime-500" />
            Centre de support
          </h1>
          <p className="text-slate-500 mt-1">Posez vos questions, signalez un bug, demandez de l'aide.</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-lime-600 hover:bg-lime-700" data-testid="create-ticket-btn">
              <Plus className="h-4 w-4 mr-2" /> Nouveau ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="ticket-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priorité</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger data-testid="ticket-priority-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => <SelectItem key={p.id} value={p.id}>{p.label} (réponse sous {p.sla_hours}h)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sujet</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Mon paiement Mobile Money n'aboutit pas"
                  data-testid="ticket-subject-input"
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Description détaillée</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre problème en détail. Plus vous donnez de contexte, plus vite nous pouvons vous aider."
                  rows={6}
                  data-testid="ticket-message-input"
                  maxLength={5000}
                />
                <p className="text-xs text-slate-500 mt-1">{form.message.length} / 5000</p>
              </div>
              <div>
                <Label>Pièces jointes (optionnel — max 3, 3 Mo chaque)</Label>
                <Input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} data-testid="ticket-attachments-input" />
                {attachments.length > 0 && <p className="text-xs text-emerald-600 mt-1">{attachments.length} fichier(s) prêt(s)</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={submitting} className="bg-lime-600 hover:bg-lime-700" data-testid="ticket-submit-btn">
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Envoyer le ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Aucun ticket pour le moment</p>
            <p className="text-sm">Cliquez sur "Nouveau ticket" pour nous contacter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3" data-testid="tickets-list">
          {tickets.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicket(t)} data-testid={`ticket-${t.ticket_number}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">{t.ticket_number}</Badge>
                      <Badge className={`${PRIORITY_COLORS[t.priority]} text-white text-xs`}>{t.priority}</Badge>
                      <Badge className={`${STATUS_COLORS[t.status]} text-white text-xs`}>{STATUS_LABELS[t.status]}</Badge>
                    </div>
                    <p className="font-semibold mt-2 truncate">{t.subject}</p>
                    <p className="text-sm text-slate-500 mt-1">{t.category_label} • {t.messages?.length || 1} message(s)</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(t.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket detail dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="ticket-detail-dialog">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm">{selectedTicket.ticket_number}</span>
                  <Badge className={`${STATUS_COLORS[selectedTicket.status]} text-white`}>{STATUS_LABELS[selectedTicket.status]}</Badge>
                </DialogTitle>
                <p className="text-base font-semibold mt-1">{selectedTicket.subject}</p>
              </DialogHeader>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedTicket.messages?.map((m) => (
                  <div key={m.id} className={`p-3 rounded-md ${m.author_role === "admin" ? "bg-lime-50 dark:bg-lime-900/20 border-l-4 border-lime-500" : "bg-slate-50 dark:bg-slate-800/50"}`}>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-medium">{m.author_name} ({m.author_role === "admin" ? "Support" : "Vous"})</span>
                      <span>{new Date(m.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.attachments?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {m.attachments.map((a, i) => (
                          <a key={i} href={a.data_uri} target="_blank" rel="noreferrer" className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border hover:shadow">
                            <Paperclip className="h-3 w-3 inline mr-1" />Pièce jointe {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "closed" && (
                <div className="space-y-2 pt-3 border-t">
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={3}
                    data-testid="reply-textarea"
                  />
                  <div className="flex justify-between gap-2">
                    <Button variant="outline" onClick={() => handleClose(selectedTicket.id)} data-testid="close-ticket-btn">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Fermer le ticket
                    </Button>
                    <Button onClick={handleReply} disabled={submitting || !newReply.trim()} data-testid="send-reply-btn">
                      <Send className="h-4 w-4 mr-1" /> Envoyer
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportCenter;
