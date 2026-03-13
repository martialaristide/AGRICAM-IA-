import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      const { access_token, user } = response.data;
      login(user, access_token);
      toast.success(`Bienvenue ${user.full_name} !`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
      toast.success(`Bienvenue ${user.full_name} !`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      toast.error("Erreur de connexion demo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      <div className="relative w-full max-w-md z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-6 transition-colors" data-testid="back-to-home">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </Link>

        <Card className="bg-[#0b1120]/80 backdrop-blur-xl border-emerald-900/30 shadow-[0_0_40px_rgba(16,185,129,0.06)]" data-testid="login-card">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-emerald-900/20 ring-1 ring-emerald-500/20">
                <img src={LOGO_URL} alt="African AI Solutions" className="h-14 w-auto" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold font-[Manrope] text-white">
              Connexion <span className="text-emerald-400">AGRICAM IA</span>
            </CardTitle>
            <CardDescription className="text-slate-500">
              Entrez vos identifiants pour acceder
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-400">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    id="email" type="email" placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-[#0f1729] border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required data-testid="login-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-400">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="........"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-[#0f1729] border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required data-testid="login-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                disabled={loading} data-testid="login-submit">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </div>
                ) : "Se connecter"}
              </Button>
            </form>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-sm text-slate-600 text-center mb-3">Comptes de demonstration</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Admin", email: "admin@agricam.ai", pw: "Admin@2026", id: "demo-admin" },
                  { label: "Agriculteur", email: "agriculteur@agricam.ai", pw: "Farmer@2026", id: "demo-farmer" },
                  { label: "Fournisseur", email: "fournisseur@agricam.ai", pw: "Supplier@2026", id: "demo-supplier" },
                  { label: "Banque", email: "banque@agricam.ai", pw: "Bank@2026", id: "demo-financial" },
                  { label: "Analyste", email: "analyste@agricam.ai", pw: "Analyst@2026", id: "demo-analyst" },
                  { label: "Agronome", email: "agronome@agricam.ai", pw: "Agro@2026", id: "demo-agronomist" },
                ].map((d) => (
                  <Button key={d.id} variant="outline" size="sm"
                    onClick={() => demoLogin(d.email, d.pw)} disabled={loading}
                    className="border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-900/10"
                    data-testid={d.id}>
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">S'inscrire</Link>
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

export default Login;
