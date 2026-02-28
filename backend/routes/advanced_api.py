"""
AGRICAM IA - Routes API Avancées
Nouveaux endpoints pour AgriBot IA, Drones, Robots, Rapports
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import base64
import io
import os
from datetime import datetime, timezone

# Import des services
from services.agribot_ai_service import agribot_service
from services.report_generator_service import report_generator
from services.drone_management_service import drone_service, DroneType, DroneStatus
from services.robot_management_service import robot_service, RobotType, RobotStatus
from services.weather_service import weather_service
from services.zone_analysis_service import zone_analysis_service

# Router principal
router = APIRouter()

# ============ MODÈLES PYDANTIC ============

class ChatRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    analysis_type: str = "complete"

class SoilAnalysisRequest(BaseModel):
    image_base64: Optional[str] = None
    sensor_data: Optional[Dict] = None

class YieldPredictionRequest(BaseModel):
    crop_type: str
    surface_ha: float = 5.0
    country: str = "Cameroun"
    soil_quality: str = "moyen"
    irrigation: bool = False

class DiseasePredictionRequest(BaseModel):
    disease_name: str = "mildiou"
    current_zone: str = "Centre Cameroun"
    crop_type: str = "mais"
    weather_conditions: Optional[Dict] = None

class ReportRequest(BaseModel):
    data: Dict[str, Any]
    report_type: str
    title: str
    format: str = "pdf"

class DroneCreateRequest(BaseModel):
    name: str
    type: str = "agriculture"
    model: str
    cameras: List[str] = ["RGB"]
    max_payload_kg: float = 10
    max_flight_time_min: int = 30

class DroneWifiRequest(BaseModel):
    wifi_ssid: str
    wifi_password: str

class DronePilotRequest(BaseModel):
    command: str
    parameters: Optional[Dict] = None

class DroneMissionRequest(BaseModel):
    name: str
    type: str = "survey"
    scheduled_time: Optional[str] = None
    waypoints: List[Dict]
    altitude_m: float = 50
    speed_mps: float = 8
    capture_interval_seconds: int = 3
    cameras_active: List[str] = ["RGB"]
    auto_return: bool = True

class RobotCreateRequest(BaseModel):
    name: str
    type: str = "multipurpose"
    model: str
    tools: List[str] = []

class RobotWifiRequest(BaseModel):
    wifi_ssid: str
    wifi_password: str

class RobotControlRequest(BaseModel):
    action: str
    parameters: Optional[Dict] = None

class WaypointRequest(BaseModel):
    lat: float
    lng: float
    action: str = "pass"


# ============ AGRIBOT IA ENDPOINTS ============

@router.post("/agribot-ai/chat")
async def agribot_chat(request: ChatRequest, user_id: str = "default_user"):
    """Chat avec AgriBot IA - LLM puissant pour agriculture"""
    result = await agribot_service.chat(
        user_id=user_id,
        message=request.message,
        image_base64=request.image_base64
    )
    return result

@router.post("/agribot-ai/analyze-image")
async def analyze_agricultural_image(request: ImageAnalysisRequest):
    """Analyse complète d'image agricole avec IA"""
    result = await agribot_service.analyze_image(
        image_base64=request.image_base64,
        analysis_type=request.analysis_type
    )
    return result

@router.post("/agribot-ai/analyze-soil")
async def analyze_soil(request: SoilAnalysisRequest):
    """Analyse de sol (NPK, humidité, stress)"""
    result = await agribot_service.analyze_soil(
        image_base64=request.image_base64,
        sensor_data=request.sensor_data
    )
    return result

@router.post("/agribot-ai/predict-yield")
async def predict_yield(request: YieldPredictionRequest):
    """Prédiction de rendement agricole"""
    result = await agribot_service.predict_yield(
        crop_type=request.crop_type,
        surface_ha=request.surface_ha,
        country=request.country,
        soil_quality=request.soil_quality,
        irrigation=request.irrigation
    )
    return result

