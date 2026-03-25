// AGRICAM IA - Système de traduction multi-langue
// Langues supportées: FR, EN, ES, DE, AR, ZH

export const translations = {
  fr: {
    // Navigation
    nav: {
      home: "Accueil",
      solutions: "Solutions",
      pricing: "Tarifs",
      about: "A propos",
      contact: "Contact",
      login: "Se connecter",
      register: "S'inscrire",
      logout: "Deconnexion",
      dashboard: "Tableau de bord",
      admin: "Administration",
      parcels: "Parcelles",
      sensors: "Capteurs IoT",
      drones: "Gestion Drones",
      robots: "Controle Robots",
      satellites: "Images Satellites",
      agribot: "AGRI GENIUS",
      advancedAnalysis: "Analyse Avancee",
      camera: "Camera IA",
      irrigation: "Irrigation Auto",
      recommendations: "Recommandations IA",
      marketplace: "Marketplace",
      alerts: "Alertes",
      settings: "Parametres",
      analytics: "Analytics",
      elearning: "Formation",
      financial: "Finances",
      accessControl: "Controle Acces",
      database: "Base de Donnees"
    },
    // Landing page
    landing: {
      heroTitle1: "L'Agriculture",
      heroTitle2: "Intelligente",
      heroTitle3: "pour l'Afrique",
      heroSubtitle: "Transformez votre exploitation avec l'IA, les drones autonomes et les robots connectes. Detectez les maladies, optimisez vos rendements et prenez des decisions eclairees.",
      ctaStart: "Demarrer gratuitement",
      ctaDemo: "Tester la demo",
      poweredBy: "Propulse par AGRI GENIUS AI",
      trustSecure: "Donnees securisees",
      trustUsers: "+5000 agriculteurs",
      trustAward: "Prix Innovation 2024",
      statsTitle: "Chiffres cles",
      featuresTitle: "Solutions",
      featuresSubtitle: "Technologies de pointe pour l'agriculture africaine",
    },
    // Common
    common: {
      loading: "Chargement...",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      add: "Ajouter",
      search: "Rechercher",
      filter: "Filtrer",
      export: "Exporter",
      import: "Importer",
      refresh: "Actualiser",
      close: "Fermer",
      confirm: "Confirmer",
      yes: "Oui",
      no: "Non",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      submit: "Soumettre",
      success: "Succès",
      error: "Erreur",
      warning: "Attention",
      info: "Information",
      expand: "Agrandir",
      collapse: "Reduire",
      precisionAg: "Agriculture de precision"
    },
    // Weather
    weather: {
      title: "Météo",
      temperature: "Température",
      humidity: "Humidité",
      wind: "Vent",
      pressure: "Pression",
      visibility: "Visibilité",
      sunrise: "Lever du soleil",
      sunset: "Coucher du soleil",
      forecast: "Prévisions",
      feelsLike: "Ressenti"
    },
    // Parcels
    parcels: {
      title: "Gestion des parcelles",
      newParcel: "Nouvelle parcelle",
      drawZone: "Dessiner une zone",
      analyzeZone: "Analyser la zone",
      area: "Surface",
      hectares: "hectares",
      crop: "Culture",
      status: "État",
      lastAnalysis: "Dernière analyse"
    },
    // Analysis
    analysis: {
      title: "Analyse",
      ndvi: "Indice NDVI",
      stress: "Zones de stress",
      disease: "Détection maladies",
      humidity: "Humidité du sol",
      thermal: "Analyse thermique",
      cropHealth: "Santé des cultures",
      generateReport: "Générer rapport",
      overallScore: "Score global",
      recommendations: "Recommandations"
    },
    // Drones
    drones: {
      title: "Gestion des Drones",
      addDrone: "Ajouter un drone",
      piloting: "Pilotage",
      telemetry: "Télémétrie",
      altitude: "Altitude",
      speed: "Vitesse",
      battery: "Batterie",
      signal: "Signal WiFi",
      takeoff: "Décoller",
      land: "Atterrir",
      emergency: "URGENCE",
      photo: "Photo",
      video: "Vidéo",
      scan: "Scanner",
      infrared: "Infrarouge",
      lidar: "LIDAR",
      realView: "Vue réelle",
      mission: "Mission"
    },
    // Robots
    robots: {
      title: "Contrôle des Robots",
      addRobot: "Ajouter un robot",
      start: "Démarrer",
      pause: "Pause",
      stop: "Arrêter",
      weeding: "Désherbage",
      spraying: "Pulvérisation",
      patrol: "Patrouille",
      sampling: "Échantillonnage",
      manual: "Mode Manuel",
      autonomous: "Mode Autonome",
      view3d: "Vue 3D"
    },
    // Marketplace
    marketplace: {
      title: "Marketplace",
      addProduct: "Ajouter un produit",
      categories: {
        all: "Tout",
        seeds: "Semences",
        fertilizers: "Engrais",
        equipment: "Matériel",
        phyto: "Produits phyto",
        harvest: "Récoltes"
      },
      price: "Prix",
      quantity: "Quantité",
      seller: "Vendeur",
      contact: "Contacter"
    },
    // Auth
    auth: {
      login: "Connexion",
      register: "Inscription",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      fullName: "Nom complet",
      phone: "Téléphone",
      forgotPassword: "Mot de passe oublié?",
      noAccount: "Pas de compte?",
      hasAccount: "Déjà un compte?",
      privacyPolicy: "Politique de confidentialité",
      acceptTerms: "J'accepte les conditions d'utilisation",
      mustAcceptTerms: "Vous devez accepter les conditions",
      loginSubtitle: "Entrez vos identifiants pour acceder",
      demoAccounts: "Comptes de demonstration"
    },
    // Lead capture
    leadCapture: {
      title: "Accédez à AGRICAM IA",
      subtitle: "Entrez vos informations pour découvrir notre plateforme",
      cta: "Accéder gratuitement",
      benefits: [
        "Essai gratuit de 14 jours",
        "Accès à toutes les fonctionnalités",
        "Support personnalisé"
      ]
    },
    // Exit intent
    exitIntent: {
      title: "Attendez!",
      subtitle: "Ne manquez pas cette opportunité",
      offer: "Obtenez 20% de réduction sur votre premier abonnement",
      cta: "Obtenir mon offre",
      noThanks: "Non merci"
    },
    // Privacy
    privacy: {
      title: "Politique de confidentialité",
      lastUpdate: "Dernière mise à jour",
      sections: {
        intro: "Introduction",
        dataCollection: "Collecte des données",
        dataUse: "Utilisation des données",
        dataSharing: "Partage des données",
        dataRetention: "Conservation des données",
        rights: "Vos droits",
        cookies: "Cookies",
        contact: "Contact"
      }
    },
    // Pages
    pages: {
      dashboard: {
        title: "Tableau de bord",
        welcome: "Bienvenue sur AGRICAM IA",
        overview: "Vue d'ensemble",
        quickActions: "Actions rapides",
        recentActivity: "Activite recente",
        activeParcels: "Parcelles actives",
        avgHumidity: "Humidite moyenne",
        avgTemperature: "Temperature moyenne",
        activeAlerts: "Alertes actives",
        parcelStatus: "Etat des parcelles",
        recentAlerts: "Alertes recentes",
        systemOperational: "Systeme operationnel",
        activeSensors: "capteurs actifs"
      },
      irrigation: {
        title: "Irrigation Automatique",
        systems: "Systemes d'irrigation",
        planGenerator: "Generateur de plan",
        generatePlan: "Generer le plan IA",
        surface: "Surface (ha)",
        culture: "Culture",
        soilType: "Type de sol",
        waterSource: "Source d'eau",
        budget: "Budget",
        mode: "Mode",
        auto: "Automatique",
        manual: "Manuel",
        semiAuto: "Semi-automatique"
      },
      formation: {
        title: "Formation",
        createCourse: "Creer une formation",
        myCourses: "Mes formations",
        category: "Categorie",
        level: "Niveau",
        price: "Prix",
        duration: "Duree",
        students: "Etudiants",
        instructor: "Formateur",
        certificate: "Certificat",
        publish: "Publier"
      },
      accessControl: {
        title: "Controle d'Acces",
        grantAccess: "Accorder l'acces",
        revokeAccess: "Revoquer l'acces",
        extendAccess: "Prolonger l'acces",
        trialDays: "Jours d'essai",
        expired: "Expire",
        active: "Actif",
        onlineUsers: "Utilisateurs en ligne",
        campaigns: "Campagnes",
        crm: "CRM",
        revenue: "Revenus",
        transactions: "Transactions"
      },
      satellite: {
        title: "Images Satellites",
        scheduledCaptures: "Captures programmees",
        scheduleCapture: "Programmer une capture",
        resolution: "Resolution",
        source: "Source"
      },
      camera: {
        title: "Camera IA",
        startCamera: "Demarrer la camera",
        stopCamera: "Arreter la camera",
        analyze: "Analyser",
        export: "Exporter"
      },
      agribot: {
        title: "AGRI GENIUS",
        welcome: "Votre assistant agricole intelligent",
        placeholder: "Posez votre question...",
        analyzing: "Analyse en cours..."
      }
    },
    // Role dashboards
    roles: {
      admin: {
        title: "Administration Avancee",
        subtitle: "Tableau de bord predictif et prescriptif",
        platformHealth: "Sante de la Plateforme",
        securityAlerts: "Alertes de Securite",
        anomalyDetection: "Detection d'anomalies",
        serverLoad: "Charge serveur",
        apiSaturation: "Saturation API",
        activeUsers: "Utilisateurs actifs",
        totalUsers: "Utilisateurs total",
        monthlyRevenue: "Revenus mensuels",
        predictiveMaintenance: "Maintenance predictive",
        featureAdoption: "Adoption des fonctionnalites",
        abTesting: "Tests A/B",
        fraudDetection: "Detection de fraudes",
        suspiciousActivity: "Activite suspecte",
        systemMetrics: "Metriques systeme",
        uptime: "Temps de fonctionnement",
        responseTime: "Temps de reponse",
        errorRate: "Taux d'erreur",
        memoryUsage: "Utilisation memoire",
        scalingRecommendation: "Recommandation de mise a l'echelle",
        predictiveAnalytics: "Insights IA Predictifs"
      },
      farmer: {
        title: "Hub Agriculteur Intelligent",
        subtitle: "Sante des cultures et predictions",
        cropHealth: "Sante des Cultures",
        yieldPrediction: "Prediction de Rendement",
        pricePrediction: "Prediction des Prix",
        blockchainTrace: "Tracabilite Blockchain",
        smartMarketplace: "Marketplace Intelligente",
        earlyDetection: "Detection precoce",
        spectralAnalysis: "Analyse spectrale",
        treatmentMap: "Carte de traitement",
        estimatedYield: "Rendement estime",
        optimalPrice: "Prix optimal",
        profitThreshold: "Seuil de rentabilite",
        priceAlert: "Alerte de prix",
        traceability: "Tracabilite",
        qrCode: "QR Code produit",
        lifecycle: "Cycle de vie",
        groupPurchase: "Achat groupe",
        priceComparison: "Comparaison des prix",
        sowing: "Semis",
        irrigation: "Irrigation",
        fertilization: "Fertilisation",
        harvest: "Recolte",
        plantingCalendar: "Calendrier de plantation",
        rotation: "Rotation des cultures"
      },
      supplier: {
        title: "Tableau de Bord Fournisseur",
        subtitle: "Gestion intelligente des intrants",
        demandForecast: "Prevision de la Demande",
        logistics: "Optimisation Logistique",
        stockManagement: "Gestion des Stocks",
        crossSelling: "Cross-Selling IA",
        totalProducts: "Produits total",
        activeOrders: "Commandes actives",
        expiringStock: "Stock expirant",
        deliveryRoutes: "Tournees de livraison",
        routeOptimization: "Optimisation des tournees",
        gpsTracking: "Suivi GPS",
        flashPromo: "Promotion flash",
        customerSuggestion: "Suggestion client",
        expiryAlert: "Alerte peremption",
        salesTrend: "Tendance des ventes",
        topProducts: "Meilleurs produits",
        regionalDemand: "Demande regionale"
      },
      bank: {
        title: "Tableau de Bord Financier",
        subtitle: "Credit scoring et gestion des risques",
        agriScore: "AgriScore",
        loanSimulator: "Simulateur de Pret",
        riskManagement: "Gestion des Risques",
        parametricInsurance: "Assurance Parametrique",
        creditScore: "Score de credit",
        yieldHistory: "Historique rendements",
        sustainability: "Pratiques durables",
        salesRegularity: "Regularite des ventes",
        climateRisk: "Risque climatique",
        loanAmount: "Montant du pret",
        interestRate: "Taux d'interet",
        duration: "Duree",
        monthlyPayment: "Mensualite",
        totalCost: "Cout total",
        portfolioExposure: "Exposition du portefeuille",
        zoneRisk: "Zone a risque",
        droughtAlert: "Alerte secheresse",
        floodAlert: "Alerte inondation",
        autoDisburse: "Decaissement automatique",
        autoRepayment: "Remboursement automatique"
      },
      seedAnalyst: {
        title: "Analyse des Semences Avancee",
        subtitle: "Laboratoire virtuel et jumeaux numeriques",
        digitalTwin: "Jumeau Numerique",
        genomicModeling: "Modelisation Genomique",
        crossingSimulator: "Simulateur de Croisements",
        climateAdaptation: "Adaptation Climatique",
        germination: "Germination",
        purity: "Purete",
        moisture: "Humidite",
        certified: "Certifie",
        pending: "En attente",
        rejected: "Rejete",
        testing: "En test",
        batchId: "Lot",
        variety: "Variete",
        origin: "Origine",
        growthSimulation: "Simulation de croissance",
        scenarioCount: "scenarios climatiques",
        resilience: "Resilience",
        geneEditing: "Edition genetique",
        hybridVigor: "Vigueur hybride",
        traitPrediction: "Prediction de traits",
        diseaseResistance: "Resistance maladies",
        yieldPotential: "Potentiel de rendement",
        proteinContent: "Teneur en proteines",
        climateProjection: "Projection climatique",
        yearsProjection: "Projection sur 30-50 ans",
        ipTracking: "Propriete intellectuelle"
      },
      agronomist: {
        title: "Espace Agronome Expert",
        subtitle: "Copilote IA et modelisation avancee",
        aiCopilot: "Copilote IA Expert",
        epidemiology: "Modelisation Epidemiologique",
        carbonSimulator: "Simulateur Carbone",
        dynamicRecommendations: "Preconisations Dynamiques",
        fieldVisits: "Visites de terrain",
        farmerSupervised: "Agriculteurs suivis",
        monthlyVisits: "Visites ce mois",
        healthScore: "Score sante moyen",
        supervisedCrops: "Cultures supervisees",
        generateReport: "Generer rapport",
        diseasePropagation: "Propagation maladies",
        riskMap: "Carte de risque",
        earlyWarning: "Alerte precoce",
        carbonSequestration: "Sequestration carbone",
        biodiversity: "Biodiversite",
        soilHealth: "Sante du sol",
        carbonCredits: "Credits carbone",
        lowCarbonCertification: "Certification bas-carbone",
        frostAlert: "Alerte gel",
        rainAlert: "Forte pluie annoncee",
        treatmentDelay: "Report traitement",
        collaborativeNetwork: "Reseau collaboratif",
        peerValidation: "Validation par les pairs"
      }
    },
    // Subscription
    subscription: {
      required: "Abonnement requis",
      trialExpired: "Votre periode d'essai de 14 jours est terminee",
      subscribeNow: "S'abonner maintenant",
      fullAccess: "Acces complet a toutes les fonctionnalites",
      paymentSecure: "Paiement securise via MTN/Orange Mobile Money",
      daysRemaining: "jours restants",
      basicMonthly: "Basic Mensuel",
      premiumMonthly: "Premium Mensuel",
      freeTrial: "Essai gratuit",
      active: "Actif",
      expired: "Expire"
    },
    // Payment
    payment: {
      title: "Abonnement et Paiement",
      selectPackage: "Selectionnez un forfait",
      payNow: "Payer maintenant",
      processing: "Paiement en cours...",
      validatePhone: "Validez sur votre telephone",
      success: "Paiement Reussi !",
      failed: "Paiement Echoue",
      retry: "Reessayer",
      history: "Historique des paiements",
      operator: "Operateur",
      phoneNumber: "Numero de telephone",
      insufficientBalance: "Solde insuffisant",
      confirmed: "Confirme",
      amount: "Montant"
    }
  },
  
  en: {
    nav: {
      home: "Home",
      solutions: "Solutions",
      pricing: "Pricing",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
      logout: "Logout",
      dashboard: "Dashboard",
      admin: "Administration",
      parcels: "Parcels",
      sensors: "IoT Sensors",
      drones: "Drone Management",
      robots: "Robot Control",
      satellites: "Satellite Images",
      agribot: "AGRI GENIUS",
      advancedAnalysis: "Advanced Analysis",
      camera: "AI Camera",
      irrigation: "Auto Irrigation",
      recommendations: "AI Recommendations",
      marketplace: "Marketplace",
      alerts: "Alerts",
      settings: "Settings",
      analytics: "Analytics",
      elearning: "Training",
      financial: "Finances",
      accessControl: "Access Control",
      database: "Database"
    },
    landing: {
      heroTitle1: "Smart",
      heroTitle2: "Agriculture",
      heroTitle3: "for Africa",
      heroSubtitle: "Transform your farm with AI, autonomous drones and connected robots. Detect diseases, optimize yields and make informed decisions.",
      ctaStart: "Start for free",
      ctaDemo: "Try the demo",
      poweredBy: "Powered by AGRI GENIUS AI",
      trustSecure: "Secure data",
      trustUsers: "+5000 farmers",
      trustAward: "Innovation Award 2024",
      statsTitle: "Key figures",
      featuresTitle: "Solutions",
      featuresSubtitle: "Cutting-edge technologies for African agriculture",
    },
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information",
      expand: "Expand",
      collapse: "Collapse",
      precisionAg: "Precision Agriculture"
    },
    weather: {
      title: "Weather",
      temperature: "Temperature",
      humidity: "Humidity",
      wind: "Wind",
      pressure: "Pressure",
      visibility: "Visibility",
      sunrise: "Sunrise",
      sunset: "Sunset",
      forecast: "Forecast",
      feelsLike: "Feels like"
    },
    parcels: {
      title: "Parcel Management",
      newParcel: "New Parcel",
      drawZone: "Draw Zone",
      analyzeZone: "Analyze Zone",
      area: "Area",
      hectares: "hectares",
      crop: "Crop",
      status: "Status",
      lastAnalysis: "Last Analysis"
    },
    analysis: {
      title: "Analysis",
      ndvi: "NDVI Index",
      stress: "Stress Zones",
      disease: "Disease Detection",
      humidity: "Soil Moisture",
      thermal: "Thermal Analysis",
      cropHealth: "Crop Health",
      generateReport: "Generate Report",
      overallScore: "Overall Score",
      recommendations: "Recommendations"
    },
    drones: {
      title: "Drone Management",
      addDrone: "Add Drone",
      piloting: "Piloting",
      telemetry: "Telemetry",
      altitude: "Altitude",
      speed: "Speed",
      battery: "Battery",
      signal: "WiFi Signal",
      takeoff: "Take Off",
      land: "Land",
      emergency: "EMERGENCY",
      photo: "Photo",
      video: "Video",
      scan: "Scan",
      infrared: "Infrared",
      lidar: "LIDAR",
      realView: "Real View",
      mission: "Mission"
    },
    robots: {
      title: "Robot Control",
      addRobot: "Add Robot",
      start: "Start",
      pause: "Pause",
      stop: "Stop",
      weeding: "Weeding",
      spraying: "Spraying",
      patrol: "Patrol",
      sampling: "Sampling",
      manual: "Manual Mode",
      autonomous: "Autonomous Mode",
      view3d: "3D View"
    },
    marketplace: {
      title: "Marketplace",
      addProduct: "Add Product",
      categories: {
        all: "All",
        seeds: "Seeds",
        fertilizers: "Fertilizers",
        equipment: "Equipment",
        phyto: "Phyto Products",
        harvest: "Harvests"
      },
      price: "Price",
      quantity: "Quantity",
      seller: "Seller",
      contact: "Contact"
    },
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      phone: "Phone",
      forgotPassword: "Forgot Password?",
      noAccount: "No account?",
      hasAccount: "Already have an account?",
      privacyPolicy: "Privacy Policy",
      acceptTerms: "I accept the terms of use",
      mustAcceptTerms: "You must accept the terms",
      loginSubtitle: "Enter your credentials to access",
      demoAccounts: "Demo accounts"
    },
    leadCapture: {
      title: "Access AGRICAM IA",
      subtitle: "Enter your information to discover our platform",
      cta: "Access for free",
      benefits: [
        "14-day free trial",
        "Access to all features",
        "Personalized support"
      ]
    },
    exitIntent: {
      title: "Wait!",
      subtitle: "Don't miss this opportunity",
      offer: "Get 20% off your first subscription",
      cta: "Get my offer",
      noThanks: "No thanks"
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdate: "Last updated",
      sections: {
        intro: "Introduction",
        dataCollection: "Data Collection",
        dataUse: "Data Use",
        dataSharing: "Data Sharing",
        dataRetention: "Data Retention",
        rights: "Your Rights",
        cookies: "Cookies",
        contact: "Contact"
      }
    },
    pages: {
      dashboard: { title: "Dashboard", welcome: "Welcome to AGRICAM IA", overview: "Overview", quickActions: "Quick Actions", recentActivity: "Recent Activity", activeParcels: "Active Parcels", avgHumidity: "Average Humidity", avgTemperature: "Average Temperature", activeAlerts: "Active Alerts", parcelStatus: "Parcel Status", recentAlerts: "Recent Alerts", systemOperational: "System operational", activeSensors: "active sensors" },
      irrigation: { title: "Auto Irrigation", systems: "Irrigation Systems", planGenerator: "Plan Generator", generatePlan: "Generate AI Plan", surface: "Surface (ha)", culture: "Crop", soilType: "Soil Type", waterSource: "Water Source", budget: "Budget", mode: "Mode", auto: "Automatic", manual: "Manual", semiAuto: "Semi-automatic" },
      formation: { title: "Training", createCourse: "Create Course", myCourses: "My Courses", category: "Category", level: "Level", price: "Price", duration: "Duration", students: "Students", instructor: "Instructor", certificate: "Certificate", publish: "Publish" },
      accessControl: { title: "Access Control", grantAccess: "Grant Access", revokeAccess: "Revoke Access", extendAccess: "Extend Access", trialDays: "Trial Days", expired: "Expired", active: "Active", onlineUsers: "Online Users", campaigns: "Campaigns", crm: "CRM", revenue: "Revenue", transactions: "Transactions" },
      satellite: { title: "Satellite Images", scheduledCaptures: "Scheduled Captures", scheduleCapture: "Schedule Capture", resolution: "Resolution", source: "Source" },
      camera: { title: "AI Camera", startCamera: "Start Camera", stopCamera: "Stop Camera", analyze: "Analyze", export: "Export" },
      agribot: { title: "AGRI GENIUS", welcome: "Your intelligent agricultural assistant", placeholder: "Ask your question...", analyzing: "Analyzing..." }
    },
    roles: {
      admin: { title: "Advanced Administration", subtitle: "Predictive & prescriptive dashboard", platformHealth: "Platform Health", securityAlerts: "Security Alerts", anomalyDetection: "Anomaly Detection", serverLoad: "Server Load", apiSaturation: "API Saturation", activeUsers: "Active Users", totalUsers: "Total Users", monthlyRevenue: "Monthly Revenue", predictiveMaintenance: "Predictive Maintenance", featureAdoption: "Feature Adoption", abTesting: "A/B Testing", fraudDetection: "Fraud Detection", suspiciousActivity: "Suspicious Activity", systemMetrics: "System Metrics", uptime: "Uptime", responseTime: "Response Time", errorRate: "Error Rate", memoryUsage: "Memory Usage", scalingRecommendation: "Scaling Recommendation" },
      farmer: { title: "Smart Farmer Hub", subtitle: "Crop health & predictions", cropHealth: "Crop Health", yieldPrediction: "Yield Prediction", pricePrediction: "Price Prediction", blockchainTrace: "Blockchain Traceability", smartMarketplace: "Smart Marketplace", earlyDetection: "Early Detection", spectralAnalysis: "Spectral Analysis", treatmentMap: "Treatment Map", estimatedYield: "Estimated Yield", optimalPrice: "Optimal Price", profitThreshold: "Profit Threshold", priceAlert: "Price Alert", traceability: "Traceability", qrCode: "Product QR Code", lifecycle: "Lifecycle", groupPurchase: "Group Purchase", priceComparison: "Price Comparison", sowing: "Sowing", irrigation: "Irrigation", fertilization: "Fertilization", harvest: "Harvest", plantingCalendar: "Planting Calendar", rotation: "Crop Rotation" },
      supplier: { title: "Supplier Dashboard", subtitle: "Smart input management", demandForecast: "Demand Forecast", logistics: "Logistics Optimization", stockManagement: "Stock Management", crossSelling: "AI Cross-Selling", totalProducts: "Total Products", activeOrders: "Active Orders", expiringStock: "Expiring Stock", deliveryRoutes: "Delivery Routes", routeOptimization: "Route Optimization", gpsTracking: "GPS Tracking", flashPromo: "Flash Promotion", customerSuggestion: "Customer Suggestion", expiryAlert: "Expiry Alert", salesTrend: "Sales Trend", topProducts: "Top Products", regionalDemand: "Regional Demand" },
      bank: { title: "Financial Dashboard", subtitle: "Credit scoring & risk management", agriScore: "AgriScore", loanSimulator: "Loan Simulator", riskManagement: "Risk Management", parametricInsurance: "Parametric Insurance", creditScore: "Credit Score", yieldHistory: "Yield History", sustainability: "Sustainable Practices", salesRegularity: "Sales Regularity", climateRisk: "Climate Risk", loanAmount: "Loan Amount", interestRate: "Interest Rate", duration: "Duration", monthlyPayment: "Monthly Payment", totalCost: "Total Cost", portfolioExposure: "Portfolio Exposure", zoneRisk: "Zone Risk", droughtAlert: "Drought Alert", floodAlert: "Flood Alert", autoDisburse: "Auto Disburse", autoRepayment: "Auto Repayment" },
      seedAnalyst: { title: "Advanced Seed Analysis", subtitle: "Virtual lab & digital twins", digitalTwin: "Digital Twin", genomicModeling: "Genomic Modeling", crossingSimulator: "Crossing Simulator", climateAdaptation: "Climate Adaptation", germination: "Germination", purity: "Purity", moisture: "Moisture", certified: "Certified", pending: "Pending", rejected: "Rejected", testing: "Testing", batchId: "Batch", variety: "Variety", origin: "Origin", growthSimulation: "Growth Simulation", scenarioCount: "climate scenarios", resilience: "Resilience", geneEditing: "Gene Editing", hybridVigor: "Hybrid Vigor", traitPrediction: "Trait Prediction", diseaseResistance: "Disease Resistance", yieldPotential: "Yield Potential", proteinContent: "Protein Content", climateProjection: "Climate Projection", yearsProjection: "30-50 year projection", ipTracking: "Intellectual Property" },
      agronomist: { title: "Expert Agronomist Space", subtitle: "AI copilot & advanced modeling", aiCopilot: "AI Expert Copilot", epidemiology: "Epidemiological Modeling", carbonSimulator: "Carbon Simulator", dynamicRecommendations: "Dynamic Recommendations", fieldVisits: "Field Visits", farmerSupervised: "Supervised Farmers", monthlyVisits: "Monthly Visits", healthScore: "Average Health Score", supervisedCrops: "Supervised Crops", generateReport: "Generate Report", diseasePropagation: "Disease Propagation", riskMap: "Risk Map", earlyWarning: "Early Warning", carbonSequestration: "Carbon Sequestration", biodiversity: "Biodiversity", soilHealth: "Soil Health", carbonCredits: "Carbon Credits", lowCarbonCertification: "Low-carbon Certification", frostAlert: "Frost Alert", rainAlert: "Heavy rain expected", treatmentDelay: "Treatment Delay", collaborativeNetwork: "Collaborative Network", peerValidation: "Peer Validation" }
    },
    subscription: { required: "Subscription required", trialExpired: "Your 14-day trial has expired", subscribeNow: "Subscribe now", fullAccess: "Full access to all features", paymentSecure: "Secure payment via MTN/Orange Mobile Money", daysRemaining: "days remaining", basicMonthly: "Basic Monthly", premiumMonthly: "Premium Monthly", freeTrial: "Free Trial", active: "Active", expired: "Expired" },
    payment: { title: "Subscription & Payment", selectPackage: "Select a package", payNow: "Pay now", processing: "Processing payment...", validatePhone: "Validate on your phone", success: "Payment Successful!", failed: "Payment Failed", retry: "Retry", history: "Payment History", operator: "Operator", phoneNumber: "Phone number", insufficientBalance: "Insufficient balance", confirmed: "Confirmed", amount: "Amount" }
  },
  
  es: {
    nav: {
      home: "Inicio", solutions: "Soluciones", pricing: "Precios", about: "Acerca de",
      contact: "Contacto", login: "Iniciar sesion", register: "Registrarse", logout: "Cerrar sesion",
      dashboard: "Panel", admin: "Administracion", parcels: "Parcelas", sensors: "Sensores IoT",
      drones: "Gestion de Drones", robots: "Control de Robots", satellites: "Imagenes Satelitales",
      agribot: "AGRI GENIUS", advancedAnalysis: "Analisis Avanzado", camera: "Camara IA",
      irrigation: "Riego Automatico", recommendations: "Recomendaciones IA", marketplace: "Mercado",
      alerts: "Alertas", settings: "Configuracion", analytics: "Analiticas", elearning: "Formacion",
      financial: "Finanzas", accessControl: "Control de Acceso", database: "Base de Datos"
    },
    landing: {
      heroTitle1: "Agricultura", heroTitle2: "Inteligente", heroTitle3: "para Africa",
      heroSubtitle: "Transforme su explotacion con IA, drones autonomos y robots conectados. Detecte enfermedades, optimice rendimientos y tome decisiones informadas.",
      ctaStart: "Comenzar gratis", ctaDemo: "Probar la demo",
      poweredBy: "Impulsado por AGRI GENIUS AI", trustSecure: "Datos seguros",
      trustUsers: "+5000 agricultores", trustAward: "Premio Innovacion 2024",
      statsTitle: "Cifras clave", featuresTitle: "Soluciones",
      featuresSubtitle: "Tecnologias de vanguardia para la agricultura africana"
    },
    common: {
      loading: "Cargando...", save: "Guardar", cancel: "Cancelar", delete: "Eliminar",
      edit: "Editar", add: "Agregar", search: "Buscar", filter: "Filtrar", export: "Exportar",
      import: "Importar", refresh: "Actualizar", close: "Cerrar", confirm: "Confirmar",
      yes: "Si", no: "No", back: "Atras", next: "Siguiente", previous: "Anterior",
      submit: "Enviar", success: "Exito", error: "Error", warning: "Advertencia", info: "Informacion",
      expand: "Expandir", collapse: "Reducir", precisionAg: "Agricultura de Precision"
    },
    weather: {
      title: "Clima", temperature: "Temperatura", humidity: "Humedad", wind: "Viento",
      pressure: "Presion", visibility: "Visibilidad", sunrise: "Amanecer", sunset: "Atardecer",
      forecast: "Pronostico", feelsLike: "Sensacion termica"
    },
    parcels: {
      title: "Gestion de Parcelas", newParcel: "Nueva Parcela", drawZone: "Dibujar Zona",
      analyzeZone: "Analizar Zona", area: "Superficie", hectares: "hectareas", crop: "Cultivo",
      status: "Estado", lastAnalysis: "Ultimo Analisis"
    },
    analysis: {
      title: "Analisis", ndvi: "Indice NDVI", stress: "Zonas de Estres", disease: "Deteccion de Enfermedades",
      humidity: "Humedad del Suelo", thermal: "Analisis Termico", cropHealth: "Salud de Cultivos",
      generateReport: "Generar Informe", overallScore: "Puntuacion Global", recommendations: "Recomendaciones"
    },
    drones: {
      title: "Gestion de Drones", addDrone: "Agregar Dron", piloting: "Pilotaje",
      telemetry: "Telemetria", altitude: "Altitud", speed: "Velocidad", battery: "Bateria",
      signal: "Senal WiFi", takeoff: "Despegar", land: "Aterrizar", emergency: "EMERGENCIA",
      photo: "Foto", video: "Video", scan: "Escanear", infrared: "Infrarrojo",
      lidar: "LIDAR", realView: "Vista Real", mission: "Mision"
    },
    robots: {
      title: "Control de Robots", addRobot: "Agregar Robot", start: "Iniciar", pause: "Pausar",
      stop: "Detener", weeding: "Deshierbe", spraying: "Pulverizacion", patrol: "Patrulla",
      sampling: "Muestreo", manual: "Modo Manual", autonomous: "Modo Autonomo", view3d: "Vista 3D"
    },
    marketplace: {
      title: "Mercado", addProduct: "Agregar Producto",
      categories: { all: "Todo", seeds: "Semillas", fertilizers: "Fertilizantes", equipment: "Equipo", phyto: "Fitosanitarios", harvest: "Cosechas" },
      price: "Precio", quantity: "Cantidad", seller: "Vendedor", contact: "Contactar"
    },
    auth: {
      login: "Iniciar Sesion", register: "Registrarse", email: "Correo electronico",
      password: "Contrasena", confirmPassword: "Confirmar Contrasena", fullName: "Nombre Completo",
      phone: "Telefono", forgotPassword: "Olvido su contrasena?", noAccount: "No tiene cuenta?",
      hasAccount: "Ya tiene cuenta?", privacyPolicy: "Politica de Privacidad",
      acceptTerms: "Acepto los terminos de uso", mustAcceptTerms: "Debe aceptar los terminos",
      loginSubtitle: "Ingrese sus credenciales para acceder", demoAccounts: "Cuentas de demostracion"
    },
    leadCapture: { title: "Acceda a AGRICAM IA", subtitle: "Ingrese sus datos para descubrir nuestra plataforma", cta: "Acceder gratis", benefits: ["Prueba gratuita de 14 dias", "Acceso a todas las funciones", "Soporte personalizado"] },
    exitIntent: { title: "Espere!", subtitle: "No pierda esta oportunidad", offer: "Obtenga 20% de descuento en su primera suscripcion", cta: "Obtener mi oferta", noThanks: "No gracias" },
    privacy: { title: "Politica de Privacidad", lastUpdate: "Ultima actualizacion", sections: { intro: "Introduccion", dataCollection: "Recopilacion de datos", dataUse: "Uso de datos", dataSharing: "Compartir datos", dataRetention: "Retencion de datos", rights: "Sus derechos", cookies: "Cookies", contact: "Contacto" } },
    pages: {
      dashboard: { title: "Panel", welcome: "Bienvenido a AGRICAM IA", overview: "Vision general", quickActions: "Acciones rapidas", recentActivity: "Actividad reciente", activeParcels: "Parcelas activas", avgHumidity: "Humedad promedio", avgTemperature: "Temperatura promedio", activeAlerts: "Alertas activas", parcelStatus: "Estado de parcelas", recentAlerts: "Alertas recientes", systemOperational: "Sistema operativo", activeSensors: "sensores activos" },
      irrigation: { title: "Riego Automatico", systems: "Sistemas de riego", planGenerator: "Generador de planes", generatePlan: "Generar plan IA", surface: "Superficie (ha)", culture: "Cultivo", soilType: "Tipo de suelo", waterSource: "Fuente de agua", budget: "Presupuesto", mode: "Modo", auto: "Automatico", manual: "Manual", semiAuto: "Semi-automatico" },
      formation: { title: "Formacion", createCourse: "Crear curso", myCourses: "Mis cursos", category: "Categoria", level: "Nivel", price: "Precio", duration: "Duracion", students: "Estudiantes", instructor: "Instructor", certificate: "Certificado", publish: "Publicar" },
      accessControl: { title: "Control de Acceso", grantAccess: "Otorgar acceso", revokeAccess: "Revocar acceso", extendAccess: "Extender acceso", trialDays: "Dias de prueba", expired: "Expirado", active: "Activo", onlineUsers: "Usuarios en linea", campaigns: "Campanas", crm: "CRM", revenue: "Ingresos", transactions: "Transacciones" },
      satellite: { title: "Imagenes Satelitales", scheduledCaptures: "Capturas programadas", scheduleCapture: "Programar captura", resolution: "Resolucion", source: "Fuente" },
      camera: { title: "Camara IA", startCamera: "Iniciar camara", stopCamera: "Detener camara", analyze: "Analizar", export: "Exportar" },
      agribot: { title: "AGRI GENIUS", welcome: "Su asistente agricola inteligente", placeholder: "Haga su pregunta...", analyzing: "Analizando..." }
    },
    roles: {
      admin: { title: "Administracion Avanzada", subtitle: "Panel predictivo y prescriptivo", platformHealth: "Salud de la Plataforma", securityAlerts: "Alertas de Seguridad", anomalyDetection: "Deteccion de Anomalias", serverLoad: "Carga del Servidor", apiSaturation: "Saturacion API", activeUsers: "Usuarios Activos", totalUsers: "Total de Usuarios", monthlyRevenue: "Ingresos Mensuales", predictiveMaintenance: "Mantenimiento Predictivo", featureAdoption: "Adopcion de Funciones", abTesting: "Pruebas A/B", fraudDetection: "Deteccion de Fraude", suspiciousActivity: "Actividad Sospechosa", systemMetrics: "Metricas del Sistema", uptime: "Tiempo de Actividad", responseTime: "Tiempo de Respuesta", errorRate: "Tasa de Errores", memoryUsage: "Uso de Memoria", scalingRecommendation: "Recomendacion de Escalado" },
      farmer: { title: "Hub Agricola Inteligente", subtitle: "Salud de cultivos y predicciones", cropHealth: "Salud de Cultivos", yieldPrediction: "Prediccion de Rendimiento", pricePrediction: "Prediccion de Precios", blockchainTrace: "Trazabilidad Blockchain", smartMarketplace: "Mercado Inteligente", earlyDetection: "Deteccion Temprana", spectralAnalysis: "Analisis Espectral", treatmentMap: "Mapa de Tratamiento", estimatedYield: "Rendimiento Estimado", optimalPrice: "Precio Optimo", profitThreshold: "Umbral de Rentabilidad", priceAlert: "Alerta de Precio", traceability: "Trazabilidad", qrCode: "Codigo QR", lifecycle: "Ciclo de Vida", groupPurchase: "Compra Grupal", priceComparison: "Comparacion de Precios", sowing: "Siembra", irrigation: "Riego", fertilization: "Fertilizacion", harvest: "Cosecha", plantingCalendar: "Calendario de Siembra", rotation: "Rotacion de Cultivos" },
      supplier: { title: "Panel del Proveedor", subtitle: "Gestion inteligente de insumos", demandForecast: "Prevision de Demanda", logistics: "Optimizacion Logistica", stockManagement: "Gestion de Stock", crossSelling: "Venta Cruzada IA", totalProducts: "Total Productos", activeOrders: "Pedidos Activos", expiringStock: "Stock por Vencer", deliveryRoutes: "Rutas de Entrega", routeOptimization: "Optimizacion de Rutas", gpsTracking: "Seguimiento GPS", flashPromo: "Promocion Flash", customerSuggestion: "Sugerencia al Cliente", expiryAlert: "Alerta de Vencimiento", salesTrend: "Tendencia de Ventas", topProducts: "Mejores Productos", regionalDemand: "Demanda Regional" },
      bank: { title: "Panel Financiero", subtitle: "Scoring crediticio y gestion de riesgos", agriScore: "AgriScore", loanSimulator: "Simulador de Prestamos", riskManagement: "Gestion de Riesgos", parametricInsurance: "Seguro Parametrico", creditScore: "Puntuacion Crediticia", yieldHistory: "Historial de Rendimientos", sustainability: "Practicas Sostenibles", salesRegularity: "Regularidad de Ventas", climateRisk: "Riesgo Climatico", loanAmount: "Monto del Prestamo", interestRate: "Tasa de Interes", duration: "Duracion", monthlyPayment: "Cuota Mensual", totalCost: "Costo Total", portfolioExposure: "Exposicion del Portafolio", zoneRisk: "Zona de Riesgo", droughtAlert: "Alerta de Sequia", floodAlert: "Alerta de Inundacion", autoDisburse: "Desembolso Automatico", autoRepayment: "Reembolso Automatico" },
      seedAnalyst: { title: "Analisis de Semillas Avanzado", subtitle: "Laboratorio virtual y gemelos digitales", digitalTwin: "Gemelo Digital", genomicModeling: "Modelado Genomico", crossingSimulator: "Simulador de Cruces", climateAdaptation: "Adaptacion Climatica", germination: "Germinacion", purity: "Pureza", moisture: "Humedad", certified: "Certificado", pending: "Pendiente", rejected: "Rechazado", testing: "En Prueba", batchId: "Lote", variety: "Variedad", origin: "Origen", growthSimulation: "Simulacion de Crecimiento", scenarioCount: "escenarios climaticos", resilience: "Resiliencia", geneEditing: "Edicion Genetica", hybridVigor: "Vigor Hibrido", traitPrediction: "Prediccion de Rasgos", diseaseResistance: "Resistencia a Enfermedades", yieldPotential: "Potencial de Rendimiento", proteinContent: "Contenido Proteico", climateProjection: "Proyeccion Climatica", yearsProjection: "Proyeccion 30-50 anos", ipTracking: "Propiedad Intelectual" },
      agronomist: { title: "Espacio del Agronomo", subtitle: "Copiloto IA y modelado avanzado", aiCopilot: "Copiloto IA Experto", epidemiology: "Modelado Epidemiologico", carbonSimulator: "Simulador de Carbono", dynamicRecommendations: "Recomendaciones Dinamicas", fieldVisits: "Visitas de Campo", farmerSupervised: "Agricultores Supervisados", monthlyVisits: "Visitas este Mes", healthScore: "Puntuacion Promedio de Salud", supervisedCrops: "Cultivos Supervisados", generateReport: "Generar Informe", diseasePropagation: "Propagacion de Enfermedades", riskMap: "Mapa de Riesgo", earlyWarning: "Alerta Temprana", carbonSequestration: "Secuestro de Carbono", biodiversity: "Biodiversidad", soilHealth: "Salud del Suelo", carbonCredits: "Creditos de Carbono", lowCarbonCertification: "Certificacion Baja en Carbono", frostAlert: "Alerta de Helada", rainAlert: "Lluvia intensa prevista", treatmentDelay: "Retraso en Tratamiento", collaborativeNetwork: "Red Colaborativa", peerValidation: "Validacion entre Pares" }
    },
    subscription: { required: "Suscripcion requerida", trialExpired: "Su periodo de prueba de 14 dias ha terminado", subscribeNow: "Suscribirse ahora", fullAccess: "Acceso completo a todas las funciones", paymentSecure: "Pago seguro via MTN/Orange Mobile Money", daysRemaining: "dias restantes", basicMonthly: "Basico Mensual", premiumMonthly: "Premium Mensual", freeTrial: "Prueba Gratuita", active: "Activo", expired: "Expirado" },
    payment: { title: "Suscripcion y Pago", selectPackage: "Seleccione un paquete", payNow: "Pagar ahora", processing: "Procesando pago...", validatePhone: "Valide en su telefono", success: "Pago Exitoso!", failed: "Pago Fallido", retry: "Reintentar", history: "Historial de Pagos", operator: "Operador", phoneNumber: "Numero de telefono", insufficientBalance: "Saldo insuficiente", confirmed: "Confirmado", amount: "Monto" }
  },
  
  de: {
    nav: {
      home: "Startseite", solutions: "Loesungen", pricing: "Preise", about: "Ueber uns",
      contact: "Kontakt", login: "Anmelden", register: "Registrieren", logout: "Abmelden",
      dashboard: "Dashboard", admin: "Verwaltung", parcels: "Parzellen", sensors: "IoT-Sensoren",
      drones: "Drohnenverwaltung", robots: "Robotersteuerung", satellites: "Satellitenbilder",
      agribot: "AGRI GENIUS", advancedAnalysis: "Erweiterte Analyse", camera: "KI-Kamera",
      irrigation: "Automatische Bewaesserung", recommendations: "KI-Empfehlungen", marketplace: "Marktplatz",
      alerts: "Warnungen", settings: "Einstellungen", analytics: "Analysen", elearning: "Ausbildung",
      financial: "Finanzen", accessControl: "Zugriffskontrolle", database: "Datenbank"
    },
    landing: {
      heroTitle1: "Intelligente", heroTitle2: "Landwirtschaft", heroTitle3: "fuer Afrika",
      heroSubtitle: "Transformieren Sie Ihren Betrieb mit KI, autonomen Drohnen und vernetzten Robotern. Erkennen Sie Krankheiten, optimieren Sie Ertraege und treffen Sie fundierte Entscheidungen.",
      ctaStart: "Kostenlos starten", ctaDemo: "Demo testen",
      poweredBy: "Angetrieben von AGRI GENIUS AI", trustSecure: "Sichere Daten",
      trustUsers: "+5000 Landwirte", trustAward: "Innovationspreis 2024",
      statsTitle: "Kennzahlen", featuresTitle: "Loesungen",
      featuresSubtitle: "Spitzentechnologien fuer die afrikanische Landwirtschaft"
    },
    common: {
      loading: "Laden...", save: "Speichern", cancel: "Abbrechen", delete: "Loeschen",
      edit: "Bearbeiten", add: "Hinzufuegen", search: "Suchen", filter: "Filtern", export: "Exportieren",
      import: "Importieren", refresh: "Aktualisieren", close: "Schliessen", confirm: "Bestaetigen",
      yes: "Ja", no: "Nein", back: "Zurueck", next: "Weiter", previous: "Zurueck",
      submit: "Absenden", success: "Erfolg", error: "Fehler", warning: "Warnung", info: "Information",
      expand: "Erweitern", collapse: "Reduzieren", precisionAg: "Praezisionslandwirtschaft"
    },
    weather: {
      title: "Wetter", temperature: "Temperatur", humidity: "Feuchtigkeit", wind: "Wind",
      pressure: "Druck", visibility: "Sicht", sunrise: "Sonnenaufgang", sunset: "Sonnenuntergang",
      forecast: "Vorhersage", feelsLike: "Gefuehlt"
    },
    parcels: {
      title: "Parzellenverwaltung", newParcel: "Neue Parzelle", drawZone: "Zone zeichnen",
      analyzeZone: "Zone analysieren", area: "Flaeche", hectares: "Hektar", crop: "Kultur",
      status: "Status", lastAnalysis: "Letzte Analyse"
    },
    analysis: {
      title: "Analyse", ndvi: "NDVI-Index", stress: "Stresszonen", disease: "Krankheitserkennung",
      humidity: "Bodenfeuchtigkeit", thermal: "Thermalanalyse", cropHealth: "Pflanzengesundheit",
      generateReport: "Bericht erstellen", overallScore: "Gesamtbewertung", recommendations: "Empfehlungen"
    },
    drones: {
      title: "Drohnenverwaltung", addDrone: "Drohne hinzufuegen", piloting: "Steuerung",
      telemetry: "Telemetrie", altitude: "Hoehe", speed: "Geschwindigkeit", battery: "Batterie",
      signal: "WLAN-Signal", takeoff: "Starten", land: "Landen", emergency: "NOTFALL",
      photo: "Foto", video: "Video", scan: "Scannen", infrared: "Infrarot",
      lidar: "LIDAR", realView: "Echtzeitansicht", mission: "Mission"
    },
    robots: {
      title: "Robotersteuerung", addRobot: "Roboter hinzufuegen", start: "Starten", pause: "Pause",
      stop: "Stoppen", weeding: "Unkrautbekaempfung", spraying: "Spruehen", patrol: "Patrouille",
      sampling: "Probenahme", manual: "Manueller Modus", autonomous: "Autonomer Modus", view3d: "3D-Ansicht"
    },
    marketplace: {
      title: "Marktplatz", addProduct: "Produkt hinzufuegen",
      categories: { all: "Alle", seeds: "Saatgut", fertilizers: "Duenger", equipment: "Ausruestung", phyto: "Pflanzenschutz", harvest: "Ernte" },
      price: "Preis", quantity: "Menge", seller: "Verkaeufer", contact: "Kontakt"
    },
    auth: {
      login: "Anmelden", register: "Registrieren", email: "E-Mail",
      password: "Passwort", confirmPassword: "Passwort bestaetigen", fullName: "Vollstaendiger Name",
      phone: "Telefon", forgotPassword: "Passwort vergessen?", noAccount: "Kein Konto?",
      hasAccount: "Haben Sie ein Konto?", privacyPolicy: "Datenschutzrichtlinie",
      acceptTerms: "Ich akzeptiere die Nutzungsbedingungen", mustAcceptTerms: "Sie muessen die Bedingungen akzeptieren",
      loginSubtitle: "Geben Sie Ihre Zugangsdaten ein", demoAccounts: "Demo-Konten"
    },
    leadCapture: { title: "Zugang zu AGRICAM IA", subtitle: "Geben Sie Ihre Daten ein um unsere Plattform zu entdecken", cta: "Kostenlos zugreifen", benefits: ["14 Tage kostenlos testen", "Zugang zu allen Funktionen", "Persoenlicher Support"] },
    exitIntent: { title: "Warten Sie!", subtitle: "Verpassen Sie diese Gelegenheit nicht", offer: "Erhalten Sie 20% Rabatt auf Ihr erstes Abonnement", cta: "Angebot sichern", noThanks: "Nein danke" },
    privacy: { title: "Datenschutzrichtlinie", lastUpdate: "Letzte Aktualisierung", sections: { intro: "Einfuehrung", dataCollection: "Datenerhebung", dataUse: "Datennutzung", dataSharing: "Datenweitergabe", dataRetention: "Datenspeicherung", rights: "Ihre Rechte", cookies: "Cookies", contact: "Kontakt" } },
    pages: {
      dashboard: { title: "Dashboard", welcome: "Willkommen bei AGRICAM IA", overview: "Uebersicht", quickActions: "Schnellaktionen", recentActivity: "Letzte Aktivitaet", activeParcels: "Aktive Parzellen", avgHumidity: "Durchschnittliche Feuchtigkeit", avgTemperature: "Durchschnittliche Temperatur", activeAlerts: "Aktive Warnungen", parcelStatus: "Parzellenstatus", recentAlerts: "Letzte Warnungen", systemOperational: "System betriebsbereit", activeSensors: "aktive Sensoren" },
      irrigation: { title: "Automatische Bewaesserung", systems: "Bewaesserungssysteme", planGenerator: "Plangenerator", generatePlan: "KI-Plan generieren", surface: "Flaeche (ha)", culture: "Kultur", soilType: "Bodentyp", waterSource: "Wasserquelle", budget: "Budget", mode: "Modus", auto: "Automatisch", manual: "Manuell", semiAuto: "Halbautomatisch" },
      formation: { title: "Ausbildung", createCourse: "Kurs erstellen", myCourses: "Meine Kurse", category: "Kategorie", level: "Niveau", price: "Preis", duration: "Dauer", students: "Studenten", instructor: "Ausbilder", certificate: "Zertifikat", publish: "Veroeffentlichen" },
      accessControl: { title: "Zugriffskontrolle", grantAccess: "Zugang gewaehren", revokeAccess: "Zugang widerrufen", extendAccess: "Zugang verlaengern", trialDays: "Testtage", expired: "Abgelaufen", active: "Aktiv", onlineUsers: "Online-Benutzer", campaigns: "Kampagnen", crm: "CRM", revenue: "Umsatz", transactions: "Transaktionen" },
      satellite: { title: "Satellitenbilder", scheduledCaptures: "Geplante Aufnahmen", scheduleCapture: "Aufnahme planen", resolution: "Aufloesung", source: "Quelle" },
      camera: { title: "KI-Kamera", startCamera: "Kamera starten", stopCamera: "Kamera stoppen", analyze: "Analysieren", export: "Exportieren" },
      agribot: { title: "AGRI GENIUS", welcome: "Ihr intelligenter Landwirtschaftsassistent", placeholder: "Stellen Sie Ihre Frage...", analyzing: "Analyse laeuft..." }
    },
    roles: {
      admin: { title: "Erweiterte Verwaltung", subtitle: "Praediktives Dashboard", platformHealth: "Plattformgesundheit", securityAlerts: "Sicherheitswarnungen", anomalyDetection: "Anomalieerkennung", serverLoad: "Serverlast", apiSaturation: "API-Saettigung", activeUsers: "Aktive Benutzer", totalUsers: "Gesamtbenutzer", monthlyRevenue: "Monatsumsatz", predictiveMaintenance: "Praediktive Wartung", featureAdoption: "Funktionsuebernahme", abTesting: "A/B-Tests", fraudDetection: "Betrugserkennung", suspiciousActivity: "Verdaechtige Aktivitaet", systemMetrics: "Systemmetriken", uptime: "Betriebszeit", responseTime: "Antwortzeit", errorRate: "Fehlerrate", memoryUsage: "Speichernutzung", scalingRecommendation: "Skalierungsempfehlung" },
      farmer: { title: "Intelligenter Landwirt-Hub", subtitle: "Pflanzengesundheit und Vorhersagen", cropHealth: "Pflanzengesundheit", yieldPrediction: "Ertragsvorhersage", pricePrediction: "Preisvorhersage", blockchainTrace: "Blockchain-Rueckverfolgbarkeit", smartMarketplace: "Intelligenter Marktplatz", earlyDetection: "Frueherkennung", spectralAnalysis: "Spektralanalyse", treatmentMap: "Behandlungskarte", estimatedYield: "Geschaetzter Ertrag", optimalPrice: "Optimaler Preis", profitThreshold: "Rentabilitaetsschwelle", priceAlert: "Preisalarm", traceability: "Rueckverfolgbarkeit", qrCode: "QR-Code", lifecycle: "Lebenszyklus", groupPurchase: "Gruppenkauf", priceComparison: "Preisvergleich", sowing: "Aussaat", irrigation: "Bewaesserung", fertilization: "Duengung", harvest: "Ernte", plantingCalendar: "Pflanzkalender", rotation: "Fruchtfolge" },
      supplier: { title: "Lieferanten-Dashboard", subtitle: "Intelligente Lagerverwaltung", demandForecast: "Nachfrageprognose", logistics: "Logistikoptimierung", stockManagement: "Lagerverwaltung", crossSelling: "KI-Cross-Selling", totalProducts: "Gesamtprodukte", activeOrders: "Aktive Bestellungen", expiringStock: "Ablaufender Bestand", deliveryRoutes: "Lieferwege", routeOptimization: "Routenoptimierung", gpsTracking: "GPS-Verfolgung", flashPromo: "Flash-Promotion", customerSuggestion: "Kundenvorschlag", expiryAlert: "Verfallswarnung", salesTrend: "Verkaufstrend", topProducts: "Top-Produkte", regionalDemand: "Regionale Nachfrage" },
      bank: { title: "Finanz-Dashboard", subtitle: "Kreditbewertung und Risikomanagement", agriScore: "AgriScore", loanSimulator: "Kreditsimulator", riskManagement: "Risikomanagement", parametricInsurance: "Parametrische Versicherung", creditScore: "Kreditwuerdigkeit", yieldHistory: "Ertragshistorie", sustainability: "Nachhaltige Praktiken", salesRegularity: "Verkaufsregelmaessigkeit", climateRisk: "Klimarisiko", loanAmount: "Kreditbetrag", interestRate: "Zinssatz", duration: "Laufzeit", monthlyPayment: "Monatliche Rate", totalCost: "Gesamtkosten", portfolioExposure: "Portfolioexposition", zoneRisk: "Risikozone", droughtAlert: "Duerrealarm", floodAlert: "Hochwasseralarm", autoDisburse: "Automatische Auszahlung", autoRepayment: "Automatische Rueckzahlung" },
      seedAnalyst: { title: "Erweiterte Saatgutanalyse", subtitle: "Virtuelles Labor und Digitale Zwillinge", digitalTwin: "Digitaler Zwilling", genomicModeling: "Genomische Modellierung", crossingSimulator: "Kreuzungssimulator", climateAdaptation: "Klimaanpassung", germination: "Keimung", purity: "Reinheit", moisture: "Feuchtigkeit", certified: "Zertifiziert", pending: "Ausstehend", rejected: "Abgelehnt", testing: "In Pruefung", batchId: "Charge", variety: "Sorte", origin: "Herkunft", growthSimulation: "Wachstumssimulation", scenarioCount: "Klimaszenarien", resilience: "Resilienz", geneEditing: "Genbearbeitung", hybridVigor: "Hybridkraft", traitPrediction: "Merkmalvorhersage", diseaseResistance: "Krankheitsresistenz", yieldPotential: "Ertragspotenzial", proteinContent: "Proteingehalt", climateProjection: "Klimaprojektion", yearsProjection: "30-50 Jahre Projektion", ipTracking: "Geistiges Eigentum" },
      agronomist: { title: "Expertenraum Agronom", subtitle: "KI-Copilot und erweiterte Modellierung", aiCopilot: "KI-Experten-Copilot", epidemiology: "Epidemiologische Modellierung", carbonSimulator: "Kohlenstoffsimulator", dynamicRecommendations: "Dynamische Empfehlungen", fieldVisits: "Feldbesuche", farmerSupervised: "Betreute Landwirte", monthlyVisits: "Besuche diesen Monat", healthScore: "Durchschnittlicher Gesundheitswert", supervisedCrops: "Ueberwachte Kulturen", generateReport: "Bericht erstellen", diseasePropagation: "Krankheitsausbreitung", riskMap: "Risikokarte", earlyWarning: "Fruehwarnung", carbonSequestration: "Kohlenstoffbindung", biodiversity: "Biodiversitaet", soilHealth: "Bodengesundheit", carbonCredits: "Kohlenstoffgutschriften", lowCarbonCertification: "Kohlenstoffarme Zertifizierung", frostAlert: "Frostalarm", rainAlert: "Starkregen erwartet", treatmentDelay: "Behandlungsverzoegerung", collaborativeNetwork: "Kollaboratives Netzwerk", peerValidation: "Peer-Validierung" }
    },
    subscription: { required: "Abonnement erforderlich", trialExpired: "Ihre 14-taegige Testphase ist abgelaufen", subscribeNow: "Jetzt abonnieren", fullAccess: "Voller Zugang zu allen Funktionen", paymentSecure: "Sichere Zahlung ueber MTN/Orange Mobile Money", daysRemaining: "Tage verbleibend", basicMonthly: "Basis Monatlich", premiumMonthly: "Premium Monatlich", freeTrial: "Kostenlose Testversion", active: "Aktiv", expired: "Abgelaufen" },
    payment: { title: "Abonnement und Zahlung", selectPackage: "Paket waehlen", payNow: "Jetzt bezahlen", processing: "Zahlung wird verarbeitet...", validatePhone: "Auf Ihrem Telefon bestaetigen", success: "Zahlung erfolgreich!", failed: "Zahlung fehlgeschlagen", retry: "Erneut versuchen", history: "Zahlungsverlauf", operator: "Anbieter", phoneNumber: "Telefonnummer", insufficientBalance: "Unzureichendes Guthaben", confirmed: "Bestaetigt", amount: "Betrag" }
  },
  
  ar: {
    nav: {
      home: "الرئيسية", solutions: "الحلول", pricing: "الأسعار", about: "من نحن",
      contact: "اتصل بنا", login: "تسجيل الدخول", register: "إنشاء حساب", logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم", admin: "الإدارة", parcels: "القطع الأرضية", sensors: "أجهزة الاستشعار",
      drones: "إدارة الطائرات", robots: "التحكم في الروبوتات", satellites: "صور الأقمار الصناعية",
      agribot: "AGRI GENIUS", advancedAnalysis: "تحليل متقدم", camera: "كاميرا الذكاء الاصطناعي",
      irrigation: "الري التلقائي", recommendations: "توصيات الذكاء الاصطناعي", marketplace: "السوق",
      alerts: "التنبيهات", settings: "الإعدادات", analytics: "التحليلات", elearning: "التدريب",
      financial: "المالية", accessControl: "التحكم في الوصول", database: "قاعدة البيانات"
    },
    landing: {
      heroTitle1: "الزراعة", heroTitle2: "الذكية", heroTitle3: "لأفريقيا",
      heroSubtitle: "حوّل مزرعتك بالذكاء الاصطناعي والطائرات المسيّرة والروبوتات المتصلة. اكتشف الأمراض وحسّن إنتاجك واتخذ قرارات مستنيرة.",
      ctaStart: "ابدأ مجاناً", ctaDemo: "جرّب العرض التوضيحي",
      poweredBy: "مدعوم من AGRI GENIUS AI", trustSecure: "بيانات آمنة",
      trustUsers: "+5000 مزارع", trustAward: "جائزة الابتكار 2024",
      statsTitle: "أرقام رئيسية", featuresTitle: "الحلول",
      featuresSubtitle: "تقنيات متطورة للزراعة الأفريقية"
    },
    common: {
      loading: "جاري التحميل...", save: "حفظ", cancel: "إلغاء", delete: "حذف",
      edit: "تعديل", add: "إضافة", search: "بحث", filter: "تصفية", export: "تصدير",
      import: "استيراد", refresh: "تحديث", close: "إغلاق", confirm: "تأكيد",
      yes: "نعم", no: "لا", back: "رجوع", next: "التالي", previous: "السابق",
      submit: "إرسال", success: "نجاح", error: "خطأ", warning: "تحذير", info: "معلومات",
      expand: "توسيع", collapse: "تصغير", precisionAg: "الزراعة الدقيقة"
    },
    weather: {
      title: "الطقس", temperature: "درجة الحرارة", humidity: "الرطوبة", wind: "الرياح",
      pressure: "الضغط", visibility: "الرؤية", sunrise: "شروق الشمس", sunset: "غروب الشمس",
      forecast: "التوقعات", feelsLike: "الإحساس الحراري"
    },
    parcels: {
      title: "إدارة القطع الأرضية", newParcel: "قطعة جديدة", drawZone: "رسم منطقة",
      analyzeZone: "تحليل المنطقة", area: "المساحة", hectares: "هكتار", crop: "المحصول",
      status: "الحالة", lastAnalysis: "آخر تحليل"
    },
    analysis: {
      title: "التحليل", ndvi: "مؤشر NDVI", stress: "مناطق الإجهاد", disease: "كشف الأمراض",
      humidity: "رطوبة التربة", thermal: "التحليل الحراري", cropHealth: "صحة المحاصيل",
      generateReport: "إنشاء تقرير", overallScore: "النتيجة العامة", recommendations: "التوصيات"
    },
    drones: {
      title: "إدارة الطائرات المسيّرة", addDrone: "إضافة طائرة", piloting: "القيادة",
      telemetry: "القياس عن بعد", altitude: "الارتفاع", speed: "السرعة", battery: "البطارية",
      signal: "إشارة واي فاي", takeoff: "إقلاع", land: "هبوط", emergency: "طوارئ",
      photo: "صورة", video: "فيديو", scan: "مسح", infrared: "أشعة تحت الحمراء",
      lidar: "ليدار", realView: "عرض حقيقي", mission: "مهمة"
    },
    robots: {
      title: "التحكم في الروبوتات", addRobot: "إضافة روبوت", start: "بدء", pause: "إيقاف مؤقت",
      stop: "توقف", weeding: "إزالة الأعشاب", spraying: "الرش", patrol: "دورية",
      sampling: "أخذ العينات", manual: "وضع يدوي", autonomous: "وضع تلقائي", view3d: "عرض ثلاثي الأبعاد"
    },
    marketplace: {
      title: "السوق", addProduct: "إضافة منتج",
      categories: { all: "الكل", seeds: "بذور", fertilizers: "أسمدة", equipment: "معدات", phyto: "مبيدات", harvest: "محاصيل" },
      price: "السعر", quantity: "الكمية", seller: "البائع", contact: "اتصال"
    },
    auth: {
      login: "تسجيل الدخول", register: "إنشاء حساب", email: "البريد الإلكتروني",
      password: "كلمة المرور", confirmPassword: "تأكيد كلمة المرور", fullName: "الاسم الكامل",
      phone: "الهاتف", forgotPassword: "نسيت كلمة المرور؟", noAccount: "ليس لديك حساب؟",
      hasAccount: "لديك حساب بالفعل؟", privacyPolicy: "سياسة الخصوصية",
      acceptTerms: "أوافق على شروط الاستخدام", mustAcceptTerms: "يجب قبول الشروط",
      loginSubtitle: "أدخل بياناتك للوصول", demoAccounts: "حسابات تجريبية"
    },
    pages: {
      dashboard: { title: "لوحة التحكم", welcome: "مرحباً بك في AGRICAM IA", overview: "نظرة عامة", quickActions: "إجراءات سريعة", recentActivity: "النشاط الأخير", activeParcels: "القطع النشطة", avgHumidity: "متوسط الرطوبة", avgTemperature: "متوسط الحرارة", activeAlerts: "التنبيهات النشطة", parcelStatus: "حالة القطع", recentAlerts: "التنبيهات الأخيرة", systemOperational: "النظام يعمل", activeSensors: "أجهزة استشعار نشطة" },
      irrigation: { title: "الري التلقائي", systems: "أنظمة الري", planGenerator: "مولد الخطط", generatePlan: "إنشاء خطة ذكية", surface: "المساحة (هكتار)", culture: "المحصول", soilType: "نوع التربة", waterSource: "مصدر المياه", budget: "الميزانية", mode: "الوضع", auto: "تلقائي", manual: "يدوي", semiAuto: "شبه تلقائي" },
      formation: { title: "التدريب", createCourse: "إنشاء دورة", myCourses: "دوراتي", category: "الفئة", level: "المستوى", price: "السعر", duration: "المدة", students: "الطلاب", instructor: "المدرب", certificate: "الشهادة", publish: "نشر" },
      accessControl: { title: "التحكم في الوصول", grantAccess: "منح الوصول", revokeAccess: "إلغاء الوصول", extendAccess: "تمديد الوصول", trialDays: "أيام التجربة", expired: "منتهي", active: "نشط", onlineUsers: "المستخدمون المتصلون", campaigns: "الحملات", crm: "إدارة العملاء", revenue: "الإيرادات", transactions: "المعاملات" },
      satellite: { title: "صور الأقمار الصناعية", scheduledCaptures: "الالتقاطات المجدولة", scheduleCapture: "جدولة التقاط", resolution: "الدقة", source: "المصدر" },
      camera: { title: "كاميرا الذكاء الاصطناعي", startCamera: "تشغيل الكاميرا", stopCamera: "إيقاف الكاميرا", analyze: "تحليل", export: "تصدير" },
      agribot: { title: "AGRI GENIUS", welcome: "مساعدك الزراعي الذكي", placeholder: "اطرح سؤالك...", analyzing: "جاري التحليل..." }
    },
    roles: {
      admin: { title: "الإدارة المتقدمة", subtitle: "لوحة تحكم تنبؤية", platformHealth: "صحة المنصة", securityAlerts: "تنبيهات أمنية", anomalyDetection: "كشف الشذوذ", serverLoad: "حمل الخادم", apiSaturation: "تشبع API", activeUsers: "المستخدمون النشطون", totalUsers: "إجمالي المستخدمين", monthlyRevenue: "الإيرادات الشهرية", predictiveMaintenance: "الصيانة التنبؤية", featureAdoption: "اعتماد الميزات", abTesting: "اختبارات A/B", fraudDetection: "كشف الاحتيال", suspiciousActivity: "نشاط مشبوه", systemMetrics: "مقاييس النظام", uptime: "وقت التشغيل", responseTime: "وقت الاستجابة", errorRate: "معدل الأخطاء", memoryUsage: "استخدام الذاكرة", scalingRecommendation: "توصية التوسع" },
      farmer: { title: "مركز المزارع الذكي", subtitle: "صحة المحاصيل والتنبؤات", cropHealth: "صحة المحاصيل", yieldPrediction: "توقع الإنتاج", pricePrediction: "توقع الأسعار", blockchainTrace: "تتبع البلوكتشين", smartMarketplace: "السوق الذكي", earlyDetection: "الكشف المبكر", spectralAnalysis: "التحليل الطيفي", treatmentMap: "خريطة العلاج", estimatedYield: "الإنتاج المقدر", optimalPrice: "السعر الأمثل", profitThreshold: "عتبة الربح", priceAlert: "تنبيه السعر", traceability: "التتبع", qrCode: "رمز QR", lifecycle: "دورة الحياة", groupPurchase: "شراء جماعي", priceComparison: "مقارنة الأسعار", sowing: "البذر", irrigation: "الري", fertilization: "التسميد", harvest: "الحصاد", plantingCalendar: "تقويم الزراعة", rotation: "تناوب المحاصيل" },
      supplier: { title: "لوحة تحكم المورد", subtitle: "إدارة ذكية للمدخلات", demandForecast: "توقع الطلب", logistics: "تحسين اللوجستيات", stockManagement: "إدارة المخزون", crossSelling: "البيع المتقاطع", totalProducts: "إجمالي المنتجات", activeOrders: "الطلبات النشطة", expiringStock: "مخزون قارب على الانتهاء", deliveryRoutes: "مسارات التوصيل", routeOptimization: "تحسين المسارات", gpsTracking: "تتبع GPS", flashPromo: "عرض فوري", customerSuggestion: "اقتراح العملاء", expiryAlert: "تنبيه انتهاء الصلاحية", salesTrend: "اتجاه المبيعات", topProducts: "أفضل المنتجات", regionalDemand: "الطلب الإقليمي" },
      bank: { title: "لوحة التحكم المالية", subtitle: "التصنيف الائتماني وإدارة المخاطر", agriScore: "AgriScore", loanSimulator: "محاكي القروض", riskManagement: "إدارة المخاطر", parametricInsurance: "التأمين البارامتري", creditScore: "النقاط الائتمانية", yieldHistory: "سجل الإنتاج", sustainability: "الممارسات المستدامة", salesRegularity: "انتظام المبيعات", climateRisk: "المخاطر المناخية", loanAmount: "مبلغ القرض", interestRate: "سعر الفائدة", duration: "المدة", monthlyPayment: "القسط الشهري", totalCost: "التكلفة الإجمالية", portfolioExposure: "تعرض المحفظة", zoneRisk: "منطقة خطر", droughtAlert: "تنبيه جفاف", floodAlert: "تنبيه فيضان", autoDisburse: "صرف تلقائي", autoRepayment: "سداد تلقائي" },
      seedAnalyst: { title: "تحليل البذور المتقدم", subtitle: "مختبر افتراضي وتوائم رقمية", digitalTwin: "التوأم الرقمي", genomicModeling: "النمذجة الجينومية", crossingSimulator: "محاكي التهجين", climateAdaptation: "التكيف المناخي", germination: "الإنبات", purity: "النقاء", moisture: "الرطوبة", certified: "معتمد", pending: "قيد الانتظار", rejected: "مرفوض", testing: "قيد الاختبار", batchId: "الدفعة", variety: "الصنف", origin: "المنشأ", growthSimulation: "محاكاة النمو", scenarioCount: "سيناريوهات مناخية", resilience: "المرونة", geneEditing: "تحرير الجينات", hybridVigor: "القوة الهجينة", traitPrediction: "توقع السمات", diseaseResistance: "مقاومة الأمراض", yieldPotential: "إمكانية الإنتاج", proteinContent: "محتوى البروتين", climateProjection: "الإسقاط المناخي", yearsProjection: "إسقاط 30-50 سنة", ipTracking: "الملكية الفكرية" },
      agronomist: { title: "مساحة المهندس الزراعي", subtitle: "مساعد ذكي ونمذجة متقدمة", aiCopilot: "مساعد ذكي خبير", epidemiology: "النمذجة الوبائية", carbonSimulator: "محاكي الكربون", dynamicRecommendations: "توصيات ديناميكية", fieldVisits: "زيارات ميدانية", farmerSupervised: "مزارعون مُتابَعون", monthlyVisits: "زيارات هذا الشهر", healthScore: "متوسط نقاط الصحة", supervisedCrops: "محاصيل مُراقَبة", generateReport: "إنشاء تقرير", diseasePropagation: "انتشار الأمراض", riskMap: "خريطة المخاطر", earlyWarning: "إنذار مبكر", carbonSequestration: "احتجاز الكربون", biodiversity: "التنوع البيولوجي", soilHealth: "صحة التربة", carbonCredits: "رصيد الكربون", lowCarbonCertification: "شهادة منخفض الكربون", frostAlert: "تنبيه صقيع", rainAlert: "أمطار غزيرة متوقعة", treatmentDelay: "تأخير العلاج", collaborativeNetwork: "شبكة تعاونية", peerValidation: "تحقق الأقران" }
    },
    subscription: { required: "الاشتراك مطلوب", trialExpired: "انتهت فترة التجربة المجانية (14 يوم)", subscribeNow: "اشترك الآن", fullAccess: "وصول كامل لجميع الميزات", paymentSecure: "دفع آمن عبر MTN/Orange Mobile Money", daysRemaining: "أيام متبقية", basicMonthly: "الأساسي الشهري", premiumMonthly: "المميز الشهري", freeTrial: "تجربة مجانية", active: "نشط", expired: "منتهي" },
    payment: { title: "الاشتراك والدفع", selectPackage: "اختر باقة", payNow: "ادفع الآن", processing: "جاري معالجة الدفع...", validatePhone: "أكد على هاتفك", success: "تم الدفع بنجاح!", failed: "فشل الدفع", retry: "إعادة المحاولة", history: "سجل المدفوعات", operator: "المشغل", phoneNumber: "رقم الهاتف", insufficientBalance: "رصيد غير كافٍ", confirmed: "مؤكد", amount: "المبلغ" },
    leadCapture: { title: "ادخل إلى AGRICAM IA", subtitle: "أدخل معلوماتك لاكتشاف منصتنا", cta: "دخول مجاني", benefits: ["تجربة مجانية 14 يوم", "وصول لجميع الميزات", "دعم مخصص"] },
    exitIntent: { title: "انتظر!", subtitle: "لا تفوّت هذه الفرصة", offer: "احصل على 20% خصم على اشتراكك الأول", cta: "احصل على العرض", noThanks: "لا شكراً" }
  },
  
  zh: {
    nav: {
      home: "首页", solutions: "解决方案", pricing: "价格", about: "关于我们",
      contact: "联系我们", login: "登录", register: "注册", logout: "退出",
      dashboard: "仪表板", admin: "管理", parcels: "地块", sensors: "物联网传感器",
      drones: "无人机管理", robots: "机器人控制", satellites: "卫星图像",
      agribot: "AGRI GENIUS", advancedAnalysis: "高级分析", camera: "AI摄像头",
      irrigation: "自动灌溉", recommendations: "AI推荐", marketplace: "市场",
      alerts: "警报", settings: "设置", analytics: "分析", elearning: "培训",
      financial: "财务", accessControl: "访问控制", database: "数据库"
    },
    landing: {
      heroTitle1: "智慧", heroTitle2: "农业", heroTitle3: "服务非洲",
      heroSubtitle: "利用人工智能、自主无人机和联网机器人改造您的农场。检测疾病、优化产量并做出明智决策。",
      ctaStart: "免费开始", ctaDemo: "试用演示",
      poweredBy: "由 AGRI GENIUS AI 驱动", trustSecure: "数据安全",
      trustUsers: "+5000 农民", trustAward: "2024年创新奖",
      statsTitle: "关键数据", featuresTitle: "解决方案",
      featuresSubtitle: "非洲农业的尖端技术"
    },
    common: {
      loading: "加载中...", save: "保存", cancel: "取消", delete: "删除",
      edit: "编辑", add: "添加", search: "搜索", filter: "筛选", export: "导出",
      import: "导入", refresh: "刷新", close: "关闭", confirm: "确认",
      yes: "是", no: "否", back: "返回", next: "下一步", previous: "上一步",
      submit: "提交", success: "成功", error: "错误", warning: "警告", info: "信息",
      expand: "展开", collapse: "收起", precisionAg: "精准农业"
    },
    weather: {
      title: "天气", temperature: "温度", humidity: "湿度", wind: "风速",
      pressure: "气压", visibility: "能见度", sunrise: "日出", sunset: "日落",
      forecast: "预报", feelsLike: "体感温度"
    },
    parcels: {
      title: "地块管理", newParcel: "新建地块", drawZone: "绘制区域",
      analyzeZone: "分析区域", area: "面积", hectares: "公顷", crop: "作物",
      status: "状态", lastAnalysis: "最近分析"
    },
    analysis: {
      title: "分析", ndvi: "NDVI指数", stress: "胁迫区域", disease: "病害检测",
      humidity: "土壤湿度", thermal: "热力分析", cropHealth: "作物健康",
      generateReport: "生成报告", overallScore: "综合评分", recommendations: "建议"
    },
    drones: {
      title: "无人机管理", addDrone: "添加无人机", piloting: "操控",
      telemetry: "遥测", altitude: "高度", speed: "速度", battery: "电池",
      signal: "WiFi信号", takeoff: "起飞", land: "着陆", emergency: "紧急",
      photo: "拍照", video: "视频", scan: "扫描", infrared: "红外",
      lidar: "LIDAR", realView: "实时视图", mission: "任务"
    },
    robots: {
      title: "机器人控制", addRobot: "添加机器人", start: "启动", pause: "暂停",
      stop: "停止", weeding: "除草", spraying: "喷洒", patrol: "巡逻",
      sampling: "采样", manual: "手动模式", autonomous: "自主模式", view3d: "3D视图"
    },
    marketplace: {
      title: "市场", addProduct: "添加产品",
      categories: { all: "全部", seeds: "种子", fertilizers: "肥料", equipment: "设备", phyto: "植保产品", harvest: "收获" },
      price: "价格", quantity: "数量", seller: "卖家", contact: "联系"
    },
    auth: {
      login: "登录", register: "注册", email: "电子邮件",
      password: "密码", confirmPassword: "确认密码", fullName: "全名",
      phone: "电话", forgotPassword: "忘记密码?", noAccount: "没有账号?",
      hasAccount: "已有账号?", privacyPolicy: "隐私政策",
      acceptTerms: "我接受使用条款", mustAcceptTerms: "您必须接受条款",
      loginSubtitle: "输入您的凭据以访问", demoAccounts: "演示账户"
    },
    leadCapture: { title: "访问 AGRICAM IA", subtitle: "输入您的信息以了解我们的平台", cta: "免费访问", benefits: ["14天免费试用", "访问所有功能", "个性化支持"] },
    exitIntent: { title: "请等一下!", subtitle: "不要错过这个机会", offer: "首次订阅享受20%折扣", cta: "获取优惠", noThanks: "不用了谢谢" },
    privacy: { title: "隐私政策", lastUpdate: "最后更新", sections: { intro: "简介", dataCollection: "数据收集", dataUse: "数据使用", dataSharing: "数据共享", dataRetention: "数据保留", rights: "您的权利", cookies: "Cookies", contact: "联系方式" } },
    pages: {
      dashboard: { title: "仪表板", welcome: "欢迎使用 AGRICAM IA", overview: "概览", quickActions: "快捷操作", recentActivity: "最近活动", activeParcels: "活跃地块", avgHumidity: "平均湿度", avgTemperature: "平均温度", activeAlerts: "活跃警报", parcelStatus: "地块状态", recentAlerts: "最近警报", systemOperational: "系统正常", activeSensors: "活跃传感器" },
      irrigation: { title: "自动灌溉", systems: "灌溉系统", planGenerator: "计划生成器", generatePlan: "生成AI计划", surface: "面积(公顷)", culture: "作物", soilType: "土壤类型", waterSource: "水源", budget: "预算", mode: "模式", auto: "自动", manual: "手动", semiAuto: "半自动" },
      formation: { title: "培训", createCourse: "创建课程", myCourses: "我的课程", category: "类别", level: "级别", price: "价格", duration: "时长", students: "学员", instructor: "讲师", certificate: "证书", publish: "发布" },
      accessControl: { title: "访问控制", grantAccess: "授予访问", revokeAccess: "撤销访问", extendAccess: "延长访问", trialDays: "试用天数", expired: "已过期", active: "活跃", onlineUsers: "在线用户", campaigns: "活动", crm: "客户管理", revenue: "收入", transactions: "交易" },
      satellite: { title: "卫星图像", scheduledCaptures: "计划捕获", scheduleCapture: "安排捕获", resolution: "分辨率", source: "来源" },
      camera: { title: "AI摄像头", startCamera: "启动摄像头", stopCamera: "停止摄像头", analyze: "分析", export: "导出" },
      agribot: { title: "AGRI GENIUS", welcome: "您的智能农业助手", placeholder: "提出您的问题...", analyzing: "分析中..." }
    },
    roles: {
      admin: { title: "高级管理", subtitle: "预测性仪表板", platformHealth: "平台健康", securityAlerts: "安全警报", anomalyDetection: "异常检测", serverLoad: "服务器负载", apiSaturation: "API饱和度", activeUsers: "活跃用户", totalUsers: "总用户数", monthlyRevenue: "月收入", predictiveMaintenance: "预测性维护", featureAdoption: "功能采用", abTesting: "A/B测试", fraudDetection: "欺诈检测", suspiciousActivity: "可疑活动", systemMetrics: "系统指标", uptime: "运行时间", responseTime: "响应时间", errorRate: "错误率", memoryUsage: "内存使用", scalingRecommendation: "扩展建议" },
      farmer: { title: "智慧农场中心", subtitle: "作物健康与预测", cropHealth: "作物健康", yieldPrediction: "产量预测", pricePrediction: "价格预测", blockchainTrace: "区块链追溯", smartMarketplace: "智能市场", earlyDetection: "早期检测", spectralAnalysis: "光谱分析", treatmentMap: "治疗地图", estimatedYield: "预计产量", optimalPrice: "最优价格", profitThreshold: "盈利门槛", priceAlert: "价格警报", traceability: "可追溯性", qrCode: "二维码", lifecycle: "生命周期", groupPurchase: "团购", priceComparison: "价格对比", sowing: "播种", irrigation: "灌溉", fertilization: "施肥", harvest: "收获", plantingCalendar: "种植日历", rotation: "轮作" },
      supplier: { title: "供应商仪表板", subtitle: "智能投入品管理", demandForecast: "需求预测", logistics: "物流优化", stockManagement: "库存管理", crossSelling: "AI交叉销售", totalProducts: "产品总数", activeOrders: "活跃订单", expiringStock: "即将过期库存", deliveryRoutes: "配送路线", routeOptimization: "路线优化", gpsTracking: "GPS追踪", flashPromo: "闪促", customerSuggestion: "客户建议", expiryAlert: "过期警报", salesTrend: "销售趋势", topProducts: "热销产品", regionalDemand: "区域需求" },
      bank: { title: "金融仪表板", subtitle: "信用评分与风险管理", agriScore: "AgriScore", loanSimulator: "贷款模拟器", riskManagement: "风险管理", parametricInsurance: "参数保险", creditScore: "信用评分", yieldHistory: "产量历史", sustainability: "可持续实践", salesRegularity: "销售规律性", climateRisk: "气候风险", loanAmount: "贷款金额", interestRate: "利率", duration: "期限", monthlyPayment: "月付款", totalCost: "总成本", portfolioExposure: "投资组合风险", zoneRisk: "风险区域", droughtAlert: "干旱警报", floodAlert: "洪水警报", autoDisburse: "自动拨款", autoRepayment: "自动还款" },
      seedAnalyst: { title: "高级种子分析", subtitle: "虚拟实验室与数字孪生", digitalTwin: "数字孪生", genomicModeling: "基因组建模", crossingSimulator: "杂交模拟器", climateAdaptation: "气候适应", germination: "发芽率", purity: "纯度", moisture: "水分", certified: "已认证", pending: "待定", rejected: "已拒绝", testing: "测试中", batchId: "批次", variety: "品种", origin: "产地", growthSimulation: "生长模拟", scenarioCount: "气候场景", resilience: "韧性", geneEditing: "基因编辑", hybridVigor: "杂种优势", traitPrediction: "性状预测", diseaseResistance: "抗病性", yieldPotential: "产量潜力", proteinContent: "蛋白质含量", climateProjection: "气候预测", yearsProjection: "30-50年预测", ipTracking: "知识产权" },
      agronomist: { title: "农学专家空间", subtitle: "AI副驾驶与高级建模", aiCopilot: "AI专家副驾驶", epidemiology: "流行病学建模", carbonSimulator: "碳模拟器", dynamicRecommendations: "动态建议", fieldVisits: "实地访问", farmerSupervised: "指导农民", monthlyVisits: "本月访问", healthScore: "平均健康评分", supervisedCrops: "监督作物", generateReport: "生成报告", diseasePropagation: "病害传播", riskMap: "风险地图", earlyWarning: "预警", carbonSequestration: "碳封存", biodiversity: "生物多样性", soilHealth: "土壤健康", carbonCredits: "碳信用", lowCarbonCertification: "低碳认证", frostAlert: "霜冻警报", rainAlert: "预计大雨", treatmentDelay: "治疗延迟", collaborativeNetwork: "协作网络", peerValidation: "同行验证" }
    },
    subscription: { required: "需要订阅", trialExpired: "您的14天试用已到期", subscribeNow: "立即订阅", fullAccess: "完全访问所有功能", paymentSecure: "通过MTN/Orange Mobile Money安全支付", daysRemaining: "天剩余", basicMonthly: "基础月付", premiumMonthly: "高级月付", freeTrial: "免费试用", active: "活跃", expired: "已过期" },
    payment: { title: "订阅与支付", selectPackage: "选择套餐", payNow: "立即支付", processing: "处理支付中...", validatePhone: "在手机上确认", success: "支付成功!", failed: "支付失败", retry: "重试", history: "支付历史", operator: "运营商", phoneNumber: "手机号码", insufficientBalance: "余额不足", confirmed: "已确认", amount: "金额" }
  },

  // African Languages
  ff: {
    nav: {
      home: "Jaɓɓorgo", solutions: "Peeje", pricing: "Njuɓɓudi", about: "Baɗte amen",
      contact: "Jokkondiral", login: "Naatgu", register: "Winnditaago", logout: "Yaltugu",
      dashboard: "Taabal njiimaandi", admin: "Njiimaandi", parcels: "Gese", sensors: "Ƴeewirɗe IoT",
      drones: "Drones", robots: "Robots", satellites: "Natal weeyo", agribot: "AGRI GENIUS",
      advancedAnalysis: "Ƴeewndal toownngal", camera: "Camera IA", irrigation: "Ndiyam ngesa",
      recommendations: "Wasiyaaji IA", marketplace: "Luumo", alerts: "Jeertine",
      settings: "Teelte", analytics: "Ƴeewndal", financial: "Jawdi", accessControl: "Njiimaandi naatgu",
      database: "Dokkorde keɓe"
    },
    common: { loading: "Ina loowa...", save: "Mooftu", cancel: "Haaytu", delete: "Momtu", edit: "Waɗɗitu", add: "Ɓeydu", search: "Yiilo" },
    weather: { title: "Weeyo", temperature: "Ngulndam", humidity: "Ɗuƴƴe", wind: "Hendu" }
  },
  ew: {
    nav: {
      home: "Nda", solutions: "Minsili", pricing: "Akuma", about: "Bia ene",
      contact: "Keka ene", login: "Ke nkɔ", register: "Ŋwala", logout: "Fi nkɔ",
      dashboard: "Akontaban", admin: "Nkontrol", parcels: "Afub", sensors: "Bisensɔ",
      drones: "Drones", robots: "Robots", satellites: "Foto Esibi", agribot: "AGRI GENIUS",
      advancedAnalysis: "Analiz abui", camera: "Camera IA", irrigation: "Nsui afub",
      recommendations: "Minkpaman IA", marketplace: "Makat", alerts: "Nkwa",
      settings: "Mintetenan", analytics: "Analitik", financial: "Moni", accessControl: "Nkontrol nkɔ",
      database: "Datos"
    },
    common: { loading: "Eza lod...", save: "Kigan", cancel: "Bele", delete: "Wos", edit: "Timba", add: "Bɔd", search: "Sɛtɛ" },
    weather: { title: "Mvul", temperature: "Afianan", humidity: "Nsui", wind: "Fefɛ" }
  },
  bam: {
    nav: {
      home: "So", solutions: "Furakɛli", pricing: "Sɔngɔ", about: "An ka kow",
      contact: "An sɔrɔ", login: "Don", register: "Tɔgɔ sɛbɛn", logout: "Bɔ",
      dashboard: "Daɲɛgafe", admin: "Kafow", parcels: "Foro", sensors: "Sensɛri IoT",
      drones: "Drones", robots: "Robots", satellites: "Sankolo jaa", agribot: "AGRI GENIUS",
      advancedAnalysis: "Sɛgɛsɛgɛli", camera: "Camera IA", irrigation: "Ji kɛ foro la",
      recommendations: "Ladilikan IA", marketplace: "Sugu", alerts: "Laadili",
      settings: "Labɛnni", analytics: "Jateminɛ", financial: "Wari ko", accessControl: "Doncogo kontɔrɔli",
      database: "Donko marayɔrɔ"
    },
    common: { loading: "A bɛ se la...", save: "Mara", cancel: "A dabila", delete: "Bɔ", edit: "Yɛlɛma", add: "Fara a kan", search: "Ɲini" },
    weather: { title: "Waati", temperature: "Funteni", humidity: "Jikura", wind: "Fɲɛ" }
  },
  ha: {
    nav: {
      home: "Gida", solutions: "Hanyoyi", pricing: "Farashi", about: "Game da mu",
      contact: "Tuntuɓe mu", login: "Shiga", register: "Yi rajista", logout: "Fita",
      dashboard: "Dashboard", admin: "Gudanarwa", parcels: "Gonaki", sensors: "Na'urorin IoT",
      drones: "Jiragen sama", robots: "Robots", satellites: "Hotunan tauraro dan adam", agribot: "AGRI GENIUS",
      advancedAnalysis: "Nazari mai zurfi", camera: "Camera IA", irrigation: "Ban ruwa",
      recommendations: "Shawarwarin IA", marketplace: "Kasuwa", alerts: "Faɗakarwa",
      settings: "Saituna", analytics: "Nazari", financial: "Kuɗi", accessControl: "Kula da shiga",
      database: "Ma'ajin bayanai"
    },
    common: { loading: "Ana lodi...", save: "Ajiye", cancel: "Soke", delete: "Goge", edit: "Gyara", add: "Ƙara", search: "Bincika" },
    weather: { title: "Yanayi", temperature: "Zafi", humidity: "Danshi", wind: "Iska" }
  },
  sw: {
    nav: {
      home: "Nyumbani", solutions: "Suluhisho", pricing: "Bei", about: "Kuhusu",
      contact: "Wasiliana", login: "Ingia", register: "Jisajili", logout: "Toka",
      dashboard: "Dashibodi", admin: "Usimamizi", parcels: "Mashamba", sensors: "Sensorer za IoT",
      drones: "Ndege zisizo na rubani", robots: "Roboti", satellites: "Picha za setilaiti", agribot: "AGRI GENIUS",
      advancedAnalysis: "Uchambuzi wa hali ya juu", camera: "Kamera ya AI", irrigation: "Umwagiliaji",
      recommendations: "Mapendekezo ya AI", marketplace: "Soko", alerts: "Tahadhari",
      settings: "Mipangilio", analytics: "Uchambuzi", financial: "Fedha", accessControl: "Udhibiti wa ufikiaji",
      database: "Hifadhidata"
    },
    common: { loading: "Inapakia...", save: "Hifadhi", cancel: "Ghairi", delete: "Futa", edit: "Hariri", add: "Ongeza", search: "Tafuta" },
    weather: { title: "Hali ya hewa", temperature: "Joto", humidity: "Unyevu", wind: "Upepo" }
  },
  wo: {
    nav: {
      home: "Kër", solutions: "Njariñ", pricing: "Njëg", about: "Ci sunu biir",
      contact: "Jokko", login: "Dugg", register: "Bindu sa turu", logout: "Génn",
      dashboard: "Panoo", admin: "Yonent", parcels: "Tool", sensors: "Jëkkalëkaay IoT",
      drones: "Drones", robots: "Robots", satellites: "Nataal Asamaan", agribot: "AGRI GENIUS",
      advancedAnalysis: "Seet bu xóot", camera: "Camera IA", irrigation: "Ndox tool",
      recommendations: "Digal IA", marketplace: "Marse", alerts: "Moytuwaayu",
      settings: "Topp", analytics: "Saytu", financial: "Xaalis", accessControl: "Duggu kontrol",
      database: "Baasu njoxe"
    },
    common: { loading: "Yegge naa...", save: "Denc", cancel: "Bàyyi", delete: "Far", edit: "Soppi", add: "Yokk", search: "Wut" },
    weather: { title: "Wer", temperature: "Tangaay", humidity: "Naxam", wind: "Ngelaw" }
  },
  yo: {
    nav: {
      home: "Ile", solutions: "Ojutu", pricing: "Iye owo", about: "Nipa wa",
      contact: "Pe wa", login: "Wọle", register: "Forukọsilẹ", logout: "Jade",
      dashboard: "Dasibodu", admin: "Alakoso", parcels: "Oko", sensors: "Ero IoT",
      drones: "Drones", robots: "Robots", satellites: "Aworan satẹlaiti", agribot: "AGRI GENIUS",
      advancedAnalysis: "Itupalẹ ilọsiwaju", camera: "Kamẹra AI", irrigation: "Irigeshọn",
      recommendations: "Igbimọran AI", marketplace: "Ọja", alerts: "Ikilọ",
      settings: "Eto", analytics: "Itupalẹ", financial: "Owo", accessControl: "Ṣakoso iwọle",
      database: "Ibi ipamọ data"
    },
    common: { loading: "N tẹsiwaju...", save: "Fi pamọ", cancel: "Fagile", delete: "Paarẹ", edit: "Ṣatunkọ", add: "Fi kun", search: "Wa" },
    weather: { title: "Oju ojo", temperature: "Iwọn ooru", humidity: "Ọrinrin", wind: "Afẹfẹ" }
  },
  bas: {
    nav: { home: "Ndap", solutions: "Mahoŋ", pricing: "Mbongo", about: "I niñ", contact: "Tep", login: "Kεl", register: "Tilε", logout: "Yik", dashboard: "Panoo", admin: "Nkwel", parcels: "Hilam", sensors: "Capteurs IoT", drones: "Drones", robots: "Robots", satellites: "Satellites", agribot: "AGRI GENIUS", advancedAnalysis: "Analyse", camera: "Camera IA", irrigation: "Ndik", recommendations: "Mahoŋ IA", marketplace: "Marse", alerts: "Malep", settings: "Lisoŋ", analytics: "Analytics", financial: "Mbongo", accessControl: "Kontrol", database: "Base data" },
    common: { loading: "I yoŋ...", save: "Bεk", cancel: "Yen", delete: "Hôl", edit: "Pεm", add: "Jôk", search: "Soŋ" },
    weather: { title: "Nyu", temperature: "Ngii", humidity: "Ndik", wind: "Mbel" }
  },
  dua: {
    nav: { home: "Ndabo", solutions: "Musango", pricing: "Mbongo", about: "Mba asu", contact: "Busa", login: "Kota", register: "Kwedi", logout: "Buda", dashboard: "Panoo", admin: "Mukala", parcels: "Nja", sensors: "Capteurs IoT", drones: "Drones", robots: "Robots", satellites: "Satellites", agribot: "AGRI GENIUS", advancedAnalysis: "Analyse", camera: "Camera IA", irrigation: "Madiba", recommendations: "Musango IA", marketplace: "Marse", alerts: "Moni", settings: "Musango", analytics: "Analytics", financial: "Mbongo", accessControl: "Kontrol", database: "Base data" },
    common: { loading: "E bwam...", save: "Ja", cancel: "Bwam", delete: "Pola", edit: "Bεngε", add: "Wεya", search: "Sεnga" },
    weather: { title: "Joba", temperature: "Moto", humidity: "Madiba", wind: "Muya" }
  },
  baf: {
    nav: { home: "Nda", solutions: "Nkap", pricing: "Nkap", about: "A si", contact: "Kwa", login: "Ku", register: "Dzε", logout: "Fu", dashboard: "Panoo", admin: "Fo", parcels: "Ntsε", sensors: "Capteurs IoT", drones: "Drones", robots: "Robots", satellites: "Satellites", agribot: "AGRI GENIUS", advancedAnalysis: "Analyse", camera: "Camera IA", irrigation: "Shyε", recommendations: "Nkap IA", marketplace: "Marse", alerts: "Ntam", settings: "Nkap", analytics: "Analytics", financial: "Nkap", accessControl: "Kontrol", database: "Base data" },
    common: { loading: "A gha...", save: "Sεt", cancel: "Gha", delete: "Kwε", edit: "Lεŋ", add: "Pε", search: "Lε" },
    weather: { title: "Mvεt", temperature: "Nkuε", humidity: "Shyε", wind: "Fεfε" }
  },
  ig: {
    nav: { home: "Ulo", solutions: "Ngwota", pricing: "Ego", about: "Maka anyi", contact: "Kpoturu", login: "Banye", register: "Debanye", logout: "Puo", dashboard: "Dashibod", admin: "Nchikwa", parcels: "Ala", sensors: "Ngwaoru IoT", drones: "Drones", robots: "Robots", satellites: "Foto satelaiti", agribot: "AGRI GENIUS", advancedAnalysis: "Nyocha", camera: "Camera AI", irrigation: "Mmiri", recommendations: "Ndumodu AI", marketplace: "Ahia", alerts: "Nkpotu", settings: "Ntọala", analytics: "Nyocha", financial: "Ego", accessControl: "Njikwa", database: "Nchekwa data" },
    common: { loading: "Na-ebu...", save: "Chekwa", cancel: "Kagbuo", delete: "Hichapụ", edit: "Dezie", add: "Tinye", search: "Chọọ" },
    weather: { title: "Ihu igwe", temperature: "Okpomoku", humidity: "Ikuku mmiri", wind: "Ifufe" }
  },
  am: {
    nav: { home: "መነሻ", solutions: "መፍትሄ", pricing: "ዋጋ", about: "ስለ እኛ", contact: "አግኙን", login: "ግባ", register: "ተመዝገብ", logout: "ውጣ", dashboard: "ዳሽቦርድ", admin: "አስተዳዳሪ", parcels: "ማሳ", sensors: "ሴንሰር IoT", drones: "ድሮን", robots: "ሮቦት", satellites: "ሳተላይት", agribot: "AGRI GENIUS", advancedAnalysis: "ትንተና", camera: "ካሜራ AI", irrigation: "መስኖ", recommendations: "ምክር AI", marketplace: "ገበያ", alerts: "ማስጠንቀቂያ", settings: "ቅንብር", analytics: "ትንተና", financial: "ፋይናንስ", accessControl: "ቁጥጥር", database: "ዳታቤዝ" },
    common: { loading: "በመጫን...", save: "አስቀምጥ", cancel: "ሰርዝ", delete: "ሰርዝ", edit: "አርትዕ", add: "ጨምር", search: "ፈልግ" },
    weather: { title: "የአየር ሁኔታ", temperature: "ሙቀት", humidity: "እርጥበት", wind: "ንፋስ" }
  },
  ln: {
    nav: { home: "Ndako", solutions: "Biyano", pricing: "Ntalo", about: "Mpo na biso", contact: "Benga biso", login: "Kota", register: "Komisa nkombo", logout: "Bima", dashboard: "Tableau", admin: "Mokambi", parcels: "Bilanga", sensors: "Capteurs IoT", drones: "Drones", robots: "Robots", satellites: "Satellites", agribot: "AGRI GENIUS", advancedAnalysis: "Analyse", camera: "Camera IA", irrigation: "Mai", recommendations: "Toli IA", marketplace: "Zando", alerts: "Kebisa", settings: "Mibeko", analytics: "Analytics", financial: "Mbongo", accessControl: "Kontrol", database: "Base data" },
    common: { loading: "Ezali ko charger...", save: "Bomba", cancel: "Tika", delete: "Longola", edit: "Bobongola", add: "Bakisa", search: "Luka" },
    weather: { title: "Elanga", temperature: "Molunge", humidity: "Mai", wind: "Mopepe" }
  },
  mg: {
    nav: { home: "Fandraisana", solutions: "Vahaolana", pricing: "Vidiny", about: "Momba anay", contact: "Mifandraisa", login: "Hiditra", register: "Hisoratra", logout: "Hivoaka", dashboard: "Dashboard", admin: "Mpitantana", parcels: "Tanimbary", sensors: "Capteurs IoT", drones: "Drones", robots: "Robots", satellites: "Satellites", agribot: "AGRI GENIUS", advancedAnalysis: "Famakafakana", camera: "Camera IA", irrigation: "Famondrahana", recommendations: "Torohevitra IA", marketplace: "Tsena", alerts: "Fampitandremana", settings: "Fanovana", analytics: "Analytics", financial: "Vola", accessControl: "Kontrol", database: "Base data" },
    common: { loading: "Mamorona...", save: "Tehirizo", cancel: "Hanafoana", delete: "Hamafa", edit: "Hanova", add: "Hanampy", search: "Hitady" },
    weather: { title: "Toetrandro", temperature: "Hafanana", humidity: "Hamandoana", wind: "Rivotra" }
  },
  zu: {
    nav: { home: "Ikhaya", solutions: "Izixazululo", pricing: "Amanani", about: "Mayelana nathi", contact: "Xhumana", login: "Ngena", register: "Bhalisa", logout: "Phuma", dashboard: "Ideshibhodi", admin: "Umlawuli", parcels: "Amasimu", sensors: "Ama-sensor IoT", drones: "Amadrone", robots: "Amarobhothi", satellites: "Amasathelayithi", agribot: "AGRI GENIUS", advancedAnalysis: "Ukuhlaziya", camera: "Ikhamera ye-AI", irrigation: "Ukunisela", recommendations: "Izincomo ze-AI", marketplace: "Imakethe", alerts: "Izexwayiso", settings: "Izilungiselelo", analytics: "Ukuhlaziya", financial: "Izimali", accessControl: "Ukulawula", database: "Idathabheyisi" },
    common: { loading: "Iyalayisha...", save: "Gcina", cancel: "Khansela", delete: "Susa", edit: "Hlela", add: "Engeza", search: "Sesha" },
    weather: { title: "Isimo sezulu", temperature: "Amazinga okushisa", humidity: "Umswakama", wind: "Umoya" }
  }
};

