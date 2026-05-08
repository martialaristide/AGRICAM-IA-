"""
Licensing module — additive, isolated. Plans: FREE / PREMIUM / COOPERATIVE / ENTERPRISE.
Coexists with existing /api/payments and /api/subscription endpoints (no override).
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging
import os
import jwt as pyjwt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/licensing", tags=["licensing"])

_db = None
_get_user = None

def init_db(database, auth_dep):
    global _db, _get_user
    _db = database
    _get_user = auth_dep


# === PLANS ===
LICENSE_PLANS = {
    "free": {
        "id": "free",
        "name": "Gratuit",
        "price_monthly_xaf": 0,
        "price_annual_xaf": 0,
        "features": {
            "ai_analyses_per_month": 5,
            "history_days": 7,
            "max_parcels": 2,
            "drone_missions": False,
            "api_access": False,
            "priority_support": False,
            "multi_user": False,
        },
        "description": "Découvrez AGRICAM IA — limité à 5 analyses IA/mois et 2 parcelles.",
    },
    "premium_farmer": {
        "id": "premium_farmer",
        "name": "Premium Agriculteur",
        "price_monthly_xaf": 15000,
        "price_annual_xaf": 120000,
        "features": {
            "ai_analyses_per_month": -1,  # unlimited
            "history_days": -1,
            "max_parcels": 50,
            "drone_missions": True,
            "api_access": False,
            "priority_support": False,
            "multi_user": False,
        },
        "description": "Pour l'agriculteur professionnel : analyses IA illimitées, drones, historique complet.",
    },
    "cooperative": {
        "id": "cooperative",
        "name": "Coopérative / GIC",
        "price_monthly_xaf": 75000,
        "price_annual_xaf": 720000,
        "features": {
            "ai_analyses_per_month": -1,
            "history_days": -1,
            "max_parcels": 500,
            "drone_missions": True,
            "api_access": False,
            "priority_support": True,
            "multi_user": True,
            "max_members": 50,
        },
        "description": "Multi-utilisateurs, dashboard collaboratif, gestion des membres et statistiques agrégées.",
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Entreprise / Institution",
        "price_monthly_xaf": 250000,
        "price_annual_xaf": 2500000,
        "features": {
            "ai_analyses_per_month": -1,
            "history_days": -1,
            "max_parcels": -1,
            "drone_missions": True,
            "api_access": True,
            "priority_support": True,
            "multi_user": True,
            "max_members": -1,
            "white_label": True,
        },
        "description": "Accès API complet, white-label, dashboard analytics, support dédié 24/7.",
    },
}

PLAN_TIER = {"free": 0, "premium_farmer": 1, "cooperative": 2, "enterprise": 3}


# === Models ===
class SubscribeRequest(BaseModel):
    plan_id: str
    billing_cycle: str = "monthly"  # monthly | annual
    phone_number: Optional[str] = None  # for Mobile Money payment


# === Helpers ===
async def _user_from_request(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip() if auth else ""
    if not token:
        raise HTTPException(401, "Non authentifié")
    try:
        payload = pyjwt.decode(
            token,
            os.environ.get("JWT_SECRET_KEY", "agricam-secret-key-prod-2025"),
            algorithms=["HS256"],
        )
        user = await _db.users.find_one({"id": payload.get("user_id")}, {"_id": 0, "password_hash": 0})
    except Exception:
        raise HTTPException(401, "Token invalide")
    if not user:
        raise HTTPException(401, "Utilisateur non trouvé")
    return user


def _compute_status(license_doc: Optional[dict]) -> str:
    if not license_doc:
        return "none"
    if license_doc.get("status") == "suspended":
        return "suspended"
    if license_doc.get("status") == "pending":
        return "pending"
    end = license_doc.get("end_date")
    if end:
        try:
            end_dt = datetime.fromisoformat(str(end).replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > end_dt:
                return "expired"
        except Exception:
            pass
    return license_doc.get("status", "active")


# === Routes ===
@router.get("/plans")
async def get_plans():
    """Public — list all plans with features and prices."""
    return {"plans": list(LICENSE_PLANS.values())}


@router.get("/my-license")
async def my_license(request: Request):
    """Get current user's active license + computed status."""
    u = await _user_from_request(request)
    lic = await _db.licenses.find_one(
        {"user_id": u["id"], "status": {"$in": ["active", "pending", "suspended"]}},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    plan_id = (lic or {}).get("plan_id", "free")
    plan = LICENSE_PLANS.get(plan_id, LICENSE_PLANS["free"])
    status = _compute_status(lic)
    return {
        "license": lic,
        "plan": plan,
        "status": status,
        "tier": PLAN_TIER.get(plan_id, 0),
    }


@router.post("/subscribe")
async def subscribe(req: SubscribeRequest, request: Request):
    """Create a pending license. Payment is handled separately via /api/payments."""
    u = await _user_from_request(request)
    if req.plan_id not in LICENSE_PLANS:
        raise HTTPException(400, "Plan invalide")
    if req.billing_cycle not in ("monthly", "annual"):
        raise HTTPException(400, "Cycle de facturation invalide (monthly|annual)")

    plan = LICENSE_PLANS[req.plan_id]
    amount = plan["price_annual_xaf"] if req.billing_cycle == "annual" else plan["price_monthly_xaf"]
    duration_days = 365 if req.billing_cycle == "annual" else 30

    # Free plan = instant activation
    if req.plan_id == "free":
        license_doc = {
            "id": f"lic-{uuid.uuid4().hex[:12]}",
            "user_id": u["id"],
            "plan_id": "free",
            "billing_cycle": "free",
            "amount_xaf": 0,
            "status": "active",
            "start_date": datetime.now(timezone.utc).isoformat(),
            "end_date": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await _db.licenses.insert_one(license_doc)
        license_doc.pop("_id", None)
        return {"success": True, "license": license_doc, "requires_payment": False}

    # Paid plan → create pending license
    license_doc = {
        "id": f"lic-{uuid.uuid4().hex[:12]}",
        "user_id": u["id"],
        "plan_id": req.plan_id,
        "billing_cycle": req.billing_cycle,
        "amount_xaf": amount,
        "status": "pending",
        "start_date": None,
        "end_date": None,
        "duration_days": duration_days,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.licenses.insert_one(license_doc)

    # Audit log
    await _db.license_logs.insert_one({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "license_id": license_doc["id"],
        "user_id": u["id"],
        "action": "subscription_initiated",
        "plan_id": req.plan_id,
        "amount_xaf": amount,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "success": True,
        "license_id": license_doc["id"],
        "amount_xaf": amount,
        "plan_name": plan["name"],
        "billing_cycle": req.billing_cycle,
        "requires_payment": True,
        "next_step": "Appelez POST /api/payments/request-payment avec ce license_id en metadata, puis le webhook activera la licence.",
    }


@router.post("/activate/{license_id}")
async def activate_license(license_id: str, request: Request):
    """Activate a pending license after successful payment confirmation.
    Called internally by the payment webhook OR manually by admin."""
    u = await _user_from_request(request)
    lic = await _db.licenses.find_one({"id": license_id}, {"_id": 0})
    if not lic:
        raise HTTPException(404, "Licence introuvable")
    if lic["user_id"] != u["id"] and u.get("role") != "admin":
        raise HTTPException(403, "Accès refusé")
    if lic["status"] == "active":
        return {"success": True, "message": "Licence déjà active", "license": lic}

    duration = lic.get("duration_days", 30)
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=duration)
    await _db.licenses.update_one(
        {"id": license_id},
        {"$set": {
            "status": "active",
            "start_date": now.isoformat(),
            "end_date": end.isoformat(),
            "activated_at": now.isoformat(),
        }},
    )
    await _db.license_logs.insert_one({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "license_id": license_id,
        "user_id": lic["user_id"],
        "action": "activated",
        "timestamp": now.isoformat(),
    })
    return {"success": True, "license_id": license_id, "end_date": end.isoformat()}


@router.get("/history")
async def license_history(request: Request):
    """Past + current licenses for the user."""
    u = await _user_from_request(request)
    licenses = await _db.licenses.find({"user_id": u["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"licenses": licenses}


# === Admin endpoints ===
@router.get("/admin/all")
async def admin_list_licenses(request: Request, status: Optional[str] = None, plan_id: Optional[str] = None):
    u = await _user_from_request(request)
    if u.get("role") != "admin":
        raise HTTPException(403, "Réservé aux administrateurs")
    query = {}
    if status:
        query["status"] = status
    if plan_id:
        query["plan_id"] = plan_id
    licenses = await _db.licenses.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Aggregate stats
    total_active = await _db.licenses.count_documents({"status": "active"})
    total_pending = await _db.licenses.count_documents({"status": "pending"})
    revenue_pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$plan_id", "total": {"$sum": "$amount_xaf"}, "count": {"$sum": 1}}},
    ]
    revenue_per_plan = await _db.licenses.aggregate(revenue_pipeline).to_list(10)
    return {
        "licenses": licenses,
        "stats": {
            "total_active": total_active,
            "total_pending": total_pending,
            "revenue_per_plan": [{"plan": r["_id"], "revenue_xaf": r["total"], "count": r["count"]} for r in revenue_per_plan],
        },
    }


@router.post("/admin/suspend/{license_id}")
async def admin_suspend(license_id: str, request: Request, reason: Optional[str] = None):
    u = await _user_from_request(request)
    if u.get("role") != "admin":
        raise HTTPException(403, "Réservé aux administrateurs")
    await _db.licenses.update_one(
        {"id": license_id},
        {"$set": {"status": "suspended", "suspended_at": datetime.now(timezone.utc).isoformat(), "suspension_reason": reason}},
    )
    await _db.license_logs.insert_one({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "license_id": license_id,
        "action": "suspended",
        "actor": u["id"],
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return {"success": True}


# === Feature-gate helper (for use by other routes) ===
async def get_user_plan_features(user_id: str) -> dict:
    """Return the active plan features for a user. Defaults to FREE."""
    lic = await _db.licenses.find_one(
        {"user_id": user_id, "status": "active"},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    plan_id = (lic or {}).get("plan_id", "free")
    # Verify not expired
    if lic and lic.get("end_date"):
        try:
            end_dt = datetime.fromisoformat(str(lic["end_date"]).replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > end_dt:
                plan_id = "free"
        except Exception:
            pass
    return LICENSE_PLANS.get(plan_id, LICENSE_PLANS["free"])
