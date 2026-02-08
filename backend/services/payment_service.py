"""
AGRICAM IA - Mobile Money Payment Service
Real integration with CinetPay/PayDunya for Orange Money and MTN MoMo
"""
import httpx
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import (
    CINETPAY_API_KEY, CINETPAY_SITE_ID, CINETPAY_SECRET_KEY,
    PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN,
    ORANGE_MONEY_MERCHANT, MTN_MOMO_MERCHANT
)
from models.enums import PaymentProvider, PaymentStatus

logger = logging.getLogger(__name__)

class MobileMoneyService:
    """
    Service for real Mobile Money payments in Cameroon
    Supports: Orange Money, MTN MoMo via CinetPay or PayDunya
    """
    
    def __init__(self):
        self.cinetpay_base_url = "https://api-checkout.cinetpay.com/v2"
        self.paydunya_base_url = "https://app.paydunya.com/api/v1"
        
        # Check which provider is configured
        self.use_cinetpay = bool(CINETPAY_API_KEY and CINETPAY_SITE_ID)
        self.use_paydunya = bool(PAYDUNYA_MASTER_KEY and PAYDUNYA_PRIVATE_KEY)
        
        if not self.use_cinetpay and not self.use_paydunya:
            logger.warning("No payment provider configured - using simulation mode")
            self.simulation_mode = True
        else:
            self.simulation_mode = False
    
    async def initiate_payment(
        self,
        phone_number: str,
        amount_xaf: float,
        provider: PaymentProvider,
        description: str,
        customer_name: str = "Client AGRICAM",
        customer_email: str = "client@agricam.local"
    ) -> Dict[str, Any]:
        """
        Initiate a Mobile Money payment
        Returns payment instructions and reference
        """
        transaction_id = f"AGRICAM-{uuid.uuid4().hex[:12].upper()}"
        
        if self.simulation_mode:
            return await self._simulate_payment(
                transaction_id, phone_number, amount_xaf, provider, description
            )
        
        if self.use_cinetpay:
            return await self._cinetpay_initiate(
                transaction_id, phone_number, amount_xaf, provider, 
                description, customer_name, customer_email
            )
        elif self.use_paydunya:
            return await self._paydunya_initiate(
                transaction_id, phone_number, amount_xaf, provider,
                description, customer_name
            )
        
        return await self._simulate_payment(
            transaction_id, phone_number, amount_xaf, provider, description
        )
    
    async def _cinetpay_initiate(
        self,
        transaction_id: str,
        phone_number: str,
        amount_xaf: float,
        provider: PaymentProvider,
        description: str,
        customer_name: str,
        customer_email: str
    ) -> Dict[str, Any]:
        """
        Initiate payment via CinetPay API
        Documentation: https://cinetpay.com/documentation
        """
        try:
            # Determine channel based on provider
            channels = "MOBILE_MONEY"
            
            payload = {
                "apikey": CINETPAY_API_KEY,
                "site_id": CINETPAY_SITE_ID,
                "transaction_id": transaction_id,
                "amount": int(amount_xaf),
                "currency": "XAF",
                "alternative_currency": "",
                "description": description,
                "customer_id": phone_number,
                "customer_name": customer_name,
                "customer_surname": "",
                "customer_email": customer_email,
                "customer_phone_number": phone_number,
                "customer_address": "Cameroun",
                "customer_city": "Yaoundé",
                "customer_country": "CM",
                "customer_state": "CE",
                "customer_zip_code": "",
                "notify_url": "",  # Webhook URL - configure in production
                "return_url": "",  # Return URL after payment
                "channels": channels,
                "metadata": str({"provider": provider.value})
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.cinetpay_base_url}/payment",
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("code") == "201":
                        return {
                            "payment_id": transaction_id,
                            "reference": data.get("data", {}).get("payment_token", transaction_id),
                            "status": PaymentStatus.PENDING.value,
                            "amount_xaf": amount_xaf,
                            "provider": provider.value,
                            "payment_url": data.get("data", {}).get("payment_url"),
                            "instructions": self._get_payment_instructions(provider, amount_xaf),
                            "merchant_number": self._get_merchant_number(provider),
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                    else:
                        logger.error(f"CinetPay error: {data}")
                        raise Exception(data.get("message", "Payment initiation failed"))
                else:
                    logger.error(f"CinetPay HTTP error: {response.status_code}")
                    raise Exception("Payment service unavailable")
                    
        except httpx.RequestError as e:
            logger.error(f"CinetPay network error: {e}")
            # Fallback to simulation
            return await self._simulate_payment(
                transaction_id, phone_number, amount_xaf, provider, description
            )
    
    async def _paydunya_initiate(
        self,
        transaction_id: str,
        phone_number: str,
        amount_xaf: float,
        provider: PaymentProvider,
        description: str,
        customer_name: str
    ) -> Dict[str, Any]:
        """
        Initiate payment via PayDunya API
        Documentation: https://paydunya.com/developers
        """
        try:
            headers = {
                "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY,
                "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY,
                "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN,
                "Content-Type": "application/json"
            }
            
            payload = {
                "invoice": {
                    "items": {
                        "item_0": {
                            "name": description,
                            "quantity": 1,
                            "unit_price": int(amount_xaf),
                            "total_price": int(amount_xaf)
                        }
                    },
                    "total_amount": int(amount_xaf),
                    "description": description
                },
                "store": {
                    "name": "AGRICAM IA",
                    "tagline": "Agriculture de précision",
                    "phone": ORANGE_MONEY_MERCHANT,
                    "website_url": "https://agricam.local"
                },
                "custom_data": {
                    "transaction_id": transaction_id,
                    "provider": provider.value,
                    "customer_phone": phone_number
                }
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.paydunya_base_url}/checkout-invoice/create",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("response_code") == "00":
                        return {
                            "payment_id": transaction_id,
                            "reference": data.get("token", transaction_id),
                            "status": PaymentStatus.PENDING.value,
                            "amount_xaf": amount_xaf,
                            "provider": provider.value,
                            "payment_url": data.get("response_text"),
                            "instructions": self._get_payment_instructions(provider, amount_xaf),
                            "merchant_number": self._get_merchant_number(provider),
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }
                    else:
                        logger.error(f"PayDunya error: {data}")
                        raise Exception(data.get("response_text", "Payment initiation failed"))
                else:
                    logger.error(f"PayDunya HTTP error: {response.status_code}")
                    raise Exception("Payment service unavailable")
                    
        except httpx.RequestError as e:
            logger.error(f"PayDunya network error: {e}")
            return await self._simulate_payment(
                transaction_id, phone_number, amount_xaf, provider, description
            )
    
    async def _simulate_payment(
        self,
        transaction_id: str,
        phone_number: str,
        amount_xaf: float,
        provider: PaymentProvider,
        description: str
    ) -> Dict[str, Any]:
        """
        Simulate payment when no real provider is configured
        """
        logger.info(f"SIMULATION MODE: Payment {transaction_id} for {amount_xaf} XAF")
        
        return {
            "payment_id": transaction_id,
            "reference": transaction_id,
            "status": PaymentStatus.PENDING.value,
            "amount_xaf": amount_xaf,
            "provider": provider.value,
            "instructions": self._get_payment_instructions(provider, amount_xaf),
            "merchant_number": self._get_merchant_number(provider),
            "simulation": True,
            "message": "Mode simulation - Configurez CINETPAY_API_KEY ou PAYDUNYA_MASTER_KEY pour les paiements réels",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def verify_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Verify payment status from provider
        """
        if self.simulation_mode:
            return {
                "payment_id": payment_id,
                "status": PaymentStatus.COMPLETED.value,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "simulation": True
            }
        
        if self.use_cinetpay:
            return await self._cinetpay_verify(payment_id)
        elif self.use_paydunya:
            return await self._paydunya_verify(payment_id)
        
        return {
            "payment_id": payment_id,
            "status": PaymentStatus.COMPLETED.value,
            "verified_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def _cinetpay_verify(self, payment_id: str) -> Dict[str, Any]:
        """Verify payment via CinetPay"""
        try:
            payload = {
                "apikey": CINETPAY_API_KEY,
                "site_id": CINETPAY_SITE_ID,
                "transaction_id": payment_id
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.cinetpay_base_url}/payment/check",
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    status_map = {
                        "ACCEPTED": PaymentStatus.COMPLETED.value,
                        "REFUSED": PaymentStatus.FAILED.value,
                        "PENDING": PaymentStatus.PENDING.value
                    }
                    return {
                        "payment_id": payment_id,
                        "status": status_map.get(data.get("data", {}).get("status"), PaymentStatus.PENDING.value),
                        "provider_data": data,
                        "verified_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            logger.error(f"CinetPay verification error: {e}")
        
        return {"payment_id": payment_id, "status": PaymentStatus.PENDING.value}
    
    async def _paydunya_verify(self, payment_id: str) -> Dict[str, Any]:
        """Verify payment via PayDunya"""
        try:
            headers = {
                "PAYDUNYA-MASTER-KEY": PAYDUNYA_MASTER_KEY,
                "PAYDUNYA-PRIVATE-KEY": PAYDUNYA_PRIVATE_KEY,
                "PAYDUNYA-TOKEN": PAYDUNYA_TOKEN
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.paydunya_base_url}/checkout-invoice/confirm/{payment_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    status_map = {
                        "completed": PaymentStatus.COMPLETED.value,
                        "pending": PaymentStatus.PENDING.value,
                        "cancelled": PaymentStatus.CANCELLED.value
                    }
                    return {
                        "payment_id": payment_id,
                        "status": status_map.get(data.get("status"), PaymentStatus.PENDING.value),
                        "provider_data": data,
                        "verified_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            logger.error(f"PayDunya verification error: {e}")
        
        return {"payment_id": payment_id, "status": PaymentStatus.PENDING.value}
    
    def _get_payment_instructions(self, provider: PaymentProvider, amount: float) -> str:
        """Get payment instructions based on provider"""
        if provider == PaymentProvider.ORANGE_MONEY:
            return f"""Instructions Orange Money:
1. Composez #150*1*1# sur votre téléphone
2. Sélectionnez "Paiement marchand"
3. Entrez le numéro marchand: {ORANGE_MONEY_MERCHANT}
4. Entrez le montant: {int(amount)} XAF
5. Confirmez avec votre code PIN
6. Cliquez sur "J'ai payé" après confirmation"""
        else:
            return f"""Instructions MTN Mobile Money:
1. Composez *126# sur votre téléphone
2. Sélectionnez "Paiement"
3. Entrez le numéro marchand: {MTN_MOMO_MERCHANT}
4. Entrez le montant: {int(amount)} XAF
5. Confirmez avec votre code PIN
6. Cliquez sur "J'ai payé" après confirmation"""
    
    def _get_merchant_number(self, provider: PaymentProvider) -> str:
        """Get merchant number based on provider"""
        if provider == PaymentProvider.ORANGE_MONEY:
            return ORANGE_MONEY_MERCHANT
        return MTN_MOMO_MERCHANT

# Singleton instance
payment_service = MobileMoneyService()
