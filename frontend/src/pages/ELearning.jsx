import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ActionTooltip } from "../components/ui/tooltip";
import ExportButton from "../components/ExportButton";
import { 
  GraduationCap, BookOpen, Clock, Star, Award,
  Play, CheckCircle, Users, FileText, Video,
  Download, ChevronRight, Trophy, Sparkles,
  Plus, Upload, ShoppingCart, Edit2, Eye
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const ELearning = () => {
  const [courses, setCourses] = useState([]);
  const [trainerCourses, setTrainerCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", category: "agriculture", level: "debutant", price: 0, type: "video", duration: "" });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, myCoursesRes, trainerRes] = await Promise.all([
        api.get("/learning/courses"),
        api.get("/learning/my-courses"),
        api.get("/trainer/trainings").catch(() => ({ data: [] }))
      ]);
      setCourses(coursesRes.data);
      setMyCourses(myCoursesRes.data);
      setTrainerCourses(trainerRes.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/learning/enroll/${courseId}`);
      toast.success("Inscription réussie au cours!");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    }
  };

  const handleCompleteModule = async (courseId, moduleIndex) => {
    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("module_index", moduleIndex);
      
      const response = await api.post("/learning/complete-module", formData);
      
      if (response.data.certificate_earned) {
        toast.success("🎉 Félicitations! Vous avez terminé le cours et obtenu votre certificat!");
        setCertificate(response.data.certificate_id);
      } else {
        toast.success("Module complété!");
      }
      
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la validation");
    }
  };

  const viewCertificate = async (certificateId) => {
    try {
      const response = await api.get(`/learning/certificate/${certificateId}`);
      setCertificate(response.data);
      setShowCertificateDialog(true);
    } catch (error) {
      toast.error("Certificat non trouvé");
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case "debutant":
        return <Badge className="bg-emerald-100 text-emerald-700">Débutant</Badge>;
      case "intermediaire":
        return <Badge className="bg-blue-100 text-blue-700">Intermédiaire</Badge>;
      case "avance":
        return <Badge className="bg-purple-100 text-purple-700">Avancé</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const getEnrollment = (courseId) => {
    return myCourses.find(e => e.course_id === courseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="elearning-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Formation AGRICAM IA</h1>
            </div>
            <p className="text-white/80">Apprenez à utiliser la plateforme et améliorez vos compétences agricoles</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button className="bg-white text-indigo-600 hover:bg-white/90" onClick={() => setShowCreateDialog(true)} data-testid="add-course-btn">
              <Plus className="h-4 w-4 mr-2" /> Creer une formation
            </Button>
            {/* Export Button */}
            <ExportButton 
              data={courses} 
              type="recommendations" 
              title="Rapport Formation E-Learning AGRICAM IA"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
            />
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs">Cours disponibles</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-xs">Mes inscriptions</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{myCourses.filter(c => c.certificate_earned).length}</p>
              <p className="text-xs">Certificats</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Progress */}
      {myCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Mes cours en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myCourses.map((enrollment) => {
                const course = courses.find(c => c.id === enrollment.course_id);
                if (!course) return null;
                
                return (
                  <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{course.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <Progress value={enrollment.progress_percent} className="flex-1 h-2" />
                        <span className="text-sm text-slate-500">{enrollment.progress_percent}%</span>
                      </div>
                    </div>
                    {enrollment.certificate_earned ? (
                      <ActionTooltip content="Voir votre certificat">
                        <Button 
                          variant="outline" 
                          className="text-amber-600 border-amber-300"
                          onClick={() => viewCertificate(enrollment.certificate_id)}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Certificat
                        </Button>
                      </ActionTooltip>
                    ) : (
                      <Button onClick={() => setSelectedCourse(course)}>
                        Continuer
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Catalog */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Catalogue des formations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const enrollment = getEnrollment(course.id);
            const isEnrolled = !!enrollment;
            
            return (
              <Card key={course.id} className="overflow-hidden card-hover" data-testid={`course-${course.id}`}>
                {/* Course Header */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative p-4">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {getLevelBadge(course.level)}
                    {course.certificate_available && (
                      <Badge className="bg-amber-500 text-white">
                        <Award className="h-3 w-3 mr-1" />
                        Certifié
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <GraduationCap className="h-10 w-10 text-white/80" />
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <ActionTooltip content="Durée totale du cours">
                      <div className="flex items-center gap-1 cursor-help">
                        <Clock className="h-4 w-4" />
                        {course.duration_hours}h
                      </div>
                    </ActionTooltip>
                    <ActionTooltip content="Nombre de modules">
                      <div className="flex items-center gap-1 cursor-help">
                        <FileText className="h-4 w-4" />
                        {course.modules?.length || 0} modules
                      </div>
                    </ActionTooltip>
                    <ActionTooltip content="Étudiants inscrits">
                      <div className="flex items-center gap-1 cursor-help">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count}
                      </div>
                    </ActionTooltip>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "h-4 w-4",
                          star <= Math.round(course.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"
                        )} 
                      />
                    ))}
                    <span className="text-sm text-slate-600">{course.rating}/5</span>
                  </div>

                  {/* Instructor */}
                  <div className="text-sm text-slate-500">
                    Par: <span className="font-medium text-indigo-600">{course.instructor}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <>
                        {enrollment.certificate_earned ? (
                          <ActionTooltip content="Vous avez complété ce cours">
                            <Button className="flex-1 bg-emerald-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complété
                            </Button>
                          </ActionTooltip>
                        ) : (
                          <Button 
                            className="flex-1"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continuer ({enrollment.progress_percent}%)
                          </Button>
                        )}
                      </>
                    ) : (
                      <ActionTooltip content="S'inscrire à cette formation gratuite">
                        <Button 
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleEnroll(course.id)}
                          data-testid={`enroll-${course.id}`}
                        >
                          <GraduationCap className="h-4 w-4 mr-2" />
                          S'inscrire gratuitement
                        </Button>
                      </ActionTooltip>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trainer Expert Formations */}
      {trainerCourses.length > 0 && (
        <div data-testid="trainer-courses-section">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            Formations expert
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainerCourses.filter(tc => tc.is_published).map((tc) => (
              <Card key={tc.id} className="overflow-hidden card-hover" data-testid={`trainer-course-${tc.id}`}>
                <div className="h-28 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 relative p-4">
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Badge className="bg-white/20 text-white text-xs">{tc.difficulty || "debutant"}</Badge>
                    {tc.price > 0 && <Badge className="bg-white/20 text-white text-xs">{tc.price.toLocaleString()} XAF</Badge>}
                    {tc.price === 0 && <Badge className="bg-emerald-500/80 text-white text-xs">Gratuit</Badge>}
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <Video className="h-8 w-8 text-white/80" />
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-2">{tc.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{tc.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tc.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{tc.students_count || 0}</span>
                    {tc.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{tc.rating}</span>}
                  </div>
                  <p className="text-xs text-slate-400">Par {tc.trainer_name}</p>
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-500 gap-1" onClick={async () => {
                    try { await api.post(`/trainer/trainings/${tc.id}/enroll`); toast.success("Inscrit !"); fetchData(); } catch(e) { toast.error(e.response?.data?.message || "Inscription effectuee"); }
                  }}>
                    <GraduationCap className="h-3 w-3" /> S'inscrire
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  {selectedCourse.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <p className="text-slate-600">{selectedCourse.description}</p>
                
                {/* Modules */}
                <div>
                  <h4 className="font-semibold mb-3">Modules du cours</h4>
                  <div className="space-y-2">
                    {selectedCourse.modules?.map((module, idx) => {
                      const enrollment = getEnrollment(selectedCourse.id);
                      const isCompleted = enrollment?.completed_modules?.includes(idx);
                      
                      return (
                        <div 
                          key={idx}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Play className="h-5 w-5 text-slate-400" />
                            )}
                            <div>
                              <p className="font-medium">{module.title}</p>
                              <p className="text-xs text-slate-500">{module.duration_min} min</p>
                            </div>
                          </div>
                          {!isCompleted && enrollment && (
                            <Button 
                              size="sm"
                              onClick={() => handleCompleteModule(selectedCourse.id, idx)}
                            >
                              Marquer terminé
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enroll if not enrolled */}
                {!getEnrollment(selectedCourse.id) && (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      handleEnroll(selectedCourse.id);
                      setSelectedCourse(null);
                    }}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    S'inscrire à ce cours
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Certificat de Réussite
            </DialogTitle>
          </DialogHeader>
          
          {certificate && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 text-center">
                <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <p className="text-sm text-slate-500 mb-2">Ce certificat atteste que</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">{certificate.user_name}</p>
                <p className="text-sm text-slate-500 mb-4">a complété avec succès le cours</p>
                <p className="text-lg font-semibold text-indigo-600 mb-4">{certificate.course_title}</p>
                <div className="text-xs text-slate-400">
                  <p>Délivré le: {new Date(certificate.issued_date).toLocaleDateString('fr-FR')}</p>
                  <p>Par: {certificate.issuer}</p>
                  <p className="mt-2 font-mono">ID: {certificate.certificate_id}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button className="flex-1 bg-indigo-600">
                  Partager
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-600" /> Creer une formation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Titre *</Label><Input value={newCourse.title} onChange={e => setNewCourse(p => ({...p, title: e.target.value}))} placeholder="Ex: Agriculture de precision" data-testid="course-title" /></div>
            <div><Label>Description</Label><Textarea value={newCourse.description} onChange={e => setNewCourse(p => ({...p, description: e.target.value}))} placeholder="Description du cours..." rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categorie</Label>
                <Select value={newCourse.category} onValueChange={v => setNewCourse(p => ({...p, category: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["agriculture", "technologie", "gestion", "elevage", "irrigation", "drones"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Niveau</Label>
                <Select value={newCourse.level} onValueChange={v => setNewCourse(p => ({...p, level: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debutant">Debutant</SelectItem>
                    <SelectItem value="intermediaire">Intermediaire</SelectItem>
                    <SelectItem value="avance">Avance</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Type</Label>
                <Select value={newCourse.type} onValueChange={v => setNewCourse(p => ({...p, type: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="ebook">eBook</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint</SelectItem>
                    <SelectItem value="live">Formation Live</SelectItem>
                    <SelectItem value="mixed">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Duree</Label><Input value={newCourse.duration} onChange={e => setNewCourse(p => ({...p, duration: e.target.value}))} placeholder="Ex: 4h" /></div>
              <div><Label>Prix (FCFA)</Label><Input type="number" value={newCourse.price} onChange={e => setNewCourse(p => ({...p, price: parseInt(e.target.value) || 0}))} /></div>
            </div>
            <div><Label>Fichiers (videos, documents, images)</Label>
              <div 
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                data-testid="file-drop-zone"
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                {uploadFile ? (
                  <p className="text-sm text-indigo-600 font-medium">{uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} Mo)</p>
                ) : (
                  <p className="text-sm text-slate-500">Glissez vos fichiers ici ou cliquez</p>
                )}
                <p className="text-xs text-slate-400 mt-1">PDF, PPTX, MP4, MOV, JPEG, PNG, DOCX (max 200MB)</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.pptx,.ppt,.mp4,.mov,.avi,.webm,.jpg,.jpeg,.png,.epub,.doc,.docx,.txt"
                  data-testid="file-upload-input"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      toast.success(`Fichier selectionne: ${e.target.files[0].name}`);
                    }
                  }}
                />
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" data-testid="create-course-btn" disabled={uploading} onClick={async () => {
              if (!newCourse.title) { toast.error("Titre requis"); return; }
              setUploading(true);
              try {
                // Determine if video or document based on type/file
                const isVideo = uploadFile && /\.(mp4|avi|mov|webm)$/i.test(uploadFile.name);
                
                // Create training via API
                const res = await api.post("/trainer/trainings", {
                  title: newCourse.title,
                  description: newCourse.description || newCourse.title,
                  category: newCourse.category,
                  target_roles: ["farmer", "agronomist"],
                  difficulty: newCourse.level,
                  duration_minutes: parseInt(newCourse.duration) || 60,
                  price: newCourse.price || 0,
                  is_published: true,
                });
                const trainingId = res.data?.training?.id;
                
                // Upload file if selected
                if (uploadFile && trainingId) {
                  toast.info("Upload du fichier en cours...");
                  const fd = new FormData();
                  fd.append("file", uploadFile);
                  if (isVideo) {
                    await api.post(`/trainer/upload-video?training_id=${trainingId}`, fd);
                  } else {
                    // Create ebook linked to this training, then upload
                    const ebRes = await api.post("/trainer/ebooks", {
                      title: newCourse.title,
                      description: newCourse.description || newCourse.title,
                      category: newCourse.category,
                      price: newCourse.price || 0,
                    });
                    const ebookId = ebRes.data?.ebook?.id;
                    if (ebookId) {
                      await api.post(`/trainer/upload-ebook?ebook_id=${ebookId}`, fd);
                    }
                  }
                  toast.success("Fichier uploade avec succes !");
                }
                
                toast.success("Formation creee avec succes !");
                setShowCreateDialog(false);
                setUploadFile(null);
                setNewCourse({ title: "", description: "", category: "agriculture", level: "debutant", price: 0, type: "video", duration: "" });
                fetchData();
              } catch (err) {
                console.error("Create training error:", err);
                toast.error(err.response?.data?.detail || "Erreur lors de la creation");
              } finally {
                setUploading(false);
              }
            }}><Plus className="h-4 w-4 mr-2" /> {uploading ? "Upload en cours..." : "Publier la formation"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-indigo-800">Formations certifiantes AGRICAM IA</h3>
              <p className="text-indigo-700 mt-1">
                Nos cours sont conçus par des experts agricoles et technologiques pour vous aider à:
              </p>
              <ul className="mt-2 text-sm text-indigo-600 space-y-1">
                <li>• Maîtriser la plateforme AGRICAM IA</li>
                <li>• Optimiser vos rendements agricoles</li>
                <li>• Comprendre l'agriculture de précision</li>
                <li>• Obtenir des certificats reconnus</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ELearning;
