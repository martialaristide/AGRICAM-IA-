"""
AGRICAM IA - Configuration Module
Centralized configuration management
"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise ValueError("MONGO_URL environment variable is required")
DB_NAME = os.environ.get('DB_NAME', 'agricam_db')

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

# Mobile Money Configuration (for real integration)
CINETPAY_API_KEY = os.environ.get('CINETPAY_API_KEY', '')
CINETPAY_SITE_ID = os.environ.get('CINETPAY_SITE_ID', '')
CINETPAY_SECRET_KEY = os.environ.get('CINETPAY_SECRET_KEY', '')
PAYDUNYA_MASTER_KEY = os.environ.get('PAYDUNYA_MASTER_KEY', '')
PAYDUNYA_PRIVATE_KEY = os.environ.get('PAYDUNYA_PRIVATE_KEY', '')
PAYDUNYA_TOKEN = os.environ.get('PAYDUNYA_TOKEN', '')

# Mobile Money Merchant Numbers (Cameroon)
ORANGE_MONEY_MERCHANT = "698226903"
MTN_MOMO_MERCHANT = "653722443"

# Subscription Packages
SUBSCRIPTION_PACKAGES = {
    "basic_monthly": {"amount": 5000.0, "currency": "xof", "duration_days": 30, "type": "basic"},
    "basic_quarterly": {"amount": 15000.0, "currency": "xof", "duration_days": 90, "type": "basic"},
    "basic_annual": {"amount": 50000.0, "currency": "xof", "duration_days": 365, "type": "basic"},
    "premium_monthly": {"amount": 15000.0, "currency": "xof", "duration_days": 30, "type": "premium"},
    "premium_quarterly": {"amount": 25000.0, "currency": "xof", "duration_days": 90, "type": "premium"},
    "premium_annual": {"amount": 200000.0, "currency": "xof", "duration_days": 365, "type": "premium"},
}

# App Metadata
APP_NAME = "AGRICAM IA"
APP_VERSION = "4.0.0"
APP_DESCRIPTION = "Plateforme d'agriculture de précision intelligente - Développée par Barra Martial Aristide / African AI Solutions"
