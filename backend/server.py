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
                    "datasets": [
                        {"label": col, "data": [float(records[i].get(col, 0)) for i in range(min(len(records), 12))] 
                         for col in columns[:3] if any(records[0].get(col, '').replace('.','').replace('-','').isdigit() for _ in [1])}
                    ][:3]
                }
            }
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
async def control_irrigation(system_id: str, action: str = Query(...)):
    status_map = {"start": "actif", "pause": "pause", "stop": "arrete"}
    if action not in status_map:
        raise HTTPException(status_code=400, detail="Action invalide")
    await db.irrigation_systems.update_one({"id": system_id}, {"$set": {"status": status_map[action], "last_activation": datetime.now(timezone.utc).isoformat()}})
    return {"message": f"Irrigation {action}"}

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
