import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Check, X, Crown, Users, Building2, Sparkles, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formatXAF = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const PLAN_ICONS = {
  free: Sparkles,
  premium_farmer: Crown,
  cooperative: Users,
  enterprise: Building2,
};

const PLAN_COLORS = {
  free: "from-slate-500 to-slate-600",
  premium_farmer: "from-lime-500 to-amber-500",
  cooperative: "from-blue-500 to-purple-500",
  enterprise: "from-amber-500 to-rose-500",
};

const FEATURE_LABELS = {
  ai_analyses_per_month: "Analyses IA par mois",
  history_days: "Historique (jours)",
  max_parcels: "Nombre de parcelles",
  drone_missions: "Missions drone",
  api_access: "Accès API",
  priority_support: "Support prioritaire",
  multi_user: "Multi-utilisateurs",
  max_members: "Nombre de membres",
  white_label: "White label",
};

const formatFeature = (key, value) => {
  if (value === -1) return "Illimité";
  if (value === true) return "Inclus";
  if (value === false) return "Non inclus";
  return value;
};

const Licensing = () => {
  const [plans, setPlans] = useState([]);
  const [myLicense, setMyLicense] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [plansRes, myRes, histRes] = await Promise.all([
        api.get("/licensing/plans"),
        api.get("/licensing/my-license").catch(() => ({ data: null })),
        api.get("/licensing/history").catch(() => ({ data: { licenses: [] } })),
      ]);
      setPlans(plansRes.data.plans);
      setMyLicense(myRes.data);
      setHistory(histRes.data.licenses);
    } catch (err) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const res = await api.post("/licensing/subscribe", {
        plan_id: planId,
        billing_cycle: billingCycle,
      });
      if (planId === "free") {
        toast.success("Plan Gratuit activé !");
        fetchAll();
      } else {
        toast.success(`${res.data.plan_name} - ${formatXAF(res.data.amount_xaf)}`, {
          description: "Rendez-vous sur la page Paiements pour finaliser via Mobile Money.",
          duration: 6000,
        });
        // Optionally redirect to /paiements
        setTimeout(() => { window.location.href = "/paiements"; }, 2000);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'abonnement");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6" data-testid="licensing-page">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="h-8 w-8 text-amber-500" />
          Plans & Licences
        </h1>
        <p className="text-slate-500 mt-1">Choisissez le plan qui correspond à votre activité agricole</p>
      </div>

      {/* Current license badge */}
      {myLicense && (
        <Card className="bg-gradient-to-r from-lime-500/10 to-amber-500/10 border-lime-500/30">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-slate-500">Votre plan actuel</p>
              <p className="text-xl font-bold text-lime-600 dark:text-lime-400" data-testid="current-plan-name">
                {myLicense.plan?.name || "Gratuit"}
              </p>
            </div>
            <Badge className="text-base px-3 py-1" data-testid="current-plan-status">
              {myLicense.status === "active" ? "✓ Actif" : myLicense.status}
            </Badge>
            {myLicense.license?.end_date && (
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expire le {new Date(myLicense.license.end_date).toLocaleDateString("fr-FR")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={billingCycle} onValueChange={setBillingCycle}>
        <TabsList>
          <TabsTrigger value="monthly" data-testid="cycle-monthly">Mensuel</TabsTrigger>
          <TabsTrigger value="annual" data-testid="cycle-annual">
            Annuel <Badge className="ml-2 bg-amber-500 text-xs">-30%</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={billingCycle} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.id] || Sparkles;
              const isCurrent = myLicense?.plan?.id === plan.id && myLicense?.status === "active";
              const price = billingCycle === "annual" ? plan.price_annual_xaf : plan.price_monthly_xaf;
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all hover:shadow-xl ${isCurrent ? "ring-2 ring-lime-500" : ""}`}
                  data-testid={`plan-${plan.id}`}
                >
                  <div className={`h-2 bg-gradient-to-r ${PLAN_COLORS[plan.id]}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-amber-500" />
                      {isCurrent && <Badge className="bg-lime-500">Actuel</Badge>}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-3xl font-bold mt-2">
                      {price === 0 ? "Gratuit" : formatXAF(price)}
                    </p>
                    {price > 0 && (
                      <p className="text-xs text-slate-500">
                        / {billingCycle === "annual" ? "an" : "mois"}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm mb-4">
                      {Object.entries(plan.features).slice(0, 6).map(([k, v]) => (
                        <li key={k} className="flex items-start gap-2">
                          {v === false ? (
                            <X className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Check className="h-4 w-4 text-lime-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-slate-600 dark:text-slate-300">
                            <span className="font-medium">{FEATURE_LABELS[k] || k}</span>
                            {v !== false && v !== true && (
                              <span className="text-slate-400"> · {formatFeature(k, v)}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || subscribing === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                      data-testid={`subscribe-${plan.id}`}
                    >
                      {subscribing === plan.id ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Traitement...</>
                      ) : isCurrent ? (
                        "Plan actuel"
                      ) : plan.id === "free" ? (
                        "Activer"
                      ) : (
                        "S'abonner"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 10).map((lic) => (
                <div key={lic.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{lic.plan_id}</p>
                    <p className="text-xs text-slate-500">{new Date(lic.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{lic.status}</Badge>
                    {lic.amount_xaf > 0 && <p className="text-sm mt-1">{formatXAF(lic.amount_xaf)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Licensing;
