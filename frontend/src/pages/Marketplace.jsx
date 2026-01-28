import React, { useEffect, useState } from "react";
import { getMarketplaceProducts } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  ShoppingCart, Search, Filter, MapPin, Calendar, 
  Award, MessageCircle, ChevronRight, Plus, Truck,
  Leaf, Tag, Scale
} from "lucide-react";
import { cn } from "../lib/utils";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getMarketplaceProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="marketplace-page">
      {/* Tabs */}
      <Tabs defaultValue="vente" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="vente" className="flex items-center gap-2" data-testid="tab-vente">
            <Tag className="h-4 w-4" />
            Offres de vente
          </TabsTrigger>
          <TabsTrigger value="acheteurs" className="flex items-center gap-2" data-testid="tab-acheteurs">
            <ShoppingCart className="h-4 w-4" />
            Acheteurs
          </TabsTrigger>
          <TabsTrigger value="producteurs" className="flex items-center gap-2" data-testid="tab-producteurs">
            <Leaf className="h-4 w-4" />
            Producteurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vente" className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <Button variant="outline" data-testid="filters-btn">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden card-hover" data-testid={`product-${product.id}`}>
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.is_bio && (
                      <Badge className="bg-emerald-500 text-white">Bio</Badge>
                    )}
                    {product.is_premium && (
                      <Badge className="bg-violet-500 text-white">Premium</Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(product.status)}
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Title & Price */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-xl text-slate-900">{product.title}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">{product.price_per_unit}€</p>
                      <p className="text-xs text-slate-500">par {product.unit}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-slate-400" />
                      <span>{product.quantity} {product.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{product.available_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" />
                      <span>{product.certifications.length} certifications</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-50">
                        {cert}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid={`contact-${product.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                    <Button variant="outline" data-testid={`details-${product.id}`}>
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="acheteurs">
          <div className="text-center py-12 text-slate-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Section Acheteurs - Bientôt disponible</p>
          </div>
        </TabsContent>

        <TabsContent value="producteurs">
          <div className="text-center py-12 text-slate-500">
            <Leaf className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Section Producteurs - Bientôt disponible</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <div className="gradient-marketplace rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold font-[Manrope] mb-2">Plateforme de mise en relation</h3>
        <p className="text-white/80 mb-4">
          Facilitez vos transactions avec des outils de négociation intégrés et un système de paiement sécurisé
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white/20 text-white">
            <Award className="h-3 w-3 mr-1" />
            Paiement sécurisé
          </Badge>
          <Badge className="bg-white/20 text-white">Contrats intelligents</Badge>
          <Badge className="bg-white/20 text-white">
            <Truck className="h-3 w-3 mr-1" />
            Logistique intégrée
          </Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-100" data-testid="create-offer-btn">
            <Plus className="h-4 w-4 mr-2" />
            Créer une offre
          </Button>
          <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-slate-100" data-testid="logistics-btn">
            <Truck className="h-4 w-4 mr-2" />
            Logistique
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
