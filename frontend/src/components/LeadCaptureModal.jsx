import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { 
  User, Mail, Phone, CheckCircle, Shield, 
  Sparkles, Rocket, ArrowRight, Leaf
} from "lucide-react";
import api from "../services/api";

const LeadCaptureModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    acceptPrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom est requis";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }
    
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = "Vous devez accepter la politique de confidentialité";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Save lead to backend
      await api.post("/leads", {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        source: "lead_capture_modal",
        accepted_privacy: formData.acceptPrivacy,
        created_at: new Date().toISOString()
      });
      
      // Store in localStorage to not show again
      localStorage.setItem("agricam_lead_captured", "true");
      localStorage.setItem("agricam_lead_email", formData.email);
      
      toast.success("Bienvenue sur AGRICAM IA !");
      onSuccess && onSuccess(formData);
      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      // Still allow access even if API fails
      localStorage.setItem("agricam_lead_captured", "true");
      onSuccess && onSuccess(formData);
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Leaf className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AGRICAM IA</h2>
              <p className="text-emerald-100">Agriculture Intelligente</p>
            </div>
          </div>
          <p className="text-emerald-50">
            Accédez à la plateforme d'agriculture de précision la plus avancée d'Afrique
          </p>
        </div>
        
        <div className="p-6">
          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <Sparkles className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-medium">Essai gratuit<br/>14 jours</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Rocket className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-medium">Toutes les<br/>fonctionnalités</p>
            </div>
            <div className="text-center p-3 bg-violet-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto text-violet-600 mb-2" />
              <p className="text-xs font-medium">Support<br/>personnalisé</p>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Votre nom complet"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="votre@email.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+237 6XX XXX XXX"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="acceptPrivacy"
                checked={formData.acceptPrivacy}
                onCheckedChange={(checked) => setFormData({...formData, acceptPrivacy: checked})}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="acceptPrivacy"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  J'accepte la{" "}
                  <a href="/privacy-policy" className="text-emerald-600 underline" target="_blank">
                    politique de confidentialité
                  </a>
                </label>
                <p className="text-xs text-slate-500">
                  Vos données sont protégées conformément au RGPD
                </p>
              </div>
            </div>
            {errors.acceptPrivacy && (
              <p className="text-xs text-red-500">{errors.acceptPrivacy}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                "Chargement..."
              ) : (
                <>
                  Accéder gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-xs text-center text-slate-500 mt-4">
            En continuant, vous acceptez de recevoir des communications de AGRICAM IA.
            Vous pouvez vous désabonner à tout moment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
