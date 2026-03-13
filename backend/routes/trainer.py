"""
AGRICAM IA - Trainer (Formateur) Routes
Training management, ebook sales, video publishing
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os

router = APIRouter(prefix="/api/trainer", tags=["Trainer"])

# Import shared dependencies
try:
    from core import db, get_current_user, logger
except ImportError:
    from motor.motor_asyncio import AsyncIOMotorClient
    from dotenv import load_dotenv
    from pathlib import Path
    import logging
    load_dotenv(Path(__file__).parent.parent / '.env')
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME')]
    logger = logging.getLogger(__name__)
    get_current_user = None


class TrainingCreate(BaseModel):
    title: str
    description: str
    category: str  # agriculture, agronomie, irrigation, elevage, technologie
    target_roles: List[str] = ["farmer"]  # Which roles can see this training
    difficulty: str = "debutant"  # debutant, intermediaire, avance
    duration_minutes: int = 60
    content: Optional[str] = ""
    video_url: Optional[str] = None
    price: float = 0  # 0 = free
    is_published: bool = False


class EbookCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float = 0
    download_enabled: bool = True
    content_preview: Optional[str] = ""
    file_url: Optional[str] = None


class TrainerProfileUpdate(BaseModel):
    bio: Optional[str] = None
    specialties: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    certifications: Optional[List[str]] = None
    experience_years: Optional[int] = None
    verified: Optional[bool] = None


# --- Trainer Profile ---
@router.get("/profile")
async def get_trainer_profile(user=Depends(get_current_user)):
    """Get trainer profile"""
    profile = await db.trainer_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        profile = {
            "user_id": user["id"],
            "full_name": user.get("full_name", ""),
            "email": user.get("email", ""),
            "bio": "",
            "specialties": [],
            "linkedin_url": "",
            "certifications": [],
            "experience_years": 0,
            "verified": False,
            "total_trainings": 0,
            "total_students": 0,
            "total_ebooks": 0,
            "rating": 0,
        }
    return profile


@router.put("/profile")
async def update_trainer_profile(data: TrainerProfileUpdate, user=Depends(get_current_user)):
    """Update trainer profile"""
    update_fields = {k: v for k, v in data.dict(exclude_none=True).items()}
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.trainer_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": {**update_fields, "user_id": user["id"], "full_name": user.get("full_name", "")}},
        upsert=True
    )
    return {"success": True, "message": "Profil formateur mis a jour"}


# --- Trainings ---
@router.get("/trainings")
async def get_trainings(user=Depends(get_current_user), published_only: bool = False):
    """Get trainings - trainers see their own, others see published only"""
    if user.get("role") in ("trainer", "admin"):
        query = {"trainer_id": user["id"]} if user["role"] == "trainer" else {}
    else:
        query = {"is_published": True}
    
    # Filter by target role if not admin/trainer
    if user.get("role") not in ("trainer", "admin"):
        query["$or"] = [
            {"target_roles": {"$in": [user.get("role", "farmer")]}},
            {"target_roles": {"$in": ["all"]}}
        ]
    
    trainings = await db.trainings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    if not trainings:
        # Demo trainings
        return [
            {"id": "tr-001", "title": "Agriculture de precision avec drones", "description": "Apprenez a utiliser les drones pour surveiller vos cultures", "category": "technologie", "target_roles": ["farmer", "agronomist"], "difficulty": "intermediaire", "duration_minutes": 120, "trainer_name": "Dr. Paul Mbarga", "is_published": True, "price": 0, "students_count": 45, "rating": 4.8, "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "created_at": "2026-01-15T10:00:00Z"},
            {"id": "tr-002", "title": "Gestion integree des ravageurs", "description": "Techniques biologiques et chimiques pour proteger vos cultures", "category": "agronomie", "target_roles": ["farmer", "agronomist"], "difficulty": "avance", "duration_minutes": 90, "trainer_name": "Ing. Marie Ngo", "is_published": True, "price": 5000, "students_count": 32, "rating": 4.5, "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "created_at": "2026-02-01T10:00:00Z"},
            {"id": "tr-003", "title": "Irrigation intelligente pour debutants", "description": "Les bases de l'irrigation automatisee avec AGRICAM IA", "category": "irrigation", "target_roles": ["farmer"], "difficulty": "debutant", "duration_minutes": 60, "trainer_name": "Agronome Jean Fotso", "is_published": True, "price": 0, "students_count": 78, "rating": 4.9, "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "created_at": "2026-02-15T10:00:00Z"},
            {"id": "tr-004", "title": "Analyse financiere agricole", "description": "Comprendre les metriques financieres pour votre exploitation", "category": "agriculture", "target_roles": ["financial", "farmer"], "difficulty": "intermediaire", "duration_minutes": 75, "trainer_name": "Expert Finance Agricole", "is_published": True, "price": 3000, "students_count": 20, "rating": 4.3, "created_at": "2026-03-01T10:00:00Z"},
        ]
    return trainings


@router.post("/trainings")
async def create_training(data: TrainingCreate, user=Depends(get_current_user)):
    """Create a new training (trainer/admin only)"""
    if user.get("role") not in ("trainer", "admin"):
        raise HTTPException(403, "Seuls les formateurs peuvent creer des formations")
    
    training = {
        "id": f"tr-{str(uuid.uuid4())[:8]}",
        "trainer_id": user["id"],
        "trainer_name": user.get("full_name", "Formateur"),
        **data.dict(),
        "students_count": 0,
        "rating": 0,
        "enrollments": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.trainings.insert_one(training)
    training.pop("_id", None)
    return {"success": True, "training": training}


@router.put("/trainings/{training_id}/publish")
async def toggle_publish(training_id: str, user=Depends(get_current_user)):
    """Publish/unpublish a training"""
    training = await db.trainings.find_one({"id": training_id, "trainer_id": user["id"]})
    if not training:
        raise HTTPException(404, "Formation non trouvee")
    new_status = not training.get("is_published", False)
    await db.trainings.update_one({"id": training_id}, {"$set": {"is_published": new_status}})
    return {"success": True, "is_published": new_status}


@router.post("/trainings/{training_id}/enroll")
async def enroll_training(training_id: str, user=Depends(get_current_user)):
    """Enroll in a training"""
    training = await db.trainings.find_one({"id": training_id}, {"_id": 0})
    if not training:
        raise HTTPException(404, "Formation non trouvee")
    
    # Check if already enrolled
    existing = await db.training_enrollments.find_one({"training_id": training_id, "user_id": user["id"]})
    if existing:
        return {"success": True, "message": "Deja inscrit", "enrollment_id": existing.get("id")}
    
    enrollment = {
        "id": str(uuid.uuid4()),
        "training_id": training_id,
        "user_id": user["id"],
        "user_name": user.get("full_name", ""),
        "progress": 0,
        "completed": False,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.training_enrollments.insert_one(enrollment)
    await db.trainings.update_one({"id": training_id}, {"$inc": {"students_count": 1}})
    return {"success": True, "enrollment": {k: v for k, v in enrollment.items() if k != "_id"}}


@router.get("/my-enrollments")
async def get_my_enrollments(user=Depends(get_current_user)):
    """Get user's training enrollments"""
    enrollments = await db.training_enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    return enrollments


