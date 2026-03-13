import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  Settings, User, Bell, Shield, Key, Globe, Save, Bot,
  Plus, Trash2, Wifi, Plane, Camera, Palette, Sun, Moon,
  Monitor, Lock, Eye, EyeOff, Check
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import { supportedLanguages } from "../locales/translations";
import { useAuth } from "../App";
import { cn } from "../lib/utils";

const THEMES = [
  { id: "dark", label: "Sombre", icon: Moon, colors: "from-slate-900 to-slate-800" },
  { id: "light", label: "Clair", icon: Sun, colors: "from-gray-100 to-white" },
  { id: "emerald", label: "Emeraude", icon: Palette, colors: "from-emerald-900 to-teal-900" },
  { id: "ocean", label: "Ocean", icon: Palette, colors: "from-blue-900 to-cyan-900" },
];

const Parametres = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { user, login, token } = useAuth();
  const fileInputRef = useRef(null);

  const [drones, setDrones] = useState([]);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDroneDialog, setShowAddDroneDialog] = useState(false);
  const [showAddRobotDialog, setShowAddRobotDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [profileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || "");
  const [profileCompany, setProfileCompany] = useState(user?.company_name || "");
  const [profileLinkedin, setProfileLinkedin] = useState(user?.linkedin_url || "");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Theme
  const [theme, setTheme] = useState(user?.theme || "dark");

  useEffect(() => { fetchEquipment(); }, []);

  const fetchEquipment = async () => {
    try {
      const [dronesRes, robotsRes] = await Promise.all([
        api.get("/drones"), api.get("/robots")
      ]);
      setDrones(dronesRes.data);
      setRobots(robotsRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put("/user/update-profile", {
        full_name: profileName,
        phone: profilePhone,
        company_name: profileCompany,
        profile_photo: profilePhoto,
        linkedin_url: profileLinkedin,
        language,
        theme,
      });
      if (res.data.user) {
        login(res.data.user, token);
      }
      toast.success("Profil mis a jour !");
    } catch (e) {
      toast.error("Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    try {
      await api.put("/user/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Mot de passe modifie avec succes !");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erreur lors du changement");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("La photo ne doit pas depasser 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("agricam_theme", newTheme);
  };

  const handleAddDrone = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post("/drones", {
        name: formData.get("name"), type: formData.get("type"), model: formData.get("model"),
        cameras: formData.get("cameras").split(",").map(c => c.trim()),
        max_flight_time_min: parseInt(formData.get("max_flight_time"))
      });
      toast.success("Drone ajoute !");
      setShowAddDroneDialog(false);
      fetchEquipment();
    } catch { toast.error("Erreur"); }
  };

  const handleAddRobot = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post("/robots", {
        name: formData.get("name"), type: formData.get("type"), model: formData.get("model"),
        tools: formData.get("tools").split(",").map(t => t.trim())
      });
      toast.success("Robot ajoute !");
      setShowAddRobotDialog(false);
      fetchEquipment();
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="parametres-page">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Parametres</h1>
        </div>
        <p className="text-white/80">Configuration de votre compte et de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="bg-[#111827] border-slate-800" data-testid="profile-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-blue-400" /> Profil utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="flex items-center gap-4">
              <div
                className="relative h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-emerald-500/30 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                data-testid="profile-photo"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <div>
                <p className="text-sm text-white font-medium">{user?.full_name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <Badge className="mt-1 bg-emerald-900/40 text-emerald-400 text-xs">{user?.role}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Nom complet</Label>
                <Input value={profileName} onChange={e => setProfileName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-name" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Telephone</Label>
                <Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-phone" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Entreprise</Label>
                <Input value={profileCompany} onChange={e => setProfileCompany(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-company" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">LinkedIn</Label>
                <Input value={profileLinkedin} onChange={e => setProfileLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="bg-slate-800 border-slate-700 text-white" data-testid="input-linkedin" />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500" data-testid="save-profile">
              <Save className="h-4 w-4 mr-2" /> {saving ? "Enregistrement..." : "Enregistrer le profil"}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="bg-[#111827] border-slate-800" data-testid="theme-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5 text-violet-400" /> Theme et apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    theme === t.id
                      ? "border-emerald-500 bg-emerald-900/20"
                      : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                  )}
                  data-testid={`theme-${t.id}`}
                >
                  <div className={cn("h-8 w-full rounded-lg bg-gradient-to-r mb-2", t.colors)} />
                  <div className="flex items-center gap-2">
                    <t.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-white">{t.label}</span>
                    {theme === t.id && <Check className="h-4 w-4 text-emerald-400 ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-[#111827] border-slate-800" data-testid="security-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-emerald-400" /> Securite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Authentification 2FA</p>
                <p className="text-sm text-slate-500">Double authentification</p>
              </div>
              <Switch data-testid="switch-2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Connexion biometrique</p>
                <p className="text-sm text-slate-500">Face ID / Empreinte</p>
              </div>
              <Switch data-testid="switch-biometric" />
            </div>

            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white" data-testid="change-password-btn">
                  <Key className="h-4 w-4 mr-2" /> Changer le mot de passe
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Changer le mot de passe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-slate-400">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white pr-10"
                        data-testid="current-password-input"
                      />
                      <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white pr-10"
                        data-testid="new-password-input"
                      />
                      <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400">Confirmer</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      data-testid="confirm-password-input"
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="w-full bg-emerald-600" data-testid="submit-password-change">
                    <Lock className="h-4 w-4 mr-2" /> Modifier le mot de passe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="bg-[#111827] border-slate-800" data-testid="language-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-cyan-400" /> Langue et region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-400">Langue</Label>
                <select
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  data-testid="select-language"
                  value={language}
                  onChange={e => { setLanguage(e.target.value); toast.success("Langue changee !"); }}
                >
                  {supportedLanguages.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Fuseau horaire</Label>
                <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="select-timezone">
                  <option value="africa/douala">Africa/Douala (UTC+1)</option>
                  <option value="africa/dakar">Africa/Dakar (UTC+0)</option>
                  <option value="europe/paris">Europe/Paris (UTC+1)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Format de date</Label>
                <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="select-dateformat">
                  <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                  <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Unites</Label>
                <select className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="select-units">
                  <option value="metric">Metrique (ha, C, L)</option>
                  <option value="imperial">Imperial (acres, F, gal)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#111827] border-slate-800" data-testid="notifications-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5 text-amber-400" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-white">Alertes email</p><p className="text-sm text-slate-500">Recevoir les alertes par email</p></div>
              <Switch defaultChecked data-testid="switch-email" />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-white">Alertes SMS</p><p className="text-sm text-slate-500">Recevoir les alertes par SMS</p></div>
              <Switch data-testid="switch-sms" />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-white">Notifications push</p><p className="text-sm text-slate-500">Notifications dans l'application</p></div>
              <Switch defaultChecked data-testid="switch-push" />
            </div>
          </CardContent>
        </Card>

        {/* Drones Configuration */}
        <Card className="bg-[#111827] border-slate-800" data-testid="drones-config-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white"><Plane className="h-5 w-5 text-violet-400" /> Drones</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => navigate("/drones-avance")}>Piloter</Button>
                <Dialog open={showAddDroneDialog} onOpenChange={setShowAddDroneDialog}>
                  <DialogTrigger asChild><Button size="sm" className="bg-emerald-600"><Plus className="h-4 w-4" /></Button></DialogTrigger>
                  <DialogContent className="bg-[#111827] border-slate-700">
                    <DialogHeader><DialogTitle className="text-white">Ajouter un drone</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddDrone} className="space-y-4">
                      <div className="space-y-2"><Label className="text-slate-400">Nom</Label><Input name="name" required placeholder="Ex: AgriDrone 3" className="bg-slate-800 border-slate-700 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-slate-400">Type</Label>
                          <select name="type" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                            <option value="agriculture">Agriculture</option><option value="surveillance">Surveillance</option><option value="mapping">Cartographie</option>
                          </select></div>
                        <div className="space-y-2"><Label className="text-slate-400">Modele</Label><Input name="model" required placeholder="DJI Agras T40" className="bg-slate-800 border-slate-700 text-white" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-slate-400">Cameras (virgule)</Label><Input name="cameras" placeholder="RGB, Thermal" className="bg-slate-800 border-slate-700 text-white" /></div>
                        <div className="space-y-2"><Label className="text-slate-400">Temps vol max (min)</Label><Input name="max_flight_time" type="number" defaultValue="30" className="bg-slate-800 border-slate-700 text-white" /></div>
                      </div>
                      <Button type="submit" className="w-full bg-emerald-600">Ajouter</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-center py-4 text-slate-400">Chargement...</p> : drones.length > 0 ? drones.map((drone) => (
              <div key={drone.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${drone.wifi_connected ? "bg-emerald-500" : "bg-slate-500"}`} />
                  <div><p className="font-medium text-white text-sm">{drone.name}</p><p className="text-xs text-slate-500">{drone.model}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {drone.wifi_connected ? <Badge className="bg-emerald-900/40 text-emerald-400">Connecte</Badge> : <Button size="sm" variant="ghost" className="text-slate-400"><Wifi className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { api.delete(`/drones/${drone.id}`).then(() => { toast.success("Supprime"); fetchEquipment(); }); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            )) : <p className="text-center py-4 text-slate-500">Aucun drone configure</p>}
          </CardContent>
        </Card>

        {/* Robots Configuration */}
        <Card className="bg-[#111827] border-slate-800" data-testid="robots-config-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white"><Bot className="h-5 w-5 text-indigo-400" /> Robots</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => navigate("/robots-avance")}>Piloter</Button>
                <Dialog open={showAddRobotDialog} onOpenChange={setShowAddRobotDialog}>
                  <DialogTrigger asChild><Button size="sm" className="bg-emerald-600"><Plus className="h-4 w-4" /></Button></DialogTrigger>
                  <DialogContent className="bg-[#111827] border-slate-700">
                    <DialogHeader><DialogTitle className="text-white">Ajouter un robot</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddRobot} className="space-y-4">
                      <div className="space-y-2"><Label className="text-slate-400">Nom</Label><Input name="name" required placeholder="Ex: AgriBot 3" className="bg-slate-800 border-slate-700 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-slate-400">Type</Label>
                          <select name="type" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                            <option value="multipurpose">Polyvalent</option><option value="weeding">Desherbage</option><option value="spraying">Pulverisation</option>
                          </select></div>
                        <div className="space-y-2"><Label className="text-slate-400">Modele</Label><Input name="model" required placeholder="AGRICAM RB-500" className="bg-slate-800 border-slate-700 text-white" /></div>
                      </div>
                      <div className="space-y-2"><Label className="text-slate-400">Outils (virgule)</Label><Input name="tools" placeholder="bras_articule, camera" className="bg-slate-800 border-slate-700 text-white" /></div>
                      <Button type="submit" className="w-full bg-emerald-600">Ajouter</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-center py-4 text-slate-400">Chargement...</p> : robots.length > 0 ? robots.map((robot) => (
              <div key={robot.id} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${robot.wifi_connected ? "bg-emerald-500" : "bg-slate-500"}`} />
                  <div><p className="font-medium text-white text-sm">{robot.name}</p><p className="text-xs text-slate-500">{robot.model}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {robot.wifi_connected ? <Badge className="bg-emerald-900/40 text-emerald-400">Connecte</Badge> : <Button size="sm" variant="ghost" className="text-slate-400"><Wifi className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { api.delete(`/robots/${robot.id}`).then(() => { toast.success("Supprime"); fetchEquipment(); }); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            )) : <p className="text-center py-4 text-slate-500">Aucun robot configure</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Parametres;
