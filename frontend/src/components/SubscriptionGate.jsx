import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import {
  Lock, CreditCard, Clock, CheckCircle, AlertTriangle,
  Smartphone, ArrowRight, Shield, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const SubscriptionGate = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const res = await api.get("/user/subscription-status");
      setSubStatus(res.data);
    } catch {
      setSubStatus({ has_full_access: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Admin always has access
  if (user?.role === "admin" || subStatus?.has_full_access) {
    return <>{children}</>;
  }

  // Show subscription wall
  return (
    <div className="flex items-center justify-center min-h-[60vh]" data-testid="subscription-gate">
      <Card className="glass-card max-w-lg w-full mx-4">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-amber-900/30 ring-1 ring-amber-500/20 flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-[Manrope]">Abonnement requis</h2>

          {subStatus?.is_trial_active === false && subStatus?.is_subscribed === false && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
              <div className="flex items-center gap-2 justify-center text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Votre periode d'essai de 14 jours est terminee</span>
              </div>
            </div>
          )}

          <p className="text-slate-400 mb-6">
            Pour acceder a toutes les fonctionnalites avancees, veuillez souscrire a un abonnement.
          </p>

          <div className="space-y-3 mb-6 text-left">
            {[
              "Acces complet a AGRI GENIUS",
              "Analyse par camera et drone IA",
              "Gestion avancee des parcelles",
              "Marketplace et paiements",
              "Support prioritaire",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">{f}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-lg font-bold text-white">5 000 XAF</p>
              <p className="text-xs text-slate-500">Basic / mois</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
              <p className="text-lg font-bold text-emerald-400">15 000 XAF</p>
              <p className="text-xs text-slate-500">Premium / mois</p>
            </div>
          </div>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            onClick={() => navigate("/paiements")} data-testid="subscribe-btn">
            <CreditCard className="h-4 w-4" />
            S'abonner maintenant
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-xs text-slate-600 mt-3">Paiement securise via MTN/Orange Mobile Money</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGate;
