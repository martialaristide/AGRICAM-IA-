import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Settings, User, Bell, Shield, Database, 
  Wifi, Plane, Key, Globe, Save, CreditCard,
  CheckCircle, Sparkles, Crown, Star, Loader2,
  AlertCircle, RefreshCw, Upload, FileText
} from "lucide-react";
import { useAuth } from "../App";
import api from "../services/api";
import { toast } from "sonner";

const SUBSCRIPTION_PLANS = [
  {
    id: "freemium",
    name: "Freemium",
    price: 0,
    currency: "XAF",
    period: "gratuit",
    features: [
      "1 parcelle maximum",
      "Alertes basiques",
      "Consultation marketplace",
      "Support communautaire"
    ],
    icon: Star,
    color: "border-slate-200 bg-slate-50"
  },
  {
    id: "basic",
    name: "Basic",
    price: 5000,
    currency: "XAF",
    period: "/mois",
    packages: {
      monthly: "basic_monthly",
      quarterly: "basic_quarterly",
      annual: "basic_annual"
    },
    features: [
      "Jusqu'à 3 parcelles",
      "Météo avancée",
      "Recommandations IA basiques",
      "Support email",
      "Export données CSV"
    ],
    icon: Sparkles,
    color: "border-emerald-200 bg-emerald-50",
    popular: false
  },
  {
    id: "premium",
    name: "Premium",
    price: 15000,
    currency: "XAF",
    period: "/mois",
    packages: {
      monthly: "premium_monthly",
      quarterly: "premium_quarterly",
      annual: "premium_annual"
    },
    features: [
      "Parcelles illimitées",
      "IoT & Drones intégrés",
      "IA avancée (analyse images)",
      "Chatbot AgriBot illimité",
      "Support 24/7 prioritaire",
      "API access",
      "Mode hors ligne (PWA)"
    ],
    icon: Crown,
    color: "border-violet-200 bg-violet-50",
    popular: true
  }
];