@router.post("/agribot-ai/predict-disease-spread")
async def predict_disease_spread(request: DiseasePredictionRequest):
    """Prédiction de propagation de maladie"""
    result = await agribot_service.predict_disease_spread(
        disease_name=request.disease_name,
        current_zone=request.current_zone,
        crop_type=request.crop_type,
        weather_conditions=request.weather_conditions or {"temperature": 28, "humidity": 75, "wind": "modere"}
    )
    return result

class EcologicalAdviceRequest(BaseModel):
    problem: str = "agriculture tropicale"
    crop_type: str = "general"
    context: Optional[str] = None

class QuickQuestionRequest(BaseModel):
    question: str

@router.post("/agribot-ai/ecological-advice")
async def get_ecological_advice(request: EcologicalAdviceRequest):
    """Conseils écologiques pour traitement"""
    result = await agribot_service.get_ecological_advice(request.problem or request.context or "agriculture tropicale", request.crop_type)
    return result

@router.post("/agribot-ai/quick-question")
async def quick_question(request: QuickQuestionRequest):
    """Question rapide sur l'agriculture"""
    result = await agribot_service.quick_question(request.question)
    return result

@router.post("/agribot-ai/upload-analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    analysis_type: str = Form("complete")
):
    """Upload et analyse de fichier (image, document)"""
    content = await file.read()
    
    # Vérifier le type de fichier
    if file.content_type.startswith("image/"):
        # Analyse d'image
        image_base64 = base64.b64encode(content).decode("utf-8")
        result = await agribot_service.analyze_image(image_base64, analysis_type)
    else:
        # Autres fichiers - analyse textuelle
        result = {
            "success": True,
            "message": f"Fichier {file.filename} reçu pour analyse",
            "file_type": file.content_type,
            "file_size": len(content)
        }
    
    return result


# ============ GÉNÉRATION DE RAPPORTS ============

@router.post("/reports/generate")
async def generate_report(request: ReportRequest):
    """Générer un rapport (PDF, Word, Excel, CSV)"""
    try:
        if request.format == "pdf":
            content = report_generator.generate_pdf_report(
                request.data, request.report_type, request.title
            )
            media_type = "application/pdf"
            filename = f"rapport_{request.report_type}.pdf"
        elif request.format == "word":
            content = report_generator.generate_word_report(
                request.data, request.report_type, request.title
            )
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"rapport_{request.report_type}.docx"
        elif request.format == "excel":
            content = report_generator.generate_excel_report(
                request.data, request.report_type, request.title
            )
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            filename = f"rapport_{request.report_type}.xlsx"
        elif request.format == "csv":
            content = report_generator.generate_csv_report(
                request.data, request.report_type
            )
            media_type = "text/csv"
            filename = f"rapport_{request.report_type}.csv"
        else:
            raise HTTPException(status_code=400, detail=f"Format non supporté: {request.format}")
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ GESTION DES DRONES ============

@router.get("/drones")
async def get_all_drones():
    """Liste tous les drones"""
    return drone_service.get_all_drones()

@router.get("/drones/{drone_id}")
async def get_drone(drone_id: str):
    """Obtenir un drone par ID"""
    drone = drone_service.get_drone(drone_id)
    if not drone:
        raise HTTPException(status_code=404, detail="Drone non trouvé")
    return drone

@router.post("/drones")
async def create_drone(request: DroneCreateRequest):
    """Ajouter un nouveau drone"""
    drone = drone_service.add_drone(request.dict())
    return drone

@router.put("/drones/{drone_id}")
async def update_drone(drone_id: str, updates: Dict):
    """Mettre à jour un drone"""
    drone = drone_service.update_drone(drone_id, updates)
    if not drone:
        raise HTTPException(status_code=404, detail="Drone non trouvé")
    return drone

