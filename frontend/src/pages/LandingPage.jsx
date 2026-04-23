import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { 
  Leaf, ArrowRight, CheckCircle, Plane, Satellite, 
  Droplets, BarChart3, ShoppingCart, Shield, Brain,
  Wifi, WifiOff, Globe
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

const HERO_IMAGE = "https://images.unsplash.com/photo-1651944432354-0dcd74b6c1bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwzfHxhZ3JpY3VsdHVyZSUyMGRyb25lJTIwc3ByYXlpbmclMjBjcm9wcyUyMHNtYXJ0JTIwZmFybWluZyUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzY5NTc4NzE1fDA&ixlib=rb-4.1.0&q=85";
const LOGO_URL = "https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png";

const LandingPage = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: Brain, title: t("landing.featureAgribot") || "AgriBot IA", desc: t("landing.featureAgribotDesc") || "Analyse IA des cultures et detection des maladies" },
    { icon: Plane, title: t("landing.featureDrones") || "Gestion Drones", desc: t("landing.featureDronesDesc") || "Surveillance et cartographie automatisee" },
    { icon: Satellite, title: t("landing.featureSatellites") || "Imagerie Satellite", desc: t("landing.featureSatellitesDesc") || "Donnees NDVI et analyse spectrale" },
    { icon: Droplets, title: t("landing.featureIrrigation") || "Irrigation Intelligente", desc: t("landing.featureIrrigationDesc") || "Optimisation automatique de l'arrosage" },
    { icon: BarChart3, title: t("landing.featureAnalytics") || "Analytics Avances", desc: t("landing.featureAnalyticsDesc") || "Prediction de rendement et rapports" },
    { icon: ShoppingCart, title: t("landing.featureMarketplace") || "Marketplace", desc: t("landing.featureMarketplaceDesc") || "Achat/vente de produits agricoles" },
  ];

  const pricing = [
    {
      name: "Freemium",
      price: "0 XAF",
      period: "",
      features: [
        t("landing.priceFree1") || "1 parcelle",
        t("landing.priceFree2") || "Donnees satellite",
        t("landing.priceFree3") || "Alertes basiques",
        t("landing.priceFree4") || "Marketplace (consultation)"
      ],
      popular: false
    },
    {
      name: "Basic",
      price: "5 000 XAF",
      period: t("landing.perMonth") || "/mois",
      features: [
        t("landing.priceBasic1") || "3 parcelles",
        t("landing.priceBasic2") || "Meteo avancee",
        t("landing.priceBasic3") || "Analyse IA basique",
        t("landing.priceBasic4") || "Support email",
        t("landing.priceBasic5") || "Export donnees"
      ],
      popular: false
    },
    {
      name: "Premium",
      price: "15 000 XAF",
      period: t("landing.perMonth") || "/mois",
      features: [
        t("landing.pricePrem1") || "Parcelles illimitees",
        t("landing.pricePrem2") || "Capteurs IoT inclus",
        t("landing.pricePrem3") || "Drones + IA avancee",
        t("landing.pricePrem4") || "Support 24/7",
        t("landing.pricePrem5") || "Analytics complets",
        t("landing.pricePrem6") || "Prediction rendement"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="African AI Solutions" className="h-10 w-auto" />
              <span className="text-xl font-bold text-slate-900 font-[Manrope] hidden sm:inline">
                AGRICAM <span className="text-emerald-600">IA</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector variant="ghost" showLabel={false} />
              <Link to="/login">
                <Button variant="ghost" data-testid="nav-login-btn" className="text-sm px-3">
                  {t("landing.login") || "Connexion"}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-sm px-3 sm:px-4" data-testid="nav-register-btn">
                  {t("landing.register") || "S'inscrire"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
                <Leaf className="h-4 w-4" />
                {t("landing.poweredBy") || "Agriculture de precision intelligente"}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 font-[Manrope] leading-tight">
                {t("landing.heroTitle1") || "Transformez votre"}{" "}
                <span className="text-emerald-600">{t("landing.heroTitle2") || "agriculture"}</span>{" "}
                {t("landing.heroTitle3") || "avec l'IA"}
              </h1>
              
              <p className="text-base sm:text-xl text-slate-600 leading-relaxed">
                {t("landing.heroSubtitle") || "AGRICAM IA combine drones, satellites, capteurs IoT et intelligence artificielle pour optimiser vos rendements et reduire vos couts."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto" data-testid="hero-cta-btn">
                    {t("landing.ctaStart") || "Commencer gratuitement"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                    {t("landing.ctaDemo") || "Voir la demo"}
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  <span>{t("landing.trustSecure") || "Essai gratuit"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  <span>{t("landing.trustUsers") || "+5000 agriculteurs"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  <span>{t("landing.trustAward") || "Support 24/7"}</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden sm:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={HERO_IMAGE} alt="Drone agriculture" className="w-full h-[400px] lg:h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{t("landing.analysisInProgress") || "Analyse en cours"}</p>
                        <p className="text-lg font-bold text-slate-900">{t("landing.parcelName") || "Parcelle Nord - Ble"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">94%</p>
                        <p className="text-sm text-slate-500">{t("landing.cropHealth") || "Sante culture"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-bounce hidden lg:flex" style={{ animationDuration: "3s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center"><Satellite className="h-5 w-5 text-blue-600" /></div>
                  <div><p className="text-sm text-slate-500">NDVI</p><p className="text-lg font-bold text-slate-900">0.75</p></div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-bounce hidden lg:flex" style={{ animationDuration: "3.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-100 flex items-center justify-center"><Droplets className="h-5 w-5 text-cyan-600" /></div>
                  <div><p className="text-sm text-slate-500">{t("nav.irrigation") || "Irrigation"}</p><p className="text-lg font-bold text-slate-900">Auto</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Manrope] mb-4">
              {t("landing.ourSolutions") || "Fonctionnalites completes"}
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto">
              {t("landing.completeSuite") || "Tout ce dont vous avez besoin pour une agriculture moderne et rentable"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 sm:p-8 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-all duration-300 hover:shadow-lg group">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center mb-4 sm:mb-6 transition-colors">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[Manrope] mb-4">
              {t("landing.pricingTitle") || "Tarifs adaptes a vos besoins"}
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto">
              {t("landing.pricingSubtitle") || "Commencez gratuitement et evoluez selon vos besoins"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`relative p-6 sm:p-8 rounded-3xl ${
                plan.popular ? "bg-emerald-600 text-white shadow-2xl md:scale-105" : "bg-white shadow-lg"
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-slate-900 text-sm font-bold rounded-full">
                    {t("landing.popular") || "Populaire"}
                  </div>
                )}
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                <div className="mb-6">
                  <span className={`text-3xl sm:text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                  <span className={plan.popular ? "text-emerald-100" : "text-slate-500"}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm sm:text-base">
                      <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${plan.popular ? "text-emerald-200" : "text-emerald-500"}`} />
                      <span className={plan.popular ? "text-emerald-50" : "text-slate-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full ${plan.popular ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                    {t("landing.choosePlan") || "Choisir"} {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[Manrope] mb-6">
            {t("landing.ctaTitle") || "Pret a revolutionner votre agriculture ?"}
          </h2>
          <p className="text-base sm:text-xl text-emerald-100 mb-8">
            {t("landing.ctaSubtitle") || "Rejoignez des milliers d'agriculteurs qui utilisent deja AGRICAM IA"}
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 text-base sm:text-lg px-8 sm:px-10">
              {t("landing.ctaButton") || "Creer un compte gratuit"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="African AI Solutions" className="h-10 w-auto" />
              <div>
                <p className="text-white font-bold font-[Manrope]">AGRICAM IA</p>
                <p className="text-slate-400 text-sm">African AI Solutions</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-400 text-sm">
                {t("landing.developedBy") || "Developpe par"} <span className="text-emerald-400 font-semibold">Barra Martial Aristide</span>
              </p>
              <p className="text-slate-500 text-sm mt-1">
                © 2024 African AI Solutions. {t("landing.allRights") || "Tous droits reserves."}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
