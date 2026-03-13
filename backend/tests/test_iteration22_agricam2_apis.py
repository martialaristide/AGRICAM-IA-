"""
AGRICAM IA 2.0 - Iteration 22 API Tests
Tests for all new route modules: agriscore, digital_twin, predictive, blockchain, epidemiology, supplier_analytics
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CREDENTIALS = {
    "admin": {"email": "admin@agricam.ai", "password": "Admin@2026"},
    "farmer": {"email": "agriculteur@agricam.ai", "password": "Farmer@2026"},
    "bank": {"email": "banque@agricam.ai", "password": "Bank@2026"},
    "supplier": {"email": "fournisseur@agricam.ai", "password": "Supplier@2026"},
    "seed_analyst": {"email": "analyste@agricam.ai", "password": "Analyst@2026"},
    "agronomist": {"email": "agronome@agricam.ai", "password": "Agronomist@2026"},
}

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["admin"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed")

@pytest.fixture(scope="module")
def bank_token(api_client):
    """Get bank/financial user authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["bank"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Bank authentication failed")

@pytest.fixture(scope="module")
def farmer_token(api_client):
    """Get farmer authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["farmer"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Farmer authentication failed")

@pytest.fixture(scope="module")
def supplier_token(api_client):
    """Get supplier authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["supplier"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Supplier authentication failed")

@pytest.fixture(scope="module")
def seed_analyst_token(api_client):
    """Get seed analyst authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["seed_analyst"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Seed analyst authentication failed")

@pytest.fixture(scope="module")
def agronomist_token(api_client):
    """Get agronomist authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=CREDENTIALS["agronomist"])
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Agronomist authentication failed")


# ==============================================================================
# PREDICTIVE MODULE TESTS (Admin Dashboard)
# ==============================================================================

class TestPredictiveAPIs:
    """Tests for /api/predictive/* endpoints - Admin only"""

    def test_platform_health(self, api_client, admin_token):
        """GET /api/predictive/platform-health - returns uptime, CPU, memory data"""
        response = api_client.get(
            f"{BASE_URL}/api/predictive/platform-health",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "uptime_percent" in data
        assert "cpu_load_percent" in data
        assert "memory_usage_percent" in data
        assert "response_time_ms" in data
        assert "total_users" in data
        print(f"Platform health: uptime={data['uptime_percent']}%, CPU={data['cpu_load_percent']}%")

    def test_growth_forecast(self, api_client, admin_token):
        """GET /api/predictive/growth-forecast - returns 6 months forecast"""
        response = api_client.get(
            f"{BASE_URL}/api/predictive/growth-forecast",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "current_users" in data
        assert "forecast" in data
        assert isinstance(data["forecast"], list)
        assert len(data["forecast"]) == 6, "Expected 6 months forecast"
        # Check forecast structure
        for month in data["forecast"]:
            assert "month" in month
            assert "predicted_users" in month
            assert "confidence" in month
        print(f"Growth forecast: current_users={data['current_users']}, 6-month data received")

    def test_security_alerts(self, api_client, admin_token):
        """GET /api/predictive/security-alerts - returns security alerts array"""
        response = api_client.get(
            f"{BASE_URL}/api/predictive/security-alerts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of alerts"
        if len(data) > 0:
            alert = data[0]
            assert "id" in alert
            assert "type" in alert
            assert "severity" in alert
            assert "message" in alert
        print(f"Security alerts: {len(data)} alerts returned")

    def test_ai_insights(self, api_client, admin_token):
        """POST /api/predictive/ai-insights - generates AI insights"""
        response = api_client.post(
            f"{BASE_URL}/api/predictive/ai-insights",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "insights" in data
        assert "model" in data
        print(f"AI insights generated with model: {data['model']}")


# ==============================================================================
# AGRISCORE MODULE TESTS (Bank Dashboard)
# ==============================================================================

class TestAgriScoreAPIs:
    """Tests for /api/agriscore/* endpoints - Bank/Financial role"""

    def test_get_agri_scores_admin(self, api_client, admin_token):
        """GET /api/agriscore/scores - admin can access"""
        response = api_client.get(
            f"{BASE_URL}/api/agriscore/scores",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of scores"
        if len(data) > 0:
            score = data[0]
            assert "farmer_name" in score or "id" in score
            assert "score" in score
            assert "risk_level" in score
        print(f"AgriScores: {len(data)} scores returned")

    def test_get_risk_zones_admin(self, api_client, admin_token):
        """GET /api/agriscore/risk-zones - returns 6 risk zones"""
        response = api_client.get(
            f"{BASE_URL}/api/agriscore/risk-zones",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of zones"
        assert len(data) == 6, f"Expected 6 zones, got {len(data)}"
        for zone in data:
            assert "zone" in zone
            assert "risk_level" in zone
            assert "exposure_percent" in zone
        print(f"Risk zones: {len(data)} zones returned")

    def test_compute_agri_score(self, api_client, admin_token):
        """POST /api/agriscore/compute - computes new AgriScore with AI"""
        payload = {
            "farmer_name": "TEST_Jean Dupont",
            "region": "Centre",
            "crop_type": "Mais",
            "area_ha": 5.0,
            "years_experience": 5,
            "previous_yield": 4.0,
            "loan_amount": 1000000,
            "loan_duration_months": 12
        }
        response = api_client.post(
            f"{BASE_URL}/api/agriscore/compute",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "agriscore" in data
        agriscore = data["agriscore"]
        assert "score" in agriscore
        assert "risk_level" in agriscore
        assert "farmer_name" in agriscore
        print(f"AgriScore computed: score={agriscore['score']}, risk={agriscore['risk_level']}")

    def test_insurance_simulate(self, api_client, admin_token):
        """POST /api/agriscore/insurance-simulate - returns insurance simulation"""
        payload = {
            "farmer_name": "TEST_Marie Farmer",
            "crop_type": "Cacao",
            "area_ha": 3.0,
            "loan_amount": 500000,
            "previous_yield": 3.5
        }
        response = api_client.post(
            f"{BASE_URL}/api/agriscore/insurance-simulate",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "farmer_name" in data
        assert "premium_annual" in data
        assert "coverage_amount" in data
        assert "scenarios" in data
        assert isinstance(data["scenarios"], list)
        print(f"Insurance simulation: premium={data['premium_annual']} XAF, coverage={data['coverage_amount']} XAF")


# ==============================================================================
# DIGITAL TWIN MODULE TESTS (Seed Analyst Dashboard)
# ==============================================================================

class TestDigitalTwinAPIs:
    """Tests for /api/digital-twin/* endpoints"""

    def test_get_simulations(self, api_client, admin_token):
        """GET /api/digital-twin/simulations - returns simulation results"""
        response = api_client.get(
            f"{BASE_URL}/api/digital-twin/simulations",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of simulations"
        if len(data) > 0:
            sim = data[0]
            assert "variety" in sim
            assert "avg_yield" in sim or "scenarios_run" in sim
        print(f"Digital twin simulations: {len(data)} simulations returned")

    def test_run_simulation(self, api_client, admin_token):
        """POST /api/digital-twin/simulate - runs digital twin simulation"""
        payload = {
            "variety": "Mais CAMIR-01",
            "climate_scenario": "tropical_humide",
            "soil_type": "ferralitique",
            "rainfall_mm": 1200,
            "temperature_avg": 26,
            "simulation_years": 3,
            "num_scenarios": 100
        }
        response = api_client.post(
            f"{BASE_URL}/api/digital-twin/simulate",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "simulation" in data
        sim = data["simulation"]
        assert "variety" in sim
        assert "result" in sim
        print(f"Simulation completed: variety={sim['variety']}, model={sim.get('model', 'N/A')}")

    def test_genomic_analysis(self, api_client, admin_token):
        """POST /api/digital-twin/genomic-analysis - runs genomic analysis"""
        payload = {
            "variety": "Mais CAMIR-01",
            "target_trait": "yield"
        }
        response = api_client.post(
            f"{BASE_URL}/api/digital-twin/genomic-analysis",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "analysis" in data
        analysis = data["analysis"]
        assert "genes_analyzed" in analysis or "overall_genetic_score" in analysis
        print(f"Genomic analysis: model={data.get('model', 'N/A')}")

    def test_get_seed_batches(self, api_client, admin_token):
        """GET /api/digital-twin/seed-batches - returns seed batch data"""
        response = api_client.get(
            f"{BASE_URL}/api/digital-twin/seed-batches",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of seed batches"
        if len(data) > 0:
            batch = data[0]
            assert "variety" in batch
            assert "germination" in batch
            assert "status" in batch
        print(f"Seed batches: {len(data)} batches returned")


# ==============================================================================
# BLOCKCHAIN MODULE TESTS (Farmer Traceability)
# ==============================================================================

class TestBlockchainAPIs:
    """Tests for /api/blockchain/* endpoints"""

    def test_get_traced_products(self, api_client, admin_token):
        """GET /api/blockchain/products - returns traced products"""
        response = api_client.get(
            f"{BASE_URL}/api/blockchain/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of products"
        if len(data) > 0:
            product = data[0]
            assert "product_name" in product
            assert "batch_id" in product
        print(f"Traced products: {len(data)} products returned")

    def test_add_trace_entry(self, api_client, admin_token):
        """POST /api/blockchain/trace - adds trace entry"""
        payload = {
            "product_name": "TEST_Mais Bio",
            "action": "planted",
            "location": "Bafoussam, Ouest",
            "details": "Semis de test",
            "quantity_kg": 100
        }
        response = api_client.post(
            f"{BASE_URL}/api/blockchain/trace",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        # Either entry or product created
        assert "entry" in data or "product" in data
        print(f"Trace entry added: batch_id={data.get('batch_id', 'new product created')}")


# ==============================================================================
# EPIDEMIOLOGY MODULE TESTS (Agronomist Dashboard)
# ==============================================================================

class TestEpidemiologyAPIs:
    """Tests for /api/epidemiology/* endpoints"""

    def test_get_disease_alerts(self, api_client, admin_token):
        """GET /api/epidemiology/alerts - returns disease alerts"""
        response = api_client.get(
            f"{BASE_URL}/api/epidemiology/alerts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of alerts"
        if len(data) > 0:
            alert = data[0]
            assert "disease" in alert
            assert "zone" in alert
            assert "risk_percent" in alert
        print(f"Disease alerts: {len(data)} alerts returned")

    def test_predict_disease_spread(self, api_client, admin_token):
        """POST /api/epidemiology/predict-spread - predicts disease spread"""
        payload = {
            "disease_name": "Rouille du mais",
            "region": "Centre",
            "crop_type": "Mais",
            "affected_area_ha": 10,
            "severity": "medium",
            "weather_conditions": "Humide, 28C"
        }
        response = api_client.post(
            f"{BASE_URL}/api/epidemiology/predict-spread",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "prediction" in data
        prediction = data["prediction"]
        assert "current_risk_percent" in prediction
        print(f"Disease spread prediction: risk={prediction['current_risk_percent']}%, model={data.get('model', 'N/A')}")

    def test_generate_intervention_plan(self, api_client, admin_token):
        """POST /api/epidemiology/intervention-plan - generates intervention plan"""
        payload = {
            "disease_name": "Rouille du mais",
            "region": "Centre",
            "crop_type": "Mais",
            "budget_xaf": 500000
        }
        response = api_client.post(
            f"{BASE_URL}/api/epidemiology/intervention-plan",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "success" in data
        assert data["success"] == True
        assert "plan" in data
        plan = data["plan"]
        assert "plan_name" in plan or "phases" in plan
        print(f"Intervention plan generated: model={data.get('model', 'N/A')}")

    def test_get_carbon_tracking(self, api_client, admin_token):
        """GET /api/epidemiology/carbon-tracking - returns carbon data"""
        response = api_client.get(
            f"{BASE_URL}/api/epidemiology/carbon-tracking",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "sequestration_tco2_ha_yr" in data
        assert "biodiversity_index" in data
        assert "practices" in data
        assert isinstance(data["practices"], list)
        print(f"Carbon tracking: sequestration={data['sequestration_tco2_ha_yr']} tCO2/ha/yr")


# ==============================================================================
# SUPPLIER ANALYTICS MODULE TESTS (Supplier Dashboard)
# ==============================================================================

class TestSupplierAnalyticsAPIs:
    """Tests for /api/supplier-analytics/* endpoints"""

    def test_get_demand_forecast(self, api_client, admin_token):
        """GET /api/supplier-analytics/demand-forecast - returns demand forecast"""
        response = api_client.get(
            f"{BASE_URL}/api/supplier-analytics/demand-forecast",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of forecasts"
        if len(data) > 0:
            forecast = data[0]
            assert "product" in forecast
            assert "current_stock" in forecast
            assert "monthly_demand" in forecast
        print(f"Demand forecast: {len(data)} products forecasted")

    def test_get_logistics_optimization(self, api_client, admin_token):
        """GET /api/supplier-analytics/logistics-optimization - returns logistics data"""
        response = api_client.get(
            f"{BASE_URL}/api/supplier-analytics/logistics-optimization",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "active_deliveries" in data
        assert "on_time_rate_percent" in data
        assert "routes" in data
        assert isinstance(data["routes"], list)
        print(f"Logistics: {data['active_deliveries']} active deliveries, {data['on_time_rate_percent']}% on time")

    def test_get_inventory_alerts(self, api_client, admin_token):
        """GET /api/supplier-analytics/inventory-alerts - returns inventory alerts"""
        response = api_client.get(
            f"{BASE_URL}/api/supplier-analytics/inventory-alerts",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert isinstance(data, list), "Expected array of alerts"
        if len(data) > 0:
            alert = data[0]
            assert "product" in alert
            assert "current_stock" in alert
            assert "severity" in alert
        print(f"Inventory alerts: {len(data)} alerts returned")

    def test_get_revenue_analytics(self, api_client, admin_token):
        """GET /api/supplier-analytics/revenue-analytics - returns revenue data"""
        response = api_client.get(
            f"{BASE_URL}/api/supplier-analytics/revenue-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        # Data assertions
        assert "total_revenue_xaf" in data
        assert "monthly_revenue" in data
        assert "top_products" in data
        assert isinstance(data["monthly_revenue"], list)
        print(f"Revenue analytics: total={data['total_revenue_xaf']} XAF")


# ==============================================================================
# AUTHENTICATION & ROLE TESTS
# ==============================================================================

class TestRoleBasedAccess:
    """Test role-based access control for different user types"""

    def test_admin_can_access_all(self, api_client, admin_token):
        """Admin role should have access to all endpoints"""
        # Check predictive (admin-only)
        response = api_client.get(
            f"{BASE_URL}/api/predictive/platform-health",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, "Admin should access predictive APIs"
        
        # Check agriscore (financial role)
        response = api_client.get(
            f"{BASE_URL}/api/agriscore/scores",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, "Admin should access agriscore APIs"
        print("Admin access: All APIs accessible")

    def test_farmer_cannot_access_admin_apis(self, api_client, farmer_token):
        """Farmer role should not have access to admin-only endpoints"""
        response = api_client.get(
            f"{BASE_URL}/api/predictive/platform-health",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        # Should be 403 Forbidden
        assert response.status_code == 403, f"Farmer should not access admin APIs, got {response.status_code}"
        print("Farmer access: Correctly denied admin APIs")

    def test_farmer_can_access_blockchain(self, api_client, farmer_token):
        """Farmer role should have access to blockchain APIs"""
        response = api_client.get(
            f"{BASE_URL}/api/blockchain/products",
            headers={"Authorization": f"Bearer {farmer_token}"}
        )
        assert response.status_code == 200, f"Farmer should access blockchain APIs, got {response.status_code}"
        print("Farmer access: Blockchain APIs accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
