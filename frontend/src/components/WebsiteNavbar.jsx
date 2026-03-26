import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import IMAGES from "../assets/images";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";

const WebsiteNavbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = location.pathname === "/" || location.pathname === "/accueil";
  const isScrolled = scrollY > 50;
  const showSolidBg = !isHomePage || isScrolled;

  const navLinks = [
    { label: t("landing.navHome"), path: "/accueil" },
    { 
      label: t("landing.navSolutions"), 
      path: "/solutions",
      children: [
        { label: t("landing.featureAgribot"), path: "/solutions/agribot-ia" },
        { label: t("landing.featureDrones"), path: "/solutions/drones" },
        { label: t("landing.featureRobots"), path: "/solutions/robots" },
        { label: t("landing.featureSatellites"), path: "/solutions/satellites" },
        { label: "Capteurs IoT", path: "/solutions/iot" },
        { label: "Marketplace", path: "/solutions/marketplace" }
      ]
    },
    { label: t("landing.navPricing"), path: "/tarifs" },
    { label: t("landing.navAbout"), path: "/a-propos" },
    { label: t("landing.navContact"), path: "/contact" }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      showSolidBg ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/accueil" className="flex items-center gap-3">
            <img src={IMAGES.logo} alt="African AI Solutions" className="h-12 w-auto" />
            <span className={cn("text-xl font-bold font-[Manrope]", showSolidBg ? "text-slate-900" : "text-white")}>
              AGRICAM <span className="text-emerald-500">IA</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <>
                    <button className={cn("flex items-center gap-1 font-medium transition-colors", showSolidBg ? "text-slate-600 hover:text-emerald-600" : "text-white/90 hover:text-white")}
                      onClick={() => navigate(link.path)}>
                      {link.label} <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-xl shadow-xl border p-2 min-w-[200px]">
                        {link.children.map((child) => (
                          <Link key={child.path} to={child.path} className="block px-4 py-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link.path} className={cn("font-medium transition-colors", showSolidBg ? "text-slate-600 hover:text-emerald-600" : "text-white/90 hover:text-white", location.pathname === link.path && "text-emerald-500")}>
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              <LanguageSelector variant="ghost" />
              <Button variant="ghost" onClick={() => navigate("/login")} className={cn(showSolidBg ? "text-slate-600 hover:text-emerald-600" : "text-white hover:bg-white/10")}>
                {t("landing.navLogin")}
              </Button>
              <Button onClick={() => navigate("/register")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {t("landing.navFreeTrial")}
              </Button>
            </div>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className={showSolidBg ? "text-slate-900" : "text-white"} size={24} /> : <Menu className={showSolidBg ? "text-slate-900" : "text-white"} size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link to={link.path} className="block text-slate-600 hover:text-emerald-600 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-2">
                    {link.children.map((child) => (
                      <Link key={child.path} to={child.path} className="block text-slate-500 hover:text-emerald-600 text-sm py-1" onClick={() => setMobileMenuOpen(false)}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-3">
              <Button variant="outline" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="w-full">
                {t("landing.navLogin")}
              </Button>
              <Button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {t("landing.navFreeTrial")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default WebsiteNavbar;
