import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import {
  Leaf, Bug, Map, FileText, Upload, Activity, Plane, Tractor,
  Download, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp,
  Target, Droplets, BarChart3, ChevronRight, Loader2, Sprout,
  ScanSearch, FileDown, Calendar
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

// Color map for density zones
const getDensityLabel = (status) => {
  const map = { optimal: "Optimal", acceptable: "Acceptable", below_optimal: "Sous-optimal", poor: "Faible" };
  return map[status] || status;
};

const getSeverityColor = (sev) => {
  if (sev === "critical" || sev === "high") return "bg-red-500";
  if (sev === "warning" || sev === "medium") return "bg-amber-500";
  return "bg-emerald-500";
};

// ==== ZONE GRID COMPONENT ====
const ZoneGrid = ({ zones, label }) => (
  <div className="grid grid-cols-3 gap-1.5 max-w-xs" data-testid="zone-grid">
    {zones.map((z) => (
      <div
        key={z.zone_id}
        className="aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
        style={{ backgroundColor: z.color }}
        title={`${z.zone_id}: ${z.density ? `${z.density}/ha` : z.application_rate !== undefined ? `${z.application_rate} L/ha` : ""}`}
      >
        {z.density ? `${(z.density / 1000).toFixed(0)}k` : z.application_rate !== undefined ? `${z.application_rate}` : ""}
      </div>
    ))}
  </div>
);

// ==== PLANT COUNTING TAB ====
const PlantCountingTab = () => {
  const [crops, setCrops] = useState([]);
  const [fieldId, setFieldId] = useState("FIELD-001");
  const [area, setArea] = useState("10");
  const [cropType, setCropType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/agremo/plant-counting/crop-types`)
      .then(r => r.json()).then(d => setCrops(d.crops || [])).catch(() => {});
  }, []);

  const runAnalysis = async () => {
    if (!cropType) { toast.error("Sélectionnez un type de culture"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/agremo/plant-counting`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId, area_hectares: parseFloat(area), crop_type: cropType })
      });
      const data = await res.json();
      setResult(data);
      toast.success("Comptage terminé avec succès !");
    } catch { toast.error("Erreur lors de l'analyse"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Sprout className="h-5 w-5 text-emerald-600" /> Comptage de Plantes</CardTitle>
          <CardDescription>Comptage IA avec précision de 98.3% - Identifiez les zones de faible densité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>ID Parcelle</Label>
              <Input value={fieldId} onChange={e => setFieldId(e.target.value)} data-testid="plant-field-id" />
            </div>
            <div>
              <Label>Surface (ha)</Label>
              <Input type="number" value={area} onChange={e => setArea(e.target.value)} data-testid="plant-area" />
            </div>
            <div>
              <Label>Type de culture</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger data-testid="plant-crop-select"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>
                  {crops.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={runAnalysis} disabled={loading} className="mt-4 bg-emerald-600 hover:bg-emerald-700" data-testid="plant-count-btn">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScanSearch className="h-4 w-4 mr-2" />}
            Lancer le comptage
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats */}
          <Card>
            <CardHeader><CardTitle className="text-base">Résultats du comptage</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox icon={<Leaf className="h-4 w-4" />} label="Plantes totales" value={result.results.total_plants.toLocaleString()} color="emerald" />
                <StatBox icon={<Target className="h-4 w-4" />} label="Densité/ha" value={result.results.plants_per_hectare.toLocaleString()} color="blue" />
                <StatBox icon={<TrendingUp className="h-4 w-4" />} label="Germination" value={`${result.results.germination_rate}%`} color="teal" />
                <StatBox icon={<AlertTriangle className="h-4 w-4" />} label="Plantes manquantes" value={result.results.missing_plants.toLocaleString()} color="amber" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-slate-500 mb-1">Statut de densité</p>
                <Badge className={result.results.density_status === "optimal" ? "bg-emerald-500" : result.results.density_status === "acceptable" ? "bg-blue-500" : "bg-amber-500"}>
                  {getDensityLabel(result.results.density_status)}
                </Badge>
              </div>
              {result.yield_estimate && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-500 mb-1">Estimation rendement</p>
                  <p className="text-xl font-bold text-emerald-700">{result.yield_estimate.estimated_yield_tonnes} t <span className="text-sm font-normal text-slate-400">({result.yield_estimate.yield_per_hectare_kg} kg/ha)</span></p>
                  <p className="text-xs text-slate-400">Confiance : {result.yield_estimate.confidence}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zone Map */}
          <Card>
            <CardHeader><CardTitle className="text-base">Carte de densité</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ZoneGrid zones={result.zones} />
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Optimal</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-500" /> Acceptable</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400" /> Sous-optimal</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Faible</span>
              </div>
              {result.recommendations?.length > 0 && (
                <div className="w-full space-y-2 pt-3 border-t">
                  <p className="text-sm font-medium">Recommandations</p>
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded">
                      <Badge variant="outline" className={r.priority === "high" ? "border-red-300 text-red-600" : r.priority === "medium" ? "border-amber-300 text-amber-600" : "border-emerald-300 text-emerald-600"}>
                        {r.priority === "high" ? "Urgent" : r.priority === "medium" ? "Moyen" : "Info"}
                      </Badge>
                      <span className="text-slate-600">{r.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==== PRESCRIPTION MAP TAB ====
const PrescriptionMapTab = () => {
  const [products, setProducts] = useState([]);
  const [fieldId, setFieldId] = useState("FIELD-001");
  const [area, setArea] = useState("10");
  const [productType, setProductType] = useState("herbicide");
  const [fullDose, setFullDose] = useState("3.0");
  const [reducedDose, setReducedDose] = useState("1.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/agremo/prescription-map/products`)
      .then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/agremo/prescription-map`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId, area_hectares: parseFloat(area), product_type: productType, full_dose: parseFloat(fullDose), reduced_dose: parseFloat(reducedDose) })
      });
      setResult(await res.json());
      toast.success("Carte de prescription générée !");
    } catch { toast.error("Erreur de génération"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Map className="h-5 w-5 text-blue-600" /> Carte de Prescription</CardTitle>
          <CardDescription>Application à taux variable - Économisez jusqu'à 40% de produits phytosanitaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><Label>ID Parcelle</Label><Input value={fieldId} onChange={e => setFieldId(e.target.value)} data-testid="rx-field-id" /></div>
            <div><Label>Surface (ha)</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} data-testid="rx-area" /></div>
            <div>
              <Label>Type de produit</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger data-testid="rx-product-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="herbicide">Herbicide</SelectItem>
                  <SelectItem value="insecticide">Insecticide</SelectItem>
                  <SelectItem value="fongicide">Fongicide</SelectItem>
                  <SelectItem value="engrais">Engrais liquide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Dose pleine (L/ha)</Label><Input type="number" value={fullDose} onChange={e => setFullDose(e.target.value)} data-testid="rx-full-dose" /></div>
            <div><Label>Dose réduite (L/ha)</Label><Input type="number" value={reducedDose} onChange={e => setReducedDose(e.target.value)} data-testid="rx-reduced-dose" /></div>
          </div>
          <Button onClick={generate} disabled={loading} className="mt-4 bg-blue-600 hover:bg-blue-700" data-testid="rx-generate-btn">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Map className="h-4 w-4 mr-2" />}
            Générer la carte
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Carte d'application</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ZoneGrid zones={result.zones} />
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }} /> Dose pleine</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} /> Dose réduite</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#94a3b8" }} /> Pas d'application</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Économies estimées</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatBox icon={<Droplets className="h-4 w-4" />} label="Volume prescrit" value={`${result.summary.total_product_needed_liters} L`} color="blue" />
                <StatBox icon={<Droplets className="h-4 w-4" />} label="Volume classique" value={`${result.summary.traditional_volume_liters} L`} color="slate" />
                <StatBox icon={<TrendingUp className="h-4 w-4" />} label="Économie" value={`${result.summary.savings_percentage}%`} color="emerald" />
                <StatBox icon={<BarChart3 className="h-4 w-4" />} label="Économie FCFA" value={`${result.summary.cost_savings_estimate_fcfa?.toLocaleString()} FCFA`} color="amber" />
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">Équipements compatibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.compatible_equipment?.map((eq, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{eq}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==== WEED & PEST DETECTION TAB ====
const WeedPestTab = () => {
  const [fieldId, setFieldId] = useState("FIELD-001");
  const [area, setArea] = useState("10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const detect = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/agremo/weed-pest-detection`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId, area_hectares: parseFloat(area) })
      });
      setResult(await res.json());
      toast.success("Détection terminée !");
    } catch { toast.error("Erreur de détection"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Bug className="h-5 w-5 text-red-600" /> Détection Mauvaises Herbes & Ravageurs</CardTitle>
          <CardDescription>Identification IA des zones infestées avec recommandations de traitement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>ID Parcelle</Label><Input value={fieldId} onChange={e => setFieldId(e.target.value)} data-testid="weed-field-id" /></div>
            <div><Label>Surface (ha)</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} data-testid="weed-area" /></div>
          </div>
          <Button onClick={detect} disabled={loading} className="mt-4 bg-red-600 hover:bg-red-700" data-testid="weed-detect-btn">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bug className="h-4 w-4 mr-2" />}
            Lancer la détection
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weeds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Mauvaises herbes
                <Badge className={getSeverityColor(result.weeds.infestation_level === "severe" ? "high" : result.weeds.infestation_level === "moderate" ? "medium" : "low")}>
                  {result.weeds.infestation_level}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.weeds.zones.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Aucune mauvaise herbe détectée</p>
              ) : result.weeds.zones.map((w, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border-l-3" style={{ borderLeftColor: w.color }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{w.local_name}</p>
                      <p className="text-xs text-slate-400 italic">{w.weed_type}</p>
                    </div>
                    <Badge className={getSeverityColor(w.severity)}>{w.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Couverture : {w.coverage_percentage}% | Surface : {w.area_affected_ha} ha</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pests */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ravageurs détectés</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {result.pests.zones.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Aucun ravageur détecté</p>
              ) : result.pests.zones.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{p.local_name}</p>
                      <p className="text-xs text-slate-400 italic">{p.pest_type}</p>
                    </div>
                    <Badge className={getSeverityColor(p.damage_level)}>{p.damage_level}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Plantes affectées : {p.affected_plants_percentage}% | Perte rendement estimée : {p.estimated_yield_loss_percentage}%</p>
                </div>
              ))}
              {result.pests.estimated_total_yield_loss > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-red-600 font-medium">Perte totale estimée : {result.pests.estimated_total_yield_loss}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {result.treatment_recommendations?.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Recommandations de traitement</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.treatment_recommendations.map((r, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={r.urgency === "high" ? "bg-red-500" : "bg-amber-500"}>{r.urgency === "high" ? "Urgent" : "Surveillance"}</Badge>
                        <span className="font-medium text-sm capitalize">{r.type}</span>
                      </div>
                      {r.products.length > 0 && <p className="text-xs text-slate-500">Produits : {r.products.join(", ")}</p>}
                      <p className="text-xs text-slate-400 mt-1">{r.timing} - {r.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ==== WEEKLY REPORT TAB ====
const WeeklyReportTab = () => {
  const [fieldId, setFieldId] = useState("FIELD-001");
  const [fieldName, setFieldName] = useState("Parcelle Nord");
  const [area, setArea] = useState("10");
  const [cropType, setCropType] = useState("mais");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/agremo/weekly-report`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId, field_name: fieldName, area_hectares: parseFloat(area), crop_type: cropType })
      });
      setResult(await res.json());
      toast.success("Rapport hebdomadaire généré !");
    } catch { toast.error("Erreur de génération"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-teal-600" /> Rapport Santé Hebdomadaire</CardTitle>
          <CardDescription>Suivi NDVI, alertes automatiques et recommandations par parcelle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><Label>ID Parcelle</Label><Input value={fieldId} onChange={e => setFieldId(e.target.value)} data-testid="report-field-id" /></div>
            <div><Label>Nom de la parcelle</Label><Input value={fieldName} onChange={e => setFieldName(e.target.value)} data-testid="report-field-name" /></div>
            <div><Label>Surface (ha)</Label><Input type="number" value={area} onChange={e => setArea(e.target.value)} data-testid="report-area" /></div>
            <div><Label>Culture</Label><Input value={cropType} onChange={e => setCropType(e.target.value)} data-testid="report-crop" /></div>
          </div>
          <Button onClick={generate} disabled={loading} className="mt-4 bg-teal-600 hover:bg-teal-700" data-testid="report-generate-btn">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Générer le rapport
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Santé globale</CardTitle></CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4" style={{ borderColor: result.summary.health_color }}>
                <span className="text-2xl font-bold" style={{ color: result.summary.health_color }}>{result.summary.overall_score}</span>
              </div>
              <Badge className="text-sm" style={{ backgroundColor: result.summary.health_color }}>{result.summary.health_status}</Badge>
              <div className="text-left space-y-2 pt-3 border-t">
                <div className="flex justify-between text-sm"><span className="text-slate-500">NDVI actuel</span><span className="font-medium">{result.vegetation.current_ndvi}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">NDVI précédent</span><span className="font-medium">{result.vegetation.previous_ndvi}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Tendance</span>
                  <Badge variant="outline" className={result.vegetation.ndvi_trend === "improving" ? "border-emerald-300 text-emerald-600" : result.vegetation.ndvi_trend === "declining" ? "border-red-300 text-red-600" : "border-slate-300"}>
                    {result.vegetation.ndvi_trend === "improving" ? "En hausse" : result.vegetation.ndvi_trend === "declining" ? "En baisse" : "Stable"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stress Indicators */}
          <Card>
            <CardHeader><CardTitle className="text-base">Indicateurs de stress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <StressBar label="Stress hydrique" value={result.stress_indicators.water_stress} />
              <StressBar label="Stress nutritif" value={result.stress_indicators.nutrient_stress} />
              <StressBar label="Pression maladie" value={result.stress_indicators.disease_pressure} />
              <div className="pt-3 border-t">
                <p className="text-sm text-slate-500">Biomasse estimée</p>
                <p className="text-lg font-bold text-emerald-700">{result.vegetation.biomass_estimate_kg_ha?.toLocaleString()} kg/ha</p>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2">Alertes <Badge>{result.alerts.length}</Badge></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {result.alerts.length === 0 ? (
                <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Aucune alerte cette semaine</p>
              ) : result.alerts.map((a, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={a.severity === "warning" ? "bg-amber-500" : a.severity === "critical" ? "bg-red-500" : "bg-blue-500"}>{a.severity}</Badge>
                  </div>
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{a.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==== EXPORT & MISSIONS TAB ====
const ExportMissionsTab = () => {
  const [formats, setFormats] = useState([]);
  const [equipment, setEquipment] = useState(null);
  const [exportLoading, setExportLoading] = useState("");
  const [missionForm, setMissionForm] = useState({ field_id: "FIELD-001", prescription_id: "RX-001", equipment_type: "drone", equipment_model: "DJI AGRAS T40", operator_name: "", scheduled_date: "" });
  const [missionResult, setMissionResult] = useState(null);
  const [missionLoading, setMissionLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/agremo/export-formats`).then(r => r.json()).then(d => setFormats(d.formats || [])).catch(() => {});
    fetch(`${API}/api/agremo/equipment`).then(r => r.json()).then(d => setEquipment(d)).catch(() => {});
  }, []);

  const exportReport = async (fmt) => {
    setExportLoading(fmt);
    try {
      const res = await fetch(`${API}/api/agremo/export`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_data: { type: "analysis", date: new Date().toISOString() }, format: fmt })
      });
      const data = await res.json();
      toast.success(`Export ${fmt.toUpperCase()} généré : ${data.file_name}`);
    } catch { toast.error("Erreur d'export"); }
    setExportLoading("");
  };

  const createMission = async () => {
    if (!missionForm.operator_name || !missionForm.scheduled_date) { toast.error("Remplissez tous les champs"); return; }
    setMissionLoading(true);
    try {
      const res = await fetch(`${API}/api/agremo/spray-mission`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(missionForm)
      });
      setMissionResult(await res.json());
      toast.success("Mission d'épandage créée !");
    } catch { toast.error("Erreur de création"); }
    setMissionLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><FileDown className="h-5 w-5 text-violet-600" /> Export de rapports</CardTitle>
          <CardDescription>Exportez vos analyses en PDF, Shapefile, KML, GeoJSON ou CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {formats.map(f => (
              <Button key={f.id} variant="outline" className="flex flex-col gap-1 h-auto py-3" onClick={() => exportReport(f.id)} disabled={!!exportLoading} data-testid={`export-${f.id}-btn`}>
                {exportLoading === f.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                <span className="text-xs font-medium">{f.name}</span>
                <span className="text-[10px] text-slate-400">{f.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spray Mission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Plane className="h-5 w-5 text-orange-600" /> Mission d'épandage</CardTitle>
          <CardDescription>Planifiez une mission pour drone ou tracteur depuis votre carte de prescription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Type d'équipement</Label>
              <Select value={missionForm.equipment_type} onValueChange={v => setMissionForm(p => ({...p, equipment_type: v}))}>
                <SelectTrigger data-testid="mission-equip-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="drone">Drone</SelectItem>
                  <SelectItem value="tractor">Tracteur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modèle</Label>
              <Select value={missionForm.equipment_model} onValueChange={v => setMissionForm(p => ({...p, equipment_model: v}))}>
                <SelectTrigger data-testid="mission-equip-model"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {equipment?.drones?.map(d => <SelectItem key={d.model} value={d.model}>{d.model}</SelectItem>)}
                  {equipment?.tractors?.map(t => <SelectItem key={t.model} value={t.model}>{t.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Opérateur</Label><Input value={missionForm.operator_name} onChange={e => setMissionForm(p => ({...p, operator_name: e.target.value}))} placeholder="Nom de l'opérateur" data-testid="mission-operator" /></div>
            <div><Label>Date planifiée</Label><Input type="date" value={missionForm.scheduled_date} onChange={e => setMissionForm(p => ({...p, scheduled_date: e.target.value}))} data-testid="mission-date" /></div>
          </div>
          <Button onClick={createMission} disabled={missionLoading} className="mt-4 bg-orange-600 hover:bg-orange-700" data-testid="mission-create-btn">
            {missionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plane className="h-4 w-4 mr-2" />}
            Créer la mission
          </Button>
        </CardContent>
      </Card>

      {missionResult && (
        <Card>
          <CardHeader><CardTitle className="text-base">Mission créée</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox icon={<Target className="h-4 w-4" />} label="ID Mission" value={missionResult.mission_id} color="orange" />
              <StatBox icon={<Plane className="h-4 w-4" />} label="Waypoints" value={missionResult.flight_plan.waypoints_count} color="blue" />
              <StatBox icon={<Activity className="h-4 w-4" />} label="Distance" value={`${missionResult.flight_plan.total_distance_km} km`} color="teal" />
              <StatBox icon={<Calendar className="h-4 w-4" />} label="Durée estimée" value={`${missionResult.flight_plan.estimated_duration_minutes} min`} color="violet" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ==== SHARED COMPONENTS ====
const StatBox = ({ icon, label, value, color = "slate" }) => (
  <div className={`p-3 rounded-lg bg-${color}-50 border border-${color}-100`} style={{ backgroundColor: `var(--color-${color}, #f8fafc)` }}>
    <div className="flex items-center gap-1.5 text-slate-500 mb-1">{icon}<span className="text-xs">{label}</span></div>
    <p className="font-bold text-slate-800 text-sm">{value}</p>
  </div>
);

const StressBar = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-600">{label}</span>
      <span className={`font-medium ${value > 25 ? "text-red-600" : value > 15 ? "text-amber-600" : "text-emerald-600"}`}>{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

// ==== MAIN PAGE ====
export default function AnalyseAvancee() {
  return (
    <div className="space-y-6" data-testid="analyse-avancee-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analyse Avancée</h1>
        <p className="text-slate-500">Outils d'analyse de précision style Agremo - Comptage, prescription, détection, rapports</p>
      </div>

      <Tabs defaultValue="counting" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="counting" className="flex items-center gap-1.5 text-xs" data-testid="tab-counting">
            <Sprout className="h-3.5 w-3.5" /> Comptage
          </TabsTrigger>
          <TabsTrigger value="prescription" className="flex items-center gap-1.5 text-xs" data-testid="tab-prescription">
            <Map className="h-3.5 w-3.5" /> Prescription
          </TabsTrigger>
          <TabsTrigger value="weeds" className="flex items-center gap-1.5 text-xs" data-testid="tab-weeds">
            <Bug className="h-3.5 w-3.5" /> Ravageurs
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-1.5 text-xs" data-testid="tab-report">
            <Activity className="h-3.5 w-3.5" /> Rapport Santé
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1.5 text-xs" data-testid="tab-export">
            <FileDown className="h-3.5 w-3.5" /> Export & Missions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="counting"><PlantCountingTab /></TabsContent>
        <TabsContent value="prescription"><PrescriptionMapTab /></TabsContent>
        <TabsContent value="weeds"><WeedPestTab /></TabsContent>
        <TabsContent value="report"><WeeklyReportTab /></TabsContent>
        <TabsContent value="export"><ExportMissionsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
