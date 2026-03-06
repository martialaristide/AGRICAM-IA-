"""
Iteration 17 Testing - New Admin CRM, Formations, Export features
Testing Access Control page with 6 tabs, CRM, Revenue, Export, and Formations APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test admin and farmer authentication"""
    
    def test_admin_login(self):
        """Test admin login returns access_token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["role"] == "admin", "User role is not admin"
        print(f"✓ Admin login successful, role: {data['user']['role']}")
        return data["access_token"]

    def test_farmer_login(self):
        """Test farmer login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        assert response.status_code == 200, f"Farmer login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"
        print(f"✓ Farmer login successful")
        return data["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@agricam.ai",
        "password": "Admin@2026"
    })
    if response.status_code != 200:
        # Try seeding first
        requests.post(f"{BASE_URL}/api/seed")
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def farmer_token():
    """Get farmer auth token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "agriculteur@agricam.ai",
        "password": "Farmer@2026"
    })
    if response.status_code != 200:
        requests.post(f"{BASE_URL}/api/seed")
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
    return response.json()["access_token"]


class TestCRMEndpoints:
    """Test CRM contacts, transactions, and revenue endpoints"""
    
    def test_crm_contacts(self, admin_token):
        """GET /api/admin/crm/contacts returns users and leads"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/crm/contacts", headers=headers)
        assert response.status_code == 200, f"CRM contacts failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of contacts"
        if len(data) > 0:
            contact = data[0]
            assert "id" in contact or "email" in contact
            print(f"✓ CRM contacts returned {len(data)} contacts")
        else:
            print("✓ CRM contacts returned empty list (no contacts yet)")
    
    def test_crm_transactions(self, admin_token):
        """GET /api/admin/crm/transactions returns transaction list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/crm/transactions", headers=headers)
        assert response.status_code == 200, f"Transactions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of transactions"
        if len(data) > 0:
            tx = data[0]
            assert "amount" in tx or "type" in tx
            print(f"✓ CRM transactions returned {len(data)} transactions")
        else:
            print("✓ CRM transactions returned empty list")
    
    def test_revenue_stats(self, admin_token):
        """GET /api/admin/crm/revenue-stats returns revenue data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/crm/revenue-stats", headers=headers)
        assert response.status_code == 200, f"Revenue stats failed: {response.text}"
        data = response.json()
        assert "total_revenue" in data or "total_transactions" in data or "total_users" in data
        print(f"✓ Revenue stats: {data}")
    
    def test_crm_unauthorized_without_token(self):
        """CRM endpoints require admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/crm/contacts")
        assert response.status_code == 401 or response.status_code == 403
        print("✓ CRM endpoints protected - unauthorized request rejected")
    
    def test_crm_forbidden_for_farmer(self, farmer_token):
        """CRM endpoints forbidden for farmer role"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/crm/contacts", headers=headers)
        assert response.status_code == 403, f"Expected 403 for farmer, got {response.status_code}"
        print("✓ CRM endpoints protected - farmer role rejected")


class TestFormationsEndpoints:
    """Test formation/course creation and listing"""
    
    def test_get_formations_public(self):
        """GET /api/formations - public listing works"""
        response = requests.get(f"{BASE_URL}/api/formations")
        assert response.status_code == 200, f"Formations list failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public formations list: {len(data)} courses")
    
    def test_create_formation_admin(self, admin_token):
        """POST /api/formations - admin can create"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        formation_data = {
            "title": "TEST_Formation Agriculture IA",
            "description": "Test formation for iteration 17",
            "category": "agriculture",
            "level": "debutant",
            "price": 0,
            "type": "video",
            "duration": "2h"
        }
        response = requests.post(f"{BASE_URL}/api/formations", json=formation_data, headers=headers)
        assert response.status_code == 200, f"Create formation failed: {response.text}"
        data = response.json()
        assert "id" in data, "No ID returned for created formation"
        assert data["title"] == formation_data["title"]
        print(f"✓ Formation created with ID: {data['id']}")
        return data["id"]
    
    def test_create_formation_unauthorized(self):
        """POST /api/formations requires auth"""
        formation_data = {"title": "Unauthorized Test", "category": "test"}
        response = requests.post(f"{BASE_URL}/api/formations", json=formation_data)
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Formation creation protected - unauthorized rejected")


class TestAdminAccessControl:
    """Test admin access grant/revoke endpoints"""
    
    def test_get_admin_users(self, admin_token):
        """GET /api/admin/users returns user list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin users list: {len(data)} users")
        return data
    
    def test_grant_access(self, admin_token):
        """POST /api/admin/access/grant works"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # First get users to find a non-admin user
        users_response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        users = users_response.json()
        non_admin = next((u for u in users if u.get("role") != "admin" and u.get("id")), None)
        
        if non_admin:
            grant_data = {
                "user_id": non_admin["id"],
                "access_level": "basic",
                "trial_days": 7,
                "note": "Test grant from iteration 17"
            }
            response = requests.post(f"{BASE_URL}/api/admin/access/grant", json=grant_data, headers=headers)
            assert response.status_code == 200, f"Grant access failed: {response.text}"
            print(f"✓ Access granted to user {non_admin.get('email', non_admin['id'])}")
        else:
            print("⚠ No non-admin user found to test grant access")
    
    def test_access_logs(self, admin_token):
        """GET /api/admin/access/logs returns logs"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/access/logs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Access logs: {len(data)} entries")


