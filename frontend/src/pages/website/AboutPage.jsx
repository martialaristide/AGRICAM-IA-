import React from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  ArrowRight, Award, Users, Globe, Target, Heart,
  Linkedin, Twitter, Mail, Lightbulb, Leaf, Cpu, Rocket
} from "lucide-react";
import IMAGES from "../../assets/images";

const AboutPage = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: "Barra Martial Aristide",
      role: "Co-Fondateur & CEO",
      bio: "Ingénieur polytechnicien spécialisé en Intelligence Artificielle. Passionné par l'application de l'IA pour résoudre les défis agricoles en Afrique. Visionnaire derrière la technologie AgriBot IA.",
      image: IMAGES.martial,
      linkedin: "#",
      twitter: "#",
      email: "martial@agricam-ia.com"
    },
    {
      name: "Kenfack Claude Priscy Steffe",
      role: "Co-Fondatrice & COO",
      bio: "Experte en gestion de projets et développement commercial. Engagée pour l'autonomisation des agriculteurs africains par la technologie. Pilote la stratégie de croissance et les partenariats.",
      image: IMAGES.priscy,
      linkedin: "#",
      twitter: "#",
      email: "priscy@agricam-ia.com"
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Nous repoussons les limites de la technologie pour créer des solutions qui transforment réellement l'agriculture."
    },
    {
      icon: Heart,
      title: "Impact Social",
      description: "Chaque fonctionnalité est pensée pour améliorer la vie des agriculteurs et leurs communautés."
    },
    {
      icon: Leaf,
      title: "Durabilité",
      description: "Nous promouvons une agriculture respectueuse de l'environnement avec des conseils écologiques."
    },
    {
      icon: Users,
      title: "Accessibilité",
      description: "Nos solutions sont conçues pour être accessibles à tous, des petits agriculteurs aux grandes exploitations."
    }
  ];

  const milestones = [
    { year: "2022", event: "Création d'African AI Solutions" },
    { year: "2023", event: "Lancement de la plateforme AGRICAM IA" },
    { year: "2023", event: "Intégration de l'IA Gemini Pro" },
    { year: "2024", event: "Expansion dans 10 pays africains" },
    { year: "2024", event: "Prix Innovation Agricole" },
    { year: "2025", event: "Lancement des modules Drones et Robots" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <WebsiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={IMAGES.africanFarmer} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/80" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6">
              Notre Histoire
            </Badge>
            <h1 className="text-5xl font-bold mb-6 font-[Manrope]">
              Transformer l'Agriculture Africaine par l'Intelligence Artificielle
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Née de la vision de deux ingénieurs camerounais, AGRICAM IA est devenue la plateforme 
              de référence pour l'agriculture de précision en Afrique.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 mb-4">Notre Mission</Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 font-[Manrope]">
                Démocratiser l'Accès à la Technologie Agricole
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Nous croyons que chaque agriculteur, qu'il cultive un demi-hectare ou mille, 
                mérite d'accéder aux meilleures technologies pour optimiser sa production.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Notre mission est de rendre l'agriculture de précision accessible, abordable 
                et adaptée aux réalités africaines. Nous développons des outils intelligents 
                qui comprennent les cultures locales, les défis climatiques et les contraintes 
                économiques de nos agriculteurs.
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">10+</div>
                  <div className="text-slate-500">Pays</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">5000+</div>
                  <div className="text-slate-500">Agriculteurs</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">50K+</div>
                  <div className="text-slate-500">Hectares</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={IMAGES.droneField}
                alt="Agriculture de précision"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white rounded-2xl p-6 shadow-xl max-w-xs">
                <Target className="h-8 w-8 mb-3" />
                <p className="font-medium">
                  "Notre objectif : aider 1 million d'agriculteurs africains d'ici 2030"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-700 mb-4">Nos Valeurs</Badge>
            <h2 className="text-4xl font-bold text-slate-900 font-[Manrope]">
              Ce Qui Nous Guide
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="equipe" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Notre Équipe</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-[Manrope]">
              Les Fondateurs
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une équipe passionnée par l'innovation et l'impact social
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-4">{member.role}</p>
                  <p className="text-slate-600 mb-6 leading-relaxed">{member.bio}</p>
                  <div className="flex items-center gap-4">
                    <a href={member.linkedin} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={member.twitter} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Company Logo */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 px-8 py-6 bg-slate-50 rounded-2xl">
              <img src={IMAGES.logo} alt="African AI Solutions" className="h-20 w-auto" />
              <div className="text-left">
                <h4 className="text-2xl font-bold text-slate-900">African AI Solutions</h4>
                <p className="text-slate-500">L'Intelligence Artificielle au service de l'Afrique</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
              Notre Parcours
            </Badge>
            <h2 className="text-4xl font-bold font-[Manrope]">
              Les Étapes Clés
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-emerald-500/30" />
            
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`relative flex items-center gap-8 mb-12 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-emerald-500 transform -translate-x-1/2 z-10" />
                
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-400 font-bold text-lg">{milestone.year}</span>
                    <p className="text-white mt-2">{milestone.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Rocket className="h-12 w-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-6">
            Rejoignez l'Aventure
          </h2>
          <p className="text-emerald-100 mb-8">
            Faites partie de la révolution agricole en Afrique
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate("/register")}
            >
              Créer un compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate("/contact")}
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
};

export default AboutPage;
