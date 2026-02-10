import React, { useState } from "react";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  Building2, Users, Headphones
} from "lucide-react";
import IMAGES from "../../assets/images";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message envoyé avec succès ! Nous vous répondrons sous 24h.");
    e.target.reset();
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      lines: ["Douala, Cameroun", "Akwa, Rue de la Joie", "BP 12345"]
    },
    {
      icon: Phone,
      title: "Téléphone",
      lines: ["+237 6XX XXX XXX", "+237 6XX XXX XXX"]
    },
    {
      icon: Mail,
      title: "Email",
      lines: ["contact@agricam-ia.com", "support@agricam-ia.com"]
    },
    {
      icon: Clock,
      title: "Horaires",
      lines: ["Lun - Ven: 8h - 18h", "Sam: 9h - 13h"]
    }
  ];

  const offices = [
    { city: "Douala", country: "Cameroun", type: "Siège social" },
    { city: "Abidjan", country: "Côte d'Ivoire", type: "Bureau régional" },
    { city: "Dakar", country: "Sénégal", type: "Bureau régional" },
    { city: "Nairobi", country: "Kenya", type: "Bureau régional" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <WebsiteNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6">
              Contactez-nous
            </Badge>
            <h1 className="text-5xl font-bold mb-6 font-[Manrope]">
              Parlons de Votre Projet
            </h1>
            <p className="text-xl text-slate-300">
              Notre équipe est là pour répondre à toutes vos questions et vous accompagner
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-[Manrope]">
                Envoyez-nous un message
              </h2>
              <p className="text-slate-600 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" required placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" required placeholder="Dupont" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="jean@exemple.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" placeholder="+237 6XX XXX XXX" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise / Exploitation</Label>
                  <Input id="company" name="company" placeholder="Nom de votre exploitation" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <select 
                    id="subject" 
                    name="subject" 
                    required
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="demo">Demande de démonstration</option>
                    <option value="pricing">Questions sur les tarifs</option>
                    <option value="support">Support technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Décrivez votre projet ou votre question..."
                    className="w-full p-3 border rounded-lg resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      Envoyer le message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-[Manrope]">
                Informations de contact
              </h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-6">
                    <info.icon className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">{info.title}</h3>
                    {info.lines.map((line, i) => (
                      <p key={i} className="text-slate-600">{line}</p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4 mb-12">
                <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
                <a 
                  href="mailto:contact@agricam-ia.com"
                  className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Envoyer un email</p>
                    <p className="text-sm text-slate-500">contact@agricam-ia.com</p>
                  </div>
                </a>
                <a 
                  href="tel:+237600000000"
                  className="flex items-center gap-4 p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Appeler maintenant</p>
                    <p className="text-sm text-slate-500">+237 6XX XXX XXX</p>
                  </div>
                </a>
                <a 
                  href="#"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Chat en direct</p>
                    <p className="text-sm text-slate-500">Disponible Lun-Ven, 8h-18h</p>
                  </div>
                </a>
              </div>

              {/* Company image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src={IMAGES.africanFarmer}
                  alt="African AI Solutions"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-4">
                    <img src={IMAGES.logo} alt="Logo" className="h-12 w-auto" />
                    <div className="text-white">
                      <p className="font-bold">African AI Solutions</p>
                      <p className="text-sm text-white/80">L'IA au service de l'agriculture</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-700 mb-4">Nos Bureaux</Badge>
            <h2 className="text-3xl font-bold text-slate-900 font-[Manrope]">
              Présents à Travers l'Afrique
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all text-center">
                <Building2 className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">{office.city}</h3>
                <p className="text-slate-600 mb-2">{office.country}</p>
                <Badge variant="outline" className="text-xs">{office.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Headphones className="h-12 w-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d'aide immédiate ?
          </h2>
          <p className="text-emerald-100 mb-8">
            Notre équipe de support est disponible pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Phone className="mr-2 h-5 w-5" />
              +237 6XX XXX XXX
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat en direct
            </Button>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
};

export default ContactPage;
