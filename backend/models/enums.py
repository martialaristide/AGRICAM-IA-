"""
AGRICAM IA - Enums
All enumeration types used in the application
"""
from enum import Enum

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

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PaymentProvider(str, Enum):
    ORANGE_MONEY = "orange_money"
    MTN_MOMO = "mtn_momo"
