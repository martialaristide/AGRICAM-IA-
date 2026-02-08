import React, { useEffect, useState } from "react";
import { getRecommendations, getRecommendationsStats, updateRecommendationStatus } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Lightbulb, AlertTriangle, Clock, TrendingUp, 
  Droplets, Zap, Bug, Check, X, ChevronRight, Settings, Brain, Satellite, RefreshCw
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const RecommandationsIA = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recsRes, statsRes] = await Promise.all([
        getRecommendations(),
        getRecommendationsStats()
      ]);
      setRecommendations(recsRes.data.filter(r => r.status === 'pending'));
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recId, action) => {
    try {
      await updateRecommendationStatus(recId, action);
      const actionLabels = { apply: 'appliquée', postpone: 'reportée', ignore: 'ignorée' };
      toast.success(`Recommandation ${actionLabels[action]}`);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'action");
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-700 border border-red-200">URGENT</Badge>;
      case "elevee":
        return <Badge className="bg-orange-100 text-orange-700 border border-orange-200">ÉLEVÉE</Badge>;
      case "moyenne":
        return <Badge className="bg-green-100 text-green-700 border border-green-200">MOYENNE</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "irrigation":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case "disease_treatment":
        return <Bug className="h-5 w-5 text-rose-500" />;
      case "fertilisation":
        return <Zap className="h-5 w-5 text-emerald-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };

  const getTypeBgColor = (type) => {
    switch (type) {
      case "irrigation":
        return "bg-blue-50";
      case "disease_treatment":
        return "bg-rose-50";
      case "fertilisation":
        return "bg-emerald-50";
      default:
        return "bg-amber-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="recommandations-page">
      {/* Header */}
      <div className="gradient-recommendations rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Recommandations IA</h1>
        </div>
        <p className="text-white/80">Intelligence artificielle pour optimiser vos rendements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
                <p className="text-sm text-slate-500">Recommandations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.high_priority || 0}</p>
                <p className="text-sm text-slate-500">Priorité élevée</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_confidence || 0}%</p>
                <p className="text-sm text-slate-500">Confiance moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_deadline_hours || 0}h</p>
                <p className="text-sm text-slate-500">Délai moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="card-hover" data-testid={`rec-${rec.id}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  getTypeBgColor(rec.type)
                )}>
                  {getTypeIcon(rec.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900">{rec.title}</h3>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span>{rec.parcel_name}</span>
                    <span>•</span>
                    <span>{rec.type === 'irrigation' ? 'Irrigation' : rec.type === 'disease_treatment' ? 'Traitement' : 'Fertilisation'}</span>
                    <span>•</span>
                    <span>{new Date(rec.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <p className="text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">{rec.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction(rec.id, "apply")}
                        data-testid={`apply-${rec.id}`}
                      >
                        Appliquer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(rec.id, "postpone")}
                        data-testid={`postpone-${rec.id}`}
                      >
                        Reporter
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleAction(rec.id, "ignore")}
                        data-testid={`ignore-${rec.id}`}
                      >
                        Ignorer
                      </Button>
                    </div>
                    <span className="text-xs text-slate-400">
                      Généré il y a {Math.floor(Math.random() * 24) + 1}h
                    </span>
                  </div>
                </div>

                {/* Confidence Badge */}
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-slate-500 mb-1">Confiance IA</p>
                  <div className={cn(
                    "px-4 py-2 rounded-xl font-bold text-lg",
                    rec.confidence_percent >= 90 ? "bg-emerald-100 text-emerald-700" :
                    rec.confidence_percent >= 80 ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {rec.confidence_percent}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Engine Section */}
      <div className="gradient-ai-analysis rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Moteur d'IA</h3>
        <p className="text-white/80 mb-4">
          Notre IA analyse en continu vos données pour générer des recommandations personnalisées
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white/20 text-white">
            <Brain className="h-3 w-3 mr-1" />
            Machine Learning
          </Badge>
          <Badge className="bg-white/20 text-white">
            <Satellite className="h-3 w-3 mr-1" />
            Imagerie satellite
          </Badge>
          <Badge className="bg-white/20 text-white">
            <Zap className="h-3 w-3 mr-1" />
            IoT en temps réel
          </Badge>
        </div>
        <Button variant="secondary" className="bg-white text-violet-600 hover:bg-slate-100" data-testid="configure-ai-btn">
          <Settings className="h-4 w-4 mr-2" />
          Configurer l'IA
        </Button>
      </div>
    </div>
  );
};

export default RecommandationsIA;
