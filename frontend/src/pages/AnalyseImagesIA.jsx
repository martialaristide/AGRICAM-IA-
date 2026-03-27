import React, { useEffect, useState, useRef } from "react";
import { getImageAnalyses, getImageAnalysisStats, getParcels } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  ScanSearch, Camera, Satellite, Check, TrendingUp,
  AlertTriangle, Upload, Zap, RefreshCw, MapPin,
  Image, Video, FileSpreadsheet, Loader2, CheckCircle,
  XCircle, BarChart3, PieChart, Activity, Eye, Download,
  Leaf, Bug, Droplets, Thermometer, Wind
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const AnalyseImagesIA = () => {
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState("image");
  const [selectedParcel, setSelectedParcel] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysesRes, statsRes, parcelsRes] = await Promise.all([
        getImageAnalyses(),
        getImageAnalysisStats(),
        getParcels()
      ]);
      setAnalyses(analysesRes.data);
      setStats(statsRes.data);
      setParcels(parcelsRes.data);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedParcel) {
      toast.error("Veuillez sélectionner un fichier et une parcelle");
      return;
    }

    setUploading(true);
    setAnalysisResults(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("parcel_id", selectedParcel);

    try {
      let endpoint = "/analysis/upload-image";
      if (uploadType === "video") {
        endpoint = "/analysis/upload-video";
      } else if (uploadType === "data") {
        endpoint = "/analysis/upload-csv";
      }

      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAnalysisResults(response.data);
      toast.success("Analyse terminée avec succès!");
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'analyse");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResults(null);
    setSelectedParcel("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getHealthColor = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent": return "text-emerald-600 bg-emerald-100";
      case "bon": return "text-blue-600 bg-blue-100";
      case "attention": return "text-amber-600 bg-amber-100";
      case "critique": return "text-rose-600 bg-rose-100";
      default: return "text-slate-600 bg-slate-100";
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
    <div className="space-y-6 animate-slide-in" data-testid="analyse-ia-page">
      {/* Header */}
      <div className="gradient-ai-analysis rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ScanSearch className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Analyse IA AGRICAM</h1>
            </div>
            <p className="text-white/80">Reconnaissance automatique des cultures et détection des maladies</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <ActionTooltip content="Téléverser et analyser une image, vidéo ou fichier de données">
                <DialogTrigger asChild>
                  <Button className="bg-white text-violet-600 hover:bg-white/90" data-testid="upload-analyze-btn">
                    <Upload className="h-4 w-4 mr-2" />
                    Analyser un fichier
                  </Button>
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-600" />
                    Analyse IA - Téléverser et analyser
                  </DialogTitle>
                </DialogHeader>
                
                <Tabs value={uploadType} onValueChange={(v) => { setUploadType(v); resetUpload(); }}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Vidéo
                    </TabsTrigger>
                    <TabsTrigger value="data" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Données
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 space-y-4">
                    {/* Parcel Selection */}
                    <div className="space-y-2">
                      <Label>Parcelle associée *</Label>
                      <select
                        value={selectedParcel}
                        onChange={(e) => setSelectedParcel(e.target.value)}
                        className="w-full h-10 px-3 border rounded-md bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                        data-testid="analysis-parcel-select"
                      >
                        <option value="">Sélectionner une parcelle</option>
                        {parcels.map(parcel => (
                          <option key={parcel.id} value={parcel.id}>
                            {parcel.name} - {parcel.crop_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* File Upload Area */}
                    <TabsContent value="image" className="mt-0">
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                          selectedFile ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          className="hidden"
                        />
                        {previewUrl ? (
                          <div className="space-y-4">
                            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                            <p className="text-sm text-slate-600">{selectedFile?.name}</p>
                          </div>
                        ) : (
                          <>
                            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Cliquez pour sélectionner une image</p>
                            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP - Max 10 Mo</p>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="video" className="mt-0">
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                          selectedFile ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          className="hidden"
                        />
                        {previewUrl ? (
                          <div className="space-y-4">
                            <video src={previewUrl} className="max-h-48 mx-auto rounded-lg" controls />
                            <p className="text-sm text-slate-600">{selectedFile?.name}</p>
                          </div>
                        ) : (
                          <>
                            <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Cliquez pour sélectionner une vidéo</p>
                            <p className="text-xs text-slate-400 mt-1">MP4, MOV, AVI - Max 50 Mo</p>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="data" className="mt-0">
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                          selectedFile ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          ref={fileInputRef}
                          className="hidden"
                        />
                        {selectedFile ? (
                          <div className="space-y-4">
                            <FileSpreadsheet className="h-12 w-12 text-violet-500 mx-auto" />
                            <p className="text-sm text-slate-600">{selectedFile?.name}</p>
                            <p className="text-xs text-slate-400">Prêt pour l'analyse</p>
                          </div>
                        ) : (
                          <>
                            <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Cliquez pour sélectionner un fichier</p>
                            <p className="text-xs text-slate-400 mt-1">CSV, Excel - Données de capteurs, rendements, etc.</p>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    {/* Analyze Button */}
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={resetUpload}
                        disabled={uploading}
                      >
                        Réinitialiser
                      </Button>
                      <Button 
                        onClick={handleAnalyze}
                        disabled={!selectedFile || !selectedParcel || uploading}
                        className="flex-1"
                        data-testid="start-analysis-btn"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Lancer l'analyse IA
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Analysis Results */}
                    {analysisResults && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <h4 className="font-semibold text-emerald-700">Analyse terminée</h4>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Health Status */}
                          {analysisResults.results?.health_status && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">État de santé:</span>
                              <Badge className={getHealthColor(analysisResults.results.health_status)}>
                                {analysisResults.results.health_status.toUpperCase()}
                              </Badge>
                            </div>
                          )}

                          {/* Crop Type */}
                          {analysisResults.results?.crop_type && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Culture identifiée:</span>
                              <span className="font-semibold">{analysisResults.results.crop_type}</span>
                            </div>
                          )}

                          {/* Confidence */}
                          {analysisResults.results?.confidence && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-600">Confiance IA:</span>
                                <span className="font-semibold">{analysisResults.results.confidence}%</span>
                              </div>
                              <Progress value={analysisResults.results.confidence} className="h-2" />
                            </div>
                          )}

                          {/* Diseases */}
                          {analysisResults.results?.diseases && analysisResults.results.diseases.length > 0 && (
                            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Bug className="h-4 w-4 text-rose-600" />
                                <span className="font-semibold text-rose-700">Maladies détectées</span>
                              </div>
                              {analysisResults.results.diseases.map((disease, idx) => (
                                <div key={idx} className="text-sm text-rose-600">
                                  • {typeof disease === 'object' ? disease.name : disease}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Treatments */}
                          {analysisResults.results?.treatments && (
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Leaf className="h-4 w-4 text-emerald-600" />
                                <span className="font-semibold text-emerald-700">Recommandations</span>
                              </div>
                              {analysisResults.results.treatments.map((treatment, idx) => (
                                <div key={idx} className="text-sm text-emerald-600">
                                  • {treatment}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Insights from CSV */}
                          {analysisResults.results?.insights && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-blue-700">Insights des données</span>
                              </div>
                              {analysisResults.results.insights.map((insight, idx) => (
                                <div key={idx} className="text-sm text-blue-600">
                                  • {insight}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Source */}
                          <div className="text-xs text-slate-400 text-right">
                            Source: {analysisResults.source} • {new Date(analysisResults.created_at).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>

            <ActionTooltip content="Actualiser les analyses">
              <Button 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionTooltip content="Nombre total d'images analysées par l'IA">
          <Card className="card-hover cursor-help">
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
        </ActionTooltip>

        <ActionTooltip content="Taux de précision pour l'identification des cultures">
          <Card className="card-hover cursor-help">
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
        </ActionTooltip>

        <ActionTooltip content="Nombre de maladies identifiées sur vos parcelles">
          <Card className="card-hover cursor-help">
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
        </ActionTooltip>

        <ActionTooltip content="Taux de précision global du moteur IA AGRICAM">
          <Card className="card-hover cursor-help">
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
        </ActionTooltip>
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
                <ActionTooltip content="Culture identifiée automatiquement par l'IA">
                  <div className="p-4 bg-blue-50 rounded-xl cursor-help">
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-slate-500">Reconnaissance</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700">{analysis.crop_recognized}</p>
                    <p className="text-xs text-slate-500">{analysis.crop_confidence}% confiance</p>
                  </div>
                </ActionTooltip>
                <ActionTooltip content="Taux de croissance estimé par rapport à la normale">
                  <div className="p-4 bg-emerald-50 rounded-xl cursor-help">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs text-slate-500">Croissance</p>
                    </div>
                    <p className="text-xl font-bold text-emerald-700">{analysis.growth_rate}x</p>
                    <p className="text-xs text-slate-500">Taux de croissance</p>
                  </div>
                </ActionTooltip>
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
                <ActionTooltip content="Relancer l'analyse avec les derniers modèles IA">
                  <Button className="bg-violet-600 hover:bg-violet-700" data-testid={`reanalyze-${analysis.id}`}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Réanalyser
                  </Button>
                </ActionTooltip>
                <ActionTooltip content="Marquer cette zone sur la carte pour suivi">
                  <Button variant="outline" data-testid={`mark-zone-${analysis.id}`}>
                    <MapPin className="h-4 w-4 mr-1" />
                    Marquer zone
                  </Button>
                </ActionTooltip>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Engine Section */}
      <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold font-[Manrope] mb-2">Moteur IA AGRICAM</h3>
              <p className="text-white/80 mb-4">
                Intelligence artificielle avancée propre à AGRICAM IA pour la reconnaissance des cultures, 
                la détection précoce des maladies et l'analyse prédictive.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white">Vision par ordinateur</Badge>
                <Badge className="bg-white/20 text-white">Deep Learning</Badge>
                <Badge className="bg-white/20 text-white">Analyse spectrale</Badge>
                <Badge className="bg-white/20 text-white">AGRI GENIUS AI</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Leaf className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm">Cultures</p>
                  <p className="text-lg font-bold">50+</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Bug className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm">Maladies</p>
                  <p className="text-lg font-bold">200+</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Activity className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm">Précision</p>
                  <p className="text-lg font-bold">95%</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Zap className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-sm">Temps</p>
                  <p className="text-lg font-bold">&lt;3s</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyseImagesIA;
