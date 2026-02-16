import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Pencil, Trash2, Play, Download, RefreshCw,
  Leaf, Bug, Droplets, Thermometer, AlertTriangle,
  Heart, BarChart3, FileText, CheckCircle, X, MapPin
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

// Custom marker for stress zones
const createStressMarker = (severity) => {
  const colors = {
    faible: "#22c55e",
    modéré: "#f59e0b", 
    élevé: "#ef4444"
  };
  return L.divIcon({
    className: "stress-marker",
    html: `<div style="background: ${colors[severity] || '#ef4444'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Drawing handler component
const DrawingHandler = ({ isDrawing, onPointAdd, drawnPoints }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onPointAdd(e.latlng);
      }
    }
  });
  return null;
};

const ZoneAnalyzer = ({ initialPosition = [3.848, 11.5021], onAnalysisComplete }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState([
    "ndvi", "stress", "disease", "humidity", "thermal", "crop_health"
  ]);
  const [activeTab, setActiveTab] = useState("draw");
  const mapRef = useRef(null);

  const analysisTypes = [
    { id: "ndvi", name: "NDVI", icon: Leaf, color: "emerald" },
    { id: "stress", name: "Stress", icon: AlertTriangle, color: "orange" },
    { id: "disease", name: "Maladies", icon: Bug, color: "red" },
    { id: "humidity", name: "Humidité", icon: Droplets, color: "blue" },
    { id: "thermal", name: "Thermique", icon: Thermometer, color: "amber" },
    { id: "crop_health", name: "Santé", icon: Heart, color: "pink" }
  ];

  const handlePointAdd = (latlng) => {
    setDrawnPoints([...drawnPoints, { lat: latlng.lat, lng: latlng.lng }]);
  };

  const handleClearZone = () => {
    setDrawnPoints([]);
    setAnalysisResult(null);
  };

  const toggleAnalysisType = (typeId) => {
    if (selectedAnalysisTypes.includes(typeId)) {
      setSelectedAnalysisTypes(selectedAnalysisTypes.filter(t => t !== typeId));
    } else {
      setSelectedAnalysisTypes([...selectedAnalysisTypes, typeId]);
    }
  };

  const handleAnalyze = async () => {
    if (drawnPoints.length < 3) {
      toast.error("Dessinez au moins 3 points pour former une zone");
      return;
    }

    if (selectedAnalysisTypes.length === 0) {
      toast.error("Sélectionnez au moins un type d'analyse");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await api.post("/zones/analyze", {
        zone_id: `zone_${Date.now()}`,
        coordinates: drawnPoints,
        analysis_types: selectedAnalysisTypes
      });

      setAnalysisResult(response.data);
      setActiveTab("results");
      toast.success("Analyse terminée !");
      onAnalysisComplete && onAnalysisComplete(response.data);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erreur lors de l'analyse");
    }
    setAnalyzing(false);
  };

  const handleExportReport = async () => {
    if (!analysisResult) return;

    try {
      const response = await api.post("/zones/report", analysisResult);
      toast.success("Rapport généré !");
      // In a real app, this would trigger a download
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const renderNDVIResults = (ndvi) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{ndvi.mean_ndvi}</div>
          <div className="text-xs text-slate-600">NDVI Moyen</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{ndvi.min_ndvi}</div>
          <div className="text-xs text-slate-600">NDVI Min</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{ndvi.max_ndvi}</div>
          <div className="text-xs text-slate-600">NDVI Max</div>
        </div>
      </div>
      
      {/* NDVI Distribution */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Distribution par zone</h4>
        {Object.entries(ndvi.zones_distribution).map(([zone, percent]) => (
          <div key={zone} className="flex items-center gap-2">
            <span className="text-xs w-20 capitalize">{zone.replace('_', ' ')}</span>
            <Progress value={percent} className="flex-1 h-2" />
            <span className="text-xs w-12 text-right">{percent}%</span>
          </div>
        ))}
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-2 text-xs">
        <span>Légende:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ndvi.color_scale[0] }}></div>
          <span>Faible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ndvi.color_scale[2] }}></div>
          <span>Moyen</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: ndvi.color_scale[4] }}></div>
          <span>Élevé</span>
        </div>
      </div>
    </div>
  );

  const renderStressResults = (stress) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={stress.stress_index === "low" ? "default" : stress.stress_index === "medium" ? "warning" : "destructive"}>
          Niveau: {stress.stress_index === "low" ? "Faible" : stress.stress_index === "medium" ? "Modéré" : "Élevé"}
        </Badge>
        <span className="text-sm text-slate-600">{stress.affected_area_percentage}% affecté</span>
      </div>

      <Progress value={stress.overall_stress_level} className="h-3" />
      
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Zones de stress détectées</h4>
        {stress.stress_zones.map((zone, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${
                zone.severity === "faible" ? "text-green-500" :
                zone.severity === "modéré" ? "text-orange-500" : "text-red-500"
              }`} />
              <span className="text-sm">{zone.type}</span>
            </div>
            <Badge variant="outline" className="text-xs">{zone.severity}</Badge>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDiseaseResults = (disease) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{disease.diseases_detected} maladie(s) détectée(s)</span>
        <Badge variant={disease.pest_activity === "none" ? "default" : "warning"}>
          Ravageurs: {disease.pest_activity}
        </Badge>
      </div>

      {disease.detections.length > 0 ? (
        <div className="space-y-2">
          {disease.detections.map((d, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{d.name}</span>
                <Badge variant={d.severity === "high" ? "destructive" : d.severity === "medium" ? "warning" : "default"}>
                  {d.severity === "high" ? "Sévère" : d.severity === "medium" ? "Modéré" : "Faible"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Risque: {d.risk_level}%</span>
                <span>Surface: {d.affected_area_percent}%</span>
              </div>
              <div className="mt-2 text-xs text-orange-600">
                Action: {d.treatment_urgency === "immediate" ? "Immédiate" : d.treatment_urgency === "soon" ? "Prochainement" : "Surveillance"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-emerald-600">
          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Aucune maladie détectée</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Analyse de Zone
          </span>
          {analysisResult && (
            <Badge variant="outline" className="text-emerald-600">
              Score: {analysisResult.overall_score}/100
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="draw">Dessiner</TabsTrigger>
            <TabsTrigger value="analyze">Analyser</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Résultats</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            {/* Map */}
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={initialPosition}
                zoom={15}
                className="h-full w-full"
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <DrawingHandler 
                  isDrawing={isDrawing} 
                  onPointAdd={handlePointAdd}
                  drawnPoints={drawnPoints}
                />
                
                {drawnPoints.length > 0 && (
                  <>
                    <Polygon 
                      positions={drawnPoints.map(p => [p.lat, p.lng])}
                      pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.3 }}
                    />
                    {drawnPoints.map((point, i) => (
                      <Marker 
                        key={i} 
                        position={[point.lat, point.lng]}
                        icon={L.divIcon({
                          className: "zone-point",
                          html: `<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                          iconSize: [12, 12],
                          iconAnchor: [6, 6]
                        })}
                      />
                    ))}
                  </>
                )}

                {/* Stress zones markers */}
                {analysisResult?.analyses?.stress?.stress_zones?.map((zone, i) => (
                  <Marker
                    key={`stress-${i}`}
                    position={[zone.coordinates.lat, zone.coordinates.lng]}
                    icon={createStressMarker(zone.severity)}
                  >
                    <Popup>
                      <strong>Zone de stress</strong><br/>
                      Type: {zone.type}<br/>
                      Sévérité: {zone.severity}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Drawing controls */}
            <div className="flex gap-2">
              <Button
                variant={isDrawing ? "default" : "outline"}
                onClick={() => setIsDrawing(!isDrawing)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isDrawing ? "Arrêter" : "Dessiner"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClearZone}
                disabled={drawnPoints.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {drawnPoints.length > 0 && (
              <p className="text-sm text-slate-600 text-center">
                {drawnPoints.length} point(s) - Cliquez pour ajouter plus de points
              </p>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {analysisTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedAnalysisTypes.includes(type.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAnalysisType(type.id)}
                  className="flex flex-col h-auto py-3"
                >
                  <type.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{type.name}</span>
                </Button>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={drawnPoints.length < 3 || analyzing}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer l'analyse
                </>
              )}
            </Button>

            {drawnPoints.length < 3 && (
              <p className="text-sm text-orange-600 text-center">
                Dessinez au moins 3 points pour créer une zone
              </p>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {analysisResult && (
              <>
                {/* Summary */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Score global</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {analysisResult.overall_score}/100
                    </span>
                  </div>
                  <Progress value={analysisResult.overall_score} className="h-2" />
                </div>

                {/* Detailed results */}
                <div className="space-y-4">
                  {analysisResult.analyses.ndvi && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-emerald-600" />
                          Indice NDVI
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {renderNDVIResults(analysisResult.analyses.ndvi)}
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analyses.stress && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Zones de Stress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {renderStressResults(analysisResult.analyses.stress)}
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.analyses.disease && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Bug className="h-4 w-4 text-red-600" />
                          Détection Maladies
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {renderDiseaseResults(analysisResult.analyses.disease)}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recommendations */}
                {analysisResult.recommendations && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {analysisResult.recommendations.map((rec, i) => (
                        <div key={i} className={`p-3 rounded-lg border-l-4 ${
                          rec.priority === "urgent" ? "border-red-500 bg-red-50" :
                          rec.priority === "high" ? "border-orange-500 bg-orange-50" :
                          "border-emerald-500 bg-emerald-50"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {rec.category}
                            </Badge>
                            <span className={`text-xs font-medium ${
                              rec.priority === "urgent" ? "text-red-600" :
                              rec.priority === "high" ? "text-orange-600" : "text-emerald-600"
                            }`}>
                              {rec.priority === "urgent" ? "URGENT" : rec.priority === "high" ? "Priorité haute" : "Normal"}
                            </span>
                          </div>
                          <p className="text-sm">{rec.action}</p>
                          <p className="text-xs text-slate-500 mt-1">{rec.expected_impact}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Export button */}
                <Button className="w-full" variant="outline" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le rapport
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ZoneAnalyzer;
