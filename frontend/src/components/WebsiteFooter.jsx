import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import IMAGES from "../assets/images";
import { useLanguage } from "../contexts/LanguageContext";

const WebsiteFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t("landing.footerNewsletter")}</h3>
              <p className="text-slate-400">{t("landing.footerNewsletterDesc")}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input placeholder={t("landing.footerEmailPlaceholder")} className="bg-slate-800 border-slate-700 text-white w-full md:w-64" />
              <Button className="bg-emerald-600 hover:bg-emerald-700">{t("landing.footerSubscribe")}</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={IMAGES.logo} alt="African AI Solutions" className="h-12 w-auto" />
              <span className="text-xl font-bold">AGRICAM IA</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">{t("landing.footerDesc")}</p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t("landing.footerSolutions")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("landing.featureAgribot"), path: "/solutions/agribot-ia" },
                { label: t("landing.featureDrones"), path: "/solutions/drones" },
                { label: t("landing.featureRobots"), path: "/solutions/robots" },
                { label: t("landing.featureSatellites"), path: "/solutions/satellites" },
                { label: "Capteurs IoT", path: "/solutions/iot" },
                { label: "Marketplace", path: "/solutions/marketplace" }
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t("landing.footerCompany")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("landing.footerAbout"), path: "/a-propos" },
                { label: t("landing.footerTeam"), path: "/a-propos#equipe" },
                { label: t("landing.footerCareers"), path: "/carrieres" },
                { label: t("landing.footerPress"), path: "/presse" },
                { label: t("landing.footerBlog"), path: "/blog" },
                { label: t("landing.footerPartners"), path: "/partenaires" }
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t("landing.footerContactTitle")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-slate-400">Yaoundé, Cameroun<br />Fouda, face Hôtel Mansel</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-500" />
                <span className="text-slate-400">+237 652 686 424</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-500" />
                <span className="text-slate-400">contact@agricam-ia.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              &copy; 2024 African AI Solutions. {t("landing.footerCopyright")}
            </p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="text-slate-400 hover:text-emerald-400 text-sm">{t("landing.footerLegal")}</Link>
              <Link to="/confidentialite" className="text-slate-400 hover:text-emerald-400 text-sm">{t("landing.footerPrivacy")}</Link>
              <Link to="/cgv" className="text-slate-400 hover:text-emerald-400 text-sm">{t("landing.footerTerms")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
