import React, { useEffect, useState } from "react";
import { getAerialImages, getAerialImagesStats } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  Satellite, Camera, TrendingUp, AlertTriangle, 
  Download, Info, Calendar, Clock, MapPin, Plus
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const ImagesSatellites = () => {
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduledCaptures, setScheduledCaptures] = useState([
    { id: 1, parcel: "Parcelle Nord - Mais", date: "2026-03-10", time: "10:00", source: "satellite", status: "planifie", resolution: "30cm" },
    { id: 2, parcel: "Parcelle Sud - Cacao", date: "2026-03-12", time: "14:00", source: "drone", status: "planifie", resolution: "5cm" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [imagesRes, statsRes] = await Promise.all([
          getAerialImages(),
          getAerialImagesStats()
        ]);
        setImages(imagesRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching aerial images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="satellites-page">
      {/* Header */}
      <div className="gradient-satellites rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Satellite className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Images satellites & drones</h1>
        </div>
        <p className="text-white/80">Analyse IA des cultures par imagerie aérienne</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_images || 0}</p>
                <p className="text-sm text-slate-500">Images analysées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.average_ndvi || 0}%</p>
                <p className="text-sm text-slate-500">NDVI moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_stress_zones || 0}</p>
                <p className="text-sm text-slate-500">Zones de stress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden card-hover" data-testid={`image-${image.id}`}>
            {/* Image */}
            <div className="relative h-56 bg-slate-100">
              <img
                src={image.image_url}
                alt={image.parcel_name}
                className="w-full h-full object-cover"
              />
              <Badge className={cn(
                "absolute top-4 left-4 text-white",
                image.source === "drone" ? "bg-emerald-600" : "bg-amber-600"
              )}>
                {image.source === "drone" ? (
                  <><Camera className="h-3 w-3 mr-1" /> Drone</>
                ) : (
                  <><Satellite className="h-3 w-3 mr-1" /> Satellite</>
                )}
              </Badge>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-bold text-white">{image.parcel_name}</h3>
                <p className="text-white/80 text-sm">Capture du {image.capture_date}</p>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-lg font-bold text-emerald-700">NDVI: {image.ndvi_value}</p>
                  <p className="text-xs text-slate-500">Indice de végétation</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-lg font-bold text-blue-700">{image.health_percent}%</p>
                  <p className="text-xs text-slate-500">Santé générale</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <p className="text-lg font-bold text-orange-700">{image.stress_zones}</p>
                  <p className="text-xs text-slate-500">Zones de stress</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-800">Recommandations</h4>
                </div>
                <p className="text-sm text-slate-600">
                  Excellent état de santé des cultures. Continuez le programme actuel.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scheduled Captures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-600" /> Captures programmees</span>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" data-testid="schedule-capture-btn"><Plus className="h-4 w-4 mr-1" /> Programmer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Programmer une capture satellite</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Parcelle</Label><Input placeholder="Nom de la parcelle" data-testid="schedule-parcel" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date</Label><Input type="date" data-testid="schedule-date" /></div>
                    <div><Label>Heure</Label><Input type="time" defaultValue="10:00" data-testid="schedule-time" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Source</Label>
                      <Select defaultValue="satellite"><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="satellite">Satellite</SelectItem><SelectItem value="drone">Drone</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Resolution</Label>
                      <Select defaultValue="30cm"><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="5cm">5cm (Drone)</SelectItem><SelectItem value="30cm">30cm (Standard)</SelectItem><SelectItem value="10m">10m (Large)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => {
                    setScheduledCaptures(prev => [...prev, { id: Date.now(), parcel: "Nouvelle parcelle", date: "2026-03-15", time: "10:00", source: "satellite", status: "planifie", resolution: "30cm" }]);
                    toast.success("Capture programmee !");
                    setShowScheduleDialog(false);
                  }}><Calendar className="h-4 w-4 mr-1" /> Confirmer la programmation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scheduledCaptures.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", c.source === "satellite" ? "bg-amber-100" : "bg-emerald-100")}>
                    {c.source === "satellite" ? <Satellite className="h-5 w-5 text-amber-600" /> : <Camera className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.parcel}</p>
                    <p className="text-xs text-slate-500">{c.date} a {c.time} - Resolution: {c.resolution}</p>
                  </div>
                </div>
                <Badge className={c.status === "planifie" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}>{c.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Capture Section */}
      <div className="gradient-alerts rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Planifier une nouvelle capture</h3>
        <p className="text-white/80 mb-4">
          Programmez l'analyse par satellite ou drone de vos parcelles
        </p>
        <Button 
          variant="secondary" 
          className="bg-white text-orange-600 hover:bg-slate-100"
          data-testid="new-capture-btn"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Programmer une capture
        </Button>
      </div>
    </div>
  );
};

export default ImagesSatellites;
