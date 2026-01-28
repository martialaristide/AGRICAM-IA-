from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="AGRICAM IA API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =============================================================================
# ENUMS
# =============================================================================

class ParcelStatus(str, Enum):
    EXCELLENT = "excellent"
    BON = "bon"
    ATTENTION = "attention"

class SensorStatus(str, Enum):
    ACTIF = "actif"
    INACTIF = "inactif"
    ERREUR = "erreur"

class SensorType(str, Enum):
    HUMIDITY = "humidity"
    TEMPERATURE = "temperature"
    PH = "ph"
    NPK = "npk"
    CAMERA = "camera"

class MissionStatus(str, Enum):
    PLANIFIE = "planifie"
    EN_COURS = "en_cours"
    TERMINE = "termine"
    ECHOUE = "echoue"

class RecommendationPriority(str, Enum):
    URGENT = "urgent"
    ELEVEE = "elevee"
    MOYENNE = "moyenne"

class RecommendationType(str, Enum):
    IRRIGATION = "irrigation"
    FERTILISATION = "fertilisation"
    DISEASE_TREATMENT = "disease_treatment"

class IrrigationStatus(str, Enum):
    ACTIF = "actif"
    PAUSE = "pause"
    ARRETE = "arrete"

class ProductStatus(str, Enum):
    DISPONIBLE = "disponible"
    EN_NEGOCIATION = "en_negociation"
    VENDU = "vendu"

class AlertPriority(str, Enum):
    CRITIQUE = "critique"
    WARNING = "warning"
    INFO = "info"

# =============================================================================
# MODELS - Parcels
# =============================================================================

class SoilAnalysis(BaseModel):
    nitrogen: int = Field(ge=0, le=100, description="Azote (N) 0-100")
    phosphorus: int = Field(ge=0, le=100, description="Phosphore (P) 0-100")
    potassium: int = Field(ge=0, le=100, description="Potassium (K) 0-100")
    ph: float = Field(ge=0, le=14, description="pH du sol")

class Parcel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    crop_type: str
    area_hectares: float
    humidity: float
    temperature: float
    soil_analysis: SoilAnalysis
    planting_date: str
    status: ParcelStatus
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ParcelCreate(BaseModel):
    name: str
    crop_type: str
    area_hectares: float
    humidity: float
    temperature: float
    soil_analysis: SoilAnalysis
    planting_date: str
    status: ParcelStatus

# =============================================================================
# MODELS - Sensors
# =============================================================================

class Sensor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: SensorType
    parcel_id: str
    parcel_name: str
    value: float
    unit: str
    last_update: str
    status: SensorStatus
    battery_level: Optional[float] = 100

class SensorCreate(BaseModel):
    name: str
    type: SensorType
    parcel_id: str
    parcel_name: str
    value: float
    unit: str
    status: SensorStatus
    battery_level: Optional[float] = 100

# =============================================================================
# MODELS - Drone Missions
# =============================================================================

class DroneMission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    parcel_id: str
    parcel_name: str
    status: MissionStatus
    scheduled_date: str
    duration_minutes: int
    altitude_meters: int
    speed_mps: float
    capture_interval_seconds: int
    weather_conditions: str
    wind_speed_kmh: int
    progress_percent: int
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DroneMissionCreate(BaseModel):
    name: str
    parcel_id: str
    parcel_name: str
    scheduled_date: str
    duration_minutes: int
    altitude_meters: int
    speed_mps: float
    capture_interval_seconds: int
    weather_conditions: str
    wind_speed_kmh: int

# =============================================================================
# MODELS - Satellite/Drone Images
# =============================================================================

class AerialImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parcel_id: str
    parcel_name: str
    source: str  # "drone" or "satellite"
    capture_date: str
    ndvi_value: float
    health_percent: int
    stress_zones: int
    image_url: str
    analysis_result: Optional[dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AerialImageCreate(BaseModel):
    parcel_id: str
    parcel_name: str
    source: str
    capture_date: str
    ndvi_value: float
    health_percent: int
    stress_zones: int
    image_url: str

# =============================================================================
# MODELS - AI Image Analysis
# =============================================================================

class ImageAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parcel_id: str
    parcel_name: str
    source: str
    capture_date: str
    image_url: str
    crop_recognized: str
    crop_confidence: int
    growth_rate: float
    diseases_detected: List[dict] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Irrigation
# =============================================================================

class IrrigationZone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    is_active: bool
    water_used_liters: int

class IrrigationSystem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parcel_id: str
    parcel_name: str
    status: IrrigationStatus
    is_automatic: bool
    efficiency_percent: int
    water_used_today_liters: int
    zones: List[IrrigationZone] = []
    last_activation: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class IrrigationSystemCreate(BaseModel):
    parcel_id: str
    parcel_name: str
    is_automatic: bool
    efficiency_percent: int
    zones: List[dict] = []

# =============================================================================
# MODELS - AI Recommendations
# =============================================================================

class Recommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parcel_id: str
    parcel_name: str
    type: RecommendationType
    priority: RecommendationPriority
    title: str
    message: str
    confidence_percent: int
    deadline_hours: Optional[int] = None
    status: str = "pending"  # pending, applied, ignored, postponed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RecommendationCreate(BaseModel):
    parcel_id: str
    parcel_name: str
    type: RecommendationType
    priority: RecommendationPriority
    title: str
    message: str
    confidence_percent: int
    deadline_hours: Optional[int] = None

# =============================================================================
# MODELS - Marketplace
# =============================================================================

class MarketplaceProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    quantity: float
    unit: str
    price_per_unit: float
    currency: str = "EUR"
    location: str
    available_date: str
    description: str
    certifications: List[str] = []
    is_bio: bool = False
    is_premium: bool = False
    status: ProductStatus
    image_url: str
    seller_name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MarketplaceProductCreate(BaseModel):
    title: str
    category: str
    quantity: float
    unit: str
    price_per_unit: float
    location: str
    available_date: str
    description: str
    certifications: List[str] = []
    is_bio: bool = False
    is_premium: bool = False
    image_url: str
    seller_name: str

# =============================================================================
# MODELS - Alerts
# =============================================================================

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    title: str
    message: str
    priority: AlertPriority
    parcel_name: Optional[str] = None
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Dashboard Stats
# =============================================================================

class DashboardStats(BaseModel):
    parcels_count: int
    average_humidity: float
    average_temperature: float
    active_alerts: int
    active_sensors: int
    inactive_sensors: int
    error_sensors: int
    active_drones: int
    planned_missions: int
    images_captured: int
    ai_efficiency: int
    active_irrigation_systems: int
    average_irrigation_efficiency: int
    water_used_today: int
    recommendations_count: int
    high_priority_recommendations: int

# =============================================================================
# API ROUTES - Root
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "AGRICAM IA API - Agriculture de précision intelligente"}

# =============================================================================
# API ROUTES - Dashboard
# =============================================================================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    parcels = await db.parcels.find({}, {"_id": 0}).to_list(100)
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    alerts = await db.alerts.find({"is_read": False}, {"_id": 0}).to_list(100)
    missions = await db.drone_missions.find({}, {"_id": 0}).to_list(100)
    images = await db.aerial_images.find({}, {"_id": 0}).to_list(100)
    irrigation = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
    recommendations = await db.recommendations.find({"status": "pending"}, {"_id": 0}).to_list(100)
    
    active_sensors = len([s for s in sensors if s.get('status') == 'actif'])
    inactive_sensors = len([s for s in sensors if s.get('status') == 'inactif'])
    error_sensors = len([s for s in sensors if s.get('status') == 'erreur'])
    
    avg_humidity = sum(p.get('humidity', 0) for p in parcels) / max(len(parcels), 1)
    avg_temp = sum(p.get('temperature', 0) for p in parcels) / max(len(parcels), 1)
    
    active_irrigation = [i for i in irrigation if i.get('status') == 'actif']
    avg_irrigation_eff = sum(i.get('efficiency_percent', 0) for i in active_irrigation) / max(len(active_irrigation), 1)
    water_today = sum(i.get('water_used_today_liters', 0) for i in irrigation)
    
    high_priority = len([r for r in recommendations if r.get('priority') in ['urgent', 'elevee']])
    
    return DashboardStats(
        parcels_count=len(parcels),
        average_humidity=round(avg_humidity, 1),
        average_temperature=round(avg_temp, 1),
        active_alerts=len(alerts),
        active_sensors=active_sensors,
        inactive_sensors=inactive_sensors,
        error_sensors=error_sensors,
        active_drones=len([m for m in missions if m.get('status') == 'en_cours']),
        planned_missions=len([m for m in missions if m.get('status') == 'planifie']),
        images_captured=len(images),
        ai_efficiency=87,
        active_irrigation_systems=len(active_irrigation),
        average_irrigation_efficiency=round(avg_irrigation_eff),
        water_used_today=water_today,
        recommendations_count=len(recommendations),
        high_priority_recommendations=high_priority
    )

