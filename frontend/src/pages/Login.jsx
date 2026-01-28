import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Leaf, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { access_token, user } = response.data;
      
      login(user, access_token);
      toast.success(`Bienvenue ${user.full_name} !`);
      
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const message = error.response?.data?.detail || "Erreur de connexion";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Demo login helpers
  const demoLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
      toast.success(`Bienvenue ${user.full_name} !`);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error("Erreur de connexion démo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'accueil</span>
        </Link>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={LOGO_URL} alt="African AI Solutions" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold font-[Manrope]">
              Connexion à <span className="text-emerald-600">AGRICAM IA</span>
            </CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
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
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
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
                    data-testid="login-password"
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

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
                data-testid="login-submit"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="border-t pt-4">
              <p className="text-sm text-slate-500 text-center mb-3">Comptes de démonstration</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin("admin@agricam-ia.com", "admin123")}
                  disabled={loading}
                  data-testid="demo-admin"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin("agriculteur@demo.com", "farmer123")}
                  disabled={loading}
                  data-testid="demo-farmer"
                >
                  Agriculteur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin("fournisseur@demo.com", "supplier123")}
                  disabled={loading}
                  data-testid="demo-supplier"
                >
                  Fournisseur
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin("banque@demo.com", "bank123")}
                  disabled={loading}
                  data-testid="demo-financial"
                >
                  Banque
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                S'inscrire
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Developer Credit */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Développé par <span className="font-semibold text-emerald-600">Barra Martial Aristide</span>
          <br />
          <span className="text-slate-400">African AI Solutions</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
