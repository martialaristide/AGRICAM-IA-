import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Smartphone, CreditCard, CheckCircle, Clock,
  Phone, Wallet, ArrowRight, Shield, RefreshCw,
  DollarSign, History, AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const MobileMoneyPayment = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    phone_number: "",
    amount_xaf: "",
    description: "Abonnement AGRICAM IA"
  });

  const providers = [
    {
      id: "orange_money",
      name: "Orange Money",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      logo: "🟠",
      merchant: "698226903",
      ussd: "#150*1*1#"
    },
    {
      id: "mtn_momo",
      name: "MTN Mobile Money",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      logo: "🟡",
      merchant: "653722443",
      ussd: "*126#"
    }
  ];

  const subscriptionPlans = [
    { id: "basic", name: "Basic", price: 5000, duration: "1 mois" },
    { id: "premium", name: "Premium", price: 15000, duration: "1 mois" },
    { id: "premium_annual", name: "Premium Annuel", price: 150000, duration: "12 mois" }
  ];

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get("/payment/history");
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!paymentForm.phone_number || !paymentForm.amount_xaf || !selectedProvider) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post("/payment/mobile-money", {
        phone_number: paymentForm.phone_number,
        amount_xaf: parseInt(paymentForm.amount_xaf),
        provider: selectedProvider.id,
        description: paymentForm.description
      });

      setPaymentInstructions(response.data);
      toast.success("Demande de paiement initiée");
    } catch (error) {
      toast.error("Erreur lors de l'initiation du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      await api.post(`/payment/verify/${paymentId}`);
      toast.success("Paiement vérifié et confirmé!");
      fetchPaymentHistory();
      setPaymentInstructions(null);
      setShowPayDialog(false);
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="h-3 w-3 mr-1" /> Complété</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case "failed":
        return <Badge className="bg-rose-100 text-rose-700"><AlertCircle className="h-3 w-3 mr-1" /> Échoué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="mobile-money-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Paiement Mobile Money</h1>
            </div>
            <p className="text-white/80">Orange Money & MTN Mobile Money - Cameroun</p>
          </div>
          
          <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
            <ActionTooltip content="Effectuer un nouveau paiement">
              <DialogTrigger asChild>
                <Button className="bg-white text-orange-600 hover:bg-white/90 mt-4 md:mt-0">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Nouveau paiement
                </Button>
              </DialogTrigger>
            </ActionTooltip>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-orange-600" />
                  Paiement Mobile Money
                </DialogTitle>
              </DialogHeader>
              
              {!paymentInstructions ? (
                <div className="space-y-6">
                  {/* Provider Selection */}
                  <div>
                    <Label className="mb-3 block">Choisir le moyen de paiement</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {providers.map((provider) => (
                        <div
                          key={provider.id}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedProvider?.id === provider.id 
                              ? `border-${provider.id === 'orange_money' ? 'orange' : 'yellow'}-500 ${provider.bgColor}`
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <div className="text-center">
                            <span className="text-3xl">{provider.logo}</span>
                            <p className={cn("font-semibold mt-2", provider.textColor)}>{provider.name}</p>
                            <p className="text-xs text-slate-500 mt-1">N°: {provider.merchant}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Amount Selection */}
                  <div>
                    <Label className="mb-3 block">Abonnement</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {subscriptionPlans.map((plan) => (
                        <Button
                          key={plan.id}
                          variant={paymentForm.amount_xaf === String(plan.price) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaymentForm({ 
                            ...paymentForm, 
                            amount_xaf: String(plan.price),
                            description: `Abonnement ${plan.name}`
                          })}
                          className="flex-col h-auto py-3"
                        >
                          <span className="font-bold">{plan.name}</span>
                          <span className="text-xs">{plan.price.toLocaleString()} XAF</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label>Numéro de téléphone</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 bg-slate-100 rounded-lg text-sm">+237</span>
                      <Input
                        value={paymentForm.phone_number}
                        onChange={(e) => setPaymentForm({ ...paymentForm, phone_number: e.target.value })}
                        placeholder="6XX XXX XXX"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>Montant (XAF)</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount_xaf}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount_xaf: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  {/* Submit */}
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleInitiatePayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Continuer
                  </Button>
                </div>
              ) : (
                /* Payment Instructions */
                <div className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Demande initiée</span>
                    </div>
                    <p className="text-sm text-emerald-700">Référence: <strong>{paymentInstructions.reference}</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3">Instructions de paiement:</h4>
                    <div className="space-y-2 text-sm">
                      {paymentInstructions.instructions?.split('\n').map((line, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold">{idx + 1}.</span>
                          {line.replace(/^\d+\.\s*/, '')}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Numéro marchand:</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{paymentInstructions.merchant_number}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPaymentInstructions(null)}
                    >
                      Retour
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleVerifyPayment(paymentInstructions.payment_id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      J'ai payé
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className={cn("overflow-hidden", provider.bgColor)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-4xl", provider.color)}>
                  {provider.logo}
                </div>
                <div>
                  <h3 className={cn("text-xl font-bold", provider.textColor)}>{provider.name}</h3>
                  <p className="text-sm text-slate-600">Cameroun</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm">Numéro marchand</span>
                  <span className="font-bold">{provider.merchant}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm">Code USSD</span>
                  <span className="font-mono font-bold">{provider.ussd}</span>
                </div>
              </div>

              <Button 
                className={cn("w-full mt-4", provider.color, "hover:opacity-90")}
                onClick={() => { setSelectedProvider(provider); setShowPayDialog(true); }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payer avec {provider.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-xl",
                      payment.provider === "orange_money" ? "bg-orange-100" : "bg-yellow-100"
                    )}>
                      {payment.provider === "orange_money" ? "🟠" : "🟡"}
                    </div>
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-xs text-slate-500">
                        {payment.phone_number} • {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{payment.amount_xaf?.toLocaleString()} XAF</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun paiement effectué</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Paiements sécurisés</h3>
              <p className="text-slate-700 mt-1">
                Vos transactions sont sécurisées via les plateformes officielles:
              </p>
              <ul className="mt-2 text-sm text-slate-600 space-y-1">
                <li>• Orange Money Cameroun - N° marchand: <strong>698226903</strong></li>
                <li>• MTN Mobile Money - N° marchand: <strong>653722443</strong></li>
                <li>• Confirmations par SMS instantanées</li>
                <li>• Support client disponible 24/7</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileMoneyPayment;