# =============================================================================
# API ROUTES - Parcels
# =============================================================================

@api_router.get("/parcels", response_model=List[Parcel])
async def get_parcels():
    parcels = await db.parcels.find({}, {"_id": 0}).to_list(100)
    return parcels

@api_router.get("/parcels/{parcel_id}", response_model=Parcel)
async def get_parcel(parcel_id: str):
    parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    return parcel

@api_router.post("/parcels", response_model=Parcel)
async def create_parcel(data: ParcelCreate):
    parcel = Parcel(**data.model_dump())
    doc = parcel.model_dump()
    await db.parcels.insert_one(doc)
    return parcel

@api_router.put("/parcels/{parcel_id}", response_model=Parcel)
async def update_parcel(parcel_id: str, data: ParcelCreate):
    existing = await db.parcels.find_one({"id": parcel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    update_data = data.model_dump()
    await db.parcels.update_one({"id": parcel_id}, {"$set": update_data})
    updated = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
    return updated

# =============================================================================
# API ROUTES - Sensors
# =============================================================================

@api_router.get("/sensors", response_model=List[Sensor])
async def get_sensors():
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    return sensors

@api_router.get("/sensors/stats")
async def get_sensors_stats():
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    return {
        "total": len(sensors),
        "actif": len([s for s in sensors if s.get('status') == 'actif']),
        "inactif": len([s for s in sensors if s.get('status') == 'inactif']),
        "erreur": len([s for s in sensors if s.get('status') == 'erreur'])
    }

@api_router.post("/sensors", response_model=Sensor)
async def create_sensor(data: SensorCreate):
    sensor = Sensor(
        **data.model_dump(),
        last_update=datetime.now(timezone.utc).isoformat()
    )
    doc = sensor.model_dump()
    await db.sensors.insert_one(doc)
    return sensor

@api_router.put("/sensors/{sensor_id}/value")
async def update_sensor_value(sensor_id: str, value: float):
    result = await db.sensors.update_one(
        {"id": sensor_id},
        {"$set": {"value": value, "last_update": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    return {"message": "Valeur mise à jour"}

# =============================================================================
# API ROUTES - Drone Missions
# =============================================================================

@api_router.get("/drone-missions", response_model=List[DroneMission])
async def get_drone_missions():
    missions = await db.drone_missions.find({}, {"_id": 0}).to_list(100)
    return missions

@api_router.get("/drone-missions/stats")
async def get_drone_stats():
    missions = await db.drone_missions.find({}, {"_id": 0}).to_list(100)
    images = await db.aerial_images.find({"source": "drone"}, {"_id": 0}).to_list(1000)
    return {
        "active_drones": len([m for m in missions if m.get('status') == 'en_cours']),
        "planned_missions": len([m for m in missions if m.get('status') == 'planifie']),
        "completed_missions": len([m for m in missions if m.get('status') == 'termine']),
        "images_captured": len(images),
        "average_efficiency": 87
    }

@api_router.post("/drone-missions", response_model=DroneMission)
async def create_drone_mission(data: DroneMissionCreate):
    mission = DroneMission(
        **data.model_dump(),
        status=MissionStatus.PLANIFIE,
        progress_percent=0
    )
    doc = mission.model_dump()
    await db.drone_missions.insert_one(doc)
    return mission

@api_router.put("/drone-missions/{mission_id}/control")
async def control_drone_mission(mission_id: str, action: str = Query(...)):
    mission = await db.drone_missions.find_one({"id": mission_id})
    if not mission:
        raise HTTPException(status_code=404, detail="Mission non trouvée")
    
    status_map = {
        "start": MissionStatus.EN_COURS,
        "pause": MissionStatus.PLANIFIE,
        "stop": MissionStatus.ECHOUE,
        "complete": MissionStatus.TERMINE
    }
    
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    new_status = status_map[action]
    progress = 100 if action == "complete" else mission.get('progress_percent', 0)
    
    await db.drone_missions.update_one(
        {"id": mission_id},
        {"$set": {"status": new_status.value, "progress_percent": progress}}
    )
    return {"message": f"Mission {action}", "status": new_status.value}

# =============================================================================
# API ROUTES - Aerial Images
# =============================================================================

@api_router.get("/aerial-images", response_model=List[AerialImage])
async def get_aerial_images():
    images = await db.aerial_images.find({}, {"_id": 0}).to_list(100)
    return images

@api_router.get("/aerial-images/stats")
async def get_aerial_images_stats():
    images = await db.aerial_images.find({}, {"_id": 0}).to_list(100)
    avg_ndvi = sum(i.get('ndvi_value', 0) for i in images) / max(len(images), 1)
    total_stress = sum(i.get('stress_zones', 0) for i in images)
    return {
        "total_images": len(images),
        "average_ndvi": round(avg_ndvi * 100),
        "total_stress_zones": total_stress
    }

@api_router.post("/aerial-images", response_model=AerialImage)
async def create_aerial_image(data: AerialImageCreate):
    image = AerialImage(**data.model_dump())
    doc = image.model_dump()
    await db.aerial_images.insert_one(doc)
    return image

# =============================================================================
# API ROUTES - Image Analysis
# =============================================================================

@api_router.get("/image-analysis", response_model=List[ImageAnalysis])
async def get_image_analyses():
    analyses = await db.image_analyses.find({}, {"_id": 0}).to_list(100)
    return analyses

@api_router.get("/image-analysis/stats")
async def get_image_analysis_stats():
    analyses = await db.image_analyses.find({}, {"_id": 0}).to_list(100)
    total_diseases = sum(len(a.get('diseases_detected', [])) for a in analyses)
    avg_confidence = sum(a.get('crop_confidence', 0) for a in analyses) / max(len(analyses), 1)
    return {
        "total_analyzed": len(analyses),
        "crop_precision": round(avg_confidence),
        "diseases_detected": total_diseases,
        "ai_precision": 94
    }

@api_router.post("/image-analysis/{image_id}/analyze")
async def analyze_image(image_id: str):
    image = await db.aerial_images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    # Simulated AI analysis
    analysis = ImageAnalysis(
        parcel_id=image['parcel_id'],
        parcel_name=image['parcel_name'],
        source=image['source'],
        capture_date=image['capture_date'],
        image_url=image['image_url'],
        crop_recognized="Blé" if "Nord" in image['parcel_name'] else "Maïs",
        crop_confidence=94 if "Nord" in image['parcel_name'] else 96,
        growth_rate=1.2 if "Nord" in image['parcel_name'] else 1.8,
        diseases_detected=[
            {"name": "Rouille brune", "severity": "Faible", "confidence": 78}
        ] if "Nord" in image['parcel_name'] else []
    )
    
    doc = analysis.model_dump()
    await db.image_analyses.insert_one(doc)
    return analysis

# =============================================================================
# API ROUTES - Irrigation
# =============================================================================

@api_router.get("/irrigation", response_model=List[IrrigationSystem])
async def get_irrigation_systems():
    systems = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
    return systems

@api_router.get("/irrigation/stats")
async def get_irrigation_stats():
    systems = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
    active = [s for s in systems if s.get('status') == 'actif']
    avg_eff = sum(s.get('efficiency_percent', 0) for s in active) / max(len(active), 1)
    water_today = sum(s.get('water_used_today_liters', 0) for s in systems)
    return {
        "active_systems": len(active),
        "average_efficiency": round(avg_eff),
        "water_used_today": water_today,
        "monitoring": "24/7"
    }

@api_router.post("/irrigation", response_model=IrrigationSystem)
async def create_irrigation_system(data: IrrigationSystemCreate):
    system = IrrigationSystem(
        **data.model_dump(),
        status=IrrigationStatus.ACTIF,
        water_used_today_liters=0
    )
    doc = system.model_dump()
    await db.irrigation_systems.insert_one(doc)
    return system

@api_router.put("/irrigation/{system_id}/control")
async def control_irrigation(system_id: str, action: str = Query(...)):
    system = await db.irrigation_systems.find_one({"id": system_id})
    if not system:
        raise HTTPException(status_code=404, detail="Système non trouvé")
    
    status_map = {
        "start": IrrigationStatus.ACTIF,
        "pause": IrrigationStatus.PAUSE,
        "stop": IrrigationStatus.ARRETE
    }
    
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    new_status = status_map[action]
    await db.irrigation_systems.update_one(
        {"id": system_id},
        {"$set": {
            "status": new_status.value,
            "last_activation": datetime.now(timezone.utc).isoformat() if action == "start" else system.get('last_activation')
        }}
    )
    return {"message": f"Irrigation {action}", "status": new_status.value}

# =============================================================================
# API ROUTES - Recommendations
# =============================================================================

@api_router.get("/recommendations", response_model=List[Recommendation])
async def get_recommendations():
    recs = await db.recommendations.find({}, {"_id": 0}).to_list(100)
    return recs

@api_router.get("/recommendations/stats")
async def get_recommendations_stats():
    recs = await db.recommendations.find({"status": "pending"}, {"_id": 0}).to_list(100)
    high_priority = len([r for r in recs if r.get('priority') in ['urgent', 'elevee']])
    avg_confidence = sum(r.get('confidence_percent', 0) for r in recs) / max(len(recs), 1)
    avg_deadline = sum(r.get('deadline_hours', 24) for r in recs) / max(len(recs), 1)
    return {
        "total": len(recs),
        "high_priority": high_priority,
        "average_confidence": round(avg_confidence),
        "average_deadline_hours": round(avg_deadline)
    }

@api_router.post("/recommendations", response_model=Recommendation)
async def create_recommendation(data: RecommendationCreate):
    rec = Recommendation(**data.model_dump())
    doc = rec.model_dump()
    await db.recommendations.insert_one(doc)
    return rec

@api_router.put("/recommendations/{rec_id}/action")
async def update_recommendation_status(rec_id: str, action: str = Query(...)):
    if action not in ["apply", "postpone", "ignore"]:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    status_map = {"apply": "applied", "postpone": "postponed", "ignore": "ignored"}
    result = await db.recommendations.update_one(
        {"id": rec_id},
        {"$set": {"status": status_map[action]}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Recommandation non trouvée")
    return {"message": f"Recommandation {action}", "status": status_map[action]}

# =============================================================================
# API ROUTES - Marketplace
# =============================================================================

@api_router.get("/marketplace/products", response_model=List[MarketplaceProduct])
async def get_marketplace_products(
    category: Optional[str] = None,
    is_bio: Optional[bool] = None,
    status: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if is_bio is not None:
        query["is_bio"] = is_bio
    if status:
        query["status"] = status
    
    products = await db.marketplace_products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.post("/marketplace/products", response_model=MarketplaceProduct)
async def create_marketplace_product(data: MarketplaceProductCreate):
    product = MarketplaceProduct(
        **data.model_dump(),
        status=ProductStatus.DISPONIBLE
    )
    doc = product.model_dump()
    await db.marketplace_products.insert_one(doc)
    return product

@api_router.put("/marketplace/products/{product_id}/status")
async def update_product_status(product_id: str, status: ProductStatus):
    result = await db.marketplace_products.update_one(
        {"id": product_id},
        {"$set": {"status": status.value}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    return {"message": "Statut mis à jour", "status": status.value}

# =============================================================================
# API ROUTES - Alerts
# =============================================================================

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(unread_only: bool = False):
    query = {"is_read": False} if unread_only else {}
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: Alert):
    doc = alert.model_dump()
    await db.alerts.insert_one(doc)
    return alert

@api_router.put("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str):
    result = await db.alerts.update_one({"id": alert_id}, {"$set": {"is_read": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    return {"message": "Alerte marquée comme lue"}

# =============================================================================
# SEED DATA
# =============================================================================

@api_router.post("/seed")
async def seed_database():
    """Initialize database with demo data"""
    
    # Clear existing data
    await db.parcels.delete_many({})
    await db.sensors.delete_many({})
    await db.drone_missions.delete_many({})
    await db.aerial_images.delete_many({})
    await db.image_analyses.delete_many({})
    await db.irrigation_systems.delete_many({})
    await db.recommendations.delete_many({})
    await db.marketplace_products.delete_many({})
    await db.alerts.delete_many({})
    
    # Seed Parcels
    parcels_data = [
        {
            "id": "p1",
            "name": "Parcelle Nord",
            "crop_type": "Blé",
            "area_hectares": 15.5,
            "humidity": 68,
            "temperature": 22,
            "soil_analysis": {"nitrogen": 78, "phosphorus": 45, "potassium": 92, "ph": 6.8},
            "planting_date": "15/03/2024",
            "status": "bon",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p2",
            "name": "Parcelle Sud",
            "crop_type": "Maïs",
            "area_hectares": 23.2,
            "humidity": 75,
            "temperature": 24,
            "soil_analysis": {"nitrogen": 85, "phosphorus": 52, "potassium": 88, "ph": 7.2},
            "planting_date": "10/04/2024",
            "status": "excellent",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p3",
            "name": "Parcelle Est",
            "crop_type": "Tournesol",
            "area_hectares": 18.7,
            "humidity": 45,
            "temperature": 26,
            "soil_analysis": {"nitrogen": 62, "phosphorus": 38, "potassium": 74, "ph": 6.5},
            "planting_date": "25/04/2024",
            "status": "attention",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.parcels.insert_many(parcels_data)
    
    # Seed Sensors
    sensors_data = [
        {"id": "s1", "name": "Humidité", "type": "humidity", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "value": 68, "unit": "%", "last_update": "20/01/2024 11:30:00", "status": "actif", "battery_level": 85},
        {"id": "s2", "name": "Température", "type": "temperature", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "value": 22, "unit": "°C", "last_update": "20/01/2024 11:30:00", "status": "actif", "battery_level": 92},
        {"id": "s3", "name": "pH du sol", "type": "ph", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "value": 7.2, "unit": "pH", "last_update": "20/01/2024 11:31:00", "status": "actif", "battery_level": 78},
        {"id": "s4", "name": "NPK", "type": "npk", "parcel_id": "p3", "parcel_name": "Parcelle Est", "value": 74, "unit": "ppm", "last_update": "20/01/2024 11:32:00", "status": "erreur", "battery_level": 45},
        {"id": "s5", "name": "Camera", "type": "camera", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "value": 1, "unit": "active", "last_update": "20/01/2024 11:33:00", "status": "actif", "battery_level": 100}
    ]
    await db.sensors.insert_many(sensors_data)
    
    # Seed Drone Missions
    missions_data = [
        {
            "id": "m1",
            "name": "Mission surveillance Parcelle Est",
            "parcel_id": "p3",
            "parcel_name": "Parcelle Est",
            "status": "planifie",
            "scheduled_date": "18/01/2024",
            "duration_minutes": 25,
            "altitude_meters": 75,
            "speed_mps": 4,
            "capture_interval_seconds": 3,
            "weather_conditions": "Favorable",
            "wind_speed_kmh": 8,
            "progress_percent": 95,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "m2",
            "name": "Cartographie NDVI Parcelle Nord",
            "parcel_id": "p1",
            "parcel_name": "Parcelle Nord",
            "status": "termine",
            "scheduled_date": "15/01/2024",
            "duration_minutes": 32,
            "altitude_meters": 80,
            "speed_mps": 3.5,
            "capture_interval_seconds": 2,
            "weather_conditions": "Excellent",
            "wind_speed_kmh": 5,
            "progress_percent": 78,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.drone_missions.insert_many(missions_data)
    
    # Seed Aerial Images
    images_data = [
        {
            "id": "img1",
            "parcel_id": "p1",
            "parcel_name": "Parcelle Nord",
            "source": "drone",
            "capture_date": "18/01/2024",
            "ndvi_value": 0.75,
            "health_percent": 82,
            "stress_zones": 5,
            "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "img2",
            "parcel_id": "p2",
            "parcel_name": "Parcelle Sud",
            "source": "satellite",
            "capture_date": "18/01/2024",
            "ndvi_value": 0.68,
            "health_percent": 88,
            "stress_zones": 2,
            "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.aerial_images.insert_many(images_data)
    
    # Seed Image Analyses
    analyses_data = [
        {
            "id": "an1",
            "parcel_id": "p1",
            "parcel_name": "Parcelle Nord",
            "source": "drone",
            "capture_date": "18/01/2024",
            "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
            "crop_recognized": "Blé",
            "crop_confidence": 94,
            "growth_rate": 1.2,
            "diseases_detected": [{"name": "Rouille brune", "severity": "Faible", "confidence": 78}],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "an2",
            "parcel_id": "p2",
            "parcel_name": "Parcelle Sud",
            "source": "satellite",
            "capture_date": "18/01/2024",
            "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "crop_recognized": "Maïs",
            "crop_confidence": 96,
            "growth_rate": 1.8,
            "diseases_detected": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.image_analyses.insert_many(analyses_data)
    
    # Seed Irrigation Systems
    irrigation_data = [
        {
            "id": "irr1",
            "parcel_id": "p1",
            "parcel_name": "Parcelle Nord",
            "status": "actif",
            "is_automatic": True,
            "efficiency_percent": 87,
            "water_used_today_liters": 1250,
            "zones": [{"id": "z1", "name": "Zone A", "is_active": True, "water_used_liters": 650}, {"id": "z2", "name": "Zone B", "is_active": True, "water_used_liters": 600}],
            "last_activation": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.irrigation_systems.insert_many(irrigation_data)
    
    # Seed Recommendations
    recommendations_data = [
        {
            "id": "rec1",
            "parcel_id": "p3",
            "parcel_name": "Parcelle Est",
            "type": "irrigation",
            "priority": "elevee",
            "title": "Irrigation d'urgence nécessaire",
            "message": "Le niveau d'humidité du sol est critique (45%). Activation automatique de l'irrigation recommandée dans les 2h.",
            "confidence_percent": 94,
            "deadline_hours": 2,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec2",
            "parcel_id": "p3",
            "parcel_name": "Parcelle Est",
            "type": "disease_treatment",
            "priority": "urgent",
            "title": "Traitement anti-mildiou requis",
            "message": "Détection de mildiou sur 4.2 ha avec 85% de confiance. Traitement fongicide recommandé sous 24h.",
            "confidence_percent": 85,
            "deadline_hours": 24,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec3",
            "parcel_id": "p1",
            "parcel_name": "Parcelle Nord",
            "type": "fertilisation",
            "priority": "moyenne",
            "title": "Optimisation phosphore",
            "message": "Apport ciblé en phosphore pour maximiser le rendement en période de floraison.",
            "confidence_percent": 78,
            "deadline_hours": 48,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.recommendations.insert_many(recommendations_data)
    
    # Seed Marketplace Products
    products_data = [
        {
            "id": "prod1",
            "title": "Blé bio",
            "category": "cereals",
            "quantity": 25,
            "unit": "tonnes",
            "price_per_unit": 320,
            "currency": "EUR",
            "location": "Beauce, France",
            "available_date": "15/07/2024",
            "description": "Blé tendre biologique de haute qualité, certification AB. Taux de protéines 12.5%.",
            "certifications": ["Agriculture Biologique", "HVE Niveau 3"],
            "is_bio": True,
            "is_premium": False,
            "status": "disponible",
            "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800",
            "seller_name": "Ferme du Soleil",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod2",
            "title": "Maïs grain",
            "category": "cereals",
            "quantity": 45,
            "unit": "tonnes",
            "price_per_unit": 185,
            "currency": "EUR",
            "location": "Bresse, France",
            "available_date": "20/09/2024",
            "description": "Maïs grain premium, humidité 14%, sans OGM. Idéal pour alimentation animale.",
            "certifications": ["Sans OGM", "Traçabilité complète"],
            "is_bio": False,
            "is_premium": True,
            "status": "en_negociation",
            "image_url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800",
            "seller_name": "Coopérative Bressane",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.marketplace_products.insert_many(products_data)
    
    # Seed Alerts
    alerts_data = [
        {
            "id": "alert1",
            "type": "disease",
            "title": "Maladie détectée par IA",
            "message": "Mildiou identifié sur Parcelle Est avec 85% de confiance - Action immédiate requise",
            "priority": "critique",
            "parcel_name": "Parcelle Est",
            "is_read": False,
            "created_at": "2024-01-20T10:15:00Z"
        },
        {
            "id": "alert2",
            "type": "irrigation",
            "title": "Seuil d'irrigation atteint",
            "message": "Humidité critique (45%) - Système d'irrigation automatique activé",
            "priority": "warning",
            "parcel_name": "Parcelle Est",
            "is_read": False,
            "created_at": "2024-01-20T10:10:00Z"
        },
        {
            "id": "alert3",
            "type": "drone",
            "title": "Vol de drone programmé",
            "message": "Mission de surveillance prévue demain 8h - Conditions météo favorables",
            "priority": "info",
            "parcel_name": "Parcelle Est",
            "is_read": False,
            "created_at": "2024-01-20T08:00:00Z"
        }
    ]
    await db.alerts.insert_many(alerts_data)
    
    return {"message": "Base de données initialisée avec les données de démonstration"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("AGRICAM IA API starting...")
    # Check if data exists, if not seed it
    count = await db.parcels.count_documents({})
    if count == 0:
        logger.info("Seeding database with demo data...")
        await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
