import React, { useEffect, useState } from "react";
import { getAlerts, markAlertRead } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ActionTooltip } from "../components/ui/tooltip";
import { 
  Bell, AlertTriangle, Clock, Check, 
  Bug, Droplets, Plane, Wifi, X, RefreshCw, Mail, Smartphone
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const Alertes = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (alertId) => {
    try {
      await markAlertRead(alertId);
      toast.success("Alerte marquée comme lue");
      fetchAlerts();
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "critique":
        return { color: "border-l-red-500 bg-red-50", badge: "bg-red-100 text-red-700", icon: AlertTriangle };
      case "warning":
        return { color: "border-l-amber-500 bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle };
      case "info":
        return { color: "border-l-blue-500 bg-blue-50", badge: "bg-blue-100 text-blue-700", icon: Bell };
      default:
        return { color: "border-l-slate-500 bg-slate-50", badge: "bg-slate-100 text-slate-700", icon: Bell };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "disease": return <Bug className="h-5 w-5 text-rose-500" />;
      case "irrigation": return <Droplets className="h-5 w-5 text-blue-500" />;
      case "drone": return <Plane className="h-5 w-5 text-violet-500" />;
      case "sensor": return <Wifi className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(a => !a.is_read);
  const readAlerts = alerts.filter(a => a.is_read);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="alertes-page">
      {/* Header */}
      <div className="gradient-alerts rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Centre d'Alertes</h1>
        </div>
        <p className="text-white/80">Notifications et alertes de vos parcelles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {alerts.filter(a => a.priority === 'critique' && !a.is_read).length}
                </p>
                <p className="text-sm text-slate-500">Alertes critiques</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bell className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{unreadAlerts.length}</p>
                <p className="text-sm text-slate-500">Non lues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{readAlerts.length}</p>
                <p className="text-sm text-slate-500">Traitées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <Card data-testid="unread-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Alertes non lues ({unreadAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadAlerts.map((alert) => {
              const config = getPriorityConfig(alert.priority);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border-l-4 transition-all",
                    config.color
                  )}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                        <Badge className={config.badge}>
                          {alert.priority === 'critique' ? 'Critique' : 
                           alert.priority === 'warning' ? 'Attention' : 'Info'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                        {alert.parcel_name && (
                          <>
                            <span>•</span>
                            <span>{alert.parcel_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkRead(alert.id)}
                      data-testid={`mark-read-${alert.id}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <Card data-testid="read-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-500">
              <Check className="h-5 w-5" />
              Alertes traitées ({readAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {readAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-slate-50 text-slate-500"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs">{new Date(alert.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune alerte pour le moment</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Alertes;
