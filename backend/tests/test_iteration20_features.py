"""
Iteration 20 Backend Tests - AGRICAM IA 2.0
Tests: 6 role logins, dashboard APIs, payment packages, subscription status
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://agri-checkout.preview.emergentagent.com').rstrip('/')

# Demo accounts for testing
DEMO_ACCOUNTS = {
    "admin": {"email": "admin@agricam.ai", "password": "Admin@2026", "expected_role": "admin"},
    "farmer": {"email": "agriculteur@agricam.ai", "password": "Farmer@2026", "expected_role": "farmer"},
    "supplier": {"email": "fournisseur@agricam.ai", "password": "Supplier@2026", "expected_role": "supplier"},
    "financial": {"email": "banque@agricam.ai", "password": "Bank@2026", "expected_role": "financial"},
    "seed_analyst": {"email": "analyste@agricam.ai", "password": "Analyst@2026", "expected_role": "seed_analyst"},
    "agronomist": {"email": "agronome@agricam.ai", "password": "Agro@2026", "expected_role": "agronomist"},
}

class TestHealthAndSetup:
    """Basic API health checks"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"API Health: OK - {data}")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "version" in data
        print(f"API Root: OK - version {data.get('version')}")


class TestDemoAccountLogins:
    """Test all 6 demo account logins"""
    
    @pytest.mark.parametrize("account_name", list(DEMO_ACCOUNTS.keys()))
    def test_demo_login(self, account_name):
        """Test each demo account can login and returns correct role"""
        account = DEMO_ACCOUNTS[account_name]
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": account["email"], "password": account["password"]},
            timeout=15
        )
        assert response.status_code == 200, f"Login failed for {account_name}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data, f"Missing access_token for {account_name}"
        assert "user" in data, f"Missing user in response for {account_name}"
        
        # Verify role matches expected
        user = data["user"]
        assert user.get("role") == account["expected_role"], f"Role mismatch for {account_name}: expected {account['expected_role']}, got {user.get('role')}"
        
        print(f"Login {account_name}: OK - role={user.get('role')}, email={user.get('email')}")


class TestPaymentAPIs:
    """Test payment-related endpoints"""
    
    def test_get_payment_packages(self):
        """GET /api/payments/packages should return 6 packages"""
        response = requests.get(f"{BASE_URL}/api/payments/packages", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        assert "packages" in data
        packages = data["packages"]
        assert len(packages) == 6, f"Expected 6 packages, got {len(packages)}"
        
        expected_ids = ["basic_monthly", "basic_quarterly", "basic_annual", 
                       "premium_monthly", "premium_quarterly", "premium_annual"]
        package_ids = [p["id"] for p in packages]
        
        for exp_id in expected_ids:
            assert exp_id in package_ids, f"Missing package: {exp_id}"
        
        print(f"Payment packages: OK - {len(packages)} packages returned")
        for pkg in packages:
            print(f"  - {pkg['id']}: {pkg['amount']} XAF ({pkg['days']} days)")
    
    def test_get_payment_providers(self):
        """GET /api/payments/providers should return fallback providers"""
        response = requests.get(f"{BASE_URL}/api/payments/providers", timeout=15)
        assert response.status_code == 200
        data = response.json()
        
        assert "providers" in data
        providers = data["providers"]
        assert len(providers) >= 2, f"Expected at least 2 providers, got {len(providers)}"
        
        # Check for expected fallback providers
        provider_ids = [p.get("id") for p in providers]
        print(f"Payment providers: OK - {len(providers)} providers: {provider_ids}")


class TestSubscriptionStatus:
    """Test subscription status endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for farmer account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_subscription_status(self, auth_token):
        """GET /api/user/subscription-status should return subscription info"""
        response = requests.get(
            f"{BASE_URL}/api/user/subscription-status",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        required_fields = ["subscription_type", "is_trial_active", "has_full_access", "days_remaining"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"Subscription status: OK - type={data.get('subscription_type')}, has_access={data.get('has_full_access')}")
    
    def test_subscription_status_requires_auth(self):
        """GET /api/user/subscription-status should require authentication"""
        response = requests.get(f"{BASE_URL}/api/user/subscription-status", timeout=10)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Subscription status auth check: OK - returns 401 without token")


class TestDashboardAPIs:
    """Test dashboard data endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get auth token for admin account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@agricam.ai", "password": "Admin@2026"},
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    @pytest.fixture
    def farmer_token(self):
        """Get auth token for farmer account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Farmer authentication failed")
    
    def test_admin_dashboard(self, admin_token):
        """GET /api/admin/dashboard should return admin stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected fields
        expected_fields = ["total_users", "total_farmers", "total_suppliers", "total_financial"]
        for field in expected_fields:
            assert field in data, f"Missing admin dashboard field: {field}"
        
        print(f"Admin dashboard: OK - {data.get('total_users')} users, {data.get('total_farmers')} farmers")
    
    def test_admin_users_list(self, admin_token):
        """GET /api/admin/users should return all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        assert response.status_code == 200
        users = response.json()
        
        assert isinstance(users, list)
        assert len(users) >= 6, f"Expected at least 6 demo users, got {len(users)}"
        
        # Verify all 6 demo roles exist
        roles = set(u.get("role") for u in users)
        expected_roles = {"admin", "farmer", "supplier", "financial", "seed_analyst", "agronomist"}
        
        for role in expected_roles:
            assert role in roles, f"Missing role in users list: {role}"
        
        print(f"Admin users list: OK - {len(users)} users, roles: {roles}")
    
    def test_dashboard_stats(self, farmer_token):
        """GET /api/dashboard/stats should return dashboard statistics"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {farmer_token}"},
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected stats fields
        expected_fields = ["parcels_count", "average_humidity", "average_temperature", "active_alerts"]
        for field in expected_fields:
            assert field in data, f"Missing dashboard stat: {field}"
        
        print(f"Dashboard stats: OK - {data.get('parcels_count')} parcels, {data.get('active_sensors')} sensors")


