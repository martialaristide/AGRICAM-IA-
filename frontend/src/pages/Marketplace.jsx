import React, { useEffect, useState, useRef } from "react";
import { getMarketplaceProducts, createProduct, getMyProducts, getConversations, sendChatMessageToUser, getChatWithUser, createContract, getContracts, getInputs, getServices, convertCurrency } from "../services/api";
import api from "../services/api";
import { useAuth } from "../App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  ShoppingCart, Search, Filter, MapPin, Calendar, 
  Award, MessageCircle, ChevronRight, Plus, Truck,
  Leaf, Tag, Scale, Send, Package, FileText, Users,
  CreditCard, CheckCircle, Clock, Loader2, Store,
  X, DollarSign
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "cereals", name: "Céréales", icon: Leaf },
  { id: "vegetables", name: "Légumes", icon: Leaf },
  { id: "fruits", name: "Fruits", icon: Leaf },
  { id: "fertilizers", name: "Engrais", icon: Package },
  { id: "seeds", name: "Semences", icon: Package },
  { id: "pesticides", name: "Pesticides", icon: Package },
  { id: "equipment", name: "Équipements", icon: Package },
  { id: "services", name: "Services", icon: Users }
];

const CURRENCIES = ["XAF", "EUR", "USD", "GBP"];

const Marketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState("XAF");
  const messagesEndRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "cereals",
    quantity: 1,
    unit: "tonnes",
    price_per_unit: 0,
    location: "",
    description: "",
    quality_grade: "A",
    certifications: [],
    is_bio: false,
    tonnage_available: null,
    logistics_available: false
  });

  const [contractData, setContractData] = useState({
    buyer_id: "",
    product_id: "",
    quantity: 1,
    total_price: 0,
    delivery_date: "",
    delivery_address: "",
    logistics_provider: "",
    payment_terms: "50% advance, 50% on delivery"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadChatMessages(selectedConversation.partner_id);
    }
  }, [selectedConversation]);

  const fetchData = async () => {
    try {
      const [productsRes, myProductsRes, conversationsRes, contractsRes] = await Promise.all([
        getMarketplaceProducts(),
        getMyProducts().catch(() => ({ data: [] })),
        getConversations().catch(() => ({ data: [] })),
        getContracts().catch(() => ({ data: [] }))
      ]);
      setProducts(productsRes.data);
      setMyProducts(myProductsRes.data);
      setConversations(conversationsRes.data);
      setContracts(contractsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (partnerId) => {
    try {
      const response = await getChatWithUser(partnerId);
      setChatMessages(response.data);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendChatMessageToUser(
        selectedConversation.partner_id,
        selectedProduct?.id,
        newMessage
      );
      setNewMessage("");
      loadChatMessages(selectedConversation.partner_id);
      toast.success("Message envoyé");
    } catch (error) {
      toast.error("Erreur d'envoi");
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.title || !newProduct.price_per_unit) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await createProduct({
        ...newProduct,
        tonnage_available: newProduct.tonnage_available || newProduct.quantity
      });
      toast.success("Produit créé avec succès!");
      setShowAddProduct(false);
      fetchData();
      setNewProduct({
        title: "",
        category: "cereals",
        quantity: 1,
        unit: "tonnes",
        price_per_unit: 0,
        location: "",
        description: "",
        quality_grade: "A",
        certifications: [],
        is_bio: false,
        tonnage_available: null,
        logistics_available: false
      });
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleCreateContract = async () => {
    if (!selectedProduct || !contractData.delivery_address) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await createContract({
        ...contractData,
        buyer_id: user?.id,
        product_id: selectedProduct.id,
        total_price: selectedProduct.price_per_unit * contractData.quantity
      });
      toast.success("Contrat créé! En attente de signature du vendeur.");
      setShowContractDialog(false);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la création du contrat");
    }
  };

  const handleContactSeller = (product) => {
    setSelectedProduct(product);
    setSelectedConversation({
      partner_id: product.seller_id,
      partner_name: product.seller_name
    });
    setShowChat(true);
  };

  const convertPrice = async (price, from = "XAF", to = displayCurrency) => {
    if (from === to) return price;
    try {
      const response = await convertCurrency(price, from, to);
      return response.data.converted_amount;
    } catch {
      return price;
    }
  };

  const formatPrice = (price, currency = "XAF") => {
    return new Intl.NumberFormat('fr-FR').format(price) + " " + currency;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "disponible":
        return <Badge className="bg-emerald-500 text-white">Disponible</Badge>;
      case "en_negociation":
        return <Badge className="bg-amber-500 text-white">En négociation</Badge>;
      case "vendu":
        return <Badge className="bg-slate-500 text-white">Vendu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="marketplace-page">
      {/* Header */}
      <div className="gradient-marketplace rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-8 w-8" />
              <h1 className="text-3xl font-bold font-[Manrope]">Marketplace Agricole</h1>
            </div>
            <p className="text-white/80">Achetez et vendez vos produits agricoles</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button className="bg-white text-emerald-700 hover:bg-white/90" data-testid="add-product-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Vendre un produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mettre un produit en vente</DialogTitle>
                  <DialogDescription>
                    Définissez les détails de votre produit, le tonnage disponible et le prix
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Titre du produit *</Label>
                    <Input
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                      placeholder="Ex: Maïs Bio Premium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Qualité</Label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={newProduct.quality_grade}
                      onChange={(e) => setNewProduct({...newProduct, quality_grade: e.target.value})}
                    >
                      <option value="A+">A+ (Premium)</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B">B (Bon)</option>
                      <option value="C">C (Standard)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité disponible *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: parseFloat(e.target.value)})}
                      />
                      <select
                        className="w-32 p-2 border rounded-lg"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      >
                        <option value="tonnes">Tonnes</option>
                        <option value="kg">Kg</option>
                        <option value="sacs">Sacs</option>
                        <option value="unites">Unités</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix par unité (XAF) *</Label>
                    <Input
                      type="number"
                      value={newProduct.price_per_unit}
                      onChange={(e) => setNewProduct({...newProduct, price_per_unit: parseFloat(e.target.value)})}
                      placeholder="250000"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Localisation *</Label>
                    <Input
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                      placeholder="Ex: Yaoundé, Cameroun"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Décrivez votre produit en détail..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-4 col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.is_bio}
                        onChange={(e) => setNewProduct({...newProduct, is_bio: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span>Produit Bio</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.logistics_available}
                        onChange={(e) => setNewProduct({...newProduct, logistics_available: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span>Logistique disponible</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Publier l'offre
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <select
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2"
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c} className="text-slate-900">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Tous
          </Button>
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="browse">Parcourir</TabsTrigger>
          <TabsTrigger value="my-products">Mes produits</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
          <TabsTrigger value="inputs">Intrants</TabsTrigger>
        </TabsList>

        {/* Browse Products */}
        <TabsContent value="browse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden card-hover" data-testid={`product-${product.id}`}>
                <div className="h-32 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(product.status)}
                  </div>
                  {product.is_bio && (
                    <Badge className="absolute top-4 right-4 bg-green-600">
                      <Leaf className="h-3 w-3 mr-1" />
                      Bio
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white">{product.title}</h3>
                    <p className="text-white/80 text-sm">{product.category}</p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Scale className="h-4 w-4 text-slate-400" />
                      <span>{product.quantity} {product.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>Qualité {product.quality_grade}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{product.location}</span>
                    </div>
                    {product.logistics_available && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <Truck className="h-4 w-4" />
                        <span>Livraison</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatPrice(product.price_per_unit)}
                      <span className="text-sm text-slate-500 font-normal">/{product.unit}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Vendeur: {product.seller_name}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => handleContactSeller(product)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProduct(product);
                      setContractData({
                        ...contractData,
                        quantity: 1,
                        total_price: product.price_per_unit
                      });
                      setShowContractDialog(true);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Commander
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Products */}
        <TabsContent value="my-products">
          {myProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <Store className="h-16 w-16 mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-medium">Aucun produit en vente</h3>
              <p className="text-slate-500 mt-2">Commencez à vendre vos produits agricoles</p>
              <Button className="mt-4" onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.title}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Quantité:</span>
                        <span>{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Prix:</span>
                        <span className="font-bold text-emerald-600">
                          {formatPrice(product.price_per_unit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Vues:</span>
                        <span>{product.views || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card className="h-[500px] flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Conversations</h3>
              </div>
              <ScrollArea className="h-[calc(500px-60px)]">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <MessageCircle className="h-12 w-12 mx-auto text-slate-300" />
                    <p className="mt-2">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conv, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-slate-50 border-b",
                        selectedConversation?.partner_id === conv.partner_id && "bg-slate-100"
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{conv.partner_name}</p>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-emerald-500">{conv.unread_count}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedConversation.partner_name}</h3>
                      {selectedProduct && (
                        <p className="text-sm text-slate-500">Re: {selectedProduct.title}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "max-w-[80%] p-3 rounded-xl",
                            msg.sender_id === user?.id
                              ? "ml-auto bg-emerald-500 text-white rounded-br-md"
                              : "bg-slate-100 rounded-bl-md"
                          )}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender_id === user?.id ? "text-emerald-100" : "text-slate-400"
                          )}>
                            {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-slate-300" />
                    <p className="mt-4">Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts">
          {contracts.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-medium">Aucun contrat</h3>
              <p className="text-slate-500 mt-2">Vos contrats apparaîtront ici</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {contracts.map(contract => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{contract.contract_number}</p>
                        <p className="text-sm text-slate-500">{contract.product_title}</p>
                      </div>
                      <Badge className={cn(
                        contract.status === "active" ? "bg-emerald-500" :
                        contract.status === "pending_buyer_signature" ? "bg-amber-500" :
                        "bg-slate-500"
                      )}>
                        {contract.status === "active" ? "Actif" :
                         contract.status === "pending_buyer_signature" ? "En attente de signature" :
                         contract.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-slate-500">Quantité</p>
                        <p className="font-medium">{contract.quantity} {contract.unit}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Montant total</p>
                        <p className="font-medium text-emerald-600">{formatPrice(contract.total_price)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Livraison</p>
                        <p className="font-medium">{contract.delivery_date}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Signatures</p>
                        <div className="flex gap-2">
                          {contract.seller_signature && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                          {contract.buyer_signature && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                          {!contract.buyer_signature && contract.buyer_id === user?.id && (
                            <Button size="sm" onClick={async () => {
                              try {
                                await api.put(`/marketplace/contracts/${contract.id}/sign`);
                                toast.success("Contrat signé!");
                                fetchData();
                              } catch {
                                toast.error("Erreur");
                              }
                            }}>
                              Signer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Inputs/Services */}
        <TabsContent value="inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Intrants Agricoles
                </CardTitle>
                <CardDescription>Engrais, semences, pesticides</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">Les intrants des fournisseurs apparaîtront ici</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Services Disponibles
                </CardTitle>
                <CardDescription>Logistique, conseil, formation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500">Les services disponibles apparaîtront ici</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Contract Creation Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un contrat d'achat</DialogTitle>
            <DialogDescription>
              {selectedProduct?.title} - {formatPrice(selectedProduct?.price_per_unit || 0)}/{selectedProduct?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantité souhaitée</Label>
              <Input
                type="number"
                value={contractData.quantity}
                onChange={(e) => setContractData({...contractData, quantity: parseFloat(e.target.value)})}
                max={selectedProduct?.quantity}
              />
              <p className="text-xs text-slate-500">
                Disponible: {selectedProduct?.quantity} {selectedProduct?.unit}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Date de livraison souhaitée</Label>
              <Input
                type="date"
                value={contractData.delivery_date}
                onChange={(e) => setContractData({...contractData, delivery_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse de livraison</Label>
              <Textarea
                value={contractData.delivery_address}
                onChange={(e) => setContractData({...contractData, delivery_address: e.target.value})}
                placeholder="Adresse complète..."
              />
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                <strong>Total estimé:</strong> {formatPrice((selectedProduct?.price_per_unit || 0) * contractData.quantity)}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowContractDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateContract}>
              <FileText className="h-4 w-4 mr-2" />
              Créer le contrat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Popup */}
      {showChat && selectedConversation && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border flex flex-col z-50">
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-xl">
            <div>
              <h3 className="font-semibold">{selectedConversation.partner_name}</h3>
              {selectedProduct && <p className="text-sm text-white/80">{selectedProduct.title}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "max-w-[80%] p-3 rounded-xl",
                    msg.sender_id === user?.id
                      ? "ml-auto bg-emerald-500 text-white rounded-br-md"
                      : "bg-slate-100 rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Votre message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
