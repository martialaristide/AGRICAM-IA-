"""
AGRICAM IA - Digital Twin API Tests (Iteration 32)
Tests for seed analysis module: batches, genomic, crossing, climate, export
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ANALYST_EMAIL = os.environ.get("TEST_ANALYST_EMAIL", "analyste@agricam.ai")
ANALYST_PASSWORD = os.environ.get("TEST_ANALYST_PASSWORD", "Analyst@2026")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@agricam.ai")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "Admin@2026")
@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for seed analyst"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ANALYST_EMAIL,
        "password": ANALYST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    # Try admin if analyst fails
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token") or data.get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def api_client(auth_token):
    """Session with auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestSeedBatches:
    """Tests for seed batch CRUD operations"""
    
    def test_get_seed_batches(self, api_client):
        """GET /api/digital-twin/seed-batches returns list of batches"""
        response = api_client.get(f"{BASE_URL}/api/digital-twin/seed-batches")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Check structure of first batch (default data or created)
        if len(data) > 0:
            batch = data[0]
            assert "id" in batch, "Batch should have id"
            assert "variety" in batch, "Batch should have variety"
            assert "status" in batch, "Batch should have status"
            print(f"✓ GET seed-batches: {len(data)} batches found")
    
    def test_create_seed_batch(self, api_client):
        """POST /api/digital-twin/seed-batches creates a new batch"""
        payload = {
            "variety": "TEST_Mais_Hybrid_001",
            "origin": "IRAD Test Lab",
            "quantity_kg": 250,
            "germination": 92,
            "purity": 97.5,
            "moisture": 10.5,
            "notes": "Test batch for iteration 32"
        }
        
        response = api_client.post(f"{BASE_URL}/api/digital-twin/seed-batches", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "batch" in data, "Response should contain batch object"
        
        batch = data["batch"]
        assert "id" in batch, "Created batch should have id"
        assert batch["variety"] == payload["variety"], "Variety should match"
        assert batch["origin"] == payload["origin"], "Origin should match"
        assert batch["status"] == "pending", "New batch should have pending status"
        
        print(f"✓ POST seed-batches: Created batch {batch['id']}")
        return batch["id"]
    
    def test_update_batch_status(self, api_client):
        """PUT /api/digital-twin/seed-batches/{id}/status updates batch status"""
        # First create a batch
        create_response = api_client.post(f"{BASE_URL}/api/digital-twin/seed-batches", json={
            "variety": "TEST_Status_Update",
            "origin": "Test Origin",
            "quantity_kg": 100,
            "germination": 90,
            "purity": 95,
            "moisture": 11
        })
        assert create_response.status_code == 200
        batch_id = create_response.json()["batch"]["id"]
        
        # Update status to certified
        response = api_client.put(f"{BASE_URL}/api/digital-twin/seed-batches/{batch_id}/status?status=certified")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert data.get("new_status") == "certified", "New status should be certified"
        
        print(f"✓ PUT seed-batches/{batch_id}/status: Updated to certified")


class TestGenomicAnalysis:
    """Tests for genomic analysis endpoint"""
    
    def test_genomic_analysis(self, api_client):
        """POST /api/digital-twin/genomic-analysis returns gene analysis with confidence"""
        payload = {
            "variety": "Mais CAMIR-01",
            "target_trait": "yield"
        }
        
        response = api_client.post(f"{BASE_URL}/api/digital-twin/genomic-analysis", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "analysis" in data, "Response should contain analysis"
        
        analysis = data["analysis"]
        # Check for confidence score
        assert "confidence" in analysis or "overall_genetic_score" in analysis, "Analysis should have confidence/score"
        # Check for genes analyzed
        assert "genes_analyzed" in analysis, "Analysis should have genes_analyzed"
        assert isinstance(analysis["genes_analyzed"], list), "genes_analyzed should be a list"
        
        confidence = analysis.get("confidence") or analysis.get("overall_genetic_score")
        print(f"✓ POST genomic-analysis: Confidence score {confidence}%")


class TestCrossingSimulation:
    """Tests for crossing simulation endpoint"""
    
    def test_crossing_simulation(self, api_client):
        """POST /api/digital-twin/crossing-simulation returns crossing result with confidence"""
        payload = {
            "parent1": "Mais CAMIR-01",
            "parent2": "Mais DT-STR",
            "target_traits": ["yield", "disease_resistance"],
            "generations": 3
        }
        
        # AI endpoint may take longer
        response = api_client.post(f"{BASE_URL}/api/digital-twin/crossing-simulation", json=payload, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "crossing" in data, "Response should contain crossing result"
        
        crossing = data["crossing"]
        assert "result" in crossing, "Crossing should have result"
        
        result = crossing["result"]
        assert "confidence" in result, "Result should have confidence score"
        assert "offspring_id" in result, "Result should have offspring_id"
        assert "generations" in result, "Result should have generations"
        assert "final_variety" in result, "Result should have final_variety"
        
        print(f"✓ POST crossing-simulation: Offspring {result['offspring_id']}, Confidence {result['confidence']}%")


class TestClimateAdaptation:
    """Tests for climate adaptation endpoint"""
    
    def test_climate_adaptation(self, api_client):
        """POST /api/digital-twin/climate-adaptation returns adaptation evaluation with projections"""
        payload = {
            "variety": "Mais CAMIR-01",
            "region": "Centre Cameroun",
            "scenario": "RCP4.5",
            "projection_years": [2030, 2040, 2050]
        }
        
        # AI endpoint may take longer
        response = api_client.post(f"{BASE_URL}/api/digital-twin/climate-adaptation", json=payload, timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "adaptation" in data, "Response should contain adaptation result"
        
        adaptation = data["adaptation"]
        assert "confidence" in adaptation, "Adaptation should have confidence score"
        assert "projections" in adaptation, "Adaptation should have projections"
        assert isinstance(adaptation["projections"], list), "Projections should be a list"
        assert "current_score" in adaptation, "Adaptation should have current_score"
        assert "overall_risk" in adaptation, "Adaptation should have overall_risk"
        
        print(f"✓ POST climate-adaptation: Current score {adaptation['current_score']}, Risk {adaptation['overall_risk']}")


class TestExport:
    """Tests for export endpoint"""
    
    def test_export_csv(self, api_client):
        """GET /api/digital-twin/export/csv returns CSV file download"""
        response = api_client.get(f"{BASE_URL}/api/digital-twin/export/csv?variety=Mais%20CAMIR-01")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "text/csv" in content_type, f"Expected text/csv, got {content_type}"
        
        # Check content disposition
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, "Should have attachment disposition"
        
        # Check CSV content
        content = response.text
        assert "Variete" in content or "variete" in content.lower(), "CSV should have Variete column"
        
        print(f"✓ GET export/csv: Downloaded CSV ({len(content)} bytes)")
    
    def test_export_json(self, api_client):
        """GET /api/digital-twin/export/json returns JSON file download"""
        response = api_client.get(f"{BASE_URL}/api/digital-twin/export/json?variety=Mais%20CAMIR-01")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "application/json" in content_type, f"Expected application/json, got {content_type}"
        
        # Check JSON content
        data = response.json()
        assert "variete" in data, "JSON should have variete field"
        
        print(f"✓ GET export/json: Downloaded JSON")


class TestSimulations:
    """Tests for simulations endpoint"""
    
    def test_get_simulations(self, api_client):
        """GET /api/digital-twin/simulations returns list of simulations"""
        response = api_client.get(f"{BASE_URL}/api/digital-twin/simulations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            sim = data[0]
            assert "variety" in sim, "Simulation should have variety"
            assert "resilience_score" in sim, "Simulation should have resilience_score"
        
        print(f"✓ GET simulations: {len(data)} simulations found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
