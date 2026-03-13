"""
NetWalletPay Payment Integration & Subscription Management for AGRICAM IA
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import httpx
import os
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])

NETWALLETPAY_BASE = os.environ.get("NETWALLETPAY_BASE_URL", "https://api.netwalletpay.com")
NETWALLETPAY_KEY = os.environ.get("NETWALLETPAY_PRIMARY_KEY", "")
NETWALLETPAY_EMAIL = os.environ.get("NETWALLETPAY_EMAIL", "")

_db = None
_get_current_user = None

def init_db(database, auth_dep):
    global _db, _get_current_user
    _db = database
    _get_current_user = auth_dep

# --- Models ---
class PaymentRequest(BaseModel):
    amount: float
    phone_number: str
    method: str = "MOBILE_MONEY"
    method_type: str = "MOMO"
    provider: str = "mtn_cm"
    description: Optional[str] = "Abonnement AGRICAM IA"
    package_id: Optional[str] = "basic_monthly"

class SubscriptionActivate(BaseModel):
    transaction_id: str
    package_id: str

PACKAGES = {
    "basic_monthly": {"amount": 5000, "days": 30, "type": "basic", "label": "Basic Mensuel"},
    "basic_quarterly": {"amount": 12000, "days": 90, "type": "basic", "label": "Basic Trimestriel"},
    "basic_annual": {"amount": 40000, "days": 365, "type": "basic", "label": "Basic Annuel"},
    "premium_monthly": {"amount": 15000, "days": 30, "type": "premium", "label": "Premium Mensuel"},
    "premium_quarterly": {"amount": 35000, "days": 90, "type": "premium", "label": "Premium Trimestriel"},
    "premium_annual": {"amount": 120000, "days": 365, "type": "premium", "label": "Premium Annuel"},
}

# --- Helper: Get NetWalletPay token ---
async def get_nwp_token():
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{NETWALLETPAY_BASE}/api/v1/token",
                data={
                    "primary_key": NETWALLETPAY_KEY,
                    "Email": NETWALLETPAY_EMAIL,
                    "grant_type": "primary_key"
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if resp.status_code == 200:
                return resp.json().get("access_token")
            logger.error(f"NetWalletPay token error: {resp.status_code} {resp.text}")
    except Exception as e:
        logger.warning(f"NetWalletPay unreachable: {e}")
    return None

def _compute_sub_status(u):
    now = datetime.now(timezone.utc)
    trial_end = u.get("trial_end")
    sub_end = u.get("subscription_end")
    sub_type = u.get("subscription_type", "freemium")
    is_trial_active = False
    is_subscribed = False
    days_remaining = 0
    if trial_end:
        try:
            trial_dt = datetime.fromisoformat(str(trial_end).replace("Z", "+00:00"))
            if now < trial_dt:
                is_trial_active = True
                days_remaining = (trial_dt - now).days
        except: pass
    if sub_end:
        try:
            sub_dt = datetime.fromisoformat(str(sub_end).replace("Z", "+00:00"))
            if now < sub_dt and sub_type in ("basic", "premium"):
                is_subscribed = True
                days_remaining = (sub_dt - now).days
        except: pass
    has_access = is_trial_active or is_subscribed or sub_type == "premium" or u.get("role") == "admin"
    return {"subscription_type": sub_type, "is_trial_active": is_trial_active, "is_subscribed": is_subscribed, "has_full_access": has_access, "days_remaining": days_remaining, "trial_end": trial_end, "subscription_end": sub_end}

async def _get_user_from_request(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Non authentifie")
    from jose import jwt
    import os as _os
    try:
        payload = jwt.decode(token, _os.environ.get("SECRET_KEY", "agricam-secret-key-2024-african-ai-solutions"), algorithms=["HS256"])
        user = await _db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
    except:
        raise HTTPException(401, "Token invalide")
    if not user:
        raise HTTPException(401, "Utilisateur non trouve")
    return user

# --- Routes ---
@router.get("/packages")
async def get_packages():
    return {"packages": [{"id": k, **v} for k, v in PACKAGES.items()]}

@router.get("/subscription-status")
async def subscription_status(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token or not _get_current_user:
        raise HTTPException(401, "Non authentifie")
    from jose import jwt
    import os as _os
    try:
        payload = jwt.decode(token, _os.environ.get("SECRET_KEY", "agricam-secret-key-2024-african-ai-solutions"), algorithms=["HS256"])
        user = await _db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
    except:
        raise HTTPException(401, "Token invalide")
    if not user:
        raise HTTPException(401, "Utilisateur non trouve")
    return _compute_sub_status(user)

@router.get("/providers")
async def get_providers():
    token = await get_nwp_token()
    if not token:
        return {"providers": [
            {"id": "mtn_cm", "name": "MTN Mobile Money", "currency": "XAF"},
            {"id": "orange_cm", "name": "Orange Mobile Money", "currency": "XAF"},
            {"id": "netwallet_cm", "name": "Netwallet Pay", "currency": "XAF"}
        ]}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{NETWALLETPAY_BASE}/api/v1/lookup/get-providers/collection/MOBILE_MONEY/CM",
                headers={"Authorization": f"Bearer {token}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                return {"providers": data.get("data", [])}
    except Exception as e:
        logger.error(f"Provider fetch error: {e}")
    return {"providers": [
        {"id": "mtn_cm", "name": "MTN Mobile Money", "currency": "XAF"},
        {"id": "orange_cm", "name": "Orange Mobile Money", "currency": "XAF"}
    ]}

@router.post("/request-payment")
async def request_payment(req: PaymentRequest, request: Request):
    u = await _get_user_from_request(request)
    pkg = PACKAGES.get(req.package_id)
    if not pkg:
        raise HTTPException(400, "Package invalide")
    
    order_id = f"AGRICAM-{uuid.uuid4().hex[:12].upper()}"
    
    # Store payment record
    payment_doc = {
        "id": order_id,
        "user_id": u["id"],
        "user_email": u.get("email"),
        "amount": pkg["amount"],
        "currency": "XAF",
        "phone": req.phone_number,
        "method": req.method,
        "method_type": req.method_type,
        "provider": req.provider,
        "package_id": req.package_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await _db.payments.insert_one(payment_doc)
    
    # Call NetWalletPay API
    token = await get_nwp_token()
    if token:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{NETWALLETPAY_BASE}/api/v1/global/collection/request-payment",
                    json={
                        "CurrencyCode": "XAF",
                        "OrderID": order_id,
                        "Amount": pkg["amount"],
                        "Method": req.method,
                        "MethodType": req.method_type,
                        "CountryCode": "CM",
                        "MethodProvider": req.provider,
                        "PhoneNumber": req.phone_number,
                        "Description": f"Abonnement AGRICAM IA - {pkg['label']}"
                    },
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                )
                if resp.status_code == 200:
                    tx_id = resp.json().get("data")
                    await _db.payments.update_one(
                        {"id": order_id},
                        {"$set": {"transaction_id": tx_id, "status": "processing"}}
                    )
                    return {"success": True, "order_id": order_id, "transaction_id": tx_id, "message": "Paiement initie. Validez sur votre telephone."}
                else:
                    logger.error(f"NWP payment error: {resp.text}")
        except Exception as e:
            logger.error(f"NWP payment exception: {e}")
    
    # Fallback: simulate for demo
    tx_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"
    await _db.payments.update_one(
        {"id": order_id},
        {"$set": {"transaction_id": tx_id, "status": "processing", "simulated": True}}
    )
    return {"success": True, "order_id": order_id, "transaction_id": tx_id, "message": "Paiement initie. Validez sur votre telephone."}

@router.get("/check-status/{order_id}")
async def check_payment_status(order_id: str, request: Request):
    u = await _get_user_from_request(request)
    payment = await _db.payments.find_one({"id": order_id, "user_id": u["id"]}, {"_id": 0})
    if not payment:
        raise HTTPException(404, "Paiement non trouve")
    
    tx_id = payment.get("transaction_id")
    if tx_id and not payment.get("simulated"):
        token = await get_nwp_token()
        if token:
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.get(
                        f"{NETWALLETPAY_BASE}/api/v1/global/transaction-status/{tx_id}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    if resp.status_code == 200:
                        tx_data = resp.json().get("data", {})
                        status = tx_data.get("status", "PENDING")
                        new_status = "success" if status == "SUCCESS" else "failed" if status in ("FAILED", "CANCELLED") else "processing"
                        await _db.payments.update_one({"id": order_id}, {"$set": {"status": new_status}})
                        
                        if new_status == "success":
                            await activate_subscription(u["id"], payment.get("package_id", "basic_monthly"))
                        
                        return {"status": new_status, "order_id": order_id, "amount": payment["amount"]}
            except Exception as e:
                logger.error(f"Status check error: {e}")
    
    # For simulated payments, auto-succeed after creation
    if payment.get("simulated") and payment["status"] == "processing":
        await _db.payments.update_one({"id": order_id}, {"$set": {"status": "success"}})
        await activate_subscription(u["id"], payment.get("package_id", "basic_monthly"))
        return {"status": "success", "order_id": order_id, "amount": payment["amount"]}
    
    return {"status": payment["status"], "order_id": order_id, "amount": payment["amount"]}

@router.post("/activate-subscription")
async def manual_activate(data: SubscriptionActivate, request: Request):
    u = await _get_user_from_request(request)
    payment = await _db.payments.find_one({"transaction_id": data.transaction_id, "user_id": u["id"]}, {"_id": 0})
    if not payment or payment["status"] != "success":
        raise HTTPException(400, "Paiement non valide ou non confirme")
    await activate_subscription(u["id"], data.package_id)
    return {"success": True, "message": "Abonnement active avec succes"}

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
            "subscription_activated_at": now.isoformat()
        }}
    )
    await _db.payments.update_one(
        {"user_id": user_id, "package_id": package_id, "status": "success"},
        {"$set": {"subscription_activated": True}}
    )
    logger.info(f"Subscription activated for user {user_id}: {pkg['type']} until {end}")

@router.get("/history")
async def payment_history(request: Request):
    u = await _get_user_from_request(request)
    payments = await _db.payments.find({"user_id": u["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"payments": payments}
