"""AGRICAM IA - Documentation Generator
Generates Word documents with professional cover pages.
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import os
from datetime import datetime

OUTPUT_DIR = "/app/backend/docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

EMERALD = RGBColor(0x10, 0xB9, 0x81)
DARK = RGBColor(0x0F, 0x17, 0x2A)
SLATE = RGBColor(0x64, 0x74, 0x8B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_BG = RGBColor(0xF1, 0xF5, 0xF9)

def set_cell_bg(cell, color_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def set_style(doc):
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x33, 0x33, 0x33)
    pf = style.paragraph_format
    pf.space_after = Pt(6)
    pf.line_spacing = 1.15

def add_cover_page(doc, title, subtitle, doc_type=""):
    """Professional cover page with colored header band and structured layout."""
    section = doc.sections[0]
    section.top_margin = Cm(0)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

    # Top green band
    p_band = doc.add_paragraph()
    p_band.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_band = p_band.add_run("\n\n\n")
    run_band.font.size = Pt(40)

    # Company name
    p_company = doc.add_paragraph()
    p_company.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_c = p_company.add_run("AFRICAN AI SOLUTIONS")
    run_c.bold = True
    run_c.font.size = Pt(14)
    run_c.font.color.rgb = SLATE
    run_c.font.name = 'Calibri'
    p_company.paragraph_format.space_after = Pt(4)

    # Horizontal line
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_line = p_line.add_run("_" * 60)
    run_line.font.color.rgb = EMERALD
    run_line.font.size = Pt(12)

    # Spacer
    for _ in range(3):
        doc.add_paragraph()

    # Main title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_t = p_title.add_run("AGRICAM IA")
    run_t.bold = True
    run_t.font.size = Pt(42)
    run_t.font.color.rgb = DARK
    run_t.font.name = 'Calibri'

    # Green accent bar
    p_accent = doc.add_paragraph()
    p_accent.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_a = p_accent.add_run("____________________")
    run_a.font.color.rgb = EMERALD
    run_a.font.size = Pt(18)
    run_a.bold = True
    p_accent.paragraph_format.space_after = Pt(12)

    # Subtitle / Doc type
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_s = p_sub.add_run(title)
    run_s.bold = True
    run_s.font.size = Pt(24)
    run_s.font.color.rgb = EMERALD
    run_s.font.name = 'Calibri'
    p_sub.paragraph_format.space_after = Pt(8)

    if subtitle:
        p_sub2 = doc.add_paragraph()
        p_sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_s2 = p_sub2.add_run(subtitle)
        run_s2.font.size = Pt(13)
        run_s2.font.color.rgb = SLATE
        run_s2.font.name = 'Calibri'

    # Spacer
    for _ in range(4):
        doc.add_paragraph()

    # Info box
    info_table = doc.add_table(rows=5, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_data = [
        ("Version", "3.0"),
        ("Date", datetime.now().strftime("%d/%m/%Y")),
        ("Auteur", "Barra Martial Aristide"),
        ("Organisation", "African AI Solutions"),
        ("Classification", "Confidentiel"),
    ]
    for i, (label, value) in enumerate(info_data):
        cell_l = info_table.rows[i].cells[0]
        cell_v = info_table.rows[i].cells[1]
        cell_l.text = label
        cell_v.text = value
        for p in cell_l.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(10)
                r.font.color.rgb = DARK
        for p in cell_v.paragraphs:
            for r in p.runs:
                r.font.size = Pt(10)
                r.font.color.rgb = SLATE

    doc.add_page_break()

    # Reset margins for content
    new_section = doc.add_section()
    new_section.top_margin = Cm(2.5)
    new_section.left_margin = Cm(2.5)
    new_section.right_margin = Cm(2.5)

def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = EMERALD if level == 1 else DARK
    return h

def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_bg(hdr_cells[i], "10B981")
        for p in hdr_cells[i].paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.color.rgb = WHITE
                r.font.size = Pt(10)
    for row_data in rows:
        row_cells = table.add_row().cells
        for i, val in enumerate(row_data):
            row_cells[i].text = str(val)
            for p in row_cells[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(10)
    doc.add_paragraph()
    return table

def add_toc_page(doc, sections):
    """Add a table of contents page."""
    add_heading(doc, "Table des Matieres", 1)
    for i, (num, title) in enumerate(sections):
        p = doc.add_paragraph()
        run = p.add_run(f"{num}  {title}")
        run.font.size = Pt(12)
        run.font.color.rgb = DARK if not title.startswith("  ") else SLATE
        if not title.startswith("  "):
            run.bold = True
        p.paragraph_format.space_after = Pt(4)
    doc.add_page_break()


def generate_dev_report():
    doc = Document()
    set_style(doc)
    add_cover_page(doc, "Rapport de Developpement", "Architecture, Technologies et Modele Conceptuel de Donnees")

    toc = [
        ("1.", "Resume du Projet"), ("2.", "Architecture Technique"),
        ("", "  2.1 Stack Technologique"), ("", "  2.2 Architecture Logicielle"),
        ("3.", "Fonctionnalites Implementees"), ("4.", "Modele Conceptuel de Donnees (MCD)"),
        ("", "  4.1 Entites Principales"), ("", "  4.2 Relations"),
        ("5.", "APIs Principales"), ("6.", "Securite"), ("7.", "Performance"),
        ("8.", "Internationalisation"), ("9.", "Deploiement")
    ]
    add_toc_page(doc, toc)

    add_heading(doc, "1. Resume du Projet")
    doc.add_paragraph("AGRICAM IA est une plateforme d'agriculture de precision de niveau entreprise, concue pour transformer l'agriculture africaine grace a l'intelligence artificielle, les drones autonomes et les robots connectes. La plateforme permet la detection de maladies, l'optimisation des rendements et la prise de decisions eclairees basees sur des donnees en temps reel.")
    doc.add_paragraph("Le projet cible 7 types d'utilisateurs: Administrateur, Agriculteur, Fournisseur, Banque, Analyste de semences, Agronome et Formateur. Chaque role dispose d'un tableau de bord personnalise avec des fonctionnalites specifiques.")

    add_heading(doc, "2. Architecture Technique")
    add_heading(doc, "2.1 Stack Technologique", 2)
    add_table(doc, ["Composant", "Technologie", "Version"], [
        ["Frontend", "React.js", "18.3.1"],
        ["UI Framework", "Tailwind CSS + Shadcn/UI", "3.4.17"],
        ["Backend", "FastAPI (Python)", "0.115.6"],
        ["Base de donnees", "MongoDB (motor async)", "3.6.0"],
        ["IA / ML", "Google Gemini (emergentintegrations)", "Latest"],
        ["Cartographie", "React-Leaflet / OpenStreetMap", "4.2.x"],
        ["Stockage", "Emergent Object Storage", "API"],
        ["Internationalisation", "react-i18next (custom)", "21 langues"],
        ["Authentification", "JWT (PyJWT)", "HS256"],
        ["Documentation", "python-docx", "1.1.x"],
    ])

    add_heading(doc, "2.2 Architecture Logicielle", 2)
    doc.add_paragraph("L'application suit une architecture Client-Serveur a 3 niveaux:")
    doc.add_paragraph("Couche Presentation: SPA React avec routage client (React Router v6), composants Shadcn/UI, et support RTL pour l'arabe", style='List Bullet')
    doc.add_paragraph("Couche Metier: API RESTful FastAPI avec endpoints modulaires, cache IA TTL, et gestion asynchrone", style='List Bullet')
    doc.add_paragraph("Couche Donnees: MongoDB NoSQL avec driver asynchrone motor, indexes geospatiaux et texte", style='List Bullet')

    add_heading(doc, "3. Fonctionnalites Implementees")
    features = [
        ("Dashboards Multi-Roles", "7 tableaux de bord personnalises (Admin, Agriculteur, Fournisseur, Banque, Analyste, Agronome, Formateur) avec metriques temps reel"),
        ("Camera IA", "Capture en temps reel, detection de maladies, analyse de cultures avec Gemini AI, selection de cameras multiples, modes d'analyse avances"),
        ("Carte Agricole Intelligente", "Carte interactive Leaflet avec filtrage par categorie, culture, rayon. Localisation de fournisseurs, itineraires et contact direct"),
        ("AGRI GENIUS (Chatbot IA)", "Assistant agricole conversationnel alimente par Gemini, reponses contextuelles, historique de sessions, sans limite de quota"),
        ("Gestion de Drones", "Interface de pilotage, telemetrie temps reel, planification de missions, capture multispectrale"),
        ("Controle de Robots", "Modes autonome/manuel, desherbage, pulverisation, patrouille, reconstruction LIDAR 3D"),
        ("Marketplace", "Catalogue de produits agricoles avec categories, recherche et systeme de commande"),
        ("Systeme de Paiement", "Integration Mobile Money (MTN/Orange), pages succes/echec, historique"),
        ("Formation (E-learning)", "Upload de videos MP4, ebooks PDF, gestion de cours par les formateurs"),
        ("Internationalisation", "21 langues dont 15 langues africaines/camerounaises, support RTL arabe complet"),
        ("Personnalisation", "10+ themes de couleurs par utilisateur, photo de profil, preferences persistantes"),
        ("Securite Admin", "Blocage/deblocage utilisateurs, detection d'intrusion, journaux de securite"),
        ("Images Satellites", "Captures programmees, analyse NDVI, suivi parcellaire multispectral"),
        ("Irrigation Automatique", "Plans IA, systemes connectes, modes auto/manuel/semi-auto"),
        ("Export de Donnees", "Export CSV, Excel, PDF depuis les dashboards analytiques"),
        ("Documentation", "Generation automatique de rapports Word, telechargement in-app"),
    ]
    for name, desc in features:
        add_heading(doc, name, 3)
        doc.add_paragraph(desc)

    add_heading(doc, "4. Modele Conceptuel de Donnees (MCD)")
    add_heading(doc, "4.1 Entites Principales", 2)
    add_table(doc, ["Entite", "Attributs Cles", "Description"], [
        ["Users", "id, email, password_hash, full_name, phone, role, subscription_type, is_active, theme, language, profile_photo", "Utilisateurs (7 roles)"],
        ["Parcels", "id, user_id, name, coordinates, area, crop_type, status, soil_type", "Parcelles georeferencees"],
        ["Sensors", "id, parcel_id, type, value, unit, battery, status", "Capteurs IoT"],
        ["Drones", "id, user_id, model, status, battery, coordinates, altitude", "Drones autonomes"],
        ["Robots", "id, user_id, model, mode, status, task, battery", "Robots agricoles"],
        ["Products", "id, seller_id, name, category, price, quantity", "Produits marketplace"],
        ["Orders", "id, buyer_id, seller_id, products, total, status", "Commandes"],
        ["Trainings", "id, trainer_id, title, category, level, price, video_url", "Cours de formation"],
        ["Ebooks", "id, trainer_id, title, price, file_url, pages", "Livres numeriques"],
        ["Suppliers", "id, name, category, coordinates, address, phone, cultures", "Fournisseurs carte"],
        ["ChatSessions", "id, user_id, messages[], model", "Sessions AGRI GENIUS"],
        ["CameraScans", "id, user_id, mode, result{}, image_url", "Analyses Camera IA"],
        ["SecurityLogs", "id, user_id, action, ip_address, details", "Journaux securite"],
        ["Payments", "id, user_id, amount, operator, phone, status", "Paiements Mobile Money"],
        ["Alerts", "id, user_id, type, message, severity, is_read", "Alertes systeme"],
    ])

    add_heading(doc, "4.2 Relations", 2)
    relations = [
        "Users (1) --> (N) Parcels : Un utilisateur possede plusieurs parcelles",
        "Users (1) --> (N) Drones : Un utilisateur gere plusieurs drones",
        "Users (1) --> (N) Robots : Un utilisateur controle plusieurs robots",
        "Users (1) --> (N) Products : Un fournisseur vend plusieurs produits",
        "Users (1) --> (N) Orders : Un utilisateur fait plusieurs commandes",
        "Users (1) --> (N) ChatSessions : Un utilisateur a plusieurs sessions IA",
        "Users (1) --> (N) CameraScans : Un utilisateur fait plusieurs scans",
        "Users (1) --> (N) Trainings : Un formateur cree plusieurs cours",
        "Parcels (1) --> (N) Sensors : Une parcelle a plusieurs capteurs",
        "Parcels (1) --> (N) Alerts : Une parcelle peut generer des alertes",
    ]
    for r in relations:
        doc.add_paragraph(r, style='List Bullet')

    add_heading(doc, "5. APIs Principales")
    add_table(doc, ["Methode", "Endpoint", "Description"], [
        ["POST", "/api/auth/login", "Authentification"],
        ["POST", "/api/auth/register", "Inscription"],
        ["GET", "/api/admin/users", "Liste utilisateurs"],
        ["PUT", "/api/admin/users/{id}/block", "Bloquer utilisateur"],
        ["POST", "/api/agribot/chat", "AGRI GENIUS chat"],
        ["POST", "/api/camera/analyze", "Analyse Camera IA"],
        ["GET", "/api/map/suppliers", "Fournisseurs carte"],
        ["POST", "/api/trainer/trainings", "Creer formation"],
        ["POST", "/api/trainer/trainings/{id}/upload-video", "Upload video MP4"],
        ["PUT", "/api/user/update-profile", "Mise a jour profil"],
        ["PUT", "/api/user/change-password", "Changement mot de passe"],
        ["GET", "/api/docs/list", "Liste documents"],
        ["GET", "/api/docs/download/{file}", "Telecharger document"],
    ])

    add_heading(doc, "6. Securite")
    doc.add_paragraph("Authentification JWT avec tokens expires (24h)")
    doc.add_paragraph("Hachage bcrypt des mots de passe (salage automatique)")
    doc.add_paragraph("CORS configure pour les origines autorisees")
    doc.add_paragraph("Validation des donnees via Pydantic (schemas stricts)")
    doc.add_paragraph("Journalisation complete des actions de securite")
    doc.add_paragraph("Blocage automatique des comptes suspects")

    add_heading(doc, "7. Performance")
    doc.add_paragraph("Cache TTL pour les reponses IA (5000 entrees, 24h)")
    doc.add_paragraph("Requetes MongoDB asynchrones (motor)")
    doc.add_paragraph("Compression des images avant analyse IA")
    doc.add_paragraph("Lazy loading des composants React")
    doc.add_paragraph("Code splitting automatique par route")

    add_heading(doc, "8. Internationalisation")
    doc.add_paragraph("21 langues supportees dont 6 langues principales (FR, EN, ES, DE, AR, ZH) et 15 langues africaines/camerounaises (SW, HA, YO, WO, BAM, FF, EW, BAS, DUA, BAF, IG, AM, LN, MG, ZU). Support complet RTL pour l'arabe avec inversion automatique du layout.")

    add_heading(doc, "9. Deploiement")
    doc.add_paragraph("Conteneur Kubernetes avec supervisord pour la gestion des processus. Frontend sur port 3000 (React), backend sur port 8001 (Uvicorn/FastAPI), base MongoDB locale. Hot-reload active pour le developpement. Ingress Kubernetes avec prefixe /api pour le routage.")

    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Rapport_Developpement.docx")
    doc.save(path)
    return path


def generate_user_guide():
    doc = Document()
    set_style(doc)
    add_cover_page(doc, "Guide Utilisateur", "Manuel d'utilisation complet de la plateforme")

    toc = [
        ("1.", "Introduction"), ("2.", "Premiers Pas"),
        ("", "  2.1 Connexion"), ("", "  2.2 Changer de Langue"),
        ("3.", "Tableau de Bord"), ("4.", "Camera IA"),
        ("5.", "AGRI GENIUS"), ("6.", "Carte Agricole"),
        ("7.", "Gestion des Parcelles"), ("8.", "Drones et Robots"),
        ("9.", "Personnalisation"), ("10.", "Marketplace"),
    ]
    add_toc_page(doc, toc)

    add_heading(doc, "1. Introduction")
    doc.add_paragraph("Bienvenue sur AGRICAM IA, votre plateforme d'agriculture de precision. Ce guide vous accompagne dans l'utilisation de toutes les fonctionnalites disponibles pour optimiser votre exploitation agricole.")

    add_heading(doc, "2. Premiers Pas")
    add_heading(doc, "2.1 Connexion", 2)
    doc.add_paragraph("1. Rendez-vous sur la page de connexion\n2. Entrez votre email et mot de passe\n3. Cliquez sur 'Se connecter'\n4. Vous serez redirige vers votre tableau de bord personnalise selon votre role")

    add_heading(doc, "2.2 Changer de Langue", 2)
    doc.add_paragraph("1. Cliquez sur l'icone globe dans la barre superieure\n2. Selectionnez votre langue parmi les 21 disponibles\n3. L'interface se met a jour instantanement\n4. Pour l'arabe, le layout passe automatiquement en droite-a-gauche (RTL)\n5. Votre preference de langue est sauvegardee automatiquement")

    add_heading(doc, "3. Tableau de Bord")
    doc.add_paragraph("Votre tableau de bord affiche un resume de vos activites agricoles:\n- Parcelles actives et leur etat de sante\n- Conditions meteorologiques actuelles et previsions\n- Alertes recentes (irrigation, maladies, meteo)\n- Statistiques de rendement et tendances\n- Acces rapide aux outils les plus utilises")

    add_heading(doc, "4. Camera IA")
    add_heading(doc, "4.1 Demarrer la Camera", 2)
    doc.add_paragraph("1. Allez dans le menu 'Camera IA'\n2. Cliquez sur 'Autoriser la Camera' pour donner l'acces\n3. La camera se demarre automatiquement\n4. Si vous avez plusieurs cameras (dont externes), utilisez le selecteur")

    add_heading(doc, "4.2 Analyser une Culture", 2)
    doc.add_paragraph("1. Pointez la camera vers la plante a analyser\n2. Selectionnez le mode: General, Maladies, Nutrition, Hydratation ou Croissance\n3. Appuyez sur le bouton central pour capturer et analyser\n4. Le resultat affiche: etat de sante, confiance, detections et recommandations\n5. Vous pouvez aussi importer une photo depuis votre galerie")

    add_heading(doc, "5. AGRI GENIUS (Assistant IA)")
    doc.add_paragraph("1. Accedez a AGRI GENIUS depuis le menu\n2. Tapez votre question dans la zone de texte\n3. L'IA repond avec des conseils agricoles personnalises\n4. Exemples de questions:\n   - 'Comment traiter la rouille du ble?'\n   - 'Quel est le meilleur moment pour semer le mais au Cameroun?'\n   - 'Comment ameliorer la fertilite de mon sol?'\n   - 'Quelles cultures sont adaptees a mon climat?'")

    add_heading(doc, "6. Carte Agricole")
    doc.add_paragraph("1. Ouvrez 'Carte Agricole' depuis le menu\n2. La carte affiche les fournisseurs autour de vous\n3. Filtrez par categorie (semences, engrais, equipement, phytosanitaires)\n4. Filtrez par culture specifique (mais, cacao, cafe, etc.)\n5. Cliquez sur un marqueur pour voir les details du fournisseur\n6. Utilisez les boutons WhatsApp, Appeler ou Itineraire")

    add_heading(doc, "7. Gestion des Parcelles")
    doc.add_paragraph("1. Ajoutez vos parcelles avec leurs coordonnees GPS\n2. Definissez le type de culture et le sol\n3. Associez des capteurs IoT a chaque parcelle\n4. Suivez la sante de vos cultures en temps reel via NDVI\n5. Recevez des alertes automatiques en cas de probleme")

    add_heading(doc, "8. Drones et Robots")
    doc.add_paragraph("Drones:\n- Planifiez des missions de survol automatisees\n- Capturez des images aeriennes multispectrales\n- Analysez les donnees NDVI pour chaque parcelle\n- Suivez la telemetrie en temps reel\n\nRobots:\n- Controlez en mode manuel ou autonome\n- Programmez des taches (desherbage, pulverisation, patrouille)\n- Visualisez la reconstruction 3D LIDAR\n- Suivez l'autonomie et la position en temps reel")

    add_heading(doc, "9. Personnalisation")
    doc.add_paragraph("Allez dans Parametres pour:\n- Changer votre theme parmi 10+ palettes de couleurs (personnel, n'affecte que votre interface)\n- Uploader votre photo de profil\n- Modifier votre mot de passe\n- Configurer vos preferences de notifications\n- Choisir votre langue preferee parmi 21 langues")

    add_heading(doc, "10. Marketplace")
    doc.add_paragraph("- Parcourez les produits agricoles classes par categorie\n- Recherchez par nom, categorie ou fournisseur\n- Consultez les details et photos des produits\n- Contactez les vendeurs directement\n- Passez des commandes securisees avec paiement Mobile Money")

    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Guide_Utilisateur.docx")
    doc.save(path)
    return path


def generate_admin_guide():
    doc = Document()
    set_style(doc)
    add_cover_page(doc, "Guide Administrateur", "Administration et gestion de la plateforme")

    toc = [
        ("1.", "Acces Administrateur"), ("2.", "Tableau de Bord Admin"),
        ("3.", "Gestion des Utilisateurs"), ("", "  3.1 Consulter"), ("", "  3.2 Bloquer/Debloquer"),
        ("4.", "Securite"), ("5.", "Analytiques et Export"),
        ("6.", "Gestion du Contenu"), ("7.", "Parametres Systeme"),
    ]
    add_toc_page(doc, toc)

    add_heading(doc, "1. Acces Administrateur")
    doc.add_paragraph("Compte admin par defaut: admin@agricam.ai\nL'administrateur a acces a toutes les fonctionnalites de la plateforme plus des outils de gestion avances incluant la securite, les analytics et la moderation.")

    add_heading(doc, "2. Tableau de Bord Admin")
    doc.add_paragraph("Le dashboard admin affiche:")
    add_table(doc, ["Metrique", "Description"], [
        ["Utilisateurs totaux", "Nombre total d'inscrits (actuellement 307+)"],
        ["Utilisateurs actifs", "Connectes dans les 30 derniers jours"],
        ["Revenus mensuels", "Total des abonnements et paiements"],
        ["Charge serveur", "Utilisation CPU, memoire, stockage"],
        ["Adoption fonctionnalites", "Utilisation par fonctionnalite"],
    ])

    add_heading(doc, "3. Gestion des Utilisateurs")
    add_heading(doc, "3.1 Consulter les Utilisateurs", 2)
    doc.add_paragraph("1. Naviguez vers le dashboard admin\n2. La liste affiche: nom, email, role, statut, date d'inscription\n3. Utilisez la barre de recherche pour filtrer\n4. Roles disponibles: admin, farmer, supplier, bank, seed_analyst, agronomist, trainer")

    add_heading(doc, "3.2 Bloquer/Debloquer", 2)
    doc.add_paragraph("1. Identifiez l'utilisateur a bloquer\n2. Cliquez sur le bouton 'Bloquer'\n3. L'utilisateur ne pourra plus se connecter\n4. Un journal de securite est genere automatiquement\n5. Pour debloquer, cliquez sur 'Debloquer'\n6. Toutes les actions sont tracees dans les logs")

    add_heading(doc, "4. Securite")
    doc.add_paragraph("Le panneau de securite offre:")
    doc.add_paragraph("Tentatives de connexion echouees et IP suspectes", style='List Bullet')
    doc.add_paragraph("Activites suspectes detectees automatiquement", style='List Bullet')
    doc.add_paragraph("Liste des utilisateurs bloques avec historique", style='List Bullet')
    doc.add_paragraph("Chiffrement bcrypt des mots de passe", style='List Bullet')
    doc.add_paragraph("Tokens JWT avec expiration automatique", style='List Bullet')
    doc.add_paragraph("Validation stricte des entrees (Pydantic)", style='List Bullet')
    doc.add_paragraph("Protection CORS configuree", style='List Bullet')

    add_heading(doc, "5. Analytiques et Export")
    doc.add_paragraph("1. Accedez aux analytiques depuis le menu admin\n2. Consultez les graphiques: revenus, inscriptions, utilisation par role\n3. Exportez les donnees en CSV, Excel ou PDF\n4. Filtrez par periode (jour, semaine, mois, annee)")

    add_heading(doc, "6. Gestion du Contenu")
    doc.add_paragraph("- Moderez les produits du marketplace\n- Approuvez les nouveaux fournisseurs\n- Gerez les cours de formation et ebooks\n- Surveillez les sessions AGRI GENIUS\n- Generez et telechargez la documentation")

    add_heading(doc, "7. Parametres Systeme")
    doc.add_paragraph("- Configuration des notifications globales\n- Gestion des plans d'abonnement et tarifs\n- Configuration des limites API\n- Personnalisation de la plateforme\n- Gestion des cles API externes (OpenWeatherMap, Gemini)")

    path = os.path.join(OUTPUT_DIR, "AGRICAM_IA_Guide_Administrateur.docx")
    doc.save(path)
    return path


def generate_maintenance_guide():
    doc = Document()
    set_style(doc)
    add_cover_page(doc, "Guide de Maintenance", "Installation, configuration et depannage")

    toc = [
        ("1.", "Architecture de Deploiement"), ("2.", "Structure des Fichiers"),
        ("3.", "Variables d'Environnement"), ("4.", "Commandes de Maintenance"),
        ("5.", "Base de Donnees"), ("", "  5.1 Collections"), ("", "  5.2 Sauvegarde"),
        ("6.", "Mise a Jour"), ("7.", "Depannage"), ("8.", "Monitoring"),
    ]
    add_toc_page(doc, toc)

    add_heading(doc, "1. Architecture de Deploiement")
    doc.add_paragraph("L'application est deployee dans un conteneur Kubernetes avec:")
    doc.add_paragraph("Frontend: React (port 3000) servi par webpack-dev-server", style='List Bullet')
    doc.add_paragraph("Backend: FastAPI (port 8001) servi par Uvicorn avec hot-reload", style='List Bullet')
    doc.add_paragraph("Base de donnees: MongoDB locale", style='List Bullet')
    doc.add_paragraph("Proxy: Ingress Kubernetes avec routage /api -> backend", style='List Bullet')
    doc.add_paragraph("Supervision: supervisord pour la gestion des processus", style='List Bullet')
    doc.add_paragraph("Stockage: Emergent Object Storage pour fichiers (videos, PDFs)", style='List Bullet')

    add_heading(doc, "2. Structure des Fichiers")
    doc.add_paragraph("/app/\n  backend/\n    server.py          # Serveur principal FastAPI (~4600 lignes)\n    routes/\n      trainer.py       # Routes formateur\n    storage.py         # Gestion stockage objets\n    docs_generator.py  # Generation documents Word\n    docs/              # Documents generes\n    requirements.txt   # Dependances Python\n    .env               # Variables d'environnement\n  frontend/\n    src/\n      App.js           # Composant racine React\n      components/       # Composants reutilisables\n        Layout.jsx      # Layout principal + navigation + RTL\n        ui/             # Composants Shadcn/UI\n      pages/            # Pages de l'application (21+)\n      contexts/         # Contextes React (Language, Auth)\n      locales/          # Traductions (21 langues)\n      services/         # Services API\n    package.json\n    .env")

    add_heading(doc, "3. Variables d'Environnement")
    add_heading(doc, "3.1 Backend (.env)", 2)
    add_table(doc, ["Variable", "Description", "Obligatoire"], [
        ["MONGO_URL", "URL de connexion MongoDB", "Oui"],
        ["DB_NAME", "Nom de la base de donnees", "Oui"],
        ["JWT_SECRET", "Cle secrete pour les tokens JWT", "Oui"],
        ["GEMINI_API_KEY", "Cle API Google Gemini pour l'IA", "Oui"],
        ["OPENWEATHER_API_KEY", "Cle API OpenWeatherMap", "Non"],
        ["STORAGE_BUCKET", "Bucket de stockage objets", "Non"],
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
        ["tail -f /var/log/supervisor/backend.err.log", "Logs backend (erreurs)"],
        ["tail -f /var/log/supervisor/backend.out.log", "Logs backend (infos)"],
        ["tail -f /var/log/supervisor/frontend.err.log", "Logs frontend"],
        ["curl http://localhost:8001/api/health", "Verifier sante backend"],
        ["pip freeze > requirements.txt", "Sauvegarder dependances"],
        ["cd /app/frontend && yarn install", "Reinstaller paquets frontend"],
    ])

    add_heading(doc, "5. Base de Donnees")
    add_heading(doc, "5.1 Collections MongoDB", 2)
    add_table(doc, ["Collection", "Description", "Index"], [
        ["users", "Comptes utilisateurs (307+)", "email (unique), role"],
        ["parcels", "Parcelles agricoles", "user_id, coordinates (2dsphere)"],
        ["sensors", "Capteurs IoT", "parcel_id, type"],
        ["drones", "Drones et missions", "user_id, status"],
        ["robots", "Robots agricoles", "user_id, status"],
        ["products", "Produits marketplace", "seller_id, category"],
        ["orders", "Commandes", "buyer_id, seller_id, status"],
        ["trainings", "Cours de formation", "trainer_id"],
        ["ebooks", "Livres numeriques", "trainer_id"],
        ["suppliers", "Fournisseurs carte", "coordinates (2dsphere)"],
        ["chat_sessions", "Sessions AGRI GENIUS", "user_id"],
        ["camera_scans", "Scans Camera IA", "user_id"],
        ["security_logs", "Journaux securite", "user_id, timestamp"],
        ["payments", "Paiements", "user_id, status"],
        ["alerts", "Alertes", "user_id, is_read"],
    ])

    add_heading(doc, "5.2 Sauvegarde et Restauration", 2)
    doc.add_paragraph("Sauvegarde:\nmongodump --uri=\"$MONGO_URL\" --db=\"$DB_NAME\" --out=/backup/$(date +%Y%m%d)\n\nRestauration:\nmongorestore --uri=\"$MONGO_URL\" --db=\"$DB_NAME\" /backup/YYYYMMDD/$DB_NAME/")

    add_heading(doc, "6. Mise a Jour")
    doc.add_paragraph("Backend:\n1. cd /app/backend\n2. pip install -r requirements.txt\n3. sudo supervisorctl restart backend\n\nFrontend:\n1. cd /app/frontend\n2. yarn install\n3. sudo supervisorctl restart frontend\n\nIMPORTANT: Toujours sauvegarder la base de donnees avant une mise a jour majeure.")

    add_heading(doc, "7. Depannage")
    add_table(doc, ["Probleme", "Diagnostic", "Solution"], [
        ["Backend ne demarre pas", "tail -f /var/log/supervisor/backend.err.log", "Verifier les imports, le .env et les dependances"],
        ["Frontend page blanche", "Console navigateur (F12)", "Verifier les erreurs JS, le build et les composants"],
        ["MongoDB connexion echouee", "mongosh --eval 'db.stats()'", "Verifier MONGO_URL et que mongod tourne"],
        ["Erreur 401 Unauthorized", "Token JWT expire", "Se reconnecter pour obtenir un nouveau token"],
        ["Camera IA ne fonctionne pas", "Permissions navigateur", "HTTPS requis, verifier navigator.mediaDevices"],
        ["IA lente ou erreur 500", "Verifier les logs backend", "Verifier la cle Gemini, le cache, et les limites API"],
        ["Traductions manquantes", "Console navigateur", "Verifier translations.js, cle manquante -> fallback FR"],
    ])

    add_heading(doc, "8. Monitoring")
    doc.add_paragraph("Points de surveillance recommandes:")
    doc.add_paragraph("Espace disque MongoDB (seuil: 80%)", style='List Bullet')
    doc.add_paragraph("Temps de reponse API (seuil: 2s)", style='List Bullet')
    doc.add_paragraph("Taux d'erreur HTTP 5xx (seuil: 1%)", style='List Bullet')
    doc.add_paragraph("Utilisation memoire backend (seuil: 512MB)", style='List Bullet')
    doc.add_paragraph("Nombre de connexions MongoDB actives", style='List Bullet')
    doc.add_paragraph("Cache IA hit/miss ratio", style='List Bullet')

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
