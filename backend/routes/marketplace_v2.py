"""
Marketplace V2 — secure purchase flow with confirmation popup + NetWalletPay.
Coexists with existing /api/marketplace endpoints (additive only).
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid
import logging
import os
import jwt as pyjwt

from security_helpers import rate_limit, check_replay, sanitize_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/marketplace-v2", tags=["marketplace-v2"])

_db = None

def init_db(database, auth_dep):
    global _db
    _db = database


# === Models ===
class PurchaseInitiate(BaseModel):
    product_id: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., ge=1, le=1000)
    nonce: str = Field(..., min_length=8, max_length=64)  # client-generated, anti-replay
    phone_number: Optional[str] = None  # for Mobile Money


class PurchaseConfirm(BaseModel):
    order_id: str = Field(..., min_length=1, max_length=100)
    confirmed: bool


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


# === Routes ===
@router.post("/purchase/initiate")
async def initiate_purchase(req: PurchaseInitiate, request: Request):
    """Step 1 — User clicks 'Buy'. Server validates product, computes total, returns confirmation payload.
    NO payment is started yet. The user must call /confirm to proceed.
    """
    rate_limit(request, key="purchase-initiate", max_calls=20, window_sec=300)
    check_replay(req.nonce, ttl_sec=300)
    u = await _user_from_request(request)

    # Look up product (try both marketplace_products and products collections)
    product = await _db.marketplace_products.find_one({"id": req.product_id}, {"_id": 0})
    if not product:
        product = await _db.products.find_one({"id": req.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Produit introuvable")

    unit_price = float(product.get("price", 0) or product.get("unit_price", 0))
    if unit_price <= 0:
        raise HTTPException(400, "Prix produit invalide")

    total = unit_price * req.quantity

    # Create a PENDING order — needs explicit confirmation to proceed to payment
    order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"
    order = {
        "id": order_id,
        "buyer_id": u["id"],
        "buyer_name": u.get("full_name"),
        "buyer_email": u.get("email"),
        "seller_id": product.get("seller_id") or product.get("user_id"),
        "seller_name": product.get("seller_name") or product.get("supplier_name"),
        "product_id": req.product_id,
        "product_name": product.get("name") or product.get("product_name"),
        "product_image": product.get("image") or product.get("image_url"),
        "unit_price": unit_price,
        "quantity": req.quantity,
        "total_amount": total,
        "currency": product.get("currency", "XAF"),
        "status": "awaiting_confirmation",
        "phone_number": req.phone_number,
        "nonce": req.nonce,
        "payment_method": "netwallet_pay",
        "payment_reference": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.marketplace_orders.insert_one(order)
    order.pop("_id", None)

    return {
        "success": True,
        "order_id": order_id,
        "confirmation_required": True,
        "summary": {
            "product_name": order["product_name"],
            "product_image": order["product_image"],
            "unit_price": unit_price,
            "quantity": req.quantity,
            "total_amount": total,
            "currency": order["currency"],
            "seller_name": order["seller_name"],
            "payment_method": "NetWallet Pay (MTN MoMo / Orange Money)",
        },
        "next_step": "Appelez POST /api/marketplace-v2/purchase/confirm avec order_id et confirmed=true pour démarrer le paiement.",
    }


@router.post("/purchase/confirm")
async def confirm_purchase(req: PurchaseConfirm, request: Request):
    """Step 2 — User confirms in the popup. Triggers NetWalletPay payment flow."""
    rate_limit(request, key="purchase-confirm", max_calls=10, window_sec=300)
    u = await _user_from_request(request)

    order = await _db.marketplace_orders.find_one({"id": req.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Commande introuvable")
    if order["buyer_id"] != u["id"]:
        raise HTTPException(403, "Cette commande ne vous appartient pas")
    if order["status"] != "awaiting_confirmation":
        raise HTTPException(400, f"Commande dans un état non confirmable: {order['status']}")

    if not req.confirmed:
        await _db.marketplace_orders.update_one(
            {"id": req.order_id},
            {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}},
        )
        return {"success": True, "status": "cancelled", "message": "Achat annulé"}

    # Move to pending payment
    await _db.marketplace_orders.update_one(
        {"id": req.order_id},
        {"$set": {"status": "pending_payment", "confirmed_at": datetime.now(timezone.utc).isoformat()}},
    )

    # Note: actual payment initiation is delegated to /api/payments/request-payment
    # Frontend should now call that endpoint with the order details.
    return {
        "success": True,
        "status": "pending_payment",
        "order_id": req.order_id,
        "amount_xaf": order["total_amount"],
        "phone_number": order.get("phone_number"),
        "next_step": "Frontend appelle POST /api/payments/request-payment avec ce montant et phone_number pour finaliser.",
    }


@router.post("/orders/{order_id}/mark-paid")
async def mark_order_paid(order_id: str, request: Request, payment_reference: str):
    """Called after NetWalletPay confirms payment (via webhook or status check)."""
    u = await _user_from_request(request)
    order = await _db.marketplace_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Commande introuvable")
    if order["buyer_id"] != u["id"] and u.get("role") != "admin":
        raise HTTPException(403, "Accès refusé")

    # Verify the payment exists and is successful
    payment = await _db.payments.find_one({"id": payment_reference, "user_id": order["buyer_id"]}, {"_id": 0})
    if not payment or payment.get("status") != "success":
        raise HTTPException(400, "Paiement non confirmé")

    await _db.marketplace_orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": "paid",
            "payment_reference": payment_reference,
            "paid_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    return {"success": True, "status": "paid"}


@router.get("/orders")
async def my_orders(request: Request, status: Optional[str] = None):
    u = await _user_from_request(request)
    query = {"buyer_id": u["id"]}
    if status:
        query["status"] = status
    orders = await _db.marketplace_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"orders": orders}


@router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    u = await _user_from_request(request)
    order = await _db.marketplace_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Commande introuvable")
    if order["buyer_id"] != u["id"] and u.get("role") != "admin":
        raise HTTPException(403, "Accès refusé")
    return order
