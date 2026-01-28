import React, { useEffect, useState } from "react";
import { getSensors, getSensorsStats } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { 
  Wifi, CheckCircle2, XCircle, AlertCircle, 
  Droplets, Thermometer, FlaskConical, Camera, Upload, Zap
} from "lucide-react";
import { cn } from "../lib/utils";

const CapteursIoT = () => {
  const [sensors, setSensors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, statsRes] = await Promise.all([
          getSensors(),
          getSensorsStats()
        ]);
        setSensors(sensorsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching sensors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSensorIcon = (type) => {
    switch (type) {
      case "humidity": return <Droplets className="h-5 w-5 text-blue-500" />;
      case "temperature": return <Thermometer className="h-5 w-5 text-orange-500" />;
      case "ph": return <FlaskConical className="h-5 w-5 text-cyan-500" />;
      case "npk": return <FlaskConical className="h-5 w-5 text-green-500" />;
      case "camera": return <Camera className="h-5 w-5 text-purple-500" />;
      default: return <Wifi className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "actif":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
            <Zap className="h-3 w-3" />
            Actif
          </Badge>
        );
      case "erreur":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
            Erreur
          </Badge>
        );
      case "inactif":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
            Inactif
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="capteurs-page">
      {/* Header */}
      <div className="gradient-sensors rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Wifi className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Capteurs IoT</h1>
        </div>
        <p className="text-white/80">Surveillance en temps réel de vos parcelles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover" data-testid="stat-actif">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.actif || 0}</p>
                <p className="text-sm text-slate-500">Capteurs actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-inactif">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.inactif || 0}</p>
                <p className="text-sm text-slate-500">Capteurs inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" data-testid="stat-erreur">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.erreur || 0}</p>
                <p className="text-sm text-slate-500">Capteurs en erreur</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensors Table */}
      <Card data-testid="sensors-table">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-500" />
            <CardTitle>Liste des capteurs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Capteur</TableHead>
                <TableHead className="font-semibold text-slate-700">Parcelle</TableHead>
                <TableHead className="font-semibold text-slate-700">Valeur</TableHead>
                <TableHead className="font-semibold text-slate-700">Dernière mise à jour</TableHead>
                <TableHead className="font-semibold text-slate-700">État</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensors.map((sensor) => (
                <TableRow 
                  key={sensor.id}
                  className="hover:bg-slate-50 transition-colors"
                  data-testid={`sensor-row-${sensor.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getSensorIcon(sensor.type)}
                      <div>
                        <p className="font-medium text-slate-900">{sensor.name}</p>
                        <p className="text-xs text-slate-500">ID: {sensor.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{sensor.parcel_name}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">
                      {sensor.value}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">{sensor.unit}</span>
                  </TableCell>
                  <TableCell className="text-slate-600">{sensor.last_update}</TableCell>
                  <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Import Section */}
      <div className="gradient-irrigation rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Import de données IoT</h3>
        <p className="text-white/80 mb-4">
          Importez vos données depuis des fichiers CSV ou Excel
        </p>
        <Button 
          variant="secondary" 
          className="bg-white text-blue-600 hover:bg-slate-100"
          data-testid="import-btn"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importer des données
        </Button>
      </div>
    </div>
  );
};

export default CapteursIoT;
