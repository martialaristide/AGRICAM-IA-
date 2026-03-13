import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Package, TrendingUp, Truck, ShoppingCart, AlertTriangle,
  MapPin, Clock, BarChart3, Target, Users, Zap,
  ArrowRight, RefreshCw, DollarSign, Calendar, Box,
  Plus, Download, Bell, Activity, Search
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const SupplierDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [demandForecast, setDemandForecast] = useState([]);
  const [logistics, setLogistics] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forecastRes, logisticsRes, inventoryRes, revenueRes] = await Promise.all([
          api.get("/supplier-analytics/demand-forecast").catch(() => ({ data: [] })),
          api.get("/supplier-analytics/logistics-optimization").catch(() => ({ data: null })),
          api.get("/supplier-analytics/inventory-alerts").catch(() => ({ data: [] })),
          api.get("/supplier-analytics/revenue-analytics").catch(() => ({ data: null })),
        ]);
        setDemandForecast(forecastRes.data || []);
        setLogistics(logisticsRes.data);
        setInventoryAlerts(inventoryRes.data || []);
        setRevenueData(revenueRes.data);
      } catch {}
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="supplier-dashboard">
      <div className="gradient-marketplace rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
            <Package className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-[Manrope]">{t("roles.supplier.title")}</h1>
            <p className="text-slate-400">{t("roles.supplier.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: t("pages.dashboard.overview"), icon: BarChart3 },
          { id: "demand", label: t("roles.supplier.demandForecast"), icon: TrendingUp },
          { id: "logistics", label: t("roles.supplier.logistics"), icon: Truck },
          { id: "stock", label: t("roles.supplier.stockManagement"), icon: Box },
          { id: "cross", label: t("roles.supplier.crossSelling"), icon: Target },
        ].map(tab => (
          <Button key={tab.id} size="sm" className={cn("gap-2 whitespace-nowrap", activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700")} onClick={() => setActiveTab(tab.id)}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: "Produits", value: demandForecast.length, icon: Package, color: "blue" },
              { label: "Livraisons actives", value: logistics?.active_deliveries || 0, icon: Truck, color: "emerald" },
              { label: "Chiffre d'affaires", value: revenueData ? `${(revenueData.total_revenue_xaf / 1000000).toFixed(1)}M XAF` : "N/A", icon: DollarSign, color: "violet" },
              { label: "Croissance", value: revenueData ? `+${revenueData.growth_rate_percent}%` : "N/A", icon: TrendingUp, color: "cyan" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-2 text-${s.color}-400`} />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inventory Alerts */}
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Alertes inventaire</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {inventoryAlerts.map((a, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg",
                    a.severity === "critical" ? "bg-red-900/15 border border-red-800/30" :
                    a.severity === "warning" ? "bg-amber-900/15 border border-amber-800/30" :
                    "bg-slate-800/30"
                  )}>
                    <AlertTriangle className={cn("h-4 w-4 flex-shrink-0", a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-amber-400" : "text-emerald-400")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{a.product}</p>
                      <p className="text-xs text-slate-500">Stock: {a.current_stock} / Min: {a.min_stock}</p>
                    </div>
                    <Badge className={cn("text-xs", a.severity === "critical" ? "bg-red-500 text-white" : a.severity === "warning" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")}>{a.severity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Revenue by segment */}
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">Segments clients</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {(revenueData?.customer_segments || []).map((seg, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 flex-1 truncate">{seg.segment}</span>
                    <Progress value={seg.revenue_percent} className="h-2 w-24" />
                    <span className="text-sm text-white w-20 text-right">{seg.count} ({seg.revenue_percent}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "demand" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">Prevision de la demande IA</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {demandForecast.map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{d.product}</span>
                  <Badge className={cn("text-xs", d.trend === "increasing" ? "bg-emerald-900/40 text-emerald-400" : d.trend === "stable" ? "bg-blue-900/40 text-blue-400" : "bg-red-900/40 text-red-400")}>{d.trend}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div><span className="text-slate-500">Stock: </span><span className="text-white">{d.current_stock}</span></div>
                  <div><span className="text-slate-500">Seuil: </span><span className="text-amber-400">{d.reorder_point}</span></div>
                  <div><span className="text-slate-500">Optimal: </span><span className="text-emerald-400">{d.optimal_stock}</span></div>
                </div>
                <div className="flex gap-1.5">
                  {(d.monthly_demand || []).map((m, j) => (
                    <div key={j} className="flex-1 p-1.5 rounded bg-slate-900/50 text-center">
                      <p className="text-[10px] text-slate-500">{m.month}</p>
                      <p className="text-xs font-bold text-white">{m.predicted_qty}</p>
                      <p className="text-[10px] text-slate-600">{m.confidence}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "logistics" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Logistique intelligente</CardTitle>
              {logistics?.cost_savings_percent && (
                <Badge className="bg-emerald-900/40 text-emerald-400">Economies: {logistics.cost_savings_percent}%</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {logistics?.optimization_suggestion && (
              <div className="p-3 bg-emerald-900/15 border border-emerald-800/30 rounded-lg text-sm text-emerald-400">
                {logistics.optimization_suggestion}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                <p className="text-xs text-slate-500">Taux ponctualite</p>
                <p className="text-xl font-bold text-emerald-400">{logistics?.on_time_rate_percent || 0}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                <p className="text-xs text-slate-500">Temps moyen</p>
                <p className="text-xl font-bold text-blue-400">{logistics?.avg_delivery_hours || 0}h</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                <p className="text-xs text-slate-500">Cout carburant</p>
                <p className="text-xl font-bold text-amber-400">{(logistics?.fuel_cost_month_xaf || 0).toLocaleString()} XAF</p>
              </div>
            </div>
            {(logistics?.routes || []).map((r, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50" data-testid={`route-${i}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{r.origin} - {r.destination}</p>
                    <p className="text-xs text-slate-500">{r.distance_km}km - {r.estimated_hours}h - {r.load_kg}kg</p>
                  </div>
                  <Badge className={cn("text-white text-xs", r.status === "delivered" ? "bg-emerald-500" : r.status === "en_route" ? "bg-blue-500" : "bg-amber-500")}>{r.status}</Badge>
                </div>
                <p className="text-sm text-slate-400">Cout: {r.cost_xaf?.toLocaleString()} XAF</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "stock" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" />Gestion des stocks</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            {inventoryAlerts.map((a, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", a.severity === "critical" ? "border-l-red-500 bg-red-900/10" : a.severity === "warning" ? "border-l-amber-500 bg-amber-900/10" : "border-l-emerald-500 bg-emerald-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-white font-medium">{a.product}</p><p className="text-xs text-slate-500">Stock: {a.current_stock} / Min: {a.min_stock}</p></div>
                  <Badge className={cn("text-white text-xs", a.severity === "critical" ? "bg-red-500" : a.severity === "warning" ? "bg-amber-500" : "bg-emerald-500")}>{a.alert}</Badge>
                </div>
                {a.reorder_qty > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">Commander: {a.reorder_qty} unites (delai: {a.supplier_lead_days}j)</p>
                    <Button size="sm" className="bg-emerald-600 text-xs h-7" onClick={() => toast.success(`Commande de ${a.reorder_qty} unites lancee`)}>Commander</Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "cross" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">Revenue et ventes</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {revenueData?.top_products && (
              <div>
                <h4 className="text-sm text-white font-medium mb-3">Top produits</h4>
                {revenueData.top_products.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 mb-2">
                    <span className="text-sm text-white flex-1">{p.product}</span>
                    <span className="text-sm text-emerald-400 font-bold">{p.revenue_xaf?.toLocaleString()} XAF</span>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{p.units_sold} vendus</Badge>
                    <Badge className="bg-emerald-900/40 text-emerald-400 text-xs">{p.margin_percent}% marge</Badge>
                  </div>
                ))}
              </div>
            )}
            {revenueData?.monthly_revenue && (
              <div>
                <h4 className="text-sm text-white font-medium mb-3">Revenue mensuel</h4>
                <div className="flex gap-2">
                  {revenueData.monthly_revenue.map((m, i) => (
                    <div key={i} className="flex-1 p-3 rounded-lg bg-slate-800/30 text-center">
                      <p className="text-xs text-slate-500">{m.month}</p>
                      <p className="text-sm font-bold text-white">{(m.revenue_xaf / 1000000).toFixed(1)}M</p>
                      <p className="text-[10px] text-slate-600">{m.orders} cmd</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierDashboard;
