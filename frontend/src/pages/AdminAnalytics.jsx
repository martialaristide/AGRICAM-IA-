import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Users, MapPin, Wifi, ShoppingCart, TrendingUp, Banknote,
  AlertTriangle, Activity, Globe, Sprout, RefreshCw, Download,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { toast } from "sonner";

const COLORS = {
  primary: "#84cc16",
  accent: "#f59e0b",
  blue: "#0ea5e9",
  purple: "#a855f7",
  red: "#ef4444",
  green: "#10b981",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

const CHART_COLORS = [
  COLORS.primary, COLORS.accent, COLORS.blue, COLORS.purple,
  COLORS.green, COLORS.pink, COLORS.cyan, COLORS.red,
];

const formatXAF = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const formatNumber = (n) => new Intl.NumberFormat("fr-FR").format(n);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics-presentation");
      setData(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportData = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agricam-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exportées");
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-lime-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const k = data.kpi;
  const kpiCards = [
    { icon: Users, label: "Utilisateurs", value: formatNumber(k.total_users), sub: `${formatNumber(k.active_users)} actifs`, color: "bg-lime-500", testid: "kpi-users" },
    { icon: MapPin, label: "Parcelles", value: formatNumber(k.total_parcels), sub: `${formatNumber(k.total_surface_ha)} ha`, color: "bg-amber-500", testid: "kpi-parcels" },
    { icon: Wifi, label: "Capteurs IoT", value: formatNumber(k.total_sensors), sub: `${formatNumber(k.sensors_active)} en ligne`, color: "bg-blue-500", testid: "kpi-sensors" },
    { icon: Banknote, label: "Revenus", value: formatXAF(k.total_revenue_xaf), sub: `${formatNumber(k.successful_payments)} paiements`, color: "bg-emerald-500", testid: "kpi-revenue" },
    { icon: ShoppingCart, label: "Marketplace", value: formatXAF(k.marketplace_gmv_xaf), sub: `${formatNumber(k.total_orders)} commandes`, color: "bg-purple-500", testid: "kpi-marketplace" },
    { icon: AlertTriangle, label: "Alertes", value: formatNumber(k.total_alerts), sub: `${formatNumber(k.unread_alerts)} non lues`, color: "bg-rose-500", testid: "kpi-alerts" },
  ];

  // Translate role labels
  const roleLabels = {
    farmer: "Agriculteurs",
    agronomist: "Agronomes",
    supplier: "Fournisseurs",
    seed_analyst: "Analystes semences",
    trainer: "Formateurs",
    financial: "Banquiers",
    admin: "Administrateurs",
    partner: "Partenaires",
  };
  const roleData = data.role_distribution.map((r) => ({ name: roleLabels[r.role] || r.role, value: r.count }));

  return (
    <div className="space-y-6 p-4 lg:p-6" data-testid="admin-analytics-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-lime-500" />
            Analytics — Tableau de bord exécutif
          </h1>
          <p className="text-slate-500 mt-1">Vue temps réel de la plateforme AGRICAM IA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAnalytics} variant="outline" size="sm" data-testid="refresh-analytics-btn">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
          <Button onClick={exportData} variant="outline" size="sm" data-testid="export-analytics-btn">
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} data-testid={kpi.testid} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs text-slate-500 uppercase font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Croissance utilisateurs + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-lime-500" /> Croissance utilisateurs (12 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.user_growth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke={COLORS.primary} fill="url(#userGrad)" strokeWidth={2} name="Nouveaux utilisateurs" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-500" /> Revenus mensuels (FCFA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.revenue_growth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip formatter={(v) => formatXAF(v)} contentStyle={{ borderRadius: 8 }} />
                <Bar dataKey="amount" fill={COLORS.green} radius={[6, 6, 0, 0]} name="Revenu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Pie roles + Pie subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-lime-500" /> Répartition par rôle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} dataKey="value">
                  {roleData.map((entry, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-500" /> Top 10 cultures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.top_crops} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="crop" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} radius={[0, 6, 6, 0]} name="Parcelles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" /> Abonnements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%"
                data={data.subscription_distribution.map((s, i) => ({ ...s, fill: CHART_COLORS[i] }))}>
                <RadialBar minAngle={15} label={{ position: "insideStart", fill: "#fff", fontSize: 11 }} background dataKey="count" />
                <Tooltip />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Pays + Statut parcelles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> Couverture par pays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.country_distribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="country" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.blue} radius={[6, 6, 0, 0]} name="Utilisateurs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" /> État des parcelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.parcel_status} cx="50%" cy="50%"
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100} dataKey="count" nameKey="status">
                  {data.parcel_status.map((entry, idx) => (
                    <Cell key={idx} fill={
                      entry.status === "excellent" ? COLORS.green :
                      entry.status === "bon" ? COLORS.primary :
                      entry.status === "attention" ? COLORS.accent : COLORS.red
                    } />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Alerts severity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" /> Distribution des alertes par sévérité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.alert_severity}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.alert_severity.map((entry, idx) => (
                  <Cell key={idx} fill={
                    entry.severity === "critique" ? COLORS.red :
                    entry.severity === "haute" ? COLORS.accent :
                    entry.severity === "moyenne" ? COLORS.blue : COLORS.green
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Footer presentation hint */}
      <Card className="bg-gradient-to-r from-lime-500/10 to-amber-500/10 border-lime-500/30">
        <CardContent className="p-4 text-center text-sm text-slate-600 dark:text-slate-300">
          📊 Tableau de bord pour présentation • <strong className="text-lime-600 dark:text-lime-400">AGRICAM IA</strong> par <strong>African AI Solutions</strong>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