class TestDataExport:
    """Test admin data export endpoints"""
    
    def test_export_users_csv(self, admin_token):
        """GET /api/admin/export/users?format=csv returns CSV data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/export/users?format=csv", headers=headers)
        assert response.status_code == 200, f"Export users CSV failed: {response.text}"
        data = response.json()
        # Check CSV or count returned
        assert "data" in data or "count" in data, f"Unexpected response: {data}"
        print(f"✓ Export users CSV: {data.get('count', 'N/A')} records")
    
    def test_export_users_json(self, admin_token):
        """GET /api/admin/export/users?format=json returns JSON data"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/export/users?format=json", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        print(f"✓ Export users JSON: {data.get('count', len(data.get('data', [])))} records")
    
    def test_export_parcels(self, admin_token):
        """Test exporting parcels collection"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/export/parcels?format=csv", headers=headers)
        assert response.status_code == 200
        print("✓ Export parcels works")
    
    def test_export_nonexistent_collection(self, admin_token):
        """Export nonexistent collection returns 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/export/nonexistent_collection_xyz", headers=headers)
        assert response.status_code == 404
        print("✓ Export nonexistent collection returns 404")


class TestDatabaseBrowser:
    """Test database browser endpoints"""
    
    def test_list_collections(self, admin_token):
        """GET /api/admin/database/collections lists all collections"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/collections", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # API returns {"collections": [...], "database": "..."} format
        collections = data.get("collections", []) if isinstance(data, dict) else data
        assert isinstance(collections, list)
        print(f"✓ Database collections: {len(collections)} collections")
        for coll in collections[:5]:
            print(f"  - {coll.get('name', coll)}: {coll.get('count', 'N/A')} docs")
    
    def test_browse_users_collection(self, admin_token):
        """GET /api/admin/database/browse/users works"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/browse/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data or isinstance(data, list)
        print(f"✓ Browse users collection: {data.get('total', len(data.get('documents', data)))} documents")


class TestTrackingAndCampaigns:
    """Test user tracking and campaign endpoints"""
    
    def test_users_online(self, admin_token):
        """GET /api/admin/tracking/users-online returns online users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/tracking/users-online", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "online_users" in data or isinstance(data, dict)
        print(f"✓ Users online: {len(data.get('online_users', []))}")
    
    def test_tracking_stats(self, admin_token):
        """GET /api/admin/tracking/stats returns stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/tracking/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Tracking stats: {data}")
    
    def test_campaign_stats(self, admin_token):
        """GET /api/admin/campaigns/stats returns campaign stats"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/campaigns/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Campaign stats: {data}")


class TestAgribotIAEndpoints:
    """Test AgriBot IA (AGRI GENIUS) endpoints"""
    
    def test_agribot_chat(self, farmer_token):
        """POST /api/chatbot/message works"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.post(f"{BASE_URL}/api/chatbot/message", json={
            "message": "Comment traiter le mildiou ?"
        }, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        print(f"✓ AgriBot response source: {data.get('source', 'N/A')}")


class TestParcelsEndpoints:
    """Test parcels with weather and export features"""
    
    def test_get_parcels(self, farmer_token):
        """GET /api/parcels returns parcel list"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/parcels", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Parcels: {len(data)} parcels")


class TestIrrigationEndpoints:
    """Test irrigation system endpoints"""
    
    def test_get_irrigation_systems(self, farmer_token):
        """GET /api/irrigation returns systems"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/irrigation", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Irrigation systems: {len(data)}")
    
    def test_irrigation_stats(self, farmer_token):
        """GET /api/irrigation/stats returns stats"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/irrigation/stats", headers=headers)
        assert response.status_code == 200
        print("✓ Irrigation stats works")


class TestSatelliteEndpoints:
    """Test satellite imagery endpoints"""
    
    def test_get_aerial_images(self, farmer_token):
        """GET /api/aerial-images returns images"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/aerial-images", headers=headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Aerial images: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
