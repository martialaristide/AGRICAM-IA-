import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Search, MapPin, Phone, MessageCircle, Navigation, Star,
  Filter, X, Leaf, Landmark, Store, Wrench, Heart,
  ChevronDown, ChevronUp, Crosshair, Layers, Clock, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CATEGORY_CONFIG = {
  intrants: { label: "Intrants", icon: Leaf, color: "#10b981", markerColor: "green" },
  services: { label: "Services", icon: Wrench, color: "#3b82f6", markerColor: "blue" },
  marche: { label: "Marche", icon: Store, color: "#f59e0b", markerColor: "gold" },
  finance: { label: "Finance", icon: Landmark, color: "#8b5cf6", markerColor: "violet" },
  veterinaire: { label: "Veterinaire", icon: Heart, color: "#ef4444", markerColor: "red" },
};

const CULTURES = [
  { id: "mais", label: "Mais" }, { id: "cacao", label: "Cacao" }, { id: "cafe", label: "Cafe" },
  { id: "tomate", label: "Tomate" }, { id: "manioc", label: "Manioc" }, { id: "banane_plantain", label: "Banane Plantain" },
  { id: "riz", label: "Riz" }, { id: "arachide", label: "Arachide" }, { id: "haricot", label: "Haricot" },
  { id: "oignon", label: "Oignon" }, { id: "palmier_huile", label: "Palmier a huile" }, { id: "coton", label: "Coton" },
];

const NEEDS = [
  { id: "semences", label: "Semences" }, { id: "engrais", label: "Engrais" }, { id: "pesticides", label: "Pesticides" },
  { id: "materiel", label: "Materiel" }, { id: "irrigation", label: "Irrigation" }, { id: "financement", label: "Financement" },
  { id: "stockage", label: "Stockage" }, { id: "transport", label: "Transport" }, { id: "formation", label: "Formation" },
];

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];

const createMarkerIcon = (color) => new L.DivIcon({
  className: "",
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Component to recenter map
const RecenterMap = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => { if (lat && lon) map.flyTo([lat, lon], 12); }, [lat, lon, map]);
  return null;
};