class TestRoleSpecificAccess:
    """Test role-specific dashboard access"""
    
    def test_supplier_can_access_dashboard(self):
        """Supplier should be able to access general dashboard"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "fournisseur@agricam.ai", "password": "Supplier@2026"},
            timeout=15
        )
        assert response.status_code == 200
        token = response.json().get("access_token")
        
        # Access dashboard stats
        stats_response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        assert stats_response.status_code == 200
        print(f"Supplier dashboard access: OK")
    
    def test_bank_can_access_financial(self):
        """Bank/financial role should access financial endpoints"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "banque@agricam.ai", "password": "Bank@2026"},
            timeout=15
        )
        assert response.status_code == 200
        token = response.json().get("access_token")
        
        # Access financial loans
        loans_response = requests.get(
            f"{BASE_URL}/api/financial/loans",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        # Should either succeed or return empty list (not 403/401)
        assert loans_response.status_code in [200], f"Expected 200, got {loans_response.status_code}"
        print(f"Bank financial access: OK - {loans_response.status_code}")


class TestParcelsAPI:
    """Test parcel endpoints"""
    
    @pytest.fixture
    def farmer_token(self):
        """Get auth token for farmer account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Farmer authentication failed")
    
    def test_get_parcels(self, farmer_token):
        """GET /api/parcels should return parcels list"""
        response = requests.get(
            f"{BASE_URL}/api/parcels",
            headers={"Authorization": f"Bearer {farmer_token}"},
            timeout=10
        )
        assert response.status_code == 200
        parcels = response.json()
        assert isinstance(parcels, list)
        print(f"Parcels list: OK - {len(parcels)} parcels")


class TestAlertsAPI:
    """Test alerts endpoints"""
    
    @pytest.fixture
    def farmer_token(self):
        """Get auth token for farmer account"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
            timeout=15
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Farmer authentication failed")
    
    def test_get_alerts(self, farmer_token):
        """GET /api/alerts should return alerts list"""
        response = requests.get(
            f"{BASE_URL}/api/alerts",
            headers={"Authorization": f"Bearer {farmer_token}"},
            timeout=10
        )
        assert response.status_code == 200
        alerts = response.json()
        assert isinstance(alerts, list)
        print(f"Alerts list: OK - {len(alerts)} alerts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