# --- Ebooks ---
@router.get("/ebooks")
async def get_ebooks(user=Depends(get_current_user)):
    """Get available ebooks"""
    if user.get("role") in ("trainer", "admin"):
        query = {"trainer_id": user["id"]} if user["role"] == "trainer" else {}
    else:
        query = {"is_published": True}
    
    ebooks = await db.ebooks.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    if not ebooks:
        return [
            {"id": "eb-001", "title": "Guide complet de l'agriculture de precision", "description": "200 pages sur les techniques modernes", "category": "technologie", "price": 10000, "download_enabled": True, "downloads": 156, "trainer_name": "Dr. Paul Mbarga", "created_at": "2026-01-20T10:00:00Z"},
            {"id": "eb-002", "title": "Manuel de gestion des sols africains", "description": "Techniques adaptees aux sols tropicaux", "category": "agronomie", "price": 7500, "download_enabled": True, "downloads": 89, "trainer_name": "Ing. Marie Ngo", "created_at": "2026-02-05T10:00:00Z"},
            {"id": "eb-003", "title": "Irrigation automatisee - Guide pratique", "description": "Installation et maintenance des systemes d'irrigation", "category": "irrigation", "price": 0, "download_enabled": True, "downloads": 234, "trainer_name": "Agronome Jean Fotso", "created_at": "2026-02-20T10:00:00Z"},
        ]
    return ebooks


@router.post("/ebooks")
async def create_ebook(data: EbookCreate, user=Depends(get_current_user)):
    """Create a new ebook (trainer/admin only)"""
    if user.get("role") not in ("trainer", "admin"):
        raise HTTPException(403, "Seuls les formateurs peuvent creer des ebooks")
    
    ebook = {
        "id": f"eb-{str(uuid.uuid4())[:8]}",
        "trainer_id": user["id"],
        "trainer_name": user.get("full_name", ""),
        **data.dict(),
        "is_published": True,
        "downloads": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.ebooks.insert_one(ebook)
    ebook.pop("_id", None)
    return {"success": True, "ebook": ebook}


@router.put("/ebooks/{ebook_id}/toggle-download")
async def toggle_ebook_download(ebook_id: str, user=Depends(get_current_user)):
    """Enable/disable ebook downloads"""
    ebook = await db.ebooks.find_one({"id": ebook_id, "trainer_id": user["id"]})
    if not ebook:
        raise HTTPException(404, "Ebook non trouve")
    new_status = not ebook.get("download_enabled", True)
    await db.ebooks.update_one({"id": ebook_id}, {"$set": {"download_enabled": new_status}})
    return {"success": True, "download_enabled": new_status}


# --- Trainer Verification ---
@router.post("/request-verification")
async def request_verification(user=Depends(get_current_user)):
    """Request trainer verification"""
    if user.get("role") != "trainer":
        raise HTTPException(403, "Seuls les formateurs peuvent demander la verification")
    
    request_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user.get("full_name", ""),
        "status": "pending",
        "requested_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.verification_requests.update_one(
        {"user_id": user["id"]},
        {"$set": request_doc},
        upsert=True
    )
    return {"success": True, "message": "Demande de verification soumise"}


@router.get("/verification-status")
async def get_verification_status(user=Depends(get_current_user)):
    """Get trainer verification status"""
    req = await db.verification_requests.find_one({"user_id": user["id"]}, {"_id": 0})
    profile = await db.trainer_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return {
        "verified": profile.get("verified", False) if profile else False,
        "request": req
    }


# --- Stats ---
@router.get("/stats")
async def get_trainer_stats(user=Depends(get_current_user)):
    """Get trainer dashboard stats"""
    trainings_count = await db.trainings.count_documents({"trainer_id": user["id"]})
    ebooks_count = await db.ebooks.count_documents({"trainer_id": user["id"]})
    enrollments_count = await db.training_enrollments.count_documents({
        "training_id": {"$in": [t["id"] for t in await db.trainings.find({"trainer_id": user["id"]}, {"id": 1, "_id": 0}).to_list(100)]}
    }) if trainings_count > 0 else 0
    
    return {
        "total_trainings": trainings_count,
        "total_ebooks": ebooks_count,
        "total_students": enrollments_count,
        "verified": False,
    }
