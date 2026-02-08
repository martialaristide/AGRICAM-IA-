"""
Test suite for AGRICAM IA P0/P1 Features:
- AI Recommendations Generation
- SMS Alerts (Orange/MTN Cameroon simulation)
- Export Reports (PDF/Word/CSV)
- E-Learning Module (courses, enrollment, certificates)
- Multilingual Support (15 languages including Cameroonian)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    """Basic health check"""
    
    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")


class TestAuthentication:
    """Authentication tests for getting tokens"""
    
    @pytest.fixture
    def farmer_token(self):
        """Get farmer authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Farmer login failed")
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam-ia.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_farmer_login(self):
        """Test farmer login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "farmer"
        print("✓ Farmer login successful")
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@agricam-ia.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print("✓ Admin login successful")


class TestAIRecommendations:
    """Test AI Recommendations Generation (P0)"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_generate_ai_recommendations(self, auth_headers):
        """Test POST /api/ai/generate-recommendations"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-recommendations",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "generated" in data
        assert "recommendations" in data
        assert "message" in data
        assert isinstance(data["recommendations"], list)
        
        # If recommendations generated, verify structure
        if data["recommendations"]:
            rec = data["recommendations"][0]
            assert "id" in rec
            assert "type" in rec
            assert "priority" in rec
            assert "title" in rec
            assert "message" in rec
            assert "confidence_percent" in rec
            assert rec["source"] == "agricam_ai_agent"
        
        print(f"✓ AI Recommendations generated: {data['generated']} recommendations")


class TestSMSAlerts:
    """Test SMS Alerts (P0) - Orange/MTN Cameroon simulation"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_send_sms_alert(self, auth_headers):
        """Test POST /api/sms/send - Send SMS (simulated)"""
        response = requests.post(
            f"{BASE_URL}/api/sms/send",
            headers=auth_headers,
            json={
                "phone_number": "+237699123456",
                "message": "Test SMS from AGRICAM IA - Alerte irrigation"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "success" in data
        assert data["success"] == True
        assert "sms_id" in data
        assert "network" in data
        assert data["network"] in ["Orange Cameroun", "MTN Cameroun"]
        
        print(f"✓ SMS sent successfully via {data['network']} (simulated)")
    
    def test_send_sms_mtn_network(self, auth_headers):
        """Test SMS to MTN number (65x prefix)"""
        response = requests.post(
            f"{BASE_URL}/api/sms/send",
            headers=auth_headers,
            json={
                "phone_number": "+237650123456",
                "message": "Test MTN SMS"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["network"] == "MTN Cameroun"
        print("✓ MTN network detection working")
    
    def test_send_sms_orange_network(self, auth_headers):
        """Test SMS to Orange number (69x prefix)"""
        response = requests.post(
            f"{BASE_URL}/api/sms/send",
            headers=auth_headers,
            json={
                "phone_number": "+237699123456",
                "message": "Test Orange SMS"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["network"] == "Orange Cameroun"
        print("✓ Orange network detection working")
    
    def test_get_sms_history(self, auth_headers):
        """Test GET /api/sms/history"""
        response = requests.get(
            f"{BASE_URL}/api/sms/history",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "logs" in data
        assert "total_sent" in data
        assert "total_cost_xaf" in data
        assert isinstance(data["logs"], list)
        
        print(f"✓ SMS history retrieved: {data['total_sent']} messages, {data['total_cost_xaf']} XAF total")


class TestExportReports:
    """Test Export Reports (P0) - PDF/Word/CSV"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_export_parcels_report_pdf(self, auth_headers):
        """Test GET /api/export/report/parcels?format=pdf"""
        response = requests.get(
            f"{BASE_URL}/api/export/report/parcels?format=pdf",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "report" in data
        assert "format" in data
        assert data["format"] == "pdf"
        assert "filename" in data
        assert "parcels" in data["filename"]
        
        # Verify report content
        report = data["report"]
        assert "title" in report
        assert "data" in report
        assert report["platform"] == "AGRICAM IA"
        
        print("✓ Parcels PDF export working")
    
    def test_export_sensors_report_word(self, auth_headers):
        """Test GET /api/export/report/sensors?format=word"""
        response = requests.get(
            f"{BASE_URL}/api/export/report/sensors?format=word",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["format"] == "word"
        assert "sensors" in data["filename"]
        print("✓ Sensors Word export working")
    
    def test_export_analytics_report(self, auth_headers):
        """Test GET /api/export/report/analytics"""
        response = requests.get(
            f"{BASE_URL}/api/export/report/analytics?format=pdf",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify analytics data structure
        report = data["report"]
        analytics_data = report["data"]
        
        assert "total_parcels" in analytics_data
        assert "total_area_hectares" in analytics_data
        assert "average_humidity" in analytics_data
        assert "active_sensors" in analytics_data
        
        print(f"✓ Analytics export: {analytics_data['total_parcels']} parcels, {analytics_data['total_area_hectares']} ha")
    
    def test_export_parcels_csv(self, auth_headers):
        """Test GET /api/export/report/parcels?format=csv"""
        response = requests.get(
            f"{BASE_URL}/api/export/report/parcels?format=csv",
            headers=auth_headers
        )
        # CSV returns streaming response
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        print("✓ Parcels CSV export working")


class TestELearning:
    """Test E-Learning Module (P1) - Courses, Enrollment, Certificates"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authenticated headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "agriculteur@demo.com",
            "password": "farmer123"
        })
        if response.status_code == 200:
            token = response.json()["access_token"]
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Authentication failed")
    
    def test_get_courses(self, auth_headers):
        """Test GET /api/learning/courses - List 3 courses"""
        response = requests.get(
            f"{BASE_URL}/api/learning/courses",
            headers=auth_headers
        )
        assert response.status_code == 200
        courses = response.json()
        
        # Verify 3 courses exist
        assert isinstance(courses, list)
        assert len(courses) >= 3, f"Expected at least 3 courses, got {len(courses)}"
        
        # Verify course structure
        for course in courses:
            assert "id" in course
            assert "title" in course
            assert "description" in course
            assert "level" in course
            assert "duration_hours" in course
            assert "modules" in course
            assert "certificate_available" in course
        
        # Verify expected courses
        titles = [c["title"] for c in courses]
        assert any("Agriculture de Précision" in t for t in titles)
        assert any("Irrigation" in t for t in titles)
        assert any("Maladies" in t or "Détection" in t for t in titles)
        
        # Verify levels (Débutant, Intermédiaire, Avancé)
        levels = [c["level"] for c in courses]
        assert "debutant" in levels
        assert "intermediaire" in levels
        assert "avance" in levels
        
        print(f"✓ E-Learning courses: {len(courses)} courses available")
        for c in courses:
            print(f"  - {c['title']} ({c['level']}, {c['duration_hours']}h)")
    
    def test_enroll_course(self, auth_headers):
        """Test POST /api/learning/enroll/{course_id}"""
        # First get courses
        courses_response = requests.get(
            f"{BASE_URL}/api/learning/courses",
            headers=auth_headers
        )
        courses = courses_response.json()
        course_id = courses[0]["id"]
        
        # Enroll in course
        response = requests.post(
            f"{BASE_URL}/api/learning/enroll/{course_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify enrollment
        assert "success" in data
        assert data["success"] == True
        assert "enrollment_id" in data
        
        print(f"✓ Enrolled in course: {courses[0]['title']}")
    
    def test_get_my_courses(self, auth_headers):
        """Test GET /api/learning/my-courses"""
        response = requests.get(
            f"{BASE_URL}/api/learning/my-courses",
            headers=auth_headers
        )
        assert response.status_code == 200
        enrollments = response.json()
        
        assert isinstance(enrollments, list)
        
        # If enrolled, verify structure
        if enrollments:
            enrollment = enrollments[0]
            assert "course_id" in enrollment
            assert "progress_percent" in enrollment
            assert "completed_modules" in enrollment
            
            # Verify initial progress is 0%
            print(f"✓ My courses: {len(enrollments)} enrollments")
            for e in enrollments:
                print(f"  - Course {e['course_id']}: {e['progress_percent']}% complete")
        else:
            print("✓ My courses: No enrollments yet")
    
    def test_complete_module(self, auth_headers):
        """Test POST /api/learning/complete-module"""
        # First get courses and enroll
        courses_response = requests.get(
            f"{BASE_URL}/api/learning/courses",
            headers=auth_headers
        )
        courses = courses_response.json()
        course_id = courses[0]["id"]
        
        # Enroll first
        requests.post(
            f"{BASE_URL}/api/learning/enroll/{course_id}",
            headers=auth_headers
        )
        
        # Complete first module
        response = requests.post(
            f"{BASE_URL}/api/learning/complete-module",
            headers=auth_headers,
            data={
                "course_id": course_id,
                "module_index": 0
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "progress_percent" in data
        assert "completed_modules" in data
        assert data["progress_percent"] > 0
        assert 0 in data["completed_modules"]
        
        print(f"✓ Module completed, progress: {data['progress_percent']}%")


class TestMultilingual:
    """Test Multilingual Support (P1) - 15 languages including Cameroonian"""
    
    def test_get_languages(self):
        """Test GET /api/languages - List 15 languages"""
        response = requests.get(f"{BASE_URL}/api/languages")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "languages" in data
        assert "default" in data
        assert "cameroonian" in data
        
        languages = data["languages"]
        
        # Verify 15 languages
        assert len(languages) >= 15, f"Expected 15 languages, got {len(languages)}"
        
        # Verify required languages
        required_langs = ["fr", "en", "fulbe", "bassa", "douala", "ewondo", "bulu", "ghomala", "fe_fe", "bamoun"]
        for lang in required_langs:
            assert lang in languages, f"Missing language: {lang}"
        
        # Verify Cameroonian languages
        cameroonian = data["cameroonian"]
        assert len(cameroonian) >= 8, f"Expected 8 Cameroonian languages, got {len(cameroonian)}"
        
        print(f"✓ Languages available: {len(languages)}")
        print(f"  - Cameroonian languages: {', '.join(cameroonian)}")
    
    def test_get_french_translations(self):
        """Test GET /api/translations/fr"""
        response = requests.get(f"{BASE_URL}/api/translations/fr")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "fr"
        assert "translations" in data
        assert data["direction"] == "ltr"
        
        translations = data["translations"]
        assert "welcome" in translations
        assert "dashboard" in translations
        assert "parcels" in translations
        
        print(f"✓ French translations: {len(translations)} keys")
    
    def test_get_english_translations(self):
        """Test GET /api/translations/en"""
        response = requests.get(f"{BASE_URL}/api/translations/en")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "en"
        assert data["translations"]["welcome"] == "Welcome to AGRICAM IA"
        
        print("✓ English translations working")
    
    def test_get_ewondo_translations(self):
        """Test GET /api/translations/ewondo - Cameroonian language"""
        response = requests.get(f"{BASE_URL}/api/translations/ewondo")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "ewondo"
        assert "translations" in data
        assert data["translations"]["welcome"] == "Mbolo e AGRICAM IA"
        
        print("✓ Ewondo (Cameroonian) translations working")
    
    def test_get_fulbe_translations(self):
        """Test GET /api/translations/fulbe - Cameroonian language"""
        response = requests.get(f"{BASE_URL}/api/translations/fulbe")
        assert response.status_code == 200
        data = response.json()
        
        assert data["language"] == "fulbe"
        assert data["translations"]["welcome"] == "Bisimilla e AGRICAM IA"
        
        print("✓ Fulbe (Cameroonian) translations working")
    
    def test_fallback_to_french(self):
        """Test fallback to French for unknown language"""
        response = requests.get(f"{BASE_URL}/api/translations/unknown_lang")
        assert response.status_code == 200
        data = response.json()
        
        # Should fallback to French
        assert data["translations"]["welcome"] == "Bienvenue sur AGRICAM IA"
        
        print("✓ Language fallback to French working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