const Parametres = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [profile, setProfile] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  // Check payment status on return from Stripe
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const paymentStatus = searchParams.get("payment");

    if (sessionId && paymentStatus === "success") {
      pollPaymentStatus(sessionId);
    } else if (paymentStatus === "cancelled") {
      toast.error("Paiement annulé");
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      toast.info("Vérification du paiement en cours. Veuillez patienter...");
      return;
    }

    setCheckingPayment(true);

    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      
      if (response.data.payment_status === "paid") {
        toast.success("Paiement réussi! Votre abonnement est activé. 🎉");
        setCheckingPayment(false);
        // Refresh user data
        window.location.reload();
        return;
      } else if (response.data.status === "expired") {
        toast.error("Session de paiement expirée. Veuillez réessayer.");
        setCheckingPayment(false);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error("Error checking payment:", error);
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.id === "freemium") return;

    const packageId = plan.packages?.[billingPeriod];
    if (!packageId) {
      toast.error("Package non disponible");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/payments/create-checkout?package_id=${packageId}`);
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else if (response.data.demo) {
        toast.info("Mode démo: Paiement Stripe non configuré");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erreur lors de la création du paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    toast.success("Profil sauvegardé");
  };

  const getPriceByPeriod = (plan) => {
    if (plan.id === "freemium") return { price: 0, period: "gratuit" };
    
    const multiplier = billingPeriod === "quarterly" ? 3 : billingPeriod === "annual" ? 12 : 1;
    const discount = billingPeriod === "quarterly" ? 0.9 : billingPeriod === "annual" ? 0.8 : 1;
    
    return {
      price: Math.round(plan.price * multiplier * discount),
      period: billingPeriod === "monthly" ? "/mois" : billingPeriod === "quarterly" ? "/trimestre" : "/an"
    };
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="parametres-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Paramètres</h1>
        </div>
        <p className="text-white/80">Configuration de votre compte et de la plateforme</p>
      </div>

      {/* Payment Status Check */}
      {checkingPayment && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Vérification du paiement en cours...</p>
                <p className="text-sm text-emerald-600">Veuillez patienter, nous confirmons votre abonnement.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="settings">Préférences</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-800">Votre abonnement actuel</CardTitle>
                  <CardDescription>
                    Plan {user?.subscription_type?.toUpperCase() || "FREEMIUM"}
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-600 text-white px-4 py-2 text-lg">
                  {user?.subscription_type?.toUpperCase() || "FREEMIUM"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Billing Period Selector */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "outline"}
              onClick={() => setBillingPeriod("monthly")}
              className={billingPeriod === "monthly" ? "bg-emerald-600" : ""}
            >
              Mensuel
            </Button>
            <Button
              variant={billingPeriod === "quarterly" ? "default" : "outline"}
              onClick={() => setBillingPeriod("quarterly")}
              className={billingPeriod === "quarterly" ? "bg-emerald-600" : ""}
            >
              Trimestriel
              <Badge className="ml-2 bg-amber-500">-10%</Badge>
            </Button>
            <Button
              variant={billingPeriod === "annual" ? "default" : "outline"}
              onClick={() => setBillingPeriod("annual")}
              className={billingPeriod === "annual" ? "bg-emerald-600" : ""}
            >
              Annuel
              <Badge className="ml-2 bg-emerald-500">-20%</Badge>
            </Button>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const { price, period } = getPriceByPeriod(plan);
              const isCurrentPlan = user?.subscription_type === plan.id;
              const PlanIcon = plan.icon;

              return (
                <Card 
                  key={plan.id}
                  className={`relative ${plan.color} ${plan.popular ? "ring-2 ring-violet-500" : ""}`}
                  data-testid={`plan-${plan.id}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-violet-600 text-white px-4">Plus populaire</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${
                      plan.id === "freemium" ? "bg-slate-200" :
                      plan.id === "basic" ? "bg-emerald-200" : "bg-violet-200"
                    }`}>
                      <PlanIcon className={`h-8 w-8 ${
                        plan.id === "freemium" ? "text-slate-600" :
                        plan.id === "basic" ? "text-emerald-600" : "text-violet-600"
                      }`} />
                    </div>
                    <CardTitle className="text-xl mt-4">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{price.toLocaleString()}</span>
                      <span className="text-slate-500 ml-1">{plan.currency} {period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Plan actuel
                      </Button>
                    ) : plan.id === "freemium" ? (
                      <Button disabled className="w-full" variant="outline">
                        Plan gratuit
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${plan.popular ? "bg-violet-600 hover:bg-violet-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading}
                        data-testid={`subscribe-${plan.id}`}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Souscrire
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Profil utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input 
                    id="name" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    data-testid="input-name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    data-testid="input-email" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    data-testid="input-phone" 
                  />
                </div>
                <Button className="w-full" onClick={handleSaveProfile} data-testid="save-profile">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card data-testid="notifications-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertes email</p>
                    <p className="text-sm text-slate-500">Recevoir les alertes par email</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertes SMS</p>
                    <p className="text-sm text-slate-500">Recevoir les alertes par SMS (Twilio)</p>
                  </div>
                  <Switch data-testid="switch-sms" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications push</p>
                    <p className="text-sm text-slate-500">Notifications dans l'application</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-push" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rapport hebdomadaire</p>
                    <p className="text-sm text-slate-500">Recevoir un résumé chaque semaine</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-weekly" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="security-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentification 2FA</p>
                    <p className="text-sm text-slate-500">Double authentification</p>
                  </div>
                  <Switch data-testid="switch-2fa" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Connexion biométrique</p>
                    <p className="text-sm text-slate-500">Face ID / Empreinte digitale</p>
                  </div>
                  <Switch data-testid="switch-biometric" />
                </div>
                <Button variant="outline" className="w-full" data-testid="change-password">
                  <Key className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card data-testid="documents-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  Documents d'identité
                </CardTitle>
                <CardDescription>
                  Vos documents CNI/Passeport pour la vérification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    Glissez-déposez ou cliquez pour uploader
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    CNI ou Passeport (JPG, PNG, PDF)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {user?.is_verified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600">Documents vérifiés</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600">En attente de vérification</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment */}
            <Card data-testid="equipment-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-violet-600" />
                  Équipements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Capteurs IoT</p>
                      <p className="text-sm text-slate-500">5 capteurs connectés</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" data-testid="manage-sensors">Gérer</Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className="h-5 w-5 text-violet-600" />
                    <div>
                      <p className="font-medium">Drones</p>
                      <p className="text-sm text-slate-500">2 drones configurés</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" data-testid="manage-drones">Gérer</Button>
                </div>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card data-testid="language-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-600" />
                  Langue et région
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <select className="w-full p-2 border rounded-lg" data-testid="select-language">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuseau horaire</Label>
                    <select className="w-full p-2 border rounded-lg" data-testid="select-timezone">
                      <option value="europe/paris">Europe/Paris (UTC+1)</option>
                      <option value="africa/dakar">Africa/Dakar (UTC+0)</option>
                      <option value="africa/abidjan">Africa/Abidjan (UTC+0)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unités</Label>
                    <select className="w-full p-2 border rounded-lg" data-testid="select-units">
                      <option value="metric">Métrique (ha, °C, L)</option>
                      <option value="imperial">Impérial (acres, °F, gal)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Parametres;
