"""AGRICAM IA - Documentation Generator
Generates Word documents for development report, user guide, admin guide,
maintenance guide, and architecture document with MCD.
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import os
from datetime import datetime

OUTPUT_DIR = "/app/backend/docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def set_style(doc):
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x33, 0x33, 0x33)

def add_title_page(doc, title, subtitle):
    for _ in range(6):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(title)
    run.bold = True
    run.font.size = Pt(28)
    run.font.color.rgb = RGBColor(0x10, 0xB9, 0x81)
    
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run2 = p2.add_run(subtitle)
    run2.font.size = Pt(14)
    run2.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
    
    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run3 = p3.add_run(f"\nDeveloppe par: Barra Martial Aristide\nAfrican AI Solutions\n{datetime.now().strftime('%d/%m/%Y')}")
    run3.font.size = Pt(10)
    run3.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    doc.add_page_break()

def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0x10, 0xB9, 0x81)
    return h

def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        for p in hdr_cells[i].paragraphs:
            for r in p.runs:
                r.bold = True
    for row_data in rows:
        row_cells = table.add_row().cells
        for i, val in enumerate(row_data):
            row_cells[i].text = str(val)
    return table


def generate_dev_report():
    doc = Document()
    set_style(doc)
    add_title_page(doc, "AGRICAM IA", "Rapport de Developpement\net Technologies Utilisees")
    
    add_heading(doc, "1. Resume du Projet")
    doc.add_paragraph("AGRICAM IA est une plateforme d'agriculture de precision de niveau entreprise, concue pour transformer l'agriculture africaine grace a l'intelligence artificielle, les drones autonomes et les robots connectes. La plateforme permet la detection de maladies, l'optimisation des rendements et la prise de decisions eclairees basees sur des donnees en temps reel.")
    
    add_heading(doc, "2. Architecture Technique")
    add_heading(doc, "2.1 Stack Technologique", 2)
    add_table(doc, ["Composant", "Technologie", "Version"], [
        ["Frontend", "React.js", "18.3.1"],
        ["UI Framework", "Tailwind CSS + Shadcn/UI", "3.4.17"],
        ["Backend", "FastAPI (Python)", "0.115.6"],
        ["Base de donnees", "MongoDB (motor async)", "3.6.0"],
        ["IA / ML", "Google Gemini (emergentintegrations)", "0.1.x"],
        ["Cartographie", "React-Leaflet / OpenStreetMap", "4.2.x"],
        ["Stockage", "Emergent Object Storage", "API"],
        ["Internationalisation", "react-i18next (custom)", "21 langues"],
        ["Authentification", "JWT (PyJWT)", "HS256"],
        ["Serveur ASGI", "Uvicorn", "0.34.0"],
    ])
    
    add_heading(doc, "2.2 Architecture Logicielle", 2)
    doc.add_paragraph("L'application suit une architecture Client-Serveur a 3 niveaux:")
    doc.add_paragraph("- Couche Presentation: SPA React avec routage client (React Router v6)", style='List Bullet')
    doc.add_paragraph("- Couche Metier: API RESTful FastAPI avec endpoints modulaires", style='List Bullet')
    doc.add_paragraph("- Couche Donnees: MongoDB NoSQL avec driver asynchrone motor", style='List Bullet')
    
    add_heading(doc, "3. Fonctionnalites Implementees")
    features = [
        ("Dashboards Multi-Roles", "7 tableaux de bord personnalises (Admin, Agriculteur, Fournisseur, Banque, Analyste, Agronome, Formateur)"),
        ("Camera IA", "Capture en temps reel, detection de maladies, analyse de cultures avec Gemini AI, selection de cameras multiples"),
        ("Carte Agricole Intelligente", "Carte interactive Leaflet avec filtrage par categorie, culture, rayon. Localisation de fournisseurs."),
        ("AGRI GENIUS (Chatbot IA)", "Assistant agricole conversationnel alimente par Gemini, reponses contextuelles, historique de sessions"),
        ("Gestion de Drones", "Interface de pilotage, telemetrie temps reel, planification de missions"),
        ("Controle de Robots", "Modes autonome/manuel, deshierbage, pulverisation, patrouille"),
        ("Marketplace", "Catalogue de produits agricoles avec categories et recherche"),
        ("Systeme de Paiement", "Integration Mobile Money (MTN/Orange), pages succes/echec"),
        ("Formation (E-learning)", "Upload de videos MP4, ebooks PDF, gestion de cours"),
        ("Internationalisation", "21 langues dont 6 completes (FR, EN, ES, DE, AR, ZH), support RTL arabe"),
        ("Personnalisation", "10 themes de couleurs, photo de profil, preferences par utilisateur"),
        ("Securite Admin", "Blocage/deblocage utilisateurs, detection d'intrusion, journaux de securite"),
        ("Donnees Satellite", "Captures programmees, analyse NDVI, suivi parcellaire"),
        ("Irrigation Automatique", "Plans IA, systemes connectes, modes automatique/manuel/semi-auto"),
        ("Export de Donnees", "Export CSV, Excel, PDF depuis les dashboards analytiques"),
    ]
    for name, desc in features:
        add_heading(doc, name, 3)
        doc.add_paragraph(desc)
    
    add_heading(doc, "4. Modele Conceptuel de Donnees (MCD)")
    doc.add_paragraph("Le MCD ci-dessous decrit les entites principales et leurs relations:")
    
    add_heading(doc, "4.1 Entites Principales", 2)
    add_table(doc, ["Entite", "Attributs Cles", "Description"], [
        ["Users", "id, email, password_hash, full_name, phone, role, company_name, subscription_type, is_active, is_verified, theme, language, profile_photo", "Utilisateurs de la plateforme (7 roles)"],
        ["Parcels", "id, user_id, name, coordinates, area, crop_type, status, last_analysis, soil_type", "Parcelles agricoles georeferencees"],
        ["Sensors", "id, parcel_id, type, value, unit, battery, status, last_reading", "Capteurs IoT deployes sur les parcelles"],
        ["Drones", "id, user_id, model, status, battery, coordinates, altitude, mission_id", "Drones autonomes et missions"],
        ["Robots", "id, user_id, model, mode, status, task, battery, coordinates", "Robots agricoles connectes"],
        ["Products", "id, seller_id, name, category, price, quantity, description, image_url", "Produits du marketplace"],
        ["Orders", "id, buyer_id, seller_id, products, total, status, payment_method", "Commandes et transactions"],
        ["Trainings", "id, trainer_id, title, description, category, level, price, video_url, duration", "Cours de formation"],
        ["Ebooks", "id, trainer_id, title, description, price, file_url, pages", "Livres numeriques agricoles"],
        ["Suppliers", "id, name, category, coordinates, address, phone, cultures, description", "Fournisseurs sur la carte"],
        ["ChatSessions", "id, user_id, messages[], model, created_at", "Sessions de conversation AGRI GENIUS"],
        ["CameraScans", "id, user_id, mode, result{}, model, image_url, created_at", "Analyses par Camera IA"],
        ["SecurityLogs", "id, user_id, action, ip_address, details, timestamp", "Journaux de securite"],
        ["Payments", "id, user_id, amount, operator, phone, status, transaction_id, plan", "Paiements Mobile Money"],
        ["Alerts", "id, user_id, type, message, severity, is_read, created_at", "Alertes systeme et meteo"],
    ])
    
    add_heading(doc, "4.2 Relations", 2)
    relations = [
        "Users (1) ---> (N) Parcels : Un utilisateur possede plusieurs parcelles",
        "Users (1) ---> (N) Drones : Un utilisateur gere plusieurs drones",
        "Users (1) ---> (N) Robots : Un utilisateur controle plusieurs robots",
        "Users (1) ---> (N) Products : Un fournisseur vend plusieurs produits",
        "Users (1) ---> (N) Orders : Un utilisateur fait plusieurs commandes",
        "Users (1) ---> (N) ChatSessions : Un utilisateur a plusieurs sessions IA",
        "Users (1) ---> (N) CameraScans : Un utilisateur fait plusieurs scans",
        "Users (1) ---> (N) Trainings : Un formateur cree plusieurs cours",
        "Users (1) ---> (N) SecurityLogs : Chaque action est journalisee",
        "Parcels (1) ---> (N) Sensors : Une parcelle a plusieurs capteurs",
        "Parcels (1) ---> (N) Alerts : Une parcelle peut generer des alertes",
    ]
    for r in relations:
        doc.add_paragraph(r, style='List Bullet')
    
    add_heading(doc, "5. APIs Principales")
    add_table(doc, ["Methode", "Endpoint", "Description"], [
        ["POST", "/api/auth/login", "Authentification utilisateur"],
        ["POST", "/api/auth/register", "Inscription nouvel utilisateur"],
        ["GET", "/api/admin/users", "Liste des utilisateurs (admin)"],
        ["PUT", "/api/admin/users/{id}/block", "Bloquer un utilisateur"],
        ["POST", "/api/agribot/chat", "Envoyer un message a AGRI GENIUS"],
        ["POST", "/api/camera/analyze", "Analyser une image par Camera IA"],
        ["GET", "/api/map/suppliers", "Rechercher des fournisseurs sur la carte"],
        ["POST", "/api/trainer/trainings", "Creer un cours de formation"],
        ["POST", "/api/trainer/trainings/{id}/upload-video", "Uploader une video MP4"],
        ["PUT", "/api/user/update-profile", "Mettre a jour le profil utilisateur"],
        ["PUT", "/api/user/change-password", "Changer le mot de passe"],
        ["POST", "/api/payments/mobile-money", "Initier un paiement Mobile Money"],
        ["GET", "/api/weather", "Donnees meteo en temps reel"],
    ])
    
    add_heading(doc, "6. Securite")
    doc.add_paragraph("- Authentification JWT avec tokens expires\n- Hachage bcrypt des mots de passe\n- CORS configure pour les origines autorisees\n- Validation des donnees via Pydantic\n- Protection CSRF et XSS\n- Journalisation complete des actions de securite\n- Blocage automatique des comptes suspects")
    
    add_heading(doc, "7. Performance")
    doc.add_paragraph("- Cache TTL pour les reponses IA (5000 entrees, 24h)\n- Requetes MongoDB asynchrones (motor)\n- Compression des images avant analyse\n- Lazy loading des composants React\n- Code splitting automatique par route")
    
    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Rapport_Developpement.docx")
    doc.save(path)
    return path


def generate_user_guide():
    doc = Document()
    set_style(doc)
    add_title_page(doc, "AGRICAM IA", "Guide Utilisateur")
    
    add_heading(doc, "1. Introduction")
    doc.add_paragraph("Bienvenue sur AGRICAM IA, votre plateforme d'agriculture de precision. Ce guide vous accompagne dans l'utilisation de toutes les fonctionnalites disponibles.")
    
    add_heading(doc, "2. Premiers Pas")
    add_heading(doc, "2.1 Connexion", 2)
    doc.add_paragraph("1. Rendez-vous sur la page de connexion\n2. Entrez votre email et mot de passe\n3. Cliquez sur 'Se connecter'\n4. Vous serez redirige vers votre tableau de bord personnalise")
    
    add_heading(doc, "2.2 Changer de Langue", 2)
    doc.add_paragraph("1. Cliquez sur l'icone globe dans la barre superieure\n2. Selectionnez votre langue parmi les 21 disponibles\n3. L'interface se met a jour instantanement\n4. Pour l'arabe, le layout passe automatiquement en droite-a-gauche (RTL)")
    
    add_heading(doc, "3. Tableau de Bord")
    doc.add_paragraph("Votre tableau de bord affiche un resume de vos activites agricoles:\n- Parcelles actives et leur etat\n- Conditions meteorologiques actuelles\n- Alertes recentes (irrigation, maladies, meteo)\n- Statistiques de rendement")
    
    add_heading(doc, "4. Camera IA")
    add_heading(doc, "4.1 Demarrer la Camera", 2)
    doc.add_paragraph("1. Allez dans le menu 'Camera IA'\n2. Cliquez sur 'Autoriser la Camera' pour donner l'acces\n3. La camera se demarre automatiquement\n4. Si vous avez plusieurs cameras, utilisez le selecteur en haut a droite")
    
    add_heading(doc, "4.2 Analyser une Culture", 2)
    doc.add_paragraph("1. Pointez la camera vers la plante a analyser\n2. Selectionnez le mode d'analyse (General, Maladies, Nutrition, Hydratation, Croissance)\n3. Appuyez sur le bouton central vert pour capturer et analyser\n4. Le resultat s'affiche avec: etat de sante, confiance, detections et recommandations\n5. Vous pouvez aussi importer une photo depuis votre galerie")
    
    add_heading(doc, "5. AGRI GENIUS (Assistant IA)")
    doc.add_paragraph("1. Accedez a AGRI GENIUS depuis le menu\n2. Tapez votre question dans la zone de texte\n3. L'IA repond avec des conseils agricoles personnalises\n4. Exemples de questions:\n   - 'Comment traiter la rouille du ble?'\n   - 'Quel est le meilleur moment pour semer le mais au Cameroun?'\n   - 'Comment ameliorer la fertilite de mon sol?'")
    
    add_heading(doc, "6. Carte Agricole")
    doc.add_paragraph("1. Ouvrez 'Carte Agricole' depuis le menu\n2. La carte affiche les fournisseurs autour de vous\n3. Filtrez par categorie (semences, engrais, equipement)\n4. Filtrez par culture (mais, cacao, cafe, etc.)\n5. Cliquez sur un marqueur pour voir les details\n6. Utilisez les boutons WhatsApp, Appeler ou Itineraire")
    
    add_heading(doc, "7. Gestion des Parcelles")
    doc.add_paragraph("1. Ajoutez vos parcelles avec leurs coordonnees\n2. Associez des capteurs IoT a chaque parcelle\n3. Suivez la sante de vos cultures en temps reel\n4. Recevez des alertes automatiques")
    
    add_heading(doc, "8. Drones et Robots")
    doc.add_paragraph("Drones:\n- Planifiez des missions de survol\n- Capturez des images aeriens\n- Analysez les donnees NDVI\n\nRobots:\n- Controlez en mode manuel ou autonome\n- Programmez des taches (deshierbage, pulverisation)\n- Suivez la telemetrie en temps reel")
    
    add_heading(doc, "9. Personnalisation")
    doc.add_paragraph("Allez dans Parametres pour:\n- Changer votre theme (10 palettes de couleurs)\n- Uploader votre photo de profil\n- Modifier votre mot de passe\n- Configurer vos preferences de notifications\n- Choisir votre langue preferee")
    
    add_heading(doc, "10. Marketplace")
    doc.add_paragraph("- Parcourez les produits agricoles\n- Filtrez par categorie (semences, engrais, equipement, phytosanitaires)\n- Contactez les vendeurs\n- Passez des commandes securisees")
    
    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Guide_Utilisateur.docx")
    doc.save(path)
    return path


def generate_admin_guide():
    doc = Document()
    set_style(doc)
    add_title_page(doc, "AGRICAM IA", "Guide Administrateur")
    
    add_heading(doc, "1. Acces Administrateur")
    doc.add_paragraph("Compte admin par defaut: admin@agricam.ai\nL'administrateur a acces a toutes les fonctionnalites de la plateforme plus des outils de gestion avances.")
    
    add_heading(doc, "2. Tableau de Bord Admin")
    doc.add_paragraph("Le dashboard admin affiche:\n- Nombre total d'utilisateurs et utilisateurs actifs\n- Revenus mensuels et tendances\n- Sante de la plateforme (uptime, temps de reponse, taux d'erreur)\n- Metriques systeme (CPU, memoire, API)")
    
    add_heading(doc, "3. Gestion des Utilisateurs")
    add_heading(doc, "3.1 Consulter les Utilisateurs", 2)
    doc.add_paragraph("1. Naviguez vers le dashboard admin\n2. La liste des utilisateurs affiche: nom, email, role, statut, date d'inscription\n3. Utilisez la barre de recherche pour filtrer\n4. Les roles disponibles: admin, farmer, supplier, bank, seed_analyst, agronomist, trainer")
    
    add_heading(doc, "3.2 Bloquer/Debloquer", 2)
    doc.add_paragraph("1. Identifiez l'utilisateur a bloquer\n2. Cliquez sur le bouton 'Bloquer'\n3. L'utilisateur ne pourra plus se connecter\n4. Un journal de securite est genere automatiquement\n5. Pour debloquer, cliquez sur 'Debloquer'")
    
    add_heading(doc, "4. Securite")
    doc.add_paragraph("Le panneau de securite affiche:\n- Tentatives de connexion echouees\n- Activites suspectes detectees\n- Utilisateurs bloques\n- Derniers evenements de securite\n\nProtections actives:\n- Chiffrement des mots de passe (bcrypt)\n- Tokens JWT expires\n- Validation des entrees\n- Protection CORS\n- Detection d'anomalies")
    
    add_heading(doc, "5. Analytiques et Export")
    doc.add_paragraph("1. Accedez aux analytiques depuis le menu admin\n2. Consultez les graphiques de revenus, inscriptions, utilisation\n3. Exportez les donnees en CSV, Excel ou PDF\n4. Planifiez des rapports automatiques")
    
    add_heading(doc, "6. Gestion du Contenu")
    doc.add_paragraph("- Moderez les produits du marketplace\n- Approuvez les nouveaux fournisseurs\n- Gerez les cours de formation\n- Surveillez les sessions AGRI GENIUS")
    
    add_heading(doc, "7. Parametres Systeme")
    doc.add_paragraph("- Configuration des notifications\n- Gestion des plans d'abonnement\n- Configuration des limites API\n- Personnalisation de la plateforme")
    
    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Guide_Administrateur.docx")
    doc.save(path)
    return path


def generate_maintenance_guide():
    doc = Document()
    set_style(doc)
    add_title_page(doc, "AGRICAM IA", "Guide de Maintenance")
    
    add_heading(doc, "1. Architecture de Deploiement")
    doc.add_paragraph("L'application est deployee dans un conteneur Kubernetes avec:")
    doc.add_paragraph("- Frontend: React (port 3000) servi par webpack-dev-server", style='List Bullet')
    doc.add_paragraph("- Backend: FastAPI (port 8001) servi par Uvicorn avec hot-reload", style='List Bullet')
    doc.add_paragraph("- Base de donnees: MongoDB locale", style='List Bullet')
    doc.add_paragraph("- Proxy: Ingress Kubernetes avec routage /api -> backend", style='List Bullet')
    doc.add_paragraph("- Supervision: supervisord pour la gestion des processus", style='List Bullet')
    
    add_heading(doc, "2. Structure des Fichiers")
    doc.add_paragraph("/app/\n  backend/\n    server.py          # Serveur principal FastAPI\n    routes/\n      trainer.py       # Routes formateur\n    storage.py         # Gestion stockage objets\n    requirements.txt   # Dependances Python\n    .env               # Variables d'environnement\n  frontend/\n    src/\n      App.js           # Composant racine React\n      components/       # Composants reutilisables\n        Layout.jsx      # Layout principal + navigation\n        ui/             # Composants Shadcn/UI\n      pages/            # Pages de l'application\n      contexts/         # Contextes React (Language, Auth)\n      locales/          # Fichiers de traduction\n      services/         # Services API\n    package.json       # Dependances Node.js\n    .env               # URL backend")
    
    add_heading(doc, "3. Variables d'Environnement")
    add_heading(doc, "3.1 Backend (.env)", 2)
    add_table(doc, ["Variable", "Description"], [
        ["MONGO_URL", "URL de connexion MongoDB"],
        ["DB_NAME", "Nom de la base de donnees"],
        ["JWT_SECRET", "Cle secrete pour les tokens JWT"],
        ["GEMINI_API_KEY", "Cle API Google Gemini pour l'IA"],
        ["OPENWEATHER_API_KEY", "Cle API OpenWeatherMap"],
        ["STORAGE_BUCKET", "Bucket de stockage objets"],
    ])
    
    add_heading(doc, "3.2 Frontend (.env)", 2)
    add_table(doc, ["Variable", "Description"], [
        ["REACT_APP_BACKEND_URL", "URL du backend (production)"],
        ["WDS_SOCKET_PORT", "Port WebSocket (443 pour HTTPS)"],
    ])
    
    add_heading(doc, "4. Commandes de Maintenance")
    add_table(doc, ["Commande", "Description"], [
        ["sudo supervisorctl status", "Verifier l'etat des services"],
        ["sudo supervisorctl restart backend", "Redemarrer le backend"],
        ["sudo supervisorctl restart frontend", "Redemarrer le frontend"],
        ["tail -f /var/log/supervisor/backend.err.log", "Voir les logs backend"],
        ["tail -f /var/log/supervisor/frontend.err.log", "Voir les logs frontend"],
        ["curl http://localhost:8001/api/health", "Verifier la sante du backend"],
        ["mongosh", "Acces a la console MongoDB"],
    ])
    
    add_heading(doc, "5. Base de Donnees")
    add_heading(doc, "5.1 Collections MongoDB", 2)
    add_table(doc, ["Collection", "Description", "Index"], [
        ["users", "Comptes utilisateurs", "email (unique), role"],
        ["parcels", "Parcelles agricoles", "user_id, coordinates (2dsphere)"],
        ["sensors", "Capteurs IoT", "parcel_id, type"],
        ["drones", "Drones et missions", "user_id, status"],
        ["robots", "Robots agricoles", "user_id, status"],
        ["products", "Produits marketplace", "seller_id, category"],
        ["orders", "Commandes", "buyer_id, seller_id"],
        ["trainings", "Cours de formation", "trainer_id"],
        ["ebooks", "Livres numeriques", "trainer_id"],
        ["suppliers", "Fournisseurs carte", "coordinates (2dsphere)"],
        ["chat_sessions", "Sessions AGRI GENIUS", "user_id"],
        ["camera_scans", "Scans Camera IA", "user_id"],
        ["security_logs", "Journaux securite", "user_id, timestamp"],
        ["payments", "Paiements", "user_id, status"],
        ["alerts", "Alertes", "user_id, is_read"],
    ])
    
    add_heading(doc, "5.2 Sauvegarde", 2)
    doc.add_paragraph("mongodump --uri=\"$MONGO_URL\" --db=\"$DB_NAME\" --out=/backup/$(date +%Y%m%d)\nmongorestore --uri=\"$MONGO_URL\" --db=\"$DB_NAME\" /backup/YYYYMMDD/$DB_NAME/")
    
    add_heading(doc, "6. Mise a Jour")
    doc.add_paragraph("Backend:\n1. pip install -r requirements.txt\n2. sudo supervisorctl restart backend\n\nFrontend:\n1. cd /app/frontend && yarn install\n2. sudo supervisorctl restart frontend")
    
    add_heading(doc, "7. Depannage")
    add_table(doc, ["Probleme", "Solution"], [
        ["Backend ne demarre pas", "Verifier les logs: tail -f /var/log/supervisor/backend.err.log"],
        ["Frontend page blanche", "Verifier la console navigateur et les logs frontend"],
        ["MongoDB connexion echouee", "Verifier MONGO_URL dans .env et que mongod est actif"],
        ["Erreur 401 Unauthorized", "Le token JWT a expire, reconnectez-vous"],
        ["Camera IA ne fonctionne pas", "Verifier les permissions camera dans le navigateur (HTTPS requis)"],
        ["IA lente", "Verifier le cache agribot_cache, augmenter le TTL si necessaire"],
    ])
    
    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Guide_Maintenance.docx")
    doc.save(path)
    return path


def generate_all():
    paths = []
    paths.append(generate_dev_report())
    paths.append(generate_user_guide())
    paths.append(generate_admin_guide())
    paths.append(generate_maintenance_guide())
    return paths


if __name__ == "__main__":
    files = generate_all()
    for f in files:
        print(f"Generated: {f}")
