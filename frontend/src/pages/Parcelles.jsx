import React, { useEffect, useState } from "react";
import { getParcels, createParcel } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  Droplets, Thermometer, MapPin, Calendar, FlaskConical, 
  Plus, Map, List, Eye, Pencil, Trash2, Loader2
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import ParcelMap from "../components/ParcelMap";

const Parcelles = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("map"); // map or list
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newParcel, setNewParcel] = useState({
    name: "",
    crop_type: "Maïs",
    variety: "",
    area_hectares: 1,
    humidity: 65,
    temperature: 28,
    soil_analysis: { nitrogen: 50, phosphorus: 50, potassium: 50, ph: 7.0 },
    planting_date: new Date().toISOString().split("T")[0],
    status: "bon",
    latitude: 7.54,
    longitude: -5.55
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const response = await getParcels();
      setParcels(response.data);
    } catch (error) {
      console.error("Error fetching parcels:", error);
      toast.error("Erreur de chargement des parcelles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParcel = async () => {
    if (!newParcel.name.trim()) {
      toast.error("Le nom de la parcelle est requis");
      return;
    }

    setSubmitting(true);
    try {
      await createParcel(newParcel);
      toast.success("Parcelle créée avec succès!");
      setShowAddDialog(false);
      fetchParcels();
      setNewParcel({
        name: "",
        crop_type: "Maïs",
        variety: "",
        area_hectares: 1,
        humidity: 65,
        temperature: 28,
        soil_analysis: { nitrogen: 50, phosphorus: 50, potassium: 50, ph: 7.0 },
        planting_date: new Date().toISOString().split("T")[0],
        status: "bon",
        latitude: 7.54,
        longitude: -5.55
      });
    } catch (error) {
      console.error("Error creating parcel:", error);
      toast.error("Erreur lors de la création de la parcelle");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePolygonCreate = (polygonData) => {
    setNewParcel(prev => ({
      ...prev,
      geometry: polygonData.geometry,
      area_hectares: parseFloat(polygonData.area_hectares) || prev.area_hectares
    }));
    setShowAddDialog(true);
    toast.info("Zone dessinée! Complétez les informations de la parcelle.");
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "excellent":
        return { label: "EXCELLENT", color: "bg-emerald-500" };
      case "bon":
        return { label: "BON", color: "bg-blue-500" };
      case "attention":
        return { label: "ATTENTION", color: "bg-amber-500" };
      default:
        return { label: status, color: "bg-slate-500" };
    }
  };

  const getCardGradient = (status) => {
    switch (status) {
      case "excellent":
        return "bg-gradient-to-br from-emerald-600 to-teal-600";
      case "bon":
        return "bg-gradient-to-br from-emerald-700 to-emerald-600";
      case "attention":
        return "bg-gradient-to-br from-emerald-800 to-teal-700";
      default:
        return "bg-gradient-to-br from-emerald-600 to-teal-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="parcelles-page">
      {/* Header */}
      <div className="gradient-parcels rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-[Manrope] mb-2">Gestion des parcelles</h1>
            <p className="text-white/80">Vue d'ensemble de vos {parcels.length} parcelles agricoles</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-white/20 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("text-white hover:bg-white/20", viewMode === "map" && "bg-white/30")}
                onClick={() => setViewMode("map")}
              >
                <Map className="h-4 w-4 mr-1" /> Carte
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("text-white hover:bg-white/20", viewMode === "list" && "bg-white/30")}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-1" /> Liste
              </Button>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-emerald-700 hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle parcelle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle parcelle</DialogTitle>
                  <DialogDescription>
                    Dessinez sur la carte ou remplissez les informations manuellement
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la parcelle *</Label>
                    <Input
                      id="name"
                      value={newParcel.name}
                      onChange={(e) => setNewParcel({...newParcel, name: e.target.value})}
                      placeholder="Ex: Parcelle Nord"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crop">Type de culture</Label>
                    <select
                      id="crop"
                      className="w-full p-2 border rounded-lg"
                      value={newParcel.crop_type}
                      onChange={(e) => setNewParcel({...newParcel, crop_type: e.target.value})}
                    >
                      <option value="Maïs">Maïs</option>
                      <option value="Blé">Blé</option>
                      <option value="Riz">Riz</option>
                      <option value="Manioc">Manioc</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Café">Café</option>
                      <option value="Coton">Coton</option>
                      <option value="Arachide">Arachide</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Surface (hectares)</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.1"
                      value={newParcel.area_hectares}
                      onChange={(e) => setNewParcel({...newParcel, area_hectares: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <select
                      id="status"
                      className="w-full p-2 border rounded-lg"
                      value={newParcel.status}
                      onChange={(e) => setNewParcel({...newParcel, status: e.target.value})}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="bon">Bon</option>
                      <option value="attention">Attention requise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date de plantation</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newParcel.planting_date}
                      onChange={(e) => setNewParcel({...newParcel, planting_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variety">Variété (optionnel)</Label>
                    <Input
                      id="variety"
                      value={newParcel.variety}
                      onChange={(e) => setNewParcel({...newParcel, variety: e.target.value})}
                      placeholder="Ex: Hybride F1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddParcel} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Créer la parcelle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[500px]">
                  <ParcelMap
                    parcels={parcels}
                    onParcelSelect={setSelectedParcel}
                    onPolygonCreate={handlePolygonCreate}
                    editable={true}
                  />
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
              <Map className="h-4 w-4" />
              Cliquez sur une parcelle pour voir les détails. Utilisez l'outil polygone pour dessiner une nouvelle zone.
            </p>
          </div>

          {/* Selected Parcel Details */}
          <div>
            {selectedParcel ? (
              <Card>
                <CardHeader className={cn("text-white", getCardGradient(selectedParcel.status))}>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusConfig(selectedParcel.status).color}>
                      {getStatusConfig(selectedParcel.status).label}
                    </Badge>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">{selectedParcel.name}</CardTitle>
                  <CardDescription className="text-white/80">
                    {selectedParcel.crop_type} • {selectedParcel.area_hectares} ha
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <Droplets className="h-5 w-5 text-blue-600 mx-auto" />
                      <p className="text-xs text-slate-500 mt-1">Humidité</p>
                      <p className="font-bold text-blue-700">65%</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <Thermometer className="h-5 w-5 text-orange-600 mx-auto" />
                      <p className="text-xs text-slate-500 mt-1">Température</p>
                      <p className="font-bold text-orange-700">28°C</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir les détails complets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Sélectionnez une parcelle sur la carte</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel) => {
            const statusConfig = getStatusConfig(parcel.status);
            return (
              <Card 
                key={parcel.id} 
                className="overflow-hidden card-hover cursor-pointer"
                onClick={() => setSelectedParcel(parcel)}
                data-testid={`parcel-card-${parcel.id}`}
              >
                {/* Card Header with Gradient */}
                <div className={cn(
                  "p-6 text-white relative",
                  getCardGradient(parcel.status)
                )}>
                  <Badge className={cn(
                    "absolute top-4 left-4 text-white font-semibold",
                    statusConfig.color
                  )}>
                    {statusConfig.label}
                  </Badge>
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold font-[Manrope]">{parcel.name}</h3>
                    <p className="text-white/80 mt-1">
                      {parcel.crop_type} • {parcel.area_hectares} hectares
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Humidity & Temperature */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Humidité</p>
                        <p className="text-xl font-bold text-blue-700">{parcel.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-slate-500">Température</p>
                        <p className="text-xl font-bold text-orange-700">{parcel.temperature}°C</p>
                      </div>
                    </div>
                  </div>

                  {/* Soil Analysis */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FlaskConical className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-semibold text-slate-700">Analyse du sol</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Azote (N)</span>
                          <span className="font-semibold">{parcel.soil_analysis?.nitrogen || 0}/100</span>
                        </div>
                        <Progress 
                          value={parcel.soil_analysis?.nitrogen || 0} 
                          className="h-2 bg-slate-100"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Phosphore (P)</span>
                          <span className="font-semibold">{parcel.soil_analysis?.phosphorus || 0}/100</span>
                        </div>
                        <Progress 
                          value={parcel.soil_analysis?.phosphorus || 0} 
                          className="h-2 bg-slate-100 [&>div]:bg-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Potassium (K)</span>
                          <span className="font-semibold">{parcel.soil_analysis?.potassium || 0}/100</span>
                        </div>
                        <Progress 
                          value={parcel.soil_analysis?.potassium || 0} 
                          className="h-2 bg-slate-100 [&>div]:bg-violet-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* pH and Planting Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FlaskConical className="h-4 w-4 text-violet-500" />
                      <span>pH: <span className="font-semibold text-slate-900">{parcel.soil_analysis?.ph || "N/A"}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4" />
                    <span>Planté le</span>
                    <span className="font-semibold">{parcel.planting_date || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Parcelles;
