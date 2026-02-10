import React from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  ArrowRight, Bot, Plane, Satellite, Droplets, 
  Camera, ShoppingCart, Smartphone, GraduationCap,
  Check, Zap, BarChart3, Cpu, Brain, Leaf
} from "lucide-react";
import { cn } from "../../lib/utils";
import IMAGES from "../../assets/images";

const SolutionsPage = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      id: "agribot-ia",
      icon: Bot,
      title: "AgriBot IA",
      subtitle: "Votre Expert Agricole 24/7",
      description: "Un assistant intelligent propulsé par Gemini Pro qui comprend l'agriculture africaine. Posez vos questions, uploadez des images, et recevez des conseils experts instantanément.",
      image: IMAGES.heroAI,
      color: "emerald",
      features: [
        "Chat intelligent avec 50+ cultures africaines",
        "Détection de 200+ maladies végétales",
        "Prédiction de rendement par culture et pays",
        "Analyse de sol (NPK, humidité, stress)",
        "Conseils écologiques personnalisés",
        "Génération de rapports PDF/Excel"
      ],
      link: "/solutions/agribot-ia"
    },
    {
      id: "drones",
      icon: Plane,
      title: "Gestion des Drones",
      subtitle: "Surveillance Aérienne Intelligente",
      description: "Pilotez vos drones agricoles depuis la plateforme, programmez des missions automatiques et capturez des images multispectrales pour une analyse NDVI complète.",
      image: IMAGES.droneAnalysis,
      color: "violet",
      features: [
        "Pilotage en temps réel depuis le navigateur",
        "Connexion WiFi directe aux drones",
        "Programmation de missions automatiques",
        "Capture photos/vidéos multispectrales",
        "Analyse NDVI et cartographie",
        "Télémétrie et suivi GPS"
      ],
      link: "/solutions/drones"
    },
    {
      id: "robots",
      icon: Bot,
      title: "Robots Agricoles",
      subtitle: "Automatisation de Précision",
      description: "Contrôlez des robots agricoles autonomes équipés de LIDAR 3D pour le désherbage, la pulvérisation de précision et la surveillance des cultures.",
      image: IMAGES.robotFarming,
      color: "blue",
      features: [
        "Pilotage manuel et autonome",
        "Reconstruction 3D LIDAR en temps réel",
        "Désherbage automatique intelligent",
        "Pulvérisation de précision",
        "Échantillonnage de sol automatisé",
        "Patrouille de surveillance"
      ],
      link: "/solutions/robots"
    },
    {
      id: "satellites",
      icon: Satellite,
      title: "Images Satellites",
      subtitle: "Vue Depuis l'Espace",
      description: "Accédez à des images satellites haute résolution de vos parcelles. Analysez l'indice NDVI, suivez l'évolution de vos cultures et anticipez les problèmes.",
      image: IMAGES.satelliteView,
      color: "cyan",
      features: [
        "Images satellites haute résolution",
        "Analyse NDVI automatique",
        "Cartographie des parcelles",
        "Historique d'évolution des cultures",
        "Détection de stress hydrique",
        "Alertes météo intégrées"
      ],
      link: "/solutions/satellites"
    },
    {
      id: "iot",
      icon: Cpu,
      title: "Capteurs IoT",
      subtitle: "Données en Temps Réel",
      description: "Connectez des capteurs IoT pour surveiller température, humidité, pH du sol et bien plus. Recevez des alertes automatiques et optimisez vos décisions.",
      image: IMAGES.greenhouse,
      color: "amber",
      features: [
        "Température et humidité en temps réel",
        "Mesure du pH et conductivité du sol",
        "Pluviométrie et radiation solaire",
        "Alertes automatiques configurables",
        "Historique et tendances",
        "Export des données CSV/Excel"
      ],
      link: "/solutions/iot"
    },
    {
      id: "marketplace",
      icon: ShoppingCart,
      title: "Marketplace",
      subtitle: "Achetez et Vendez",
      description: "Une place de marché dédiée aux agriculteurs. Vendez vos récoltes, achetez des intrants de qualité et connectez-vous avec des acheteurs vérifiés.",
      image: IMAGES.cocoaPod,
      color: "orange",
      features: [
        "Vente de récoltes",
        "Achat d'intrants et équipements",
        "Paiement sécurisé Mobile Money",
        "Acheteurs et vendeurs vérifiés",
        "Comparateur de prix",
        "Livraison coordonnée"
      ],
      link: "/solutions/marketplace"
    }
  ];

  const additionalFeatures = [
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Paiements Orange Money, MTN MoMo et Wave intégrés"
    },
    {
      icon: GraduationCap,
      title: "E-Learning",
      description: "Cours certifiants en agriculture de précision"
    },
    {
      icon: Droplets,
      title: "Irrigation Intelligente",
      description: "Système d'irrigation automatisé basé sur l'IA"
    },
    {
      icon: Camera,
      title: "Caméra IA",
      description: "Analyse en temps réel avec la caméra de votre appareil"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Tableaux de bord et rapports détaillés"
    },
    {
      icon: Brain,
      title: "Recommandations IA",
      description: "Conseils personnalisés pour votre exploitation"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <WebsiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6">
              Nos Solutions
            </Badge>
            <h1 className="text-5xl font-bold mb-6 font-[Manrope]">
              Une Suite Complète pour l'Agriculture Moderne
            </h1>
            <p className="text-xl text-slate-300">
              Découvrez toutes les solutions technologiques qui transformeront votre exploitation agricole
            </p>
          </div>
        </div>
      </section>

      {/* Solutions List */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {solutions.map((solution, index) => (
              <div 
                key={solution.id}
                className={cn(
                  "grid lg:grid-cols-2 gap-12 items-center",
                  index % 2 === 1 && "lg:grid-flow-col-dense"
                )}
              >
                {/* Image */}
                <div className={cn(
                  "relative group",
                  index % 2 === 1 && "lg:col-start-2"
                )}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src={solution.image}
                      alt={solution.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className={cn(
                    "absolute -top-4 -right-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                    solution.color === "emerald" && "bg-emerald-500",
                    solution.color === "violet" && "bg-violet-500",
                    solution.color === "blue" && "bg-blue-500",
                    solution.color === "cyan" && "bg-cyan-500",
                    solution.color === "amber" && "bg-amber-500",
                    solution.color === "orange" && "bg-orange-500"
                  )}>
                    <solution.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                  <Badge className={cn(
                    "mb-4",
                    solution.color === "emerald" && "bg-emerald-100 text-emerald-700",
                    solution.color === "violet" && "bg-violet-100 text-violet-700",
                    solution.color === "blue" && "bg-blue-100 text-blue-700",
                    solution.color === "cyan" && "bg-cyan-100 text-cyan-700",
                    solution.color === "amber" && "bg-amber-100 text-amber-700",
                    solution.color === "orange" && "bg-orange-100 text-orange-700"
                  )}>
                    {solution.subtitle}
                  </Badge>
                  <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
                    {solution.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {solution.description}
                  </p>
                  
                  <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                          solution.color === "emerald" && "bg-emerald-500",
                          solution.color === "violet" && "bg-violet-500",
                          solution.color === "blue" && "bg-blue-500",
                          solution.color === "cyan" && "bg-cyan-500",
                          solution.color === "amber" && "bg-amber-500",
                          solution.color === "orange" && "bg-orange-500"
                        )}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={cn(
                      "text-white",
                      solution.color === "emerald" && "bg-emerald-600 hover:bg-emerald-700",
                      solution.color === "violet" && "bg-violet-600 hover:bg-violet-700",
                      solution.color === "blue" && "bg-blue-600 hover:bg-blue-700",
                      solution.color === "cyan" && "bg-cyan-600 hover:bg-cyan-700",
                      solution.color === "amber" && "bg-amber-600 hover:bg-amber-700",
                      solution.color === "orange" && "bg-orange-600 hover:bg-orange-700"
                    )}
                    onClick={() => navigate(solution.link)}
                  >
                    Découvrir {solution.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Et Bien Plus Encore...
            </h2>
            <p className="text-slate-600">
              Découvrez toutes les fonctionnalités qui complètent notre suite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-slate-100">
                <feature.icon className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
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

export default SolutionsPage;
