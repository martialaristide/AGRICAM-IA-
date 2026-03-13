import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  CreditCard, Smartphone, CheckCircle, XCircle, Clock,
  ArrowRight, Shield, Zap, Loader2, ArrowLeft, History
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const MobileMoneyPayment = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("mtn_cm");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select"); // select, pay, processing
  const [orderId, setOrderId] = useState(null);
  const [history, setHistory] = useState([]);
  const [subStatus, setSubStatus] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchHistory();
    fetchSubStatus();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get("/payments/packages");
      setPackages(res.data.packages || []);
    } catch { setPackages(defaultPackages); }
  };

  const fetchHistory = async () => {
    try { const res = await api.get("/payments/history"); setHistory(res.data.payments || []); } catch {}
  };

  const fetchSubStatus = async () => {
    try { const res = await api.get("/payments/subscription-status"); setSubStatus(res.data); } catch {}
  };

  const defaultPackages = [
    { id: "basic_monthly", amount: 5000, days: 30, type: "basic", label: "Basic Mensuel" },
    { id: "premium_monthly", amount: 15000, days: 30, type: "premium", label: "Premium Mensuel" },
  ];

  const handlePay = async () => {
    if (!phone || phone.length < 9) { toast.error("Numero de telephone invalide"); return; }
    if (!selectedPkg) { toast.error("Selectionnez un forfait"); return; }
    setLoading(true);
    setStep("processing");
    try {
      const methodType = provider === "orange_cm" ? "ORANGE_MONEY" : "MOMO";
      const res = await api.post("/payments/request-payment", {
        amount: selectedPkg.amount,
        phone_number: phone,
        method: "MOBILE_MONEY",
        method_type: methodType,
        provider,
        package_id: selectedPkg.id,
      });
      if (res.data.success) {
        setOrderId(res.data.order_id);
        toast.info("Validez le paiement sur votre telephone");
        // Poll for status
        setTimeout(() => checkStatus(res.data.order_id), 5000);
      } else {
        navigate(`/paiement-echec?reason=unknown`);
        toast.error("Echec de l'initiation du paiement");
      }
    } catch (e) {
      navigate(`/paiement-echec?reason=network`);
      toast.error("Erreur de paiement");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (oid) => {
    try {
      const res = await api.get(`/payments/check-status/${oid}`);
      if (res.data.status === "success") {
        toast.success("Paiement confirme !");
        navigate(`/paiement-succes?order=${oid}&pkg=${encodeURIComponent(selectedPkg?.label || "")}&amount=${selectedPkg?.amount || 0}&days=${selectedPkg?.days || 30}`);
      } else if (res.data.status === "failed") {
        navigate(`/paiement-echec?order=${oid}&reason=unknown`);
      } else {
        // Still processing, check again
        setTimeout(() => checkStatus(oid), 5000);
      }
    } catch {
      navigate(`/paiement-echec?order=${oid}&reason=network`);
    }
  };

  // Processing
  if (step === "processing") return (
    <div className="flex items-center justify-center min-h-[60vh] animate-slide-in" data-testid="payment-processing">
      <Card className="glass-card max-w-md w-full">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 text-emerald-400 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2">Paiement en cours...</h2>
          <p className="text-slate-400 mb-4">Validez la transaction sur votre telephone mobile.</p>
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
            <p className="text-sm text-amber-400">Composez *126# ou validez la notification push</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-in" data-testid="payment-page">
      <div className="gradient-marketplace rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
              <CreditCard className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-[Manrope]">Abonnement & Paiement</h1>
              <p className="text-slate-400">MTN Mobile Money - Orange Money - NetWallet Pay</p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-700 text-slate-400 gap-2" onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4" /> Historique
          </Button>
        </div>
      </div>

      {/* Current subscription status */}
      {subStatus && (
        <Card className="glass-card neon-border-green">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <div>
                <span className="text-sm text-slate-400">Statut: </span>
                <Badge className={cn("ml-1", subStatus.has_full_access ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                  {subStatus.is_subscribed ? `${subStatus.subscription_type} actif` : subStatus.is_trial_active ? "Essai gratuit" : "Expire"}
                </Badge>
              </div>
            </div>
            {subStatus.days_remaining > 0 && (
              <span className="text-sm text-slate-400">{subStatus.days_remaining} jours restants</span>
            )}
          </CardContent>
        </Card>
      )}

      {showHistory ? (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white">Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {history.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Aucun paiement</p>
            ) : (
              <div className="divide-y divide-slate-800/30">
                {history.map((p, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{p.package_id} - {p.amount?.toLocaleString()} XAF</p>
                      <p className="text-xs text-slate-500">{p.phone} - {new Date(p.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <Badge className={cn(p.status === "success" ? "bg-emerald-500" : p.status === "failed" ? "bg-red-500" : "bg-amber-500", "text-white")}>
                      {p.status === "success" ? "Confirme" : p.status === "failed" ? "Echoue" : "En cours"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : step === "select" ? (
        <>
          {/* Package Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            {(packages.length > 0 ? packages : defaultPackages).map(pkg => (
              <Card key={pkg.id}
                className={cn("glass-card cursor-pointer transition-all hover:-translate-y-1",
                  selectedPkg?.id === pkg.id ? "neon-border-green ring-1 ring-emerald-500/30" : "hover:border-emerald-500/20")}
                onClick={() => setSelectedPkg(pkg)} data-testid={`pkg-${pkg.id}`}>
                <CardContent className="p-6 text-center">
                  {pkg.type === "premium" && <Badge className="bg-violet-600 text-white text-xs mb-2">Populaire</Badge>}
                  <h3 className="text-lg font-bold text-white mb-1">{pkg.label}</h3>
                  <p className="text-3xl font-bold text-emerald-400">{pkg.amount?.toLocaleString()} <span className="text-sm text-slate-500">XAF</span></p>
                  <p className="text-xs text-slate-500 mt-1">{pkg.days} jours</p>
                  {selectedPkg?.id === pkg.id && <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mt-2" />}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPkg && (
            <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              onClick={() => setStep("pay")} data-testid="proceed-to-pay">
              Continuer vers le paiement <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        /* Payment Form */
        <Card className="glass-card max-w-md mx-auto">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" /> Paiement Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30 mb-4">
              <p className="text-sm text-emerald-400 text-center">
                {selectedPkg?.label} - <strong>{selectedPkg?.amount?.toLocaleString()} XAF</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Operateur</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="bg-[#0f1729] border-slate-800 text-white" data-testid="provider-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-slate-700">
                  <SelectItem value="mtn_cm">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange_cm">Orange Money</SelectItem>
                  <SelectItem value="netwallet_cm">Netwallet Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400">Numero de telephone</Label>
              <Input
                placeholder="6XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-[#0f1729] border-slate-800 text-white"
                data-testid="phone-input"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 border-slate-700 text-slate-400" onClick={() => setStep("select")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 gap-2" onClick={handlePay} disabled={loading} data-testid="pay-now-btn">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Payer {selectedPkg?.amount?.toLocaleString()} XAF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileMoneyPayment;
