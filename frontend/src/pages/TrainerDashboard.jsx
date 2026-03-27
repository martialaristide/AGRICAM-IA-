import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  GraduationCap, BookOpen, Video, Users, Star, Plus,
  Upload, Eye, EyeOff, Download, CheckCircle, Shield,
  BarChart3, Linkedin, FileText, Play, Clock
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useAuth } from "../App";
import { cn } from "../lib/utils";

const CATEGORIES = [
  { id: "agriculture", label: "Agriculture Generale" },
  { id: "agronomie", label: "Agronomie" },
  { id: "irrigation", label: "Irrigation" },
  { id: "elevage", label: "Elevage" },
  { id: "technologie", label: "Agriculture de Precision" },
];

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [stats, setStats] = useState({});
  const [profile, setProfile] = useState({});
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [showEbookDialog, setShowEbookDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tr, eb, st, pr] = await Promise.all([
        api.get("/trainer/trainings"),
        api.get("/trainer/ebooks"),
        api.get("/trainer/stats"),
        api.get("/trainer/profile"),
      ]);
      setTrainings(tr.data);
      setEbooks(eb.data);
      setStats(st.data);
      setProfile(pr.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const videoFile = fd.get("video_file");
    try {
      const res = await api.post("/trainer/trainings", {
        title: fd.get("title"),
        description: fd.get("description"),
        category: fd.get("category"),
        target_roles: fd.get("target_roles")?.split(",").map(r => r.trim()) || ["farmer"],
        difficulty: fd.get("difficulty"),
        duration_minutes: parseInt(fd.get("duration")) || 60,
        video_url: fd.get("video_url") || null,
        price: parseFloat(fd.get("price")) || 0,
        is_published: true,
      });
      const trainingId = res.data?.training?.id;
      // Upload video if provided
      if (videoFile && videoFile.size > 0 && trainingId) {
        toast.info("Upload de la video en cours...");
        const uploadForm = new FormData();
        uploadForm.append("file", videoFile);
        await api.post(`/trainer/upload-video?training_id=${trainingId}`, uploadForm);
        toast.success("Video uploadee !");
      }
      toast.success("Formation creee avec succes !");
      setShowTrainingDialog(false);
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.detail || "Erreur lors de la creation"); }
  };

  const handleCreateEbook = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ebookFile = fd.get("ebook_file");
    try {
      const res = await api.post("/trainer/ebooks", {
        title: fd.get("title"),
        description: fd.get("description"),
        category: fd.get("category"),
        price: parseFloat(fd.get("price")) || 0,
        download_enabled: true,
      });
      const ebookId = res.data?.ebook?.id;
      // Upload file if provided
      if (ebookFile && ebookFile.size > 0 && ebookId) {
        toast.info("Upload du fichier en cours...");
        const uploadForm = new FormData();
        uploadForm.append("file", ebookFile);
        await api.post(`/trainer/upload-ebook?ebook_id=${ebookId}`, uploadForm);
        toast.success("Fichier uploade !");
      }
      toast.success("Ebook cree avec succes !");
      setShowEbookDialog(false);
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put("/trainer/profile", {
        bio: fd.get("bio"),
        specialties: fd.get("specialties")?.split(",").map(s => s.trim()) || [],
        linkedin_url: fd.get("linkedin"),
        experience_years: parseInt(fd.get("experience")) || 0,
        certifications: fd.get("certifications")?.split(",").map(c => c.trim()) || [],
      });
      toast.success("Profil mis a jour !");
      setShowProfileDialog(false);
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.put(`/trainer/trainings/${id}/publish`);
      toast.success(res.data.is_published ? "Formation publiee" : "Formation masquee");
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const handleToggleDownload = async (id) => {
    try {
      const res = await api.put(`/trainer/ebooks/${id}/toggle-download`);
      toast.success(res.data.download_enabled ? "Telechargement active" : "Telechargement desactive");
      fetchAll();
    } catch { toast.error("Erreur"); }
  };

  const handleRequestVerification = async () => {
    try {
      await api.post("/trainer/request-verification");
      toast.success("Demande de verification soumise !");
    } catch { toast.error("Erreur"); }
  };

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "trainings", label: "Formations", icon: Video },
    { id: "ebooks", label: "Ebooks", icon: BookOpen },
    { id: "profile", label: "Mon profil", icon: Users },
  ];

  return (
    <div className="space-y-6 animate-slide-in" data-testid="trainer-dashboard">
      <div className="bg-gradient-to-r from-orange-900/60 to-amber-900/40 rounded-2xl p-8 text-white shadow-xl border border-orange-800/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-orange-400" />
            <div>
              <h1 className="text-3xl font-bold font-[Manrope]">Espace Formateur</h1>
              <p className="text-white/70">Bienvenue, {user?.full_name || "Formateur"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!profile.verified && (
              <Button onClick={handleRequestVerification} className="bg-orange-600 hover:bg-orange-500 gap-2" data-testid="request-verification-btn">
                <Shield className="h-4 w-4" /> Demander la verification
              </Button>
            )}
            {profile.verified && <Badge className="bg-emerald-900/40 text-emerald-400 gap-1"><CheckCircle className="h-3 w-3" /> Verifie</Badge>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <Button
            key={t.id}
            variant={tab === t.id ? "default" : "outline"}
            className={cn(
              "gap-2 whitespace-nowrap",
              tab === t.id ? "bg-orange-600 text-white" : "border-slate-700 text-slate-400"
            )}
            onClick={() => setTab(t.id)}
            data-testid={`tab-${t.id}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Formations", value: stats.total_trainings || trainings.length, icon: Video, color: "text-orange-400" },
            { label: "Etudiants", value: stats.total_students || 0, icon: Users, color: "text-blue-400" },
            { label: "Ebooks", value: stats.total_ebooks || ebooks.length, icon: BookOpen, color: "text-emerald-400" },
            { label: "Note moyenne", value: "4.7/5", icon: Star, color: "text-amber-400" },
          ].map((s, i) => (
            <Card key={i} className="bg-[#111827] border-slate-800" data-testid={`stat-${s.label.toLowerCase()}`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  <s.icon className={cn("h-6 w-6", s.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-slate-400">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trainings Tab */}
      {tab === "trainings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Mes formations</h2>
            <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 gap-2" data-testid="create-training-btn"><Plus className="h-4 w-4" /> Nouvelle formation</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="text-white">Creer une formation</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateTraining} className="space-y-3">
                  <div><Label className="text-slate-400">Titre</Label><Input name="title" required className="bg-slate-800 border-slate-700 text-white" placeholder="Agriculture de precision avec drones" data-testid="training-title" /></div>
                  <div><Label className="text-slate-400">Description</Label><textarea name="description" required className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white min-h-[80px]" placeholder="Description detaillee..." data-testid="training-desc" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-slate-400">Categorie</Label>
                      <select name="category" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="training-category">
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div><Label className="text-slate-400">Difficulte</Label>
                      <select name="difficulty" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="training-difficulty">
                        <option value="debutant">Debutant</option><option value="intermediaire">Intermediaire</option><option value="avance">Avance</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-slate-400">Duree (min)</Label><Input name="duration" type="number" defaultValue={60} className="bg-slate-800 border-slate-700 text-white" /></div>
                    <div><Label className="text-slate-400">Prix (XAF, 0=gratuit)</Label><Input name="price" type="number" defaultValue={0} className="bg-slate-800 border-slate-700 text-white" data-testid="training-price" /></div>
                  </div>
                  <div><Label className="text-slate-400">Profils cibles (virgule)</Label><Input name="target_roles" defaultValue="farmer,agronomist" className="bg-slate-800 border-slate-700 text-white" data-testid="training-roles" /></div>
                  <div><Label className="text-slate-400">URL Video (YouTube/MP4)</Label><Input name="video_url" placeholder="https://youtube.com/embed/..." className="bg-slate-800 border-slate-700 text-white" data-testid="training-video" /></div>
                  <div><Label className="text-slate-400">Ou uploader un fichier video (MP4, AVI, MOV, WebM - max 200Mo)</Label><input name="video_file" type="file" accept=".mp4,.avi,.mov,.webm,video/mp4,video/avi,video/quicktime,video/webm" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-900/40 file:text-orange-300 hover:file:bg-orange-800/40" data-testid="training-video-upload" /></div>
                  <Button type="submit" className="w-full bg-orange-600" data-testid="submit-training">Publier la formation</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.map(t => (
              <Card key={t.id} className="bg-[#111827] border-slate-800 overflow-hidden" data-testid={`training-card-${t.id}`}>
                <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{t.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mt-1">{t.description}</p>
                    </div>
                    <Badge className={t.is_published ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-700 text-slate-400"}>
                      {t.is_published ? "Publiee" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-orange-900/30 text-orange-300 text-xs">{t.category}</Badge>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">{t.difficulty}</Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration_minutes} min</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" />{t.students_count}</span>
                    {t.rating > 0 && <span className="text-xs text-amber-400 flex items-center gap-1"><Star className="h-3 w-3" />{t.rating}</span>}
                  </div>
                  {t.price > 0 && <p className="text-sm font-semibold text-emerald-400">{t.price.toLocaleString()} XAF</p>}
                  {t.price === 0 && <p className="text-sm text-emerald-400">Gratuit</p>}
                  {t.video_url && (
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 gap-1" onClick={() => window.open(t.video_url, "_blank")}>
                      <Play className="h-3 w-3" /> Voir la video
                    </Button>
                  )}
                  {user?.role === "trainer" && (
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 gap-1" onClick={() => handleTogglePublish(t.id)}>
                        {t.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {t.is_published ? "Masquer" : "Publier"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ebooks Tab */}
      {tab === "ebooks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Mes ebooks</h2>
            <Dialog open={showEbookDialog} onOpenChange={setShowEbookDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 gap-2" data-testid="create-ebook-btn"><Plus className="h-4 w-4" /> Nouvel ebook</Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-slate-700">
                <DialogHeader><DialogTitle className="text-white">Creer un ebook</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateEbook} className="space-y-3">
                  <div><Label className="text-slate-400">Titre</Label><Input name="title" required className="bg-slate-800 border-slate-700 text-white" data-testid="ebook-title" /></div>
                  <div><Label className="text-slate-400">Description</Label><textarea name="description" required className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white min-h-[60px]" data-testid="ebook-desc" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-slate-400">Categorie</Label>
                      <select name="category" className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" data-testid="ebook-category">
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div><Label className="text-slate-400">Prix (XAF)</Label><Input name="price" type="number" defaultValue={0} className="bg-slate-800 border-slate-700 text-white" data-testid="ebook-price" /></div>
                  </div>
                  <div><Label className="text-slate-400">Fichier (PDF, Word, PPT, EPUB - max 50Mo)</Label><input name="ebook_file" type="file" accept=".pdf,.epub,.doc,.docx,.ppt,.pptx,.txt,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-900/40 file:text-emerald-300 hover:file:bg-emerald-800/40" data-testid="ebook-file-upload" /></div>
                  <Button type="submit" className="w-full bg-orange-600" data-testid="submit-ebook">Publier l'ebook</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ebooks.map(eb => (
              <Card key={eb.id} className="bg-[#111827] border-slate-800" data-testid={`ebook-card-${eb.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">{eb.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{eb.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-400">{eb.price > 0 ? `${eb.price.toLocaleString()} XAF` : "Gratuit"}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Download className="h-3 w-3" />{eb.downloads}</span>
                  </div>
                  {user?.role === "trainer" && (
                    <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-300 gap-1" onClick={() => handleToggleDownload(eb.id)}>
                      {eb.download_enabled ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {eb.download_enabled ? "Desactiver telechargement" : "Activer telechargement"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && (
        <Card className="bg-[#111827] border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5 text-orange-400" /> Profil formateur</CardTitle>
              <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-600 gap-2" data-testid="edit-profile-btn">Modifier</Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111827] border-slate-700">
                  <DialogHeader><DialogTitle className="text-white">Modifier le profil</DialogTitle></DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div><Label className="text-slate-400">Bio</Label><textarea name="bio" defaultValue={profile.bio} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white min-h-[80px]" data-testid="profile-bio" /></div>
                    <div><Label className="text-slate-400">Specialites (virgule)</Label><Input name="specialties" defaultValue={profile.specialties?.join(", ")} className="bg-slate-800 border-slate-700 text-white" data-testid="profile-specialties" /></div>
                    <div><Label className="text-slate-400">LinkedIn</Label><Input name="linkedin" defaultValue={profile.linkedin_url} placeholder="https://linkedin.com/in/..." className="bg-slate-800 border-slate-700 text-white" data-testid="profile-linkedin" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-slate-400">Experience (annees)</Label><Input name="experience" type="number" defaultValue={profile.experience_years} className="bg-slate-800 border-slate-700 text-white" /></div>
                      <div><Label className="text-slate-400">Certifications (virgule)</Label><Input name="certifications" defaultValue={profile.certifications?.join(", ")} className="bg-slate-800 border-slate-700 text-white" /></div>
                    </div>
                    <Button type="submit" className="w-full bg-orange-600" data-testid="save-trainer-profile">Enregistrer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Nom</p>
                  <p className="text-white font-medium">{profile.full_name || user?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Bio</p>
                  <p className="text-white">{profile.bio || "Non renseigne"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Specialites</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile.specialties || []).length > 0 ? profile.specialties.map((s, i) => (
                      <Badge key={i} className="bg-orange-900/30 text-orange-300">{s}</Badge>
                    )) : <span className="text-slate-500">Non renseigne</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Experience</p>
                  <p className="text-white">{profile.experience_years || 0} ans</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Certifications</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile.certifications || []).length > 0 ? profile.certifications.map((c, i) => (
                      <Badge key={i} className="bg-blue-900/30 text-blue-300">{c}</Badge>
                    )) : <span className="text-slate-500">Non renseigne</span>}
                  </div>
                </div>
                {profile.linkedin_url && (
                  <div>
                    <p className="text-sm text-slate-400">LinkedIn</p>
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                      <Linkedin className="h-4 w-4" /> Voir le profil
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400">Verification</p>
                  {profile.verified ? (
                    <Badge className="bg-emerald-900/40 text-emerald-400 gap-1"><CheckCircle className="h-3 w-3" /> Verifie</Badge>
                  ) : (
                    <Badge className="bg-amber-900/40 text-amber-400">En attente</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainerDashboard;
