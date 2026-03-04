import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Database, ChevronRight, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const DatabaseBrowser = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/database/collections");
      setCollections(res.data.collections || []);
    } catch { toast.error("Erreur de chargement"); }
    setLoading(false);
  };

  const browseCollection = async (name, newSkip = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/database/browse/${name}?skip=${newSkip}&limit=20`);
      setSelectedCollection(name);
      setDocuments(res.data.documents || []);
      setTotal(res.data.total || 0);
      setSkip(newSkip);
    } catch { toast.error("Erreur de chargement"); }
    setLoading(false);
  };

  if (loading && !selectedCollection) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="database-browser-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Database className="h-6 w-6 text-emerald-600" /> Base de Donnees</h1>
        <p className="text-slate-500 text-sm">Explorez les collections MongoDB - Admin uniquement</p>
      </div>

      {!selectedCollection ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {collections.map(c => (
            <Card key={c.name} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => browseCollection(c.name)} data-testid={`collection-${c.name}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.count} documents</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedCollection(null); setDocuments([]); }} data-testid="back-to-collections">
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <h2 className="font-semibold text-lg">{selectedCollection}</h2>
            <Badge variant="outline">{total} documents</Badge>
            <Button variant="ghost" size="sm" onClick={() => browseCollection(selectedCollection, skip)}><RefreshCw className="h-3.5 w-3.5" /></Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
          ) : (
            <>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="p-3">
                      <pre className="text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
                {documents.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Collection vide</p>}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => browseCollection(selectedCollection, Math.max(0, skip - 20))}>Precedent</Button>
                  <span className="text-sm text-slate-500">{skip + 1} - {Math.min(skip + 20, total)} sur {total}</span>
                  <Button variant="outline" size="sm" disabled={skip + 20 >= total} onClick={() => browseCollection(selectedCollection, skip + 20)}>Suivant</Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseBrowser;
