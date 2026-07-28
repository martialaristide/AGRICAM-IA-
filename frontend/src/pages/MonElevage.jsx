import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { PawPrint, Camera, Loader2, Radio, LayoutGrid, HeartPulse, Bell, Thermometer, ScanSearch, TrendingUp, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import CheptelOverview from "../components/elevage/CheptelOverview";
import AnimalsPanel from "../components/elevage/AnimalsPanel";
import ElevageAlerts from "../components/elevage/ElevageAlerts";
import ElevageEnvironment from "../components/elevage/ElevageEnvironment";
import AnimalDiagnostic from "../components/elevage/AnimalDiagnostic";
import ElevageEconomie from "../components/elevage/ElevageEconomie";
import ElevageMap from "../components/elevage/ElevageMap";
import CooperativeView from "../components/elevage/CooperativeView";

export default function MonElevage() {
  const [status, setStatus] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.get("/elevage/status");
      setStatus(res.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erreur de chargement du module Élevage");
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.post("/elevage/seed");
      toast.success(res.data.message);
      await loadStatus();
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Échec du recensement");
    } finally {
      setSeeding(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.post("/elevage/simulate");
      const a = res.data.alert;
      toast.warning(`${a.title} — ${a.farm_name}`, { description: a.message, duration: 6000 });
      setRefreshKey((k) => k + 1);
      setActiveTab("alerts");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Échec de la simulation");
    } finally {
      setSimulating(false);
    }
  };

  if (status && !status.seeded) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto" data-testid="elevage-onboarding">
        <div className="text-center py-12 sm:py-20 rounded-2xl border border-lime-500/20 bg-gradient-to-b from-lime-500/5 to-transparent px-4">
          <div className="w-20 h-20 rounded-2xl bg-lime-500/15 flex items-center justify-center mx-auto mb-6">
            <PawPrint className="h-10 w-10 text-lime-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">AgriCam Élevage IA</h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-2">
            « Une caméra, un capteur, une alerte WhatsApp — voyez votre ferme même quand vous n'y êtes pas. »
          </p>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8">
            Surveillance intelligente de vos bovins, porcins, ovins et volailles : santé, sécurité,
            reproduction, alimentation et prix de vente — par vision par ordinateur.
          </p>
          <Button
            data-testid="elevage-seed-btn"
            size="lg"
            onClick={handleSeed}
            disabled={seeding}
            className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold"
          >
            {seeding ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Camera className="h-5 w-5 mr-2" />}
            {seeding ? "Recensement en cours..." : "Installer les caméras & recenser mon cheptel"}
          </Button>
          <p className="text-xs text-slate-600 mt-4">Mode démonstration — caméras et capteurs simulés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 max-w-full overflow-x-hidden" data-testid="elevage-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-lime-500/15 flex items-center justify-center shrink-0">
            <PawPrint className="h-6 w-6 text-lime-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Mon Élevage</h1>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Surveillance IA du bétail — caméras & capteurs</p>
          </div>
        </div>
        <Button
          data-testid="elevage-simulate-btn"
          onClick={handleSimulate}
          disabled={simulating}
          variant="outline"
          className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
        >
          {simulating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Radio className="h-4 w-4 mr-2" />}
          Simuler une détection
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max flex">
            <TabsTrigger value="overview" data-testid="elevage-tab-overview"><LayoutGrid className="h-4 w-4 mr-1.5" />Cheptel</TabsTrigger>
            <TabsTrigger value="animals" data-testid="elevage-tab-animals"><HeartPulse className="h-4 w-4 mr-1.5" />Animaux</TabsTrigger>
            <TabsTrigger value="map" data-testid="elevage-tab-map"><MapPin className="h-4 w-4 mr-1.5" />Carte GPS</TabsTrigger>
            <TabsTrigger value="alerts" data-testid="elevage-tab-alerts"><Bell className="h-4 w-4 mr-1.5" />Alertes</TabsTrigger>
            <TabsTrigger value="environment" data-testid="elevage-tab-environment"><Thermometer className="h-4 w-4 mr-1.5" />Environnement</TabsTrigger>
            <TabsTrigger value="diagnostic" data-testid="elevage-tab-diagnostic"><ScanSearch className="h-4 w-4 mr-1.5" />Diagnostic IA</TabsTrigger>
            <TabsTrigger value="economy" data-testid="elevage-tab-economy"><TrendingUp className="h-4 w-4 mr-1.5" />Économie</TabsTrigger>
            <TabsTrigger value="cooperative" data-testid="elevage-tab-cooperative"><Building2 className="h-4 w-4 mr-1.5" />Coopérative</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview"><CheptelOverview refreshKey={refreshKey} onAlert={() => setRefreshKey((k) => k + 1)} /></TabsContent>
        <TabsContent value="animals"><AnimalsPanel refreshKey={refreshKey} /></TabsContent>
        <TabsContent value="map"><ElevageMap refreshKey={refreshKey} onAlert={() => setRefreshKey((k) => k + 1)} /></TabsContent>
        <TabsContent value="alerts"><ElevageAlerts refreshKey={refreshKey} /></TabsContent>
        <TabsContent value="environment"><ElevageEnvironment refreshKey={refreshKey} /></TabsContent>
        <TabsContent value="diagnostic"><AnimalDiagnostic /></TabsContent>
        <TabsContent value="economy"><ElevageEconomie refreshKey={refreshKey} /></TabsContent>
        <TabsContent value="cooperative"><CooperativeView refreshKey={refreshKey} /></TabsContent>
      </Tabs>
    </div>
  );
}
