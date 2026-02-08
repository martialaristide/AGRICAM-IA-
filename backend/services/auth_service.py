"""
AGRICAM IA - Authentication Service
JWT token management and password hashing
"""
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION
from models.enums import UserRole

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str, email: str) -> str:
    """Create a JWT token for a user"""
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get the current authenticated user"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Non authentifié")
    return decode_token(credentials.credentials)

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to optionally get the current user (doesn't fail if not authenticated)"""
    if not credentials:
        return None
    try:
        return decode_token(credentials.credentials)
    except:
        return None

def require_roles(allowed_roles: List[UserRole]):
    """Dependency factory to check if user has required role"""
    async def role_checker(user = Depends(get_current_user)):
        if user["role"] not in [r.value for r in allowed_roles]:
            raise HTTPException(status_code=403, detail="Accès refusé - Rôle insuffisant")
        return user
    return role_checker
