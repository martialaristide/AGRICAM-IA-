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
      info: "Information"
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
      mustAcceptTerms: "Vous devez accepter les conditions"
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
        scalingRecommendation: "Recommandation de mise a l'echelle"
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
      info: "Information"
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
      mustAcceptTerms: "You must accept the terms"
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
      home: "Inicio",
      solutions: "Soluciones",
      pricing: "Precios",
      about: "Acerca de",
      contact: "Contacto",
      login: "Iniciar sesión",
      register: "Registrarse",
      logout: "Cerrar sesión",
      dashboard: "Panel",
      parcels: "Parcelas",
      sensors: "Sensores IoT",
      drones: "Gestión de Drones",
      robots: "Control de Robots",
      satellites: "Imágenes Satelitales",
      agribot: "AGRI GENIUS",
      camera: "Cámara IA",
      irrigation: "Riego Automático",
      recommendations: "Recomendaciones IA",
      marketplace: "Mercado",
      alerts: "Alertas",
      settings: "Configuración",
      analytics: "Analíticas",
      elearning: "Formación"
    },
    common: {
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      add: "Agregar",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      import: "Importar",
      refresh: "Actualizar",
      close: "Cerrar",
      confirm: "Confirmar",
      yes: "Sí",
      no: "No",
      back: "Atrás",
      next: "Siguiente",
      previous: "Anterior",
      submit: "Enviar",
      success: "Éxito",
      error: "Error",
      warning: "Advertencia",
      info: "Información"
    },
    weather: {
      title: "Clima",
      temperature: "Temperatura",
      humidity: "Humedad",
      wind: "Viento",
      pressure: "Presión",
      visibility: "Visibilidad",
      sunrise: "Amanecer",
      sunset: "Atardecer",
      forecast: "Pronóstico",
      feelsLike: "Sensación térmica"
    }
  },
  
  de: {
    nav: {
      home: "Startseite",
      solutions: "Lösungen",
      pricing: "Preise",
      about: "Über uns",
      contact: "Kontakt",
      login: "Anmelden",
      register: "Registrieren",
      logout: "Abmelden",
      dashboard: "Dashboard",
      parcels: "Parzellen",
      sensors: "IoT-Sensoren",
      drones: "Drohnenverwaltung",
      robots: "Robotersteuerung"
    },
    common: {
      loading: "Laden...",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      add: "Hinzufügen",
      search: "Suchen"
    },
    weather: {
      title: "Wetter",
      temperature: "Temperatur",
      humidity: "Feuchtigkeit",
      wind: "Wind"
    }
  },
  
  ar: {
    nav: {
      home: "الرئيسية",
      solutions: "الحلول",
      pricing: "الأسعار",
      about: "من نحن",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      parcels: "القطع",
      sensors: "أجهزة الاستشعار",
      drones: "إدارة الطائرات",
      robots: "التحكم في الروبوتات"
    },
    common: {
      loading: "جاري التحميل...",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      search: "بحث"
    },
    weather: {
      title: "الطقس",
      temperature: "درجة الحرارة",
      humidity: "الرطوبة",
      wind: "الرياح"
    }
  },
  
  zh: {
    nav: {
      home: "首页",
      solutions: "解决方案",
      pricing: "价格",
      about: "关于我们",
      contact: "联系我们",
      login: "登录",
      register: "注册",
      logout: "退出",
      dashboard: "仪表板",
      parcels: "地块",
      sensors: "物联网传感器",
      drones: "无人机管理",
      robots: "机器人控制"
    },
    common: {
      loading: "加载中...",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      search: "搜索"
    },
    weather: {
      title: "天气",
      temperature: "温度",
      humidity: "湿度",
      wind: "风速"
    }
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
