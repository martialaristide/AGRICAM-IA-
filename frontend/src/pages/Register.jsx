import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { User, Mail, Lock, Phone, Building, ArrowLeft, Eye, EyeOff, Tractor } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const LOGO_URL = "/branding/agricam-logo.png";

const roles = [
  { value: "farmer", label: "Agriculteur", icon: Tractor },
  { value: "supplier", label: "Fournisseur d'intrants", icon: Building },
  { value: "financial", label: "Institution financiere", icon: Building },
  { value: "seed_analyst", label: "Analyste des semences", icon: User },
  { value: "agronomist", label: "Ingenieur agronome", icon: User },
  { value: "partner", label: "Partenaire", icon: User },
  { value: "investor", label: "Investisseur", icon: User },
];

const cultureTypes = [
  "Blé", "Maïs", "Riz", "Tournesol", "Coton", "Cacao", "Café", 
  "Palmier à huile", "Hévéa", "Banane", "Ananas", "Manioc", "Autre"
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    role: "",
    company_name: "",
    culture_type: "",
    address: ""
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères");
        return;
      }
    }
    if (step === 2) {
      if (!formData.full_name || !formData.role) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        company_name: formData.company_name,
        culture_type: formData.culture_type,
        address: formData.address
      });
      
      const { access_token, user } = response.data;
      login(user, access_token);
      toast.success("Compte créé avec succès !");
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.detail || "Erreur lors de l'inscription";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a13] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Link>

        <Card className="bg-[#0b1120]/80 backdrop-blur-xl border-emerald-900/30 shadow-[0_0_40px_rgba(16,185,129,0.06)]">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-emerald-900/20 ring-1 ring-emerald-500/20">
                <img src={LOGO_URL} alt="African AI Solutions" className="h-14 w-auto" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-[Manrope] text-white">
              Creer un compte <span className="text-emerald-400">AGRICAM IA</span>
            </CardTitle>
            <CardDescription className="text-slate-500">
              Etape {step} sur 3
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Email & Password */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="register-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        data-testid="register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="register-confirm-password"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-10"
                        required
                        data-testid="register-fullname"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+237 6 XX XX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        data-testid="register-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Type de compte *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger data-testid="register-role">
                        <SelectValue placeholder="Sélectionnez votre profil" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Step 3: Additional Info */}
              {step === 3 && (
                <>
                  {formData.role === "farmer" && (
                    <div className="space-y-2">
                      <Label htmlFor="culture_type">Type de culture principale</Label>
                      <Select
                        value={formData.culture_type}
                        onValueChange={(value) => setFormData({ ...formData, culture_type: value })}
                      >
                        <SelectTrigger data-testid="register-culture">
                          <SelectValue placeholder="Sélectionnez votre culture" />
                        </SelectTrigger>
                        <SelectContent>
                          {cultureTypes.map((culture) => (
                            <SelectItem key={culture} value={culture}>
                              {culture}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(formData.role === "supplier" || formData.role === "financial") && (
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'entreprise</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="company_name"
                          type="text"
                          placeholder="Nom de votre entreprise"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="pl-10"
                          data-testid="register-company"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse / Localisation</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Ville, Région, Pays"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      data-testid="register-address"
                    />
                  </div>

                  <div className="p-4 bg-emerald-900/15 rounded-xl border border-emerald-800/30">
                    <p className="text-sm text-emerald-400/80">
                      En creant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialite.
                      Votre compte sera en mode <strong>Freemium</strong> par defaut.
                    </p>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30"
                  >
                    Precedent
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    data-testid="register-next"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    disabled={loading}
                    data-testid="register-submit"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Création...
                      </div>
                    ) : (
                      "Créer mon compte"
                    )}
                  </Button>
                )}
              </div>
            </form>

            <p className="text-center text-sm text-slate-500">
              Deja un compte ?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          Developpe par <span className="font-semibold text-emerald-400">Barra Martial Aristide</span>
          <br /><span className="text-slate-700">African AI Solutions</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