export const supportedLanguages = [
  { code: "fr", name: "Francais", flag: "FR" },
  { code: "en", name: "English", flag: "GB" },
  { code: "es", name: "Espanol", flag: "ES" },
  { code: "de", name: "Deutsch", flag: "DE" },
  { code: "ar", name: "العربية", flag: "SA", rtl: true },
  { code: "zh", name: "中文", flag: "CN" },
  { code: "sw", name: "Kiswahili", flag: "KE" },
  { code: "ha", name: "Hausa", flag: "NG" },
  { code: "yo", name: "Yoruba", flag: "NG" },
  { code: "wo", name: "Wolof", flag: "SN" },
  { code: "bam", name: "Bambara", flag: "ML" },
  { code: "ff", name: "Fulfulde", flag: "CM" },
  { code: "ew", name: "Ewondo", flag: "CM" },
  { code: "bas", name: "Bassa", flag: "CM" },
  { code: "dua", name: "Douala", flag: "CM" },
  { code: "baf", name: "Bafoussam (Ghomala)", flag: "CM" },
  { code: "ig", name: "Igbo", flag: "NG" },
  { code: "am", name: "Amharique", flag: "ET" },
  { code: "ln", name: "Lingala", flag: "CD" },
  { code: "mg", name: "Malagasy", flag: "MG" },
  { code: "zu", name: "Zulu", flag: "ZA" },
];

export default translations;
