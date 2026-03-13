import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, ArrowRight, Download, Home } from "lucide-react";
import api from "../services/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order");
  const pkg = searchParams.get("pkg") || "";
  const amount = searchParams.get("amount") || "0";
  const days = searchParams.get("days") || "30";
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/payments/check-status/${orderId}`)
        .then(res => setPaymentInfo(res.data))
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-slide-in p-4" data-testid="payment-success-page">
      <Card className="glass-card max-w-lg w-full overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
        <CardContent className="p-8 text-center">
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative h-24 w-24 rounded-full bg-emerald-900/40 ring-2 ring-emerald-500/40 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 font-[Manrope]">
            Merci pour votre paiement !
          </h1>
          <p className="text-slate-400 mb-6">
            Votre abonnement a ete active avec succes. Profitez de toutes les fonctionnalites premium d'AGRICAM IA.
          </p>

          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-800/30 mb-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Forfait</span>
              <span className="text-sm font-semibold text-emerald-400">{pkg || "Premium"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Montant</span>
              <span className="text-sm font-semibold text-white">{parseInt(amount).toLocaleString()} XAF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-400">Duree</span>
              <span className="text-sm font-semibold text-white">{days} jours</span>
            </div>
            {orderId && (
              <div className="flex justify-between pt-2 border-t border-emerald-800/20">
                <span className="text-sm text-slate-400">Reference</span>
                <span className="text-xs font-mono text-slate-500">{orderId}</span>
              </div>
            )}
            {paymentInfo?.status && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Statut</span>
                <span className="text-sm font-semibold text-emerald-400">Confirme</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Un message de confirmation a ete envoye sur votre numero de telephone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 gap-2"
              onClick={() => navigate("/dashboard")}
              data-testid="go-to-dashboard-btn"
            >
              <Home className="h-4 w-4" /> Tableau de bord
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-slate-700 text-slate-400 gap-2"
              onClick={() => navigate("/paiements")}
              data-testid="payment-history-btn"
            >
              <Download className="h-4 w-4" /> Historique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
