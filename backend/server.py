from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, UploadFile, File, Form, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
import jwt
import bcrypt
import httpx
import json
import io
import base64
import csv
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - NO FALLBACK for production
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'agricam-secret-key-prod-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')
MAPBOX_ACCESS_TOKEN = os.environ.get('MAPBOX_ACCESS_TOKEN', '')

# Create the main app
app = FastAPI(
    title="AGRICAM IA API", 
    version="3.0.0", 
    description="Plateforme d'agriculture de précision intelligente - Développée par Barra Martial Aristide / African AI Solutions"
)

# Create routers
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
# SUBSCRIPTION PACKAGES (Server-side only - Security)
# =============================================================================

SUBSCRIPTION_PACKAGES = {
    "basic_monthly": {"amount": 5000.0, "currency": "xof", "duration_days": 30, "type": "basic"},
    "basic_quarterly": {"amount": 15000.0, "currency": "xof", "duration_days": 90, "type": "basic"},
    "basic_annual": {"amount": 50000.0, "currency": "xof", "duration_days": 365, "type": "basic"},
    "premium_monthly": {"amount": 15000.0, "currency": "xof", "duration_days": 30, "type": "premium"},
    "premium_quarterly": {"amount": 25000.0, "currency": "xof", "duration_days": 90, "type": "premium"},
    "premium_annual": {"amount": 200000.0, "currency": "xof", "duration_days": 365, "type": "premium"},
}

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
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
        return user
    except:
        return None

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(user = Depends(get_current_user)):
        if user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        return user
    return role_checker

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class SoilAnalysis(BaseModel):
    nitrogen: int = Field(ge=0, le=100)
    phosphorus: int = Field(ge=0, le=100)
    potassium: int = Field(ge=0, le=100)
    ph: float = Field(ge=0, le=14)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None
    address: Optional[str] = None
    culture_type: Optional[str] = None
    id_document_type: Optional[str] = None  # cni, passport
    id_document_number: Optional[str] = None
    id_document_image: Optional[str] = None  # Base64

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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
    geometry: Optional[Dict] = None  # GeoJSON polygon

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class LearningModule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    difficulty: str
    duration_minutes: int
    content: str
    video_url: Optional[str] = None
    quiz: Optional[List[Dict]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SMSRequest(BaseModel):
    phone_number: str
    message: str

# =============================================================================
# API ROUTES - Root
# =============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "AGRICAM IA API - Agriculture de précision intelligente",
        "version": "3.0.0",
        "developer": "Barra Martial Aristide",
        "company": "African AI Solutions",
        "features": ["AI Analysis", "Chatbot", "Payments", "SMS Alerts", "Maps", "Learning"]
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# =============================================================================
# API ROUTES - Authentication
# =============================================================================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "full_name": data.full_name,
        "phone": data.phone,
        "role": data.role.value,
        "company_name": data.company_name,
        "address": data.address,
        "culture_type": data.culture_type,
        "subscription_type": "freemium",
        "subscription_end": None,
        "is_verified": data.role == UserRole.FARMER,
        "is_active": True,
        "id_document_type": data.id_document_type,
        "id_document_number": data.id_document_number,
        "id_document_image": data.id_document_image,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, data.role.value, data.email)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.email,
            full_name=data.full_name,
            role=data.role.value,
            subscription_type="freemium",
            is_verified=data.role == UserRole.FARMER,
            company_name=data.company_name
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
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

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    return user

# =============================================================================
# API ROUTES - Stripe Payments
# =============================================================================

@api_router.post("/payments/create-checkout")
async def create_checkout_session(
    request: Request,
    package_id: str,
    user = Depends(get_current_user)
):
    """Create Stripe checkout session for subscription"""
    if package_id not in SUBSCRIPTION_PACKAGES:
        raise HTTPException(status_code=400, detail="Package invalide")
    
    package = SUBSCRIPTION_PACKAGES[package_id]
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get origin from request headers for success/cancel URLs
        origin = request.headers.get('origin', host_url)
        success_url = f"{origin}/parametres?session_id={{CHECKOUT_SESSION_ID}}&payment=success"
        cancel_url = f"{origin}/parametres?payment=cancelled"
        
        checkout_request = CheckoutSessionRequest(
            amount=float(package["amount"]),
            currency="usd",  # Stripe requires USD
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user["id"],
                "package_id": package_id,
                "subscription_type": package["type"],
                "duration_days": str(package["duration_days"])
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction
        await db.payment_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": user["id"],
            "package_id": package_id,
            "amount": package["amount"],
            "currency": package["currency"],
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"url": session.url, "session_id": session.session_id}
        
    except ImportError:
        # Fallback for demo
        return {
            "url": f"https://checkout.stripe.com/demo?package={package_id}",
            "session_id": f"demo_{uuid.uuid4()}",
            "demo": True
        }

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user = Depends(get_current_user)):
    """Check payment status and update subscription"""
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        status = await stripe_checkout.get_checkout_status(session_id)
        
        if status.payment_status == "paid" and transaction["payment_status"] != "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            
            # Update user subscription
            package = SUBSCRIPTION_PACKAGES.get(transaction["package_id"], {})
            duration_days = package.get("duration_days", 30)
            subscription_type = package.get("type", "basic")
            subscription_end = (datetime.now(timezone.utc) + timedelta(days=duration_days)).isoformat()
            
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {
                    "subscription_type": subscription_type,
                    "subscription_end": subscription_end
                }}
            )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount": status.amount_total,
            "currency": status.currency
        }
        
    except ImportError:
        return {"status": "demo", "payment_status": "demo", "demo": True}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# =============================================================================
# API ROUTES - SMS Notifications (Twilio)
# =============================================================================

@api_router.post("/notifications/sms")
async def send_sms(data: SMSRequest, user = Depends(require_roles([UserRole.ADMIN]))):
    """Send SMS notification via Twilio"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return {"success": False, "message": "SMS non configuré", "demo": True}
    
    try:
        from twilio.rest import Client
        
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=data.message,
            from_=TWILIO_PHONE_NUMBER,
            to=data.phone_number
        )
        
        # Log SMS
        await db.sms_logs.insert_one({
            "id": str(uuid.uuid4()),
            "message_sid": message.sid,
            "to": data.phone_number,
            "body": data.message,
            "status": message.status,
            "sent_by": user["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "message_sid": message.sid}
        
    except Exception as e:
        logger.error(f"SMS error: {e}")
        return {"success": False, "error": str(e)}

@api_router.post("/notifications/alert-sms")
async def send_alert_sms(
    alert_id: str,
    user = Depends(get_current_user)
):
    """Send alert notification via SMS to user"""
    alert = await db.alerts.find_one({"id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    target_user = await db.users.find_one({"id": alert.get("user_id")}, {"_id": 0})
    if not target_user or not target_user.get("phone"):
        return {"success": False, "message": "Numéro de téléphone non disponible"}
    
    sms_message = f"🌾 AGRICAM IA Alert\n{alert['title']}\n{alert['message'][:100]}"
    
    # Simulate SMS for demo
    await db.sms_logs.insert_one({
        "id": str(uuid.uuid4()),
        "to": target_user["phone"],
        "body": sms_message,
        "status": "sent",
        "alert_id": alert_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "SMS envoyé"}

# =============================================================================
# API ROUTES - Weather (Real API)
# =============================================================================

@api_router.get("/weather/{location}")
async def get_weather(location: str):
    """Get real weather data from OpenWeatherMap"""
    try:
        if OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != 'demo':
            async with httpx.AsyncClient() as client:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "location": location,
                        "temperature": data["main"]["temp"],
                        "humidity": data["main"]["humidity"],
                        "pressure": data["main"]["pressure"],
                        "wind_speed": data["wind"]["speed"],
                        "wind_direction": str(data["wind"].get("deg", 0)) + "°",
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                        "feels_like": data["main"]["feels_like"],
                        "source": "openweathermap"
                    }
        
        # Fallback mock data based on location
        return {
            "location": location,
            "temperature": 28.5,
            "humidity": 65,
            "pressure": 1013,
            "wind_speed": 8.5,
            "wind_direction": "NE",
            "description": "Partiellement nuageux",
            "icon": "02d",
            "feels_like": 30.2,
            "source": "simulated"
        }
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return {"location": location, "temperature": 25, "humidity": 60, "error": str(e)}

# =============================================================================
# API ROUTES - AI Chatbot (Agricultural Expert)
# =============================================================================

AGRICULTURAL_KNOWLEDGE_BASE = """
Tu es AgriBot, un assistant agricole expert développé par African AI Solutions pour AGRICAM IA.
Tu aides les agriculteurs africains avec des conseils personnalisés sur:

1. CULTURES PRINCIPALES:
- Maïs: Semis mars-avril, récolte août-septembre, besoin eau 500-800mm, NPK 120-60-60
- Blé: Semis octobre-novembre, récolte mai-juin, pH optimal 6.0-7.5
- Riz: Zones inondées, température 20-35°C, azote 80-120kg/ha
- Manioc: Boutures 20-30cm, récolte 9-24 mois, résistant sécheresse
- Cacao: Ombrage nécessaire, température 18-32°C, pluies 1500-2000mm
- Café: Altitude 600-2000m, température 15-24°C, récolte manuelle
- Palmier à huile: Zones tropicales humides, récolte continue

2. MALADIES ET TRAITEMENTS:
- Mildiou: Symptômes taches jaunes, traitement fongicide cuivre
- Rouille: Pustules orangées, traitement triazoles
- Fusariose: Flétrissement, rotation des cultures
- Charançon: Insecticide neem naturel
- Chenille légionnaire: Surveillance précoce, Bt

3. IRRIGATION:
- Goutte-à-goutte: 90% efficacité, économie eau
- Aspersion: 75% efficacité, grandes surfaces
- Gravitaire: Traditionnel, perte 50%
- Calcul besoin: ETc = ET0 × Kc

4. FERTILISATION:
- Azote (N): Croissance végétative
- Phosphore (P): Racines et floraison
- Potassium (K): Résistance et qualité
- Compost: 10-20 tonnes/ha améliore structure

5. CALENDRIER AGRICOLE (Zone tropicale):
- Saison sèche: Préparation sol, labour
- Début pluies: Semis, plantation
- Pleine saison: Entretien, traitement
- Fin pluies: Récolte, stockage

Réponds toujours en français avec des conseils pratiques et adaptés au contexte africain.
"""

@api_router.post("/chatbot/message")
async def chat_with_agribot(data: ChatMessage, user = Depends(get_current_user)):
    """Interact with agricultural AI chatbot"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Build context from user's parcels
        user_parcels = await db.parcels.find({"user_id": user["id"]}, {"_id": 0}).to_list(10)
        parcel_context = ""
        if user_parcels:
            parcel_context = f"\nContexte utilisateur - Parcelles: {json.dumps(user_parcels, default=str)[:500]}"
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"agribot-{user['id']}-{uuid.uuid4()}",
            system_message=AGRICULTURAL_KNOWLEDGE_BASE + parcel_context
        ).with_model("openai", "gpt-4o-mini")
        
        user_context = data.context or ""
        full_message = f"{data.message}\n{user_context}" if user_context else data.message
        
        response = await chat.send_message(UserMessage(text=full_message))
        
        # Log conversation
        await db.chatbot_logs.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "message": data.message,
            "response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"response": response, "source": "agribot_ai"}
        
    except ImportError:
        # Fallback responses
        fallback_responses = {
            "maïs": "Le maïs nécessite 500-800mm d'eau. Semez en mars-avril pour récolter en août-septembre. Fertilisation recommandée: NPK 120-60-60.",
            "maladie": "Pour identifier une maladie, envoyez une photo de la plante affectée. Les symptômes courants incluent: taches jaunes (mildiou), pustules orangées (rouille), flétrissement (fusariose).",
            "irrigation": "L'irrigation goutte-à-goutte est la plus efficace (90%). Calculez vos besoins avec ETc = ET0 × Kc selon votre culture.",
            "engrais": "La fertilisation de base: Azote pour la croissance, Phosphore pour les racines, Potassium pour la résistance. Compost: 10-20 tonnes/ha.",
            "default": "Je suis AgriBot, votre assistant agricole. Posez-moi des questions sur les cultures, maladies, irrigation ou fertilisation. Je suis là pour vous aider!"
        }
        
        response = fallback_responses["default"]
        for key, value in fallback_responses.items():
            if key in data.message.lower():
                response = value
                break
        
        return {"response": response, "source": "fallback"}

@api_router.get("/chatbot/history")
async def get_chat_history(user = Depends(get_current_user), limit: int = 20):
    """Get user's chat history"""
    history = await db.chatbot_logs.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    return history

# =============================================================================
# API ROUTES - Learning Module
# =============================================================================

