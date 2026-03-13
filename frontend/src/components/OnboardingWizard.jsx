import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import {
  MapPin, Leaf, Camera, Bot, ChevronRight, ChevronLeft,
  CheckCircle, Sparkles, X, MessageCircle, Send, Map
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import api from "../services/api";

const STEPS = [
  { id: "welcome", title: "Bienvenue sur AGRICAM IA", icon: Sparkles },
  { id: "zone", title: "Definir votre zone agricole", icon: MapPin },
  { id: "parcelle", title: "Creer votre premiere parcelle", icon: Map },
  { id: "camera", title: "Premiere analyse IA", icon: Camera },
  { id: "complete", title: "Configuration terminee", icon: CheckCircle },
];

const OnboardingWizard = ({ user, onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantHistory, setAssistantHistory] = useState([
    { role: "bot", text: "Bonjour ! Je suis votre assistant AGRICAM IA. Je vais vous guider dans la configuration de votre espace. N'hesitez pas a me poser des questions !" }
  ]);
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState({
    region: "", city: "", latitude: "", longitude: "", area_ha: ""
  });
  const [parcelData, setParcelData] = useState({
    name: "", crop_type: "", area: ""
  });

  const cropTypes = ["Mais", "Riz", "Cacao", "Cafe", "Manioc", "Banane", "Palmier a huile", "Coton", "Tournesol", "Autre"];

  const sendAssistantMessage = async () => {
    if (!assistantMessage.trim()) return;
    const msg = assistantMessage.trim();
    setAssistantMessage("");
    setAssistantHistory(prev => [...prev, { role: "user", text: msg }]);
    try {
      const res = await api.post("/chatbot/message", { message: msg, context: `L'utilisateur est en cours d'onboarding, etape: ${STEPS[step].title}` });
      setAssistantHistory(prev => [...prev, { role: "bot", text: res.data.response }]);
    } catch {
      setAssistantHistory(prev => [...prev, { role: "bot", text: "Je suis desole, je ne peux pas repondre pour le moment. Continuez votre configuration !" }]);
    }
  };

  const handleCreateParcel = async () => {
    if (!parcelData.name || !parcelData.crop_type) {
      toast.error("Remplissez au minimum le nom et le type de culture");
      return;
    }
    setLoading(true);
    try {
      await api.post("/parcels", {
        name: parcelData.name,
        crop_type: parcelData.crop_type,
        area: parseFloat(parcelData.area) || 1,
        location: {
          latitude: parseFloat(zoneData.latitude) || 5.9631,
          longitude: parseFloat(zoneData.longitude) || 10.1591
        },
        region: zoneData.region || "Cameroun"
      });
      toast.success("Parcelle creee avec succes !");
      setStep(3);
    } catch (err) {
      toast.error("Erreur lors de la creation");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.put("/user/update-profile", { onboarding_completed: true });
    } catch {}
    onComplete();
  };

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#060a13]/95 backdrop-blur-md z-50 flex items-center justify-center p-4" data-testid="onboarding-wizard">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Etape {step + 1} / {STEPS.length}</span>
            <Button variant="ghost" size="sm" onClick={onComplete} className="text-slate-500 hover:text-white" data-testid="skip-onboarding">
              Passer <X className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className={cn("flex items-center gap-1 text-xs", i <= step ? "text-emerald-400" : "text-slate-600")}>
                <s.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{s.title.split(" ").slice(0, 2).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-[#0b1120]/95 border-emerald-900/30 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          <CardContent className="p-8">
            {/* Step: Welcome */}
            {step === 0 && (
              <div className="text-center space-y-6" data-testid="step-welcome">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-900/20 ring-1 ring-emerald-500/20">
                  <Sparkles className="h-12 w-12 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-[Manrope]">
                  Bienvenue {user?.full_name} !
                </h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Nous allons configurer votre espace AGRICAM IA en quelques etapes simples.
                  Vous pourrez definir votre zone agricole et creer votre premiere parcelle.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <MapPin className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Zone</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <Leaf className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Parcelle</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <Camera className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Analyse IA</p>
                  </div>
                </div>
                <Badge className="bg-emerald-900/30 text-emerald-400">Essai gratuit 14 jours</Badge>
              </div>
            )}

            {/* Step: Define Zone */}
            {step === 1 && (
              <div className="space-y-5" data-testid="step-zone">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Definir votre zone agricole</h2>
                </div>
                <p className="text-sm text-slate-400">Indiquez la localisation de votre exploitation. Ces informations nous permettront de vous fournir des donnees meteo et satellite precises.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Region / Pays</label>
                    <Input
                      value={zoneData.region} onChange={e => setZoneData({ ...zoneData, region: e.target.value })}
                      placeholder="Ex: Ouest, Cameroun" className="bg-slate-800/50 border-slate-700 text-white"
                      data-testid="zone-region"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Ville / Village</label>
                    <Input
                      value={zoneData.city} onChange={e => setZoneData({ ...zoneData, city: e.target.value })}
                      placeholder="Ex: Bamenda" className="bg-slate-800/50 border-slate-700 text-white"
                      data-testid="zone-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Latitude (optionnel)</label>
                    <Input
                      value={zoneData.latitude} onChange={e => setZoneData({ ...zoneData, latitude: e.target.value })}
                      placeholder="Ex: 5.9631" type="number" step="any" className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Longitude (optionnel)</label>
                    <Input
                      value={zoneData.longitude} onChange={e => setZoneData({ ...zoneData, longitude: e.target.value })}
                      placeholder="Ex: 10.1591" type="number" step="any" className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Surface totale estimee (hectares)</label>
                  <Input
                    value={zoneData.area_ha} onChange={e => setZoneData({ ...zoneData, area_ha: e.target.value })}
                    placeholder="Ex: 25" type="number" className="bg-slate-800/50 border-slate-700 text-white"
                    data-testid="zone-area"
                  />
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-sm text-blue-300">
                  Astuce: Vous pourrez affiner ces donnees plus tard depuis la page Parcelles avec la carte interactive.
                </div>
              </div>
            )}

            {/* Step: Create First Parcel */}
            {step === 2 && (
              <div className="space-y-5" data-testid="step-parcelle">
                <div className="flex items-center gap-3 mb-2">
                  <Leaf className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Creer votre premiere parcelle</h2>
                </div>
                <p className="text-sm text-slate-400">Donnez un nom a votre parcelle et indiquez le type de culture. Vous pourrez en ajouter d'autres plus tard.</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Nom de la parcelle *</label>
                    <Input
                      value={parcelData.name} onChange={e => setParcelData({ ...parcelData, name: e.target.value })}
                      placeholder="Ex: Parcelle Nord" className="bg-slate-800/50 border-slate-700 text-white"
                      data-testid="parcel-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Type de culture *</label>
                    <div className="grid grid-cols-5 gap-2">
                      {cropTypes.map(crop => (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => setParcelData({ ...parcelData, crop_type: crop })}
                          className={cn(
                            "p-2 rounded-lg text-xs text-center transition-all",
                            parcelData.crop_type === crop
                              ? "bg-emerald-900/40 border border-emerald-500/40 text-emerald-400"
                              : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                          data-testid={`crop-${crop}`}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Surface (hectares)</label>
                    <Input
                      value={parcelData.area} onChange={e => setParcelData({ ...parcelData, area: e.target.value })}
                      placeholder="Ex: 5" type="number" className="bg-slate-800/50 border-slate-700 text-white"
                      data-testid="parcel-area"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step: First AI Scan */}
            {step === 3 && (
              <div className="text-center space-y-5" data-testid="step-camera">
                <div className="inline-flex p-4 rounded-2xl bg-amber-900/20 ring-1 ring-amber-500/20">
                  <Camera className="h-12 w-12 text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Decouvrez la Camera IA</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Votre parcelle est creee ! Utilisez la Camera IA pour analyser vos cultures en temps reel.
                  Detectez les maladies, ravageurs et carences nutritionnelles instantanement.
                </p>
                <div className="p-4 bg-slate-800/50 rounded-xl text-left space-y-2 max-w-sm mx-auto">
                  <p className="text-sm text-white font-medium">Modes disponibles :</p>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Analyse generale</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Detection de maladies</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Detection de ravageurs</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Carences nutritionnelles</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Analyse du sol</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Complete */}
            {step === 4 && (
              <div className="text-center space-y-6" data-testid="step-complete">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-900/20 ring-1 ring-emerald-500/20">
                  <CheckCircle className="h-12 w-12 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-[Manrope]">Configuration terminee !</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Votre espace AGRICAM IA est pret. Explorez les fonctionnalites et utilisez l'IA pour optimiser vos rendements.
                </p>
                <div className="p-4 bg-emerald-900/15 border border-emerald-800/30 rounded-xl text-sm text-emerald-400/80">
                  Votre essai gratuit de 14 jours est actif. Profitez de toutes les fonctionnalites premium !
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800">
              {step > 0 && step < 4 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="border-slate-700 text-slate-400 hover:text-white">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Retour
                </Button>
              )}
              <div className="flex-1" />
              {step === 0 && (
                <Button onClick={() => setStep(1)} className="bg-emerald-600 hover:bg-emerald-700" data-testid="start-onboarding">
                  Commencer <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              {step === 1 && (
                <Button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700" data-testid="next-step">
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              {step === 2 && (
                <Button onClick={handleCreateParcel} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700" data-testid="create-parcel-btn">
                  {loading ? "Creation..." : "Creer la parcelle"}
                </Button>
              )}
              {step === 3 && (
                <Button onClick={() => setStep(4)} className="bg-emerald-600 hover:bg-emerald-700">
                  Continuer <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              {step === 4 && (
                <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700" data-testid="finish-onboarding">
                  Acceder a mon tableau de bord <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        {showAssistant ? (
          <Card className="w-80 bg-[#111827] border-slate-700 shadow-2xl" data-testid="onboarding-assistant">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium text-white">Assistant AGRICAM</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAssistant(false)} className="h-6 w-6 p-0 text-slate-500">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-48 overflow-y-auto p-3 space-y-2">
              {assistantHistory.map((msg, i) => (
                <div key={i} className={cn("text-sm p-2 rounded-lg max-w-[85%]",
                  msg.role === "bot" ? "bg-slate-800 text-slate-300" : "bg-emerald-900/40 text-emerald-300 ml-auto"
                )}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-slate-700 flex gap-2">
              <Input
                value={assistantMessage}
                onChange={e => setAssistantMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendAssistantMessage()}
                placeholder="Posez une question..."
                className="bg-slate-800/50 border-slate-700 text-white text-sm h-8"
                data-testid="assistant-input"
              />
              <Button size="sm" onClick={sendAssistantMessage} className="bg-emerald-600 hover:bg-emerald-700 h-8 w-8 p-0">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setShowAssistant(true)}
            className="rounded-full w-12 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            data-testid="open-assistant-btn"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
