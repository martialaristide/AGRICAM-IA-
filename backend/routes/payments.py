"""
NetWalletPay Payment Integration for AGRICAM IA
Real Mobile Money payments (MTN MoMo, Orange Money, NetWallet Pay) - Cameroon
Documentation: https://docs.netwalletpay.com
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import hashlib
import httpx
import os
import uuid
import logging
import time

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])

# === NetWalletPay Configuration (from .env) ===
NWP_BASE = os.environ.get("NETWALLETPAY_BASE_URL", "https://netwalletpay.com")
NWP_PRIMARY = os.environ.get("NETWALLETPAY_PRIMARY_KEY", "")
NWP_SECONDARY = os.environ.get("NETWALLETPAY_SECONDARY_KEY", "")
NWP_MERCHANT_ID = os.environ.get("NETWALLETPAY_MERCHANT_ID", "")
NWP_EMAIL = os.environ.get("NETWALLETPAY_EMAIL", "")
NWP_USE_HASH = os.environ.get("NETWALLETPAY_USE_HASH", "false").lower() == "true"
PUBLIC_BACKEND_URL = os.environ.get("PUBLIC_BACKEND_URL", "")  # set this for webhook callback

# Token cache (15 min expiry)
_token_cache = {"token": None, "expires_at": 0}

_db = None
_get_current_user = None

def init_db(database, auth_dep):
    global _db, _get_current_user
    _db = database
    _get_current_user = auth_dep

# === Models ===
class PaymentRequest(BaseModel):
    phone_number: str
    method: str = "MOBILE_MONEY"   # MOBILE_MONEY | NETWALLET_PAY
    method_type: str = "MOMO"       # MOMO | ORANGE_MONEY | EU
    provider: str = "mtn_cm"        # mtn_cm | orange_cm | netwallet_cm | eu_cm
    package_id: str = "basic_monthly"
    description: Optional[str] = None

class SubscriptionActivate(BaseModel):
    transaction_id: str
    package_id: str

PACKAGES = {
    "basic_monthly":     {"amount": 5000,   "days": 30,  "type": "basic",   "label": "Basic Mensuel"},
    "basic_quarterly":   {"amount": 12000,  "days": 90,  "type": "basic",   "label": "Basic Trimestriel"},
    "basic_annual":      {"amount": 40000,  "days": 365, "type": "basic",   "label": "Basic Annuel"},
    "premium_monthly":   {"amount": 15000,  "days": 30,  "type": "premium", "label": "Premium Mensuel"},
    "premium_quarterly": {"amount": 35000,  "days": 90,  "type": "premium", "label": "Premium Trimestriel"},
    "premium_annual":    {"amount": 120000, "days": 365, "type": "premium", "label": "Premium Annuel"},
}

# === Hash helper (SHA-256) ===
def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def compute_payment_hash(service: str, method: str, method_provider: str, order_id: str) -> str:
    """Format: {service}_{method}_{method_provider}_{order_id}_{secondary_key}"""
    raw = f"{service}_{method}_{method_provider}_{order_id}_{NWP_SECONDARY}"
    return sha256_hex(raw)

def compute_webhook_hash(order_id: str) -> str:
    """Format: {order_id}_{secondary_key}"""
    return sha256_hex(f"{order_id}_{NWP_SECONDARY}")

# === NetWalletPay Token Management (cached 15 min) ===
async def get_nwp_token() -> Optional[str]:
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 30:
        return _token_cache["token"]
    if not NWP_PRIMARY or not NWP_EMAIL:
        logger.error("NetWalletPay credentials not configured")
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{NWP_BASE}/api/v1/token",
                data={
                    "primary_key": NWP_PRIMARY,
                    "Email": NWP_EMAIL,
                    "grant_type": "primary_key",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if resp.status_code == 200:
                data = resp.json()
                token = data.get("access_token")
                expires_in = int(data.get("expires_in", 900))
                _token_cache["token"] = token
                _token_cache["expires_at"] = now + expires_in
                return token
            logger.error(f"NetWalletPay token error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"NetWalletPay token exception: {e}")
    return None

# === Subscription helpers ===
def _compute_sub_status(u: dict) -> dict:
    now = datetime.now(timezone.utc)
    trial_end = u.get("trial_end")
    sub_end = u.get("subscription_end")
    sub_type = u.get("subscription_type", "freemium")
    is_trial_active = False
    is_subscribed = False
    days_remaining = 0
    if trial_end:
        try:
            t = datetime.fromisoformat(str(trial_end).replace("Z", "+00:00"))
            if now < t:
                is_trial_active = True
                days_remaining = (t - now).days
        except Exception:
            pass
    if sub_end:
        try:
            s = datetime.fromisoformat(str(sub_end).replace("Z", "+00:00"))
            if now < s and sub_type in ("basic", "premium"):
                is_subscribed = True
                days_remaining = max(days_remaining, (s - now).days)
        except Exception:
            pass
    has_access = is_trial_active or is_subscribed or u.get("role") == "admin"
    return {
        "subscription_type": sub_type,
        "is_trial_active": is_trial_active,
        "is_subscribed": is_subscribed,
        "has_full_access": has_access,
        "days_remaining": days_remaining,
        "trial_end": trial_end,
        "subscription_end": sub_end,
    }

async def _get_user_from_request(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip() if auth else ""
    if not token:
        raise HTTPException(401, "Non authentifié")
    import jwt as pyjwt
    try:
        payload = pyjwt.decode(
            token,
            os.environ.get("JWT_SECRET_KEY", "agricam-secret-key-prod-2025"),
            algorithms=["HS256"],
        )
        user = await _db.users.find_one(
            {"id": payload.get("user_id")},
            {"_id": 0, "password_hash": 0},
        )
    except Exception:
        raise HTTPException(401, "Token invalide")
    if not user:
        raise HTTPException(401, "Utilisateur non trouvé")
    return user

async def activate_subscription(user_id: str, package_id: str):
    pkg = PACKAGES.get(package_id)
    if not pkg:
        return
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=pkg["days"])
    await _db.users.update_one(
        {"id": user_id},
        {"$set": {
            "subscription_type": pkg["type"],
            "subscription_end": end.isoformat(),
            "subscription_activated_at": now.isoformat(),
            "ai_tokens_unlimited": True,
            "ai_token_balance": 999999,
        }},
    )
    logger.info(f"Subscription activated: user={user_id} type={pkg['type']} until={end}")

# === Routes ===
@router.get("/packages")
async def get_packages():
    return {"packages": [{"id": k, **v, "currency": "XAF"} for k, v in PACKAGES.items()]}

@router.get("/subscription-status")
async def subscription_status(request: Request):
    u = await _get_user_from_request(request)
    return _compute_sub_status(u)

@router.get("/providers")
async def get_providers(country_code: str = "CM", payment_type: str = "collection", method: str = "MOBILE_MONEY"):
    """Fetch providers dynamically from NetWalletPay."""
    token = await get_nwp_token()
    fallback = [
        {"id": "mtn_cm", "name": "MTN Mobile Money", "transactionCurrency": "XAF"},
        {"id": "orange_cm", "name": "Orange Mobile Money", "transactionCurrency": "XAF"},
        {"id": "netwallet_cm", "name": "Netwallet Pay", "transactionCurrency": "XAF"},
    ]
    if not token:
        return {"providers": fallback, "source": "fallback"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{NWP_BASE}/api/v1/lookup/get-providers/{payment_type}/{method}/{country_code}",
                headers={"Authorization": f"Bearer {token}"},
            )
            if resp.status_code == 200:
                return {"providers": resp.json().get("data", []), "source": "live"}
            logger.warning(f"Providers fetch {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.error(f"Providers fetch error: {e}")
    return {"providers": fallback, "source": "fallback"}

@router.get("/countries")
async def get_countries():
    """Fetch supported countries from NetWalletPay."""
    token = await get_nwp_token()
    if not token:
        return {"countries": [{"code": "CM", "name": "Cameroon", "currency": "XAF"}], "source": "fallback"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{NWP_BASE}/api/v1/lookup/get-support-country",
                headers={"Authorization": f"Bearer {token}"},
            )
            if resp.status_code == 200:
                raw = resp.json().get("data", [])
                countries = [{
                    "code": c.get("code") or c.get("countryCode"),
                    "name": (c.get("name") or {}).get("common") if isinstance(c.get("name"), dict) else c.get("countryName"),
                    "currency": (c.get("currency") or {}).get("code") if isinstance(c.get("currency"), dict) else c.get("currencyCode"),
                    "flag": (c.get("flags") or {}).get("png") if isinstance(c.get("flags"), dict) else c.get("countryFlag"),
                } for c in raw]
                return {"countries": countries, "source": "live"}
    except Exception as e:
        logger.error(f"Countries fetch error: {e}")
    return {"countries": [{"code": "CM", "name": "Cameroon", "currency": "XAF"}], "source": "fallback"}

@router.post("/request-payment")
async def request_payment(req: PaymentRequest, request: Request):
    """Initiate Mobile Money payment via NetWalletPay."""
    u = await _get_user_from_request(request)
    pkg = PACKAGES.get(req.package_id)
    if not pkg:
        raise HTTPException(400, "Package invalide")

    # Validate phone (must include country code 237 for Cameroon)
    phone = req.phone_number.strip().replace(" ", "").replace("+", "")
    if phone.startswith("00237"):
        phone = phone[2:]
    elif not phone.startswith("237") and len(phone) == 9:
        phone = "237" + phone
    if not (phone.startswith("237") and len(phone) == 12):
        raise HTTPException(400, "Numéro de téléphone invalide. Format attendu: 237XXXXXXXXX")

    order_id = f"AGRICAM{uuid.uuid4().hex[:12].upper()}"
    description = req.description or f"AGRICAM IA - {pkg['label']}"

    # Store payment record
    payment_doc = {
        "id": order_id,
        "order_id": order_id,
        "user_id": u["id"],
        "user_email": u.get("email"),
        "amount": pkg["amount"],
        "currency": "XAF",
        "phone": phone,
        "method": req.method,
        "method_type": req.method_type,
        "provider": req.provider,
        "package_id": req.package_id,
        "status": "pending",
        "transaction_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await _db.payments.insert_one(payment_doc)

    # Get NetWalletPay token
    token = await get_nwp_token()
    if not token:
        raise HTTPException(503, "Service de paiement indisponible. Réessayez dans quelques instants.")

    # Build payload
    callback_url = f"{PUBLIC_BACKEND_URL}/api/webhook/netwalletpay" if PUBLIC_BACKEND_URL else None
    payload: Dict[str, Any] = {
        "CurrencyCode": "XAF",
        "OrderID": order_id,
        "Amount": pkg["amount"],
        "Method": req.method,
        "MethodType": req.method_type,
        "CountryCode": "CM",
        "MethodProvider": req.provider,
        "PhoneNumber": phone,
        "Description": description,
    }
    if callback_url:
        payload["CallbackUrl"] = callback_url
    if NWP_USE_HASH:
        payload["Hash"] = compute_payment_hash("RECOUVREMENT", req.method, req.provider, order_id)

    # Call NetWalletPay
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{NWP_BASE}/api/v1/global/collection/request-payment",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
            if resp.status_code == 200 and data.get("statusCode") == 200:
                tx_id = data.get("data") or data.get("transactionId") or order_id
                await _db.payments.update_one(
                    {"id": order_id},
                    {"$set": {"transaction_id": tx_id, "status": "processing", "nwp_response": data}},
                )
                return {
                    "success": True,
                    "order_id": order_id,
                    "transaction_id": tx_id,
                    "amount": pkg["amount"],
                    "currency": "XAF",
                    "message": "Paiement initié. Validez la transaction sur votre téléphone.",
                }
            # Error from NetWalletPay
            err_msg = data.get("message", resp.text[:300]) if data else resp.text[:300]
            err_code = data.get("errorCode") if data else None
            logger.error(f"NWP payment failed [{resp.status_code}/{err_code}]: {err_msg} | payload={payload}")
            await _db.payments.update_one(
                {"id": order_id},
                {"$set": {"status": "failed", "error": err_msg, "error_code": err_code}},
            )
            raise HTTPException(400, f"Échec paiement: {err_msg}")
    except httpx.RequestError as e:
        logger.error(f"NWP network error: {e}")
        await _db.payments.update_one({"id": order_id}, {"$set": {"status": "failed", "error": str(e)}})
        raise HTTPException(503, "Erreur réseau. Réessayez plus tard.")

@router.get("/check-status/{order_id}")
async def check_payment_status(order_id: str, request: Request):
    u = await _get_user_from_request(request)
    payment = await _db.payments.find_one({"id": order_id, "user_id": u["id"]}, {"_id": 0})
    if not payment:
        raise HTTPException(404, "Paiement non trouvé")

    # If already terminal, return as-is
    if payment["status"] in ("success", "failed"):
        return {"status": payment["status"], "order_id": order_id, "amount": payment["amount"]}

    tx_id = payment.get("transaction_id")
    if not tx_id:
        return {"status": payment["status"], "order_id": order_id, "amount": payment["amount"]}

    token = await get_nwp_token()
    if not token:
        return {"status": payment["status"], "order_id": order_id, "amount": payment["amount"]}

    # Try NetWalletPay status endpoint
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{NWP_BASE}/api/v1/global/transaction-status/{tx_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                raw_status = (data.get("status") or "").upper()
                if raw_status in ("SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"):
                    new_status = "success"
                elif raw_status in ("FAILED", "CANCELLED", "REJECTED", "EXPIRED"):
                    new_status = "failed"
                else:
                    new_status = "processing"
                await _db.payments.update_one({"id": order_id}, {"$set": {"status": new_status}})
                if new_status == "success":
                    await activate_subscription(u["id"], payment.get("package_id", "basic_monthly"))
                return {"status": new_status, "order_id": order_id, "amount": payment["amount"]}
    except Exception as e:
        logger.error(f"Status check error: {e}")

    return {"status": payment["status"], "order_id": order_id, "amount": payment["amount"]}

@router.post("/activate-subscription")
async def manual_activate(data: SubscriptionActivate, request: Request):
    u = await _get_user_from_request(request)
    payment = await _db.payments.find_one(
        {"transaction_id": data.transaction_id, "user_id": u["id"]},
        {"_id": 0},
    )
    if not payment or payment["status"] != "success":
        raise HTTPException(400, "Paiement non valide ou non confirmé")
    await activate_subscription(u["id"], data.package_id)
    return {"success": True, "message": "Abonnement activé avec succès"}

@router.get("/history")
async def payment_history(request: Request):
    u = await _get_user_from_request(request)
    payments = await _db.payments.find(
        {"user_id": u["id"]}, {"_id": 0, "nwp_response": 0}
    ).sort("created_at", -1).to_list(50)
    return {"payments": payments}

# === Webhook (called by NetWalletPay on transaction status change) ===
@router.post("/webhook/netwalletpay", include_in_schema=False)
async def netwalletpay_webhook_legacy(request: Request):
    return await _handle_webhook(request)

# Also expose at /api/webhook/netwalletpay for cleaner path
webhook_router = APIRouter()

@webhook_router.post("/api/webhook/netwalletpay")
async def netwalletpay_webhook(request: Request):
    return await _handle_webhook(request)

async def _handle_webhook(request: Request):
    """Handle NetWalletPay async transaction notifications."""
    try:
        body = await request.json()
        callback_token = request.headers.get("X-CallbackToken", "")
        order_id = body.get("OrderID") or body.get("orderId")
        status = (body.get("Status") or body.get("status") or "").upper()
        logger.info(f"NWP webhook: order={order_id} status={status} token={callback_token[:20]}...")

        if not order_id:
            return {"received": True}

        # Verify hash if enabled
        if NWP_USE_HASH:
            expected_hash = compute_webhook_hash(order_id)
            received_hash = body.get("Hash") or callback_token
            if received_hash != expected_hash:
                logger.warning(f"Webhook hash mismatch for {order_id}")
                return {"received": False, "error": "Invalid hash"}

        payment = await _db.payments.find_one({"id": order_id}, {"_id": 0})
        if not payment:
            logger.warning(f"Webhook for unknown order: {order_id}")
            return {"received": True}

        if status in ("SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"):
            await _db.payments.update_one({"id": order_id}, {"$set": {"status": "success", "webhook_at": datetime.now(timezone.utc).isoformat()}})
            await activate_subscription(payment["user_id"], payment.get("package_id", "basic_monthly"))
        elif status in ("FAILED", "CANCELLED", "REJECTED", "EXPIRED"):
            await _db.payments.update_one({"id": order_id}, {"$set": {"status": "failed", "webhook_at": datetime.now(timezone.utc).isoformat()}})
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}
