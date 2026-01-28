import React, { useEffect, useState } from "react";
import { getImageAnalyses, getImageAnalysisStats } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  ScanSearch, Camera, Satellite, Check, TrendingUp,
  AlertTriangle, Upload, Zap, RefreshCw, MapPin
} from "lucide-react";
import { cn } from "../lib/utils";

const AnalyseImagesIA = () => {
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesRes, statsRes] = await Promise.all([
          getImageAnalyses(),
          getImageAnalysisStats()
        ]);
        setAnalyses(analysesRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="analyse-ia-page">
      {/* Header */}
      <div className="gradient-ai-analysis rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <ScanSearch className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Analyse d'Images IA</h1>
        </div>
        <p className="text-white/80">Reconnaissance automatique des cultures et détection des maladies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_analyzed || 0}</p>
                <p className="text-sm text-slate-500">Images analysées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.crop_precision || 0}%</p>
                <p className="text-sm text-slate-500">Précision cultures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.diseases_detected || 0}</p>
                <p className="text-sm text-slate-500">Maladies détectées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.ai_precision || 0}%</p>
                <p className="text-sm text-slate-500">Précision IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="overflow-hidden card-hover" data-testid={`analysis-${analysis.id}`}>
            {/* Image */}
            <div className="relative h-56 bg-slate-100">
              <img
                src={analysis.image_url}
                alt={analysis.parcel_name}
                className="w-full h-full object-cover"
              />
              <Badge className={cn(
                "absolute top-4 left-4 text-white",
                analysis.source === "drone" ? "bg-emerald-600" : "bg-amber-600"
              )}>
                {analysis.source === "drone" ? (
                  <><Camera className="h-3 w-3 mr-1" /> Drone</>
                ) : (
                  <><Satellite className="h-3 w-3 mr-1" /> Satellite</>
                )}
              </Badge>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-bold text-white">{analysis.parcel_name}</h3>
                <p className="text-white/80 text-sm">{analysis.capture_date}</p>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Recognition & Growth */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-slate-500">Reconnaissance</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{analysis.crop_recognized}</p>
                  <p className="text-xs text-slate-500">{analysis.crop_confidence}% confiance</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs text-slate-500">Croissance</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-700">{analysis.growth_rate}x</p>
                  <p className="text-xs text-slate-500">Taux de croissance</p>
                </div>
              </div>

              {/* Diseases */}
              {analysis.diseases_detected && analysis.diseases_detected.length > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-semibold text-red-800">Maladies détectées</h4>
                  </div>
                  {analysis.diseases_detected.map((disease, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-slate-700">{disease.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-700">{disease.severity}</Badge>
                        <span className="text-sm text-slate-500">{disease.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="bg-violet-600 hover:bg-violet-700" data-testid={`reanalyze-${analysis.id}`}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Réanalyser
                </Button>
                <Button variant="outline" data-testid={`mark-zone-${analysis.id}`}>
                  <MapPin className="h-4 w-4 mr-1" />
                  Marquer zone
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Engine Section */}
      <div className="gradient-marketplace rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Moteur d'analyse IA</h3>
        <p className="text-white/80 mb-4">
          Intelligence artificielle avancée pour la reconnaissance des cultures et la détection précoce des maladies
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white/20 text-white">Vision par ordinateur</Badge>
          <Badge className="bg-white/20 text-white">Deep Learning</Badge>
          <Badge className="bg-white/20 text-white">Analyse spectrale</Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-100" data-testid="import-images-btn">
            <Upload className="h-4 w-4 mr-2" />
            Importer images
          </Button>
          <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-100" data-testid="batch-analysis-btn">
            <Zap className="h-4 w-4 mr-2" />
            Analyse batch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyseImagesIA;
