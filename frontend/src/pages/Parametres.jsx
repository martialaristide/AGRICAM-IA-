import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { 
  Settings, User, Bell, Shield, Database, 
  Wifi, Plane, Key, Globe, Save
} from "lucide-react";

const Parametres = () => {
  return (
    <div className="space-y-6 animate-slide-in" data-testid="parametres-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Paramètres</h1>
        </div>
        <p className="text-white/80">Configuration de votre compte et de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card data-testid="profile-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profil utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" defaultValue="Jean Dupont" data-testid="input-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jean@ferme.fr" data-testid="input-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="+33 6 12 34 56 78" data-testid="input-phone" />
            </div>
            <Button className="w-full" data-testid="save-profile">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card data-testid="notifications-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertes email</p>
                <p className="text-sm text-slate-500">Recevoir les alertes par email</p>
              </div>
              <Switch defaultChecked data-testid="switch-email" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertes SMS</p>
                <p className="text-sm text-slate-500">Recevoir les alertes par SMS</p>
              </div>
              <Switch data-testid="switch-sms" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-slate-500">Notifications dans l'application</p>
              </div>
              <Switch defaultChecked data-testid="switch-push" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rapport hebdomadaire</p>
                <p className="text-sm text-slate-500">Recevoir un résumé chaque semaine</p>
              </div>
              <Switch defaultChecked data-testid="switch-weekly" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card data-testid="security-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentification 2FA</p>
                <p className="text-sm text-slate-500">Double authentification</p>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connexion biométrique</p>
                <p className="text-sm text-slate-500">Face ID / Empreinte</p>
              </div>
              <Switch data-testid="switch-biometric" />
            </div>
            <Button variant="outline" className="w-full" data-testid="change-password">
              <Key className="h-4 w-4 mr-2" />
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card data-testid="equipment-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-600" />
              Équipements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Capteurs IoT</p>
                  <p className="text-sm text-slate-500">5 capteurs connectés</p>
                </div>
              </div>
              <Button size="sm" variant="outline" data-testid="manage-sensors">Gérer</Button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="h-5 w-5 text-violet-600" />
                <div>
                  <p className="font-medium">Drones</p>
                  <p className="text-sm text-slate-500">2 drones configurés</p>
                </div>
              </div>
              <Button size="sm" variant="outline" data-testid="manage-drones">Gérer</Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card data-testid="language-section" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-600" />
              Langue et région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Langue</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-language">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-timezone">
                  <option value="europe/paris">Europe/Paris (UTC+1)</option>
                  <option value="africa/dakar">Africa/Dakar (UTC+0)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Format de date</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-dateformat">
                  <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                  <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Unités</Label>
                <select className="w-full p-2 border rounded-lg" data-testid="select-units">
                  <option value="metric">Métrique (ha, °C, L)</option>
                  <option value="imperial">Impérial (acres, °F, gal)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Parametres;
