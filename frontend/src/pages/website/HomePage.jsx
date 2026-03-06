import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  ArrowRight, Play, Star, Check, ChevronDown, Zap, 
  Bot, Plane, Satellite, Droplets, ShoppingCart, 
  Camera, GraduationCap, Smartphone, BarChart3,
  Shield, Users, Globe, Brain, Cpu, TrendingUp,
  Leaf, Bug, Cloud, Award
} from "lucide-react";
import { cn } from "../../lib/utils";
import IMAGES from "../../assets/images";
import SEOHead from "../../components/SEOHead";
import InteractiveDemo from "../../components/InteractiveDemo";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  const stats = [
    { value: "50+", label: "Cultures africaines", icon: Leaf },
    { value: "200+", label: "Maladies détectables", icon: Bug },
    { value: "10", label: "Pays couverts", icon: Globe },
    { value: "95%", label: "Précision IA", icon: Brain }
  ];

  const features = [
    {
      icon: Bot,
      title: "AgriBot IA",
      description: "Assistant intelligent propulsé par AGRI GENIUS. Analyse d'images, détection de maladies, prédiction de rendement et conseils personnalisés.",
      image: IMAGES.heroAI,
      color: "emerald",
      link: "/solutions/agribot-ia"
    },
    {
      icon: Plane,
      title: "Gestion des Drones",
      description: "Pilotage en temps réel, programmation de missions, capture multispectrale et analyse NDVI automatisée.",
      image: IMAGES.droneAnalysis,
      color: "violet",
      link: "/solutions/drones"
    },
    {
      icon: Bot,
      title: "Robots Agricoles",
      description: "Contrôle de robots avec reconstruction 3D LIDAR, désherbage automatique et pulvérisation de précision.",
      image: IMAGES.robotFarming,
      color: "blue",
      link: "/solutions/robots"
    },
    {
      icon: Satellite,
      title: "Images Satellites",
      description: "Analyse NDVI, cartographie des parcelles, suivi de l'évolution des cultures et alertes météo.",
      image: IMAGES.satelliteView,
      color: "cyan",
      link: "/solutions/satellites"
    }
  ];

  const capabilities = [
    {
      title: "Détection de Maladies",
      description: "Identifiez instantanément plus de 200 maladies végétales avec notre IA de vision avancée.",
      stats: "95% de précision"
    },
    {
      title: "Prédiction de Rendement",
      description: "Estimez votre production avec précision grâce à l'analyse de données historiques et météo.",
      stats: "±5% de marge"
    },
    {
      title: "Analyse de Sol NPK",
      description: "Obtenez les niveaux d'azote, phosphore et potassium de votre sol en quelques secondes.",
      stats: "Analyse complète"
    },
    {
      title: "Conseils Écologiques",
      description: "Recevez des recommandations de traitements biologiques adaptés à votre exploitation.",
      stats: "100% naturel"
    }
  ];

  const testimonials = [
    {
      name: "Amadou Diallo",
      role: "Agriculteur, Sénégal",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      content: "Grâce à AGRICAM IA, j'ai augmenté mon rendement de 40% en une seule saison. L'analyse des maladies m'a permis d'intervenir à temps sur mes plants de maïs.",
      rating: 5
    },
    {
      name: "Marie Koné",
      role: "Directrice de coopérative, Côte d'Ivoire",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      content: "La gestion des drones a révolutionné notre surveillance des plantations de cacao. Nous détectons les problèmes avant qu'ils ne se propagent.",
      rating: 5
    },
    {
      name: "Jean-Pierre Nguema",
      role: "Agronome consultant, Cameroun",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      content: "L'IA de prédiction de rendement est remarquablement précise. Mes clients font maintenant confiance à nos estimations de récolte.",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="AGRICAM IA - Plateforme d'Agriculture de Précision Intelligente"
        description="Révolutionnez votre agriculture avec l'IA. Drones, robots, analyse NDVI, détection de maladies. La plateforme agricole la plus avancée d'Afrique."
        keywords="agriculture IA, drones agricoles, AgriBot, NDVI, Cameroun, Afrique, analyse parcelles, smart farming"
      />
      <WebsiteNavbar />

      {/* Interactive Demo Modal */}
      <InteractiveDemo 
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        onRegister={() => {
          setShowDemo(false);
          navigate("/register");
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={IMAGES.heroAI} 
            alt="Agriculture IA" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm mb-8 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Propulsé par AGRI GENIUS AI
              <Badge className="bg-emerald-500 text-white text-xs">Nouveau</Badge>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 font-[Manrope] leading-tight">
              L'Agriculture
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligente
              </span>
              <br />
              pour l'Afrique
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Transformez votre exploitation avec l'IA, les drones autonomes et les robots connectés. 
              Détectez les maladies, optimisez vos rendements et prenez des décisions éclairées.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/30"
                onClick={() => navigate("/register")}
              >
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl backdrop-blur-sm"
                onClick={() => setShowDemo(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Tester la démo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>Données sécurisées</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                <span>+5000 agriculteurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <span>Prix Innovation 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/50" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-emerald-200 mx-auto mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-emerald-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Nos Solutions</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Une Suite Technologique Complète
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Découvrez comment AGRICAM IA révolutionne chaque aspect de votre exploitation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      feature.color === "emerald" && "bg-emerald-500",
                      feature.color === "violet" && "bg-violet-500",
                      feature.color === "blue" && "bg-blue-500",
                      feature.color === "cyan" && "bg-cyan-500"
                    )}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                  <Button 
                    variant="outline" 
                    className="group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all"
                    onClick={() => navigate(feature.link)}
                  >
                    En savoir plus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6">
                Intelligence Artificielle
              </Badge>
              <h2 className="text-4xl font-bold mb-6 font-[Manrope]">
                Une IA Conçue pour l'Agriculture Africaine
              </h2>
              <p className="text-xl text-slate-300 mb-10">
                Notre modèle d'IA a été entraîné sur des millions d'images de cultures africaines. 
                Il comprend les spécificités locales et vous guide avec précision.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {capabilities.map((cap, index) => (
                  <div key={index} className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <div className="text-emerald-400 text-sm font-medium mb-2">{cap.stats}</div>
                    <h4 className="text-lg font-bold mb-2">{cap.title}</h4>
                    <p className="text-slate-400 text-sm">{cap.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src={IMAGES.droneAnalysis} 
                alt="Analyse par drone"
                className="rounded-3xl shadow-2xl"
              />
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-3xl font-bold text-emerald-600">95%</div>
                <div className="text-slate-500 text-sm">Précision</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                <div className="text-3xl font-bold text-violet-600">200+</div>
                <div className="text-slate-500 text-sm">Maladies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Témoignages</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Ils Nous Font Confiance
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 relative">
              <div className="absolute top-8 left-8 text-8xl text-emerald-200 font-serif">"</div>
              
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed">
                  {testimonials[currentTestimonial].content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-slate-500">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentTestimonial === index ? "w-8 bg-emerald-500" : "bg-slate-300"
                    )}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-[Manrope]">
            Prêt à Transformer Votre Agriculture ?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Rejoignez des milliers d'agriculteurs qui optimisent leurs exploitations avec AGRICAM IA
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 rounded-xl shadow-lg"
              onClick={() => navigate("/register")}
            >
              Créer mon compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              onClick={() => navigate("/contact")}
            >
              Demander une démo
            </Button>
          </div>
          
          <p className="mt-8 text-emerald-200 text-sm">
            ✓ Essai gratuit de 14 jours &nbsp; ✓ Sans carte bancaire &nbsp; ✓ Support inclus
          </p>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
};

export default HomePage;
