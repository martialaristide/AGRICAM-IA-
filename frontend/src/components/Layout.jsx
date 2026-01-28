import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
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
  Leaf,
  Menu
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { path: "/parcelles", icon: Map, label: "Parcelles" },
  { path: "/capteurs", icon: Wifi, label: "Capteurs IoT" },
  { path: "/drones", icon: Plane, label: "Gestion Drones" },
  { path: "/satellites", icon: Satellite, label: "Images satellites" },
  { path: "/analyse-ia", icon: ScanSearch, label: "Analyse Images IA" },
  { path: "/irrigation", icon: Droplets, label: "Irrigation Auto" },
  { path: "/recommandations", icon: Lightbulb, label: "Recommandations IA" },
  { path: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/alertes", icon: Bell, label: "Alertes" },
  { path: "/parametres", icon: Settings, label: "Paramètres" },
];

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
        <Menu className="h-6 w-6" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-slate-900 font-[Manrope]">AGRICAM IA</h1>
                <p className="text-xs text-slate-500">Agriculture de précision</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
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
              })}
            </nav>
          </ScrollArea>

          {/* Collapse Button */}
          <div className="p-3 border-t border-slate-100 hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-center text-slate-500 hover:text-slate-700"
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
        <div className="min-h-full p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
