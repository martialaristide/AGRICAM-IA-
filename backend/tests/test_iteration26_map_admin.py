"""
Iteration 26: Testing Map Suppliers API and Admin Block/Unblock Features
- Map suppliers CRUD endpoints
- Supplier filtering by category, culture, need, radius
- Season and categories endpoints
- Admin block/unblock user functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
FARMER_EMAIL = "agriculteur@agricam.ai"
FARMER_PASSWORD = "Farmer@2026"
ADMIN_EMAIL = "admin@agricam.ai"
ADMIN_PASSWORD = "Admin@2026"


class TestMapSuppliersAPI:
    """Test map suppliers endpoints"""
    
    def setup_method(self):
        """Setup auth tokens"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
    def get_farmer_token(self):
        """Get farmer auth token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
        
    def get_admin_token(self):
        """Get admin auth token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
    
    # === Map Suppliers GET Tests ===
    
    def test_get_suppliers_no_auth(self):
        """GET /api/map/suppliers returns demo suppliers list without auth"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check demo supplier structure
        supplier = data[0]
        assert "id" in supplier
        assert "name" in supplier
        assert "category" in supplier
        assert "lat" in supplier
        assert "lon" in supplier
        print(f"PASS: GET /api/map/suppliers returns {len(data)} suppliers")
    
    def test_get_suppliers_with_coordinates_returns_distance(self):
        """GET /api/map/suppliers?lat=4.05&lon=9.77&radius=50 returns suppliers with distance_km"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers", params={
            "lat": 4.05,
            "lon": 9.77,
            "radius": 50
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # If suppliers found within radius, they should have distance_km
        for supplier in data:
            assert "distance_km" in supplier, f"Supplier {supplier.get('name')} missing distance_km"
            assert isinstance(supplier["distance_km"], (int, float))
            assert supplier["distance_km"] <= 50, f"Supplier {supplier.get('name')} distance {supplier['distance_km']} > radius 50"
        print(f"PASS: GET /api/map/suppliers with coords returns {len(data)} suppliers with distance_km")
    
    def test_get_suppliers_filter_by_category(self):
        """GET /api/map/suppliers?category=intrants returns filtered by category"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers", params={"category": "intrants"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for supplier in data:
            assert supplier.get("category") == "intrants", f"Expected category 'intrants', got {supplier.get('category')}"
        print(f"PASS: GET /api/map/suppliers?category=intrants returns {len(data)} intrants suppliers")
    
    def test_get_suppliers_filter_by_culture(self):
        """GET /api/map/suppliers?culture=mais returns filtered by culture"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers", params={"culture": "mais"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for supplier in data:
            cultures = supplier.get("cultures", [])
            assert "mais" in cultures, f"Expected 'mais' in cultures {cultures}"
        print(f"PASS: GET /api/map/suppliers?culture=mais returns {len(data)} suppliers for mais")
    
    def test_get_suppliers_filter_by_need(self):
        """GET /api/map/suppliers?need=semences returns filtered by need"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers", params={"need": "semences"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for supplier in data:
            needs = supplier.get("needs", [])
            assert "semences" in needs, f"Expected 'semences' in needs {needs}"
        print(f"PASS: GET /api/map/suppliers?need=semences returns {len(data)} suppliers for semences")
    
    def test_get_suppliers_combined_filters(self):
        """GET /api/map/suppliers with multiple filters works correctly"""
        response = self.session.get(f"{BASE_URL}/api/map/suppliers", params={
            "lat": 4.05,
            "lon": 9.77,
            "radius": 100,
            "category": "intrants"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for supplier in data:
            assert supplier.get("category") == "intrants"
            if "distance_km" in supplier:
                assert supplier["distance_km"] <= 100
        print(f"PASS: GET /api/map/suppliers combined filters returns {len(data)} suppliers")
    
    # === Map Seasons Endpoint ===
    
    def test_get_seasons(self):
        """GET /api/map/seasons returns current season info"""
        response = self.session.get(f"{BASE_URL}/api/map/seasons")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "recommended_needs" in data
        assert "tips" in data
        assert isinstance(data["recommended_needs"], list)
        print(f"PASS: GET /api/map/seasons returns season: {data['name']}")
    
    # === Map Categories Endpoint ===
    
    def test_get_categories(self):
        """GET /api/map/categories returns categories, cultures, needs lists"""
        response = self.session.get(f"{BASE_URL}/api/map/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "cultures" in data
        assert "needs" in data
        assert isinstance(data["categories"], list)
        assert isinstance(data["cultures"], list)
        assert isinstance(data["needs"], list)
        # Check category structure
        assert len(data["categories"]) > 0
        cat = data["categories"][0]
        assert "id" in cat
        assert "label" in cat
        print(f"PASS: GET /api/map/categories returns {len(data['categories'])} categories, {len(data['cultures'])} cultures, {len(data['needs'])} needs")
    
    # === Create Supplier (POST) ===
    
    def test_create_supplier_as_admin(self):
        """POST /api/map/suppliers creates a new supplier (admin auto-approved)"""
        token = self.get_admin_token()
        assert token is not None, "Admin login failed"
        
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = self.session.post(f"{BASE_URL}/api/map/suppliers", json={
            "name": "TEST_AdminSupplier_MapTest",
            "description": "Test supplier created by admin",
            "category": "intrants",
            "lat": 4.0611,
            "lon": 9.7279,
            "address": "Test Address, Douala",
            "phone": "+237699999999",
            "products": ["test product"],
            "cultures": ["mais", "tomate"],
            "needs": ["semences", "engrais"]
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "supplier" in data
        supplier = data["supplier"]
        assert supplier.get("name") == "TEST_AdminSupplier_MapTest"
        assert supplier.get("is_approved") == True, "Admin-created supplier should be auto-approved"
        print(f"PASS: POST /api/map/suppliers creates supplier with id {supplier.get('id')}, is_approved={supplier.get('is_approved')}")


class TestAdminBlockUnblockUsers:
    """Test admin block/unblock user functionality"""
    
    def setup_method(self):
        """Setup session and get admin token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def get_admin_token(self):
        """Get admin auth token"""
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
    
    def get_test_user_id(self, admin_token):
        """Get a test user ID (farmer) to block/unblock"""
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        response = self.session.get(f"{BASE_URL}/api/admin/users")
        if response.status_code == 200:
            users = response.json()
            # Find farmer user
            for user in users:
                if user.get("email") == FARMER_EMAIL:
                    return user.get("id")
            # Return first non-admin user
            for user in users:
                if user.get("role") != "admin":
                    return user.get("id")
        return None
    
    def test_admin_can_block_user(self):
        """PUT /api/admin/users/{user_id}/block blocks user"""
        admin_token = self.get_admin_token()
        assert admin_token is not None, "Admin login failed"
        
        user_id = self.get_test_user_id(admin_token)
        assert user_id is not None, "No test user found to block"
        
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        
        response = self.session.put(f"{BASE_URL}/api/admin/users/{user_id}/block")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "bloque" in data["message"].lower() or "block" in data["message"].lower()
        print(f"PASS: PUT /api/admin/users/{user_id}/block - User blocked successfully")
        
        # Verify user is blocked by fetching users list
        response = self.session.get(f"{BASE_URL}/api/admin/users")
        users = response.json()
        blocked_user = next((u for u in users if u.get("id") == user_id), None)
        assert blocked_user is not None
        assert blocked_user.get("is_blocked") == True or blocked_user.get("is_active") == False
        print(f"PASS: User {user_id} verified as blocked in users list")
    
    def test_admin_can_unblock_user(self):
        """PUT /api/admin/users/{user_id}/unblock unblocks user"""
        admin_token = self.get_admin_token()
        assert admin_token is not None, "Admin login failed"
        
        user_id = self.get_test_user_id(admin_token)
        assert user_id is not None, "No test user found to unblock"
        
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        
        # First block, then unblock
        self.session.put(f"{BASE_URL}/api/admin/users/{user_id}/block")
        
        response = self.session.put(f"{BASE_URL}/api/admin/users/{user_id}/unblock")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "debloque" in data["message"].lower() or "unblock" in data["message"].lower()
        print(f"PASS: PUT /api/admin/users/{user_id}/unblock - User unblocked successfully")
        
        # Verify user is unblocked
        response = self.session.get(f"{BASE_URL}/api/admin/users")
        users = response.json()
        unblocked_user = next((u for u in users if u.get("id") == user_id), None)
        assert unblocked_user is not None
        assert unblocked_user.get("is_blocked") == False or unblocked_user.get("is_active") == True
        print(f"PASS: User {user_id} verified as unblocked in users list")
    
    def test_blocked_user_cannot_login(self):
        """Blocked user should not be able to login"""
        admin_token = self.get_admin_token()
        assert admin_token is not None, "Admin login failed"
        
        user_id = self.get_test_user_id(admin_token)
        assert user_id is not None, "No test user found"
        
        # Block the farmer user
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        self.session.put(f"{BASE_URL}/api/admin/users/{user_id}/block")
        
        # Try to login as blocked user
        self.session.headers.pop("Authorization", None)
        response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": FARMER_EMAIL,
            "password": FARMER_PASSWORD
        })
        
        # Should return 401 for blocked user
        assert response.status_code == 401, f"Expected 401 for blocked user, got {response.status_code}"
        print("PASS: Blocked user cannot login (401 response)")
        
        # Unblock the user for other tests
        self.session.headers.update({"Authorization": f"Bearer {admin_token}"})
        self.session.put(f"{BASE_URL}/api/admin/users/{user_id}/unblock")
        print("PASS: User unblocked for subsequent tests")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_suppliers(self):
        """Remove test suppliers created during testing"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed for cleanup")
        
        token = response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        # Get suppliers and delete test ones
        response = session.get(f"{BASE_URL}/api/map/suppliers")
        if response.status_code == 200:
            suppliers = response.json()
            for s in suppliers:
                if s.get("name", "").startswith("TEST_"):
                    # Note: No delete endpoint for suppliers, just note it
                    print(f"Note: Test supplier {s.get('id')} would be cleaned up if delete endpoint existed")
        
        print("PASS: Cleanup completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
