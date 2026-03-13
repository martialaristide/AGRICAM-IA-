import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason") || "unknown";
  const orderId = searchParams.get("order") || "";

  const reasonMessages = {
    insufficient_funds: "Solde insuffisant sur votre compte mobile money.",
    timeout: "La transaction a expire. Vous n'avez pas valide a temps.",
    cancelled: "La transaction a ete annulee.",
    network: "Erreur reseau. Verifiez votre connexion internet.",
    unknown: "Une erreur inattendue s'est produite lors du paiement.",
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-slide-in p-4" data-testid="payment-failure-page">
      <Card className="glass-card max-w-lg w-full overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardContent className="p-8 text-center">
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="relative h-24 w-24 rounded-full bg-red-900/40 ring-2 ring-red-500/40 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 font-[Manrope]">
            Paiement echoue
          </h1>
          <p className="text-slate-400 mb-6">
            {reasonMessages[reason] || reasonMessages.unknown}
          </p>

          <div className="p-5 rounded-xl bg-red-950/30 border border-red-800/30 mb-6 text-left">
            <p className="text-sm font-medium text-red-400 mb-3">Causes possibles :</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                Solde insuffisant sur votre compte
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                Transaction refusee par l'operateur
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                Numero de telephone incorrect
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                Delai de validation expire
              </li>
            </ul>
            {orderId && (
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-red-800/20">
                Reference : {orderId}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 gap-2"
              onClick={() => navigate("/paiements")}
              data-testid="retry-payment-btn"
            >
              <RefreshCw className="h-4 w-4" /> Reessayer
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-slate-700 text-slate-400 gap-2"
              onClick={() => navigate("/dashboard")}
              data-testid="go-back-dashboard-btn"
            >
              <ArrowLeft className="h-4 w-4" /> Tableau de bord
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Besoin d'aide ? Contactez le support a support@agricam.ai
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;
