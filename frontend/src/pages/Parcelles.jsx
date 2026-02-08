import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getParcels, createParcel, importParcels } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Droplets, Thermometer, MapPin, Calendar, FlaskConical, 
  Plus, Upload, Map, Layers, Navigation, Target, 
  Satellite, FileSpreadsheet, LocateFixed, Trash2, Edit,
  Eye, Download, RefreshCw, Info, HelpCircle, Crosshair
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
              <DialogTrigger asChild>
                <ActionTooltip content="Importer des parcelles depuis un fichier CSV ou Excel avec coordonnées">
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30" data-testid="import-parcels-btn">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                  </Button>
                </ActionTooltip>
              </DialogTrigger>
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
              <DialogTrigger asChild>
                <ActionTooltip content="Créer une nouvelle parcelle avec définition géographique sur la carte">
                  <Button className="bg-white text-emerald-700 hover:bg-white/90" data-testid="add-parcel-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle parcelle
                  </Button>
                </ActionTooltip>
              </DialogTrigger>
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
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                />
                <TileLayer
                  url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
                  attribution=""
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

      {/* Selected Parcel Details */}
      {selectedParcel && viewMode === "map" && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-600" />
                Détails: {selectedParcel.name}
              </CardTitle>
              <Badge className={getStatusConfig(selectedParcel.status).color}>
                {getStatusConfig(selectedParcel.status).label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-500">Culture</p>
                <p className="font-semibold">{selectedParcel.crop_type}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-500">Surface</p>
                <p className="font-semibold">{selectedParcel.area_hectares} ha</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-500">Humidité</p>
                <p className="font-semibold text-blue-600">{selectedParcel.humidity}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-slate-500">Température</p>
                <p className="font-semibold text-orange-600">{selectedParcel.temperature}°C</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-600" />
                Analyse du sol
              </h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Azote:</span>
                  <span className="ml-2 font-semibold">{selectedParcel.soil_analysis?.nitrogen || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Phosphore:</span>
                  <span className="ml-2 font-semibold">{selectedParcel.soil_analysis?.phosphorus || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Potassium:</span>
                  <span className="ml-2 font-semibold">{selectedParcel.soil_analysis?.potassium || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">pH:</span>
                  <span className="ml-2 font-semibold">{selectedParcel.soil_analysis?.ph || 7}</span>
                </div>
              </div>
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
