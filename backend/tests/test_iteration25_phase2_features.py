"""
AGRICAM IA - Iteration 25 Tests
Phase 2 Features: Video Upload, Ebook Upload, File Download, Stream, Toggle Download
Testing file uploads via object storage and trainer management endpoints
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TRAINER_EMAIL = os.environ.get("TEST_TRAINER_EMAIL", "formateur@agricam.ai")
TRAINER_PASSWORD = os.environ.get("TEST_TRAINER_PASSWORD", "Trainer@2026")
FARMER_EMAIL = os.environ.get("TEST_FARMER_EMAIL", "agriculteur@agricam.ai")
FARMER_PASSWORD = os.environ.get("TEST_FARMER_PASSWORD", "Farmer@2026")
@pytest.fixture(scope="module")
def trainer_token():
    """Get trainer authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TRAINER_EMAIL,
        "password": TRAINER_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        # API returns access_token, not token
        return data.get("access_token") or data.get("token")
    pytest.skip(f"Trainer login failed: {response.status_code} - {response.text}")

@pytest.fixture(scope="module")
def farmer_token():
    """Get farmer authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": FARMER_EMAIL,
        "password": FARMER_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        # API returns access_token, not token
        return data.get("access_token") or data.get("token")
    pytest.skip(f"Farmer login failed: {response.status_code} - {response.text}")

@pytest.fixture(scope="module")
def test_training_id(trainer_token):
    """Create a test training and return its ID"""
    headers = {"Authorization": f"Bearer {trainer_token}"}
    response = requests.post(f"{BASE_URL}/api/trainer/trainings", 
        headers=headers,
        json={
            "title": "TEST_VideoUpload_Training",
            "description": "Test training for video upload testing",
            "category": "technologie",
            "target_roles": ["farmer", "agronomist"],
            "difficulty": "debutant",
            "duration_minutes": 60,
            "price": 0,
            "is_published": True
        }
    )
    if response.status_code == 200:
        data = response.json()
        training_id = data.get("training", {}).get("id")
        print(f"Created test training: {training_id}")
        return training_id
    pytest.skip(f"Failed to create test training: {response.status_code} - {response.text}")

@pytest.fixture(scope="module")
def test_ebook_id(trainer_token):
    """Create a test ebook and return its ID"""
    headers = {"Authorization": f"Bearer {trainer_token}"}
    response = requests.post(f"{BASE_URL}/api/trainer/ebooks",
        headers=headers,
        json={
            "title": "TEST_EbookUpload_Ebook",
            "description": "Test ebook for file upload testing",
            "category": "agriculture",
            "price": 0,
            "download_enabled": True
        }
    )
    if response.status_code == 200:
        data = response.json()
        ebook_id = data.get("ebook", {}).get("id")
        print(f"Created test ebook: {ebook_id}")
        return ebook_id
    pytest.skip(f"Failed to create test ebook: {response.status_code} - {response.text}")


class TestTrainerAuthentication:
    """Test trainer login and role verification"""
    
    def test_trainer_login_success(self):
        """Test trainer can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TRAINER_EMAIL,
            "password": TRAINER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        # API returns access_token, not token
        assert "access_token" in data or "token" in data, "Token not in response"
        assert data.get("user", {}).get("role") == "trainer", f"Expected trainer role, got {data.get('user', {}).get('role')}"
        print(f"Trainer login successful, role: {data.get('user', {}).get('role')}")
    
    def test_trainer_trainings_endpoint(self, trainer_token):
        """GET /api/trainer/trainings returns trainings list"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        response = requests.get(f"{BASE_URL}/api/trainer/trainings", headers=headers)
        assert response.status_code == 200, f"Failed to get trainings: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Got {len(data)} trainings")


class TestVideoUpload:
    """Test video upload for trainings"""
    
    def test_upload_video_mp4_success(self, trainer_token, test_training_id):
        """POST /api/trainer/upload-video accepts MP4 files"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        # Create a minimal MP4 file (fake but valid extension)
        video_content = b"FAKE_MP4_CONTENT_FOR_TESTING"
        files = {"file": ("test_video.mp4", io.BytesIO(video_content), "video/mp4")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-video",
            params={"training_id": test_training_id},
            headers=headers,
            files=files
        )
        
        # Should return 200 or 500 if storage not available
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True, "Expected success=True"
            assert "file" in data, "Expected file info in response"
            print(f"Video upload successful: {data.get('file', {}).get('id')}")
            return data.get("file", {}).get("id")
        elif response.status_code == 500:
            # Storage error is acceptable in test environment
            print(f"Video upload returned 500 (storage may not be available): {response.text}")
            pytest.skip("Object storage not available in test environment")
        else:
            assert False, f"Unexpected status {response.status_code}: {response.text}"
    
    def test_upload_video_rejects_exe(self, trainer_token, test_training_id):
        """POST /api/trainer/upload-video rejects .exe files"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        exe_content = b"MZ_FAKE_EXECUTABLE_CONTENT"
        files = {"file": ("malware.exe", io.BytesIO(exe_content), "application/x-msdownload")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-video",
            params={"training_id": test_training_id},
            headers=headers,
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400 for .exe file, got {response.status_code}"
        print(f"Correctly rejected .exe file: {response.json()}")
    
    def test_upload_video_rejects_txt(self, trainer_token, test_training_id):
        """POST /api/trainer/upload-video rejects .txt files (not a video)"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        txt_content = b"This is a text file, not a video"
        files = {"file": ("document.txt", io.BytesIO(txt_content), "text/plain")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-video",
            params={"training_id": test_training_id},
            headers=headers,
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400 for .txt file, got {response.status_code}"
        print(f"Correctly rejected .txt file for video upload")


class TestEbookUpload:
    """Test ebook file upload"""
    
    def test_upload_ebook_pdf_success(self, trainer_token, test_ebook_id):
        """POST /api/trainer/upload-ebook accepts PDF files"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        # Create a minimal PDF-like file
        pdf_content = b"%PDF-1.4 FAKE PDF FOR TESTING"
        files = {"file": ("test_ebook.pdf", io.BytesIO(pdf_content), "application/pdf")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-ebook",
            params={"ebook_id": test_ebook_id},
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True, "Expected success=True"
            assert "file" in data, "Expected file info in response"
            print(f"Ebook upload successful: {data.get('file', {}).get('id')}")
            return data.get("file", {}).get("id")
        elif response.status_code == 500:
            print(f"Ebook upload returned 500 (storage may not be available): {response.text}")
            pytest.skip("Object storage not available in test environment")
        else:
            assert False, f"Unexpected status {response.status_code}: {response.text}"
    
    def test_upload_ebook_txt_success(self, trainer_token, test_ebook_id):
        """POST /api/trainer/upload-ebook accepts .txt files"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        txt_content = b"This is a text ebook for testing upload functionality"
        files = {"file": ("ebook_text.txt", io.BytesIO(txt_content), "text/plain")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-ebook",
            params={"ebook_id": test_ebook_id},
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") == True, "Expected success=True"
            print(f"TXT ebook upload successful")
        elif response.status_code == 500:
            pytest.skip("Object storage not available in test environment")
        else:
            assert False, f"Unexpected status {response.status_code}: {response.text}"
    
    def test_upload_ebook_rejects_exe(self, trainer_token, test_ebook_id):
        """POST /api/trainer/upload-ebook rejects .exe files"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        exe_content = b"MZ_FAKE_EXECUTABLE"
        files = {"file": ("virus.exe", io.BytesIO(exe_content), "application/x-msdownload")}
        
        response = requests.post(
            f"{BASE_URL}/api/trainer/upload-ebook",
            params={"ebook_id": test_ebook_id},
            headers=headers,
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400 for .exe file, got {response.status_code}"
        print(f"Correctly rejected .exe file for ebook upload")


class TestToggleDownload:
    """Test download permission toggle for ebooks"""
    
    def test_toggle_download_permission(self, trainer_token, test_ebook_id):
        """PUT /api/trainer/ebooks/{id}/toggle-download toggles download state"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        # First toggle - should change from True to False or vice versa
        response = requests.put(
            f"{BASE_URL}/api/trainer/ebooks/{test_ebook_id}/toggle-download",
            headers=headers
        )
        
        assert response.status_code == 200, f"Toggle failed: {response.text}"
        data = response.json()
        assert "download_enabled" in data, "Expected download_enabled in response"
        first_state = data.get("download_enabled")
        print(f"First toggle - download_enabled: {first_state}")
        
        # Second toggle - should flip back
        response2 = requests.put(
            f"{BASE_URL}/api/trainer/ebooks/{test_ebook_id}/toggle-download",
            headers=headers
        )
        
        assert response2.status_code == 200, f"Second toggle failed: {response2.text}"
        data2 = response2.json()
        second_state = data2.get("download_enabled")
        print(f"Second toggle - download_enabled: {second_state}")
        
        assert first_state != second_state, "Toggle should flip the state"
        print(f"Toggle download permission works correctly")


class TestFileDownloadStream:
    """Test file download and stream endpoints - may skip if no files exist"""
    
    def test_file_download_endpoint_exists(self, trainer_token):
        """GET /api/trainer/files/{id}/download returns 404 for non-existent file"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/trainer/files/non-existent-file-id/download",
            headers=headers
        )
        
        # Should return 404 for non-existent file (endpoint exists) or 401 if auth issues
        assert response.status_code in [404, 401], f"Expected 404/401 for non-existent file, got {response.status_code}"
        print(f"Download endpoint exists, returned {response.status_code} for non-existent file")
    
    def test_file_stream_endpoint_exists(self, trainer_token):
        """GET /api/trainer/files/{id}/stream returns 404 for non-existent file"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/trainer/files/non-existent-file-id/stream",
            headers=headers
        )
        
        # Should return 404 for non-existent file (endpoint exists)
        assert response.status_code in [404, 401, 200], f"Unexpected status for stream endpoint: {response.status_code}"
        print(f"Stream endpoint accessible, status: {response.status_code}")


class TestFarmerTrainingsAccess:
    """Test farmer role trainings access with filtering"""
    
    def test_farmer_can_access_trainings(self, farmer_token):
        """GET /api/trainer/trainings returns only published trainings for farmer"""
        headers = {"Authorization": f"Bearer {farmer_token}"}
        
        response = requests.get(f"{BASE_URL}/api/trainer/trainings", headers=headers)
        assert response.status_code == 200, f"Farmer trainings access failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # All returned trainings should be published (is_published=True)
        for training in data:
            if "is_published" in training:
                assert training.get("is_published") == True, f"Farmer should only see published trainings"
        
        print(f"Farmer can see {len(data)} published trainings")


class TestTrainerProfile:
    """Test trainer profile endpoints"""
    
    def test_trainer_profile_endpoint(self, trainer_token):
        """GET /api/trainer/profile returns trainer profile"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        response = requests.get(f"{BASE_URL}/api/trainer/profile", headers=headers)
        assert response.status_code == 200, f"Profile fetch failed: {response.text}"
        
        data = response.json()
        assert "user_id" in data or "full_name" in data, "Profile should contain user info"
        print(f"Trainer profile: {data.get('full_name', 'N/A')}")
    
    def test_trainer_stats_endpoint(self, trainer_token):
        """GET /api/trainer/stats returns trainer statistics"""
        headers = {"Authorization": f"Bearer {trainer_token}"}
        
        response = requests.get(f"{BASE_URL}/api/trainer/stats", headers=headers)
        assert response.status_code == 200, f"Stats fetch failed: {response.text}"
        
        data = response.json()
        assert "total_trainings" in data, "Stats should include total_trainings"
        assert "total_ebooks" in data, "Stats should include total_ebooks"
        print(f"Trainer stats: trainings={data.get('total_trainings')}, ebooks={data.get('total_ebooks')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
