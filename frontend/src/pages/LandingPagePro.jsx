import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, Bot, Plane, Satellite, Droplets, ShoppingCart, 
  Smartphone, GraduationCap, BarChart3, Shield, Check, 
  ArrowRight, Play, Star, Users, Globe, Zap, Camera,
  ChevronDown, Menu, X, Download, Mail, Phone, MapPin,
  Linkedin, Twitter, Facebook, Instagram, Award, Target,
  TrendingUp, Brain, Cpu, Cloud, Lock, Headphones
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png";

// Co-founders images
const MARTIAL_IMAGE = "https://customer-assets.emergentagent.com/job_b908d1b4-6084-4393-92f3-93b7a7437a93/artifacts/mnco0ros_profile%20cv.jpeg";
const PRISCY_IMAGE = "https://customer-assets.emergentagent.com/job_b908d1b4-6084-4393-92f3-93b7a7437a93/artifacts/abv10csi_image.png";

const LandingPagePro = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Bot,
      title: "AgriBot IA",
      description: "Assistant intelligent propulsé par Gemini Pro avec un corpus de 50+ cultures africaines et détection de 200+ maladies.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Plane,
      title: "Gestion des Drones",
      description: "Configuration, pilotage en temps réel, programmation de missions et capture d'images multispectrales.",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: Bot,
      title: "Contrôle des Robots",
      description: "Pilotage de robots agricoles avec reconstruction 3D LIDAR et modes manuel/autonome.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Camera,
      title: "Caméra IA",
      description: "Analyse en temps réel du sol, des plantes et détection des zones de stress avec code couleur.",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: Satellite,
      title: "Images Satellites",
      description: "Analyse NDVI, cartographie des parcelles et suivi de l'évolution des cultures depuis l'espace.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: Droplets,
      title: "Irrigation Intelligente",
      description: "Système d'irrigation automatisé basé sur les données IoT et les prévisions météo.",
      color: "from-sky-500 to-cyan-600"
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Achat et vente de produits agricoles, intrants et équipements avec paiement sécurisé.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Paiements Orange Money, MTN MoMo et Wave intégrés pour toute l'Afrique.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: GraduationCap,
      title: "E-Learning",
      description: "Cours certifiants en agriculture de précision et utilisation des technologies agricoles.",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const stats = [
    { value: "50+", label: "Cultures supportées" },
    { value: "200+", label: "Maladies détectables" },
    { value: "10", label: "Pays africains" },
    { value: "95%", label: "Précision IA" }
  ];

  const pricing = [
    {
      name: "Agriculteur",
      price: "9 900",
      period: "FCFA/mois",
      description: "Pour les petits agriculteurs",
      features: [
        "Jusqu'à 5 parcelles",
        "AgriBot IA (100 requêtes/mois)",
        "Capteurs IoT (jusqu'à 10)",
        "Alertes SMS et email",
        "Support par email"
      ],
      popular: false,
      color: "border-emerald-200"
    },
    {
      name: "Professionnel",
      price: "29 900",
      period: "FCFA/mois",
      description: "Pour les exploitations moyennes",
      features: [
        "Parcelles illimitées",
        "AgriBot IA illimité",
        "Gestion de 2 drones",
        "1 robot agricole",
        "Images satellites",
        "Marketplace prioritaire",
        "Support téléphonique"
      ],
      popular: true,
      color: "border-violet-500"
    },
    {
      name: "Entreprise",
      price: "Sur devis",
      period: "",
      description: "Pour les grandes exploitations",
      features: [
        "Tout du plan Pro",
        "Drones et robots illimités",
        "API personnalisée",
        "Formation sur site",
        "Support 24/7 dédié",
        "Intégration ERP",
        "SLA garanti"
      ],
      popular: false,
      color: "border-slate-200"
    }
  ];

  const testimonials = [
    {
      name: "Amadou Diallo",
      role: "Agriculteur, Sénégal",
      content: "Grâce à AGRICAM IA, j'ai augmenté mon rendement de 40% en une seule saison. L'analyse des maladies m'a permis d'intervenir à temps.",
      rating: 5
    },
    {
      name: "Marie Koné",
      role: "Coopérative agricole, Côte d'Ivoire",
      content: "La gestion des drones a révolutionné notre surveillance des plantations de cacao. Un outil indispensable !",
      rating: 5
    },
    {
      name: "Jean-Pierre Nguema",
      role: "Agronome, Cameroun",
      content: "L'IA de prédiction de rendement est remarquablement précise. Nos clients font confiance à nos estimations maintenant.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollY > 50 ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="African AI Solutions" className="h-12 w-auto" />
              <div>
                <span className={cn(
                  "text-xl font-bold font-[Manrope]",
                  scrollY > 50 ? "text-slate-900" : "text-white"
                )}>
                  AGRICAM <span className="text-emerald-500">IA</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {["Fonctionnalités", "Tarifs", "Équipe", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={cn(
                    "font-medium transition-colors",
                    scrollY > 50 ? "text-slate-600 hover:text-emerald-600" : "text-white/90 hover:text-white"
                  )}
                >
                  {item}
                </a>
              ))}
              <Button 
                onClick={() => navigate("/login")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accéder à la plateforme
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={scrollY > 50 ? "text-slate-900" : "text-white"} />
              ) : (
                <Menu className={scrollY > 50 ? "text-slate-900" : "text-white"} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {["Fonctionnalités", "Tarifs", "Équipe", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-slate-600 hover:text-emerald-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Accéder à la plateforme
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MTIwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm mb-8">
              <Zap className="h-4 w-4" />
              Propulsé par l'Intelligence Artificielle
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 font-[Manrope] leading-tight">
              L'Agriculture de Précision
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Réinventée par l'IA
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
              Transformez votre exploitation agricole avec l'intelligence artificielle, 
              les drones autonomes et les robots connectés. Conçu pour l'Afrique.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/30"
                onClick={() => navigate("/register")}
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              >
                <Play className="mr-2 h-5 w-5" />
                Voir la démo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/50" />
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalités" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Une Suite Complète de Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour moderniser votre exploitation agricole
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-emerald-200 hover:-translate-y-1"
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6",
                  feature.color
                )}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-300 text-sm mb-6">
                <Brain className="h-4 w-4" />
                Intelligence Artificielle Avancée
              </div>
              <h2 className="text-4xl font-bold mb-6 font-[Manrope]">
                AgriBot IA : Votre Expert Agricole 24/7
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Propulsé par Gemini Pro, AgriBot IA comprend les spécificités de l'agriculture africaine 
                et vous guide avec une précision de 95%.
              </p>
              
              <div className="space-y-4">
                {[
                  "Détection de 200+ maladies végétales",
                  "Prédiction de rendement par culture et pays",
                  "Analyse de sol (NPK, humidité, stress)",
                  "Conseils écologiques personnalisés",
                  "Génération de rapports PDF/Excel"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold">AgriBot IA</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">En ligne</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm p-4">
                    <p className="text-slate-300">Comment traiter le mildiou sur mes plants de tomates ?</p>
                  </div>
                  <div className="bg-emerald-600/20 rounded-2xl rounded-tr-sm p-4 border border-emerald-500/30">
                    <p className="text-slate-200">
                      🌿 Pour traiter le mildiou naturellement :<br/><br/>
                      1. Retirez les feuilles infectées<br/>
                      2. Appliquez une solution de bicarbonate (5g/L)<br/>
                      3. Espacez les plants pour la circulation d'air<br/>
                      4. Arrosez au pied, jamais sur les feuilles<br/><br/>
                      💡 Prévention : Rotation des cultures et variétés résistantes
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Tarifs Adaptés à Chaque Exploitation
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Des plans flexibles pour accompagner votre croissance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "relative bg-white rounded-3xl p-8 border-2 transition-all hover:shadow-xl",
                  plan.popular ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : plan.color
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Le plus populaire
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 ml-2">{plan.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-emerald-500" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full py-6",
                    plan.popular 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  )}
                  onClick={() => navigate("/register")}
                >
                  Choisir ce plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="équipe" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Les Fondateurs
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une équipe passionnée par l'innovation agricole en Afrique
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Martial */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={MARTIAL_IMAGE} 
                  alt="Barra Martial Aristide"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Barra Martial Aristide</h3>
                <p className="text-emerald-600 font-medium mb-4">Co-Fondateur & CEO</p>
                <p className="text-slate-600 mb-6">
                  Ingénieur polytechnicien spécialisé en Intelligence Artificielle. 
                  Passionné par l'application de l'IA pour résoudre les défis agricoles en Afrique.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Priscy */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={PRISCY_IMAGE} 
                  alt="Kenfack Claude Priscy Steffe"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Kenfack Claude Priscy Steffe</h3>
                <p className="text-emerald-600 font-medium mb-4">Co-Fondatrice & COO</p>
                <p className="text-slate-600 mb-6">
                  Experte en gestion de projets et développement commercial. 
                  Engagée pour l'autonomisation des agriculteurs africains par la technologie.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl shadow-lg">
              <img src={LOGO_URL} alt="African AI Solutions" className="h-16 w-auto" />
              <div className="text-left">
                <h4 className="font-bold text-slate-900">African AI Solutions</h4>
                <p className="text-slate-500">L'IA au service de l'Afrique</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Ils Nous Font Confiance
            </h2>
            <p className="text-xl text-slate-600">
              Découvrez les témoignages de nos utilisateurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-[Manrope]">
            Prêt à Transformer Votre Agriculture ?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Rejoignez les agriculteurs qui ont déjà adopté l'agriculture de précision avec AGRICAM IA
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 rounded-xl"
              onClick={() => navigate("/register")}
            >
              Créer mon compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
            >
              <Download className="mr-2 h-5 w-5" />
              Télécharger l'APK
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={LOGO_URL} alt="African AI Solutions" className="h-10 w-auto" />
                <span className="text-xl font-bold">AGRICAM IA</span>
              </div>
              <p className="text-slate-400 mb-6">
                La plateforme d'agriculture de précision propulsée par l'IA, conçue pour l'Afrique.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-6">Produit</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Téléchargements</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Communauté</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-emerald-500" />
                  contact@agricam-ia.com
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-emerald-500" />
                  +237 6XX XXX XXX
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  Douala, Cameroun
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm">
              © 2024 African AI Solutions. Tous droits réservés.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-emerald-400 text-sm">Conditions d'utilisation</a>
              <a href="#" className="text-slate-400 hover:text-emerald-400 text-sm">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPagePro;
