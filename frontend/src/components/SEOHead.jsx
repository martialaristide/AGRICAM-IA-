import React from "react";
import { Helmet } from "react-helmet-async";

const SEOHead = ({ 
  title = "AGRICAM IA - Agriculture de Précision Intelligente",
  description = "Plateforme d'agriculture de précision utilisant l'IA pour optimiser les rendements agricoles en Afrique. Drones, robots, analyse de parcelles, AgriBot IA.",
  keywords = "agriculture, IA, drones, robots, Cameroun, Afrique, AgriBot, NDVI, analyse, parcelles",
  image = "https://agri-checkout.preview.emergentagent.com/og-image.png",
  url = "https://agri-checkout.preview.emergentagent.com",
  type = "website"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AGRICAM IA",
    "applicationCategory": "Agriculture Software",
    "operatingSystem": "Web, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "XAF"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "creator": {
      "@type": "Organization",
      "name": "African AI Solutions",
      "url": "https://www.linkedin.com/company/african-ai-solutions/",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Yaoundé",
        "addressRegion": "Centre",
        "addressCountry": "CM",
        "streetAddress": "Quartier Fouda, en face du Mansel Hotel"
      },
      "telephone": "+237652646824",
      "founders": [
        {
          "@type": "Person",
          "name": "Barra Martial Aristide",
          "jobTitle": "Co-Founder & CTO"
        },
        {
          "@type": "Person",
          "name": "Kenfack Claude Priscy Steffe",
          "jobTitle": "Co-Founder & CEO"
        }
      ]
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="African AI Solutions" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AGRICAM IA" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Geographic */}
      <meta name="geo.region" content="CM" />
      <meta name="geo.placename" content="Yaoundé" />
      <meta name="geo.position" content="3.848;11.5021" />
      <meta name="ICBM" content="3.848, 11.5021" />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