@router.delete("/drones/{drone_id}")
async def delete_drone(drone_id: str):
    """Supprimer un drone"""
    if not drone_service.delete_drone(drone_id):
        raise HTTPException(status_code=404, detail="Drone non trouvé")
    return {"success": True, "message": "Drone supprimé"}

@router.post("/drones/{drone_id}/connect-wifi")
async def connect_drone_wifi(drone_id: str, request: DroneWifiRequest):
    """Connecter un drone au WiFi"""
    result = drone_service.connect_wifi(drone_id, request.wifi_ssid, request.wifi_password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/drones/{drone_id}/disconnect-wifi")
async def disconnect_drone_wifi(drone_id: str):
    """Déconnecter le WiFi d'un drone"""
    result = drone_service.disconnect_wifi(drone_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/drones/{drone_id}/pilot")
async def pilot_drone(drone_id: str, request: DronePilotRequest):
    """Piloter un drone"""
    result = drone_service.pilot_drone(drone_id, request.command, request.parameters)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/drones/{drone_id}/missions")
async def program_drone_mission(drone_id: str, request: DroneMissionRequest):
    """Programmer une mission de vol"""
    result = drone_service.program_mission(drone_id, request.dict())
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/drones/{drone_id}/missions")
async def get_drone_missions(drone_id: str):
    """Obtenir les missions d'un drone"""
    return drone_service.get_scheduled_missions(drone_id)

@router.delete("/drones/missions/{mission_id}")
async def cancel_drone_mission(mission_id: str):
    """Annuler une mission"""
    result = drone_service.cancel_mission(mission_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/drones/{drone_id}/stream")
async def get_drone_video_stream(drone_id: str):
    """Obtenir le flux vidéo en direct"""
    result = drone_service.get_live_video_stream(drone_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/drones/{drone_id}/telemetry")
async def get_drone_telemetry(drone_id: str):
    """Télémétrie en temps réel du drone"""
    return drone_service.get_drone_telemetry(drone_id)

@router.get("/drones/{drone_id}/history")
async def get_drone_flight_history(drone_id: str, limit: int = 50):
    """Historique des vols d'un drone"""
    return drone_service.get_flight_history(drone_id, limit)


# ============ GESTION DES ROBOTS ============

@router.get("/robots")
async def get_all_robots():
    """Liste tous les robots"""
    return robot_service.get_all_robots()

@router.get("/robots/{robot_id}")
async def get_robot(robot_id: str):
    """Obtenir un robot par ID"""
    robot = robot_service.get_robot(robot_id)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot non trouvé")
    return robot

@router.post("/robots")
async def create_robot(request: RobotCreateRequest):
    """Ajouter un nouveau robot"""
    robot = robot_service.add_robot(request.dict())
    return robot

@router.put("/robots/{robot_id}")
async def update_robot(robot_id: str, updates: Dict):
    """Mettre à jour un robot"""
    robot = robot_service.update_robot(robot_id, updates)
    if not robot:
        raise HTTPException(status_code=404, detail="Robot non trouvé")
    return robot

@router.delete("/robots/{robot_id}")
async def delete_robot(robot_id: str):
    """Supprimer un robot"""
    if not robot_service.delete_robot(robot_id):
        raise HTTPException(status_code=404, detail="Robot non trouvé")
    return {"success": True, "message": "Robot supprimé"}

@router.post("/robots/{robot_id}/connect-wifi")
async def connect_robot_wifi(robot_id: str, request: RobotWifiRequest):
    """Connecter un robot au WiFi"""
    result = robot_service.connect_wifi(robot_id, request.wifi_ssid, request.wifi_password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/robots/{robot_id}/disconnect-wifi")
async def disconnect_robot_wifi(robot_id: str):
    """Déconnecter le WiFi d'un robot"""
    result = robot_service.disconnect_wifi(robot_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/robots/{robot_id}/control")
async def control_robot(robot_id: str, request: RobotControlRequest):
    """Contrôler un robot"""
    result = robot_service.control_robot(robot_id, request.action, request.parameters)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/robots/{robot_id}/waypoints")
async def add_robot_waypoint(robot_id: str, request: WaypointRequest):
    """Ajouter un waypoint à un robot"""
    return robot_service.add_waypoint(robot_id, request.dict())

@router.get("/robots/{robot_id}/waypoints")
async def get_robot_waypoints(robot_id: str):
    """Obtenir les waypoints d'un robot"""
    return robot_service.get_waypoints(robot_id)

@router.delete("/robots/{robot_id}/waypoints")
async def clear_robot_waypoints(robot_id: str):
    """Effacer les waypoints d'un robot"""
    return robot_service.clear_waypoints(robot_id)

@router.get("/robots/{robot_id}/telemetry")
async def get_robot_telemetry(robot_id: str):
    """Télémétrie en temps réel du robot"""
    return robot_service.get_telemetry(robot_id)

@router.get("/robots/{robot_id}/history")
async def get_robot_command_history(robot_id: str, limit: int = 50):
    """Historique des commandes d'un robot"""
    return robot_service.get_command_history(robot_id, limit)


# ============ MÉTÉO ============

class WeatherRequest(BaseModel):
    lat: float
    lon: float
    lang: str = "fr"

@router.get("/weather/current")
async def get_current_weather(lat: float = 3.848, lon: float = 11.5021, lang: str = "fr"):
    """Obtenir la météo actuelle pour une position"""
    result = await weather_service.get_current_weather(lat, lon, lang)
    if result.get("success"):
        # Add agricultural advice
        advice = await weather_service.get_agricultural_advice(result)
        result["agricultural_advice"] = advice
    return result

@router.get("/weather/forecast")
async def get_weather_forecast(lat: float = 3.848, lon: float = 11.5021, lang: str = "fr"):
    """Obtenir les prévisions météo sur 5 jours"""
    return await weather_service.get_forecast(lat, lon, lang)

# ============ ANALYSE DE ZONES (Style Agremo) ============

class ZoneCoordinate(BaseModel):
    lat: float
    lng: float

class ZoneAnalysisRequest(BaseModel):
    zone_id: str
    coordinates: List[ZoneCoordinate]
    analysis_types: List[str]  # ndvi, stress, disease, humidity, thermal, crop_health

@router.post("/zones/analyze")
async def analyze_zone(request: ZoneAnalysisRequest):
    """Analyser une zone dessinée sur la carte (style Agremo)"""
    coords = [{"lat": c.lat, "lng": c.lng} for c in request.coordinates]
    result = zone_analysis_service.generate_zone_analysis(
        request.zone_id,
        coords,
        request.analysis_types
    )
    return result

@router.post("/zones/report")
async def generate_zone_report(analysis_data: Dict):
    """Générer un rapport d'analyse de zone"""
    report = zone_analysis_service.generate_report(analysis_data)
    return report

@router.get("/zones/analysis-types")
async def get_analysis_types():
    """Obtenir la liste des types d'analyses disponibles"""
    return {
        "types": [
            {
                "id": "ndvi",
                "name": "Indice NDVI",
                "description": "Indice de végétation par différence normalisée",
                "icon": "leaf"
            },
            {
                "id": "stress",
                "name": "Zones de Stress",
                "description": "Détection des zones de stress hydrique et thermique",
                "icon": "alert-triangle"
            },
            {
                "id": "disease",
                "name": "Détection Maladies",
                "description": "Identification des maladies et ravageurs",
                "icon": "bug"
            },
            {
                "id": "humidity",
                "name": "Humidité du Sol",
                "description": "Analyse de l'humidité à différentes profondeurs",
                "icon": "droplets"
            },
            {
                "id": "thermal",
                "name": "Analyse Thermique",
                "description": "Cartographie thermique et points chauds",
                "icon": "thermometer"
            },
            {
                "id": "crop_health",
                "name": "Santé des Cultures",
                "description": "Évaluation globale de la santé des cultures",
                "icon": "heart-pulse"
            }
        ]
    }
