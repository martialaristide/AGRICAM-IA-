import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  LayoutDashboard,
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
  Banknote,
  GraduationCap,
  X,
  Smartphone,
  Bot,
  Camera,
  Code2,
  Microscope
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

const API = process.env.REACT_APP_BACKEND_URL;

// Notification Bell Component
const NotificationBell = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const fetchNotifications = async () => {
    try {
      // Default GPS: Bamenda, Cameroun. Real coords will come from parcels
      const res = await fetch(`${API}/api/climate-notifications?lat=5.9631&lon=10.1591`);
      const data = await res.json();
      setNotifications(data.alerts || []);
    } catch {}
  };

  React.useEffect(() => { fetchNotifications(); const iv = setInterval(fetchNotifications, 120000); return () => clearInterval(iv); }, []);

  const unread = notifications.filter(n => !n.read).length;
  const severityIcon = (s) => s === "critical" ? "text-red-500" : s === "warning" ? "text-amber-500" : "text-blue-500";

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setOpen(!open)} data-testid="notification-bell">
        <Bell className="h-4 w-4 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">{unread}</span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-96 overflow-hidden" data-testid="notification-panel">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-semibold text-sm">Alertes Climat</span>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">OpenWeatherMap</Badge>
              <Badge variant="outline" className="text-xs">{notifications.length}</Badge>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Aucune alerte</p>
            ) : notifications.map((n, i) => (
              <div key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { const updated = [...notifications]; updated[i] = {...n, read: true}; setNotifications(updated); }}>
                <div className="flex items-start gap-2">
                  <Bell className={cn("h-4 w-4 mt-0.5 flex-shrink-0", severityIcon(n.severity))} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleString("fr-FR")}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LOGO_URL = "https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png";

