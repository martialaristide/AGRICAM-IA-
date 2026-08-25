"""
AGRICAM IA - Pydantic Schemas
Request/Response models
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime
from .enums import (
    AlertPriority,
    IrrigationStatus,
    LoanStatus,
    MissionStatus,
    OrderStatus,
    ParcelStatus,
    PaymentProvider,
    PaymentStatus,
    ProductStatus,
    RecommendationPriority,
    RecommendationType,
    SensorStatus,
    SensorType,
    SubscriptionType,
    UserRole,
)

# =============================================================================
# AUTH SCHEMAS
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.FARMER
    region: Optional[str] = None
    farm_size_hectares: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    region: Optional[str] = None
    subscription_type: str = "freemium"
    is_verified: bool = False

# =============================================================================
# PARCEL SCHEMAS
# =============================================================================

class ParcelCreate(BaseModel):
    name: str
    culture_type: str
    surface_hectares: float
    location: str
    status: ParcelStatus = ParcelStatus.BON
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class ParcelResponse(BaseModel):
    id: str
    name: str
    culture_type: str
    surface_hectares: float
    location: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    owner_id: Optional[str] = None
    created_at: Optional[datetime] = None

# =============================================================================
# SENSOR SCHEMAS
# =============================================================================

class SensorCreate(BaseModel):
    name: str
    type: SensorType
    parcel_id: str
    wifi_ssid: Optional[str] = None
    wifi_password: Optional[str] = None

class SensorResponse(BaseModel):
    id: str
    name: str
    type: str
    parcel_id: str
    status: str
    battery_level: int
    last_value: Optional[float] = None
    wifi_connected: bool = False

# =============================================================================
# IRRIGATION SCHEMAS
# =============================================================================

class IrrigationCreate(BaseModel):
    parcel_id: str
    threshold_min: float = 30.0
    threshold_max: float = 70.0

class IrrigationResponse(BaseModel):
    id: str
    parcel_id: str
    status: str
    threshold_min: float
    threshold_max: float
    current_humidity: float
    last_irrigation: Optional[datetime] = None

# =============================================================================
# MARKETPLACE SCHEMAS
# =============================================================================

class ProductCreate(BaseModel):
    name: str
    description: str
    price_per_kg: float
    quantity_kg: float
    category: str
    is_bio: bool = False
    images: List[str] = []

class OrderCreate(BaseModel):
    product_id: str
    quantity: float
    delivery_address: str
    payment_method: str = "mobile_money"

# =============================================================================
# PAYMENT SCHEMAS
# =============================================================================

class MobileMoneyPayment(BaseModel):
    phone_number: str
    amount_xaf: float
    provider: PaymentProvider
    description: str = "Abonnement AGRICAM IA"

class PaymentResponse(BaseModel):
    payment_id: str
    reference: str
    status: str
    amount_xaf: float
    provider: str
    instructions: Optional[str] = None
    merchant_number: Optional[str] = None

# =============================================================================
# SMS SCHEMAS
# =============================================================================

class SMSRequest(BaseModel):
    phone_number: str
    message: str
    priority: str = "info"

# =============================================================================
# CHAT SCHEMAS
# =============================================================================

class ChatMessage(BaseModel):
    message: str
    parcel_id: Optional[str] = None
