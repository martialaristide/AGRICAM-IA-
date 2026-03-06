import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api, { getParcels, createParcel, importParcels } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import ExportButton from "../components/ExportButton";
import { 
  Droplets, Thermometer, MapPin, Calendar, FlaskConical, 
  Plus, Upload, Map, Layers, Navigation, Target, 
  Satellite, FileSpreadsheet, LocateFixed, Trash2, Edit,
  Eye, Download, RefreshCw, Info, HelpCircle, Crosshair, Leaf
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map click handler component
const MapClickHandler = ({ onMapClick, isDrawing }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Locate user component
const LocateControl = ({ onLocate }) => {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
    map.on("locationfound", (e) => {
      onLocate(e.latlng);
    });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px" }}>
      <ActionTooltip content="Localiser ma position GPS actuelle">
        <button
          onClick={handleLocate}
          className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 transition-colors"
          style={{ zIndex: 1000 }}
        >
          <LocateFixed className="h-5 w-5 text-emerald-600" />
        </button>
      </ActionTooltip>
    </div>
  );
};

const Parcelles = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // "map" or "grid"
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([5.9631, 10.1591]); // Cameroon default
  const [parcelWeather, setParcelWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const fileInputRef = useRef(null);

  // New parcel form state
  const [newParcel, setNewParcel] = useState({
    name: "",
    crop_type: "",
    variety: "",
    area_hectares: 1,
    humidity: 50,
    temperature: 25,
    soil_analysis: { nitrogen: 50, phosphorus: 50, potassium: 50, ph: 7.0 },
    planting_date: new Date().toISOString().split("T")[0],
    status: "bon",
    latitude: null,
    longitude: null,
    geometry: null,
  });

  // Coordinate input state
  const [coordInput, setCoordInput] = useState("");

  useEffect(() => {
    fetchParcels();
  }, []);

  // Fetch real weather when parcel is selected
  useEffect(() => {
    if (selectedParcel) {
      const lat = selectedParcel.latitude || 5.9631;
      const lon = selectedParcel.longitude || 10.1591;
      setWeatherLoading(true);
      api.get(`/weather/current?lat=${lat}&lon=${lon}`)
        .then(res => setParcelWeather(res.data))
        .catch(() => setParcelWeather(null))
        .finally(() => setWeatherLoading(false));
    } else {
      setParcelWeather(null);
    }
  }, [selectedParcel]);

  const fetchParcels = async () => {
    try {
      const response = await getParcels();
      setParcels(response.data);
      
      // Center map on first parcel with coordinates
      const parcelWithCoords = response.data.find(p => p.latitude && p.longitude);
      if (parcelWithCoords) {
        setMapCenter([parcelWithCoords.latitude, parcelWithCoords.longitude]);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
      toast.error("Erreur lors du chargement des parcelles");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (isDrawing) {
      setDrawnPoints([...drawnPoints, [latlng.lat, latlng.lng]]);
      toast.info(`Point ajouté: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawnPoints([]);
    toast.info("Mode dessin activé - Cliquez sur la carte pour définir les points de votre parcelle");
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
    if (drawnPoints.length >= 3) {
      setNewParcel({
        ...newParcel,
        geometry: { type: "Polygon", coordinates: [drawnPoints] },
        latitude: drawnPoints[0][0],
        longitude: drawnPoints[0][1],
      });
      toast.success(`Zone définie avec ${drawnPoints.length} points`);
    }
  };

  const handleClearDrawing = () => {
    setDrawnPoints([]);
    setNewParcel({ ...newParcel, geometry: null, latitude: null, longitude: null });
    toast.info("Points effacés");
  };

  const handleImportCoordinates = () => {
    try {
      // Parse coordinates from text input (format: lat,lng or lat lng)
      const lines = coordInput.trim().split("\n");
      const points = lines.map(line => {
        const parts = line.split(/[,\s]+/).map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return [parts[0], parts[1]];
        }
        throw new Error("Format invalide");
      });

      if (points.length >= 3) {
        setDrawnPoints(points);
        setNewParcel({
          ...newParcel,
          geometry: { type: "Polygon", coordinates: [points] },
          latitude: points[0][0],
          longitude: points[0][1],
        });
        // Center map on imported coordinates
        setMapCenter([points[0][0], points[0][1]]);
        toast.success(`${points.length} coordonnées importées avec succès`);
      } else {
        toast.error("Minimum 3 points requis pour définir une parcelle");
      }
    } catch (error) {
      toast.error("Format de coordonnées invalide. Utilisez: latitude,longitude (un par ligne)");
    }
  };

  const handleCreateParcel = async () => {
    try {
      if (!newParcel.name || !newParcel.crop_type) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      await createParcel(newParcel);
      toast.success(`Parcelle "${newParcel.name}" créée avec succès!`);
      setShowAddDialog(false);
      setNewParcel({
        name: "",
        crop_type: "",
        variety: "",
        area_hectares: 1,
        humidity: 50,
        temperature: 25,
        soil_analysis: { nitrogen: 50, phosphorus: 50, potassium: 50, ph: 7.0 },
        planting_date: new Date().toISOString().split("T")[0],
        status: "bon",
        latitude: null,
        longitude: null,
        geometry: null,
      });
      setDrawnPoints([]);
      fetchParcels();
    } catch (error) {
      toast.error("Erreur lors de la création de la parcelle");
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await importParcels(formData);
      toast.success(`${response.data.records_imported} parcelles importées avec succès!`);
      fetchParcels();
      setShowImportDialog(false);
    } catch (error) {
      toast.error("Erreur lors de l'import du fichier");
    }
  };

  const exportParcelData = (format) => {
    const p = selectedParcel;
    const w = parcelWeather || {};
    const data = {
      nom: p.name, culture: p.crop_type, variete: p.variety || "",
      surface_ha: p.area_hectares, statut: p.status, pays: p.country || "Cameroun",
      latitude: p.latitude, longitude: p.longitude,
      humidite_sol: p.humidity, temperature_sol: p.temperature,
      ph_sol: p.soil_analysis?.ph, azote: p.soil_analysis?.nitrogen,
      phosphore: p.soil_analysis?.phosphorus, potassium: p.soil_analysis?.potassium,
      temp_climat: w.temperature, humidite_climat: w.humidity,
      vent_vitesse: w.wind_speed, vent_direction: w.wind_direction,
      pression: w.pressure, nuages: w.clouds, description: w.description,
      date_plantation: p.planting_date
    };
    
    let content, filename, type;
    if (format === "csv") {
      const headers = Object.keys(data).join(",");
      const values = Object.values(data).map(v => `"${v || ""}"`).join(",");
      content = headers + "\n" + values;
      filename = `parcelle_${p.name}.csv`;
      type = "text/csv";
    } else if (format === "excel") {
      const headers = Object.keys(data).join("\t");
      const values = Object.values(data).map(v => v || "").join("\t");
      content = headers + "\n" + values;
      filename = `parcelle_${p.name}.xls`;
      type = "application/vnd.ms-excel";
    } else if (format === "geojson") {
      content = JSON.stringify({ type: "Feature", geometry: p.geometry || { type: "Point", coordinates: [p.longitude, p.latitude] }, properties: data }, null, 2);
      filename = `parcelle_${p.name}.geojson`;
      type = "application/json";
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `parcelle_${p.name}.json`;
      type = "application/json";
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export ${format.toUpperCase()} telecharge`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "excellent":
        return { label: "EXCELLENT", color: "bg-emerald-500", markerColor: "#10b981" };
      case "bon":
        return { label: "BON", color: "bg-blue-500", markerColor: "#3b82f6" };
      case "attention":
        return { label: "ATTENTION", color: "bg-amber-500", markerColor: "#f59e0b" };
      default:
        return { label: status, color: "bg-slate-500", markerColor: "#64748b" };
    }
  };

  const getCardGradient = (status) => {
    switch (status) {
      case "excellent":
        return "bg-gradient-to-br from-emerald-600 to-teal-600";
      case "bon":
        return "bg-gradient-to-br from-emerald-700 to-emerald-600";
      case "attention":
        return "bg-gradient-to-br from-amber-600 to-orange-600";
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-[Manrope] mb-2">Gestion des parcelles</h1>
            <p className="text-white/80">Vue d'ensemble de vos {parcels.length} parcelles agricoles</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            {/* Export Button */}
            <ExportButton 
              data={parcels} 
              type="parcelles" 
              title="Rapport des Parcelles AGRICAM IA"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            />
            
            {/* View Toggle */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <ActionTooltip content="Afficher la carte interactive avec géolocalisation satellite">
                <Button
                  variant={viewMode === "map" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className={cn(viewMode === "map" ? "bg-white text-emerald-700" : "text-white hover:bg-white/20")}
                  data-testid="view-map-btn"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Carte
                </Button>
              </ActionTooltip>
              <ActionTooltip content="Afficher les parcelles sous forme de grille">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(viewMode === "grid" ? "bg-white text-emerald-700" : "text-white hover:bg-white/20")}
                  data-testid="view-grid-btn"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Grille
                </Button>
              </ActionTooltip>
            </div>

            {/* Import Button */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <ActionTooltip content="Importer des parcelles depuis un fichier CSV ou Excel avec coordonnées">
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30" data-testid="import-parcels-btn">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Importer des parcelles</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Importez vos parcelles depuis un fichier CSV ou Excel. Le fichier doit contenir les colonnes: 
                    nom, culture, surface, latitude, longitude.
                  </p>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileImport}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Sélectionner un fichier
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Parcel Button */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <ActionTooltip content="Créer une nouvelle parcelle avec définition géographique sur la carte">
                <DialogTrigger asChild>
                  <Button className="bg-white text-emerald-700 hover:bg-white/90" data-testid="add-parcel-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle parcelle
                  </Button>
                </DialogTrigger>
              </ActionTooltip>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Créer une nouvelle parcelle
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la parcelle *</Label>
                      <Input
                        id="name"
                        value={newParcel.name}
                        onChange={(e) => setNewParcel({ ...newParcel, name: e.target.value })}
                        placeholder="Ex: Parcelle Nord"
                        data-testid="parcel-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crop_type">Type de culture *</Label>
                      <Input
                        id="crop_type"
                        value={newParcel.crop_type}
                        onChange={(e) => setNewParcel({ ...newParcel, crop_type: e.target.value })}
                        placeholder="Ex: Maïs, Blé, Cacao"
                        data-testid="parcel-crop-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Surface (hectares)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={newParcel.area_hectares}
                        onChange={(e) => setNewParcel({ ...newParcel, area_hectares: parseFloat(e.target.value) })}
                        data-testid="parcel-area-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut</Label>
                      <select
                        id="status"
                        value={newParcel.status}
                        onChange={(e) => setNewParcel({ ...newParcel, status: e.target.value })}
                        className="w-full h-10 px-3 border rounded-md"
                        data-testid="parcel-status-select"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="bon">Bon</option>
                        <option value="attention">Attention requise</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <select
                        id="country"
                        value={newParcel.country || "Cameroun"}
                        onChange={(e) => setNewParcel({ ...newParcel, country: e.target.value })}
                        className="w-full h-10 px-3 border rounded-md"
                        data-testid="parcel-country-select"
                      >
                        <option value="Cameroun">Cameroun</option>
                        <option value="Cote d'Ivoire">Cote d'Ivoire</option>
                        <option value="Senegal">Senegal</option>
                        <option value="Mali">Mali</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Togo">Togo</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variety">Variete</Label>
                      <Input
                        id="variety"
                        value={newParcel.variety}
                        onChange={(e) => setNewParcel({ ...newParcel, variety: e.target.value })}
                        placeholder="Ex: Hybride, Local"
                        data-testid="parcel-variety-input"
                      />
                    </div>
                  </div>

                  {/* Coordinate Import */}
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold">Définir la zone géographique</h4>
                      <ActionTooltip content="L'IA AGRICAM analysera automatiquement votre parcelle une fois les coordonnées définies">
                        <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                      </ActionTooltip>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Importer des coordonnées (latitude,longitude - une par ligne)</Label>
                      <textarea
                        value={coordInput}
                        onChange={(e) => setCoordInput(e.target.value)}
                        className="w-full h-24 px-3 py-2 border rounded-md text-sm font-mono"
                        placeholder="5.9631,10.1591&#10;5.9641,10.1601&#10;5.9651,10.1591&#10;5.9641,10.1581"
                        data-testid="coord-input"
                      />
                      <ActionTooltip content="Convertir les coordonnées texte en zone sur la carte">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleImportCoordinates}
                          data-testid="import-coords-btn"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Importer les coordonnées
                        </Button>
                      </ActionTooltip>
                    </div>

                    {/* Drawing Status */}
                    {drawnPoints.length > 0 && (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-sm text-emerald-700">
                          <strong>{drawnPoints.length} points</strong> définis pour cette parcelle
                        </p>
                        <div className="flex gap-2 mt-2">
                          <ActionTooltip content="Supprimer tous les points et recommencer">
                            <Button variant="outline" size="sm" onClick={handleClearDrawing}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Effacer
                            </Button>
                          </ActionTooltip>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <ActionTooltip content="Créer la parcelle et l'ajouter à votre exploitation">
                      <Button onClick={handleCreateParcel} data-testid="create-parcel-btn">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer la parcelle
                      </Button>
                    </ActionTooltip>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <Card className="overflow-hidden" data-testid="map-container">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-emerald-600" />
                Carte satellite des parcelles
              </CardTitle>
              <div className="flex gap-2">
                {isDrawing ? (
                  <>
                    <ActionTooltip content="Terminer le dessin et sauvegarder la zone">
                      <Button size="sm" onClick={handleStopDrawing} className="bg-emerald-600">
                        <Target className="h-4 w-4 mr-2" />
                        Terminer ({drawnPoints.length} pts)
                      </Button>
                    </ActionTooltip>
                    <ActionTooltip content="Annuler le dessin en cours">
                      <Button size="sm" variant="outline" onClick={() => { setIsDrawing(false); setDrawnPoints([]); }}>
                        Annuler
                      </Button>
                    </ActionTooltip>
                  </>
                ) : (
                  <ActionTooltip content="Dessiner une nouvelle zone de parcelle sur la carte en cliquant">
                    <Button size="sm" variant="outline" onClick={handleStartDrawing} data-testid="draw-zone-btn">
                      <Crosshair className="h-4 w-4 mr-2" />
                      Dessiner une zone
                    </Button>
                  </ActionTooltip>
                )}
                <ActionTooltip content="Actualiser les données des parcelles">
                  <Button size="sm" variant="outline" onClick={fetchParcels}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </ActionTooltip>
              </div>
            </div>
            {isDrawing && (
              <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <strong>Mode dessin actif:</strong> Cliquez sur la carte pour ajouter des points. Minimum 3 points requis.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px] relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                maxZoom={21}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri"
                  maxZoom={21}
                  maxNativeZoom={19}
                />
                
                <MapClickHandler onMapClick={handleMapClick} isDrawing={isDrawing} />
                <LocateControl onLocate={setUserLocation} />

                {/* User Location Marker */}
                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={createCustomIcon("#ef4444")}
                  >
                    <Popup>
                      <strong>Votre position</strong>
                      <br />
                      {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </Popup>
                  </Marker>
                )}

                {/* Parcel Markers and Polygons */}
                {parcels.map((parcel) => {
                  const statusConfig = getStatusConfig(parcel.status);
                  const hasCoords = parcel.latitude && parcel.longitude;
                  const hasGeometry = parcel.geometry?.coordinates;

                  return (
                    <React.Fragment key={parcel.id}>
                      {hasGeometry && (
                        <Polygon
                          positions={parcel.geometry.coordinates[0]}
                          pathOptions={{
                            color: statusConfig.markerColor,
                            fillColor: statusConfig.markerColor,
                            fillOpacity: 0.3,
                            weight: 2,
                          }}
                          eventHandlers={{
                            click: () => setSelectedParcel(parcel),
                          }}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-bold text-lg">{parcel.name}</h3>
                              <Badge className={cn("mt-1", statusConfig.color)}>
                                {statusConfig.label}
                              </Badge>
                              <p className="mt-2 text-sm">
                                <strong>Culture:</strong> {parcel.crop_type}
                              </p>
                              <p className="text-sm">
                                <strong>Surface:</strong> {parcel.area_hectares} ha
                              </p>
                              <p className="text-sm">
                                <strong>Humidité:</strong> {parcel.humidity}%
                              </p>
                              <p className="text-sm">
                                <strong>Température:</strong> {parcel.temperature}°C
                              </p>
                            </div>
                          </Popup>
                        </Polygon>
                      )}
                      {hasCoords && (
                        <Marker
                          position={[parcel.latitude, parcel.longitude]}
                          icon={createCustomIcon(statusConfig.markerColor)}
                          eventHandlers={{
                            click: () => setSelectedParcel(parcel),
                          }}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-bold text-lg">{parcel.name}</h3>
                              <Badge className={cn("mt-1", statusConfig.color)}>
                                {statusConfig.label}
                              </Badge>
                              <p className="mt-2 text-sm">
                                <strong>Culture:</strong> {parcel.crop_type}
                              </p>
                              <p className="text-sm">
                                <strong>Surface:</strong> {parcel.area_hectares} ha
                              </p>
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-slate-500">
                                  📍 {parcel.latitude?.toFixed(6)}, {parcel.longitude?.toFixed(6)}
                                </p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Drawing polygon preview */}
                {drawnPoints.length >= 2 && (
                  <Polygon
                    positions={drawnPoints}
                    pathOptions={{
                      color: "#10b981",
                      fillColor: "#10b981",
                      fillOpacity: 0.2,
                      weight: 2,
                      dashArray: "5, 5",
                    }}
                  />
                )}

                {/* Drawing point markers */}
                {drawnPoints.map((point, index) => (
                  <Marker
                    key={index}
                    position={point}
                    icon={L.divIcon({
                      className: "custom-marker",
                      html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${index + 1}</div>`,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8],
                    })}
                  >
                    <Popup>Point {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Parcel Details - Rich Info Bubbles */}
      {selectedParcel && viewMode === "map" && (
        <Card className="border-emerald-200 bg-emerald-50/50" data-testid="parcel-detail-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-600" />
                {selectedParcel.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusConfig(selectedParcel.status).color}>
                  {getStatusConfig(selectedParcel.status).label}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setSelectedParcel(null)} className="text-xs">Fermer</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Bubbles Row 1 - Main Data */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                <Leaf className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Culture</p>
                <p className="font-bold text-sm text-slate-800">{selectedParcel.crop_type}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 text-center">
                <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Superficie</p>
                <p className="font-bold text-sm text-slate-800">{selectedParcel.area_hectares} ha</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-cyan-100 text-center">
                <Droplets className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Humidite</p>
                <p className="font-bold text-sm text-cyan-700">{selectedParcel.humidity}%</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-orange-100 text-center">
                <Thermometer className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Temperature</p>
                <p className="font-bold text-sm text-orange-700">{selectedParcel.temperature}°C</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-violet-100 text-center">
                <FlaskConical className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">pH Sol</p>
                <p className="font-bold text-sm text-violet-700">{selectedParcel.soil_analysis?.ph || 7}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-100 text-center">
                <Calendar className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500">Pays</p>
                <p className="font-bold text-sm text-slate-800">{selectedParcel.country || "Cameroun"}</p>
              </div>
            </div>

            {/* Soil Composition NPK */}
            <div className="bg-white p-4 rounded-xl border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-600" />
                Composition du Sol (NPK)
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Azote (N)</span>
                    <span className="font-bold">{selectedParcel.soil_analysis?.nitrogen || 0}</span>
                  </div>
                  <Progress value={selectedParcel.soil_analysis?.nitrogen || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Phosphore (P)</span>
                    <span className="font-bold">{selectedParcel.soil_analysis?.phosphorus || 0}</span>
                  </div>
                  <Progress value={selectedParcel.soil_analysis?.phosphorus || 0} className="h-2 [&>div]:bg-blue-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Potassium (K)</span>
                    <span className="font-bold">{selectedParcel.soil_analysis?.potassium || 0}</span>
                  </div>
                  <Progress value={selectedParcel.soil_analysis?.potassium || 0} className="h-2 [&>div]:bg-violet-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Matiere organique</span>
                    <span className="font-bold">{selectedParcel.soil_analysis?.organic_matter || "3.5"}%</span>
                  </div>
                  <Progress value={parseInt(selectedParcel.soil_analysis?.organic_matter) || 35} className="h-2 [&>div]:bg-amber-500" />
                </div>
              </div>
            </div>

            {/* Climate Data - Real OpenWeatherMap */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-600" />
                Donnees Climatiques
                {parcelWeather?.success && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-normal">LIVE</span>
                )}
                {weatherLoading && <span className="text-[9px] text-slate-400">Chargement...</span>}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Description</p>
                  <p className="font-bold text-blue-700 capitalize">{parcelWeather?.description || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Vent</p>
                  <p className="font-bold text-slate-700">{parcelWeather?.wind_speed || "N/A"} m/s</p>
                  <p className="text-[9px] text-slate-400">Dir: {parcelWeather?.wind_direction || "N/A"}°</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Pression</p>
                  <p className="font-bold text-violet-700">{parcelWeather?.pressure || "N/A"} hPa</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Visibilite</p>
                  <p className="font-bold text-orange-700">{parcelWeather?.visibility ? (parcelWeather.visibility / 1000).toFixed(1) + " km" : "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Nuages</p>
                  <p className="font-bold text-slate-700">{parcelWeather?.clouds || "N/A"}%</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Lever soleil</p>
                  <p className="font-bold text-amber-700">{parcelWeather?.sunrise || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Coucher soleil</p>
                  <p className="font-bold text-orange-700">{parcelWeather?.sunset || "N/A"}</p>
                </div>
                <div className="bg-white/80 p-2 rounded-lg text-center">
                  <p className="text-slate-500">Ressenti</p>
                  <p className="font-bold text-red-700">{parcelWeather?.feels_like || "N/A"}°C</p>
                </div>
              </div>
              {/* Agricultural advice */}
              {parcelWeather?.agricultural_advice?.advice?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <p className="text-[10px] font-semibold text-blue-700 mb-1">Conseils agricoles</p>
                  {parcelWeather.agricultural_advice.advice.map((a, i) => (
                    <p key={i} className="text-[10px] text-slate-600 flex items-center gap-1"><Leaf className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" /> {a}</p>
                  ))}
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Irrigation: {parcelWeather.agricultural_advice.irrigation_recommendation}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Pulverisation: {parcelWeather.agricultural_advice.spray_conditions}</span>
                  </div>
                </div>
              )}
              {parcelWeather?.location && (
                <p className="text-[10px] text-slate-400 mt-2 text-right">Station: {parcelWeather.location}, {parcelWeather.country}</p>
              )}
            </div>

            {/* GPS */}
            {selectedParcel.latitude && selectedParcel.longitude && (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Navigation className="h-3 w-3" />
                GPS: {selectedParcel.latitude.toFixed(6)}, {selectedParcel.longitude.toFixed(6)}
              </div>
            )}

            {/* Export parcel data */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-100">
              <Button size="sm" variant="outline" className="text-xs" data-testid="export-csv" onClick={() => exportParcelData("csv")}>
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" className="text-xs" data-testid="export-excel" onClick={() => exportParcelData("excel")}>
                <FileSpreadsheet className="h-3 w-3 mr-1" /> Excel
              </Button>
              <Button size="sm" variant="outline" className="text-xs" data-testid="export-json" onClick={() => exportParcelData("json")}>
                <Download className="h-3 w-3 mr-1" /> JSON
              </Button>
              <Button size="sm" variant="outline" className="text-xs" data-testid="export-geojson" onClick={() => exportParcelData("geojson")}>
                <Map className="h-3 w-3 mr-1" /> GeoJSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcels.map((parcel) => {
            const statusConfig = getStatusConfig(parcel.status);
            return (
              <Card 
                key={parcel.id} 
                className="overflow-hidden card-hover cursor-pointer"
                onClick={() => { setSelectedParcel(parcel); setViewMode("map"); }}
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
                  <ActionTooltip content="Voir cette parcelle sur la carte satellite">
                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </ActionTooltip>
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
                    <ActionTooltip content="Niveau d'humidité du sol mesuré par les capteurs IoT">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl cursor-help">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-slate-500">Humidité</p>
                          <p className="text-xl font-bold text-blue-700">{parcel.humidity}%</p>
                        </div>
                      </div>
                    </ActionTooltip>
                    <ActionTooltip content="Température ambiante de la parcelle en temps réel">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl cursor-help">
                        <Thermometer className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-xs text-slate-500">Température</p>
                          <p className="text-xl font-bold text-orange-700">{parcel.temperature}°C</p>
                        </div>
                      </div>
                    </ActionTooltip>
                  </div>

                  {/* Soil Analysis */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FlaskConical className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-semibold text-slate-700">Analyse du sol</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Nitrogen */}
                      <ActionTooltip content="Azote (N) - Essentiel pour la croissance végétative. Niveau optimal: 60-80">
                        <div className="cursor-help">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Azote (N)</span>
                            <span className="font-semibold">{parcel.soil_analysis.nitrogen}/100</span>
                          </div>
                          <Progress 
                            value={parcel.soil_analysis.nitrogen} 
                            className="h-2 bg-slate-100"
                          />
                        </div>
                      </ActionTooltip>

                      {/* Phosphorus */}
                      <ActionTooltip content="Phosphore (P) - Important pour les racines et la floraison. Niveau optimal: 40-60">
                        <div className="cursor-help">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Phosphore (P)</span>
                            <span className="font-semibold">{parcel.soil_analysis.phosphorus}/100</span>
                          </div>
                          <Progress 
                            value={parcel.soil_analysis.phosphorus} 
                            className="h-2 bg-slate-100 [&>div]:bg-blue-500"
                          />
                        </div>
                      </ActionTooltip>

                      {/* Potassium */}
                      <ActionTooltip content="Potassium (K) - Renforce la résistance aux maladies. Niveau optimal: 50-70">
                        <div className="cursor-help">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Potassium (K)</span>
                            <span className="font-semibold">{parcel.soil_analysis.potassium}/100</span>
                          </div>
                          <Progress 
                            value={parcel.soil_analysis.potassium} 
                            className="h-2 bg-slate-100 [&>div]:bg-violet-500"
                          />
                        </div>
                      </ActionTooltip>
                    </div>
                  </div>

                  {/* pH and Planting Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <ActionTooltip content="Le pH du sol influence l'absorption des nutriments. Optimal: 6.0-7.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 cursor-help">
                        <FlaskConical className="h-4 w-4 text-violet-500" />
                        <span>pH du sol</span>
                        <span className="font-semibold text-slate-900">{parcel.soil_analysis.ph}</span>
                      </div>
                    </ActionTooltip>
                  </div>

                  <ActionTooltip content="Date à laquelle les cultures ont été plantées sur cette parcelle">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg cursor-help">
                      <Calendar className="h-4 w-4" />
                      <span>Planté le</span>
                      <span className="font-semibold">{parcel.planting_date}</span>
                    </div>
                  </ActionTooltip>

                  {/* Coordinates if available */}
                  {parcel.latitude && parcel.longitude && (
                    <ActionTooltip content="Coordonnées GPS de la parcelle - Cliquez pour voir sur la carte">
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded cursor-pointer hover:bg-slate-100">
                        <Navigation className="h-3 w-3" />
                        <span>{parcel.latitude.toFixed(4)}, {parcel.longitude.toFixed(4)}</span>
                      </div>
                    </ActionTooltip>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Assistant Info */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Satellite className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-800">Assistant IA AGRICAM</h3>
              <p className="text-emerald-700 mt-1">
                L'intelligence artificielle d'AGRICAM IA analyse automatiquement vos parcelles via satellite pour:
              </p>
              <ul className="mt-2 text-sm text-emerald-600 space-y-1">
                <li>• Identifier les zones de stress hydrique</li>
                <li>• Détecter les maladies précocement</li>
                <li>• Optimiser l'utilisation des ressources</li>
                <li>• Prédire les rendements avec précision</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Parcelles;
