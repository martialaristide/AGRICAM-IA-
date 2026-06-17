import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Check, X, Crown, Users, Building2, Sparkles, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

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

const Licensing = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [myLicense, setMyLicense] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscribing, setSubscribing] = useState(null);

  const formatFeature = (value) => {
    if (value === -1) return t("licensing.featureUnlimited");
    if (value === true) return t("licensing.featureIncluded");
    if (value === false) return t("licensing.featureExcluded");
    return value;
  };

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
      toast.error(t("licensing.errorLoad"));
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
        toast.success(t("licensing.freeActivated"));
        fetchAll();
      } else {
        toast.success(`${res.data.plan_name} - ${formatXAF(res.data.amount_xaf)}`, {
          description: t("licensing.gotoPay"),
          duration: 6000,
        });
        setTimeout(() => { window.location.href = "/paiements"; }, 2000);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("licensing.errorSubscribe"));
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
    <div className="space-y-6 p-4 lg:p-6 max-w-full overflow-x-hidden" data-testid="licensing-page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
          <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500" />
          {t("licensing.title")}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">{t("licensing.subtitle")}</p>
      </div>

      {/* Current license badge */}
      {myLicense && (
        <Card className="bg-gradient-to-r from-lime-500/10 to-amber-500/10 border-lime-500/30">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-slate-500">{t("licensing.currentPlan")}</p>
              <p className="text-xl font-bold text-lime-600 dark:text-lime-400" data-testid="current-plan-name">
                {myLicense.plan?.name || t("licensing.free")}
              </p>
            </div>
            <Badge className="text-base px-3 py-1" data-testid="current-plan-status">
              {myLicense.status === "active" ? `✓ ${t("licensing.active")}` : myLicense.status}
            </Badge>
            {myLicense.license?.end_date && (
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {t("licensing.expiresOn")} {new Date(myLicense.license.end_date).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={billingCycle} onValueChange={setBillingCycle}>
        <TabsList>
          <TabsTrigger value="monthly" data-testid="cycle-monthly">{t("licensing.monthly")}</TabsTrigger>
          <TabsTrigger value="annual" data-testid="cycle-annual">
            {t("licensing.annual")} <Badge className="ml-2 bg-amber-500 text-xs">{t("licensing.save30")}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={billingCycle} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      {isCurrent && <Badge className="bg-lime-500">{t("licensing.current")}</Badge>}
                    </div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-2xl sm:text-3xl font-bold mt-2">
                      {price === 0 ? t("licensing.free") : formatXAF(price)}
                    </p>
                    {price > 0 && (
                      <p className="text-xs text-slate-500">
                        / {billingCycle === "annual" ? t("licensing.perYear") : t("licensing.perMonth")}
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
                            <span className="font-medium">{t(`licensing.features.${k}`) !== `licensing.features.${k}` ? t(`licensing.features.${k}`) : k}</span>
                            {v !== false && v !== true && (
                              <span className="text-slate-400"> · {formatFeature(v)}</span>
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
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("licensing.processing")}</>
                      ) : isCurrent ? (
                        t("licensing.planCurrent")
                      ) : plan.id === "free" ? (
                        t("licensing.activate")
                      ) : (
                        t("licensing.subscribe")
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
            <CardTitle>{t("licensing.historyTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 10).map((lic) => (
                <div key={lic.id} className="flex items-center justify-between p-3 border rounded-md flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{lic.plan_id}</p>
                    <p className="text-xs text-slate-500">{new Date(lic.created_at).toLocaleString()}</p>
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
