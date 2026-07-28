import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, RefreshCw, MapPin, BatteryMedium, AlertTriangle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

const okIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#84cc16;border:2px solid #fff;box-shadow:0 0 6px rgba(132,204,22,.8)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const escapedIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 0 8px rgba(239,68,68,.9);animation:pulse 1s infinite"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function ElevageMap({ refreshKey, onAlert }) {
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/elevage/farms").then((res) => {
      const gpsFarms = res.data.farms.filter((f) => f.species !== "volaille");
      setFarms(gpsFarms);
      if (gpsFarms.length > 0 && !farmId) setFarmId(gpsFarms[0].id);
    }).catch(() => {});
  }, [refreshKey]); // eslint-disable-line

  const load = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await api.get(`/elevage/farms/${farmId}/collars`);
      setData(res.data);
      if (res.data.escaped_count > 0) {
        toast.warning(`⚠ ${res.data.escaped_count} animal(aux) hors de la géo-clôture !`);
        onAlert?.();
      }
    } catch {
      toast.error("Erreur de synchronisation des colliers GPS");
    } finally {
      setLoading(false);
    }
  }, [farmId, onAlert]);

  useEffect(() => { load(); }, [farmId]); // eslint-disable-line

  return (
    <div className="space-y-4" data-testid="elevage-map">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={farmId} onValueChange={setFarmId}>
          <SelectTrigger className="w-full sm:w-80" data-testid="map-farm-select">
            <SelectValue placeholder="Choisir une installation" />
          </SelectTrigger>
          <SelectContent>
            {farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} data-testid="map-refresh-btn">
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
          Synchroniser les colliers
        </Button>
        {data && (
          <Badge className={data.escaped_count > 0 ? "bg-red-500/20 text-red-400 border-0" : "bg-emerald-500/20 text-emerald-400 border-0"} data-testid="map-fence-status">
            {data.escaped_count > 0 ? (
              <><AlertTriangle className="h-3 w-3 mr-1" />{data.escaped_count} hors zone</>
            ) : (
              <><MapPin className="h-3 w-3 mr-1" />Troupeau dans la zone</>
            )}
          </Badge>
        )}
      </div>

      {data && (
        <>
          <div className="rounded-xl overflow-hidden border border-slate-700/50" style={{ height: 420 }} data-testid="map-container">
            <MapContainer center={[data.center.lat, data.center.lng]} zoom={16} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <Circle
                center={[data.center.lat, data.center.lng]}
                radius={data.geofence_radius_m}
                pathOptions={{ color: "#84cc16", fillColor: "#84cc16", fillOpacity: 0.08, weight: 2, dashArray: "8 6" }}
              />
              {data.collars.map((c) => (
                <Marker key={c.device_id} position={[c.lat, c.lng]} icon={c.inside_fence ? okIcon : escapedIcon}>
                  <Popup>
                    <div style={{ fontSize: 12 }}>
                      <b>{c.animal_tag}</b> — {c.activity}<br />
                      Santé : {c.health_score}/100 · Batterie : {c.battery_level}%<br />
                      {c.inside_fence ? "✅ Dans la zone" : "🔴 HORS ZONE — alerte envoyée"}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{data.collars.length}</p>
              <p className="text-[11px] text-slate-400">Colliers GPS actifs</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className={`text-lg font-bold ${data.escaped_count > 0 ? "text-red-400" : "text-emerald-400"}`}>{data.escaped_count}</p>
              <p className="text-[11px] text-slate-400">Hors géo-clôture</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{data.geofence_radius_m} m</p>
              <p className="text-[11px] text-slate-400">Rayon géo-clôture</p>
            </CardContent></Card>
            <Card><CardContent className="p-3 text-center">
              <p className="text-lg font-bold flex items-center justify-center gap-1"><BatteryMedium className="h-4 w-4 text-lime-400" />{Math.round(data.collars.reduce((s, c) => s + c.battery_level, 0) / (data.collars.length || 1))}%</p>
              <p className="text-[11px] text-slate-400">Batterie moyenne (solaire)</p>
            </CardContent></Card>
          </div>
          <p className="text-[11px] text-slate-500">
            Colliers GPS/LoRaWAN simulés (démo) · Géo-clôture {data.geofence_radius_m}m autour de {data.farm.name} · Alerte WhatsApp automatique en cas de franchissement · Les volailles utilisent le comptage par zones (pas de colliers).
          </p>
        </>
      )}
    </div>
  );
}
