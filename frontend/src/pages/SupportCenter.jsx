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
import { LifeBuoy, Plus, Send, Paperclip, Clock, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

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

const SupportCenter = () => {
  const { t } = useLanguage();
  const STATUS_LABELS = {
    open: t("support.statuses.open"),
    in_progress: t("support.statuses.in_progress"),
    resolved: t("support.statuses.resolved"),
    closed: t("support.statuses.closed"),
  };
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
      toast.error(t("support.errorLoad"));
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
      toast.error(t("support.errorSubject"));
      return;
    }
    if (!form.message.trim() || form.message.length < 10) {
      toast.error(t("support.errorMessage"));
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
      toast.error(err?.response?.data?.detail || t("support.errorCreate"));
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    try {
      const res = await api.get(`/support/tickets/${ticket.id}`);
      setSelectedTicket(res.data);
    } catch (err) {
      toast.error(t("support.errorLoad"));
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
      toast.success(t("support.messageSent"));
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("support.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (ticketId) => {
    try {
      await api.post(`/support/tickets/${ticketId}/close`);
      toast.success(t("support.ticketClosed"));
      setSelectedTicket(null);
      fetchData();
    } catch {
      toast.error(t("support.errorGeneric"));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-lime-500" /></div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-full overflow-x-hidden" data-testid="support-page">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
            <LifeBuoy className="h-7 w-7 sm:h-8 sm:w-8 text-lime-500" />
            {t("support.title")}
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">{t("support.subtitle")}</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-lime-600 hover:bg-lime-700" data-testid="create-ticket-btn">
              <Plus className="h-4 w-4 mr-2" /> {t("support.newTicket")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("support.createTicket")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("support.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="ticket-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("support.priority")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger data-testid="ticket-priority-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => <SelectItem key={p.id} value={p.id}>{p.label} ({t("support.slaHours")} {p.sla_hours}{t("support.hours")})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("support.subject")}</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t("support.subjectPlaceholder")}
                  data-testid="ticket-subject-input"
                  maxLength={200}
                />
              </div>
              <div>
                <Label>{t("support.message")}</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t("support.messagePlaceholder")}
                  rows={6}
                  data-testid="ticket-message-input"
                  maxLength={5000}
                />
                <p className="text-xs text-slate-500 mt-1">{form.message.length} / 5000</p>
              </div>
              <div>
                <Label>{t("support.attachments")}</Label>
                <Input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} data-testid="ticket-attachments-input" />
                {attachments.length > 0 && <p className="text-xs text-emerald-600 mt-1">{attachments.length} {t("support.filesReady")}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>{t("support.cancel")}</Button>
                <Button onClick={handleCreate} disabled={submitting} className="bg-lime-600 hover:bg-lime-700" data-testid="ticket-submit-btn">
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {t("support.send")}
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
            <p className="text-lg">{t("support.noTickets")}</p>
            <p className="text-sm">{t("support.noTicketsCta")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3" data-testid="tickets-list">
          {tickets.map((ti) => (
            <Card key={ti.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTicket(ti)} data-testid={`ticket-${ti.ticket_number}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">{ti.ticket_number}</Badge>
                      <Badge className={`${PRIORITY_COLORS[ti.priority]} text-white text-xs`}>{ti.priority}</Badge>
                      <Badge className={`${STATUS_COLORS[ti.status]} text-white text-xs`}>{STATUS_LABELS[ti.status]}</Badge>
                    </div>
                    <p className="font-semibold mt-2 truncate">{ti.subject}</p>
                    <p className="text-sm text-slate-500 mt-1">{ti.category_label} • {ti.messages?.length || 1} {t("support.messagesCount")}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(ti.created_at).toLocaleDateString()}
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
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1 flex-wrap gap-1">
                      <span className="font-medium">{m.author_name} ({m.author_role === "admin" ? t("support.supportLabel") : t("support.youLabel")})</span>
                      <span>{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    {m.attachments?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {m.attachments.map((a, i) => (
                          <a key={i} href={a.data_uri} target="_blank" rel="noreferrer" className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border hover:shadow">
                            <Paperclip className="h-3 w-3 inline mr-1" />{t("support.attachmentLabel")} {i + 1}
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
                    placeholder={t("support.yourReply")}
                    rows={3}
                    data-testid="reply-textarea"
                  />
                  <div className="flex justify-between gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => handleClose(selectedTicket.id)} data-testid="close-ticket-btn">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> {t("support.closeTicket")}
                    </Button>
                    <Button onClick={handleReply} disabled={submitting || !newReply.trim()} data-testid="send-reply-btn">
                      <Send className="h-4 w-4 mr-1" /> {t("support.sendReply")}
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
