import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Bot, Send, Upload, Camera, FileText, Zap, Leaf, Bug, 
  Droplets, Thermometer, MapPin, TrendingUp, AlertTriangle,
  Download, FileSpreadsheet, File, Image, Video, Loader2,
  CheckCircle, Brain, Sparkles, Globe, Calculator, Target
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const AgribotIA = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Bonjour ! Je suis **AgriBot IA**, votre expert agricole intelligent. Je peux analyser vos images, prédire les rendements, détecter les maladies et vous conseiller sur l'agriculture écologique. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage = {
      role: "user",
      content: inputMessage || "Analysez cette image",
      hasImage: !!selectedFile,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInputMessage("");

    try {
      let imageBase64 = null;
      if (selectedFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result.split(",")[1]);
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await api.post("/agribot-ai/chat", {
        message: inputMessage || "Analysez cette image en détail: identifiez les cultures, détectez les maladies, évaluez la santé des plantes et donnez vos recommandations.",
        image_base64: imageBase64
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error("Erreur lors de la communication avec AgriBot IA");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleAnalyzeImage = async (analysisType) => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(selectedFile);
      });

      const response = await api.post("/agribot-ai/analyze-image", {
        image_base64: imageBase64,
        analysis_type: analysisType
      });

      setAnalysisResult(response.data);
      toast.success("Analyse terminée !");
    } catch (error) {
      toast.error("Erreur lors de l'analyse");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictYield = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    setLoading(true);
    try {
      const response = await api.post("/agribot-ai/predict-yield", {
        crop_type: formData.get("crop_type"),
        surface_ha: parseFloat(formData.get("surface_ha")),
        country: formData.get("country"),
        soil_quality: formData.get("soil_quality"),
        irrigation: formData.get("irrigation") === "on"
      });

      setAnalysisResult(response.data);
      toast.success("Prédiction générée !");
    } catch (error) {
      toast.error("Erreur lors de la prédiction");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (format) => {
    if (!analysisResult) {
      toast.error("Aucun résultat à exporter");
      return;
    }

    try {
      const response = await api.post("/reports/generate", {
        data: analysisResult,
        report_type: "analysis",
        title: "Rapport d'Analyse AgriBot IA",
        format: format
      }, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rapport_agricam.${format === "word" ? "docx" : format === "excel" ? "xlsx" : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Rapport ${format.toUpperCase()} téléchargé !`);
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const quickQuestions = [
    "Comment traiter le mildiou sur le cacao ?",
    "Quelle rotation pour enrichir le sol ?",
    "Signes de carence en azote ?",
    "Agriculture bio en zone tropicale ?",
    "Calendrier de plantation du maïs ?"
  ];

  return (
    <div className="space-y-6 animate-slide-in" data-testid="agribot-ia-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Bot className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[Manrope] flex items-center gap-2">
              AgriBot IA
              <Badge className="bg-white/20 text-white">Gemini Pro</Badge>
            </h1>
            <p className="text-white/80">Expert agricole IA - Analyse, Prédiction, Conseil écologique</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> Chat IA
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Camera className="h-4 w-4" /> Analyse Image
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Prédictions
          </TabsTrigger>
          <TabsTrigger value="soil" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" /> Sol & NPK
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-3">
              <CardContent className="p-4">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto space-y-4 mb-4 p-4 bg-slate-50 rounded-lg">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl p-4",
                          msg.role === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-white border shadow-sm"
                        )}
                      >
                        {msg.hasImage && (
                          <Badge className="mb-2 bg-emerald-500/20 text-emerald-300">
                            <Image className="h-3 w-3 mr-1" /> Image jointe
                          </Badge>
                        )}
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        <p className="text-xs mt-2 opacity-60">
                          {new Date(msg.timestamp).toLocaleTimeString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border shadow-sm rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                          <span className="text-slate-600">AgriBot analyse...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mb-4 p-2 bg-slate-100 rounded-lg">
                    <img src={previewUrl} alt="Preview" className="h-20 rounded" />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="text-rose-600"
                    >
                      Supprimer
                    </Button>
                  </div>
                )}

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="upload-btn"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Posez votre question agricole..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="send-btn"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Questions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => { setInputMessage(q); }}
                  >
                    {q}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-violet-600" />
                  Analyse d'Image IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    selectedFile ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">Cliquez pour uploader une image</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP - Max 10 Mo</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleAnalyzeImage("complete")}
                    disabled={!selectedFile || loading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Analyse complète
                  </Button>
                  <Button
                    onClick={() => handleAnalyzeImage("disease")}
                    disabled={!selectedFile || loading}
                    variant="outline"
                    className="text-rose-600 border-rose-300"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Maladies
                  </Button>
                  <Button
                    onClick={() => handleAnalyzeImage("soil")}
                    disabled={!selectedFile || loading}
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                  >
                    <Droplets className="h-4 w-4 mr-2" />
                    Sol
                  </Button>
                  <Button
                    onClick={() => handleAnalyzeImage("pollution")}
                    disabled={!selectedFile || loading}
                    variant="outline"
                    className="text-slate-600"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pollution
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Résultats d'Analyse
                  </CardTitle>
                  {analysisResult && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleGenerateReport("pdf")}>
                        <FileText className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateReport("word")}>
                        <File className="h-4 w-4 mr-1" /> Word
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateReport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    <pre className="text-sm bg-slate-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(analysisResult.results || analysisResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Les résultats d'analyse apparaîtront ici</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Prédiction de Rendement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePredictYield} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Culture</Label>
                      <select name="crop_type" className="w-full p-2 border rounded-lg" required>
                        <option value="">Sélectionner...</option>
                        <option value="maïs">Maïs</option>
                        <option value="cacao">Cacao</option>
                        <option value="café">Café</option>
                        <option value="manioc">Manioc</option>
                        <option value="riz">Riz</option>
                        <option value="arachide">Arachide</option>
                        <option value="coton">Coton</option>
                        <option value="palmier">Palmier à huile</option>
                        <option value="banane">Banane/Plantain</option>
                        <option value="tomate">Tomate</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Surface (hectares)</Label>
                      <Input name="surface_ha" type="number" step="0.1" min="0.1" required placeholder="Ex: 5.5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Pays</Label>
                      <select name="country" className="w-full p-2 border rounded-lg" required>
                        <option value="">Sélectionner...</option>
                        <option value="Cameroun">Cameroun</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Mali">Mali</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Éthiopie">Éthiopie</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Togo">Togo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Qualité du sol</Label>
                      <select name="soil_quality" className="w-full p-2 border rounded-lg">
                        <option value="moyen">Moyen</option>
                        <option value="pauvre">Pauvre</option>
                        <option value="bon">Bon</option>
                        <option value="excellent">Excellent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="irrigation" id="irrigation" />
                    <Label htmlFor="irrigation">Irrigation disponible</Label>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                    Prédire le rendement
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-600" />
                  Résultat Prédiction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult?.prediction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-slate-500">Rendement estimé</p>
                      <p className="text-3xl font-bold text-emerald-700">
                        {analysisResult.prediction.estimated_yield_kg_ha || "N/A"} kg/ha
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-500">Production totale estimée</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {analysisResult.prediction.total_production_tonnes || 
                         (analysisResult.surface_ha * (analysisResult.prediction.estimated_yield_kg_ha || 0) / 1000).toFixed(1)} tonnes
                      </p>
                    </div>
                    <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-48">
                      {JSON.stringify(analysisResult.prediction, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Remplissez le formulaire pour obtenir une prédiction</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Soil Tab */}
        <TabsContent value="soil" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-amber-600" />
                Analyse de Sol - NPK, Humidité, Stress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-amber-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Droplets className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Uploadez une photo du sol</p>
                    <p className="text-xs text-slate-400 mt-1">L'IA analysera la composition NPK</p>
                  </div>
                  <Button
                    onClick={() => handleAnalyzeImage("soil")}
                    disabled={!selectedFile || loading}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Analyser le sol
                  </Button>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-3">Ce que l'analyse fournit:</h4>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Niveau d'Azote (N)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Niveau de Phosphore (P)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Niveau de Potassium (K)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Taux d'humidité
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Niveau de stress du sol
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Recommandations d'amendement
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capabilities Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3">
              <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold">50+ Cultures</p>
              <p className="text-xs text-slate-500">Africaines reconnues</p>
            </div>
            <div className="text-center p-3">
              <Bug className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <p className="font-semibold">200+ Maladies</p>
              <p className="text-xs text-slate-500">Détectables par IA</p>
            </div>
            <div className="text-center p-3">
              <Brain className="h-8 w-8 text-violet-600 mx-auto mb-2" />
              <p className="font-semibold">Gemini Pro</p>
              <p className="text-xs text-slate-500">LLM puissant</p>
            </div>
            <div className="text-center p-3">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">10 Pays</p>
              <p className="text-xs text-slate-500">Données agricoles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgribotIA;
