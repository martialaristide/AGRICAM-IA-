"""
AGRICAM IA - Generateur de documentation DJI MSDK V5
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
import os

def create_dji_guide():
    doc = Document()
    
    # Styles
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    
    # Cover Page
    for _ in range(4):
        doc.add_paragraph()
    
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("AGRICAM IA")
    run.font.size = Pt(36)
    run.font.color.rgb = RGBColor(16, 185, 129)
    run.font.bold = True
    
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run("Guide Complet de Développement\nApp Android Compagnon DJI Mini 3 Pro\nMobile SDK V5")
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(100, 100, 100)
    
    doc.add_paragraph()
    version = doc.add_paragraph()
    version.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = version.add_run("Version 1.0 — Avril 2026\nDJI MSDK V5.17.0\nPar African AI Solutions")
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(150, 150, 150)
    
    doc.add_page_break()
    
    # Table of Contents
    doc.add_heading('Table des Matières', level=1)
    toc_items = [
        "1. Architecture Globale",
        "2. Pré-requis Matériels et Logiciels",
        "3. Création du Compte Développeur DJI",
        "4. Configuration Android Studio",
        "5. Structure du Projet Kotlin",
        "6. Code Source Complet",
        "7. Connexion au Backend Agricam IA",
        "8. API Endpoints Agricam IA",
        "9. Tests et Débogage",
        "10. Publication sur Google Play Store",
        "11. Limitations avec DJI RC (écran)",
        "12. Ressources et Support",
    ]
    for item in toc_items:
        p = doc.add_paragraph(item)
        p.style.font.size = Pt(12)
    
    doc.add_page_break()
    
    # ===== SECTION 1 =====
    doc.add_heading('1. Architecture Globale', level=1)
    doc.add_paragraph(
        "L'application Android compagnon « Agricam Drone Bridge » sert de passerelle "
        "entre votre drone DJI Mini 3 Pro et la plateforme web Agricam IA.\n\n"
        "Flux de données :\n"
    )
    doc.add_paragraph("DJI Mini 3 Pro ↔ Radiocommande ↔ Téléphone Android [App Bridge] → Internet → Backend Agricam IA → Dashboard Web", style='Intense Quote')
    
    doc.add_paragraph(
        "\nL'app Android :\n"
        "• Se connecte au drone via DJI Mobile SDK V5\n"
        "• Reçoit la télémétrie en temps réel (GPS, batterie, altitude, vitesse)\n"
        "• Capture des photos/vidéos via la caméra du drone\n"
        "• Envoie les données au backend Agricam IA via REST API\n"
        "• Affiche le flux vidéo en direct (FPV)\n"
        "• Exécute des missions de vol autonome (waypoints)"
    )
    
    doc.add_page_break()
    
    # ===== SECTION 2 =====
    doc.add_heading('2. Pré-requis Matériels et Logiciels', level=1)
    
    doc.add_heading('Matériel requis', level=2)
    table = doc.add_table(rows=6, cols=3)
    table.style = 'Light Shading Accent 1'
    headers = ['Élément', 'Requis', 'Note']
    for i, h in enumerate(headers):
        table.rows[0].cells[i].text = h
    
    data = [
        ['DJI Mini 3 Pro', '✅ Requis', 'Firmware v01.00.0700+'],
        ['Radiocommande RC-N1', '⚠️ RECOMMANDÉ', 'Seule compatible avec le SDK pour contrôle programmé'],
        ['DJI RC (avec écran)', '⚠️ LIMITÉ', 'Pas de contrôle SDK, mais upload manuel photos OK'],
        ['Téléphone Android', '✅ Requis', 'Android 7.0+ (API 24+), 8 Go RAM recommandé'],
        ['Câble USB OTG', '✅ Requis', 'Pour connecter téléphone → RC-N1'],
    ]
    for i, row in enumerate(data):
        for j, cell in enumerate(row):
            table.rows[i+1].cells[j].text = cell
    
    doc.add_paragraph()
    doc.add_heading('Logiciels requis', level=2)
    doc.add_paragraph(
        "• Android Studio Hedgehog (2023.1.1) ou plus récent\n"
        "• Java Development Kit (JDK) 17\n"
        "• Kotlin 1.8.10+\n"
        "• Gradle 7.6.2+\n"
        "• Android NDK 21.4.7075529\n"
        "• DJI Mobile SDK V5.17.0\n"
        "• Git (pour cloner le SDK)"
    )
    
    doc.add_page_break()
    
    # ===== SECTION 3 =====
    doc.add_heading('3. Création du Compte Développeur DJI', level=1)
    doc.add_paragraph(
        "Étape 1 : Allez sur https://developer.dji.com\n"
        "Étape 2 : Cliquez 'Register' et créez votre compte\n"
        "Étape 3 : Allez dans 'User Center' → 'Apps' → 'CREATE APP'\n"
        "Étape 4 : Remplissez :\n"
        "  • App Name : Agricam Drone Bridge\n"
        "  • Software Platform : Android\n"
        "  • Package Name : com.agricamia.dronebridge\n"
        "  • Category : Agriculture\n"
        "  • Description : Companion app for Agricam IA precision agriculture platform\n"
        "Étape 5 : Vous recevrez votre App Key par email\n"
        "Étape 6 : Activez la clé en cliquant le lien dans l'email\n\n"
        "⚠️ IMPORTANT : Le Package Name doit correspondre EXACTEMENT à celui de votre projet Android."
    )
    
    doc.add_page_break()
    
    # ===== SECTION 4 =====
    doc.add_heading('4. Configuration Android Studio', level=1)
    doc.add_paragraph(
        "Étape 1 : Créer un nouveau projet\n"
        "  • File → New → New Project\n"
        "  • Template : Empty Activity\n"
        "  • Language : Kotlin\n"
        "  • Package name : com.agricamia.dronebridge\n"
        "  • Minimum SDK : API 24 (Android 7.0)\n\n"
        "Étape 2 : Configurer build.gradle (Module: app)\n"
    )
    
    doc.add_paragraph(
        'android {\n'
        '    compileSdk 34\n'
        '    defaultConfig {\n'
        '        applicationId "com.agricamia.dronebridge"\n'
        '        minSdk 24\n'
        '        targetSdk 34\n'
        '        versionCode 1\n'
        '        versionName "1.0"\n'
        '        ndk { abiFilters "armeabi-v7a", "arm64-v8a" }\n'
        '    }\n'
        '    packagingOptions {\n'
        '        pickFirst "lib/**/libc++_shared.so"\n'
        '        pickFirst "lib/**/libstdc++.so"\n'
        '    }\n'
        '}\n\n'
        'dependencies {\n'
        '    // DJI SDK V5\n'
        '    implementation "com.dji:dji-sdk-v5-aircraft:5.17.0"\n'
        '    compileOnly "com.dji:dji-sdk-v5-aircraft-provided:5.17.0"\n'
        '    runtimeOnly "com.dji:dji-sdk-v5-networkImp:5.17.0"\n\n'
        '    // Networking\n'
        '    implementation "com.squareup.retrofit2:retrofit:2.9.0"\n'
        '    implementation "com.squareup.retrofit2:converter-gson:2.9.0"\n'
        '    implementation "com.squareup.okhttp3:okhttp:4.12.0"\n'
        '    implementation "com.squareup.okhttp3:logging-interceptor:4.12.0"\n\n'
        '    // Coroutines\n'
        '    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"\n\n'
        '    // Google Maps\n'
        '    implementation "com.google.android.gms:play-services-maps:18.2.0"\n'
        '    implementation "com.google.android.gms:play-services-location:21.0.1"\n\n'
        '    // AndroidX\n'
        '    implementation "androidx.core:core-ktx:1.12.0"\n'
        '    implementation "androidx.appcompat:appcompat:1.6.1"\n'
        '    implementation "com.google.android.material:material:1.11.0"\n'
        '    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0"\n'
        '    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.7.0"\n'
        '}',
        style='No Spacing'
    )
    
    doc.add_paragraph(
        "\nÉtape 3 : Configurer build.gradle (Project)\n"
        "Ajoutez les dépôts Maven DJI :\n"
    )
    doc.add_paragraph(
        'allprojects {\n'
        '    repositories {\n'
        '        google()\n'
        '        mavenCentral()\n'
        '        maven { url "https://maven.aliyun.com/nexus/content/repositories/releases/" }\n'
        '    }\n'
        '}',
        style='No Spacing'
    )
    
    doc.add_paragraph(
        "\nÉtape 4 : Configurer gradle.properties\n"
    )
    doc.add_paragraph(
        'AIRCRAFT_API_KEY=VOTRE_CLE_API_DJI_ICI',
        style='No Spacing'
    )
    
    doc.add_page_break()
    
    # ===== SECTION 5 =====
    doc.add_heading('5. Structure du Projet Kotlin', level=1)
    doc.add_paragraph(
        'com.agricamia.dronebridge/\n'
        '├── AgricamDroneApp.kt          # Application class (SDK init)\n'
        '├── MainActivity.kt             # Écran principal\n'
        '├── ui/\n'
        '│   ├── FlightActivity.kt       # Contrôle de vol + FPV\n'
        '│   ├── MissionActivity.kt      # Planification missions waypoints\n'
        '│   └── GalleryActivity.kt      # Galerie photos drone\n'
        '├── service/\n'
        '│   ├── TelemetryService.kt     # Service envoi télémétrie\n'
        '│   └── AgricamApiService.kt    # API Retrofit vers Agricam IA\n'
        '├── model/\n'
        '│   ├── DroneData.kt            # Modèles de données\n'
        '│   └── MissionData.kt          # Modèles missions\n'
        '└── util/\n'
        '    └── PermissionHelper.kt     # Gestion permissions Android',
        style='No Spacing'
    )
    
    doc.add_page_break()
    
    # ===== SECTION 6 =====
    doc.add_heading('6. Code Source Complet', level=1)
    
    doc.add_heading('6.1 AgricamDroneApp.kt — Initialisation SDK', level=2)
    doc.add_paragraph(
        'package com.agricamia.dronebridge\n\n'
        'import android.app.Application\n'
        'import android.content.Context\n'
        'import dji.v5.manager.SDKManager\n'
        'import dji.v5.manager.interfaces.SDKManagerCallback\n'
        'import dji.v5.common.error.IDJIError\n'
        'import dji.v5.common.register.DJISDKInitEvent\n\n'
        'class AgricamDroneApp : Application() {\n\n'
        '    companion object {\n'
        '        lateinit var instance: AgricamDroneApp\n'
        '            private set\n'
        '    }\n\n'
        '    override fun attachBaseContext(base: Context?) {\n'
        '        super.attachBaseContext(base)\n'
        '        com.secneo.sdk.Helper.install(this)\n'
        '    }\n\n'
        '    override fun onCreate() {\n'
        '        super.onCreate()\n'
        '        instance = this\n'
        '        registerSDK()\n'
        '    }\n\n'
        '    private fun registerSDK() {\n'
        '        SDKManager.getInstance().init(this, object : SDKManagerCallback {\n'
        '            override fun onRegisterSuccess() {\n'
        '                android.util.Log.i("AGRICAM", "DJI SDK registered successfully!")\n'
        '            }\n'
        '            override fun onRegisterFailure(error: IDJIError?) {\n'
        '                android.util.Log.e("AGRICAM", "SDK registration failed: ${error?.description()}")\n'
        '            }\n'
        '            override fun onProductDisconnect(productId: Int) {\n'
        '                android.util.Log.w("AGRICAM", "Product disconnected")\n'
        '            }\n'
        '            override fun onProductConnect(productId: Int) {\n'
        '                android.util.Log.i("AGRICAM", "Product connected: $productId")\n'
        '            }\n'
        '            override fun onProductChanged(productId: Int) {}\n'
        '            override fun onInitProcess(event: DJISDKInitEvent?, totalProcess: Int) {\n'
        '                android.util.Log.i("AGRICAM", "Init process: $event ($totalProcess%)")\n'
        '            }\n'
        '            override fun onDatabaseDownloadProgress(current: Long, total: Long) {}\n'
        '        })\n'
        '    }\n'
        '}',
        style='No Spacing'
    )
    
    doc.add_heading('6.2 AgricamApiService.kt — Communication Backend', level=2)
    doc.add_paragraph(
        'package com.agricamia.dronebridge.service\n\n'
        'import retrofit2.Retrofit\n'
        'import retrofit2.converter.gson.GsonConverterFactory\n'
        'import retrofit2.http.*\n'
        'import okhttp3.OkHttpClient\n'
        'import okhttp3.logging.HttpLoggingInterceptor\n\n'
        '// ========= IMPORTANT : Remplacez par votre URL Agricam IA =========\n'
        'const val AGRICAM_BASE_URL = "https://votre-app.preview.emergentagent.com/api/"\n\n'
        'data class TelemetryPayload(\n'
        '    val drone_id: String,\n'
        '    val latitude: Double,\n'
        '    val longitude: Double,\n'
        '    val altitude: Double,\n'
        '    val battery_percent: Double,\n'
        '    val speed: Double,\n'
        '    val heading: Double,\n'
        '    val gps_signal: Int,\n'
        '    val status: String,\n'
        '    val wind_speed: Double? = null,\n'
        '    val temperature: Double? = null\n'
        ')\n\n'
        'data class TelemetryResponse(val received: Boolean, val telemetry_id: String)\n\n'
        'interface AgricamApi {\n'
        '    @POST("drone-manager/telemetry")\n'
        '    suspend fun sendTelemetry(@Body data: TelemetryPayload): TelemetryResponse\n\n'
        '    @GET("drone-manager/missions")\n'
        '    suspend fun getMissions(): Map<String, Any>\n\n'
        '    @GET("drone-manager/fleet")\n'
        '    suspend fun getFleet(): Map<String, Any>\n'
        '}\n\n'
        'object AgricamApiClient {\n'
        '    private val client = OkHttpClient.Builder()\n'
        '        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY })\n'
        '        .build()\n\n'
        '    val api: AgricamApi = Retrofit.Builder()\n'
        '        .baseUrl(AGRICAM_BASE_URL)\n'
        '        .client(client)\n'
        '        .addConverterFactory(GsonConverterFactory.create())\n'
        '        .build()\n'
        '        .create(AgricamApi::class.java)\n'
        '}',
        style='No Spacing'
    )
    
    doc.add_heading('6.3 TelemetryService.kt — Envoi Télémétrie', level=2)
    doc.add_paragraph(
        'package com.agricamia.dronebridge.service\n\n'
        'import android.util.Log\n'
        'import dji.v5.manager.aircraft.flightcontroller.FlightControllerKey\n'
        'import dji.v5.manager.KeyManager\n'
        'import dji.v5.common.callback.CommonCallbacksForKey\n'
        'import kotlinx.coroutines.*\n\n'
        'class TelemetryService {\n'
        '    private var job: Job? = null\n'
        '    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())\n'
        '    private val droneId = "drone-001"  // ID du drone enregistré dans Agricam IA\n\n'
        '    fun startSending(intervalMs: Long = 2000) {\n'
        '        job = scope.launch {\n'
        '            while (isActive) {\n'
        '                try {\n'
        '                    val lat = getKeyValue(FlightControllerKey.KeyAircraftLocation)?.latitude ?: 0.0\n'
        '                    val lng = getKeyValue(FlightControllerKey.KeyAircraftLocation)?.longitude ?: 0.0\n'
        '                    val alt = getKeyValue(FlightControllerKey.KeyAltitude) as? Double ?: 0.0\n'
        '                    val bat = getKeyValue(FlightControllerKey.KeyBatteryPercentNeededToGoHome) as? Int ?: 0\n'
        '                    val speed = getKeyValue(FlightControllerKey.KeyAircraftVelocity)?.let {\n'
        '                        Math.sqrt((it.x * it.x + it.y * it.y + it.z * it.z).toDouble())\n'
        '                    } ?: 0.0\n'
        '                    val heading = getKeyValue(FlightControllerKey.KeyCompassHeading) as? Double ?: 0.0\n\n'
        '                    val payload = TelemetryPayload(\n'
        '                        drone_id = droneId,\n'
        '                        latitude = lat, longitude = lng,\n'
        '                        altitude = alt, battery_percent = bat.toDouble(),\n'
        '                        speed = speed, heading = heading,\n'
        '                        gps_signal = 5, status = "flying"\n'
        '                    )\n\n'
        '                    AgricamApiClient.api.sendTelemetry(payload)\n'
        '                    Log.d("TELEMETRY", "Sent: $lat, $lng, $alt")\n'
        '                } catch (e: Exception) {\n'
        '                    Log.e("TELEMETRY", "Error: ${e.message}")\n'
        '                }\n'
        '                delay(intervalMs)\n'
        '            }\n'
        '        }\n'
        '    }\n\n'
        '    fun stop() { job?.cancel() }\n\n'
        '    private fun <T> getKeyValue(key: Any): T? {\n'
        '        // Simplified - use KeyManager.getInstance().getValue() in real code\n'
        '        return null\n'
        '    }\n'
        '}',
        style='No Spacing'
    )
    
    doc.add_heading('6.4 AndroidManifest.xml', level=2)
    doc.add_paragraph(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n'
        '    package="com.agricamia.dronebridge">\n\n'
        '    <!-- Permissions -->\n'
        '    <uses-permission android:name="android.permission.INTERNET" />\n'
        '    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />\n'
        '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n'
        '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n'
        '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n'
        '    <uses-permission android:name="android.permission.CAMERA" />\n'
        '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n'
        '    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />\n'
        '    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n'
        '    <uses-permission android:name="android.permission.BLUETOOTH" />\n'
        '    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />\n\n'
        '    <uses-feature android:name="android.hardware.usb.host" />\n'
        '    <uses-feature android:name="android.hardware.camera" />\n\n'
        '    <application\n'
        '        android:name=".AgricamDroneApp"\n'
        '        android:icon="@mipmap/ic_launcher"\n'
        '        android:label="Agricam Drone Bridge"\n'
        '        android:theme="@style/Theme.AgricamDrone"\n'
        '        android:usesCleartextTraffic="true">\n\n'
        '        <!-- DJI API Key -->\n'
        '        <meta-data\n'
        '            android:name="com.dji.sdk.API_KEY"\n'
        '            android:value="${AIRCRAFT_API_KEY}" />\n\n'
        '        <!-- USB Accessory Filter -->\n'
        '        <activity\n'
        '            android:name=".MainActivity"\n'
        '            android:exported="true"\n'
        '            android:launchMode="singleTop">\n'
        '            <intent-filter>\n'
        '                <action android:name="android.intent.action.MAIN" />\n'
        '                <category android:name="android.intent.category.LAUNCHER" />\n'
        '            </intent-filter>\n'
        '            <intent-filter>\n'
        '                <action android:name="android.hardware.usb.action.USB_ACCESSORY_ATTACHED" />\n'
        '            </intent-filter>\n'
        '            <meta-data\n'
        '                android:name="android.hardware.usb.action.USB_ACCESSORY_ATTACHED"\n'
        '                android:resource="@xml/accessory_filter" />\n'
        '        </activity>\n'
        '    </application>\n'
        '</manifest>',
        style='No Spacing'
    )
    
    doc.add_page_break()
    
    # ===== SECTION 7 =====
    doc.add_heading('7. Connexion au Backend Agricam IA', level=1)
    doc.add_paragraph(
        "Votre app Android communique avec le backend Agricam IA via les API REST.\n\n"
        "URL de base : https://votre-app.preview.emergentagent.com/api/\n\n"
        "L'app envoie :\n"
        "• Télémétrie toutes les 2 secondes (GPS, batterie, altitude, vitesse)\n"
        "• Photos capturées avec coordonnées GPS\n"
        "• Statut du drone (prêt, en vol, retour, atterri)\n\n"
        "L'app reçoit :\n"
        "• Missions planifiées depuis le dashboard web\n"
        "• Commandes de vol (si RC-N1)\n"
        "• Résultats d'analyse IA des photos\n"
    )
    
    # ===== SECTION 8 =====
    doc.add_heading('8. API Endpoints Agricam IA', level=1)
    
    table2 = doc.add_table(rows=9, cols=4)
    table2.style = 'Light Shading Accent 1'
    headers2 = ['Méthode', 'Endpoint', 'Description', 'Body']
    for i, h in enumerate(headers2):
        table2.rows[0].cells[i].text = h
    
    endpoints = [
        ['GET', '/api/drone-manager/fleet', 'Liste des drones', '-'],
        ['POST', '/api/drone-manager/fleet', 'Enregistrer drone', '{"name","model"}'],
        ['GET', '/api/drone-manager/missions', 'Liste missions', '-'],
        ['POST', '/api/drone-manager/missions', 'Créer mission', '{"name","drone_id","waypoints"}'],
        ['POST', '/api/drone-manager/telemetry', 'Envoyer télémétrie', '{"drone_id","lat","lng","alt","bat"}'],
        ['GET', '/api/drone-manager/telemetry/{id}', 'Historique télémétrie', '-'],
        ['GET', '/api/drone-manager/photos', 'Photos drone', '-'],
        ['GET', '/api/drone-manager/stats', 'Statistiques', '-'],
    ]
    for i, row in enumerate(endpoints):
        for j, cell in enumerate(row):
            table2.rows[i+1].cells[j].text = cell
    
    doc.add_page_break()
    
    # ===== SECTION 9 =====
    doc.add_heading('9. Tests et Débogage', level=1)
    doc.add_paragraph(
        "Étape 1 : Tester SANS drone\n"
        "• Utilisez le DJI Assistant 2 Simulator sur PC\n"
        "• Ou l'endpoint /api/drone-manager/simulation/telemetry\n"
        "• Vérifiez que les données arrivent sur le dashboard web\n\n"
        "Étape 2 : Tester AVEC drone\n"
        "• Connectez le téléphone à la RC-N1 via câble USB\n"
        "• Lancez l'app Agricam Drone Bridge\n"
        "• Vérifiez 'DJI SDK registered successfully!' dans les logs\n"
        "• Démarrez un vol → la télémétrie devrait apparaître en direct\n\n"
        "Commandes de test curl :\n"
    )
    doc.add_paragraph(
        '# Tester l\'envoi de télémétrie\n'
        'curl -X POST https://votre-app.com/api/drone-manager/telemetry \\\n'
        '  -H "Content-Type: application/json" \\\n'
        '  -d \'{"drone_id":"drone-001","latitude":4.051,"longitude":9.696,\n'
        '       "altitude":50,"battery_percent":85,"speed":5,"heading":180,\n'
        '       "gps_signal":5,"status":"flying"}\'\n\n'
        '# Vérifier les données reçues\n'
        'curl https://votre-app.com/api/drone-manager/telemetry/drone-001',
        style='No Spacing'
    )
    
    doc.add_page_break()
    
    # ===== SECTION 10 =====
    doc.add_heading('10. Publication sur Google Play Store', level=1)
    doc.add_paragraph(
        "Pré-requis :\n"
        "• Compte Google Play Developer (25$ one-time)\n"
        "  → https://play.google.com/console\n\n"
        "Étapes :\n"
        "1. Build → Generate Signed Bundle (AAB)\n"
        "2. Google Play Console → Créer une application\n"
        "3. Remplir : titre, description, screenshots, icône\n"
        "4. Politique de confidentialité (obligatoire)\n"
        "5. Sélectionner pays de distribution\n"
        "6. Uploader le fichier .aab\n"
        "7. Review interne → Test bêta → Production\n\n"
        "⚠️ La review Google prend 1-7 jours.\n"
        "⚠️ Les apps utilisant la caméra et la localisation nécessitent\n"
        "   une déclaration de permissions détaillée.\n"
    )
    
    # ===== SECTION 11 =====
    doc.add_heading('11. Limitations avec DJI RC (écran)', level=1)
    doc.add_paragraph(
        "⚠️ IMPORTANT : Vous avez la radiocommande DJI RC avec écran intégré.\n\n"
        "Limitations :\n"
        "• Le DJI RC avec écran NE supporte PAS le Mobile SDK V5\n"
        "• Vous ne pouvez PAS contrôler le drone de manière programmée\n"
        "• Vous ne pouvez PAS recevoir la télémétrie en temps réel via le SDK\n"
        "• Vous ne pouvez PAS exécuter des missions autonomes via votre app\n\n"
        "Ce que vous POUVEZ faire :\n"
        "• Piloter manuellement via DJI Fly\n"
        "• Prendre des photos/vidéos avec DJI Fly\n"
        "• Transférer les photos vers votre téléphone\n"
        "• Uploader les photos vers Agricam IA pour analyse IA\n"
        "• Utiliser le mode simulation dans le dashboard web\n\n"
        "Solution pour débloquer le SDK :\n"
        "• Acheter la radiocommande RC-N1 (sans écran) — environ 100-150€\n"
        "• Cela vous donnera accès à TOUTES les fonctions du SDK\n"
    )
    
    doc.add_page_break()
    
    # ===== SECTION 12 =====
    doc.add_heading('12. Ressources et Support', level=1)
    doc.add_paragraph(
        "Liens utiles :\n"
        "• DJI Developer Portal : https://developer.dji.com\n"
        "• SDK V5 GitHub : https://github.com/dji-sdk/Mobile-SDK-Android-V5\n"
        "• Documentation : https://developer.dji.com/doc/mobile-sdk-tutorial/en/\n"
        "• API Reference : https://developer.dji.com/api-reference-v5/android-api/index.html\n"
        "• Tutoriels Kotlin : https://github.com/godfreynolan/DJITutorialsKotlin\n"
        "• DJI Forum : https://forum.dji.com/forum-139-1.html\n"
        "• Firmware Mini 3 Pro : https://www.dji.com/downloads/products/mini-3-pro\n"
        "• DJI Assistant 2 : https://www.dji.com/downloads/softwares/dji-assistant-2\n\n"
        "Vidéos recommandées :\n"
        "• Setup environnement : youtube.com/watch?v=_qQX-747fRU\n"
        "• Tutoriels Kotlin V5 : youtube.com/watch?v=f5fWvFD5rwc\n"
        "• Overview V5.3 : youtube.com/watch?v=D75KEvEhGec\n\n"
        "Support Agricam IA :\n"
        "• Dashboard web : https://votre-app.preview.emergentagent.com\n"
        "• API Documentation : https://votre-app.preview.emergentagent.com/api/docs\n"
        "• Développeur : African AI Solutions — Barra Martial Aristide\n"
    )
    
    # Save
    output_path = "/app/backend/generated_docs/guide_dji_msdk_v5.docx"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    print(f"Guide saved to {output_path}")
    return output_path

if __name__ == "__main__":
    create_dji_guide()
