import React, { useState, useRef, useEffect } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, Upload, ScanSearch, AlertTriangle, CheckCircle2, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SPECIES_OPTIONS = [
  { value: "bovin", label: "Bovin (bœuf, vache)" },
  { value: "porcin", label: "Porcin (porc, truie)" },
  { value: "ovin", label: "Ovin (mouton, chèvre)" },
  { value: "volaille", label: "Volaille (poulet, poule)" },
];

const STATUS_STYLES = {
  sain: "bg-emerald-500/20 text-emerald-400",
  surveillance: "bg-amber-500/20 text-amber-400",
  malade: "bg-orange-500/20 text-orange-400",
  critique: "bg-red-500/20 text-red-400",
};

export default function AnimalDiagnostic() {
  const [species, setSpecies] = useState("bovin");
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [farmId, setFarmId] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/elevage/farms").then((res) => {
      const f = res.data.farms.find((x) => x.species === species);
      setFarmId(f?.id || res.data.farms[0]?.id || null);
    }).catch(() => {});
  }, [species]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image trop lourde (max 8 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await api.post("/elevage/diagnose", { image_base64: image, species, farm_id: farmId });
      setResult(res.data.result);
      toast.success("Analyse vétérinaire IA terminée");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Échec de l'analyse IA");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4" data-testid="animal-diagnostic">
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div>
            <p className="font-semibold mb-1 flex items-center gap-2"><ScanSearch className="h-5 w-5 text-lime-400" />Diagnostic vétérinaire par photo</p>
            <p className="text-xs text-slate-400">Photographiez un animal malade, blessé ou au comportement anormal — l'IA vétérinaire analyse et recommande.</p>
          </div>

          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger data-testid="diag-species-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} data-testid="diag-file-input" />
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-600 hover:border-lime-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
            data-testid="diag-upload-zone"
          >
            {image ? (
              <img src={image} alt="Animal à diagnostiquer" className="max-h-56 mx-auto rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">Prendre une photo ou choisir une image</p>
                <p className="text-xs text-slate-600 mt-1">JPG, PNG — max 8 Mo</p>
              </>
            )}
          </div>

          <Button
            className="w-full bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold"
            disabled={!image || analyzing}
            onClick={analyze}
            data-testid="diag-analyze-btn"
          >
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanSearch className="h-4 w-4 mr-2" />}
            {analyzing ? "Analyse vétérinaire en cours..." : "Analyser avec l'IA vétérinaire"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <ScanSearch className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Le résultat du diagnostic s'affichera ici</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="diag-result">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`border-0 ${STATUS_STYLES[result.health_status] || STATUS_STYLES.surveillance}`}>{result.health_status}</Badge>
                <Badge variant="outline" className="text-xs">Confiance : {result.confidence}%</Badge>
                {result.consult_vet && (
                  <Badge className="bg-red-500/20 text-red-400 border-0"><AlertTriangle className="h-3 w-3 mr-1" />Vétérinaire requis</Badge>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Diagnostic probable</p>
                <p className="text-sm font-medium" data-testid="diag-diagnosis">{result.diagnosis}</p>
              </div>
              {result.symptoms?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Symptômes observés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.symptoms.map((s, i) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              )}
              {result.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Recommandations</p>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.consult_vet && (
                <Button variant="outline" className="w-full border-sky-500/40 text-sky-400 hover:bg-sky-500/10" onClick={() => navigate("/agronomist")} data-testid="diag-consult-btn">
                  <LifeBuoy className="h-4 w-4 mr-2" />Consulter un agronome / vétérinaire
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
