import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  Play, Leaf, AlertTriangle, Bug, Droplets, 
  Thermometer, Heart, MapPin, Zap, CheckCircle,
  ArrowRight, X
} from "lucide-react";
import { cn } from "../lib/utils";

// Simulated demo data
const demoResults = {
  ndvi: {
    mean: 0.68,
    min: 0.42,
    max: 0.85,
    status: "Bon",
    zones: { excellent: 35, good: 45, moderate: 15, poor: 5 }
  },
  stress: {
    level: 22,
    status: "Faible",
    zones: [
      { type: "Hydrique", severity: "faible", area: 8 },
      { type: "Thermique", severity: "modéré", area: 5 }
    ]
  },
  disease: {
    detected: 2,
    list: [
      { name: "Mildiou", risk: 15, area: 3 },
      { name: "Rouille", risk: 8, area: 2 }
    ]
  },
  humidity: {
    average: 62,
    status: "Optimal",
    irrigation_needed: false
  },
  overall: 78
};

const InteractiveDemo = ({ isOpen, onClose, onRegister }) => {
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const startDemo = () => {
    setAnalyzing(true);
    setStep(1);
    
    // Simulate analysis progress
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => {
      setAnalyzing(false);
      setResults(demoResults);
      setStep(4);
    }, 4500);
  };

  const resetDemo = () => {
    setStep(0);
    setResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Démo Interactive - Analyse de Parcelle
          </DialogTitle>
        </DialogHeader>

        {/* Step 0: Introduction */}
        {step === 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="p-4 bg-emerald-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Testez notre technologie</h2>
              <p className="text-slate-600">
                Découvrez comment AGRICAM IA analyse vos parcelles en quelques secondes.
                Cette démo utilise une parcelle exemple près de Yaoundé.
              </p>
            </div>

            {/* Demo map preview */}
            <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Parcelle Demo - 5.2 hectares</p>
                  <p className="text-xs text-slate-600">Yaoundé, Centre</p>
                </div>
              </div>
              {/* Simulated zone overlay */}
              <div className="absolute top-4 left-4 w-24 h-16 border-2 border-dashed border-emerald-500 rounded opacity-50"></div>
              <div className="absolute bottom-8 right-8 w-20 h-20 border-2 border-dashed border-emerald-500 rounded opacity-50"></div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={startDemo} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Lancer l'analyse
              </Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </div>

            <p className="text-xs text-center text-slate-500">
              Aucune inscription requise pour cette démo
            </p>
          </div>
        )}

        {/* Steps 1-3: Analysis Progress */}
        {(step >= 1 && step <= 3) && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
                ></div>
                <div className="absolute inset-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  {step === 1 && <Leaf className="h-8 w-8 text-emerald-600" />}
                  {step === 2 && <AlertTriangle className="h-8 w-8 text-orange-500" />}
                  {step === 3 && <Heart className="h-8 w-8 text-red-500" />}
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-2">
                {step === 1 && "Analyse NDVI en cours..."}
                {step === 2 && "Détection des zones de stress..."}
                {step === 3 && "Évaluation de la santé des cultures..."}
              </h3>
              
              <Progress value={step * 33} className="w-64 mx-auto h-2" />
              
              <p className="text-sm text-slate-600 mt-4">
                {step === 1 && "Calcul de l'indice de végétation à partir des images satellites"}
                {step === 2 && "Identification des anomalies thermiques et hydriques"}
                {step === 3 && "Génération du rapport complet"}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="space-y-6 py-4">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <div className="text-5xl font-bold text-emerald-600 mb-2">
                {results.overall}/100
              </div>
              <Badge className="bg-emerald-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Santé globale: Bonne
              </Badge>
            </div>

            {/* Detailed Results */}
            <Tabs defaultValue="ndvi">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="ndvi" className="text-xs">
                  <Leaf className="h-3 w-3 mr-1" />
                  NDVI
                </TabsTrigger>
                <TabsTrigger value="stress" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Stress
                </TabsTrigger>
                <TabsTrigger value="disease" className="text-xs">
                  <Bug className="h-3 w-3 mr-1" />
                  Maladies
                </TabsTrigger>
                <TabsTrigger value="humidity" className="text-xs">
                  <Droplets className="h-3 w-3 mr-1" />
                  Humidité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ndvi" className="mt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">{results.ndvi.mean}</div>
                    <div className="text-xs text-slate-600">Moyen</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xl font-bold text-red-500">{results.ndvi.min}</div>
                    <div className="text-xs text-slate-600">Min</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{results.ndvi.max}</div>
                    <div className="text-xs text-slate-600">Max</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {Object.entries(results.ndvi.zones).map(([zone, pct]) => (
                    <div key={zone} className="flex items-center gap-2">
                      <span className="text-xs w-20 capitalize">{zone}</span>
                      <Progress value={pct} className="flex-1 h-2" />
                      <span className="text-xs w-8">{pct}%</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="stress" className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Niveau de stress global</span>
                  <Badge className="bg-green-500">{results.stress.level}% - {results.stress.status}</Badge>
                </div>
                {results.stress.zones.map((zone, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Stress {zone.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{zone.severity}</Badge>
                      <span className="text-xs text-slate-500">{zone.area}% surface</span>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="disease" className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span>Maladies détectées</span>
                  <Badge className="bg-orange-500">{results.disease.detected}</Badge>
                </div>
                {results.disease.list.map((d, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{d.name}</span>
                      <Badge variant={d.risk > 20 ? "destructive" : "secondary"}>
                        Risque: {d.risk}%
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600">Surface affectée: {d.area}%</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="humidity" className="mt-4 space-y-3">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Droplets className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                  <div className="text-3xl font-bold text-blue-600">{results.humidity.average}%</div>
                  <Badge className="bg-blue-500 mt-2">{results.humidity.status}</Badge>
                </div>
                <div className={cn(
                  "p-3 rounded-lg text-center",
                  results.humidity.irrigation_needed ? "bg-orange-50" : "bg-green-50"
                )}>
                  {results.humidity.irrigation_needed 
                    ? "⚠️ Irrigation recommandée" 
                    : "✅ Pas d'irrigation nécessaire"}
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-slate-600 text-center">
                Vous souhaitez analyser vos propres parcelles ?
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={onRegister}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Créer un compte gratuit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={resetDemo}>
                  Recommencer
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveDemo;
