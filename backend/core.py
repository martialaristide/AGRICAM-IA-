"""
AGRICAM IA - Core Module
Shared dependencies for all route files
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import os
import uuid
import json
import re
import logging

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# JWT
import jwt as pyjwt
import bcrypt

JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'agricam-secret-key-prod-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Logger
logger = logging.getLogger("agricam")

# Security
security = HTTPBearer(auto_error=False)

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    FARMER = "farmer"
    SUPPLIER = "supplier"
    FINANCIAL = "financial"
    PARTNER = "partner"
    INVESTOR = "investor"
    SEED_ANALYST = "seed_analyst"
    AGRONOMIST = "agronomist"

# Auth helpers
def decode_token(token: str) -> dict:
    try:
        return pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expire")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Non authentifie")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouve")
    return user

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(user=Depends(get_current_user)):
        if user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Acces non autorise")
        return user
    return role_checker

# AI Model failover chain
AI_MODELS_CHAIN = [
    ("gemini", "gemini-2.5-flash"),
    ("openai", "gpt-4o-mini"),
    ("gemini", "gemini-2.0-flash"),
]

async def ai_analyze(system_prompt: str, user_prompt: str, session_prefix: str, image_base64: str = None):
    """Run AI analysis with automatic model failover. Returns (response_text, model_used)"""
    for provider, model_name in AI_MODELS_CHAIN:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"{session_prefix}-{uuid.uuid4()}",
                system_message=system_prompt
            ).with_model(provider, model_name)

            file_contents = []
            if image_base64:
                file_contents = [ImageContent(image_base64=image_base64)]

            response = await chat.send_message(UserMessage(text=user_prompt, file_contents=file_contents))
            return response, f"{provider}/{model_name}"
        except Exception as e:
            logger.warning(f"AI model {provider}/{model_name} failed: {e}")
            continue
    return None, "fallback"

def parse_ai_json(response_text: str, fallback: dict = None):
    """Parse JSON from AI response with fallback"""
    if not response_text:
        return fallback or {}
    try:
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    return fallback or {"raw": response_text}
