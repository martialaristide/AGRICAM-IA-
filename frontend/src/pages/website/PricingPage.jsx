import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Check, X, HelpCircle, ArrowRight, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Pour les petits agriculteurs",
      price: billingPeriod === "monthly" ? "4 900" : "49 000",
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      savings: billingPeriod === "yearly" ? "2 mois offerts" : null,
      popular: false,
      features: [
        { name: "Jusqu'à 3 parcelles", included: true },
        { name: "AgriBot IA (50 requêtes/mois)", included: true },
        { name: "Capteurs IoT (5 max)", included: true },
        { name: "Alertes email", included: true },
        { name: "Support par email", included: true },
        { name: "Rapports PDF basiques", included: true },
        { name: "Gestion de drones", included: false },
        { name: "Contrôle de robots", included: false },
        { name: "Images satellites", included: false },
        { name: "API access", included: false }
      ],
      cta: "Commencer",
      ctaStyle: "outline"
    },
    {
      name: "Agriculteur",
      description: "Pour les exploitations familiales",
      price: billingPeriod === "monthly" ? "9 900" : "99 000",
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      savings: billingPeriod === "yearly" ? "2 mois offerts" : null,
      popular: false,
      features: [
        { name: "Jusqu'à 10 parcelles", included: true },
        { name: "AgriBot IA (200 requêtes/mois)", included: true },
        { name: "Capteurs IoT (20 max)", included: true },
        { name: "Alertes email et SMS", included: true },
        { name: "Support prioritaire", included: true },
        { name: "Rapports PDF/Excel", included: true },
        { name: "Gestion de 1 drone", included: true },
        { name: "Contrôle de robots", included: false },
        { name: "Images satellites (10/mois)", included: true },
        { name: "API access", included: false }
      ],
      cta: "Commencer",
      ctaStyle: "outline"
    },
    {
      name: "Professionnel",
      description: "Pour les exploitations moyennes",
      price: billingPeriod === "monthly" ? "29 900" : "299 000",
      period: billingPeriod === "monthly" ? "/mois" : "/an",
      savings: billingPeriod === "yearly" ? "2 mois offerts" : null,
      popular: true,
      features: [
        { name: "Parcelles illimitées", included: true },
        { name: "AgriBot IA illimité", included: true },
        { name: "Capteurs IoT illimités", included: true },
        { name: "Alertes multicanal", included: true },
        { name: "Support téléphonique", included: true },
        { name: "Tous les rapports", included: true },
        { name: "Gestion de 5 drones", included: true },
        { name: "Contrôle de 2 robots", included: true },
        { name: "Images satellites illimitées", included: true },
        { name: "API access", included: true }
      ],
      cta: "Essai gratuit",
      ctaStyle: "primary"
    },
    {
      name: "Entreprise",
      description: "Pour les grandes exploitations",
      price: "Sur devis",
      period: "",
      savings: null,
      popular: false,
      features: [
        { name: "Tout du plan Pro", included: true },
        { name: "Drones et robots illimités", included: true },
        { name: "API personnalisée", included: true },
        { name: "Formation sur site", included: true },
        { name: "Support 24/7 dédié", included: true },
        { name: "Intégration ERP", included: true },
        { name: "SLA garanti", included: true },
        { name: "Account manager dédié", included: true },
        { name: "Déploiement on-premise", included: true },
        { name: "Personnalisation complète", included: true }
      ],
      cta: "Nous contacter",
      ctaStyle: "outline"
    }
  ];

  const faqs = [
    {
      question: "Puis-je changer de plan à tout moment ?",
      answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement et nous ajustons votre facturation au prorata."
    },
    {
      question: "Y a-t-il une période d'essai ?",
      answer: "Oui, tous nos plans payants incluent un essai gratuit de 14 jours. Aucune carte bancaire n'est requise pour commencer."
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons Orange Money, MTN MoMo, Wave, les cartes bancaires (Visa, Mastercard) et les virements bancaires pour les entreprises."
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Oui, vous pouvez annuler à tout moment depuis votre tableau de bord. Vous conservez l'accès jusqu'à la fin de votre période de facturation."
    },
    {
      question: "Offrez-vous des réductions pour les coopératives ?",
      answer: "Oui ! Nous proposons des tarifs spéciaux pour les coopératives et associations d'agriculteurs. Contactez-nous pour en savoir plus."
    },
    {
      question: "Les mises à jour sont-elles incluses ?",
      answer: "Absolument. Toutes les mises à jour et nouvelles fonctionnalités sont automatiquement incluses dans votre abonnement."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <WebsiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6">
            Tarifs Transparents
          </Badge>
          <h1 className="text-5xl font-bold mb-6 font-[Manrope]">
            Des Plans Adaptés à Chaque Exploitation
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Commencez gratuitement et évoluez au rythme de votre croissance
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 bg-white/10 rounded-full p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all",
                billingPeriod === "monthly" 
                  ? "bg-white text-emerald-700" 
                  : "text-white hover:text-emerald-300"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2",
                billingPeriod === "yearly" 
                  ? "bg-white text-emerald-700" 
                  : "text-white hover:text-emerald-300"
              )}
            >
              Annuel
              <Badge className="bg-emerald-500 text-white text-xs">-17%</Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "relative bg-white rounded-3xl p-8 border-2 transition-all hover:shadow-xl",
                  plan.popular 
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105 z-10" 
                    : "border-slate-200"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Populaire
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                  {plan.savings && (
                    <Badge className="ml-2 bg-emerald-100 text-emerald-700">{plan.savings}</Badge>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        feature.included ? "text-slate-700" : "text-slate-400"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full",
                    plan.ctaStyle === "primary" 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  )}
                  onClick={() => plan.price === "Sur devis" ? navigate("/contact") : navigate("/register")}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Free plan note */}
          <p className="text-center mt-8 text-slate-500">
            Tous les plans incluent un essai gratuit de 14 jours. Sans carte bancaire.
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 font-[Manrope]">
              Comparaison Détaillée
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 font-medium text-slate-500">Fonctionnalité</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center py-4 px-4 font-bold text-slate-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Parcelles",
                  "AgriBot IA",
                  "Capteurs IoT",
                  "Drones",
                  "Robots",
                  "Images satellites",
                  "Support"
                ].map((feature, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-4 px-4 text-slate-600">{feature}</td>
                    {plans.map((plan, j) => (
                      <td key={j} className="text-center py-4 px-4">
                        <span className="text-sm text-slate-700">
                          {plan.features[i]?.name?.replace(/.*\(/, "").replace(")", "") || "✓"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-700 mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-slate-900 font-[Manrope]">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-slate-50 rounded-2xl">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  <HelpCircle className="h-5 w-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-slate-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-emerald-100 mb-8">
            Essayez gratuitement pendant 14 jours, sans engagement
          </p>
          <Button 
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate("/register")}
          >
            Démarrer l'essai gratuit
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
};

export default PricingPage;
