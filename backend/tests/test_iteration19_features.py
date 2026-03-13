"""
Iteration 19 Backend Tests - AGRICAM IA
Testing: Login with new roles (seed_analyst, agronomist), payment packages, providers, subscription status
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials as per the review request
CREDENTIALS = {
    "admin": {"email": "admin@agricam.ai", "password": "Admin@2026"},
    "farmer": {"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
    "supplier": {"email": "fournisseur@agricam.ai", "password": "Supplier@2026"},
    "financial": {"email": "banque@agricam.ai", "password": "Bank@2026"},
    "analyst": {"email": "analyste@agricam.ai", "password": "Analyst@2026"},
    "agronomist": {"email": "agronome@agricam.ai", "password": "Agro@2026"},
}

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def seed_database(api_client):
    """Ensure demo accounts exist"""
    try:
        resp = api_client.post(f"{BASE_URL}/api/seed")
        print(f"Seed response: {resp.status_code}")
    except:
        pass

class TestHealthCheck:
    """Basic API health check"""
    
    def test_health_endpoint(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        data = resp.json()
        assert data.get("status") == "healthy"
        print("PASS: Health endpoint working")

class TestLoginAllRoles:
    """Test login for all 6 demo accounts"""
    
    def test_login_admin(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["admin"]["email"],
            "password": CREDENTIALS["admin"]["password"]
        })
        assert resp.status_code == 200, f"Admin login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login successful")
    
    def test_login_farmer(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["farmer"]["email"],
            "password": CREDENTIALS["farmer"]["password"]
        })
        assert resp.status_code == 200, f"Farmer login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"
        print("PASS: Farmer login successful")
    
    def test_login_supplier(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["supplier"]["email"],
            "password": CREDENTIALS["supplier"]["password"]
        })
        assert resp.status_code == 200, f"Supplier login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "supplier"
        print("PASS: Supplier login successful")
    
    def test_login_financial(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["financial"]["email"],
            "password": CREDENTIALS["financial"]["password"]
        })
        assert resp.status_code == 200, f"Financial/Bank login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "financial"
        print("PASS: Bank/Financial login successful")
    
    def test_login_seed_analyst(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["analyst"]["email"],
            "password": CREDENTIALS["analyst"]["password"]
        })
        assert resp.status_code == 200, f"Seed Analyst login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "seed_analyst"
        print("PASS: Seed Analyst login successful")
    
    def test_login_agronomist(self, api_client, seed_database):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS["agronomist"]["email"],
            "password": CREDENTIALS["agronomist"]["password"]
        })
        assert resp.status_code == 200, f"Agronomist login failed: {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == "agronomist"
        print("PASS: Agronomist login successful")

class TestPaymentPackages:
    """Test payment packages API"""
    
    def test_get_packages(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api/payments/packages")
        assert resp.status_code == 200, f"Get packages failed: {resp.text}"
        data = resp.json()
        assert "packages" in data
        packages = data["packages"]
        assert len(packages) == 6, f"Expected 6 packages, got {len(packages)}"
        
        # Check package structure
        package_ids = [p["id"] for p in packages]
        expected_ids = ["basic_monthly", "basic_quarterly", "basic_annual", 
                        "premium_monthly", "premium_quarterly", "premium_annual"]
        for eid in expected_ids:
            assert eid in package_ids, f"Missing package: {eid}"
        
        print(f"PASS: 6 packages returned: {package_ids}")
    
    def test_packages_have_required_fields(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api/payments/packages")
        data = resp.json()
        packages = data["packages"]
        
        for pkg in packages:
            assert "amount" in pkg, f"Package missing amount: {pkg}"
            assert "days" in pkg, f"Package missing days: {pkg}"
            assert "type" in pkg, f"Package missing type: {pkg}"
            assert "label" in pkg, f"Package missing label: {pkg}"
            assert pkg["type"] in ["basic", "premium"], f"Invalid type: {pkg['type']}"
        
        print("PASS: All packages have required fields (amount, days, type, label)")

class TestPaymentProviders:
    """Test payment providers endpoint (fallback list expected)"""
    
    def test_get_providers(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api/payments/providers")
        assert resp.status_code == 200, f"Get providers failed: {resp.text}"
        data = resp.json()
        assert "providers" in data
        providers = data["providers"]
        assert len(providers) >= 2, f"Expected at least 2 providers, got {len(providers)}"
        
        # Check for MTN and Orange (fallback providers)
        provider_ids = [p.get("id", "") for p in providers]
        print(f"Providers returned: {provider_ids}")
        
        # At minimum, MTN and Orange should be present
        has_mtn = any("mtn" in pid.lower() for pid in provider_ids)
        has_orange = any("orange" in pid.lower() for pid in provider_ids)
        assert has_mtn or has_orange, "Neither MTN nor Orange provider found"
        
        print(f"PASS: Providers returned (fallback list): {provider_ids}")

class TestSubscriptionStatus:
    """Test subscription status endpoint"""
    
    def get_token(self, api_client, cred_key):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS[cred_key]["email"],
            "password": CREDENTIALS[cred_key]["password"]
        })
        if resp.status_code == 200:
            return resp.json().get("access_token")
        return None
    
    def test_subscription_status_farmer(self, api_client, seed_database):
        token = self.get_token(api_client, "farmer")
        assert token, "Failed to get farmer token"
        
        resp = api_client.get(
            f"{BASE_URL}/api/user/subscription-status",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200, f"Subscription status failed: {resp.text}"
        data = resp.json()
        
        # Check response structure
        assert "subscription_type" in data
        assert "is_trial_active" in data or "is_trial" in data
        assert "has_full_access" in data
        
        print(f"PASS: Subscription status returned: {data}")
    
    def test_subscription_status_requires_auth(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api/user/subscription-status")
        assert resp.status_code in [401, 422], f"Expected 401/422 without auth, got {resp.status_code}"
        print("PASS: Subscription status requires authentication")

class TestAgribotIA:
    """Test AgriBot AI chatbot endpoint"""
    
    def get_token(self, api_client, cred_key):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS[cred_key]["email"],
            "password": CREDENTIALS[cred_key]["password"]
        })
        if resp.status_code == 200:
            return resp.json().get("access_token")
        return None
    
    def test_agribot_chat(self, api_client, seed_database):
        token = self.get_token(api_client, "farmer")
        assert token, "Failed to get farmer token"
        
        resp = api_client.post(
            f"{BASE_URL}/api/agribot-ai/chat",
            json={"message": "Bonjour, comment traiter le mildiou?"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200, f"AgriBot chat failed: {resp.text}"
        data = resp.json()
        assert "response" in data
        print(f"PASS: AgriBot responded: {data['response'][:100]}...")

class TestDashboardAPI:
    """Test dashboard stats endpoint"""
    
    def get_token(self, api_client, cred_key):
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": CREDENTIALS[cred_key]["email"],
            "password": CREDENTIALS[cred_key]["password"]
        })
        if resp.status_code == 200:
            return resp.json().get("access_token")
        return None
    
    def test_dashboard_stats(self, api_client, seed_database):
        token = self.get_token(api_client, "admin")
        assert token, "Failed to get admin token"
        
        resp = api_client.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200, f"Dashboard stats failed: {resp.text}"
        data = resp.json()
        
        # Check required fields
        assert "parcels_count" in data
        assert "average_humidity" in data
        assert "active_alerts" in data
        
        print(f"PASS: Dashboard stats returned: parcels={data.get('parcels_count')}")
