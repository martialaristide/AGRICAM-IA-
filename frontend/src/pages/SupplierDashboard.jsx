import React, { useState } from "react";
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

const SupplierDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = { totalProducts: 156, activeOrders: 23, monthlyRevenue: "2.4M", expiringStock: 8, deliveries: 12, customers: 89 };

  const demandForecast = [
    { product: "NPK 20-10-10", region: "Centre", currentStock: 450, predictedDemand: 680, peakMonth: "Mars", trend: "+52%" },
    { product: "Uree 46%", region: "Extreme-Nord", currentStock: 320, predictedDemand: 510, peakMonth: "Avril", trend: "+59%" },
    { product: "Semences Mais CAMIR", region: "Ouest", currentStock: 200, predictedDemand: 340, peakMonth: "Mars", trend: "+70%" },
    { product: "Glyphosate 360", region: "Littoral", currentStock: 180, predictedDemand: 150, peakMonth: "Mai", trend: "-17%" },
  ];

  const deliveryRoutes = [
    { id: "LIV-001", dest: "Bafoussam -> Dschang -> Mbouda", items: 12, status: "en_route", eta: "14h30", driver: "Paul M.", progress: 65 },
    { id: "LIV-002", dest: "Yaounde -> Mbalmayo -> Ebolowa", items: 8, status: "loading", eta: "16h00", driver: "Jean K.", progress: 15 },
    { id: "LIV-003", dest: "Douala -> Nkongsamba -> Bafang", items: 15, status: "delivered", eta: "Livre", driver: "Awa S.", progress: 100 },
  ];

  const expiringProducts = [
    { product: "Fongicide Mancozebe", batch: "LOT-234", expiry: "2026-04-15", stock: 45, daysLeft: 33, action: "Promo -30%" },
    { product: "Insecticide Cypermethrine", batch: "LOT-189", expiry: "2026-04-01", stock: 22, daysLeft: 19, action: "Promo -50%" },
    { product: "Herbicide Atrazine", batch: "LOT-312", expiry: "2026-05-10", stock: 67, daysLeft: 58, action: "Surveiller" },
  ];

  const crossSellSuggestions = [
    { trigger: "NPK 20-10-10", suggest: "Correcteur pH sol", conversion: "34%", reason: "87% des clients achètent les deux" },
    { trigger: "Semences Mais", suggest: "Engrais starter DAP", conversion: "45%", reason: "Synergie semis + fertilisation" },
    { trigger: "Glyphosate", suggest: "EPI Pulverisateur", conversion: "22%", reason: "Securite et conformite" },
  ];

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: t("roles.supplier.totalProducts"), value: stats.totalProducts, icon: Package, color: "blue" },
              { label: t("roles.supplier.activeOrders"), value: stats.activeOrders, icon: ShoppingCart, color: "emerald" },
              { label: t("roles.admin.monthlyRevenue"), value: stats.monthlyRevenue, icon: DollarSign, color: "violet" },
              { label: t("roles.supplier.expiringStock"), value: stats.expiringStock, icon: AlertTriangle, color: "red" },
              { label: t("roles.supplier.deliveryRoutes"), value: stats.deliveries, icon: Truck, color: "amber" },
              { label: "Clients", value: stats.customers, icon: Users, color: "cyan" },
            ].map((s, i) => (
              <Card key={i} className="glass-card card-hover"><CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-2 text-${s.color}-400`} />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </CardContent></Card>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">{t("roles.supplier.topProducts")}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {["NPK 20-10-10", "Semences Mais", "Uree 46%", "Glyphosate 360", "Fongicide Mancozebe"].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-36 truncate">{p}</span>
                    <Progress value={90 - i * 15} className="h-2 flex-1" />
                    <span className="text-sm text-white w-12 text-right">{[245, 189, 156, 122, 98][i]}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white text-base">{t("roles.supplier.salesTrend")}</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-3">
                {["Jan", "Fev", "Mar"].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <span className="text-sm text-slate-400">{m} 2026</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{[1.8, 2.1, 2.4][i]}M XAF</span>
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "demand" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.supplier.demandForecast")} - {t("roles.supplier.regionalDemand")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-800/50">
                  {["Produit", "Region", "Stock actuel", "Demande prevue", "Pic", "Tendance"].map(h => <th key={h} className="text-left p-3 text-xs font-medium text-slate-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>{demandForecast.map((d, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                    <td className="p-3 text-sm text-white font-medium">{d.product}</td>
                    <td className="p-3 text-sm text-slate-400">{d.region}</td>
                    <td className="p-3"><span className={cn("text-sm font-bold", d.currentStock < d.predictedDemand ? "text-red-400" : "text-emerald-400")}>{d.currentStock} u</span></td>
                    <td className="p-3 text-sm text-white">{d.predictedDemand} u</td>
                    <td className="p-3"><Badge className="bg-amber-900/30 text-amber-400 text-xs">{d.peakMonth}</Badge></td>
                    <td className="p-3"><span className={cn("text-sm font-bold", d.trend.startsWith("+") ? "text-emerald-400" : "text-red-400")}>{d.trend}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "logistics" && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/50">
            <CardTitle className="text-white">{t("roles.supplier.routeOptimization")}</CardTitle>
            <Button size="sm" className="bg-emerald-600 gap-2"><Plus className="h-4 w-4" /> Nouvelle tournee</Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {deliveryRoutes.map(r => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50" data-testid={`route-${r.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">{r.id} - {r.driver}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.dest}</p>
                  </div>
                  <Badge className={cn("text-white text-xs", r.status === "delivered" ? "bg-emerald-500" : r.status === "en_route" ? "bg-blue-500" : "bg-amber-500")}>
                    {r.status === "delivered" ? "Livre" : r.status === "en_route" ? "En route" : "Chargement"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={r.progress} className="h-2 flex-1" />
                  <span className="text-sm text-slate-400">{r.items} articles - ETA: {r.eta}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "stock" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-400" />{t("roles.supplier.expiryAlert")}</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            {expiringProducts.map((p, i) => (
              <div key={i} className={cn("p-4 rounded-xl border-l-4", p.daysLeft < 30 ? "border-l-red-500 bg-red-900/10" : "border-l-amber-500 bg-amber-900/10")}>
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-white font-medium">{p.product}</p><p className="text-xs text-slate-500">{p.batch} - Stock: {p.stock} unites</p></div>
                  <Badge className={cn("text-white", p.daysLeft < 30 ? "bg-red-500" : "bg-amber-500")}>{p.daysLeft}j restants</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">Expiration: {p.expiry}</p>
                  <Button size="sm" className="bg-amber-600 text-xs h-7" onClick={() => toast.success(`${t("roles.supplier.flashPromo")} activee pour ${p.product}`)}>{p.action}</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "cross" && (
        <Card className="glass-card">
          <CardHeader className="border-b border-slate-800/50"><CardTitle className="text-white">{t("roles.supplier.crossSelling")} - {t("roles.supplier.customerSuggestion")}</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-4">
            {crossSellSuggestions.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-blue-900/30 text-blue-400">{c.trigger}</Badge>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                  <Badge className="bg-emerald-900/30 text-emerald-400">{c.suggest}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{c.reason}</p>
                  <span className="text-sm font-bold text-emerald-400">Conversion: {c.conversion}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierDashboard;