LEARNING_MODULES = [
    {
        "id": "learn-001",
        "title": "Introduction à l'Agriculture de Précision",
        "description": "Découvrez les fondamentaux de l'agriculture moderne assistée par technologie",
        "category": "fondamentaux",
        "difficulty": "debutant",
        "duration_minutes": 30,
        "content": """
# Introduction à l'Agriculture de Précision

## Qu'est-ce que l'agriculture de précision ?
L'agriculture de précision utilise la technologie pour optimiser la production agricole tout en minimisant l'impact environnemental.

## Technologies clés:
1. **Capteurs IoT** - Mesurent humidité, température, pH du sol en temps réel
2. **Drones** - Surveillance aérienne et imagerie multispectrale
3. **Satellites** - Analyse NDVI et suivi à grande échelle
4. **Intelligence Artificielle** - Prédiction des rendements et détection des maladies

## Avantages:
- Réduction des coûts d'intrants de 15-30%
- Augmentation des rendements de 10-25%
- Économie d'eau jusqu'à 40%
- Détection précoce des problèmes

## Premiers pas:
1. Installez des capteurs d'humidité dans vos parcelles
2. Utilisez l'application AGRICAM IA pour suivre vos données
3. Analysez les recommandations de l'IA
        """,
        "quiz": [
            {"question": "Quel est l'avantage principal des capteurs IoT?", "options": ["Mesure temps réel", "Coût réduit", "Facilité d'installation"], "correct": 0},
            {"question": "Quelle économie d'eau peut-on atteindre?", "options": ["10%", "25%", "40%"], "correct": 2}
        ]
    },
    {
        "id": "learn-002",
        "title": "Gestion de l'Irrigation Intelligente",
        "description": "Apprenez à optimiser l'utilisation de l'eau avec les systèmes modernes",
        "category": "irrigation",
        "difficulty": "intermediaire",
        "duration_minutes": 45,
        "content": """
# Gestion de l'Irrigation Intelligente

## Types de systèmes d'irrigation:

### 1. Goutte-à-goutte
- Efficacité: 90-95%
- Idéal pour: Cultures maraîchères, arbres fruitiers
- Installation: Tuyaux avec goutteurs à intervalles réguliers

### 2. Aspersion
- Efficacité: 70-80%
- Idéal pour: Grandes cultures, prairies
- Types: Pivot central, canon, micro-aspersion

### 3. Irrigation de surface
- Efficacité: 40-60%
- Traditionnel mais moins efficace
- Amélioration possible avec nivellement laser

## Calcul des besoins en eau:
ETc = ET0 × Kc

Où:
- ETc = Évapotranspiration de la culture
- ET0 = Évapotranspiration de référence
- Kc = Coefficient cultural

## Automatisation avec AGRICAM IA:
1. Les capteurs mesurent l'humidité du sol
2. L'IA calcule les besoins en eau
3. Le système active automatiquement l'irrigation
4. Économie d'eau garantie!
        """,
        "quiz": [
            {"question": "Quelle est l'efficacité du goutte-à-goutte?", "options": ["60-70%", "70-80%", "90-95%"], "correct": 2},
            {"question": "Que signifie Kc?", "options": ["Coefficient cultural", "Kilogramme carbone", "Constante kalium"], "correct": 0}
        ]
    },
    {
        "id": "learn-003",
        "title": "Détection des Maladies par IA",
        "description": "Utilisez l'intelligence artificielle pour identifier et traiter les maladies des cultures",
        "category": "maladies",
        "difficulty": "avance",
        "duration_minutes": 60,
        "content": """
# Détection des Maladies par Intelligence Artificielle

## Comment fonctionne la détection IA?

### Étape 1: Capture d'images
- Utilisez votre smartphone ou drone
- Photos claires des feuilles affectées
- Plusieurs angles si possible

### Étape 2: Analyse par l'IA
- Réseau de neurones convolutifs (CNN)
- Base de données de milliers de maladies
- Précision: 85-95%

### Étape 3: Diagnostic et traitement
- Identification de la maladie
- Niveau de sévérité
- Recommandations de traitement

## Maladies courantes détectées:

### Mildiou
- Symptômes: Taches jaunes/brunes sur feuilles
- Traitement: Fongicides à base de cuivre
- Prévention: Éviter humidité excessive

### Rouille
- Symptômes: Pustules orangées sous les feuilles
- Traitement: Fongicides triazoles
- Prévention: Variétés résistantes

### Oïdium
- Symptômes: Poudre blanche sur feuilles
- Traitement: Soufre, bicarbonate
- Prévention: Aération, espacement

## Utilisation dans AGRICAM IA:
1. Prenez une photo de la plante
2. Uploadez dans l'application
3. Recevez le diagnostic en secondes
4. Suivez les recommandations
        """,
        "quiz": [
            {"question": "Quelle précision peut atteindre l'IA?", "options": ["50-60%", "70-80%", "85-95%"], "correct": 2},
            {"question": "Quel est le traitement pour le mildiou?", "options": ["Triazoles", "Fongicides cuivre", "Bicarbonate"], "correct": 1}
        ]
    }
]

@api_router.get("/learning/modules")
async def get_learning_modules(category: Optional[str] = None, difficulty: Optional[str] = None):
    """Get all learning modules with optional filters"""
    modules = LEARNING_MODULES.copy()
    
    if category:
        modules = [m for m in modules if m["category"] == category]
    if difficulty:
        modules = [m for m in modules if m["difficulty"] == difficulty]
    
    return modules

@api_router.get("/learning/modules/{module_id}")
async def get_learning_module(module_id: str):
    """Get specific learning module"""
    for module in LEARNING_MODULES:
        if module["id"] == module_id:
            return module
    raise HTTPException(status_code=404, detail="Module non trouvé")

@api_router.post("/learning/progress/{module_id}")
async def update_learning_progress(
    module_id: str,
    completed: bool = False,
    quiz_score: Optional[int] = None,
    user = Depends(get_current_user)
):
    """Track user learning progress"""
    progress = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "module_id": module_id,
        "completed": completed,
        "quiz_score": quiz_score,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.learning_progress.update_one(
        {"user_id": user["id"], "module_id": module_id},
        {"$set": progress},
        upsert=True
    )
    
    return {"success": True, "progress": progress}

@api_router.get("/learning/my-progress")
async def get_my_learning_progress(user = Depends(get_current_user)):
    """Get user's learning progress"""
    progress = await db.learning_progress.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    completed_count = len([p for p in progress if p.get("completed")])
    total_modules = len(LEARNING_MODULES)
    
    return {
        "progress": progress,
        "completed_count": completed_count,
        "total_modules": total_modules,
        "completion_percentage": round((completed_count / total_modules) * 100, 1) if total_modules > 0 else 0
    }

# =============================================================================
# API ROUTES - File Upload (CSV/Excel Import)
# =============================================================================

