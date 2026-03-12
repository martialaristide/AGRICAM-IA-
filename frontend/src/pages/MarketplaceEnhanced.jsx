import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { 
  ShoppingCart, Search, Filter, MapPin, Calendar, 
  Award, MessageCircle, Plus, Truck, Star,
  Leaf, Tag, Scale, Tractor, FlaskConical, Sprout,
  Package, DollarSign, Phone, User, Image
} from "lucide-react";
import { cn } from "../lib/utils";

const categories = [
  { id: "all", name: "Tout", icon: Package },
  { id: "seeds", name: "Semences", icon: Sprout },
  { id: "fertilizers", name: "Engrais", icon: FlaskConical },
  { id: "equipment", name: "Matériel", icon: Tractor },
  { id: "phyto", name: "Produits Phyto", icon: Leaf },
  { id: "harvest", name: "Récoltes", icon: Scale }
];

const initialProducts = [
  {
    id: "prod_1",
    name: "Semences de Maïs Hybride",
    category: "seeds",
    price: 15000,
    unit: "sac de 25kg",
    seller: "AgroSeed Cameroun",
    location: "Douala",
    rating: 4.8,
    reviews: 124,
    stock: 500,
    description: "Semences de maïs hybride haute performance, résistant à la sécheresse.",
    image: "https://images.unsplash.com/photo-1601593768799-bd82fa780f2d?w=400"
  },
  {
    id: "prod_2",
    name: "NPK 20-10-10",
    category: "fertilizers",
    price: 25000,
    unit: "sac de 50kg",
    seller: "FertiPlus SARL",
    location: "Yaoundé",
    rating: 4.5,
    reviews: 89,
    stock: 1200,
    description: "Engrais complet NPK pour cultures vivrières et maraîchères.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400"
  },
  {
    id: "prod_3",
    name: "Pulvérisateur Dorsal 20L",
    category: "equipment",
    price: 45000,
    unit: "unité",
    seller: "AgriTools Pro",
    location: "Bafoussam",
    rating: 4.9,
    reviews: 56,
    stock: 30,
    description: "Pulvérisateur manuel à dos avec réservoir 20 litres.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400"
  },
  {
    id: "prod_4",
    name: "Fongicide Cuivre",
    category: "phyto",
    price: 12000,
    unit: "bidon 1L",
    seller: "PhytoProtect",
    location: "Douala",
    rating: 4.6,
    reviews: 203,
    stock: 800,
    description: "Fongicide à base de cuivre pour lutter contre le mildiou.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400"
  },
  {
    id: "prod_5",
    name: "Tomates Fraîches Bio",
    category: "harvest",
    price: 2500,
    unit: "cagette 15kg",
    seller: "Ferme Bio Fouda",
    location: "Yaoundé",
    rating: 4.7,
    reviews: 45,
    stock: 200,
    description: "Tomates cultivées biologiquement, récoltées du jour.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
  },
  {
    id: "prod_6",
    name: "Tracteur Compact 25CV",
    category: "equipment",
    price: 8500000,
    unit: "unité",
    seller: "MachinAgri",
    location: "Douala",
    rating: 4.9,
    reviews: 12,
    stock: 3,
    description: "Tracteur compact idéal pour petites et moyennes exploitations.",
    image: "https://images.unsplash.com/photo-1605338198618-8555cf5bf209?w=400"
  },
  {
    id: "prod_7",
    name: "Semences Haricot Vert",
    category: "seeds",
    price: 8000,
    unit: "sachet 500g",
    seller: "SemencesPro",
    location: "Bamenda",
    rating: 4.4,
    reviews: 67,
    stock: 350,
    description: "Variété précoce, bonne résistance aux maladies.",
    image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=400"
  },
  {
    id: "prod_8",
    name: "Urée 46%",
    category: "fertilizers",
    price: 22000,
    unit: "sac de 50kg",
    seller: "FertiPlus SARL",
    location: "Yaoundé",
    rating: 4.6,
    reviews: 156,
    stock: 2000,
    description: "Engrais azoté à libération rapide pour croissance végétative.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
  }
];

const MarketplaceEnhanced = () => {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "seeds",
    price: "",
    unit: "",
    description: "",
    stock: "",
    location: ""
  });

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const product = {
      id: `prod_${Date.now()}`,
      ...newProduct,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      seller: "Mon Entreprise",
      rating: 0,
      reviews: 0,
      image: newProduct.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      quality: newProduct.quality || "standard"
    };

    try {
      await api.post("/marketplace/products", product);
      setProducts([...products, product]);
      setShowAddProduct(false);
      setNewProduct({
        name: "",
        category: "seeds",
        price: "",
        unit: "",
        description: "",
        stock: "",
        location: ""
      });
      toast.success("Produit ajouté avec succès");
    } catch (error) {
      // Add locally anyway
      setProducts([...products, product]);
      setShowAddProduct(false);
      toast.success("Produit ajouté localement");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const CategoryIcon = ({ categoryId }) => {
    const cat = categories.find(c => c.id === categoryId);
    const Icon = cat?.icon || Package;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="marketplace-enhanced-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace AgriCam</h1>
          <p className="text-slate-600">Achetez et vendez des produits agricoles</p>
        </div>
        
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom du produit *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Ex: Semences de Maïs"
                />
              </div>
              <div>
                <Label>Catégorie *</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(v) => setNewProduct({...newProduct, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== "all").map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix (FCFA) *</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <Label>Unité</Label>
                  <Input
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    placeholder="sac de 25kg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock disponible</Label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Localisation</Label>
                  <Input
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                    placeholder="Yaoundé"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Décrivez votre produit..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Qualite</Label>
                  <Select value={newProduct.quality || "standard"} onValueChange={v => setNewProduct({...newProduct, quality: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="economique">Economique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Image du produit</Label>
                  <Input type="file" accept="image/*" className="text-xs" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setNewProduct(p => ({...p, image: ev.target.result}));
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-emerald-600">
                Publier le produit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des produits..."
            className="pl-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-2",
                selectedCategory === cat.id && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.name}
              {cat.id !== "all" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {products.filter(p => p.category === cat.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-slate-100 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400";
                }}
              />
              <Badge className="absolute top-2 left-2" variant="secondary">
                <CategoryIcon categoryId={product.category} />
                <span className="ml-1">{categories.find(c => c.id === product.category)?.name}</span>
              </Badge>
              {product.stock < 10 && (
                <Badge className="absolute top-2 right-2 bg-orange-500">
                  Stock limité
                </Badge>
              )}
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-xs text-slate-500">/ {product.unit}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.reviews})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                <span>{product.location}</span>
                <span>•</span>
                <User className="h-3 w-3" />
                <span className="truncate">{product.seller}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Acheter
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium">Aucun produit trouvé</h3>
          <p className="text-slate-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-slate-600">Produits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">
              {new Set(products.map(p => p.seller)).size}
            </div>
            <div className="text-sm text-slate-600">Vendeurs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">
              {new Set(products.map(p => p.location)).size}
            </div>
            <div className="text-sm text-slate-600">Villes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <div className="text-2xl font-bold">
              {(products.reduce((a, b) => a + b.rating, 0) / products.length).toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">Note moyenne</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketplaceEnhanced;