const getNavItems = (role, t) => {
  const baseItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
  ];
  
  if (role === "admin") {
    return [
      ...baseItems,
      { path: "/admin", icon: Shield, label: t("nav.admin") || "Administration" },
      { path: "/parcelles", icon: Map, label: t("nav.parcels") },
      { path: "/capteurs", icon: Wifi, label: t("nav.sensors") },
      { path: "/drones-avance", icon: Plane, label: t("nav.drones") },
      { path: "/robots-avance", icon: Bot, label: t("nav.robots") },
      { path: "/satellites", icon: Satellite, label: t("nav.satellites") || "Satellites" },
      { path: "/agribot-ia", icon: ScanSearch, label: t("nav.agribot") },
      { path: "/analyse-avancee", icon: Microscope, label: t("nav.advancedAnalysis") || "Analyse Avancee" },
      { path: "/camera-ia", icon: Camera, label: t("nav.camera") },
      { path: "/irrigation", icon: Droplets, label: t("nav.irrigation") },
      { path: "/recommandations", icon: Lightbulb, label: t("nav.recommendations") },
      { path: "/marketplace", icon: ShoppingCart, label: t("nav.marketplace") },
      { path: "/paiements", icon: Smartphone, label: "Mobile Money" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/analytics", icon: BarChart3, label: t("nav.analytics") },
      { path: "/dev-analytics", icon: Code2, label: "Analytics Dev" },
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
      { path: "/paiements", icon: Smartphone, label: "Mobile Money" },
      { path: "/financial", icon: Banknote, label: t("nav.financial") || "Finances" },
      { path: "/formation", icon: GraduationCap, label: t("nav.elearning") },
      { path: "/alertes", icon: Bell, label: t("nav.alerts") },
      { path: "/parametres", icon: Settings, label: t("nav.settings") },
    ];
  }
      { path: "/parametres", icon: Settings, label: "Paramètres", tooltip: "Votre profil et préférences" },
    ];
  }
  
  if (role === "supplier") {
    return [
      ...baseItems,
      { path: "/marketplace", icon: ShoppingCart, label: "Mes Produits", tooltip: "Gérer vos produits en vente" },
      { path: "/analytics", icon: BarChart3, label: "Ventes", tooltip: "Analyser vos performances commerciales" },
      { path: "/alertes", icon: Bell, label: "Commandes", tooltip: "Voir les nouvelles commandes" },
      { path: "/parametres", icon: Settings, label: "Paramètres", tooltip: "Configurer votre boutique" },
    ];
  }
  
  if (role === "financial") {
    return [
      ...baseItems,
      { path: "/financial", icon: Banknote, label: "Prêts & Crédits", tooltip: "Gérer les demandes de prêts agricoles" },
      { path: "/analytics", icon: BarChart3, label: "Analytics", tooltip: "Statistiques des prêts et remboursements" },
      { path: "/alertes", icon: Bell, label: "Demandes", tooltip: "Nouvelles demandes de financement" },
      { path: "/parametres", icon: Settings, label: "Paramètres", tooltip: "Configuration de votre institution" },
    ];
  }
  
  // Default (partner, investor)
  return [
    ...baseItems,
    { path: "/analytics", icon: BarChart3, label: "Analytics", tooltip: "Statistiques et performances" },
    { path: "/marketplace", icon: ShoppingCart, label: "Marketplace", tooltip: "Explorer le marché agricole" },
    { path: "/parametres", icon: Settings, label: "Paramètres", tooltip: "Votre profil et préférences" },
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
  };
  return config[role] || { label: role, color: "bg-slate-500" };
};

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const navItems = getNavItems(user?.role);
  const roleBadge = getRoleBadge(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="mobile-menu-btn"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 p-4 border-b border-slate-100",
            collapsed ? "justify-center" : "px-6"
          )}>
            <img 
              src={LOGO_URL} 
              alt="African AI Solutions" 
              className={cn("transition-all", collapsed ? "h-8 w-8" : "h-10 w-10")}
            />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-slate-900 font-[Manrope]">
                  AGRICAM <span className="text-emerald-600">IA</span>
                </h1>
                <p className="text-xs text-slate-500">Agriculture de précision</p>
              </div>
            )}
          </div>

          {/* User Info */}
          {!collapsed && user && (
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{user.full_name}</p>
                  <Badge className={cn("text-xs text-white", roleBadge.color)}>
                    {roleBadge.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const navContent = (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    data-testid={`nav-${item.path.slice(1)}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-emerald-50 hover:text-emerald-700",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-l-3 border-emerald-500 font-medium"
                        : "text-slate-600",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-emerald-600" : "text-slate-400"
                    )} />
                    {!collapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </NavLink>
                );
                
                return collapsed ? (
                  <ActionTooltip key={item.path} content={item.tooltip} side="right">
                    {navContent}
                  </ActionTooltip>
                ) : (
                  <ActionTooltip key={item.path} content={item.tooltip} side="right">
                    {navContent}
                  </ActionTooltip>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-slate-100 space-y-2">
            {/* Logout Button */}
            <ActionTooltip content="Se déconnecter de votre compte AGRICAM IA" side="right">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full text-red-600 hover:text-red-700 hover:bg-red-50",
                  collapsed ? "justify-center" : "justify-start"
                )}
                data-testid="logout-btn"
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && <span className="ml-2">Déconnexion</span>}
              </Button>
            </ActionTooltip>

            {/* Collapse Button (Desktop only) */}
            <ActionTooltip content={collapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral"} side="right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full justify-center text-slate-500 hover:text-slate-700 hidden lg:flex"
                data-testid="collapse-sidebar-btn"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    <span>Réduire</span>
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="lg:hidden w-10"></div>
            
            <div className="flex-1 flex items-center justify-end gap-4">
              {/* Language Selector */}
              <LanguageSelector variant="ghost" showLabel={true} />

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-btn">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{user?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/parametres")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/alertes")}>
                    <Bell className="mr-2 h-4 w-4" />
                    Alertes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="min-h-full p-4 lg:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© 2024 African AI Solutions</p>
            <p>Développé par <span className="font-semibold text-emerald-600">Barra Martial Aristide</span></p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
