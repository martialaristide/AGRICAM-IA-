import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { useLanguage } from "../contexts/LanguageContext";
import ExitIntentModal from "./ExitIntentModal";
import {
  LayoutDashboard,
  PawPrint,
  Map,
  Wifi,
  Plane,
  Satellite,
  ScanSearch,
  Droplets,
  Lightbulb,
  ShoppingCart,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  User,
  Shield,
  ShieldAlert,
  Banknote,
  ChevronDown,
  Sparkles,
  Crown,
  LifeBuoy,
  TreePine,
  Cog,
  GraduationCap,
  X,
  Smartphone,
  Bot,
  Camera,
  Code2,
  Microscope,
  KeyRound,
  Database,
  Package,
  MapPin,
  FileText,
  Navigation
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ActionTooltip } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import LanguageSelector from "./LanguageSelector";
import GuidedTour from "./GuidedTour";
import DemoTour from "./DemoTour";

const API = process.env.REACT_APP_BACKEND_URL;

// Notification Bell Component
const NotificationBell = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ lat: 5.9631, lon: 10.1591 });
  const { isRTL } = useLanguage();

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {} // Silently fallback to default coords
      );
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/climate-notifications?lat=${coords.lat}&lon=${coords.lon}`);
      const data = await res.json();
      setNotifications(data.alerts || []);
    } catch {}
  };

  React.useEffect(() => { fetchNotifications(); const iv = setInterval(fetchNotifications, 120000); return () => clearInterval(iv); }, [coords]);

  const unread = notifications.filter(n => !n.read).length;
  const severityIcon = (s) => s === "critical" ? "text-red-500" : s === "warning" ? "text-amber-500" : "text-blue-500";

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setOpen(!open)} data-testid="notification-bell">
        <Bell className="h-4 w-4 text-slate-400" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">{unread}</span>
        )}
      </Button>
      {open && (
        <div className={cn("absolute top-10 w-80 bg-[#111827] rounded-xl shadow-lg border border-slate-800 z-50 max-h-96 overflow-hidden", isRTL ? "left-0" : "right-0")} data-testid="notification-panel">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Alertes Climat</span>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-emerald-900/40 text-emerald-400 text-[9px]">OpenWeatherMap</Badge>
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{notifications.length}</Badge>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Aucune alerte</p>
            ) : notifications.map((n, i) => (
              <div key={i} className="p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => { const updated = [...notifications]; updated[i] = {...n, read: true}; setNotifications(updated); }}>
                <div className="flex items-start gap-2">
                  <Bell className={cn("h-4 w-4 mt-0.5 flex-shrink-0", severityIcon(n.severity))} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{new Date(n.timestamp).toLocaleString("fr-FR")}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LOGO_URL = "/branding/agricam-logo.png";

// === Module descriptions for tooltips/popups ===
const MODULE_DESCRIPTIONS = {
  "/dashboard":       "Vue d'ensemble : vos parcelles, alertes, météo et indicateurs clés en temps réel.",
  "/admin":           "Gestion globale : utilisateurs, permissions, surveillance système.",
  "/admin-analytics": "Tableau de bord exécutif : KPIs, graphiques, analyse de la plateforme — idéal pour présentations.",
  "/security":        "Centre de sécurité : tentatives d'intrusion, blocage d'utilisateurs, audit.",
  "/access-control":  "Définissez les droits d'accès par rôle et par module.",
  "/database":        "Explorateur de la base de données MongoDB (admin uniquement).",
  "/documentation":   "Documentation complète de la plateforme et guides utilisateurs.",
  "/parcelles":       "Cartographiez vos parcelles, suivez les cultures, l'historique et les rendements.",
  "/capteurs":        "Capteurs IoT : humidité du sol, température, EC, pH en direct.",
  "/irrigation":      "Pilotez l'irrigation automatique selon l'humidité réelle des sols.",
  "/recommandations": "Conseils IA personnalisés : semis, fertilisation, traitements.",
  "/carte-agricole":  "Carte interactive avec parcelles, fournisseurs, agronomes et zones à risque.",
  "/drones-avance":   "Planifiez vos missions de cartographie et surveillance par drone.",
  "/drone-dji":       "Pilotez votre DJI Mini 3 Pro : télémétrie live, vols autonomes, photos IA.",
  "/robots-avance":   "Contrôlez les robots agricoles autonomes (semis, désherbage, récolte).",
  "/satellites":      "Imagerie satellite Sentinel/Landsat avec NDVI et alertes de stress hydrique.",
  "/agribot-ia":      "Assistant agronomique IA vocal — posez vos questions par micro ou texte.",
  "/camera-ia":       "Scannez une feuille avec votre caméra : maladies, carences, parasites détectés.",
  "/analyse-avancee": "Analyse avancée multi-couches (NDVI, NDWI, EVI) avec recommandations IA.",
  "/seed-analyst":    "Analyse de qualité des semences (germination, pureté, vigueur).",
  "/marketplace":     "Achetez/vendez intrants, équipements et services agricoles.",
  "/paiements":       "Paiements Mobile Money (MTN, Orange, NetWalletPay) — abonnements et factures.",
  "/financial":       "Tableau de bord financier : revenus, coûts, ROI par parcelle.",
  "/analytics":       "Analyse de performance : rendements, tendances, prédictions.",
  "/dev-analytics":   "Analytics développeur : logs, événements, performance API.",
  "/formation":       "Cours vidéo et e-books pour monter en compétence sur l'agriculture moderne.",
  "/agronomist":      "Espace dédié aux agronomes : consultations, prescriptions, suivis.",
  "/trainer-dashboard":"Espace formateur : créez et gérez vos cours et apprenants.",
  "/supplier-dashboard":"Espace fournisseur : produits, commandes, stocks.",
  "/bank-dashboard":  "Espace banque : crédits agricoles, scoring, dossiers de financement.",
  "/alertes":         "Toutes les alertes critiques (météo, capteurs, maladies, intrusions).",
  "/parametres":      "Préférences : profil, langue, thème, notifications, sécurité.",
};

// === Group descriptions for the parent button popups ===
const GROUP_DESCRIPTIONS = {
  analysis: "Outils d'analyse IA : caméra, semences, scan de plantes, AGRI Genius vocal.",
  field:    "Gestion des cultures : parcelles, capteurs IoT, irrigation, conseils.",
  fleet:    "Pilotage de la flotte : drones DJI, robots autonomes, satellites.",
  market:   "Commerce et finances : marketplace, paiements Mobile Money, analyses.",
  learning: "Formation continue, espaces agronome et formateur, e-learning.",
  admin:    "Outils administration : sécurité, accès, base de données, docs.",
};

// === Navigation Groups (replaces flat list) ===
const getNavGroups = (role, t) => {
  const dashboard = { path: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard"), tooltip: MODULE_DESCRIPTIONS["/dashboard"] };
  const groupElevage = {
    id: "elevage",
    icon: PawPrint,
    label: "AGRICAM IA Élevage",
    items: [
      { path: "/elevage", icon: PawPrint, label: "Mon Élevage", tooltip: "Cheptel, santé, alertes WhatsApp, carte GPS, économie" },
      { path: "/elevage?tab=cameras", icon: Camera, label: "Caméras & Détection YOLO", tooltip: "Caméras IP (20+), vision par ordinateur YOLO, colliers VitaBif" },
    ],
  };

  const groupAnalysis = {
    id: "analysis",
    icon: Sparkles,
    label: t("nav.groupAnalysis") || "Analyse & IA",
    description: GROUP_DESCRIPTIONS.analysis,
    items: [
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/analyse-avancee", icon: Microscope, label: t("nav.advancedAnalysis") || "Analyse Avancée" },
      { path: "/seed-analyst", icon: Microscope, label: t("roles.seedAnalyst.title") || "Analyse Semences" },
    ],
  };

  const groupField = {
    id: "field",
    icon: TreePine,
    label: t("nav.groupField") || "Cultures & Terrain",
    description: GROUP_DESCRIPTIONS.field,
    items: [
      { path: "/parcelles", icon: Map, label: t("nav.parcels") },
      { path: "/capteurs", icon: Wifi, label: t("nav.sensors") },
      { path: "/irrigation", icon: Droplets, label: t("nav.irrigation") },
      { path: "/recommandations", icon: Lightbulb, label: t("nav.recommendations") },
      { path: "/carte-agricole", icon: MapPin, label: t("nav.farmMap") || "Carte Agricole" },
    ],
  };

  const groupFleet = {
    id: "fleet",
    icon: Plane,
    label: t("nav.groupFleet") || "Flotte autonome",
    description: GROUP_DESCRIPTIONS.fleet,
    items: [
      { path: "/drones-avance", icon: Plane, label: t("nav.drones") },
      { path: "/drone-dji", icon: Navigation, label: "DJI Mini 3 Pro" },
      { path: "/robots-avance", icon: Bot, label: t("nav.robots") },
      { path: "/satellites", icon: Satellite, label: t("nav.satellites") || "Satellites" },
    ],
  };

  const groupMarket = {
    id: "market",
    icon: ShoppingCart,
    label: t("nav.groupMarket") || "Marketplace & Finance",
    description: GROUP_DESCRIPTIONS.market,
    items: [
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/licences", icon: Crown, label: "Plans & Licences" },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
    ],
  };

  const groupLearning = {
    id: "learning",
    icon: GraduationCap,
    label: t("nav.groupLearning") || "Formation & Conseil",
    description: GROUP_DESCRIPTIONS.learning,
    items: [
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/agronomist", icon: Lightbulb, label: t("roles.agronomist.title") || "Espace Agronome" },
    ],
  };

  const groupAdmin = {
    id: "admin",
    icon: Shield,
    label: t("nav.groupAdmin") || "Administration",
    description: GROUP_DESCRIPTIONS.admin,
    items: [
      { path: "/admin", icon: Shield, label: t("nav.admin") || "Administration" },
      { path: "/admin-analytics", icon: BarChart3, label: "Analytics Présentation" },
      { path: "/admin-support", icon: LifeBuoy, label: "Tickets Support" },
      { path: "/security", icon: ShieldAlert, label: t("nav.security") || "Centre de Sécurité" },
      { path: "/access-control", icon: KeyRound, label: t("nav.accessControl") || "Contrôle Accès" },
      { path: "/database", icon: Database, label: t("nav.database") || "Base de Données" },
      { path: "/documentation", icon: FileText, label: "Documentation" },
      { path: "/dev-analytics", icon: Code2, label: (t("nav.analytics") || "Analytics") + " Dev" },
    ],
  };

  // Direct items at the bottom
  const support = { path: "/support", icon: LifeBuoy, label: "Support", tooltip: MODULE_DESCRIPTIONS["/support"] };
  const alertes = { path: "/alertes", icon: Bell, label: t("nav.alerts"), tooltip: MODULE_DESCRIPTIONS["/alertes"] };
  const settings = { path: "/parametres", icon: Settings, label: t("nav.settings"), tooltip: MODULE_DESCRIPTIONS["/parametres"] };

  // Add tooltip descriptions to group items
  const enrich = (g) => ({ ...g, items: g.items.map(it => ({ ...it, tooltip: MODULE_DESCRIPTIONS[it.path] })) });

  if (role === "admin") {
    return {
      direct: [dashboard],
      groups: [enrich(groupElevage), enrich(groupAnalysis), enrich(groupField), enrich(groupFleet), enrich(groupMarket), enrich(groupLearning), enrich(groupAdmin)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "farmer") {
    return {
      direct: [dashboard],
      groups: [enrich(groupElevage), enrich(groupAnalysis), enrich(groupField), enrich(groupFleet), enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "supplier") {
    return {
      direct: [dashboard, { path: "/supplier-dashboard", icon: Package, label: t("roles.supplier.title") || "Mon Espace", tooltip: MODULE_DESCRIPTIONS["/supplier-dashboard"] }],
      groups: [enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "financial") {
    return {
      direct: [dashboard, { path: "/bank-dashboard", icon: Banknote, label: t("roles.bank.title") || "Mon Espace", tooltip: MODULE_DESCRIPTIONS["/bank-dashboard"] }],
      groups: [enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "seed_analyst") {
    return {
      direct: [dashboard],
      groups: [enrich(groupAnalysis), enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "agronomist") {
    return {
      direct: [dashboard, { path: "/agronomist", icon: Lightbulb, label: t("roles.agronomist.title") || "Mon Espace", tooltip: MODULE_DESCRIPTIONS["/agronomist"] }],
      groups: [enrich(groupElevage), enrich(groupAnalysis), enrich(groupField), enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  if (role === "trainer") {
    return {
      direct: [dashboard, { path: "/trainer-dashboard", icon: GraduationCap, label: "Espace Formateur", tooltip: MODULE_DESCRIPTIONS["/trainer-dashboard"] }],
      groups: [enrich(groupAnalysis), enrich(groupMarket), enrich(groupLearning)],
      bottom: [support, alertes, settings],
    };
  }

  return {
    direct: [dashboard],
    groups: [enrich(groupMarket), enrich(groupLearning)],
    bottom: [support, alertes, settings],
  };
};

const getNavItems = (role, t) => {
  const baseItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
  ];
  
  if (role === "admin") {
    return [
      ...baseItems,
      { path: "/admin", icon: Shield, label: t("nav.admin") || "Administration" },
      { path: "/security", icon: ShieldAlert, label: t("nav.security") || "Centre de Securite" },
      { path: "/parcelles", icon: Map, label: t("nav.parcels") },
      { path: "/capteurs", icon: Wifi, label: t("nav.sensors") },
      { path: "/drones-avance", icon: Plane, label: t("nav.drones") },
      { path: "/robots-avance", icon: Bot, label: t("nav.robots") },
      { path: "/drone-dji", icon: Navigation, label: "DJI Mini 3 Pro" },
      { path: "/satellites", icon: Satellite, label: t("nav.satellites") || "Satellites" },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/analyse-avancee", icon: Microscope, label: t("nav.advancedAnalysis") || "Analyse Avancee" },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/irrigation", icon: Droplets, label: t("nav.irrigation") },
      { path: "/recommandations", icon: Lightbulb, label: t("nav.recommendations") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
      { path: "/dev-analytics", icon: Code2, label: t("nav.analytics") + " Dev" },
      { path: "/seed-analyst", icon: Microscope, label: t("roles.seedAnalyst.title") || "Analyse Semences" },
      { path: "/agronomist", icon: Lightbulb, label: t("roles.agronomist.title") || "Espace Agronome" },
      { path: "/access-control", icon: KeyRound, label: t("nav.accessControl") || "Controle Acces" },
      { path: "/carte-agricole", icon: MapPin, label: "Carte Agricole" },
      { path: "/documentation", icon: FileText, label: "Documentation" },
      { path: "/database", icon: Database, label: t("nav.database") || "Base de Donnees" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }
  
  if (role === "farmer") {
    return [
      ...baseItems,
      { path: "/parcelles", icon: Map, label: t("nav.parcels") },
      { path: "/capteurs", icon: Wifi, label: t("nav.sensors") },
      { path: "/drones-avance", icon: Plane, label: t("nav.drones") },
      { path: "/robots-avance", icon: Bot, label: t("nav.robots") },
      { path: "/satellites", icon: Satellite, label: t("nav.satellites") || "Satellites" },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/irrigation", icon: Droplets, label: t("nav.irrigation") },
      { path: "/recommandations", icon: Lightbulb, label: t("nav.recommendations") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/carte-agricole", icon: MapPin, label: "Carte Agricole" },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }
  
  if (role === "supplier") {
    return [
      ...baseItems,
      { path: "/supplier-dashboard", icon: Package, label: t("roles.supplier.title") || "Dashboard Fournisseur" },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }
  
  if (role === "financial") {
    return [
      ...baseItems,
      { path: "/bank-dashboard", icon: Banknote, label: t("roles.bank.title") || "Dashboard Banque" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }

  if (role === "seed_analyst") {
    return [
      ...baseItems,
      { path: "/seed-analyst", icon: Microscope, label: t("roles.seedAnalyst.title") || "Analyse Semences" },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }

  if (role === "agronomist") {
    return [
      ...baseItems,
      { path: "/agronomist", icon: Lightbulb, label: t("roles.agronomist.title") || "Espace Agronome" },
      { path: "/parcelles", icon: Map, label: t("nav.parcels") },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/irrigation", icon: Droplets, label: t("nav.irrigation") },
      { path: "/recommandations", icon: Lightbulb, label: t("nav.recommendations") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }

  if (role === "trainer") {
    return [
      ...baseItems,
      { path: "/trainer-dashboard", icon: GraduationCap, label: "Espace Formateur" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }
  
  return [
    ...baseItems,
    { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
    { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
    { path: "/paiements", icon: Smartphone, label: t("payment.title") || "Paiements" },
    { path: "/parametres", icon: Settings, label: t("nav.settings") },
  ];
};

const getRoleBadge = (role) => {
  const config = {
    admin: { label: "Admin", color: "bg-red-500" },
    farmer: { label: "Agriculteur", color: "bg-emerald-500" },
    supplier: { label: "Fournisseur", color: "bg-blue-500" },
    financial: { label: "Banque", color: "bg-violet-500" },
    partner: { label: "Partenaire", color: "bg-amber-500" },
    investor: { label: "Investisseur", color: "bg-cyan-500" },
    seed_analyst: { label: "Analyste Semences", color: "bg-purple-500" },
    agronomist: { label: "Agronome", color: "bg-teal-500" },
    trainer: { label: "Formateur", color: "bg-orange-500" },
  };
  return config[role] || { label: role, color: "bg-slate-500" };
};

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoTourOpen, setDemoTourOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const navData = getNavGroups(user?.role, t);
  const roleBadge = getRoleBadge(user?.role);

  // === Group expansion state — auto-open the group of the active route ===
  const findActiveGroupId = useCallback(() => {
    for (const g of navData.groups) {
      if (g.items.some(it => location.pathname === it.path)) return g.id;
    }
    return null;
  }, [navData.groups, location.pathname]);

  const [expandedGroups, setExpandedGroups] = useState(() => {
    const saved = localStorage.getItem("agricam_nav_groups");
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return {};
  });

  useEffect(() => {
    const activeId = findActiveGroupId();
    if (activeId && !expandedGroups[activeId]) {
      setExpandedGroups(prev => ({ ...prev, [activeId]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      localStorage.setItem("agricam_nav_groups", JSON.stringify(next));
      return next;
    });
  };
  
  // Guided Tour — only on dashboard route to avoid blocking other pages' CTAs
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    const done = localStorage.getItem("agricam_tour_done");
    // Only show on the main dashboard, never on feature pages where it covers buttons
    if (location.pathname !== "/dashboard") return;
    if (!done) { const timer = setTimeout(() => setShowTour(true), 2000); return () => clearTimeout(timer); }
  }, [location.pathname]);
  
  // Exit intent detection
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitShown, setExitShown] = useState(false);

  useEffect(() => {
    if (exitShown || user?.subscription_type === "premium") return;
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitShown) {
        setShowExitModal(true);
        setExitShown(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [exitShown, user?.subscription_type]);

  // Track page views
  React.useEffect(() => {
    // Apply saved theme on load
    const savedTheme = localStorage.getItem("agricam_theme");
    if (savedTheme) {
      const THEME_MAP = {
        dark: { accent: "#10b981", bg: "#0a0f1a", card: "#111827", text: "#e2e8f0" },
        light: { accent: "#059669", bg: "#f8fafc", card: "#ffffff", text: "#1e293b" },
        emerald: { accent: "#34d399", bg: "#022c22", card: "#064e3b", text: "#d1fae5" },
        ocean: { accent: "#22d3ee", bg: "#0c1929", card: "#0f2a47", text: "#cffafe" },
        sunset: { accent: "#fb923c", bg: "#1c0f0a", card: "#3b1a0e", text: "#fed7aa" },
        purple: { accent: "#a78bfa", bg: "#0f0a1e", card: "#1e1145", text: "#e0d5ff" },
        forest: { accent: "#84cc16", bg: "#0a1a0a", card: "#14341c", text: "#d9f99d" },
        sahel: { accent: "#fbbf24", bg: "#1a150a", card: "#3d2e0f", text: "#fef3c7" },
        volcanic: { accent: "#ef4444", bg: "#1a0a0a", card: "#2d1111", text: "#fecaca" },
        savanna: { accent: "#a3e635", bg: "#1a1a0a", card: "#2e3311", text: "#ecfccb" },
      };
      const th = THEME_MAP[savedTheme];
      if (th) {
        const root = document.documentElement;
        root.setAttribute("data-theme", savedTheme);
        root.style.setProperty("--theme-accent", th.accent);
        root.style.setProperty("--theme-bg", th.bg);
        root.style.setProperty("--theme-card", th.card);
        root.style.setProperty("--theme-text", th.text);
      }
    }
  }, []);

  React.useEffect(() => {
    const trackActivity = async () => {
      try {
        const token = localStorage.getItem("agricam_token");
        if (!token) return;
        await fetch(`${API}/api/tracking/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ event: "page_view", page: location.pathname })
        });
      } catch {}
    };
    trackActivity();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#0a0f1a] grid-bg scan-line">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 z-50 lg:hidden text-lime-400",
          isRTL ? "right-4" : "left-4"
        )}
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="mobile-menu-btn"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar - Dark Futuristic */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 z-40 bg-[#0b1120] shadow-2xl transition-all duration-300",
          isRTL ? "right-0 border-l border-lime-900/30" : "left-0 border-r border-lime-900/30",
          collapsed ? "w-20" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 p-4 border-b border-lime-900/20",
            collapsed ? "justify-center" : "px-6"
          )}>
            <img 
              src={LOGO_URL} 
              alt="AGRICAM IA" 
              className={cn("transition-all rounded-lg shadow-[0_0_20px_rgba(132,204,22,0.25)]", collapsed ? "h-10 w-10" : "h-12 w-12")}
            />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-white font-[Manrope]">
                  AGRICAM <span className="text-lime-400">IA</span>
                </h1>
                <p className="text-xs text-amber-300/70">{t("common.precisionAg") || "Agriculture de précision"}</p>
              </div>
            )}
          </div>

          {/* User Info */}
          {!collapsed && user && (
            <div className="p-4 border-b border-lime-900/20">
              <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-lime-900/40 flex items-center justify-center ring-2 ring-lime-500/30 overflow-hidden">
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-lime-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{user.full_name}</p>
                  <Badge className={cn("text-xs text-white", roleBadge.color)}>
                    {roleBadge.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation - Grouped */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {/* Direct items (Dashboard, role-specific dashboard) */}
              {navData.direct.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ActionTooltip key={item.path} content={item.tooltip || item.label} side={isRTL ? "left" : "right"}>
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      data-testid={`nav-${item.path.slice(1)}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "hover:bg-lime-900/30 hover:text-lime-300",
                        isActive
                          ? cn(
                              "bg-gradient-to-r from-lime-900/40 to-amber-900/20 text-lime-300 font-medium shadow-[0_0_15px_rgba(132,204,22,0.15)]",
                              isRTL ? "border-r-2 border-lime-400" : "border-l-2 border-lime-400"
                            )
                          : "text-slate-400",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-lime-300" : "text-slate-500")} />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                  </ActionTooltip>
                );
              })}

              {/* Grouped items */}
              {navData.groups.map((group) => {
                const isExpanded = !!expandedGroups[group.id];
                const hasActive = group.items.some(it => location.pathname === it.path);
                const GroupIcon = group.icon;

                if (collapsed) {
                  // When collapsed, render group children as a flat list (no expand button)
                  return (
                    <div key={group.id} className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <ActionTooltip key={item.path} content={`${group.label} • ${item.label}\n${item.tooltip || ""}`} side={isRTL ? "left" : "right"}>
                            <NavLink
                              to={item.path}
                              onClick={() => setMobileOpen(false)}
                              data-testid={`nav-${item.path.slice(1)}`}
                              className={cn(
                                "flex items-center justify-center gap-3 px-2 py-2.5 rounded-lg transition-all",
                                "hover:bg-lime-900/30 hover:text-lime-300",
                                isActive ? "bg-lime-900/40 text-lime-300" : "text-slate-400"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5", isActive ? "text-lime-300" : "text-slate-500")} />
                            </NavLink>
                          </ActionTooltip>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div key={group.id} className="pt-1">
                    <ActionTooltip content={group.description} side={isRTL ? "left" : "right"}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        data-testid={`nav-group-${group.id}`}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                          "hover:bg-lime-900/20",
                          hasActive ? "text-lime-300" : "text-slate-300"
                        )}
                      >
                        <GroupIcon className={cn("h-5 w-5 flex-shrink-0", hasActive ? "text-amber-400" : "text-lime-500/80")} />
                        <span className="text-sm font-semibold flex-1 uppercase tracking-wider text-[11px]">{group.label}</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-0 text-lime-400" : "-rotate-90 text-slate-500")} />
                      </button>
                    </ActionTooltip>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300",
                        isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className={cn("mt-1 space-y-0.5", isRTL ? "mr-3 border-r border-lime-900/20 pr-3" : "ml-3 border-l border-lime-900/20 pl-3")}>
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <ActionTooltip key={item.path} content={item.tooltip || item.label} side={isRTL ? "left" : "right"}>
                              <NavLink
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                data-testid={`nav-${item.path.slice(1)}`}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm",
                                  "hover:bg-lime-900/30 hover:text-lime-200",
                                  isActive
                                    ? "bg-lime-900/40 text-lime-200 font-medium shadow-[inset_0_0_0_1px_rgba(132,204,22,0.25)]"
                                    : "text-slate-400"
                                )}
                              >
                                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-amber-400" : "text-slate-500")} />
                                <span>{item.label}</span>
                              </NavLink>
                            </ActionTooltip>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom direct items (Alertes, Paramètres) */}
              <div className="pt-3 mt-3 border-t border-lime-900/20 space-y-1">
                {navData.bottom.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ActionTooltip key={item.path} content={item.tooltip || item.label} side={isRTL ? "left" : "right"}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        data-testid={`nav-${item.path.slice(1)}`}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          "hover:bg-lime-900/30 hover:text-lime-300",
                          isActive ? "bg-lime-900/40 text-lime-300 font-medium" : "text-slate-400",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", isActive ? "text-amber-400" : "text-slate-500")} />
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                      </NavLink>
                    </ActionTooltip>
                  );
                })}
              </div>
            </nav>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-lime-900/20 space-y-2">
            <ActionTooltip content={t("nav.logout")} side={isRTL ? "left" : "right"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full text-red-400 hover:text-red-300 hover:bg-red-900/20",
                  collapsed ? "justify-center" : "justify-start"
                )}
                data-testid="logout-btn"
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="ml-2">{t("nav.logout")}</span>}
              </Button>
            </ActionTooltip>

            <ActionTooltip content={collapsed ? t("common.expand") || "Agrandir" : t("common.collapse") || "Réduire"} side={isRTL ? "left" : "right"}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full justify-center text-slate-500 hover:text-lime-400 hidden lg:flex"
                data-testid="collapse-sidebar-btn"
              >
                {collapsed ? (
                  isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
                ) : (
                  <>
                    {isRTL ? <ChevronRight className="h-5 w-5 ml-2" /> : <ChevronLeft className="h-5 w-5 mr-2" />}
                    <span>{t("common.collapse") || "Reduire"}</span>
                  </>
                )}
              </Button>
            </ActionTooltip>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0a0f1a]">
        {/* Top Header Bar - Dark Glass */}
        <header className="bg-[#0b1120]/90 backdrop-blur-xl border-b border-lime-900/20 px-4 lg:px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="lg:hidden w-10"></div>
            
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
              {/* Demo Tour launcher — admins only, optimized for investor pitch */}
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDemoTourOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-lime-500/10 hover:from-amber-500/20 hover:to-lime-500/20 text-amber-400 hover:text-amber-300 ring-1 ring-amber-500/30 h-9 px-3"
                  title="Lancer le mode Demo Pitch (2 minutes auto)"
                  data-testid="launch-demo-tour-btn"
                >
                  <span aria-hidden>🎬</span>
                  <span className="text-xs font-semibold">Mode Demo</span>
                </Button>
              )}

              {/* Language Selector */}
              <LanguageSelector variant="ghost" showLabel={true} />

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-lime-400" data-testid="user-menu-btn">
                    <div className="h-8 w-8 rounded-full bg-lime-900/40 flex items-center justify-center ring-1 ring-lime-500/30">
                      <User className="h-4 w-4 text-lime-400" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{user?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 bg-[#111827] border-slate-700">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium text-white">{user?.full_name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={() => navigate("/parametres")} className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                    <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("nav.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/alertes")} className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800">
                    <Bell className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("nav.alerts")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-900/20">
                    <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    Deconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="min-h-full p-4 lg:p-8">
          <Outlet />
        </div>

        {/* Footer - Dark */}
        <footer className="bg-[#0b1120] border-t border-emerald-900/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© 2024 African AI Solutions</p>
            <p>Developpe par <span className="font-semibold text-emerald-400">Barra Martial Aristide</span></p>
          </div>
        </footer>
      </main>
      <ExitIntentModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}
      <DemoTour open={demoTourOpen} onClose={() => setDemoTourOpen(false)} />
    </div>
  );
};

export default Layout;
