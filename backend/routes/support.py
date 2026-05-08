"""
Support Center module — additive, isolated.
- Tickets (CRUD)
- Conversations (user ↔ support)
- File attachments (validated)
- Admin dashboard with filters
- Anti-spam rate limiting
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import logging
import os
import jwt as pyjwt
import base64

from security_helpers import rate_limit, validate_upload, sanitize_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/support", tags=["support"])

_db = None

def init_db(database, auth_dep):
    global _db
    _db = database


# === Models ===
class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    category: str = Field(..., pattern="^(technical|bug|payment|subscription|marketplace|suggestion|account|other)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    message: str = Field(..., min_length=10, max_length=5000)
    attachments: Optional[List[str]] = None  # base64 data URIs


class MessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    attachments: Optional[List[str]] = None


CATEGORY_LABELS = {
    "technical": "Problème technique",
    "bug": "Bug rencontré",
    "payment": "Erreur de paiement",
    "subscription": "Problème d'abonnement",
    "marketplace": "Problème marketplace",
    "suggestion": "Suggestion / Amélioration",
    "account": "Mon compte",
    "other": "Autre",
}

PRIORITY_SLA_HOURS = {"critical": 2, "high": 8, "medium": 24, "low": 72}


# === Auth helper ===
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


def _process_attachments(items: Optional[List[str]], max_count: int = 3) -> List[dict]:
    """Validate base64 data URIs (data:image/png;base64,...). Returns sanitized list."""
    if not items:
        return []
    if len(items) > max_count:
        raise HTTPException(400, f"Maximum {max_count} pièces jointes par message")
    out = []
    for idx, item in enumerate(items):
        if not isinstance(item, str) or not item.startswith("data:"):
            raise HTTPException(400, f"Pièce jointe {idx+1} invalide (format attendu: data URI)")
        try:
            header, b64 = item.split(",", 1)
            mime = header.split(";")[0].replace("data:", "").strip()
            content = base64.b64decode(b64)
        except Exception:
            raise HTTPException(400, f"Pièce jointe {idx+1} corrompue")
        ok, info = validate_upload(content, mime, max_bytes=3_000_000)
        if not ok:
            raise HTTPException(400, f"Pièce jointe {idx+1} rejetée: {info}")
        out.append({
            "id": f"att-{uuid.uuid4().hex[:10]}",
            "mime": info,
            "size": len(content),
            "data_uri": item,  # we keep as data URI for simplicity (small files only)
        })
    return out


# === Routes ===
@router.get("/categories")
async def get_categories():
    return {
        "categories": [{"id": k, "label": v} for k, v in CATEGORY_LABELS.items()],
        "priorities": [
            {"id": "low", "label": "Faible", "sla_hours": 72},
            {"id": "medium", "label": "Moyen", "sla_hours": 24},
            {"id": "high", "label": "Élevé", "sla_hours": 8},
            {"id": "critical", "label": "Critique", "sla_hours": 2},
        ],
    }


@router.post("/tickets")
async def create_ticket(req: TicketCreate, request: Request):
    """Create a support ticket. Rate-limited: max 5 tickets per IP per hour."""
    rate_limit(request, key="create-ticket", max_calls=5, window_sec=3600)
    u = await _user_from_request(request)

    subject = sanitize_text(req.subject, 200)
    message = sanitize_text(req.message, 5000)
    if not subject or not message:
        raise HTTPException(400, "Sujet et message requis")

    attachments = _process_attachments(req.attachments)
    ticket_number = f"TK-{datetime.now().strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    sla = PRIORITY_SLA_HOURS.get(req.priority, 24)

    ticket = {
        "id": f"ticket-{uuid.uuid4().hex[:12]}",
        "ticket_number": ticket_number,
        "user_id": u["id"],
        "user_email": u.get("email"),
        "user_name": u.get("full_name"),
        "subject": subject,
        "category": req.category,
        "category_label": CATEGORY_LABELS.get(req.category, "Autre"),
        "priority": req.priority,
        "status": "open",
        "estimated_response_hours": sla,
        "assigned_to": None,
        "messages": [{
            "id": f"msg-{uuid.uuid4().hex[:8]}",
            "author_id": u["id"],
            "author_name": u.get("full_name"),
            "author_role": "user",
            "content": message,
            "attachments": attachments,
            "created_at": now,
        }],
        "created_at": now,
        "updated_at": now,
        "resolved_at": None,
    }
    await _db.support_tickets.insert_one(ticket)
    ticket.pop("_id", None)
    return {
        "success": True,
        "ticket_number": ticket_number,
        "ticket_id": ticket["id"],
        "estimated_response_hours": sla,
        "message": f"Ticket {ticket_number} créé avec succès. Réponse estimée sous {sla}h.",
    }


@router.get("/tickets")
async def list_my_tickets(request: Request, status: Optional[str] = None):
    u = await _user_from_request(request)
    query = {"user_id": u["id"]}
    if status:
        query["status"] = status
    tickets = await _db.support_tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"tickets": tickets}


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, request: Request):
    u = await _user_from_request(request)
    ticket = await _db.support_tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(404, "Ticket introuvable")
    if ticket["user_id"] != u["id"] and u.get("role") != "admin":
        raise HTTPException(403, "Accès refusé")
    return ticket


@router.post("/tickets/{ticket_id}/messages")
async def add_message(ticket_id: str, req: MessageCreate, request: Request):
    """User or admin adds a message to a ticket. Rate-limited."""
    rate_limit(request, key="ticket-message", max_calls=20, window_sec=300)
    u = await _user_from_request(request)
    ticket = await _db.support_tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(404, "Ticket introuvable")
    is_owner = ticket["user_id"] == u["id"]
    is_admin = u.get("role") == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(403, "Accès refusé")
    if ticket.get("status") == "closed":
        raise HTTPException(400, "Ticket fermé — ouvrez-en un nouveau")

    message = sanitize_text(req.message, 5000)
    attachments = _process_attachments(req.attachments)
    now = datetime.now(timezone.utc).isoformat()
    new_msg = {
        "id": f"msg-{uuid.uuid4().hex[:8]}",
        "author_id": u["id"],
        "author_name": u.get("full_name"),
        "author_role": "admin" if is_admin else "user",
        "content": message,
        "attachments": attachments,
        "created_at": now,
    }
    update_fields = {"updated_at": now}
    if is_admin and ticket.get("status") == "open":
        update_fields["status"] = "in_progress"
    await _db.support_tickets.update_one(
        {"id": ticket_id},
        {"$push": {"messages": new_msg}, "$set": update_fields},
    )
    return {"success": True, "message": new_msg}


@router.post("/tickets/{ticket_id}/close")
async def close_ticket(ticket_id: str, request: Request):
    u = await _user_from_request(request)
    ticket = await _db.support_tickets.find_one({"id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(404, "Ticket introuvable")
    if ticket["user_id"] != u["id"] and u.get("role") != "admin":
        raise HTTPException(403, "Accès refusé")
    now = datetime.now(timezone.utc).isoformat()
    await _db.support_tickets.update_one(
        {"id": ticket_id},
        {"$set": {"status": "closed", "resolved_at": now, "updated_at": now}},
    )
    return {"success": True}


# === Admin endpoints ===
@router.get("/admin/tickets")
async def admin_list_tickets(request: Request, status: Optional[str] = None,
                              priority: Optional[str] = None, category: Optional[str] = None,
                              search: Optional[str] = None):
    u = await _user_from_request(request)
    if u.get("role") != "admin":
        raise HTTPException(403, "Réservé aux administrateurs")
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if category:
        query["category"] = category
    if search:
        # Sanitize search to avoid regex injection
        safe = sanitize_text(search, 100).replace("\\", "")
        query["$or"] = [
            {"subject": {"$regex": safe, "$options": "i"}},
            {"ticket_number": {"$regex": safe, "$options": "i"}},
            {"user_email": {"$regex": safe, "$options": "i"}},
        ]
    tickets = await _db.support_tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Stats
    stats = {
        "total": await _db.support_tickets.count_documents({}),
        "open": await _db.support_tickets.count_documents({"status": "open"}),
        "in_progress": await _db.support_tickets.count_documents({"status": "in_progress"}),
        "resolved": await _db.support_tickets.count_documents({"status": "resolved"}),
        "closed": await _db.support_tickets.count_documents({"status": "closed"}),
        "critical": await _db.support_tickets.count_documents({"priority": "critical", "status": {"$ne": "closed"}}),
    }
    return {"tickets": tickets, "stats": stats}


@router.post("/admin/tickets/{ticket_id}/status")
async def admin_set_status(ticket_id: str, request: Request, status: str):
    u = await _user_from_request(request)
    if u.get("role") != "admin":
        raise HTTPException(403, "Réservé aux administrateurs")
    if status not in ("open", "in_progress", "resolved", "closed"):
        raise HTTPException(400, "Statut invalide")
    update = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if status in ("resolved", "closed"):
        update["resolved_at"] = datetime.now(timezone.utc).isoformat()
    await _db.support_tickets.update_one({"id": ticket_id}, {"$set": update})
    return {"success": True}
