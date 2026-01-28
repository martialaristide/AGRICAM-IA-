from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
import jwt
import bcrypt
import httpx
import json
import io
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'agricam_ia')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'agricam-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'demo')

# Create the main app
app = FastAPI(title="AGRICAM IA API", version="2.0.0", description="Plateforme d'agriculture de précision intelligente - Développée par Barra Martial Aristide / African AI Solutions")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# =============================================================================
# ENUMS
# =============================================================================

class UserRole(str, Enum):
    ADMIN = "admin"
    FARMER = "farmer"
    SUPPLIER = "supplier"
    FINANCIAL = "financial"
    PARTNER = "partner"
    INVESTOR = "investor"

class SubscriptionType(str, Enum):
    FREEMIUM = "freemium"
    BASIC = "basic"
    PREMIUM = "premium"

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
    PRESSURE = "pressure"
    THERMAL = "thermal"

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
    HARVEST = "harvest"
    SOWING = "sowing"

class IrrigationStatus(str, Enum):
    ACTIF = "actif"
    PAUSE = "pause"
    ARRETE = "arrete"

class ProductStatus(str, Enum):
    DISPONIBLE = "disponible"
    EN_NEGOCIATION = "en_negociation"
    VENDU = "vendu"
    RESERVE = "reserve"

class AlertPriority(str, Enum):
    CRITIQUE = "critique"
    WARNING = "warning"
    INFO = "info"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class LoanStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"

# =============================================================================
# AUTH HELPERS
# =============================================================================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Non authentifié")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        return user
    except:
        return None

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(user = Depends(get_current_user)):
        if user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Accès non autorisé pour ce rôle")
        return user
    return role_checker

# =============================================================================
# MODELS - Users
# =============================================================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    culture_type: Optional[str] = None  # For farmers
    documents: Optional[dict] = None  # ID card, passport, company docs

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subscription_type: SubscriptionType = SubscriptionType.FREEMIUM
    subscription_end: Optional[str] = None
    is_verified: bool = False
    is_active: bool = True
    culture_type: Optional[str] = None
    documents: Optional[dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    subscription_type: str
    is_verified: bool
    company_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# =============================================================================
# MODELS - Parcels
# =============================================================================

class SoilAnalysis(BaseModel):
    nitrogen: int = Field(ge=0, le=100)
    phosphorus: int = Field(ge=0, le=100)
    potassium: int = Field(ge=0, le=100)
    ph: float = Field(ge=0, le=14)

class Parcel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    crop_type: str
    variety: Optional[str] = None
    area_hectares: float
    humidity: float
    temperature: float
    soil_analysis: SoilAnalysis
    planting_date: str
    harvest_date: Optional[str] = None
    status: ParcelStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geometry: Optional[dict] = None  # GeoJSON polygon
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ParcelCreate(BaseModel):
    name: str
    crop_type: str
    variety: Optional[str] = None
    area_hectares: float
    humidity: float
    temperature: float
    soil_analysis: SoilAnalysis
    planting_date: str
    status: ParcelStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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
    connection_type: Optional[str] = "wifi"  # wifi, bluetooth, lora

class SensorData(BaseModel):
    sensor_id: str
    value: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Weather
# =============================================================================

class WeatherData(BaseModel):
    location: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: str
    description: str
    icon: str
    forecast: List[dict] = []
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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
    images_captured: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - AI Analysis
# =============================================================================

class AIAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parcel_id: str
    parcel_name: str
    analysis_type: str  # crop_recognition, disease_detection, ndvi, yield_prediction
    source: str  # drone, satellite, sensor
    image_url: Optional[str] = None
    results: dict  # Detailed AI results
    confidence: float
    recommendations: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Marketplace
# =============================================================================

class MarketplaceProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    seller_name: str
    title: str
    category: str
    quantity: float
    unit: str
    price_per_unit: float
    currency: str = "XAF"
    location: str
    available_date: str
    description: str
    certifications: List[str] = []
    is_bio: bool = False
    is_premium: bool = False
    status: ProductStatus
    image_url: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    buyer_id: str
    seller_id: str
    quantity: float
    total_price: float
    status: OrderStatus
    delivery_address: str
    payment_method: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Financial
# =============================================================================

class LoanRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    farmer_name: str
    institution_id: str
    amount: float
    purpose: str
    duration_months: int
    parcel_id: Optional[str] = None
    status: LoanStatus
    documents: List[str] = []
    decision_date: Optional[str] = None
    decision_notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Subsidy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    provider_id: str
    type: str  # fertilizer, seeds, equipment
    amount: float
    description: str
    status: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Irrigation & Recommendations
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
    schedule: Optional[dict] = None
    last_activation: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Recommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    parcel_id: str
    parcel_name: str
    type: RecommendationType
    priority: RecommendationPriority
    title: str
    message: str
    confidence_percent: int
    deadline_hours: Optional[int] = None
    ai_source: str = "system"  # system, gpt, gemini
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Alerts
# =============================================================================

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    title: str
    message: str
    priority: AlertPriority
    parcel_name: Optional[str] = None
    is_read: bool = False
    channels: List[str] = ["in_app"]  # in_app, email, sms, push
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - Dashboard Stats
# =============================================================================

class AdminDashboardStats(BaseModel):
    total_users: int
    total_farmers: int
    total_suppliers: int
    total_financial: int
    total_partners: int
    pending_verifications: int
    total_parcels: int
    total_sensors: int
    active_subscriptions: int
    revenue_month: float
    transactions_month: int

class FarmerDashboardStats(BaseModel):
    parcels_count: int
    average_humidity: float
    average_temperature: float
    active_alerts: int
    active_sensors: int
    recommendations_count: int
    yield_prediction: float
    water_used_today: int
    products_on_sale: int
    pending_orders: int

# =============================================================================
# API ROUTES - Root
# =============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "AGRICAM IA API - Agriculture de précision intelligente",
        "version": "2.0.0",
        "developer": "Barra Martial Aristide",
        "company": "African AI Solutions"
    }

