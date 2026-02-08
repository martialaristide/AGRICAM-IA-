import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ActionTooltip } from "../components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { 
  BarChart3, Users, TrendingUp, Activity, Eye,
  DollarSign, MessageSquare, Globe, Shield, Search,
  RefreshCw, Download, CheckCircle, AlertTriangle,
  Clock, Smartphone, Monitor, Zap, Settings
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const DevAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [seoReport, setSeoReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, usersRes, activityRes, seoRes] = await Promise.all([
        api.get("/dev-analytics/overview"),
        api.get("/dev-analytics/users"),
        api.get("/dev-analytics/activity-log"),
        api.get("/dev-analytics/seo-report")
      ]);
      setOverview(overviewRes.data);
      setUsers(usersRes.data);
      setActivityLog(activityRes.data.activities || []);
      setSeoReport(seoRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Erreur lors du chargement des analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSubscription = async (userId, plan) => {
    try {
      const formData = new FormData();
      formData.append("plan", plan);
      formData.append("months", "1");
      
      await api.post(`/dev-analytics/validate-subscription/${userId}`, formData);
      toast.success(`Abonnement ${plan} validé`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la validation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="dev-analytics-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Analytics Développeur</h1>
            </div>
            <p className="text-white/80">Tableau de bord administrateur - Style Google Analytics</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <ActionTooltip content="Actualiser les données">
              <Button 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </ActionTooltip>
            <ActionTooltip content="Exporter le rapport">
              <Button className="bg-white text-slate-800 hover:bg-white/90">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </ActionTooltip>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6">
          {["overview", "users", "activity", "seo"].map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                activeTab === tab && "bg-white/20 text-white"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "Vue d'ensemble"}
              {tab === "users" && "Utilisateurs"}
              {tab === "activity" && "Activité"}
              {tab === "seo" && "SEO"}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && overview && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <Badge className="bg-emerald-100 text-emerald-700">
                    +{overview.overview?.user_growth_percent}%
                  </Badge>
                </div>
                <p className="text-3xl font-bold">{overview.overview?.total_users}</p>
                <p className="text-sm text-slate-500">Utilisateurs totaux</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs text-slate-400">24h</span>
                </div>
                <p className="text-3xl font-bold">{overview.overview?.active_users_24h}</p>
                <p className="text-sm text-slate-500">Utilisateurs actifs</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <span className="text-xs text-slate-400">XAF</span>
                </div>
                <p className="text-3xl font-bold">{(overview.revenue_metrics?.total_revenue_xaf || 0).toLocaleString()}</p>
                <p className="text-sm text-slate-500">Revenus totaux</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
                <p className="text-3xl font-bold">{overview.overview?.retention_rate_percent}%</p>
                <p className="text-sm text-slate-500">Taux de rétention</p>
              </CardContent>
            </Card>
          </div>

          {/* User Distribution & Content Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Distribution des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(overview.user_distribution || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-3 w-3 rounded-full",
                          role === "farmer" ? "bg-emerald-500" :
                          role === "admin" ? "bg-rose-500" :
                          role === "supplier" ? "bg-blue-500" :
                          "bg-slate-400"
                        )} />
                        <span className="capitalize">{role}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Métriques de contenu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span>Parcelles</span>
                    <span className="font-bold text-emerald-700">{overview.content_metrics?.total_parcels}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Capteurs IoT</span>
                    <span className="font-bold text-blue-700">{overview.content_metrics?.total_sensors}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                    <span>Analyses IA</span>
                    <span className="font-bold text-violet-700">{overview.content_metrics?.total_analyses}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span>Parcelles/Utilisateur</span>
                    <span className="font-bold text-amber-700">{overview.content_metrics?.average_parcels_per_user}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Métriques d'engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{overview.engagement_metrics?.total_sms_sent}</p>
                  <p className="text-xs text-slate-500">SMS envoyés</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                  <p className="text-2xl font-bold">{overview.engagement_metrics?.api_calls_today}</p>
                  <p className="text-xs text-slate-500">Appels API (24h)</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-violet-600" />
                  <p className="text-2xl font-bold">{overview.engagement_metrics?.average_session_duration_min} min</p>
                  <p className="text-xs text-slate-500">Durée session moy.</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-2xl font-bold">{overview.revenue_metrics?.total_payments}</p>
                  <p className="text-xs text-slate-500">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && users && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Gestion des utilisateurs ({users.total})
              </CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">Freemium: {users.by_subscription?.freemium || 0}</Badge>
                <Badge className="bg-blue-100 text-blue-700">Basic: {users.by_subscription?.basic || 0}</Badge>
                <Badge className="bg-violet-100 text-violet-700">Premium: {users.by_subscription?.premium || 0}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        user.subscription_plan === "premium" ? "bg-violet-100 text-violet-700" :
                        user.subscription_plan === "basic" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {user.subscription_plan || "freemium"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <ActionTooltip content="Valider abonnement Basic">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleValidateSubscription(user.id, "basic")}
                          >
                            Basic
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip content="Valider abonnement Premium">
                          <Button 
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700"
                            onClick={() => handleValidateSubscription(user.id, "premium")}
                          >
                            Premium
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Journal d'activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.map((activity, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    activity.type === "login" ? "bg-blue-100" :
                    activity.type === "analysis" ? "bg-violet-100" :
                    activity.type === "payment" ? "bg-emerald-100" :
                    "bg-slate-200"
                  )}>
                    {activity.type === "login" && <Users className="h-5 w-5 text-blue-600" />}
                    {activity.type === "analysis" && <Eye className="h-5 w-5 text-violet-600" />}
                    {activity.type === "payment" && <DollarSign className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-xs text-slate-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString('fr-FR') : '-'}
                    </p>
                  </div>
                  {activity.status && (
                    <Badge className={cn(
                      activity.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                      activity.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && seoReport && (
        <div className="space-y-6">
          {/* SEO Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Rapport SEO - Score Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={seoReport.overall_score >= 80 ? "#10b981" : seoReport.overall_score >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${seoReport.overall_score * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{seoReport.overall_score}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  {seoReport.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rec.status === "excellent" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : rec.status === "bon" ? (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="capitalize">{rec.category.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={rec.score} className="w-24 h-2" />
                        <span className="text-sm font-semibold">{rec.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Mots-clés ciblés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {seoReport.keywords?.map((keyword, idx) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Plateforme Analytics AGRICAM</h3>
              <p className="text-slate-700 mt-1">
                Cette plateforme vous permet de:
              </p>
              <ul className="mt-2 text-sm text-slate-600 space-y-1">
                <li>• Suivre les utilisateurs et leur engagement</li>
                <li>• Valider les abonnements manuellement</li>
                <li>• Analyser les revenus et transactions</li>
                <li>• Monitorer le SEO de la plateforme</li>
                <li>• Voir l'activité en temps réel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevAnalytics;
