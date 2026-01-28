import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  Banknote, TrendingUp, Clock, CheckCircle, XCircle,
  Plus, FileText, User, Calendar
} from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const Financial = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    amount: "",
    purpose: "",
    duration_months: "12",
    institution_id: "financial-001"
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get("/financial/loans");
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoan = async () => {
    try {
      await api.post("/financial/loans", null, {
        params: {
          amount: parseFloat(newLoan.amount),
          purpose: newLoan.purpose,
          duration_months: parseInt(newLoan.duration_months),
          institution_id: newLoan.institution_id
        }
      });
      toast.success("Demande de prêt envoyée !");
      setDialogOpen(false);
      setNewLoan({ amount: "", purpose: "", duration_months: "12", institution_id: "financial-001" });
      fetchLoans();
    } catch (error) {
      toast.error("Erreur lors de la demande");
    }
  };

  const handleDecision = async (loanId, approved) => {
    try {
      await api.put(`/financial/loans/${loanId}/decision`, null, {
        params: { approved, notes: approved ? "Demande approuvée" : "Demande rejetée" }
      });
      toast.success(`Prêt ${approved ? 'approuvé' : 'rejeté'}`);
      fetchLoans();
    } catch (error) {
      toast.error("Erreur lors de la décision");
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: "En attente", color: "bg-amber-100 text-amber-700" },
      approved: { label: "Approuvé", color: "bg-emerald-100 text-emerald-700" },
      rejected: { label: "Rejeté", color: "bg-red-100 text-red-700" },
      disbursed: { label: "Décaissé", color: "bg-blue-100 text-blue-700" },
    };
    const c = config[status] || { label: status, color: "bg-slate-100 text-slate-700" };
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const pendingLoans = loans.filter(l => l.status === "pending");
  const approvedLoans = loans.filter(l => l.status === "approved" || l.status === "disbursed");
  const totalAmount = approvedLoans.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="financial-page">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Banknote className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">
            {user?.role === "financial" ? "Gestion des Prêts" : "Mes Finances"}
          </h1>
        </div>
        <p className="text-white/80">
          {user?.role === "financial" 
            ? "Gérez les demandes de crédit des agriculteurs"
            : "Demandes de prêts et subventions agricoles"
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{pendingLoans.length}</p>
                <p className="text-sm text-slate-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{approvedLoans.length}</p>
                <p className="text-sm text-slate-500">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{totalAmount.toLocaleString()} XAF</p>
                <p className="text-sm text-slate-500">Total financé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Loan Button (for farmers) */}
      {user?.role === "farmer" && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700" data-testid="request-loan-btn">
              <Plus className="h-4 w-4 mr-2" />
              Demander un prêt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle demande de prêt</DialogTitle>
              <DialogDescription>
                Remplissez le formulaire pour soumettre votre demande de crédit agricole.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Montant (XAF)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 500000"
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                  data-testid="loan-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Objet du prêt</Label>
                <Input
                  placeholder="Ex: Achat d'engrais et semences"
                  value={newLoan.purpose}
                  onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                  data-testid="loan-purpose"
                />
              </div>
              <div className="space-y-2">
                <Label>Durée (mois)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={newLoan.duration_months}
                  onChange={(e) => setNewLoan({ ...newLoan, duration_months: e.target.value })}
                  data-testid="loan-duration"
                />
              </div>
              <Button 
                onClick={handleRequestLoan} 
                className="w-full bg-violet-600 hover:bg-violet-700"
                data-testid="submit-loan"
              >
                Soumettre la demande
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Loans List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            {user?.role === "financial" ? "Demandes de prêt" : "Mes demandes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Banknote className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune demande de prêt</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all"
                  data-testid={`loan-${loan.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-slate-900">
                          {loan.amount.toLocaleString()} XAF
                        </h4>
                        {getStatusBadge(loan.status)}
                      </div>
                      
                      <p className="text-slate-600 mb-2">{loan.purpose}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {user?.role === "financial" && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{loan.farmer_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{loan.duration_months} mois</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(loan.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions for financial institution */}
                    {user?.role === "financial" && loan.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleDecision(loan.id, true)}
                          data-testid={`approve-${loan.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDecision(loan.id, false)}
                          data-testid={`reject-${loan.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financial;
