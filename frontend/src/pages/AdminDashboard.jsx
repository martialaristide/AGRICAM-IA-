import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ActionTooltip } from "../components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { 
  Shield, Users, Tractor, Building, Banknote, 
  CheckCircle, XCircle, Trash2, Eye, TrendingUp
} from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success("Utilisateur vérifié");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("Utilisateur supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpgradeSubscription = async (userId, type) => {
    try {
      await api.put(`/admin/users/${userId}/subscription?subscription_type=${type}`);
      toast.success("Abonnement mis à jour");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { label: "Admin", color: "bg-red-500" },
      farmer: { label: "Agriculteur", color: "bg-emerald-500" },
      supplier: { label: "Fournisseur", color: "bg-blue-500" },
      financial: { label: "Banque", color: "bg-violet-500" },
      partner: { label: "Partenaire", color: "bg-amber-500" },
      investor: { label: "Investisseur", color: "bg-cyan-500" },
    };
    const c = config[role] || { label: role, color: "bg-slate-500" };
    return <Badge className={`${c.color} text-white`}>{c.label}</Badge>;
  };

  const getSubscriptionBadge = (type) => {
    const config = {
      freemium: { label: "Freemium", color: "bg-slate-100 text-slate-700" },
      basic: { label: "Basic", color: "bg-blue-100 text-blue-700" },
      premium: { label: "Premium", color: "bg-amber-100 text-amber-700" },
    };
    const c = config[type] || { label: type, color: "bg-slate-100 text-slate-700" };
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold font-[Manrope]">Administration</h1>
        </div>
        <p className="text-white/80">Gestion complète de la plateforme AGRICAM IA</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_users || 0}</p>
                <p className="text-sm text-slate-500">Utilisateurs total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Tractor className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_farmers || 0}</p>
                <p className="text-sm text-slate-500">Agriculteurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{stats?.total_suppliers || 0}</p>
                <p className="text-sm text-slate-500">Fournisseurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{(stats?.revenue_month || 0).toLocaleString()} XAF</p>
                <p className="text-sm text-slate-500">Revenus du mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats?.pending_verifications || 0}</p>
              <p className="text-sm text-slate-500">En attente de vérification</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats?.active_subscriptions || 0}</p>
              <p className="text-sm text-slate-500">Abonnements actifs</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats?.transactions_month || 0}</p>
              <p className="text-sm text-slate-500">Transactions ce mois</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Banknote className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gestion des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Vérifié</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getSubscriptionBadge(user.subscription_type)}</TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!user.is_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(user.id)}
                          data-testid={`verify-${user.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Vérifier
                        </Button>
                      )}
                      {user.subscription_type === "freemium" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpgradeSubscription(user.id, "basic")}
                        >
                          Upgrade
                        </Button>
                      )}
                      {user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(user.id)}
                          data-testid={`delete-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
