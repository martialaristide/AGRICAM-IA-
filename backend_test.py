#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class AgricamAPITester:
    def __init__(self, base_url="https://agricam-ia.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.results = {}

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response: Dict with keys: {list(response_data.keys())[:5]}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            self.results[name] = {
                'success': success,
                'status_code': response.status_code,
                'endpoint': endpoint
            }
            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            self.results[name] = {
                'success': False,
                'error': str(e),
                'endpoint': endpoint
            }
            return False, {}

    def test_dashboard_endpoints(self):
        """Test dashboard related endpoints"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD ENDPOINTS")
        print("="*50)
        
        self.run_test("Dashboard Stats", "GET", "dashboard/stats")

    def test_parcels_endpoints(self):
        """Test parcels related endpoints"""
        print("\n" + "="*50)
        print("TESTING PARCELS ENDPOINTS")
        print("="*50)
        
        success, parcels = self.run_test("Get Parcels", "GET", "parcels")
        
        if success and parcels:
            # Test getting specific parcel
            parcel_id = parcels[0].get('id') if parcels else None
            if parcel_id:
                self.run_test("Get Specific Parcel", "GET", f"parcels/{parcel_id}")

    def test_sensors_endpoints(self):
        """Test sensors related endpoints"""
        print("\n" + "="*50)
        print("TESTING SENSORS ENDPOINTS")
        print("="*50)
        
        self.run_test("Get Sensors", "GET", "sensors")
        self.run_test("Get Sensors Stats", "GET", "sensors/stats")

    def test_drone_endpoints(self):
        """Test drone missions related endpoints"""
        print("\n" + "="*50)
        print("TESTING DRONE MISSIONS ENDPOINTS")
        print("="*50)
        
        success, missions = self.run_test("Get Drone Missions", "GET", "drone-missions")
        self.run_test("Get Drone Stats", "GET", "drone-missions/stats")
        
        if success and missions:
            # Test drone control
            mission_id = missions[0].get('id') if missions else None
            if mission_id:
                self.run_test("Control Drone Mission", "PUT", f"drone-missions/{mission_id}/control", 
                            params={'action': 'start'})

    def test_aerial_images_endpoints(self):
        """Test aerial images related endpoints"""
        print("\n" + "="*50)
        print("TESTING AERIAL IMAGES ENDPOINTS")
        print("="*50)
        
        self.run_test("Get Aerial Images", "GET", "aerial-images")
        self.run_test("Get Aerial Images Stats", "GET", "aerial-images/stats")

    def test_image_analysis_endpoints(self):
        """Test image analysis related endpoints"""
        print("\n" + "="*50)
        print("TESTING IMAGE ANALYSIS ENDPOINTS")
        print("="*50)
        
        self.run_test("Get Image Analyses", "GET", "image-analysis")
        self.run_test("Get Image Analysis Stats", "GET", "image-analysis/stats")

    def test_irrigation_endpoints(self):
        """Test irrigation related endpoints"""
        print("\n" + "="*50)
        print("TESTING IRRIGATION ENDPOINTS")
        print("="*50)
        
        success, systems = self.run_test("Get Irrigation Systems", "GET", "irrigation")
        self.run_test("Get Irrigation Stats", "GET", "irrigation/stats")
        
        if success and systems:
            # Test irrigation control
            system_id = systems[0].get('id') if systems else None
            if system_id:
                self.run_test("Control Irrigation", "PUT", f"irrigation/{system_id}/control", 
                            params={'action': 'pause'})

    def test_recommendations_endpoints(self):
        """Test recommendations related endpoints"""
        print("\n" + "="*50)
        print("TESTING RECOMMENDATIONS ENDPOINTS")
        print("="*50)
        
        success, recs = self.run_test("Get Recommendations", "GET", "recommendations")
        self.run_test("Get Recommendations Stats", "GET", "recommendations/stats")
        
        if success and recs:
            # Test recommendation action
            rec_id = recs[0].get('id') if recs else None
            if rec_id:
                self.run_test("Update Recommendation Status", "PUT", f"recommendations/{rec_id}/action", 
                            params={'action': 'apply'})

    def test_marketplace_endpoints(self):
        """Test marketplace related endpoints"""
        print("\n" + "="*50)
        print("TESTING MARKETPLACE ENDPOINTS")
        print("="*50)
        
        self.run_test("Get Marketplace Products", "GET", "marketplace/products")

    def test_alerts_endpoints(self):
        """Test alerts related endpoints"""
        print("\n" + "="*50)
        print("TESTING ALERTS ENDPOINTS")
        print("="*50)
        
        self.run_test("Get All Alerts", "GET", "alerts")
        self.run_test("Get Unread Alerts", "GET", "alerts", params={'unread_only': True})

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AGRICAM IA API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"API Base: {self.api_base}")
        
        # Test root endpoint
        self.run_test("API Root", "GET", "")
        
        # Test all modules
        self.test_dashboard_endpoints()
        self.test_parcels_endpoints()
        self.test_sensors_endpoints()
        self.test_drone_endpoints()
        self.test_aerial_images_endpoints()
        self.test_image_analysis_endpoints()
        self.test_irrigation_endpoints()
        self.test_recommendations_endpoints()
        self.test_marketplace_endpoints()
        self.test_alerts_endpoints()
        
        # Print final results
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"📊 Tests run: {self.tests_run}")
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {len(self.failed_tests)}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   • {test['name']}: {test.get('error', f'Status {test.get(\"actual\", \"unknown\")}')}")
        
        print("\n🎯 ENDPOINT COVERAGE:")
        for name, result in self.results.items():
            status = "✅" if result['success'] else "❌"
            print(f"   {status} {name}")

def main():
    tester = AgricamAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())