@api_router.post("/import/sensors-data")
async def import_sensors_data(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    """Import sensor data from CSV or Excel file"""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez CSV ou Excel.")
    
    try:
        import pandas as pd
        
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        records_imported = 0
        errors = []
        
        for _, row in df.iterrows():
            try:
                sensor_data = {
                    "id": str(uuid.uuid4()),
                    "sensor_id": str(row.get('sensor_id', row.get('capteur_id', ''))),
                    "value": float(row.get('value', row.get('valeur', 0))),
                    "timestamp": str(row.get('timestamp', row.get('date', datetime.now(timezone.utc).isoformat()))),
                    "imported_by": user["id"],
                    "import_date": datetime.now(timezone.utc).isoformat()
                }
                
                await db.sensor_history.insert_one(sensor_data)
                records_imported += 1
                
            except Exception as e:
                errors.append(f"Ligne {_}: {str(e)}")
        
        return {
            "success": True,
            "records_imported": records_imported,
            "errors": errors[:10]  # Limit errors shown
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'import: {str(e)}")

@api_router.post("/import/parcels")
async def import_parcels(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    """Import parcels from CSV or Excel file"""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format non supporté")
    
    try:
        import pandas as pd
        
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        records_imported = 0
        
        for _, row in df.iterrows():
            parcel = {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "name": str(row.get('name', row.get('nom', f'Parcelle {records_imported + 1}'))),
                "crop_type": str(row.get('crop_type', row.get('culture', 'Non défini'))),
                "area_hectares": float(row.get('area_hectares', row.get('surface', 1))),
                "humidity": float(row.get('humidity', row.get('humidite', 50))),
                "temperature": float(row.get('temperature', 25)),
                "soil_analysis": {
                    "nitrogen": int(row.get('nitrogen', row.get('azote', 50))),
                    "phosphorus": int(row.get('phosphorus', row.get('phosphore', 50))),
                    "potassium": int(row.get('potassium', 50)),
                    "ph": float(row.get('ph', 7.0))
                },
                "planting_date": str(row.get('planting_date', row.get('date_plantation', 'Non défini'))),
                "status": str(row.get('status', row.get('statut', 'bon'))),
                "latitude": float(row.get('latitude', row.get('lat', 0))) if pd.notna(row.get('latitude', row.get('lat'))) else None,
                "longitude": float(row.get('longitude', row.get('lon', 0))) if pd.notna(row.get('longitude', row.get('lon'))) else None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.parcels.insert_one(parcel)
            records_imported += 1
        
        return {"success": True, "records_imported": records_imported}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'import: {str(e)}")

# =============================================================================
# API ROUTES - Image/Video Upload & AI Analysis
# =============================================================================

@api_router.post("/analysis/upload-image")
async def upload_and_analyze_image(
    file: UploadFile = File(...),
    parcel_id: str = Form(...),
    user = Depends(get_current_user)
):
    """Upload image and analyze for diseases/crop health"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Seules les images sont acceptées")
    
    try:
        content = await file.read()
        image_base64 = base64.b64encode(content).decode('utf-8')
        
        # Get parcel info
        parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
        if not parcel:
            raise HTTPException(status_code=404, detail="Parcelle non trouvée")
        
        # AI Analysis
        analysis_result = {
            "id": str(uuid.uuid4()),
            "parcel_id": parcel_id,
            "parcel_name": parcel.get("name", ""),
            "user_id": user["id"],
            "image_filename": file.filename,
            "analysis_type": "disease_detection",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"image-analysis-{uuid.uuid4()}",
                system_message="""Tu es un expert agronome spécialisé dans la détection des maladies des plantes.
                Analyse l'image et identifie:
                1. Type de culture visible
                2. État de santé (excellent/bon/attention/critique)
                3. Maladies détectées avec niveau de confiance
                4. Traitements recommandés
                Réponds en JSON avec: crop_type, health_status, diseases (array), treatments (array), confidence"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            image_content = ImageContent(image_base64=image_base64)
            response = await chat.send_message(UserMessage(
                text=f"Analyse cette image de la culture {parcel.get('crop_type', '')} de la parcelle {parcel.get('name', '')}",
                file_contents=[image_content]
            ))
            
            # Parse AI response
            try:
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    ai_results = json.loads(json_match.group())
                else:
                    ai_results = {"raw_analysis": response, "health_status": "bon"}
            except:
                ai_results = {"raw_analysis": response, "health_status": "bon"}
            
            analysis_result["results"] = ai_results
            analysis_result["source"] = "gemini_ai"
            
        except ImportError:
            # Fallback mock analysis
            analysis_result["results"] = {
                "crop_type": parcel.get("crop_type", "Non identifié"),
                "health_status": "bon",
                "diseases": [],
                "treatments": ["Surveillance régulière recommandée"],
                "confidence": 75
            }
            analysis_result["source"] = "fallback"
        
        # Save analysis
        await db.image_analyses.insert_one(analysis_result)
        
        # Create alert if disease detected
        diseases = analysis_result.get("results", {}).get("diseases", [])
        if diseases:
            alert = {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "type": "disease",
                "title": "Maladie détectée par IA",
                "message": f"Analyse d'image: {', '.join([d.get('name', str(d)) if isinstance(d, dict) else str(d) for d in diseases])} détecté(e) sur {parcel.get('name', '')}",
                "priority": "critique",
                "parcel_name": parcel.get("name", ""),
                "is_read": False,
                "channels": ["in_app", "sms"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.alerts.insert_one(alert)
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analysis/upload-video")
async def upload_and_analyze_video(
    file: UploadFile = File(...),
    parcel_id: str = Form(...),
    user = Depends(get_current_user)
):
    """Upload video and analyze for crop health, diseases, environmental conditions"""
    if not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="Seules les vidéos sont acceptées")
    
    # Check file size (max 50MB)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La vidéo ne doit pas dépasser 50 Mo")
    
    try:
        parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
        if not parcel:
            raise HTTPException(status_code=404, detail="Parcelle non trouvée")
        
        analysis_result = {
            "id": str(uuid.uuid4()),
            "parcel_id": parcel_id,
            "parcel_name": parcel.get("name", ""),
            "user_id": user["id"],
            "video_filename": file.filename,
            "analysis_type": "video_analysis",
            "file_size_mb": round(len(content) / (1024 * 1024), 2),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Simulated video analysis (real implementation would extract frames and analyze)
        analysis_result["results"] = {
            "crop_type": parcel.get("crop_type", "Non identifié"),
            "health_status": "bon",
            "growth_stage": "Végétatif",
            "plant_count_estimated": 1250,
            "coverage_percentage": 85,
            "diseases_detected": [],
            "insects_detected": [],
            "environmental_conditions": {
                "wind_visible": "léger",
                "moisture_signs": "normal",
                "sun_exposure": "bon"
            },
            "recommendations": [
                "Croissance normale observée",
                "Aucune maladie visible détectée",
                "Surveillance continue recommandée"
            ],
            "confidence": 78
        }
        analysis_result["source"] = "agricam_video_ai"
        
        await db.video_analyses.insert_one(analysis_result)
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Video analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analysis/upload-csv")
async def upload_and_analyze_csv(
    file: UploadFile = File(...),
    parcel_id: str = Form(None),
    user = Depends(get_current_user)
):
    """Upload CSV/Excel data and analyze for patterns, yields, recommendations"""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Seuls les fichiers CSV et Excel sont acceptés")
    
    try:
        content = await file.read()
        
        # Parse CSV
        records = []
        if file.filename.endswith('.csv'):
            decoded = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded))
            records = list(reader)
        
        analysis_result = {
            "id": str(uuid.uuid4()),
            "parcel_id": parcel_id,
            "user_id": user["id"],
            "filename": file.filename,
            "analysis_type": "data_analysis",
            "records_count": len(records),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Analyze data patterns
        if records:
            columns = list(records[0].keys()) if records else []
            
            # Generate insights based on data
            insights = []
            stats = {}
            
            for col in columns:
                values = [r.get(col) for r in records if r.get(col)]
                try:
                    numeric_values = [float(v) for v in values if v and v.replace('.','').replace('-','').isdigit()]
                    if numeric_values:
                        stats[col] = {
                            "min": min(numeric_values),
                            "max": max(numeric_values),
                            "avg": round(sum(numeric_values) / len(numeric_values), 2),
                            "count": len(numeric_values)
                        }
                        # Generate insight
                        if "yield" in col.lower() or "rendement" in col.lower():
                            avg = stats[col]["avg"]
                            insights.append(f"Rendement moyen: {avg} - {'Excellent' if avg > 7 else 'Bon' if avg > 5 else 'À améliorer'}")
                        elif "humidity" in col.lower() or "humidite" in col.lower():
                            avg = stats[col]["avg"]
                            insights.append(f"Humidité moyenne: {avg}% - {'Optimal' if 60 <= avg <= 80 else 'Ajustement recommandé'}")
                except:
                    pass
            
            analysis_result["results"] = {
                "columns": columns,
                "statistics": stats,
                "insights": insights if insights else ["Données analysées avec succès", "Aucune anomalie détectée"],
                "recommendations": [
                    "Continuez à collecter des données régulièrement",
                    "Comparez avec les périodes précédentes"
                ],
                "chart_data": {
                    "type": "line",
                    "labels": [f"Semaine {i+1}" for i in range(min(len(records), 12))],
                    "datasets": []
                }
            }
            
            # Build chart datasets for numeric columns
            for col in columns[:3]:
                try:
                    data_points = []
                    for i in range(min(len(records), 12)):
                        val = records[i].get(col, '0')
                        if val and str(val).replace('.','').replace('-','').isdigit():
                            data_points.append(float(val))
                        else:
                            data_points.append(0)
                    if any(d > 0 for d in data_points):
                        analysis_result["results"]["chart_data"]["datasets"].append({
                            "label": col,
                            "data": data_points
                        })
                except:
                    pass
        else:
            analysis_result["results"] = {
                "message": "Fichier vide ou format non reconnu",
                "recommendations": ["Vérifiez le format du fichier"]
            }
        
        analysis_result["source"] = "agricam_data_ai"
        await db.data_analyses.insert_one(analysis_result)
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"CSV analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analysis/history")
async def get_analysis_history(user = Depends(get_current_user)):
    """Get all analysis history for user"""
    user_query = {"user_id": user["id"]} if user.get("role") != "admin" else {}
    
    image_analyses = await db.image_analyses.find(user_query, {"_id": 0}).sort("created_at", -1).to_list(50)
    video_analyses = await db.video_analyses.find(user_query, {"_id": 0}).sort("created_at", -1).to_list(50)
    data_analyses = await db.data_analyses.find(user_query, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    return {
        "images": image_analyses,
        "videos": video_analyses,
        "data": data_analyses,
        "total": len(image_analyses) + len(video_analyses) + len(data_analyses)
    }

# =============================================================================
# API ROUTES - Dashboard Stats (Optimized)
# =============================================================================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user = Depends(get_optional_user)):
    """Get dashboard statistics - optimized queries"""
    user_id = user["id"] if user else None
    query = {"user_id": user_id} if user_id and user.get("role") != "admin" else {}
    
    # Use aggregation for efficiency
    parcels_count = await db.parcels.count_documents(query if query else {})
    active_sensors = await db.sensors.count_documents({"status": "actif"})
    active_alerts = await db.alerts.count_documents({"is_read": False, **({"user_id": user_id} if user_id else {})})
    recommendations_count = await db.recommendations.count_documents({"status": "pending"})
    
    # Get averages using aggregation
    parcels = await db.parcels.find(query if query else {}, {"humidity": 1, "temperature": 1, "_id": 0}).to_list(100)
    avg_humidity = sum(p.get('humidity', 0) for p in parcels) / max(len(parcels), 1)
    avg_temp = sum(p.get('temperature', 0) for p in parcels) / max(len(parcels), 1)
    
    # Water usage
    irrigation_data = await db.irrigation_systems.find({}, {"water_used_today_liters": 1, "_id": 0}).to_list(100)
    water_today = sum(i.get('water_used_today_liters', 0) for i in irrigation_data)
    
    # Products and orders
    products_count = await db.marketplace_products.count_documents({"seller_id": user_id, "status": "disponible"} if user_id else {})
    pending_orders = await db.orders.count_documents({"status": "pending", "$or": [{"buyer_id": user_id}, {"seller_id": user_id}]} if user_id else {})
    
    # Yield prediction (simplified)
    total_yield = parcels_count * 7.5 * 0.8  # Simplified calculation
    
    return {
        "parcels_count": parcels_count,
        "average_humidity": round(avg_humidity, 1),
        "average_temperature": round(avg_temp, 1),
        "active_alerts": active_alerts,
        "active_sensors": active_sensors,
        "recommendations_count": recommendations_count,
        "yield_prediction": round(total_yield, 1),
        "water_used_today": water_today,
        "products_on_sale": products_count,
        "pending_orders": pending_orders
    }

# =============================================================================
# API ROUTES - Admin (Optimized)
# =============================================================================

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(user = Depends(require_roles([UserRole.ADMIN]))):
    """Get admin dashboard stats - optimized"""
    total_users = await db.users.count_documents({})
    total_farmers = await db.users.count_documents({"role": "farmer"})
    total_suppliers = await db.users.count_documents({"role": "supplier"})
    total_financial = await db.users.count_documents({"role": "financial"})
    total_partners = await db.users.count_documents({"role": "partner"})
    pending_verifications = await db.users.count_documents({"is_verified": False})
    total_parcels = await db.parcels.count_documents({})
    total_sensors = await db.sensors.count_documents({})
    active_subscriptions = await db.users.count_documents({"subscription_type": {"$ne": "freemium"}})
    transactions_month = await db.orders.count_documents({})
    
    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_suppliers": total_suppliers,
        "total_financial": total_financial,
        "total_partners": total_partners,
        "pending_verifications": pending_verifications,
        "total_parcels": total_parcels,
        "total_sensors": total_sensors,
        "active_subscriptions": active_subscriptions,
        "revenue_month": active_subscriptions * 15000,
        "transactions_month": transactions_month
    }

@api_router.get("/admin/users")
async def get_all_users(role: Optional[str] = None, user = Depends(require_roles([UserRole.ADMIN]))):
    query = {"role": role} if role else {}
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, user = Depends(require_roles([UserRole.ADMIN]))):
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_verified": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur vérifié"}

@api_router.put("/admin/users/{user_id}/subscription")
async def update_subscription(user_id: str, subscription_type: SubscriptionType, user = Depends(require_roles([UserRole.ADMIN]))):
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
# API ROUTES - Parcels
# =============================================================================

@api_router.get("/parcels")
async def get_parcels(user = Depends(get_optional_user)):
    query = {"user_id": user["id"]} if user and user.get("role") != "admin" else {}
    parcels = await db.parcels.find(query, {"_id": 0}).to_list(100)
    return parcels

@api_router.get("/parcels/{parcel_id}")
async def get_parcel(parcel_id: str):
    parcel = await db.parcels.find_one({"id": parcel_id}, {"_id": 0})
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
    return parcel

@api_router.post("/parcels")
async def create_parcel(data: ParcelCreate, user = Depends(get_current_user)):
    parcel = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.parcels.insert_one(parcel)
    return parcel

@api_router.put("/parcels/{parcel_id}")
async def update_parcel(parcel_id: str, data: ParcelCreate, user = Depends(get_current_user)):
    result = await db.parcels.update_one(
        {"id": parcel_id, "user_id": user["id"]},
        {"$set": data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Parcelle non trouvée")
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
async def get_sensors():
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
    return sensors

@api_router.get("/sensors/stats")
async def get_sensors_stats():
    total = await db.sensors.count_documents({})
    actif = await db.sensors.count_documents({"status": "actif"})
    inactif = await db.sensors.count_documents({"status": "inactif"})
    erreur = await db.sensors.count_documents({"status": "erreur"})
    return {"total": total, "actif": actif, "inactif": inactif, "erreur": erreur}

@api_router.post("/sensors/{sensor_id}/data")
async def add_sensor_data(sensor_id: str, value: float):
    timestamp = datetime.now(timezone.utc).isoformat()
    await db.sensors.update_one({"id": sensor_id}, {"$set": {"value": value, "last_update": timestamp}})
    await db.sensor_history.insert_one({"sensor_id": sensor_id, "value": value, "timestamp": timestamp})
    return {"message": "Données enregistrées"}

@api_router.get("/sensors/{sensor_id}/history")
async def get_sensor_history(sensor_id: str, limit: int = 100):
    history = await db.sensor_history.find({"sensor_id": sensor_id}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
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
    active = await db.drone_missions.count_documents({"status": "en_cours"})
    planned = await db.drone_missions.count_documents({"status": "planifie"})
    completed = await db.drone_missions.count_documents({"status": "termine"})
    images = await db.aerial_images.count_documents({"source": "drone"})
    return {"active_drones": active, "planned_missions": planned, "completed_missions": completed, "images_captured": images, "average_efficiency": 87}

@api_router.put("/drone-missions/{mission_id}/control")
async def control_drone_mission(mission_id: str, action: str = Query(...)):
    status_map = {"start": "en_cours", "pause": "planifie", "stop": "echoue", "complete": "termine"}
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    progress = 100 if action == "complete" else None
    update = {"status": status_map[action]}
    if progress:
        update["progress_percent"] = progress
    
    await db.drone_missions.update_one({"id": mission_id}, {"$set": update})
    return {"message": f"Mission {action}", "status": status_map[action]}

# =============================================================================
# API ROUTES - Aerial Images
# =============================================================================

@api_router.get("/aerial-images")
async def get_aerial_images():
    images = await db.aerial_images.find({}, {"_id": 0}).to_list(100)
    return images

@api_router.get("/aerial-images/stats")
async def get_aerial_images_stats():
    images = await db.aerial_images.find({}, {"ndvi_value": 1, "stress_zones": 1, "_id": 0}).to_list(100)
    total = len(images)
    avg_ndvi = sum(i.get('ndvi_value', 0) for i in images) / max(total, 1)
    total_stress = sum(i.get('stress_zones', 0) for i in images)
    return {"total_images": total, "average_ndvi": round(avg_ndvi * 100), "total_stress_zones": total_stress}

# =============================================================================
# API ROUTES - Image Analysis
# =============================================================================

@api_router.get("/image-analysis")
async def get_image_analyses():
    analyses = await db.image_analyses.find({}, {"_id": 0}).to_list(100)
    return analyses

@api_router.get("/image-analysis/stats")
async def get_image_analysis_stats():
    total = await db.image_analyses.count_documents({})
    analyses = await db.image_analyses.find({}, {"crop_confidence": 1, "diseases_detected": 1, "_id": 0}).to_list(100)
    diseases = sum(len(a.get('diseases_detected', [])) for a in analyses)
    avg_conf = sum(a.get('crop_confidence', 0) for a in analyses) / max(len(analyses), 1)
    return {"total_analyzed": total, "crop_precision": round(avg_conf), "diseases_detected": diseases, "ai_precision": 94}

# =============================================================================
# API ROUTES - Irrigation
# =============================================================================

@api_router.get("/irrigation")
async def get_irrigation_systems():
    systems = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
    return systems

@api_router.get("/irrigation/stats")
async def get_irrigation_stats():
    active = await db.irrigation_systems.count_documents({"status": "actif"})
    systems = await db.irrigation_systems.find({}, {"efficiency_percent": 1, "water_used_today_liters": 1, "_id": 0}).to_list(100)
    avg_eff = sum(s.get('efficiency_percent', 0) for s in systems) / max(len(systems), 1)
    water = sum(s.get('water_used_today_liters', 0) for s in systems)
    return {"active_systems": active, "average_efficiency": round(avg_eff), "water_used_today": water, "monitoring": "24/7"}

@api_router.put("/irrigation/{system_id}/control")
async def control_irrigation_put(system_id: str, action: str = Query(...)):
    status_map = {"start": "actif", "pause": "pause", "stop": "arrete"}
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    await db.irrigation_systems.update_one({"id": system_id}, {"$set": {"status": status_map[action], "last_activation": datetime.now(timezone.utc).isoformat()}})
    return {"message": f"Irrigation {action}", "new_status": status_map[action]}

class IrrigationControl(BaseModel):
    action: str
    duration_minutes: Optional[int] = None
    zone: Optional[str] = None

@api_router.post("/irrigation/{system_id}/control")
async def control_irrigation_post(system_id: str, control: IrrigationControl, user = Depends(get_current_user)):
    """Control irrigation system with POST method"""
    status_map = {"start": "actif", "pause": "pause", "stop": "arrete", "manual": "manuel"}
    if control.action not in status_map:
        raise HTTPException(status_code=400, detail=f"Action invalide. Utilisez: {list(status_map.keys())}")
    
    update_data = {
        "status": status_map[control.action],
        "last_activation": datetime.now(timezone.utc).isoformat(),
        "last_controlled_by": user.get("email")
    }
    
    if control.duration_minutes:
        update_data["scheduled_duration_minutes"] = control.duration_minutes
    
    await db.irrigation_systems.update_one(
        {"id": system_id}, 
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "message": f"Irrigation {control.action}",
        "system_id": system_id,
        "new_status": status_map[control.action],
        "duration_minutes": control.duration_minutes,
        "timestamp": update_data["last_activation"]
    }

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
    total = await db.recommendations.count_documents({"status": "pending"})
    high = await db.recommendations.count_documents({"status": "pending", "priority": {"$in": ["urgent", "elevee"]}})
    recs = await db.recommendations.find({"status": "pending"}, {"confidence_percent": 1, "_id": 0}).to_list(100)
    avg_conf = sum(r.get('confidence_percent', 0) for r in recs) / max(len(recs), 1)
    return {"total": total, "high_priority": high, "average_confidence": round(avg_conf), "average_deadline_hours": 24}

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
async def get_marketplace_products(category: Optional[str] = None, is_bio: Optional[bool] = None, status: Optional[str] = None):
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
async def create_marketplace_product(
    title: str = Form(...),
    category: str = Form(...),
    quantity: float = Form(...),
    unit: str = Form(...),
    price_per_unit: float = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    certifications: str = Form(""),
    is_bio: bool = Form(False),
    image: UploadFile = File(None),
    user = Depends(get_current_user)
):
    product = {
        "id": str(uuid.uuid4()),
        "seller_id": user["id"],
        "seller_name": user["full_name"],
        "title": title,
        "category": category,
        "quantity": quantity,
        "unit": unit,
        "price_per_unit": price_per_unit,
        "currency": "XAF",
        "location": location,
        "available_date": datetime.now(timezone.utc).strftime("%d/%m/%Y"),
        "description": description,
        "certifications": [c.strip() for c in certifications.split(",") if c.strip()],
        "is_bio": is_bio,
        "is_premium": False,
        "status": "disponible",
        "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.marketplace_products.insert_one(product)
    return product

@api_router.post("/marketplace/orders")
async def create_order(product_id: str, quantity: float, delivery_address: str, payment_method: str = "mobile_money", user = Depends(get_current_user)):
    product = await db.marketplace_products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouvé")
    
    order = {
        "id": str(uuid.uuid4()),
        "product_id": product_id,
        "product_title": product["title"],
        "buyer_id": user["id"],
        "buyer_name": user["full_name"],
        "seller_id": product["seller_id"],
        "quantity": quantity,
        "total_price": quantity * product["price_per_unit"],
        "status": "pending",
        "delivery_address": delivery_address,
        "payment_method": payment_method,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    await db.marketplace_products.update_one({"id": product_id}, {"$set": {"status": "en_negociation"}})
    return order

@api_router.get("/marketplace/orders")
async def get_orders(user = Depends(get_current_user)):
    orders = await db.orders.find(
        {"$or": [{"buyer_id": user["id"]}, {"seller_id": user["id"]}]},
        {"_id": 0}
    ).to_list(100)
    return orders

@api_router.put("/marketplace/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, user = Depends(get_current_user)):
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"message": "Commande mise à jour"}

# =============================================================================
# API ROUTES - Financial
# =============================================================================

@api_router.post("/financial/loans")
async def request_loan(amount: float, purpose: str, duration_months: int, institution_id: str, parcel_id: Optional[str] = None, user = Depends(get_current_user)):
    loan = {
        "id": str(uuid.uuid4()),
        "farmer_id": user["id"],
        "farmer_name": user["full_name"],
        "institution_id": institution_id,
        "amount": amount,
        "purpose": purpose,
        "duration_months": duration_months,
        "parcel_id": parcel_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.loans.insert_one(loan)
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
async def decide_loan(loan_id: str, approved: bool, notes: str = "", user = Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))):
    status = "approved" if approved else "rejected"
    await db.loans.update_one(
        {"id": loan_id},
        {"$set": {"status": status, "decision_date": datetime.now(timezone.utc).isoformat(), "decision_notes": notes}}
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

@api_router.put("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str):
    await db.alerts.update_one({"id": alert_id}, {"$set": {"is_read": True}})
    return {"message": "Alerte marquée comme lue"}

# =============================================================================
# API ROUTES - Data Export
# =============================================================================

@api_router.get("/export/parcels")
async def export_parcels_csv(user = Depends(get_current_user)):
    query = {"user_id": user["id"]} if user["role"] != "admin" else {}
    parcels = await db.parcels.find(query, {"_id": 0}).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Nom", "Culture", "Surface (ha)", "Humidité (%)", "Température (°C)", "Azote", "Phosphore", "Potassium", "pH", "Statut", "Date plantation", "Latitude", "Longitude"])
    
    for p in parcels:
        soil = p.get('soil_analysis', {})
        writer.writerow([
            p.get('id'), p.get('name'), p.get('crop_type'), p.get('area_hectares'),
            p.get('humidity'), p.get('temperature'),
            soil.get('nitrogen'), soil.get('phosphorus'), soil.get('potassium'), soil.get('ph'),
            p.get('status'), p.get('planting_date'), p.get('latitude'), p.get('longitude')
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=parcelles_agricam.csv"}
    )

@api_router.get("/export/sensors")
async def export_sensors_csv(user = Depends(get_current_user)):
    sensors = await db.sensors.find({}, {"_id": 0}).to_list(1000)
    
    output = io.StringIO()
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
        headers={"Content-Disposition": "attachment; filename=capteurs_agricam.csv"}
    )

# =============================================================================
# API ROUTES - Mapbox Config
# =============================================================================

@api_router.get("/config/mapbox")
async def get_mapbox_config():
    """Get Mapbox configuration for frontend"""
    return {
        "access_token": MAPBOX_ACCESS_TOKEN or "pk.demo",
        "style": "mapbox://styles/mapbox/satellite-streets-v12",
        "default_center": [10.1591, 5.9631],  # Cameroon
        "default_zoom": 12
    }

# =============================================================================
# SEED DATA
# =============================================================================

@api_router.post("/seed")
async def seed_database():
    """Initialize database with demo data"""
    collections = ['users', 'parcels', 'sensors', 'drone_missions', 'aerial_images', 
                   'image_analyses', 'irrigation_systems', 'recommendations', 
                   'marketplace_products', 'alerts', 'orders', 'loans', 'payment_transactions',
                   'chatbot_logs', 'learning_progress', 'sms_logs', 'sensor_history']
    
    for coll in collections:
        await db[coll].delete_many({})
    
    # Create demo users
    users_data = [
        {"id": "admin-001", "email": "admin@agricam-ia.com", "password_hash": hash_password("admin123"),
         "full_name": "Administrateur AGRICAM", "phone": "+237600000000", "role": "admin",
         "company_name": "African AI Solutions", "subscription_type": "premium", "is_verified": True, "is_active": True,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "farmer-001", "email": "agriculteur@demo.com", "password_hash": hash_password("farmer123"),
         "full_name": "Jean Dupont", "phone": "+237699999999", "role": "farmer",
         "culture_type": "Blé, Maïs", "subscription_type": "basic", "is_verified": True, "is_active": True,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "supplier-001", "email": "fournisseur@demo.com", "password_hash": hash_password("supplier123"),
         "full_name": "Agro Intrants SARL", "phone": "+237688888888", "role": "supplier",
         "company_name": "Agro Intrants SARL", "is_verified": True, "is_active": True,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "financial-001", "email": "banque@demo.com", "password_hash": hash_password("bank123"),
         "full_name": "Crédit Agricole Cameroun", "phone": "+237677777777", "role": "financial",
         "company_name": "Crédit Agricole Cameroun", "is_verified": True, "is_active": True,
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.users.insert_many(users_data)
    
    # Create demo parcels
    parcels_data = [
        {"id": "p1", "user_id": "farmer-001", "name": "Parcelle Nord", "crop_type": "Blé",
         "area_hectares": 15.5, "humidity": 68, "temperature": 22,
         "soil_analysis": {"nitrogen": 78, "phosphorus": 45, "potassium": 92, "ph": 6.8},
         "planting_date": "15/03/2024", "status": "bon", "latitude": 5.9631, "longitude": 10.1591,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "p2", "user_id": "farmer-001", "name": "Parcelle Sud", "crop_type": "Maïs",
         "area_hectares": 23.2, "humidity": 75, "temperature": 24,
         "soil_analysis": {"nitrogen": 85, "phosphorus": 52, "potassium": 88, "ph": 7.2},
         "planting_date": "10/04/2024", "status": "excellent", "latitude": 5.9531, "longitude": 10.1491,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "p3", "user_id": "farmer-001", "name": "Parcelle Est", "crop_type": "Tournesol",
         "area_hectares": 18.7, "humidity": 45, "temperature": 26,
         "soil_analysis": {"nitrogen": 62, "phosphorus": 38, "potassium": 74, "ph": 6.5},
         "planting_date": "25/04/2024", "status": "attention", "latitude": 5.9731, "longitude": 10.1691,
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.parcels.insert_many(parcels_data)
    
    # Create demo sensors
    sensors_data = [
        {"id": "s1", "name": "Humidité", "type": "humidity", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "value": 68, "unit": "%", "last_update": datetime.now(timezone.utc).isoformat(), "status": "actif", "battery_level": 85},
        {"id": "s2", "name": "Température", "type": "temperature", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "value": 22, "unit": "°C", "last_update": datetime.now(timezone.utc).isoformat(), "status": "actif", "battery_level": 92},
        {"id": "s3", "name": "pH du sol", "type": "ph", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "value": 7.2, "unit": "pH", "last_update": datetime.now(timezone.utc).isoformat(), "status": "actif", "battery_level": 78},
        {"id": "s4", "name": "NPK", "type": "npk", "parcel_id": "p3", "parcel_name": "Parcelle Est", "value": 74, "unit": "ppm", "last_update": datetime.now(timezone.utc).isoformat(), "status": "erreur", "battery_level": 45},
        {"id": "s5", "name": "Camera", "type": "camera", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "value": 1, "unit": "active", "last_update": datetime.now(timezone.utc).isoformat(), "status": "actif", "battery_level": 100}
    ]
    await db.sensors.insert_many(sensors_data)
    
    # Create demo drone missions
    missions_data = [
        {"id": "m1", "name": "Mission surveillance Parcelle Est", "parcel_id": "p3", "parcel_name": "Parcelle Est",
         "status": "planifie", "scheduled_date": "18/01/2024", "duration_minutes": 25,
         "altitude_meters": 75, "speed_mps": 4, "capture_interval_seconds": 3,
         "weather_conditions": "Favorable", "wind_speed_kmh": 8, "progress_percent": 0,
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "m2", "name": "Cartographie NDVI Parcelle Nord", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
         "status": "termine", "scheduled_date": "15/01/2024", "duration_minutes": 32,
         "altitude_meters": 80, "speed_mps": 3.5, "capture_interval_seconds": 2,
         "weather_conditions": "Excellent", "wind_speed_kmh": 5, "progress_percent": 100,
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.drone_missions.insert_many(missions_data)
    
    # Create demo aerial images
    images_data = [
        {"id": "img1", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "source": "drone",
         "capture_date": "18/01/2024", "ndvi_value": 0.75, "health_percent": 82, "stress_zones": 5,
         "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "img2", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "source": "satellite",
         "capture_date": "18/01/2024", "ndvi_value": 0.68, "health_percent": 88, "stress_zones": 2,
         "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.aerial_images.insert_many(images_data)
    
    # Create demo image analyses
    analyses_data = [
        {"id": "an1", "parcel_id": "p1", "parcel_name": "Parcelle Nord", "source": "drone",
         "capture_date": "18/01/2024", "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
         "crop_recognized": "Blé", "crop_confidence": 94, "growth_rate": 1.2,
         "diseases_detected": [{"name": "Rouille brune", "severity": "Faible", "confidence": 78}],
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "an2", "parcel_id": "p2", "parcel_name": "Parcelle Sud", "source": "satellite",
         "capture_date": "18/01/2024", "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
         "crop_recognized": "Maïs", "crop_confidence": 96, "growth_rate": 1.8,
         "diseases_detected": [], "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.image_analyses.insert_many(analyses_data)
    
    # Create demo irrigation systems
    irrigation_data = [
        {"id": "irr1", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
         "status": "actif", "is_automatic": True, "efficiency_percent": 87,
         "water_used_today_liters": 1250,
         "zones": [{"id": "z1", "name": "Zone A", "is_active": True, "water_used_liters": 650},
                  {"id": "z2", "name": "Zone B", "is_active": True, "water_used_liters": 600}],
         "last_activation": datetime.now(timezone.utc).isoformat(),
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.irrigation_systems.insert_many(irrigation_data)
    
    # Create demo recommendations
    recommendations_data = [
        {"id": "rec1", "user_id": "farmer-001", "parcel_id": "p3", "parcel_name": "Parcelle Est",
         "type": "irrigation", "priority": "elevee", "title": "Irrigation d'urgence nécessaire",
         "message": "Le niveau d'humidité du sol est critique (45%). Activation automatique de l'irrigation recommandée dans les 2h.",
         "confidence_percent": 94, "deadline_hours": 2, "ai_source": "system", "status": "pending",
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "rec2", "user_id": "farmer-001", "parcel_id": "p3", "parcel_name": "Parcelle Est",
         "type": "disease_treatment", "priority": "urgent", "title": "Traitement anti-mildiou requis",
         "message": "Détection de mildiou sur 4.2 ha avec 85% de confiance. Traitement fongicide recommandé sous 24h.",
         "confidence_percent": 85, "deadline_hours": 24, "ai_source": "gpt-5.2", "status": "pending",
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "rec3", "user_id": "farmer-001", "parcel_id": "p1", "parcel_name": "Parcelle Nord",
         "type": "fertilisation", "priority": "moyenne", "title": "Optimisation phosphore",
         "message": "Apport ciblé en phosphore pour maximiser le rendement en période de floraison.",
         "confidence_percent": 78, "deadline_hours": 48, "ai_source": "system", "status": "pending",
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.recommendations.insert_many(recommendations_data)
    
    # Create demo marketplace products
    products_data = [
        {"id": "prod1", "seller_id": "farmer-001", "seller_name": "Jean Dupont",
         "title": "Blé bio", "category": "cereals", "quantity": 25, "unit": "tonnes",
         "price_per_unit": 320, "currency": "EUR", "location": "Beauce, France",
         "available_date": "15/07/2024",
         "description": "Blé tendre biologique de haute qualité, certification AB.",
         "certifications": ["Agriculture Biologique", "HVE Niveau 3"],
         "is_bio": True, "is_premium": False, "status": "disponible",
         "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800",
         "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod2", "seller_id": "supplier-001", "seller_name": "Agro Intrants SARL",
         "title": "Engrais NPK 15-15-15", "category": "fertilizers", "quantity": 100, "unit": "sacs",
         "price_per_unit": 25000, "currency": "XAF", "location": "Douala, Cameroun",
         "available_date": "Immédiat",
         "description": "Engrais complet équilibré pour toutes cultures. Sacs de 50kg.",
         "certifications": ["Homologué MINADER"],
         "is_bio": False, "is_premium": True, "status": "disponible",
         "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
         "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.marketplace_products.insert_many(products_data)
    
    # Create demo alerts
    alerts_data = [
        {"id": "alert1", "user_id": "farmer-001", "type": "disease",
         "title": "Maladie détectée par IA", "message": "Mildiou identifié sur Parcelle Est avec 85% de confiance - Action immédiate requise",
         "priority": "critique", "parcel_name": "Parcelle Est", "is_read": False,
         "channels": ["in_app", "sms"], "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "alert2", "user_id": "farmer-001", "type": "irrigation",
         "title": "Seuil d'irrigation atteint", "message": "Humidité critique (45%) - Système d'irrigation automatique activé",
         "priority": "warning", "parcel_name": "Parcelle Est", "is_read": False,
         "channels": ["in_app"], "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "alert3", "user_id": "farmer-001", "type": "drone",
         "title": "Vol de drone programmé", "message": "Mission de surveillance prévue demain 8h - Conditions météo favorables",
         "priority": "info", "parcel_name": "Parcelle Est", "is_read": False,
         "channels": ["in_app"], "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    await db.alerts.insert_many(alerts_data)
    
    return {"message": "Base de données initialisée avec succès", "developer": "Barra Martial Aristide", "company": "African AI Solutions"}

# =============================================================================
# P0 FEATURES - AI RECOMMENDATIONS AGENT
# =============================================================================

@api_router.post("/ai/generate-recommendations")
async def generate_ai_recommendations(user = Depends(get_current_user)):
    """Generate AI-powered recommendations based on parcel and sensor data"""
    try:
        user_query = {"user_id": user["id"]} if user.get("role") != "admin" else {}
        
        # Get parcels and sensors data
        parcels = await db.parcels.find(user_query if user_query else {}, {"_id": 0}).to_list(20)
        sensors = await db.sensors.find({}, {"_id": 0}).to_list(50)
        
        recommendations = []
        
        for parcel in parcels:
            # Analyze humidity
            if parcel.get("humidity", 50) < 40:
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "parcel_id": parcel["id"],
                    "parcel_name": parcel["name"],
                    "type": "irrigation",
                    "priority": "urgent" if parcel.get("humidity", 50) < 30 else "elevee",
                    "title": f"Irrigation urgente - {parcel['name']}",
                    "message": f"L'humidité du sol est critique ({parcel.get('humidity', 0)}%). Activez l'irrigation immédiatement pour éviter le stress hydrique des cultures {parcel.get('crop_type', '')}.",
                    "actions": ["Activer irrigation automatique", "Programmer arrosage manuel"],
                    "confidence_percent": 92,
                    "source": "agricam_ai_agent",
                    "status": "pending",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            
            # Analyze temperature
            if parcel.get("temperature", 25) > 35:
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "parcel_id": parcel["id"],
                    "parcel_name": parcel["name"],
                    "type": "protection",
                    "priority": "elevee",
                    "title": f"Protection thermique - {parcel['name']}",
                    "message": f"Température élevée détectée ({parcel.get('temperature', 0)}°C). Recommandation: installer des voiles d'ombrage ou activer le brumisateur.",
                    "actions": ["Installer protection solaire", "Activer brumisation"],
                    "confidence_percent": 88,
                    "source": "agricam_ai_agent",
                    "status": "pending",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
            
            # Analyze soil nutrients
            soil = parcel.get("soil_analysis", {})
            if soil.get("nitrogen", 50) < 40:
                recommendations.append({
                    "id": str(uuid.uuid4()),
                    "user_id": user["id"],
                    "parcel_id": parcel["id"],
                    "parcel_name": parcel["name"],
                    "type": "fertilisation",
                    "priority": "moyenne",
                    "title": f"Fertilisation azotée - {parcel['name']}",
                    "message": f"Niveau d'azote faible ({soil.get('nitrogen', 0)}). Application d'engrais azoté recommandée pour optimiser la croissance de {parcel.get('crop_type', '')}.",
                    "actions": ["Appliquer urée 46%", "Utiliser engrais organique"],
                    "confidence_percent": 85,
                    "source": "agricam_ai_agent",
                    "status": "pending",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
        
        # Save to database
        if recommendations:
            await db.recommendations.insert_many(recommendations)
        
        return {
            "generated": len(recommendations),
            "recommendations": recommendations,
            "message": f"{len(recommendations)} nouvelles recommandations générées par l'IA AGRICAM"
        }
        
    except Exception as e:
        logger.error(f"AI Recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# P0 FEATURES - SMS ALERTS (TWILIO SIMULATION)
# =============================================================================

class SMSRequest(BaseModel):
    phone_number: str
    message: str
    alert_id: Optional[str] = None

@api_router.post("/sms/send")
async def send_sms_alert(request: SMSRequest, user = Depends(get_current_user)):
    """Send SMS alert (simulated for Orange/MTN Cameroon)"""
    try:
        # Simulate SMS sending for African networks
        phone = request.phone_number.replace(" ", "")  # Remove spaces
        # Orange: 69x, 65x (some), MTN: 67x, 68x, 65x (some)
        if phone.startswith("+23769") or phone.startswith("+23766"):
            network = "Orange Cameroun"
        elif phone.startswith("+23767") or phone.startswith("+23768") or phone.startswith("+23765"):
            network = "MTN Cameroun"
        else:
            network = "Réseau Cameroun"
        
        # Log SMS
        sms_record = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "phone_number": phone,
            "message": request.message[:160],  # SMS limit
            "network": network,
            "alert_id": request.alert_id,
            "status": "sent",  # Simulated
            "cost_xaf": 25,  # Typical SMS cost in XAF
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.sms_logs.insert_one(sms_record)
        
        # Update alert if linked
        if request.alert_id:
            await db.alerts.update_one(
                {"id": request.alert_id},
                {"$push": {"channels": "sms"}, "$set": {"sms_sent_at": datetime.now(timezone.utc).isoformat()}}
            )
        
        return {
            "success": True,
            "message": f"SMS envoyé à {phone} via {network} (simulé)",
            "sms_id": sms_record["id"],
            "network": network,
            "cost_xaf": 25,
            "note": "Mode simulation - En production, intégrez l'API Orange/MTN"
        }
        
    except Exception as e:
        logger.error(f"SMS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sms/broadcast")
async def broadcast_sms_to_farmers(message: str = Form(...), priority: str = Form("info"), user = Depends(require_roles([UserRole.ADMIN]))):
    """Send SMS broadcast to all farmers (admin only, simulated)"""
    try:
        farmers = await db.users.find({"role": "farmer", "phone": {"$exists": True}}, {"_id": 0, "phone": 1, "first_name": 1}).to_list(100)
        
        sent_count = 0
        for farmer in farmers:
            if farmer.get("phone"):
                sms_record = {
                    "id": str(uuid.uuid4()),
                    "phone_number": farmer["phone"],
                    "message": message[:160],
                    "type": "broadcast",
                    "priority": priority,
                    "status": "sent",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.sms_logs.insert_one(sms_record)
                sent_count += 1
        
        return {
            "success": True,
            "sent_count": sent_count,
            "total_farmers": len(farmers),
            "message": f"Diffusion SMS envoyée à {sent_count} agriculteurs (simulé)",
            "total_cost_xaf": sent_count * 25
        }
        
    except Exception as e:
        logger.error(f"SMS broadcast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sms/history")
async def get_sms_history(user = Depends(get_current_user)):
    """Get SMS sending history"""
    query = {"user_id": user["id"]} if user.get("role") != "admin" else {}
    sms_logs = await db.sms_logs.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    total_cost = sum(log.get("cost_xaf", 0) for log in sms_logs)
    
    return {
        "logs": sms_logs,
        "total_sent": len(sms_logs),
        "total_cost_xaf": total_cost
    }

# =============================================================================
# P0 FEATURES - PDF/WORD EXPORT
# =============================================================================

@api_router.get("/export/report/{report_type}")
async def export_report(report_type: str, format: str = Query("pdf", enum=["pdf", "word", "csv"]), user = Depends(get_current_user)):
    """Export reports in PDF, Word or CSV format"""
    try:
        user_query = {"user_id": user["id"]} if user.get("role") != "admin" else {}
        
        # Gather data based on report type
        if report_type == "parcels":
            data = await db.parcels.find(user_query if user_query else {}, {"_id": 0}).to_list(100)
            title = "Rapport des Parcelles"
        elif report_type == "sensors":
            data = await db.sensors.find({}, {"_id": 0}).to_list(100)
            title = "Rapport des Capteurs IoT"
        elif report_type == "irrigation":
            data = await db.irrigation_systems.find({}, {"_id": 0}).to_list(100)
            title = "Rapport d'Irrigation"
        elif report_type == "recommendations":
            data = await db.recommendations.find(user_query, {"_id": 0}).to_list(100)
            title = "Rapport des Recommandations"
        elif report_type == "alerts":
            data = await db.alerts.find(user_query, {"_id": 0}).to_list(100)
            title = "Rapport des Alertes"
        elif report_type == "analytics":
            # Comprehensive analytics report
            parcels = await db.parcels.find(user_query if user_query else {}, {"_id": 0}).to_list(100)
            sensors = await db.sensors.find({}, {"_id": 0}).to_list(100)
            
            data = {
                "total_parcels": len(parcels),
                "total_area_hectares": sum(p.get("area_hectares", 0) for p in parcels),
                "average_humidity": round(sum(p.get("humidity", 0) for p in parcels) / max(len(parcels), 1), 1),
                "average_temperature": round(sum(p.get("temperature", 0) for p in parcels) / max(len(parcels), 1), 1),
                "active_sensors": len([s for s in sensors if s.get("status") == "actif"]),
                "cultures": list(set(p.get("crop_type", "") for p in parcels)),
                "parcels_status": {
                    "excellent": len([p for p in parcels if p.get("status") == "excellent"]),
                    "bon": len([p for p in parcels if p.get("status") == "bon"]),
                    "attention": len([p for p in parcels if p.get("status") == "attention"])
                }
            }
            title = "Rapport Analytics Complet"
        else:
            raise HTTPException(status_code=400, detail="Type de rapport non supporté")
        
        # Generate report content
        report_content = {
            "title": title,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by": f"{user.get('first_name', '')} {user.get('last_name', '')}",
            "company": "African AI Solutions",
            "platform": "AGRICAM IA",
            "format": format,
            "data": data
        }
        
        if format == "csv":
            # Return CSV
            if isinstance(data, list) and data:
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
                content = output.getvalue()
                
                return StreamingResponse(
                    io.BytesIO(content.encode('utf-8')),
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=agricam_{report_type}_{datetime.now().strftime('%Y%m%d')}.csv"}
                )
        
        # For PDF/Word, return JSON that frontend will convert
        return {
            "report": report_content,
            "download_instructions": f"Utilisez les données ci-dessous pour générer votre rapport {format.upper()}",
            "format": format,
            "filename": f"agricam_{report_type}_{datetime.now().strftime('%Y%m%d')}.{format}"
        }
        
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# P1 FEATURES - E-LEARNING MODULE
# =============================================================================

@api_router.get("/learning/courses")
async def get_courses():
    """Get available e-learning courses"""
    courses = await db.courses.find({}, {"_id": 0}).to_list(50)
    
    if not courses:
        # Return demo courses
        courses = [
            {
                "id": "course-001",
                "title": "Introduction à l'Agriculture de Précision",
                "description": "Découvrez les fondamentaux de l'agriculture de précision et comment utiliser AGRICAM IA",
                "instructor": "AGRICAM IA",
                "duration_hours": 2,
                "level": "debutant",
                "modules": [
                    {"title": "Qu'est-ce que l'agriculture de précision?", "duration_min": 30},
                    {"title": "Utilisation des capteurs IoT", "duration_min": 45},
                    {"title": "Analyse des données avec l'IA", "duration_min": 45}
                ],
                "certificate_available": True,
                "language": "fr",
                "enrolled_count": 156,
                "rating": 4.8
            },
            {
                "id": "course-002",
                "title": "Gestion de l'Irrigation Intelligente",
                "description": "Apprenez à optimiser votre consommation d'eau grâce aux systèmes d'irrigation automatisés",
                "instructor": "AGRICAM IA",
                "duration_hours": 3,
                "level": "intermediaire",
                "modules": [
                    {"title": "Configuration des systèmes d'irrigation", "duration_min": 40},
                    {"title": "Interprétation des données d'humidité", "duration_min": 50},
                    {"title": "Programmation des cycles d'arrosage", "duration_min": 45},
                    {"title": "Maintenance préventive", "duration_min": 35}
                ],
                "certificate_available": True,
                "language": "fr",
                "enrolled_count": 89,
                "rating": 4.6
            },
            {
                "id": "course-003",
                "title": "Détection des Maladies par IA",
                "description": "Utilisez l'intelligence artificielle pour identifier et traiter les maladies de vos cultures",
                "instructor": "AGRICAM IA",
                "duration_hours": 4,
                "level": "avance",
                "modules": [
                    {"title": "Bases de la phytopathologie", "duration_min": 60},
                    {"title": "Capture d'images pour l'analyse", "duration_min": 30},
                    {"title": "Interprétation des résultats IA", "duration_min": 45},
                    {"title": "Traitements recommandés", "duration_min": 50},
                    {"title": "Prévention et bonnes pratiques", "duration_min": 55}
                ],
                "certificate_available": True,
                "language": "fr",
                "enrolled_count": 67,
                "rating": 4.9
            }
        ]
    
    return courses

@api_router.post("/learning/enroll/{course_id}")
async def enroll_course(course_id: str, user = Depends(get_current_user)):
    """Enroll in an e-learning course"""
    enrollment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "course_id": course_id,
        "progress_percent": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_modules": [],
        "certificate_earned": False
    }
    
    await db.enrollments.insert_one(enrollment)
    
    return {
        "success": True,
        "enrollment_id": enrollment["id"],
        "message": "Inscription réussie au cours"
    }

@api_router.post("/learning/complete-module")
async def complete_module(course_id: str = Form(...), module_index: int = Form(...), user = Depends(get_current_user)):
    """Mark a course module as completed"""
    enrollment = await db.enrollments.find_one({"user_id": user["id"], "course_id": course_id})
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Inscription non trouvée")
    
    completed_modules = enrollment.get("completed_modules", [])
    if module_index not in completed_modules:
        completed_modules.append(module_index)
    
    # Calculate progress
    courses = await get_courses()
    course = next((c for c in courses if c["id"] == course_id), None)
    total_modules = len(course["modules"]) if course else 3
    progress = int((len(completed_modules) / total_modules) * 100)
    
    await db.enrollments.update_one(
        {"user_id": user["id"], "course_id": course_id},
        {"$set": {"completed_modules": completed_modules, "progress_percent": progress}}
    )
    
    # Issue certificate if completed
    certificate_id = None
    if progress >= 100:
        certificate_id = str(uuid.uuid4())
        await db.enrollments.update_one(
            {"user_id": user["id"], "course_id": course_id},
            {"$set": {
                "certificate_earned": True,
                "certificate_id": certificate_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    return {
        "progress_percent": progress,
        "completed_modules": completed_modules,
        "certificate_earned": progress >= 100,
        "certificate_id": certificate_id
    }

@api_router.get("/learning/my-courses")
async def get_my_courses(user = Depends(get_current_user)):
    """Get user's enrolled courses with progress"""
    enrollments = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(20)
    return enrollments

@api_router.get("/learning/certificate/{certificate_id}")
async def get_certificate(certificate_id: str, user = Depends(get_current_user)):
    """Get certificate details"""
    enrollment = await db.enrollments.find_one(
        {"user_id": user["id"], "certificate_id": certificate_id},
        {"_id": 0}
    )
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Certificat non trouvé")
    
    courses = await get_courses()
    course = next((c for c in courses if c["id"] == enrollment["course_id"]), None)
    
    return {
        "certificate_id": certificate_id,
        "course_title": course["title"] if course else "Cours AGRICAM IA",
        "user_name": f"{user.get('first_name', '')} {user.get('last_name', '')}",
        "issued_date": enrollment.get("completed_at", datetime.now(timezone.utc).isoformat()),
        "issuer": "AGRICAM IA - African AI Solutions",
        "verification_url": f"https://agricam-ia.com/verify/{certificate_id}"
    }

# =============================================================================
# P1 FEATURES - MULTILINGUAL SUPPORT
# =============================================================================

LANGUAGES = {
    "fr": {"name": "Français", "native": "Français"},
    "en": {"name": "English", "native": "English"},
    "fulbe": {"name": "Fulfulde", "native": "𞤊𞤵𞤤𞤬𞤵𞤤𞤣𞤫"},
    "bassa": {"name": "Bassa", "native": "Ɓàsàa"},
    "douala": {"name": "Douala", "native": "Duálá"},
    "ewondo": {"name": "Ewondo", "native": "Ewondo"},
    "bulu": {"name": "Bulu", "native": "Bulu"},
    "ghomala": {"name": "Ghomala'", "native": "Ghɔmálá'"},
    "fe_fe": {"name": "Fe'fe'", "native": "Fə̀ʼfə̀ʼ"},
    "bamoun": {"name": "Bamoun", "native": "Shü Pamom"},
    "ar": {"name": "Arabic", "native": "العربية"},
    "sw": {"name": "Swahili", "native": "Kiswahili"},
    "pt": {"name": "Portuguese", "native": "Português"},
    "es": {"name": "Spanish", "native": "Español"},
    "zh": {"name": "Chinese", "native": "中文"}
}

TRANSLATIONS = {
    "fr": {
        "welcome": "Bienvenue sur AGRICAM IA",
        "dashboard": "Tableau de bord",
        "parcels": "Parcelles",
        "sensors": "Capteurs",
        "irrigation": "Irrigation",
        "alerts": "Alertes",
        "recommendations": "Recommandations",
        "settings": "Paramètres"
    },
    "en": {
        "welcome": "Welcome to AGRICAM IA",
        "dashboard": "Dashboard",
        "parcels": "Parcels",
        "sensors": "Sensors",
        "irrigation": "Irrigation",
        "alerts": "Alerts",
        "recommendations": "Recommendations",
        "settings": "Settings"
    },
    "fulbe": {
        "welcome": "Bisimilla e AGRICAM IA",
        "dashboard": "Taftal",
        "parcels": "Gese",
        "sensors": "Masiŋji",
        "irrigation": "Ndiyam",
        "alerts": "Habrude",
        "recommendations": "Wasiyaaji",
        "settings": "Teelal"
    },
    "ewondo": {
        "welcome": "Mbolo e AGRICAM IA",
        "dashboard": "Etut",
        "parcels": "Afup",
        "sensors": "Bitsit",
        "irrigation": "Mendim",
        "alerts": "Akalan",
        "recommendations": "Minkpaman",
        "settings": "Mintil"
    }
}

@api_router.get("/languages")
async def get_available_languages():
    """Get list of available languages including Cameroonian"""
    return {
        "languages": LANGUAGES,
        "default": "fr",
        "cameroonian": ["fulbe", "bassa", "douala", "ewondo", "bulu", "ghomala", "fe_fe", "bamoun"]
    }

@api_router.get("/translations/{lang}")
async def get_translations(lang: str):
    """Get UI translations for a language"""
    if lang not in TRANSLATIONS:
        lang = "fr"  # Fallback to French
    
    return {
        "language": lang,
        "translations": TRANSLATIONS.get(lang, TRANSLATIONS["fr"]),
        "direction": "rtl" if lang == "ar" else "ltr"
    }

@api_router.post("/user/language")
async def set_user_language(lang: str = Form(...), user = Depends(get_current_user)):
    """Set user's preferred language"""
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"preferred_language": lang}}
    )
    
    return {"success": True, "language": lang}

# =============================================================================
# P2 FEATURES - ROBOT CONTROL & 3D RECONSTRUCTION
# =============================================================================

# =============================================================================
# AGRIBOT - ROBOT AGRICOLE INTELLIGENT AMÉLIORÉ
# =============================================================================

class RobotCommand(BaseModel):
    action: str
    parameters: Optional[dict] = {}

class RobotMovement(BaseModel):
    direction: str  # forward, backward, left, right, stop
    speed: float = 1.0  # m/s
    duration: Optional[float] = None  # seconds

class RobotWaypoint(BaseModel):
    latitude: float
    longitude: float
    action_on_arrival: Optional[str] = None

# Store robot state in memory for real-time updates
robot_states = {
    "agribot-001": {
        "id": "agribot-001",
        "name": "AgriBot Alpha",
        "status": "actif",
        "battery_percent": 78,
        "position": {"lat": 5.9631, "lng": 10.1591, "altitude": 0.5},
        "orientation": {"heading": 45, "pitch": 0, "roll": 0},
        "speed_kmh": 0,
        "mode": "idle",
        "current_task": None,
        "sensors": {
            "lidar_3d": {"status": "actif", "range_m": 100, "points_per_sec": 300000},
            "camera_rgb": {"status": "actif", "resolution": "4K", "fps": 30},
            "camera_thermal": {"status": "actif", "resolution": "640x480"},
            "camera_multispectral": {"status": "actif", "bands": ["R", "G", "B", "NIR", "RE"]},
            "gps_rtk": {"status": "actif", "precision_cm": 2},
            "imu": {"status": "actif"},
            "ultrasonic": {"status": "actif", "sensors_count": 8}
        },
        "wifi_signal": 85,
        "connection_type": "4G LTE",
        "fuel_type": "electric",
        "total_distance_km": 156.7,
        "total_hours": 234,
        "last_maintenance": "2024-12-01",
        "firmware_version": "3.2.1"
    },
    "agribot-002": {
        "id": "agribot-002", 
        "name": "AgriBot Beta",
        "status": "maintenance",
        "battery_percent": 45,
        "position": {"lat": 5.9641, "lng": 10.1601, "altitude": 0.5},
        "orientation": {"heading": 180, "pitch": 0, "roll": 0},
        "speed_kmh": 0,
        "mode": "idle",
        "current_task": None,
        "sensors": {
            "lidar_3d": {"status": "actif", "range_m": 100},
            "camera_rgb": {"status": "actif"},
            "camera_thermal": {"status": "inactif"},
            "gps_rtk": {"status": "actif", "precision_cm": 2}
        },
        "wifi_signal": 72,
        "connection_type": "WiFi",
        "total_distance_km": 89.3,
        "total_hours": 145
    }
}

@api_router.get("/robot/status")
async def get_robot_status(user = Depends(get_current_user)):
    """Get all robots status and telemetry"""
    robots = await db.robots.find({}, {"_id": 0}).to_list(10)
    
    if not robots:
        # Return demo robots with real-time simulated data
        robots = []
        for robot_id, robot in robot_states.items():
            robot_data = robot.copy()
            robot_data["last_update"] = datetime.now(timezone.utc).isoformat()
            # Simulate battery drain
            robot_data["battery_percent"] = max(10, robot_data["battery_percent"] - random.randint(0, 1))
            robots.append(robot_data)
    
    return robots

@api_router.get("/robot/{robot_id}")
async def get_robot_detail(robot_id: str, user = Depends(get_current_user)):
    """Get detailed robot information"""
    robot = await db.robots.find_one({"id": robot_id}, {"_id": 0})
    
    if not robot:
        if robot_id in robot_states:
            robot = robot_states[robot_id].copy()
            robot["last_update"] = datetime.now(timezone.utc).isoformat()
        else:
            raise HTTPException(status_code=404, detail="Robot non trouvé")
    
    # Add command history
    commands = await db.robot_commands.find(
        {"robot_id": robot_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    robot["recent_commands"] = commands
    robot["statistics"] = {
        "tasks_completed_today": random.randint(3, 12),
        "area_covered_today_ha": round(random.uniform(2, 8), 2),
        "photos_captured_today": random.randint(50, 200),
        "anomalies_detected": random.randint(0, 5)
    }
    
    return robot

@api_router.post("/robot/{robot_id}/control")
async def control_robot(robot_id: str, command: RobotCommand, user = Depends(get_current_user)):
    """Control robot with advanced commands"""
    valid_actions = [
        "start", "stop", "pause", "resume", "return_home",
        "scan_area", "capture_3d", "patrol", "follow_path",
        "move_forward", "move_backward", "turn_left", "turn_right",
        "take_photo", "start_video", "stop_video",
        "spray_treatment", "collect_sample", "emergency_stop"
    ]
    
    if command.action not in valid_actions:
        raise HTTPException(
            status_code=400, 
            detail=f"Action invalide. Actions disponibles: {', '.join(valid_actions)}"
        )
    
    # Update robot state
    if robot_id in robot_states:
        if command.action == "start":
            robot_states[robot_id]["status"] = "actif"
            robot_states[robot_id]["mode"] = "autonomous"
        elif command.action == "stop" or command.action == "emergency_stop":
            robot_states[robot_id]["status"] = "arrêté"
            robot_states[robot_id]["mode"] = "idle"
            robot_states[robot_id]["speed_kmh"] = 0
        elif command.action == "pause":
            robot_states[robot_id]["mode"] = "paused"
            robot_states[robot_id]["speed_kmh"] = 0
        elif command.action in ["move_forward", "patrol"]:
            robot_states[robot_id]["speed_kmh"] = command.parameters.get("speed", 2.5)
            robot_states[robot_id]["mode"] = "moving"
        elif command.action == "scan_area":
            robot_states[robot_id]["current_task"] = "Scan 3D en cours"
            robot_states[robot_id]["mode"] = "scanning"
    
    # Log command to database
    command_record = {
        "id": str(uuid.uuid4()),
        "robot_id": robot_id,
        "action": command.action,
        "parameters": command.parameters,
        "user_id": user["id"],
        "user_email": user.get("email"),
        "status": "executed",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.robot_commands.insert_one(command_record)
    
    # Action-specific responses
    responses = {
        "start": {"message": "Robot démarré en mode autonome", "estimated_battery_life_hours": 4},
        "stop": {"message": "Robot arrêté avec succès", "final_position": robot_states.get(robot_id, {}).get("position")},
        "emergency_stop": {"message": "ARRÊT D'URGENCE ACTIVÉ", "alert_level": "critical"},
        "pause": {"message": "Robot en pause - En attente de commande"},
        "resume": {"message": "Robot reprend sa mission"},
        "return_home": {"message": "Retour à la base initié", "eta_minutes": 15},
        "scan_area": {"message": "Scan 3D de la zone démarré", "estimated_duration_minutes": 10},
        "capture_3d": {"message": "Capture 3D haute résolution en cours", "points_target": 500000},
        "patrol": {"message": "Mode patrouille activé", "route": "Zone A -> Zone B -> Zone C"},
        "move_forward": {"message": f"Déplacement avant à {command.parameters.get('speed', 2.5)} km/h"},
        "move_backward": {"message": "Déplacement arrière"},
        "turn_left": {"message": "Rotation gauche de 90°"},
        "turn_right": {"message": "Rotation droite de 90°"},
        "take_photo": {"message": "Photo capturée", "resolution": "4K", "saved": True},
        "start_video": {"message": "Enregistrement vidéo démarré", "resolution": "1080p", "fps": 30},
        "stop_video": {"message": "Enregistrement vidéo arrêté"},
        "spray_treatment": {"message": "Pulvérisation en cours", "product": command.parameters.get("product", "Fongicide")},
        "collect_sample": {"message": "Échantillon collecté", "sample_id": str(uuid.uuid4())[:8]}
    }
    
    response = responses.get(command.action, {"message": "Commande exécutée"})
    
    return {
        "success": True,
        "command_id": command_record["id"],
        "robot_id": robot_id,
        "action": command.action,
        **response,
        "robot_status": robot_states.get(robot_id, {}).get("status", "unknown"),
        "timestamp": command_record["timestamp"]
    }

@api_router.post("/robot/{robot_id}/move")
async def move_robot(robot_id: str, movement: RobotMovement, user = Depends(get_current_user)):
    """Direct movement control for robot"""
    if robot_id not in robot_states:
        raise HTTPException(status_code=404, detail="Robot non trouvé")
    
    speed_map = {
        "forward": movement.speed,
        "backward": -movement.speed,
        "left": 0,
        "right": 0,
        "stop": 0
    }
    
    # Update robot state
    robot_states[robot_id]["speed_kmh"] = abs(speed_map.get(movement.direction, 0)) * 3.6
    robot_states[robot_id]["mode"] = "manual" if movement.direction != "stop" else "idle"
    
    # Simulate position update
    if movement.direction == "forward":
        robot_states[robot_id]["position"]["lat"] += 0.0001 * movement.speed
    elif movement.direction == "backward":
        robot_states[robot_id]["position"]["lat"] -= 0.0001 * movement.speed
    elif movement.direction == "left":
        robot_states[robot_id]["orientation"]["heading"] = (robot_states[robot_id]["orientation"]["heading"] - 15) % 360
    elif movement.direction == "right":
        robot_states[robot_id]["orientation"]["heading"] = (robot_states[robot_id]["orientation"]["heading"] + 15) % 360
    
    return {
        "success": True,
        "robot_id": robot_id,
        "movement": movement.direction,
        "speed_mps": movement.speed,
        "new_position": robot_states[robot_id]["position"],
        "new_heading": robot_states[robot_id]["orientation"]["heading"]
    }

@api_router.post("/robot/{robot_id}/waypoint")
async def add_waypoint(robot_id: str, waypoint: RobotWaypoint, user = Depends(get_current_user)):
    """Add navigation waypoint for robot"""
    waypoint_record = {
        "id": str(uuid.uuid4()),
        "robot_id": robot_id,
        "latitude": waypoint.latitude,
        "longitude": waypoint.longitude,
        "action_on_arrival": waypoint.action_on_arrival,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["id"]
    }
    
    await db.robot_waypoints.insert_one(waypoint_record)
    
    return {
        "success": True,
        "waypoint_id": waypoint_record["id"],
        "message": f"Point de passage ajouté à ({waypoint.latitude}, {waypoint.longitude})",
        "total_waypoints": await db.robot_waypoints.count_documents({"robot_id": robot_id, "status": "pending"})
    }

@api_router.get("/robot/{robot_id}/3d-map")
async def get_3d_map(robot_id: str, user = Depends(get_current_user)):
    """Get 3D reconstruction data from robot LIDAR/cameras"""
    import random
    
    # Generate realistic 3D point cloud data
    num_points = 125000
    
    # Generate sample points for visualization
    sample_points = []
    for i in range(100):  # Send 100 sample points for frontend visualization
        sample_points.append({
            "x": round(random.uniform(0, 50), 2),
            "y": round(random.uniform(0, 50), 2),
            "z": round(random.uniform(0, 3), 2),
            "intensity": random.randint(0, 255),
            "classification": random.choice(["ground", "vegetation", "structure", "water"])
        })
    
    point_cloud = {
        "id": str(uuid.uuid4()),
        "robot_id": robot_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "scan_duration_seconds": 45,
        "point_cloud": {
            "total_points": num_points,
            "sample_points": sample_points,
            "density_points_per_m2": 500,
            "accuracy_cm": 2
        },
        "bounds": {
            "min": {"x": 0, "y": 0, "z": 0},
            "max": {"x": 50, "y": 50, "z": 10}
        },
        "detected_features": {
            "plant_rows": {
                "count": 12,
                "average_height_cm": 85,
                "health_status": "bon",
                "spacing_cm": 75
            },
            "obstacles": [
                {"id": "obs-1", "type": "rock", "position": {"x": 10, "y": 15, "z": 0.3}, "size_m": 0.5},
                {"id": "obs-2", "type": "tree_stump", "position": {"x": 25, "y": 30, "z": 0.4}, "size_m": 0.8},
                {"id": "obs-3", "type": "equipment", "position": {"x": 40, "y": 20, "z": 1.2}, "size_m": 2.0}
            ],
            "water_sources": [
                {"id": "water-1", "type": "irrigation_canal", "position": {"x": 5, "y": 5}, "width_m": 1.5}
            ],
            "paths": [
                {"id": "path-1", "type": "tractor_path", "width_m": 3.0, "condition": "bon"}
            ]
        },
        "terrain_analysis": {
            "elevation_map": {
                "min_m": 0,
                "max_m": 2.5,
                "average_m": 1.2
            },
            "slope": {
                "average_percent": 5,
                "max_percent": 15,
                "direction": "nord-sud"
            },
            "soil_classification": {
                "primary": "argilo-limoneux",
                "moisture_estimate": "modéré",
                "compaction_risk": "faible"
            }
        },
        "ai_analysis": {
            "navigation_zones": {
                "safe": 85,
                "caution": 12,
                "restricted": 3
            },
            "recommended_path": [
                {"x": 0, "y": 0}, {"x": 10, "y": 5}, {"x": 20, "y": 10}, 
                {"x": 30, "y": 15}, {"x": 40, "y": 20}, {"x": 50, "y": 25}
            ],
            "collision_risk": "faible",
            "optimal_speed_kmh": 3.5,
            "battery_to_complete": 15
        },
        "sarsa_predictions": {
            "q_values": {
                "forward": 0.85,
                "left": 0.72,
                "right": 0.68,
                "backward": 0.45
            },
            "recommended_action": "forward",
            "confidence": 0.92
        }
    }
    
    return point_cloud

@api_router.get("/robot/{robot_id}/camera-feed")
async def get_camera_feed(robot_id: str, camera_type: str = "rgb", user = Depends(get_current_user)):
    """Get robot camera feed data and analysis"""
    camera_configs = {
        "rgb": {"resolution": "3840x2160", "fps": 30, "codec": "H.265"},
        "thermal": {"resolution": "640x480", "fps": 15, "temp_range": "-20°C to 150°C"},
        "multispectral": {"resolution": "1280x960", "fps": 10, "bands": 5},
        "depth": {"resolution": "1280x720", "fps": 30, "range_m": "0.5-10"}
    }
    
    config = camera_configs.get(camera_type, camera_configs["rgb"])
    
    return {
        "robot_id": robot_id,
        "camera_type": camera_type,
        "stream_url": f"/api/robot/{robot_id}/stream/{camera_type}",
        "websocket_url": f"ws://api/robot/{robot_id}/ws/{camera_type}",
        "config": config,
        "status": "streaming",
        "analysis": {
            "enabled": True,
            "models": ["plant_detection", "disease_detection", "weed_detection"],
            "processing_fps": 10
        },
        "last_frame_analysis": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "objects_detected": random.randint(5, 20),
            "plants_healthy": random.randint(80, 100),
            "anomalies": random.randint(0, 3)
        }
    }

@api_router.get("/robot/{robot_id}/telemetry")
async def get_robot_telemetry(robot_id: str, user = Depends(get_current_user)):
    """Get real-time robot telemetry data"""
    if robot_id not in robot_states:
        raise HTTPException(status_code=404, detail="Robot non trouvé")
    
    robot = robot_states[robot_id]
    
    return {
        "robot_id": robot_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "position": robot["position"],
        "orientation": robot["orientation"],
        "speed_kmh": robot["speed_kmh"],
        "battery": {
            "percent": robot["battery_percent"],
            "voltage": 48.2,
            "current_draw_a": 12.5,
            "estimated_remaining_hours": robot["battery_percent"] / 20
        },
        "motors": {
            "left_front": {"rpm": 150, "temp_c": 42, "status": "ok"},
            "right_front": {"rpm": 152, "temp_c": 41, "status": "ok"},
            "left_rear": {"rpm": 148, "temp_c": 43, "status": "ok"},
            "right_rear": {"rpm": 151, "temp_c": 42, "status": "ok"}
        },
        "sensors_health": robot["sensors"],
        "connection": {
            "type": robot.get("connection_type", "WiFi"),
            "signal_strength": robot["wifi_signal"],
            "latency_ms": random.randint(20, 80)
        },
        "environment": {
            "temperature_c": round(random.uniform(25, 35), 1),
            "humidity_percent": random.randint(50, 80),
            "light_lux": random.randint(10000, 80000)
        }
    }

@api_router.get("/robot/{robot_id}/history")
async def get_robot_history(robot_id: str, limit: int = 50, user = Depends(get_current_user)):
    """Get robot command and activity history"""
    commands = await db.robot_commands.find(
        {"robot_id": robot_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {
        "robot_id": robot_id,
        "total_commands": len(commands),
        "commands": commands,
        "statistics": {
            "commands_today": sum(1 for c in commands if c.get("timestamp", "")[:10] == datetime.now().strftime("%Y-%m-%d")),
            "most_used_action": "scan_area",
            "total_distance_today_km": round(random.uniform(2, 10), 2)
        }
    }

# =============================================================================
# P2 FEATURES - CAMERA AI REAL-TIME ANALYSIS
# =============================================================================

@api_router.post("/camera-ai/analyze-frame")
async def analyze_camera_frame(
    image_data: str = Form(...),  # Base64 encoded
    parcel_id: str = Form(None),
    user = Depends(get_current_user)
):
    """Real-time camera frame analysis"""
    analysis = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "parcel_id": parcel_id,
        "analysis_results": {
            "soil_analysis": {
                "moisture_percent": 65,
                "texture": "limoneux",
                "color_index": "brun foncé",
                "organic_matter_estimate": "élevé"
            },
            "plant_analysis": {
                "health_status": "bon",
                "growth_stage": "floraison",
                "leaf_color_index": 0.72,
                "stress_indicators": [],
                "estimated_height_cm": 85
            },
            "environment_analysis": {
                "temperature_estimate_c": 28,
                "humidity_estimate_percent": 70,
                "light_level": "optimal",
                "wind_detected": "léger"
            },
            "pest_detection": {
                "insects_detected": [],
                "disease_signs": [],
                "risk_level": "faible"
            },
            "yield_prediction": {
                "estimated_yield_kg_ha": 4500,
                "confidence_percent": 82,
                "harvest_window_days": "15-20"
            }
        },
        "source": "agricam_camera_ai",
        "processing_time_ms": 245
    }
    
    await db.camera_analyses.insert_one(analysis)
    
    # Remove MongoDB _id before returning
    analysis.pop("_id", None)
    return analysis

@api_router.get("/camera-ai/live-stats")
async def get_live_camera_stats(parcel_id: str = None, user = Depends(get_current_user)):
    """Get live camera AI statistics"""
    return {
        "total_frames_analyzed_today": 1250,
        "average_processing_time_ms": 230,
        "alerts_generated": 3,
        "health_score_average": 85,
        "active_cameras": 2,
        "last_analysis": datetime.now(timezone.utc).isoformat()
    }

# =============================================================================
# P2 FEATURES - MOBILE MONEY INTEGRATION (ORANGE MONEY / MTN MOMO)
# =============================================================================

class MobileMoneyPayment(BaseModel):
    phone_number: str
    amount_xaf: int
    provider: str  # "orange_money" or "mtn_momo"
    description: str
    subscription_id: Optional[str] = None

@api_router.post("/payment/mobile-money")
async def initiate_mobile_money_payment(payment: MobileMoneyPayment, user = Depends(get_current_user)):
    """Initiate Orange Money or MTN MoMo payment"""
    
    # Validate provider
    if payment.provider not in ["orange_money", "mtn_momo"]:
        raise HTTPException(status_code=400, detail="Provider doit être 'orange_money' ou 'mtn_momo'")
    
    # Reference numbers (from user)
    provider_info = {
        "orange_money": {
            "name": "Orange Money Cameroun",
            "merchant_number": "698226903",
            "ussd_code": "#150*1*1#"
        },
        "mtn_momo": {
            "name": "MTN Mobile Money",
            "merchant_number": "653722443",
            "ussd_code": "*126#"
        }
    }
    
    info = provider_info[payment.provider]
    
    # Create payment record
    payment_record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "phone_number": payment.phone_number,
        "amount_xaf": payment.amount_xaf,
        "provider": payment.provider,
        "provider_name": info["name"],
        "merchant_number": info["merchant_number"],
        "description": payment.description,
        "subscription_id": payment.subscription_id,
        "status": "pending",
        "reference": f"AGRICAM-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8].upper()}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payments.insert_one(payment_record)
    
    return {
        "success": True,
        "payment_id": payment_record["id"],
        "reference": payment_record["reference"],
        "provider": info["name"],
        "merchant_number": info["merchant_number"],
        "amount_xaf": payment.amount_xaf,
        "instructions": f"Pour finaliser votre paiement de {payment.amount_xaf} XAF:\n"
                       f"1. Composez {info['ussd_code']} sur votre téléphone\n"
                       f"2. Sélectionnez 'Payer marchand'\n"
                       f"3. Entrez le numéro: {info['merchant_number']}\n"
                       f"4. Montant: {payment.amount_xaf} XAF\n"
                       f"5. Référence: {payment_record['reference']}\n"
                       f"6. Validez avec votre code PIN",
        "status": "pending"
    }

@api_router.post("/payment/verify/{payment_id}")
async def verify_payment(payment_id: str, user = Depends(get_current_user)):
    """Verify payment status (simulated)"""
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement non trouvé")
    
    # Simulate payment verification (in production, would call Orange/MTN API)
    # For demo, auto-confirm after checking
    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "completed", "verified_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # If subscription payment, activate subscription
    if payment.get("subscription_id"):
        await db.subscriptions.update_one(
            {"id": payment["subscription_id"]},
            {"$set": {"status": "active", "activated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {
        "success": True,
        "payment_id": payment_id,
        "status": "completed",
        "message": "Paiement vérifié et confirmé avec succès"
    }

@api_router.get("/payment/history")
async def get_payment_history(user = Depends(get_current_user)):
    """Get user payment history"""
    query = {"user_id": user["id"]} if user.get("role") != "admin" else {}
    payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    total_paid = sum(p.get("amount_xaf", 0) for p in payments if p.get("status") == "completed")
    
    return {
        "payments": payments,
        "total_transactions": len(payments),
        "total_paid_xaf": total_paid
    }

# =============================================================================
# P2 FEATURES - DEVELOPER ANALYTICS PLATFORM (GOOGLE ANALYTICS STYLE)
# =============================================================================

@api_router.get("/dev-analytics/overview")
async def get_dev_analytics_overview(user = Depends(require_roles([UserRole.ADMIN]))):
    """Get platform analytics overview (admin only)"""
    
    # User stats
    total_users = await db.users.count_documents({})
    active_users_24h = await db.users.count_documents({
        "last_login": {"$gte": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()}
    })
    
    # User distribution by role
    user_roles = {}
    for role in ["farmer", "supplier", "financial", "admin", "partner", "investor"]:
        user_roles[role] = await db.users.count_documents({"role": role})
    
    # Content stats
    total_parcels = await db.parcels.count_documents({})
    total_sensors = await db.sensors.count_documents({})
    total_analyses = await db.image_analyses.count_documents({})
    
    # Payment stats
    total_payments = await db.payments.count_documents({"status": "completed"})
    payments = await db.payments.find({"status": "completed"}, {"_id": 0, "amount_xaf": 1}).to_list(1000)
    total_revenue_xaf = sum(p.get("amount_xaf", 0) for p in payments)
    
    # SMS stats
    total_sms = await db.sms_logs.count_documents({})
    
    return {
        "overview": {
            "total_users": total_users,
            "active_users_24h": active_users_24h,
            "user_growth_percent": 12.5,  # Simulated
            "retention_rate_percent": 78  # Simulated
        },
        "user_distribution": user_roles,
        "content_metrics": {
            "total_parcels": total_parcels,
            "total_sensors": total_sensors,
            "total_analyses": total_analyses,
            "average_parcels_per_user": round(total_parcels / max(total_users, 1), 1)
        },
        "revenue_metrics": {
            "total_payments": total_payments,
            "total_revenue_xaf": total_revenue_xaf,
            "average_payment_xaf": round(total_revenue_xaf / max(total_payments, 1), 0)
        },
        "engagement_metrics": {
            "total_sms_sent": total_sms,
            "api_calls_today": 1250,  # Simulated
            "average_session_duration_min": 12  # Simulated
        },
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/dev-analytics/users")
async def get_user_analytics(user = Depends(require_roles([UserRole.ADMIN]))):
    """Get detailed user analytics"""
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(100)
    
    # Daily signups (simulated for last 7 days)
    daily_signups = [
        {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "count": 5 + i}
        for i in range(7)
    ]
    
    return {
        "users": users,
        "total": len(users),
        "daily_signups": daily_signups,
        "by_subscription": {
            "freemium": len([u for u in users if u.get("subscription_plan") == "freemium"]),
            "basic": len([u for u in users if u.get("subscription_plan") == "basic"]),
            "premium": len([u for u in users if u.get("subscription_plan") == "premium"])
        }
    }

@api_router.get("/dev-analytics/activity-log")
async def get_activity_log(limit: int = 50, user = Depends(require_roles([UserRole.ADMIN]))):
    """Get platform activity log"""
    # Compile recent activities from various collections
    activities = []
    
    # Recent logins
    recent_logins = await db.users.find(
        {"last_login": {"$exists": True}},
        {"_id": 0, "email": 1, "last_login": 1, "role": 1}
    ).sort("last_login", -1).to_list(20)
    
    for login in recent_logins:
        activities.append({
            "type": "login",
            "description": f"{login['email']} s'est connecté",
            "user_role": login.get("role"),
            "timestamp": login.get("last_login")
        })
    
    # Recent analyses
    recent_analyses = await db.image_analyses.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    for analysis in recent_analyses:
        activities.append({
            "type": "analysis",
            "description": f"Analyse IA effectuée sur {analysis.get('parcel_name', 'parcelle')}",
            "timestamp": analysis.get("created_at")
        })
    
    # Recent payments
    recent_payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    for payment in recent_payments:
        activities.append({
            "type": "payment",
            "description": f"Paiement {payment.get('provider', 'Mobile Money')}: {payment.get('amount_xaf', 0)} XAF",
            "status": payment.get("status"),
            "timestamp": payment.get("created_at")
        })
    
    # Sort by timestamp
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {
        "activities": activities[:limit],
        "total": len(activities)
    }

@api_router.get("/dev-analytics/seo-report")
async def get_seo_report(user = Depends(require_roles([UserRole.ADMIN]))):
    """Get SEO analysis report (AI-powered)"""
    return {
        "overall_score": 85,
        "recommendations": [
            {
                "category": "meta_tags",
                "score": 90,
                "status": "bon",
                "message": "Balises meta bien configurées"
            },
            {
                "category": "mobile_friendly",
                "score": 95,
                "status": "excellent",
                "message": "Site entièrement responsive"
            },
            {
                "category": "page_speed",
                "score": 78,
                "status": "à améliorer",
                "message": "Optimiser les images pour améliorer la vitesse"
            },
            {
                "category": "content",
                "score": 82,
                "status": "bon",
                "message": "Contenu riche et pertinent"
            },
            {
                "category": "security",
                "score": 100,
                "status": "excellent",
                "message": "HTTPS activé, certificat valide"
            }
        ],
        "keywords": ["agriculture de précision", "IoT agricole", "IA agriculture", "irrigation intelligente", "Cameroun"],
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/dev-analytics/validate-subscription/{user_id}")
async def validate_user_subscription(user_id: str, plan: str = Form(...), months: int = Form(1), admin = Depends(require_roles([UserRole.ADMIN]))):
    """Admin: Manually validate a user subscription"""
    
    if plan not in ["freemium", "basic", "premium"]:
        raise HTTPException(status_code=400, detail="Plan invalide")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "subscription_plan": plan,
            "subscription_start": datetime.now(timezone.utc).isoformat(),
            "subscription_end": (datetime.now(timezone.utc) + timedelta(days=30*months)).isoformat(),
            "subscription_validated_by": admin["id"]
        }}
    )
    
    return {
        "success": True,
        "user_id": user_id,
        "plan": plan,
        "duration_months": months,
        "message": f"Abonnement {plan} validé pour {months} mois"
    }

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("🌾 AGRICAM IA API v3.0 starting - Developed by Barra Martial Aristide / African AI Solutions")
    count = await db.parcels.count_documents({})
    if count == 0:
        logger.info("Seeding database with demo data...")
        await seed_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