const CarteAgricole = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState({ lat: 5.9631, lon: 10.1591 }); // Bamenda default
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [season, setSeason] = useState(null);
  const [seasonMode, setSeasonMode] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [radius, setRadius] = useState(50);
  const [recenterKey, setRecenterKey] = useState(0);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setRecenterKey(k => k + 1);
        },
        () => {} // Silently use default
      );
    }
    fetchSeason();
  }, []);

  useEffect(() => { fetchSuppliers(); }, [selectedCategory, selectedCulture, selectedNeed, radius, searchText, userPos, seasonMode]);

  const fetchSeason = async () => {
    try {
      const res = await api.get("/map/seasons");
      setSeason(res.data);
    } catch {}
  };

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("lat", userPos.lat);
      params.append("lon", userPos.lon);
      params.append("radius", radius);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCulture) params.append("culture", selectedCulture);
      if (selectedNeed) params.append("need", seasonMode && season ? season.recommended_needs[0] : selectedNeed);
      if (searchText.length > 1) params.append("search", searchText);
      
      const res = await api.get(`/map/suppliers?${params}`);
      setSuppliers(res.data || []);
    } catch {
      setSuppliers([]);
    } finally { setLoading(false); }
  }, [selectedCategory, selectedCulture, selectedNeed, radius, searchText, userPos, seasonMode, season]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedCulture(null);
    setSelectedNeed(null);
    setSearchText("");
    setSeasonMode(false);
  };

  const activeFilters = [selectedCategory, selectedCulture, selectedNeed, seasonMode].filter(Boolean).length;

  return (
    <div className="relative h-[calc(100vh-80px)] -m-6 -mt-2" data-testid="carte-agricole">
      {/* Full-page Map */}
      <MapContainer
        center={[userPos.lat, userPos.lon]}
        zoom={8}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={userPos.lat} lon={userPos.lon} key={recenterKey} />

        {/* User position */}
        <Circle center={[userPos.lat, userPos.lon]} radius={500} pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.15 }} />
        <Marker position={[userPos.lat, userPos.lon]} icon={createMarkerIcon("#10b981")}>
          <Popup>Votre position</Popup>
        </Marker>

        {/* Supplier markers */}
        {suppliers.map(s => {
          const cfg = CATEGORY_CONFIG[s.category] || CATEGORY_CONFIG.intrants;
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lon]}
              icon={createMarkerIcon(cfg.color)}
              eventHandlers={{ click: () => setSelectedSupplier(s) }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <strong>{s.name}</strong>
                  <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                  {s.distance_km !== undefined && <p className="text-xs text-blue-600 mt-1">{s.distance_km} km</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Search bar - floating top */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2" data-testid="map-search-bar">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un fournisseur, produit..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-10 bg-white/95 backdrop-blur-sm border-0 shadow-lg text-slate-800 h-12 rounded-xl"
            data-testid="map-search-input"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className={cn("h-12 w-12 rounded-xl shadow-lg p-0", showFilters ? "bg-emerald-500" : "bg-white/95 text-slate-700 hover:bg-slate-100")}
          data-testid="filter-toggle"
        >
          <Filter className="h-5 w-5" />
          {activeFilters > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{activeFilters}</span>}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-20 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 max-h-[60vh] overflow-y-auto" data-testid="filter-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Filtres</h3>
            <div className="flex gap-2">
              {activeFilters > 0 && <Button size="sm" variant="ghost" className="text-red-500 text-xs" onClick={clearFilters}>Effacer</Button>}
              <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setShowFilters(false)}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Season mode */}
          {season && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">{season.name}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSeasonMode(!seasonMode)}
                  className={cn("text-xs h-7", seasonMode ? "bg-emerald-500 text-white" : "bg-white text-emerald-600 border border-emerald-300")}
                  data-testid="season-mode-btn"
                >
                  <Zap className="h-3 w-3 mr-1" /> {seasonMode ? "Actif" : "Activer"}
                </Button>
              </div>
              <p className="text-xs text-emerald-600">{season.tips}</p>
            </div>
          )}

          {/* Categories */}
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Categorie</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border",
                    selectedCategory === id ? "text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
                  )}
                  style={selectedCategory === id ? { background: cfg.color } : {}}
                  data-testid={`filter-cat-${id}`}
                >
                  <cfg.icon className="h-3 w-3" /> {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cultures */}
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Culture</p>
            <div className="flex flex-wrap gap-1.5">
              {CULTURES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCulture(selectedCulture === c.id ? null : c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs transition-all border",
                    selectedCulture === c.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200"
                  )}
                  data-testid={`filter-culture-${c.id}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Needs */}
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Besoin</p>
            <div className="flex flex-wrap gap-1.5">
              {NEEDS.map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNeed(selectedNeed === n.id ? null : n.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs transition-all border",
                    selectedNeed === n.id ? "bg-blue-500 text-white border-blue-500" : "bg-white text-slate-600 border-slate-200"
                  )}
                  data-testid={`filter-need-${n.id}`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Rayon de recherche</p>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs border transition-all",
                    radius === r ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"
                  )}
                  data-testid={`radius-${r}`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recenter button */}
      <Button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => { setUserPos({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setRecenterKey(k => k + 1); },
              () => toast.error("Geolocalisation non disponible")
            );
          }
        }}
        className="absolute bottom-24 right-4 z-[1000] h-12 w-12 rounded-full bg-white/95 text-slate-700 shadow-lg p-0 hover:bg-slate-100"
        data-testid="recenter-btn"
      >
        <Crosshair className="h-5 w-5" />
      </Button>

      {/* Suppliers count */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Badge className="bg-white/95 text-slate-700 shadow-lg px-3 py-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
          {loading ? "..." : `${suppliers.length} fournisseurs`}
        </Badge>
      </div>

      {/* Selected Supplier Panel */}
      {selectedSupplier && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:bottom-4 md:w-96 animate-slide-in" data-testid="supplier-detail">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
            <div className="h-1.5" style={{ background: CATEGORY_CONFIG[selectedSupplier.category]?.color || "#10b981" }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{selectedSupplier.name}</h3>
                  <p className="text-sm text-slate-500">{selectedSupplier.description}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSupplier(null)} className="text-slate-400 h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Distance & Rating */}
              <div className="flex items-center gap-3 mb-3">
                {selectedSupplier.distance_km !== undefined && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <MapPin className="h-3 w-3 mr-1" /> {selectedSupplier.distance_km} km
                  </Badge>
                )}
                {selectedSupplier.rating && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    <Star className="h-3 w-3 mr-1" /> {selectedSupplier.rating}
                  </Badge>
                )}
                <Badge className="text-xs" style={{ background: CATEGORY_CONFIG[selectedSupplier.category]?.color + "20", color: CATEGORY_CONFIG[selectedSupplier.category]?.color }}>
                  {CATEGORY_CONFIG[selectedSupplier.category]?.label}
                </Badge>
              </div>

              {/* Products */}
              {selectedSupplier.products?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Produits / Services</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSupplier.products.map((p, i) => (
                      <Badge key={i} className="bg-slate-100 text-slate-600 text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="text-sm text-slate-600 space-y-1 mb-3">
                {selectedSupplier.address && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedSupplier.address}</p>}
                {selectedSupplier.hours && <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-400" /> {selectedSupplier.hours}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                {selectedSupplier.phone && (
                  <Button size="sm" className="flex-1 bg-emerald-500 text-white gap-1.5" onClick={() => window.open(`tel:${selectedSupplier.phone}`)}>
                    <Phone className="h-3.5 w-3.5" /> Appeler
                  </Button>
                )}
                {selectedSupplier.whatsapp && (
                  <Button size="sm" className="flex-1 bg-green-600 text-white gap-1.5" onClick={() => window.open(`https://wa.me/${selectedSupplier.whatsapp.replace("+", "")}`)}>
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-1.5 text-slate-600 border-slate-300" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSupplier.lat},${selectedSupplier.lon}`)}>
                  <Navigation className="h-3.5 w-3.5" /> Itineraire
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CarteAgricole;
