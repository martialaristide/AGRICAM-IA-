import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2, MessageCircle, Bell, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SEVERITY_STYLES = {
  info: "bg-emerald-500/20 text-emerald-400",
  attention: "bg-amber-500/20 text-amber-400",
  urgent: "bg-orange-500/20 text-orange-400",
  critique: "bg-red-500/20 text-red-400",
};

export default function ElevageAlerts({ refreshKey }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [waConfig, setWaConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/elevage/whatsapp/config").then((res) => setWaConfig(res.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/elevage/alerts");
      setAlerts(res.data.alerts);
    } catch {
      toast.error("Erreur de chargement des alertes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const acknowledge = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/elevage/alerts/${id}/acknowledge`);
      toast.success("Alerte acquittée");
      load();
    } catch {
      toast.error("Échec de l'acquittement");
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lime-400" /></div>;

  return (
    <div className="space-y-3" data-testid="elevage-alerts">
      {waConfig && (
        <div className={`rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${waConfig.configured ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`} data-testid="whatsapp-config-banner">
          <MessageCircle className="h-4 w-4 shrink-0" />
          {waConfig.configured
            ? `WhatsApp Business API connectée (${waConfig.provider}) — les alertes sont envoyées sur le téléphone de l'éleveur.`
            : "Mode simulation WhatsApp — ajoutez vos clés API (Meta Cloud ou Twilio) dans backend/.env pour l'envoi réel : WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID, ou TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM."}
        </div>
      )}
      {alerts.length === 0 && (
        <Card><CardContent className="p-8 text-center text-slate-400">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Aucune alerte — votre cheptel se porte bien.
        </CardContent></Card>
      )}
      {alerts.map((a) => (
        <Card
          key={a.id}
          data-testid={`alert-card-${a.severity}`}
          className={`cursor-pointer transition-colors ${!a.acknowledged_at ? "border-l-4" : "opacity-60"} ${
            a.severity === "critique" ? "border-l-red-500" : a.severity === "urgent" ? "border-l-orange-500" : a.severity === "attention" ? "border-l-amber-500" : "border-l-emerald-500"
          }`}
          onClick={() => setExpanded(expanded === a.id ? null : a.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge className={`border-0 text-[10px] uppercase ${SEVERITY_STYLES[a.severity]}`}>{a.severity}</Badge>
                  <span className="text-xs text-slate-500">{a.farm_name}</span>
                  <span className="text-xs text-slate-600">{new Date(a.created_at).toLocaleString("fr-FR")}</span>
                </div>
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.message}</p>
              </div>
              {!a.acknowledged_at ? (
                <Button size="sm" variant="outline" onClick={(e) => acknowledge(a.id, e)} data-testid={`alert-ack-btn`} className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Acquitter
                </Button>
              ) : (
                <span className="text-[11px] text-emerald-500 flex items-center gap-1 shrink-0"><CheckCircle2 className="h-3 w-3" />Acquittée</span>
              )}
            </div>

            {expanded === a.id && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl overflow-hidden border border-emerald-800/40" data-testid="whatsapp-preview">
                  <div className="bg-[#075e54] px-3 py-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-white" />
                    <p className="text-white text-xs font-semibold">Aperçu WhatsApp — tel qu'envoyé à l'éleveur</p>
                  </div>
                  <div className="bg-[#0b141a] p-3">
                    <div className="bg-[#005c4b] text-white text-xs rounded-lg rounded-tl-none p-3 max-w-md whitespace-pre-wrap leading-relaxed">
                      {a.whatsapp_preview}
                      <p className="text-right text-[10px] text-emerald-200/60 mt-1">{new Date(a.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ✓✓</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate("/agronomist"); }} className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10" data-testid="alert-consult-btn">
                    <LifeBuoy className="h-3.5 w-3.5 mr-1.5" />Consulter un agronome / vétérinaire
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Canal : WhatsApp (simulation) · Secours SMS automatique si pas de connexion data · Escalade auto si non acquittée sous 30 min
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
