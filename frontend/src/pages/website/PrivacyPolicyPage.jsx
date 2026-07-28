import React from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import WebsiteFooter from "../../components/WebsiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { 
  Shield, Lock, Eye, Database, Clock, 
  UserCheck, Mail, Globe, FileText, AlertCircle
} from "lucide-react";

const PrivacyPolicyPage = () => {
  const lastUpdate = "10 Février 2026";

  const sections = [
    {
      id: "introduction",
      icon: Shield,
      title: "1. Introduction",
      content: `
        AGRICAM IA, développée par African AI Solutions, s'engage à protéger la confidentialité et la sécurité des données personnelles de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois camerounaises sur la protection des données.
        
        AGRICAM IA est une plateforme d'agriculture de précision qui utilise l'intelligence artificielle pour aider les agriculteurs africains à optimiser leurs rendements.
      `
    },
    {
      id: "responsable",
      icon: UserCheck,
      title: "2. Responsable du Traitement",
      content: `
        Le responsable du traitement des données est :
        
        **African AI Solutions**
        Adresse : Quartier Fouda, en face du Mansel Hotel
        Yaoundé, Cameroun
        Téléphone : +237 652 686 424
        Email : contact@agricam-ia.com
        LinkedIn : linkedin.com/company/african-ai-solutions
        
        Co-fondateurs :
        - Barra Martial Aristide (CO-FOUNDER & CTO)
        - Kenfack Claude Priscy Steffe (CO-FOUNDER & CEO)
      `
    },
    {
      id: "collecte",
      icon: Database,
      title: "3. Données Collectées",
      content: `
        Nous collectons les catégories de données suivantes :
        
        **Données d'identification :**
        - Nom complet
        - Adresse email
        - Numéro de téléphone
        - Photo de profil (optionnel)
        
        **Données agricoles :**
        - Localisation des parcelles (coordonnées GPS)
        - Types de cultures
        - Images satellites et drone de vos terres
        - Données des capteurs IoT
        - Historique des analyses
        
        **Données techniques :**
        - Adresse IP
        - Type de navigateur
        - Données de connexion
        - Cookies et traceurs
        
        **Données de paiement :**
        - Informations de facturation (traitées par nos partenaires de paiement sécurisés)
      `
    },
    {
      id: "finalites",
      icon: Eye,
      title: "4. Finalités du Traitement",
      content: `
        Vos données sont utilisées pour :
        
        **Fourniture de services :**
        - Analyser vos parcelles avec l'IA
        - Générer des recommandations personnalisées
        - Piloter vos drones et robots
        - Fournir des prévisions météorologiques
        
        **Amélioration des services :**
        - Améliorer nos algorithmes d'IA
        - Développer de nouvelles fonctionnalités
        - Assurer le support technique
        
        **Communication :**
        - Vous envoyer des alertes importantes
        - Vous informer des mises à jour
        - Marketing (avec votre consentement)
        
        **Conformité légale :**
        - Respecter nos obligations légales
        - Prévenir la fraude
      `
    },
    {
      id: "base-legale",
      icon: FileText,
      title: "5. Base Légale du Traitement",
      content: `
        Nous traitons vos données sur les bases légales suivantes :
        
        **Exécution du contrat :** Pour fournir les services auxquels vous avez souscrit.
        
        **Consentement :** Pour l'envoi de communications marketing et l'utilisation de cookies non essentiels.
        
        **Intérêt légitime :** Pour améliorer nos services et assurer la sécurité de la plateforme.
        
        **Obligation légale :** Pour respecter nos obligations fiscales et légales.
      `
    },
    {
      id: "partage",
      icon: Globe,
      title: "6. Partage des Données",
      content: `
        Vos données peuvent être partagées avec :
        
        **Prestataires de services :**
        - Hébergeurs cloud (serveurs sécurisés)
        - Services de paiement (Orange Money, MTN MoMo, PayPal)
        - Services d'analyse (anonymisés)
        
        **Nous ne vendons JAMAIS vos données personnelles à des tiers.**
        
        Tout transfert de données hors du Cameroun est effectué avec des garanties appropriées (clauses contractuelles types, etc.).
      `
    },
    {
      id: "conservation",
      icon: Clock,
      title: "7. Durée de Conservation",
      content: `
        Vos données sont conservées :
        
        - **Données de compte :** Pendant la durée de votre abonnement + 3 ans
        - **Données agricoles :** 5 ans pour permettre des analyses historiques
        - **Données de facturation :** 10 ans (obligation légale)
        - **Logs techniques :** 1 an
        - **Cookies :** Maximum 13 mois
        
        À l'expiration de ces délais, vos données sont supprimées ou anonymisées.
      `
    },
    {
      id: "droits",
      icon: UserCheck,
      title: "8. Vos Droits",
      content: `
        Conformément au RGPD, vous disposez des droits suivants :
        
        **Droit d'accès :** Obtenir une copie de vos données
        **Droit de rectification :** Corriger vos données inexactes
        **Droit à l'effacement :** Demander la suppression de vos données
        **Droit à la limitation :** Limiter le traitement de vos données
        **Droit à la portabilité :** Recevoir vos données dans un format lisible
        **Droit d'opposition :** Vous opposer au traitement pour marketing
        **Droit de retrait du consentement :** À tout moment
        
        Pour exercer ces droits, contactez-nous à : privacy@agricam-ia.com
        
        Vous pouvez également porter plainte auprès de l'autorité de protection des données compétente.
      `
    },
    {
      id: "securite",
      icon: Lock,
      title: "9. Sécurité des Données",
      content: `
        Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :
        
        **Mesures techniques :**
        - Chiffrement SSL/TLS pour toutes les communications
        - Chiffrement des données sensibles au repos
        - Authentification à deux facteurs disponible
        - Sauvegardes régulières
        - Pare-feu et protection DDoS
        
        **Mesures organisationnelles :**
        - Accès limité aux données (principe du moindre privilège)
        - Formation du personnel à la sécurité
        - Audits de sécurité réguliers
        - Plan de réponse aux incidents
      `
    },
    {
      id: "cookies",
      icon: Database,
      title: "10. Cookies et Traceurs",
      content: `
        Notre site utilise des cookies :
        
        **Cookies essentiels :** Nécessaires au fonctionnement du site
        - Authentification
        - Préférences de langue
        - Sécurité
        
        **Cookies analytiques :** Pour comprendre l'utilisation du site (avec consentement)
        
        **Cookies marketing :** Pour personnaliser les publicités (avec consentement)
        
        Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur ou via notre bannière de consentement.
      `
    },
    {
      id: "modifications",
      icon: AlertCircle,
      title: "11. Modifications",
      content: `
        Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, nous vous en informerons par email ou via une notification sur la plateforme.
        
        La version en vigueur est toujours disponible sur cette page avec sa date de dernière mise à jour.
      `
    },
    {
      id: "contact",
      icon: Mail,
      title: "12. Contact",
      content: `
        Pour toute question concernant cette politique ou vos données personnelles :
        
        **African AI Solutions**
        Quartier Fouda, en face du Mansel Hotel
        Yaoundé, Cameroun
        
        Email : privacy@agricam-ia.com
        Téléphone : +237 652 686 424
        
        Délégué à la Protection des Données (DPO) : dpo@agricam-ia.com
      `
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <WebsiteNavbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-emerald-500/20 text-emerald-300 mb-4">
              <Shield className="h-3 w-3 mr-1" />
              Conforme RGPD
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-slate-300 mb-4">
              Nous respectons votre vie privée et protégeons vos données personnelles
            </p>
            <p className="text-sm text-slate-400">
              Dernière mise à jour : {lastUpdate}
            </p>
          </div>
        </div>
      </section>
      
      {/* Table of Contents */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-bold mb-4">Sommaire</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section) => (
              <Card key={section.id} id={section.id} className="scroll-mt-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    {section.content.split('\n').map((paragraph, i) => {
                      if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                        return (
                          <h4 key={i} className="font-bold text-slate-900 mt-4 mb-2">
                            {paragraph.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      if (paragraph.trim().startsWith('- ')) {
                        return (
                          <li key={i} className="ml-4">
                            {paragraph.replace('- ', '')}
                          </li>
                        );
                      }
                      if (paragraph.trim()) {
                        return (
                          <p key={i} className="text-slate-600 mb-2">
                            {paragraph.split('**').map((part, j) => 
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Des questions sur vos données ?</h2>
          <p className="text-emerald-100 mb-6">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
          <a
            href="mailto:privacy@agricam-ia.com"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            <Mail className="h-5 w-5" />
            privacy@agricam-ia.com
          </a>
        </div>
      </section>
      
      <WebsiteFooter />
    </div>
  );
};

export default PrivacyPolicyPage;
