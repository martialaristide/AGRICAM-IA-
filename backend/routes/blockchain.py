"""
AGRICAM IA 2.0 - Blockchain Traceability for Farmers
Product traceability from farm to table
"""
from fastapi import APIRouter, Depends
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import json

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Traceability"])


class TraceEntry(BaseModel):
    product_name: str
    batch_id: Optional[str] = None
    action: str  # planted, treated, harvested, stored, shipped, delivered
    location: Optional[str] = None
    details: Optional[str] = None
    quantity_kg: Optional[float] = None
    quality_grade: Optional[str] = None


def compute_hash(data: dict) -> str:
    """Compute a SHA-256 hash for blockchain-like integrity"""
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()


@router.get("/products")
async def get_traced_products(user=Depends(get_current_user)):
    """Get all traced products for this user"""
    products = await db.blockchain_products.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    if not products:
        # Demo data
        return [
            {"id": "BP-001", "product_name": "Mais Bio Premium", "batch_id": "LOT-2026-001", "total_entries": 5, "status": "delivered",
             "origin": "Bafoussam, Ouest", "certification": "Bio Certifie", "qr_code": "AGRI-TRC-001",
             "created_at": "2026-01-10T08:00:00Z", "last_update": "2026-03-01T14:00:00Z"},
            {"id": "BP-002", "product_name": "Cacao Fin Arome", "batch_id": "LOT-2026-002", "total_entries": 3, "status": "stored",
             "origin": "Kumba, Sud-Ouest", "certification": "Rainforest Alliance", "qr_code": "AGRI-TRC-002",
             "created_at": "2026-02-01T10:00:00Z", "last_update": "2026-02-28T16:00:00Z"},
            {"id": "BP-003", "product_name": "Riz Paddy", "batch_id": "LOT-2026-003", "total_entries": 4, "status": "shipped",
             "origin": "Yagoua, Extreme-Nord", "certification": "En cours", "qr_code": "AGRI-TRC-003",
             "created_at": "2026-01-20T06:00:00Z", "last_update": "2026-03-05T09:00:00Z"},
        ]
    return products


@router.post("/trace")
async def add_trace_entry(data: TraceEntry, user=Depends(get_current_user)):
    """Add a new entry to the product traceability chain"""
    batch_id = data.batch_id or f"LOT-{datetime.now().strftime('%Y')}-{str(uuid.uuid4())[:6].upper()}"

    # Get existing product or create new
    existing = await db.blockchain_products.find_one({"batch_id": batch_id, "user_id": user["id"]})

    entry = {
        "id": str(uuid.uuid4()),
        "action": data.action,
        "location": data.location or "Non specifie",
        "details": data.details or "",
        "quantity_kg": data.quantity_kg,
        "quality_grade": data.quality_grade,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "recorded_by": user["full_name"],
    }
    entry["hash"] = compute_hash(entry)

    if existing:
        # Add entry to existing chain
        prev_hash = existing.get("chain_head_hash", "genesis")
        entry["previous_hash"] = prev_hash
        entry["block_number"] = existing.get("total_entries", 0) + 1

        await db.blockchain_products.update_one(
            {"batch_id": batch_id, "user_id": user["id"]},
            {"$push": {"entries": entry}, "$set": {
                "chain_head_hash": entry["hash"],
                "total_entries": entry["block_number"],
                "status": data.action,
                "last_update": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"success": True, "entry": entry, "batch_id": batch_id, "block_number": entry["block_number"]}
    else:
        # Create new traced product
        entry["previous_hash"] = "genesis"
        entry["block_number"] = 1
        product_doc = {
            "id": f"BP-{str(uuid.uuid4())[:6].upper()}",
            "user_id": user["id"],
            "product_name": data.product_name,
            "batch_id": batch_id,
            "entries": [entry],
            "total_entries": 1,
            "status": data.action,
            "origin": data.location or "Non specifie",
            "certification": "En cours",
            "qr_code": f"AGRI-TRC-{str(uuid.uuid4())[:6].upper()}",
            "chain_head_hash": entry["hash"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_update": datetime.now(timezone.utc).isoformat(),
        }
        await db.blockchain_products.insert_one(product_doc)
        product_doc.pop("_id", None)
        return {"success": True, "product": product_doc}


@router.get("/trace/{batch_id}")
async def get_trace_chain(batch_id: str, user=Depends(get_current_user)):
    """Get the full traceability chain for a product"""
    product = await db.blockchain_products.find_one({"batch_id": batch_id}, {"_id": 0})
    if not product:
        # Return demo chain
        return {
            "batch_id": batch_id, "product_name": "Produit Demo",
            "entries": [
                {"action": "planted", "location": "Bafoussam", "timestamp": "2026-01-10T08:00:00Z", "block_number": 1, "hash": "abc123", "details": "Semis de mais variete CAMIR-01"},
                {"action": "treated", "location": "Bafoussam", "timestamp": "2026-02-15T10:00:00Z", "block_number": 2, "hash": "def456", "details": "Traitement preventif bio"},
                {"action": "harvested", "location": "Bafoussam", "timestamp": "2026-06-20T06:00:00Z", "block_number": 3, "hash": "ghi789", "details": "Recolte 4.2 t/ha", "quantity_kg": 2100},
                {"action": "stored", "location": "Entrepot Douala", "timestamp": "2026-06-25T14:00:00Z", "block_number": 4, "hash": "jkl012", "details": "Stockage en silo ventile"},
                {"action": "shipped", "location": "Port de Douala", "timestamp": "2026-07-01T08:00:00Z", "block_number": 5, "hash": "mno345", "details": "Expedition vers marche regional"},
            ],
            "chain_valid": True
        }
    # Verify chain integrity
    chain_valid = True
    entries = product.get("entries", [])
    for i in range(1, len(entries)):
        if entries[i].get("previous_hash") != entries[i-1].get("hash"):
            chain_valid = False
            break
    product["chain_valid"] = chain_valid
    return product


@router.post("/verify/{qr_code}")
async def verify_product(qr_code: str):
    """Public endpoint: Verify product authenticity via QR code"""
    product = await db.blockchain_products.find_one({"qr_code": qr_code}, {"_id": 0, "user_id": 0})
    if not product:
        return {"verified": False, "message": "Produit non trouve"}
    entries = product.get("entries", [])
    chain_valid = True
    for i in range(1, len(entries)):
        if entries[i].get("previous_hash") != entries[i-1].get("hash"):
            chain_valid = False
            break
    return {"verified": chain_valid, "product_name": product.get("product_name"), "origin": product.get("origin"),
            "certification": product.get("certification"), "total_steps": len(entries), "last_action": entries[-1].get("action") if entries else "N/A"}