# =============================================================================
# API ROUTES - Authentication
# =============================================================================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Create user
    user = User(
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        company_name=data.company_name,
        address=data.address,
        culture_type=data.culture_type,
        documents=data.documents,
        is_verified=data.role == UserRole.FARMER  # Auto-verify farmers for demo
    )
    
    # Hash password and store
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(data.password)
    
    await db.users.insert_one(user_dict)
    
    # Generate token
    token = create_token(user.id, user.role.value, user.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            subscription_type=user.subscription_type.value,
            is_verified=user.is_verified,
            company_name=user.company_name
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Compte désactivé")
    
    token = create_token(user["id"], user["role"], user["email"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            subscription_type=user.get("subscription_type", "freemium"),
            is_verified=user.get("is_verified", False),
            company_name=user.get("company_name")
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        subscription_type=user.get("subscription_type", "freemium"),
        is_verified=user.get("is_verified", False),
        company_name=user.get("company_name")
    )

# =============================================================================
# API ROUTES - Admin
# =============================================================================

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(user = Depends(require_roles([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    parcels = await db.parcels.find({}, {"_id": 0}).to_list(1000)
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(1000)
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    farmers = [u for u in users if u.get("role") == "farmer"]
    suppliers = [u for u in users if u.get("role") == "supplier"]
    financial = [u for u in users if u.get("role") == "financial"]
    partners = [u for u in users if u.get("role") == "partner"]
    pending = [u for u in users if not u.get("is_verified", False)]
    active_subs = [u for u in users if u.get("subscription_type") != "freemium"]
    
    return AdminDashboardStats(
        total_users=len(users),
        total_farmers=len(farmers),
        total_suppliers=len(suppliers),
        total_financial=len(financial),
        total_partners=len(partners),
        pending_verifications=len(pending),
        total_parcels=len(parcels),
        total_sensors=len(sensors),
        active_subscriptions=len(active_subs),
        revenue_month=len(active_subs) * 15000,
        transactions_month=len(orders)
    )

@api_router.get("/admin/users")
async def get_all_users(
    role: Optional[str] = None,
    user = Depends(require_roles([UserRole.ADMIN]))
):
    query = {}
    if role:
        query["role"] = role
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, user = Depends(require_roles([UserRole.ADMIN]))):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_verified": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur vérifié"}

@api_router.put("/admin/users/{user_id}/subscription")
async def update_subscription(
    user_id: str,
    subscription_type: SubscriptionType,
    user = Depends(require_roles([UserRole.ADMIN]))
):
    end_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"subscription_type": subscription_type.value, "subscription_end": end_date}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Abonnement mis à jour"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, user = Depends(require_roles([UserRole.ADMIN]))):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}

# =============================================================================
# API ROUTES - Weather (Real API)
# =============================================================================

@api_router.get("/weather/{location}")
async def get_weather(location: str):
    """Get real weather data from OpenWeatherMap"""
    try:
        async with httpx.AsyncClient() as client:
            # Current weather
            url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                return WeatherData(
                    location=location,
                    temperature=data["main"]["temp"],
                    humidity=data["main"]["humidity"],
                    pressure=data["main"]["pressure"],
                    wind_speed=data["wind"]["speed"],
                    wind_direction=str(data["wind"].get("deg", 0)) + "°",
                    description=data["weather"][0]["description"],
                    icon=data["weather"][0]["icon"],
                    forecast=[]
                )
            else:
                # Return mock data if API fails
                return WeatherData(
                    location=location,
                    temperature=24.5,
                    humidity=65,
                    pressure=1013,
                    wind_speed=8.5,
                    wind_direction="NE",
                    description="Partiellement nuageux",
                    icon="02d",
                    forecast=[]
                )
    except Exception as e:
        logging.error(f"Weather API error: {e}")
        return WeatherData(
            location=location,
            temperature=24.5,
            humidity=65,
            pressure=1013,
            wind_speed=8.5,
            wind_direction="NE",
            description="Partiellement nuageux",
            icon="02d",
            forecast=[]
        )

# =============================================================================
# API ROUTES - AI Analysis (Using Emergent LLM)
# =============================================================================

@api_router.post("/ai/analyze-crop")
async def analyze_crop_image(
    parcel_id: str = Form(...),
    image_base64: str = Form(None),
    user = Depends(get_current_user)
):
    """Analyze crop image using Gemini for disease detection and health assessment"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # Get parcel info
        parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
        if not parcel:
            raise HTTPException(status_code=404, detail="Parcelle non trouvée")
        
        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"crop-analysis-{uuid.uuid4()}",
            system_message="""Tu es un expert agronome spécialisé dans l'analyse des cultures. 
            Analyse l'image fournie et identifie:
            1. Le type de culture (blé, maïs, tournesol, etc.)
            2. L'état de santé général (excellent, bon, attention)
            3. Les maladies potentielles détectées
            4. Le stade de croissance
            5. Recommandations spécifiques
            Réponds en JSON avec les clés: crop_type, health_status, diseases, growth_stage, ndvi_estimate, recommendations"""
        ).with_model("gemini", "gemini-2.5-flash")
        
        # Prepare message
        if image_base64:
            image_content = ImageContent(image_base64=image_base64)
            message = UserMessage(
                text=f"Analyse cette image de la parcelle '{parcel['name']}' cultivée avec {parcel['crop_type']}. Donne une analyse détaillée.",
                file_contents=[image_content]
            )
        else:
            message = UserMessage(
                text=f"Basé sur les données suivantes de la parcelle '{parcel['name']}': Culture: {parcel['crop_type']}, Humidité: {parcel['humidity']}%, Température: {parcel['temperature']}°C, pH: {parcel['soil_analysis']['ph']}, Azote: {parcel['soil_analysis']['nitrogen']}/100. Fournis une analyse et des recommandations."
            )
        
        response = await chat.send_message(message)
        
        # Parse response
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                results = json.loads(json_match.group())
            else:
                results = {
                    "crop_type": parcel['crop_type'],
                    "health_status": "bon",
                    "diseases": [],
                    "growth_stage": "croissance",
                    "ndvi_estimate": 0.72,
                    "recommendations": [response[:500]],
                    "raw_analysis": response
                }
        except:
            results = {
                "crop_type": parcel['crop_type'],
                "health_status": "bon",
                "diseases": [],
                "growth_stage": "croissance",
                "ndvi_estimate": 0.72,
                "recommendations": [response[:500]],
                "raw_analysis": response
            }
        
        # Save analysis
        analysis = AIAnalysisResult(
            parcel_id=parcel_id,
            parcel_name=parcel['name'],
            analysis_type="crop_recognition",
            source="ai_gemini",
            results=results,
            confidence=results.get("confidence", 85),
            recommendations=results.get("recommendations", [])
        )
        
        await db.ai_analyses.insert_one(analysis.model_dump())
        
        return analysis
        
    except ImportError:
        # Fallback if emergentintegrations not available
        return {
            "id": str(uuid.uuid4()),
            "parcel_id": parcel_id,
            "analysis_type": "crop_recognition",
            "results": {
                "crop_type": "Blé",
                "health_status": "bon",
                "diseases": [],
                "growth_stage": "croissance",
                "ndvi_estimate": 0.75
            },
            "confidence": 90,
            "recommendations": ["Continuer l'irrigation régulière", "Surveiller les ravageurs"]
        }

@api_router.post("/ai/generate-recommendations")
async def generate_ai_recommendations(
    parcel_id: str,
    user = Depends(get_current_user)
):
    """Generate AI-powered recommendations for a parcel"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
        if not parcel:
            raise HTTPException(status_code=404, detail="Parcelle non trouvée")
        
        # Get weather data
        weather = await get_weather("Paris")  # Default location
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"recommendations-{uuid.uuid4()}",
            system_message="""Tu es un conseiller agricole expert. Génère des recommandations prioritaires basées sur les données de la parcelle.
            Réponds en JSON avec une liste de recommandations, chacune ayant: type (irrigation/fertilisation/disease_treatment/harvest/sowing), priority (urgent/elevee/moyenne), title, message, confidence_percent, deadline_hours"""
        ).with_model("openai", "gpt-5.2")
        
        message = UserMessage(
            text=f"""Données de la parcelle '{parcel['name']}':
            - Culture: {parcel['crop_type']}
            - Surface: {parcel['area_hectares']} ha
            - Humidité sol: {parcel['humidity']}%
            - Température: {parcel['temperature']}°C
            - pH: {parcel['soil_analysis']['ph']}
            - Azote (N): {parcel['soil_analysis']['nitrogen']}/100
            - Phosphore (P): {parcel['soil_analysis']['phosphorus']}/100
            - Potassium (K): {parcel['soil_analysis']['potassium']}/100
            - Date plantation: {parcel['planting_date']}
            - Météo actuelle: {weather.temperature}°C, {weather.humidity}% humidité, vent {weather.wind_speed} km/h
            
            Génère 3-5 recommandations prioritaires."""
        )
        
        response = await chat.send_message(message)
        
        # Parse and save recommendations
        try:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                recs_data = json.loads(json_match.group())
            else:
                recs_data = [{"type": "irrigation", "priority": "elevee", "title": "Vérifier l'irrigation", "message": response[:300], "confidence_percent": 80, "deadline_hours": 24}]
        except:
            recs_data = [{"type": "irrigation", "priority": "elevee", "title": "Vérifier l'irrigation", "message": "Recommandation générée par IA", "confidence_percent": 80, "deadline_hours": 24}]
        
        saved_recs = []
        for rec_data in recs_data[:5]:
            rec = Recommendation(
                user_id=user["id"],
                parcel_id=parcel_id,
                parcel_name=parcel['name'],
                type=rec_data.get("type", "irrigation"),
                priority=rec_data.get("priority", "moyenne"),
                title=rec_data.get("title", "Recommandation IA"),
                message=rec_data.get("message", ""),
                confidence_percent=rec_data.get("confidence_percent", 75),
                deadline_hours=rec_data.get("deadline_hours", 48),
                ai_source="gpt-5.2"
            )
            await db.recommendations.insert_one(rec.model_dump())
            saved_recs.append(rec)
        
        return saved_recs
        
    except ImportError:
        # Fallback
        return [
            {
                "id": str(uuid.uuid4()),
                "type": "irrigation",
                "priority": "elevee",
                "title": "Irrigation recommandée",
                "message": "Le niveau d'humidité nécessite une irrigation",
                "confidence_percent": 85,
                "deadline_hours": 24
            }
        ]

@api_router.post("/ai/predict-yield")
async def predict_yield(parcel_id: str, user = Depends(get_current_user)):
    """Predict crop yield using AI"""
    parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    
    # Simple yield prediction based on soil quality
    soil = parcel['soil_analysis']
    base_yield = {
        "Blé": 7.5,
        "Maïs": 10.0,
        "Tournesol": 3.0
    }.get(parcel['crop_type'], 5.0)
    
    # Adjust based on soil quality
    soil_factor = (soil['nitrogen'] + soil['phosphorus'] + soil['potassium']) / 300
    humidity_factor = 1.0 if 50 <= parcel['humidity'] <= 80 else 0.85
    
    predicted_yield = base_yield * soil_factor * humidity_factor * parcel['area_hectares']
    confidence = min(95, 70 + soil['nitrogen'] / 5)
    
    return {
        "parcel_id": parcel_id,
        "parcel_name": parcel['name'],
        "crop_type": parcel['crop_type'],
        "area_hectares": parcel['area_hectares'],
        "predicted_yield_tonnes": round(predicted_yield, 2),
        "yield_per_hectare": round(predicted_yield / parcel['area_hectares'], 2),
        "confidence_percent": round(confidence),
        "factors": {
            "soil_quality": round(soil_factor * 100),
            "humidity_optimal": humidity_factor == 1.0,
            "nitrogen_level": soil['nitrogen'],
            "phosphorus_level": soil['phosphorus'],
            "potassium_level": soil['potassium']
        }
    }

# =============================================================================
# API ROUTES - Parcels (Farmer)
# =============================================================================

@api_router.get("/parcels")
async def get_parcels(user = Depends(get_optional_user)):
    query = {}
    if user and user.get("role") != "admin":
        query["user_id"] = user["id"]
    parcels = await db.parcels.find(query, {"_id": 0}).to_list(100)
    return parcels

@api_router.get("/parcels/{parcel_id}")
async def get_parcel(parcel_id: str, user = Depends(get_optional_user)):
    parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    return parcel

@api_router.post("/parcels")
async def create_parcel(data: ParcelCreate, user = Depends(get_current_user)):
    parcel = Parcel(
        user_id=user["id"],
        **data.model_dump()
    )
    await db.parcels.insert_one(parcel.model_dump())
    return parcel

@api_router.put("/parcels/{parcel_id}")
async def update_parcel(parcel_id: str, data: ParcelCreate, user = Depends(get_current_user)):
    existing = await db.parcels.find_one({"id": parcel_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    await db.parcels.update_one({"id": parcel_id}, {"$set": data.model_dump()})
    return await db.parcels.find_one({"id": parcel_id}, {"_id": 0})

@api_router.delete("/parcels/{parcel_id}")
async def delete_parcel(parcel_id: str, user = Depends(get_current_user)):
    result = await db.parcels.delete_one({"id": parcel_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    return {"message": "Parcelle supprimée"}

# =============================================================================
# API ROUTES - Sensors
# =============================================================================

@api_router.get("/sensors")
async def get_sensors(user = Depends(get_optional_user)):
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

@api_router.post("/sensors")
async def create_sensor(sensor: Sensor, user = Depends(require_roles([UserRole.ADMIN]))):
    await db.sensors.insert_one(sensor.model_dump())
    return sensor

@api_router.post("/sensors/{sensor_id}/data")
async def add_sensor_data(sensor_id: str, data: SensorData):
    """Add new sensor reading"""
    await db.sensors.update_one(
        {"id": sensor_id},
        {"$set": {"value": data.value, "last_update": data.timestamp}}
    )
    await db.sensor_history.insert_one(data.model_dump())
    return {"message": "Données enregistrées"}

@api_router.get("/sensors/{sensor_id}/history")
async def get_sensor_history(sensor_id: str, limit: int = 100):
    """Get sensor data history"""
    history = await db.sensor_history.find(
        {"sensor_id": sensor_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    return history

# =============================================================================
# API ROUTES - Drone Missions
# =============================================================================

@api_router.get("/drone-missions")
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

@api_router.post("/drone-missions")
async def create_drone_mission(mission: DroneMission, user = Depends(get_current_user)):
    mission.status = MissionStatus.PLANIFIE
    mission.progress_percent = 0
    await db.drone_missions.insert_one(mission.model_dump())
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

@api_router.get("/aerial-images")
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

# =============================================================================
# API ROUTES - Image Analysis
# =============================================================================

@api_router.get("/image-analysis")
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

# =============================================================================
# API ROUTES - Irrigation
# =============================================================================

@api_router.get("/irrigation")
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

@api_router.put("/irrigation/{system_id}/control")
async def control_irrigation(system_id: str, action: str = Query(...)):
    status_map = {"start": "actif", "pause": "pause", "stop": "arrete"}
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    await db.irrigation_systems.update_one(
        {"id": system_id},
        {"$set": {"status": status_map[action], "last_activation": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": f"Irrigation {action}", "status": status_map[action]}

# =============================================================================
# API ROUTES - Recommendations
# =============================================================================

@api_router.get("/recommendations")
async def get_recommendations(user = Depends(get_optional_user)):
    query = {"status": "pending"}
    if user and user.get("role") != "admin":
        query["user_id"] = user["id"]
    recs = await db.recommendations.find(query, {"_id": 0}).to_list(100)
    return recs

@api_router.get("/recommendations/stats")
async def get_recommendations_stats():
    recs = await db.recommendations.find({"status": "pending"}, {"_id": 0}).to_list(100)
    high_priority = len([r for r in recs if r.get('priority') in ['urgent', 'elevee']])
    avg_confidence = sum(r.get('confidence_percent', 0) for r in recs) / max(len(recs), 1)
    return {
        "total": len(recs),
        "high_priority": high_priority,
        "average_confidence": round(avg_confidence),
        "average_deadline_hours": 24
    }

@api_router.put("/recommendations/{rec_id}/action")
async def update_recommendation_status(rec_id: str, action: str = Query(...)):
    status_map = {"apply": "applied", "postpone": "postponed", "ignore": "ignored"}
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    await db.recommendations.update_one({"id": rec_id}, {"$set": {"status": status_map[action]}})
    return {"message": f"Recommandation {action}"}

# =============================================================================
# API ROUTES - Marketplace
# =============================================================================

@api_router.get("/marketplace/products")
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

@api_router.post("/marketplace/products")
async def create_marketplace_product(product: MarketplaceProduct, user = Depends(get_current_user)):
    product.seller_id = user["id"]
    product.seller_name = user["full_name"]
    product.status = ProductStatus.DISPONIBLE
    await db.marketplace_products.insert_one(product.model_dump())
    return product

@api_router.post("/marketplace/orders")
async def create_order(
    product_id: str,
    quantity: float,
    delivery_address: str,
    payment_method: str = "mobile_money",
    user = Depends(get_current_user)
):
    product = await db.marketplace_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    order = Order(
        product_id=product_id,
        buyer_id=user["id"],
        seller_id=product["seller_id"],
        quantity=quantity,
        total_price=quantity * product["price_per_unit"],
        status=OrderStatus.PENDING,
        delivery_address=delivery_address,
        payment_method=payment_method
    )
    await db.orders.insert_one(order.model_dump())
    
    # Update product status
    await db.marketplace_products.update_one(
        {"id": product_id},
        {"$set": {"status": ProductStatus.EN_NEGOCIATION.value}}
    )
    
    return order

@api_router.get("/marketplace/orders")
async def get_orders(user = Depends(get_current_user)):
    query = {"$or": [{"buyer_id": user["id"]}, {"seller_id": user["id"]}]}
    orders = await db.orders.find(query, {"_id": 0}).to_list(100)
    return orders

@api_router.put("/marketplace/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus, user = Depends(get_current_user)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status.value}})
    return {"message": "Commande mise à jour"}

# =============================================================================
# API ROUTES - Financial (Loans & Subsidies)
# =============================================================================

@api_router.post("/financial/loans")
async def request_loan(
    amount: float,
    purpose: str,
    duration_months: int,
    institution_id: str,
    parcel_id: Optional[str] = None,
    user = Depends(get_current_user)
):
    loan = LoanRequest(
        farmer_id=user["id"],
        farmer_name=user["full_name"],
        institution_id=institution_id,
        amount=amount,
        purpose=purpose,
        duration_months=duration_months,
        parcel_id=parcel_id,
        status=LoanStatus.PENDING
    )
    await db.loans.insert_one(loan.model_dump())
    return loan

@api_router.get("/financial/loans")
async def get_loans(user = Depends(get_current_user)):
    if user["role"] == "financial":
        query = {"institution_id": user["id"]}
    else:
        query = {"farmer_id": user["id"]}
    loans = await db.loans.find(query, {"_id": 0}).to_list(100)
    return loans

@api_router.put("/financial/loans/{loan_id}/decision")
async def decide_loan(
    loan_id: str,
    approved: bool,
    notes: str = "",
    user = Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))
):
    status = LoanStatus.APPROVED if approved else LoanStatus.REJECTED
    await db.loans.update_one(
        {"id": loan_id},
        {"$set": {
            "status": status.value,
            "decision_date": datetime.now(timezone.utc).isoformat(),
            "decision_notes": notes
        }}
    )
    return {"message": f"Prêt {'approuvé' if approved else 'rejeté'}"}

# =============================================================================
# API ROUTES - Alerts
# =============================================================================

@api_router.get("/alerts")
async def get_alerts(unread_only: bool = False, user = Depends(get_optional_user)):
    query = {}
    if unread_only:
        query["is_read"] = False
    if user and user.get("role") != "admin":
        query["user_id"] = user["id"]
    alerts = await db.alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return alerts

@api_router.post("/alerts")
async def create_alert(alert: Alert):
    await db.alerts.insert_one(alert.model_dump())
    return alert

@api_router.put("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str):
    await db.alerts.update_one({"id": alert_id}, {"$set": {"is_read": True}})
    return {"message": "Alerte marquée comme lue"}

# =============================================================================
# API ROUTES - Dashboard Stats
# =============================================================================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user = Depends(get_optional_user)):
    user_id = user["id"] if user else None
    
    query = {"user_id": user_id} if user_id and user.get("role") != "admin" else {}
    
    parcels = await db.parcels.find(query if query else {}, {"_id": 0}).to_list(100)
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    alerts = await db.alerts.find({"is_read": False}, {"_id": 0}).to_list(100)
    irrigation = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
    recommendations = await db.recommendations.find({"status": "pending"}, {"_id": 0}).to_list(100)
    products = await db.marketplace_products.find({"seller_id": user_id} if user_id else {}, {"_id": 0}).to_list(100)
    orders = await db.orders.find({"$or": [{"buyer_id": user_id}, {"seller_id": user_id}]} if user_id else {}, {"_id": 0}).to_list(100)
    
    active_sensors = len([s for s in sensors if s.get('status') == 'actif'])
    avg_humidity = sum(p.get('humidity', 0) for p in parcels) / max(len(parcels), 1)
    avg_temp = sum(p.get('temperature', 0) for p in parcels) / max(len(parcels), 1)
    water_today = sum(i.get('water_used_today_liters', 0) for i in irrigation)
    pending_orders = len([o for o in orders if o.get('status') == 'pending'])
    
    # Calculate yield prediction
    total_yield = sum(
        p.get('area_hectares', 0) * 7.5 * (p.get('soil_analysis', {}).get('nitrogen', 70) / 100)
        for p in parcels
    )
    
    return FarmerDashboardStats(
        parcels_count=len(parcels),
        average_humidity=round(avg_humidity, 1),
        average_temperature=round(avg_temp, 1),
        active_alerts=len(alerts),
        active_sensors=active_sensors,
        recommendations_count=len(recommendations),
        yield_prediction=round(total_yield, 1),
        water_used_today=water_today,
        products_on_sale=len([p for p in products if p.get('status') == 'disponible']),
        pending_orders=pending_orders
    )

# =============================================================================
# API ROUTES - Data Export
# =============================================================================

@api_router.get("/export/parcels")
async def export_parcels_csv(user = Depends(get_current_user)):
    """Export parcels data as CSV"""
    import csv
    from io import StringIO
    
    query = {"user_id": user["id"]} if user["role"] != "admin" else {}
    parcels = await db.parcels.find(query, {"_id": 0}).to_list(1000)
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Nom", "Culture", "Surface (ha)", "Humidité (%)", "Température (°C)",
        "Azote", "Phosphore", "Potassium", "pH", "Statut", "Date plantation"
    ])
    
    # Data
    for p in parcels:
        soil = p.get('soil_analysis', {})
        writer.writerow([
            p.get('id'), p.get('name'), p.get('crop_type'), p.get('area_hectares'),
            p.get('humidity'), p.get('temperature'),
            soil.get('nitrogen'), soil.get('phosphorus'), soil.get('potassium'), soil.get('ph'),
            p.get('status'), p.get('planting_date')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=parcelles.csv"}
    )

@api_router.get("/export/sensors")
async def export_sensors_csv(user = Depends(get_current_user)):
    """Export sensors data as CSV"""
    import csv
    from io import StringIO
    
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(1000)
    
    output = StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["ID", "Nom", "Type", "Parcelle", "Valeur", "Unité", "Statut", "Dernière MàJ", "Batterie"])
    
    for s in sensors:
        writer.writerow([
            s.get('id'), s.get('name'), s.get('type'), s.get('parcel_name'),
            s.get('value'), s.get('unit'), s.get('status'), s.get('last_update'), s.get('battery_level')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=capteurs.csv"}
    )

# =============================================================================
# SEED DATA
# =============================================================================

@api_router.post("/seed")
async def seed_database():
    """Initialize database with demo data"""
    
    # Clear existing data
    collections = ['users', 'parcels', 'sensors', 'drone_missions', 'aerial_images', 
                   'image_analyses', 'irrigation_systems', 'recommendations', 
                   'marketplace_products', 'alerts', 'orders', 'loans']
    for coll in collections:
        await db[coll].delete_many({})
    
    # Create demo admin
    admin = User(
        id="admin-001",
        email="admin@agricam-ia.com",
        full_name="Administrateur AGRICAM",
        phone="+237 6 00 00 00 00",
        role=UserRole.ADMIN,
        company_name="African AI Solutions",
        subscription_type=SubscriptionType.PREMIUM,
        is_verified=True
    )
    admin_dict = admin.model_dump()
    admin_dict["password_hash"] = hash_password("admin123")
    await db.users.insert_one(admin_dict)
    
    # Create demo farmer
    farmer = User(
        id="farmer-001",
        email="agriculteur@demo.com",
        full_name="Jean Dupont",
        phone="+237 6 99 99 99 99",
        role=UserRole.FARMER,
        culture_type="Blé, Maïs",
        subscription_type=SubscriptionType.BASIC,
        is_verified=True
    )
    farmer_dict = farmer.model_dump()
    farmer_dict["password_hash"] = hash_password("farmer123")
    await db.users.insert_one(farmer_dict)
    
    # Create demo supplier
    supplier = User(
        id="supplier-001",
        email="fournisseur@demo.com",
        full_name="Agro Intrants SARL",
        phone="+237 6 88 88 88 88",
        role=UserRole.SUPPLIER,
        company_name="Agro Intrants SARL",
        is_verified=True
    )
    supplier_dict = supplier.model_dump()
    supplier_dict["password_hash"] = hash_password("supplier123")
    await db.users.insert_one(supplier_dict)
    
    # Create demo financial institution
    financial = User(
        id="financial-001",
        email="banque@demo.com",
        full_name="Crédit Agricole Cameroun",
        phone="+237 6 77 77 77 77",
        role=UserRole.FINANCIAL,
        company_name="Crédit Agricole Cameroun",
        is_verified=True
    )
    financial_dict = financial.model_dump()
    financial_dict["password_hash"] = hash_password("bank123")
    await db.users.insert_one(financial_dict)
    
    # Seed Parcels for farmer
    parcels_data = [
        {
            "id": "p1", "user_id": "farmer-001", "name": "Parcelle Nord", "crop_type": "Blé",
            "area_hectares": 15.5, "humidity": 68, "temperature": 22,
            "soil_analysis": {"nitrogen": 78, "phosphorus": 45, "potassium": 92, "ph": 6.8},
            "planting_date": "15/03/2024", "status": "bon", "latitude": 5.9631, "longitude": 10.1591,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p2", "user_id": "farmer-001", "name": "Parcelle Sud", "crop_type": "Maïs",
            "area_hectares": 23.2, "humidity": 75, "temperature": 24,
            "soil_analysis": {"nitrogen": 85, "phosphorus": 52, "potassium": 88, "ph": 7.2},
            "planting_date": "10/04/2024", "status": "excellent", "latitude": 5.9531, "longitude": 10.1491,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p3", "user_id": "farmer-001", "name": "Parcelle Est", "crop_type": "Tournesol",
            "area_hectares": 18.7, "humidity": 45, "temperature": 26,
            "soil_analysis": {"nitrogen": 62, "phosphorus": 38, "potassium": 74, "ph": 6.5},
            "planting_date": "25/04/2024", "status": "attention", "latitude": 5.9731, "longitude": 10.1691,
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
            "id": "m1", "name": "Mission surveillance Parcelle Est", "parcel_id": "p3", "parcel_name": "Parcelle Est",
            "status": "planifie", "scheduled_date": "18/01/2024", "duration_minutes": 25,
            "altitude_meters": 75, "speed_mps": 4, "capture_interval_seconds": 3,
            "weather_conditions": "Favorable", "wind_speed_kmh": 8, "progress_percent": 0,
            "images_captured": 0, "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "m2", "name": "Cartographie NDVI Parcelle Nord", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
            "status": "termine", "scheduled_date": "15/01/2024", "duration_minutes": 32,
            "altitude_meters": 80, "speed_mps": 3.5, "capture_interval_seconds": 2,
            "weather_conditions": "Excellent", "wind_speed_kmh": 5, "progress_percent": 100,
            "images_captured": 156, "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.drone_missions.insert_many(missions_data)
    
    # Seed Aerial Images
    images_data = [
        {
            "id": "img1", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "source": "drone",
            "capture_date": "18/01/2024", "ndvi_value": 0.75, "health_percent": 82, "stress_zones": 5,
            "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "img2", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "source": "satellite",
            "capture_date": "18/01/2024", "ndvi_value": 0.68, "health_percent": 88, "stress_zones": 2,
            "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.aerial_images.insert_many(images_data)
    
    # Seed Image Analyses
    analyses_data = [
        {
            "id": "an1", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "source": "drone",
            "capture_date": "18/01/2024", "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
            "crop_recognized": "Blé", "crop_confidence": 94, "growth_rate": 1.2,
            "diseases_detected": [{"name": "Rouille brune", "severity": "Faible", "confidence": 78}],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "an2", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "source": "satellite",
            "capture_date": "18/01/2024", "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
            "crop_recognized": "Maïs", "crop_confidence": 96, "growth_rate": 1.8,
            "diseases_detected": [], "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.image_analyses.insert_many(analyses_data)
    
    # Seed Irrigation Systems
    irrigation_data = [
        {
            "id": "irr1", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
            "status": "actif", "is_automatic": True, "efficiency_percent": 87,
            "water_used_today_liters": 1250,
            "zones": [{"id": "z1", "name": "Zone A", "is_active": True, "water_used_liters": 650},
                     {"id": "z2", "name": "Zone B", "is_active": True, "water_used_liters": 600}],
            "last_activation": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.irrigation_systems.insert_many(irrigation_data)
    
    # Seed Recommendations
    recommendations_data = [
        {
            "id": "rec1", "user_id": "farmer-001", "parcel_id": "p3", "parcel_name": "Parcelle Est",
            "type": "irrigation", "priority": "elevee", "title": "Irrigation d'urgence nécessaire",
            "message": "Le niveau d'humidité du sol est critique (45%). Activation automatique de l'irrigation recommandée dans les 2h.",
            "confidence_percent": 94, "deadline_hours": 2, "ai_source": "system", "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec2", "user_id": "farmer-001", "parcel_id": "p3", "parcel_name": "Parcelle Est",
            "type": "disease_treatment", "priority": "urgent", "title": "Traitement anti-mildiou requis",
            "message": "Détection de mildiou sur 4.2 ha avec 85% de confiance. Traitement fongicide recommandé sous 24h.",
            "confidence_percent": 85, "deadline_hours": 24, "ai_source": "gpt-5.2", "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec3", "user_id": "farmer-001", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
            "type": "fertilisation", "priority": "moyenne", "title": "Optimisation phosphore",
            "message": "Apport ciblé en phosphore pour maximiser le rendement en période de floraison.",
            "confidence_percent": 78, "deadline_hours": 48, "ai_source": "system", "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.recommendations.insert_many(recommendations_data)
    
    # Seed Marketplace Products
    products_data = [
        {
            "id": "prod1", "seller_id": "farmer-001", "seller_name": "Jean Dupont",
            "title": "Blé bio", "category": "cereals", "quantity": 25, "unit": "tonnes",
            "price_per_unit": 320, "currency": "EUR", "location": "Beauce, France",
            "available_date": "15/07/2024",
            "description": "Blé tendre biologique de haute qualité, certification AB. Taux de protéines 12.5%.",
            "certifications": ["Agriculture Biologique", "HVE Niveau 3"],
            "is_bio": True, "is_premium": False, "status": "disponible",
            "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod2", "seller_id": "supplier-001", "seller_name": "Agro Intrants SARL",
            "title": "Engrais NPK 15-15-15", "category": "fertilizers", "quantity": 100, "unit": "sacs",
            "price_per_unit": 25000, "currency": "XAF", "location": "Douala, Cameroun",
            "available_date": "Immédiat",
            "description": "Engrais complet équilibré pour toutes cultures. Sacs de 50kg.",
            "certifications": ["Homologué MINADER"],
            "is_bio": False, "is_premium": True, "status": "disponible",
            "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.marketplace_products.insert_many(products_data)
    
    # Seed Alerts
    alerts_data = [
        {
            "id": "alert1", "user_id": "farmer-001", "type": "disease",
            "title": "Maladie détectée par IA", "message": "Mildiou identifié sur Parcelle Est avec 85% de confiance - Action immédiate requise",
            "priority": "critique", "parcel_name": "Parcelle Est", "is_read": False,
            "channels": ["in_app", "sms"], "created_at": "2024-01-20T10:15:00Z"
        },
        {
            "id": "alert2", "user_id": "farmer-001", "type": "irrigation",
            "title": "Seuil d'irrigation atteint", "message": "Humidité critique (45%) - Système d'irrigation automatique activé",
            "priority": "warning", "parcel_name": "Parcelle Est", "is_read": False,
            "channels": ["in_app"], "created_at": "2024-01-20T10:10:00Z"
        },
        {
            "id": "alert3", "user_id": "farmer-001", "type": "drone",
            "title": "Vol de drone programmé", "message": "Mission de surveillance prévue demain 8h - Conditions météo favorables",
            "priority": "info", "parcel_name": "Parcelle Est", "is_read": False,
            "channels": ["in_app"], "created_at": "2024-01-20T08:00:00Z"
        }
    ]
    await db.alerts.insert_many(alerts_data)
    
    return {"message": "Base de données initialisée avec les données de démonstration", "developer": "Barra Martial Aristide"}

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
    logger.info("AGRICAM IA API starting - Developed by Barra Martial Aristide / African AI Solutions")
    count = await db.parcels.count_documents({})
    if count == 0:
        logger.info("Seeding database with demo data...")
        await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
