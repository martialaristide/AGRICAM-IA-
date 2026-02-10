import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, Phone, MapPin, Facebook, Twitter, Linkedin, 
  Instagram, Youtube, ArrowRight 
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import IMAGES from "../assets/images";

const WebsiteFooter = () => {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Restez informé</h3>
              <p className="text-slate-400">Recevez nos actualités et conseils agricoles</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input 
                placeholder="Votre email" 
                className="bg-slate-800 border-slate-700 text-white w-full md:w-64"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                S'abonner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={IMAGES.logo} alt="African AI Solutions" className="h-12 w-auto" />
              <span className="text-xl font-bold">AGRICAM IA</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              La plateforme d'agriculture de précision propulsée par l'Intelligence Artificielle. 
              Conçue pour transformer l'agriculture africaine et mondiale.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-bold text-lg mb-6">Solutions</h4>
            <ul className="space-y-3">
              {[
                { label: "AgriBot IA", path: "/solutions/agribot-ia" },
                { label: "Gestion Drones", path: "/solutions/drones" },
                { label: "Robots Agricoles", path: "/solutions/robots" },
                { label: "Images Satellites", path: "/solutions/satellites" },
                { label: "Capteurs IoT", path: "/solutions/iot" },
                { label: "Marketplace", path: "/solutions/marketplace" }
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4 className="font-bold text-lg mb-6">Entreprise</h4>
            <ul className="space-y-3">
              {[
                { label: "À propos", path: "/a-propos" },
                { label: "Équipe", path: "/a-propos#equipe" },
                { label: "Carrières", path: "/carrieres" },
                { label: "Presse", path: "/presse" },
                { label: "Blog", path: "/blog" },
                { label: "Partenaires", path: "/partenaires" }
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-slate-400">
                  Douala, Cameroun<br />
                  Akwa, Rue de la Joie
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500" />
                <span className="text-slate-400">+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500" />
                <span className="text-slate-400">contact@agricam-ia.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 African AI Solutions. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="text-slate-400 hover:text-emerald-400 text-sm">
                Mentions légales
              </Link>
              <Link to="/confidentialite" className="text-slate-400 hover:text-emerald-400 text-sm">
                Confidentialité
              </Link>
              <Link to="/cgv" className="text-slate-400 hover:text-emerald-400 text-sm">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
