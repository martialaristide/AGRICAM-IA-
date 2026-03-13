"""
Test suite for AGRICAM IA Payment Flow - Iteration 23
Tests the payment endpoints after the JWT secret fix in payments.py
Covers: login, subscription-status, packages, request-payment, check-status, history
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from requirements
FARMER_EMAIL = "agriculteur@agricam.ai"
FARMER_PASSWORD = "Farmer@2026"
ADMIN_EMAIL = "admin@agricam.ai"
ADMIN_PASSWORD = "Admin@2026"


class TestPaymentBackendAPIs:
    """Payment endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token for farmer"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as farmer
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token") or data.get("token")
            self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        else:
            pytest.skip(f"Login failed: {response.status_code} - {response.text}")
    
    def test_01_login_with_farmer_credentials(self):
        """Test login returns valid token for farmer"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data or "token" in data, "No token in response"
        token = data.get("access_token") or data.get("token")
        assert isinstance(token, str) and len(token) > 10, "Token too short or invalid"
        print(f"Login successful, token length: {len(token)}")
    
    def test_02_subscription_status_returns_200_with_token(self):
        """Test /payments/subscription-status returns 200 (not 401) with valid token"""
        response = self.session.get(f"{BASE_URL}/api/payments/subscription-status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Validate response structure
        assert "subscription_type" in data, "Missing subscription_type in response"
        assert "has_full_access" in data, "Missing has_full_access in response"
        print(f"Subscription status: {data['subscription_type']}, has_access: {data['has_full_access']}")
    
    def test_03_get_packages(self):
        """Test /payments/packages returns list of packages"""
        response = self.session.get(f"{BASE_URL}/api/payments/packages")
        assert response.status_code == 200, f"Failed to get packages: {response.text}"
        data = response.json()
        assert "packages" in data, "Missing packages array"
        packages = data["packages"]
        assert len(packages) >= 3, f"Expected at least 3 packages, got {len(packages)}"
        
        # Validate package structure
        for pkg in packages:
            assert "id" in pkg, "Package missing id"
            assert "amount" in pkg, "Package missing amount"
            assert "days" in pkg, "Package missing days"
            assert "type" in pkg, "Package missing type"
        
        package_ids = [p["id"] for p in packages]
        assert "basic_monthly" in package_ids, "Missing basic_monthly package"
        print(f"Found {len(packages)} packages: {package_ids}")
    
    def test_04_request_payment_creates_order(self):
        """Test POST /payments/request-payment creates payment and returns success"""
        response = self.session.post(f"{BASE_URL}/api/payments/request-payment", json={
            "amount": 5000,
            "phone_number": "699999999",
            "method": "MOBILE_MONEY",
            "method_type": "MOMO",
            "provider": "mtn_cm",
            "package_id": "basic_monthly"
        })
        assert response.status_code == 200, f"Payment request failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, f"Payment not successful: {data}"
        assert "order_id" in data, "Missing order_id in response"
        assert "transaction_id" in data, "Missing transaction_id in response"
        
        # Store order_id for next test
        self.__class__.created_order_id = data["order_id"]
        print(f"Payment initiated: order={data['order_id']}, tx={data['transaction_id']}")
    
    def test_05_check_payment_status_success(self):
        """Test GET /payments/check-status/{order_id} returns success for simulated payments"""
        order_id = getattr(self.__class__, 'created_order_id', None)
        if not order_id:
            pytest.skip("No order_id from previous test")
        
        response = self.session.get(f"{BASE_URL}/api/payments/check-status/{order_id}")
        assert response.status_code == 200, f"Status check failed: {response.text}"
        data = response.json()
        assert "status" in data, "Missing status in response"
        assert "order_id" in data, "Missing order_id in response"
        # Simulated payments should auto-succeed
        assert data["status"] in ["success", "processing"], f"Unexpected status: {data['status']}"
        print(f"Payment status: {data['status']} for order {order_id}")
    
    def test_06_payment_history_returns_list(self):
        """Test GET /payments/history returns payment list"""
        response = self.session.get(f"{BASE_URL}/api/payments/history")
        assert response.status_code == 200, f"History fetch failed: {response.text}"
        data = response.json()
        assert "payments" in data, "Missing payments array"
        payments = data["payments"]
        assert isinstance(payments, list), "payments should be a list"
        
        if len(payments) > 0:
            # Validate payment structure
            payment = payments[0]
            assert "id" in payment or "order_id" in payment, "Payment missing id"
            assert "amount" in payment, "Payment missing amount"
            assert "status" in payment, "Payment missing status"
            print(f"Found {len(payments)} payments in history")
        else:
            print("No payment history yet (expected for fresh user)")
    
    def test_07_subscription_status_no_401_after_payment_request(self):
        """Verify subscription-status still works after payment operations (no token invalidation)"""
        # First make a payment request
        self.session.post(f"{BASE_URL}/api/payments/request-payment", json={
            "amount": 5000,
            "phone_number": "677777777",
            "method": "MOBILE_MONEY",
            "method_type": "MOMO",
            "provider": "mtn_cm",
            "package_id": "basic_monthly"
        })
        
        # Then verify subscription-status still works
        response = self.session.get(f"{BASE_URL}/api/payments/subscription-status")
        assert response.status_code == 200, f"Got 401 after payment! Token invalidated: {response.status_code}"
        print("Subscription status check passed after payment request - no 401")


class TestPaymentProviders:
    """Test payment providers endpoint"""
    
    def test_get_providers(self):
        """Test /payments/providers returns provider list"""
        # Login first
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        login_resp = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json().get("access_token") or login_resp.json().get("token")
            session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = session.get(f"{BASE_URL}/api/payments/providers")
        assert response.status_code == 200, f"Failed to get providers: {response.text}"
        data = response.json()
        assert "providers" in data, "Missing providers array"
        providers = data["providers"]
        assert len(providers) >= 2, f"Expected at least 2 providers, got {len(providers)}"
        
        provider_ids = [p.get("id") or p.get("name") for p in providers]
        print(f"Available providers: {provider_ids}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
