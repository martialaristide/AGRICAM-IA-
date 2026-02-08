import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  BarChart3, TrendingUp, PieChart, LineChart,
  Download, Calendar
} from "lucide-react";
import { Button } from "../components/ui/button";
import ExportButton from "../components/ExportButton";
import api from "../services/api";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    total_users: 0,
    active_users: 0,
    total_parcels: 0,
    total_sensors: 0,
    total_analyses: 0,
    total_revenue: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setAnalyticsData({
        total_users: response.data.total_parcels || 0,
        active_users: response.data.total_sensors || 0,
        total_parcels: response.data.total_parcels || 0,
        total_sensors: response.data.total_sensors || 0,
        total_analyses: response.data.total_alerts || 0,
        total_revenue: 0
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="analytics-page">
      {/* Header */}
      <div className="gradient-analytics rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Analytics & Reporting</h1>
            </div>
            <p className="text-white/80">Analyses avancées et rapports détaillés de vos exploitations</p>
          </div>
          <div className="mt-4 md:mt-0">
            <ExportButton 
              data={analyticsData} 
              type="analytics" 
              title="Rapport Analytics AGRICAM IA"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Évolution des rendements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Graphique d'évolution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-violet-600" />
              Répartition des cultures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500">
                <PieChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Diagramme circulaire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Consommation d'eau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Histogramme</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-500">
                <LineChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Métriques IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Exporter les données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" data-testid="export-csv">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" data-testid="export-excel">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" data-testid="export-pdf">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" data-testid="schedule-report">
              <Calendar className="h-4 w-4 mr-2" />
              Planifier un rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
