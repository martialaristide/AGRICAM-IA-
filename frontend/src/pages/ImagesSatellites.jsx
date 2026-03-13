import React, { useEffect, useState, useRef } from "react";
import { getAerialImages, getAerialImagesStats } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Satellite, Camera, TrendingUp, AlertTriangle,
  Download, Calendar, MapPin, Plus, Loader2, ScanLine,
  Maximize2, Eye, Leaf, Droplets, X, ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const ImagesSatellites = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [imagesRes, statsRes] = await Promise.all([
        getAerialImages(),
        getAerialImagesStats()
      ]);
      setImages(imagesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching aerial images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Capture current map view as screenshot
  const handleScreenCapture = async () => {
    toast.info("Selectionnez la zone a analyser en important une capture d'ecran");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Format non supporte"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeSatelliteCapture = async () => {
    if (!capturedImage) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const base64Data = capturedImage.split(",")[1];
      const res = await api.post("/camera/satellite-analyze", {
        image_base64: base64Data,
        analysis_mode: "satellite",
        role: "farmer",
        language: "fr"
      });
      setAnalysisResult(res.data);
      toast.success("Analyse satellite terminee !");
    } catch (err) {
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const result = analysisResult?.result;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="satellites-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-emerald-900/30 rounded-2xl p-8 border border-blue-800/30">
        <div className="flex items-center gap-3 mb-2">
          <Satellite className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold font-[Manrope] text-white">
            {t("pages.satellite.title")}
          </h1>
        </div>
        <p className="text-slate-400">Analyse IA des cultures par imagerie aerienne et satellite</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111827] border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-900/40 flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.total_images || 0}</p>
                <p className="text-sm text-slate-500">Images analysees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-900/40 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.average_ndvi || 0}%</p>
                <p className="text-sm text-slate-500">NDVI moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-900/40 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.total_stress_zones || 0}</p>
                <p className="text-sm text-slate-500">Zones de stress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Capture & Analysis */}
      <Card className="bg-[#111827] border-slate-800" data-testid="satellite-capture-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-emerald-400" />
              Capture et analyse de zone satellite
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Capture zone */}
            <div className="space-y-4">
              {capturedImage ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700">
                  <img src={capturedImage} alt="Capture satellite" className="w-full h-full object-contain" />
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { setCapturedImage(null); setAnalysisResult(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center">
                  <Satellite className="h-12 w-12 text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm mb-4">Importez une capture satellite ou screenshot de carte</p>
                </div>
              )}
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <span><Camera className="h-4 w-4 mr-2" /> Importer capture satellite</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} data-testid="satellite-upload-input" />
                </label>
                {capturedImage && (
                  <Button
                    onClick={analyzeSatelliteCapture}
                    disabled={analyzing}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="satellite-analyze-btn"
                  >
                    {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanLine className="h-4 w-4 mr-2" />}
                    {analyzing ? "Analyse..." : "Analyser zone"}
                  </Button>
                )}
              </div>
            </div>

            {/* Analysis result */}
            <div className="space-y-3">
              {result ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Resultat d'analyse</h4>
                    <Badge className={cn(
                      result.zone_health === "excellent" ? "bg-emerald-900/40 text-emerald-400" :
                      result.zone_health === "bon" ? "bg-green-900/40 text-green-400" :
                      result.zone_health === "moyen" ? "bg-amber-900/40 text-amber-400" :
                      "bg-red-900/40 text-red-400"
                    )}>
                      {result.zone_health}
                    </Badge>
                  </div>

                  {result.ndvi_estimate !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">NDVI estime</span>
                        <span className="text-emerald-400">{(result.ndvi_estimate * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={result.ndvi_estimate * 100} className="h-2" />
                    </div>
                  )}

                  {result.vegetation_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="h-4 w-4 text-emerald-400" />
                      <span className="text-slate-400">Vegetation:</span>
                      <span className="text-white">{result.vegetation_type}</span>
                    </div>
                  )}

                  {result.land_use && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-400">Usage:</span>
                      <span className="text-white">{result.land_use}</span>
                    </div>
                  )}

                  {result.summary && (
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-sm text-slate-300">{result.summary}</p>
                    </div>
                  )}

                  {result.stress_zones && result.stress_zones.length > 0 && (
                    <div>
                      <h5 className="text-sm text-white mb-2">Zones de stress</h5>
                      {result.stress_zones.map((z, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs p-2 bg-slate-800/30 rounded mb-1">
                          <span className={cn("w-2 h-2 rounded-full",
                            z.severity === "high" ? "bg-red-500" : z.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          )} />
                          <span className="text-slate-300">{z.area}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-sm text-white mb-2">Recommandations</h5>
                      {result.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
                          <ChevronRight className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Eye className="h-12 w-12 text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm">Importez et analysez une capture satellite pour voir les resultats</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Images */}
      <h2 className="text-lg font-bold text-white">Images existantes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="bg-[#111827] border-slate-800 overflow-hidden" data-testid={`image-${image.id}`}>
            <div className="relative h-48 bg-slate-900">
              <img src={image.image_url} alt={image.parcel_name} className="w-full h-full object-cover opacity-80" />
              <Badge className={cn(
                "absolute top-3 right-3",
                image.analysis_type === "ndvi" ? "bg-emerald-900/80 text-emerald-400" :
                image.analysis_type === "thermal" ? "bg-orange-900/80 text-orange-400" :
                "bg-blue-900/80 text-blue-400"
              )}>
                {image.analysis_type?.toUpperCase()}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-white">{image.parcel_name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(image.captured_at).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {image.resolution}
                </div>
              </div>
              {image.ndvi_score && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">NDVI</span>
                    <span className="text-emerald-400">{image.ndvi_score}%</span>
                  </div>
                  <Progress value={image.ndvi_score} className="h-1.5" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImagesSatellites;
