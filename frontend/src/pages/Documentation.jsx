import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FileText, Download, BookOpen, Shield, Wrench, Code2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import api from "../services/api";

const ICON_MAP = {
  "Rapport Developpement": Code2,
  "Guide Utilisateur": BookOpen,
  "Guide Administrateur": Shield,
  "Guide Maintenance": Wrench,
};

const COLOR_MAP = {
  "Rapport Developpement": "text-emerald-400 bg-emerald-900/30",
  "Guide Utilisateur": "text-blue-400 bg-blue-900/30",
  "Guide Administrateur": "text-amber-400 bg-amber-900/30",
  "Guide Maintenance": "text-purple-400 bg-purple-900/30",
};

const Documentation = () => {
  const { t } = useLanguage();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get("/docs/list");
      setDocs(res.data || []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filename) => {
    window.open(`${API_URL}/api/docs/download/${filename}`, "_blank");
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.post("/docs/generate");
      toast.success("Documents regeneres !");
      fetchDocs();
    } catch {
      toast.error("Erreur");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="documentation-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentation</h1>
          <p className="text-sm text-slate-400 mt-1">Telechargez les guides et rapports au format Word (.docx)</p>
        </div>
        <Button onClick={handleRegenerate} disabled={regenerating} className="bg-emerald-600 hover:bg-emerald-500 gap-2" data-testid="regenerate-docs-btn">
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Regenerer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc, i) => {
            const Icon = ICON_MAP[doc.label] || FileText;
            const colorCls = COLOR_MAP[doc.label] || "text-slate-400 bg-slate-900/30";
            return (
              <Card key={i} className="bg-[#111827] border-slate-800 hover:border-slate-700 transition-colors" data-testid={`doc-card-${i}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls.split(' ')[1]}`}>
                      <Icon className={`h-6 w-6 ${colorCls.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold">{doc.label}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-slate-800 text-slate-400 text-[10px]">.docx</Badge>
                        <span className="text-xs text-slate-500">{Math.round(doc.size / 1024)} KB</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleDownload(doc.filename)} className="bg-emerald-600 hover:bg-emerald-500 gap-1.5 flex-shrink-0" data-testid={`download-btn-${i}`}>
                      <Download className="h-3.5 w-3.5" /> Telecharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Documentation;
