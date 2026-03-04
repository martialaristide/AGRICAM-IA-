"""
AGRICAM IA - Iteration 16 Backend Tests
Testing P0 features:
- AgriBot chatbot with cache + fallback system
- Admin access control (grant, update, revoke, extend)
- User activity tracking
- Exit intent offers & campaigns
- Database browser (admin)
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_seed_database(self):
        """Ensure database is seeded with test users"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        print(f"PASS: Database seeded - {response.json().get('message')}")
    
    def test_admin_login(self):
        """Test admin login returns valid token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("user", {}).get("role") == "admin"
        print(f"PASS: Admin login successful, role={data['user']['role']}")
        return data["access_token"]
    
    def test_farmer_login(self):
        """Test farmer login returns valid token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("user", {}).get("role") == "farmer"
        print(f"PASS: Farmer login successful, role={data['user']['role']}")
        return data["access_token"]


class TestAgribotChatbot:
    """Test AgriBot chatbot with cache and fallback system"""
    
    @pytest.fixture
    def farmer_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        return response.json().get("access_token")
    
    def test_chatbot_message_returns_response(self, farmer_token):
        """Test POST /api/chatbot/message returns response with source field"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        # Use fallback keyword to get quick response
        response = requests.post(f"{BASE_URL}/api/chatbot/message", 
            json={"message": "bonjour"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "source" in data
        assert data["source"] in ["agribot_ai", "cache", "fallback"]
        assert "response_time_ms" in data
        print(f"PASS: Chatbot response - source={data['source']}, time={data['response_time_ms']}ms")
    
    def test_chatbot_cache_works(self, farmer_token):
        """Test same question twice returns source='cache' with 0ms response"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        unique_msg = f"test_cache_{int(time.time())}"
        
        # First request - should not be cached
        response1 = requests.post(f"{BASE_URL}/api/chatbot/message", 
            json={"message": "aide"},  # Use fallback keyword for quick response
            headers=headers
        )
        assert response1.status_code == 200
        data1 = response1.json()
        first_source = data1.get("source")
        print(f"First request: source={first_source}, time={data1.get('response_time_ms')}ms")
        
        # Second request with same message - should hit cache
        response2 = requests.post(f"{BASE_URL}/api/chatbot/message", 
            json={"message": "aide"},
            headers=headers
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["source"] == "cache"
        assert data2["response_time_ms"] <= 10  # Should be very fast (0-10ms)
        print(f"PASS: Cache works - source={data2['source']}, time={data2['response_time_ms']}ms")
    
    def test_chatbot_fallback_keywords(self, farmer_token):
        """Test fallback responses for agricultural keywords"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        
        # Test various agricultural keywords that trigger fallback
        keywords = ["mais", "manioc", "maladie", "irrigation", "engrais"]
        
        for keyword in keywords:
            response = requests.post(f"{BASE_URL}/api/chatbot/message", 
                json={"message": keyword},
                headers=headers
            )
            assert response.status_code == 200
            data = response.json()
            assert "response" in data
            assert len(data["response"]) > 50  # Should have substantial response
            print(f"PASS: Fallback for '{keyword}' - {len(data['response'])} chars")


class TestAdminAccessControl:
    """Test admin access control endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def farmer_id(self, admin_token):
        """Get farmer user ID for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        users = response.json()
        farmer = next((u for u in users if u.get("email") == "agriculteur@agricam.ai"), None)
        return farmer.get("id") if farmer else None
    
    def test_admin_users_list(self, admin_token):
        """Test GET /api/admin/users returns user list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"PASS: Admin users list - {len(data)} users")
    
    def test_grant_access(self, admin_token, farmer_id):
        """Test POST /api/admin/access/grant grants trial access"""
        if not farmer_id:
            pytest.skip("Farmer user not found")
        
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/admin/access/grant", 
            json={
                "user_id": farmer_id,
                "access_level": "premium",
                "trial_days": 7,
                "note": "TEST_grant_access"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"PASS: Grant access - {data.get('message')}")
    
    def test_update_access_revoke(self, admin_token, farmer_id):
        """Test POST /api/admin/access/update with action=revoke"""
        if not farmer_id:
            pytest.skip("Farmer user not found")
        
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/admin/access/update", 
            json={
                "user_id": farmer_id,
                "action": "revoke",
                "note": "TEST_revoke"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"PASS: Revoke access - {data.get('message')}")
    
    def test_update_access_extend(self, admin_token, farmer_id):
        """Test POST /api/admin/access/update with action=extend"""
        if not farmer_id:
            pytest.skip("Farmer user not found")
        
        # First grant access so we can extend
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        requests.post(f"{BASE_URL}/api/admin/access/grant", 
            json={"user_id": farmer_id, "access_level": "basic", "trial_days": 3},
            headers=headers
        )
        
        response = requests.post(f"{BASE_URL}/api/admin/access/update", 
            json={
                "user_id": farmer_id,
                "action": "extend",
                "extra_days": 7,
                "note": "TEST_extend"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"PASS: Extend access - {data.get('message')}")
    
    def test_update_access_reduce(self, admin_token, farmer_id):
        """Test POST /api/admin/access/update with action=reduce"""
        if not farmer_id:
            pytest.skip("Farmer user not found")
        
        # First grant premium access
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        requests.post(f"{BASE_URL}/api/admin/access/grant", 
            json={"user_id": farmer_id, "access_level": "premium", "trial_days": 7},
            headers=headers
        )
        
        response = requests.post(f"{BASE_URL}/api/admin/access/update", 
            json={
                "user_id": farmer_id,
                "action": "reduce",
                "access_level": "basic",
                "note": "TEST_reduce"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"PASS: Reduce access - {data.get('message')}")
    
    def test_expired_trials(self, admin_token):
        """Test GET /api/admin/access/expired returns expired trials"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/access/expired", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Expired trials - {len(data)} users")
    
    def test_access_logs(self, admin_token):
        """Test GET /api/admin/access/logs returns access logs"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/access/logs", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have logs from our previous tests
        print(f"PASS: Access logs - {len(data)} entries")


class TestUserActivityTracking:
    """Test user activity tracking endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def farmer_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        return response.json().get("access_token")
    
    def test_track_activity(self, farmer_token):
        """Test POST /api/tracking/activity tracks user activity"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/tracking/activity", 
            json={
                "event": "page_view",
                "page": "/test-page",
                "metadata": {"test": True}
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("PASS: Activity tracked successfully")
    
    def test_online_users(self, admin_token, farmer_token):
        """Test GET /api/admin/tracking/users-online returns online users"""
        # First track some activity to ensure there are online users
        headers_farmer = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        requests.post(f"{BASE_URL}/api/tracking/activity", 
            json={"event": "page_view", "page": "/dashboard"},
            headers=headers_farmer
        )
        
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/tracking/users-online", headers=headers_admin)
        assert response.status_code == 200
        data = response.json()
        assert "online_users" in data
        assert "count" in data
        assert isinstance(data["online_users"], list)
        print(f"PASS: Online users - count={data['count']}")
    
    def test_tracking_stats(self, admin_token):
        """Test GET /api/admin/tracking/stats returns tracking statistics"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/tracking/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "today_page_views" in data
        assert "week_page_views" in data
        assert "unique_users_today" in data
        assert "top_pages" in data
        print(f"PASS: Tracking stats - today={data['today_page_views']}, week={data['week_page_views']}")


class TestExitIntentCampaigns:
    """Test exit intent offers and campaigns endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        return response.json().get("access_token")
    
    @pytest.fixture
    def farmer_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        return response.json().get("access_token")
    
    def test_exit_offers(self, farmer_token):
        """Test GET /api/campaigns/exit-offers returns offers"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/campaigns/exit-offers", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "offers" in data
        assert "user_subscription" in data
        assert isinstance(data["offers"], list)
        print(f"PASS: Exit offers - {len(data['offers'])} offers for {data['user_subscription']} user")
    
    def test_claim_offer(self, farmer_token):
        """Test POST /api/campaigns/claim-offer claims an offer"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/campaigns/claim-offer", 
            json={"offer_id": "exit-trial-7"},
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "claim_id" in data
        print(f"PASS: Claim offer - {data.get('message')}")
    
    def test_campaign_stats(self, admin_token):
        """Test GET /api/admin/campaigns/stats returns campaign statistics"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/campaigns/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_claims" in data
        assert "trial_claims" in data
        assert "conversion_rate" in data
        assert "total_users" in data
        assert "paying_users" in data
        print(f"PASS: Campaign stats - conversion={data['conversion_rate']}%, claims={data['total_claims']}")


class TestDatabaseBrowser:
    """Test admin database browser endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam.ai",
            "password": "Admin@2026"
        })
        return response.json().get("access_token")
    
    def test_list_collections(self, admin_token):
        """Test GET /api/admin/database/collections lists all collections"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/collections", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "database" in data
        assert "collections" in data
        assert isinstance(data["collections"], list)
        assert len(data["collections"]) > 0
        # Check expected collections exist
        collection_names = [c["name"] for c in data["collections"]]
        assert "users" in collection_names
        print(f"PASS: Database collections - {len(data['collections'])} collections")
        for c in data["collections"][:5]:
            print(f"  - {c['name']}: {c['count']} docs")
    
    def test_browse_users_collection(self, admin_token):
        """Test GET /api/admin/database/browse/users browses users collection"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/browse/users?skip=0&limit=10", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["collection"] == "users"
        assert "total" in data
        assert "documents" in data
        assert isinstance(data["documents"], list)
        # Verify no _id field (MongoDB ObjectId should be excluded)
        for doc in data["documents"]:
            assert "_id" not in doc
        print(f"PASS: Browse users - {data['total']} total, {len(data['documents'])} shown")
    
    def test_browse_nonexistent_collection(self, admin_token):
        """Test GET /api/admin/database/browse/{nonexistent} returns 404"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/browse/nonexistent_collection", headers=headers)
        assert response.status_code == 404
        print("PASS: Nonexistent collection returns 404")
    
    def test_browse_pagination(self, admin_token):
        """Test database browser pagination"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Get first page
        response1 = requests.get(f"{BASE_URL}/api/admin/database/browse/users?skip=0&limit=5", headers=headers)
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Get second page
        response2 = requests.get(f"{BASE_URL}/api/admin/database/browse/users?skip=5&limit=5", headers=headers)
        assert response2.status_code == 200
        data2 = response2.json()
        
        assert data1["skip"] == 0
        assert data2["skip"] == 5
        print(f"PASS: Pagination - page1={len(data1['documents'])}, page2={len(data2['documents'])}")


class TestAccessControlAuthorization:
    """Test that access control endpoints require admin role"""
    
    @pytest.fixture
    def farmer_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@agricam.ai",
            "password": "Farmer@2026"
        })
        return response.json().get("access_token")
    
    def test_farmer_cannot_access_admin_users(self, farmer_token):
        """Test farmer cannot access GET /api/admin/users"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        # Should return 403 or 401
        assert response.status_code in [401, 403]
        print("PASS: Farmer cannot access admin users (expected)")
    
    def test_farmer_cannot_grant_access(self, farmer_token):
        """Test farmer cannot POST /api/admin/access/grant"""
        headers = {"Authorization": f"Bearer {farmer_token}", "Content-Type": "application/json"}
        response = requests.post(f"{BASE_URL}/api/admin/access/grant", 
            json={"user_id": "test", "access_level": "premium"},
            headers=headers
        )
        assert response.status_code in [401, 403]
        print("PASS: Farmer cannot grant access (expected)")
    
    def test_farmer_cannot_access_database(self, farmer_token):
        """Test farmer cannot access GET /api/admin/database/collections"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/database/collections", headers=headers)
        assert response.status_code in [401, 403]
        print("PASS: Farmer cannot access database browser (expected)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
