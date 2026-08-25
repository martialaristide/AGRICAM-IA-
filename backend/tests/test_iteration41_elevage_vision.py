"""Iteration 41 — Élevage IA: caméras/YOLO, VitaBif LoRa, épidémiologie, multilingue WhatsApp,
surveillance continue, dataset YOLO. Endpoints: /api/elevage/vision/*, /vitabif/*, /epidemiology/*,
/cameras/monitoring, /settings, /simulate."""
import base64
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
ADMIN = {"email": "admin@agricam.ai", "password": "Admin@2026"}
BUS_JPG = "https://raw.githubusercontent.com/ultralytics/ultralytics/main/ultralytics/assets/bus.jpg"

state = {}


@pytest.fixture(scope="module")
def hdr():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text[:300]}"
    token = r.json().get("access_token") or r.json().get("token")
    assert token
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def farm_id(hdr):
    r = requests.get(f"{BASE_URL}/api/elevage/farms", headers=hdr, timeout=30)
    assert r.status_code == 200, r.text[:300]
    farms = r.json()
    if isinstance(farms, dict):
        farms = farms.get("farms") or []
    assert farms, "No farms for admin"
    return farms[0]["id"]


@pytest.fixture(scope="module")
def bus_b64():
    r = requests.get(BUS_JPG, timeout=60)
    assert r.status_code == 200, "Could not download bus.jpg fixture"
    return base64.b64encode(r.content).decode()


# === Caméras + YOLO ===
class TestVisionCameras:
    def test_vision_engine(self, hdr):
        r = requests.get(f"{BASE_URL}/api/elevage/vision/engine", headers=hdr, timeout=120)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["yolo_available"] is True, f"YOLO unavailable: {d}"
        assert "yolov8n" in (d.get("model") or ""), d
        assert d.get("fallback") == "gemini-2.5-flash"
        assert "cow" in d.get("mapped_classes", {})

    def test_create_camera(self, hdr, farm_id):
        payload = {"farm_id": farm_id, "name": "TEST_Cam_Etable", "camera_type": "rgb",
                   "stream_url": "rtsp://192.168.1.240:554/stream1", "position": "Étable nord"}
        r = requests.post(f"{BASE_URL}/api/elevage/cameras", json=payload, headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        cam = r.json()["camera"]
        assert cam["name"] == "TEST_Cam_Etable"
        assert cam["stream_url"] == payload["stream_url"]
        assert cam["status"] == "configured"
        assert "_id" not in cam
        state["camera_id"] = cam["id"]

    def test_create_camera_invalid_farm(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/cameras",
                          json={"farm_id": "does-not-exist", "name": "TEST_X",
                                "stream_url": "rtsp://1.2.3.4/s"}, headers=hdr, timeout=30)
        assert r.status_code == 404, r.status_code

    def test_list_cameras_contains_created(self, hdr):
        r = requests.get(f"{BASE_URL}/api/elevage/cameras", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        cams = r.json()["cameras"]
        assert r.json()["count"] == len(cams)
        assert state["camera_id"] in [c["id"] for c in cams]

    def test_detect_frame_real_image(self, hdr, bus_b64, farm_id):
        r = requests.post(f"{BASE_URL}/api/elevage/vision/detect-frame",
                          json={"image_base64": bus_b64, "farm_id": farm_id}, headers=hdr, timeout=180)
        assert r.status_code == 200, r.text[:300]
        res = r.json()["result"]
        assert res["engine"] == "yolov8n", res
        assert res["human_detected"] is True, f"expected persons on bus.jpg: {res}"
        assert res["counts"].get("humain", 0) >= 3, res["counts"]
        assert res["annotated_image"] and res["annotated_image"].startswith("data:image/jpeg;base64,")
        assert len(res["detections"]) > 0
        assert all(len(d["bbox"]) == 4 for d in res["detections"])

    def test_detect_frame_invalid_image(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/vision/detect-frame",
                          json={"image_base64": base64.b64encode(b"not-an-image").decode()},
                          headers=hdr, timeout=60)
        assert r.status_code in (400, 422), f"{r.status_code} {r.text[:200]}"

    def test_delete_camera(self, hdr):
        r = requests.delete(f"{BASE_URL}/api/elevage/cameras/{state['camera_id']}", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["success"] is True
        r2 = requests.get(f"{BASE_URL}/api/elevage/cameras", headers=hdr, timeout=30)
        assert state["camera_id"] not in [c["id"] for c in r2.json()["cameras"]]
        r3 = requests.delete(f"{BASE_URL}/api/elevage/cameras/{state['camera_id']}", headers=hdr, timeout=30)
        assert r3.status_code == 404


# === VitaBif (passerelle LoRa) ===
class TestVitaBif:
    def test_gateway_key(self, hdr, farm_id):
        r = requests.post(f"{BASE_URL}/api/elevage/farms/{farm_id}/gateway", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["gateway_key"].startswith("vb_")
        assert d["endpoint"] == "/api/elevage/vitabif/ingest"
        assert d["payload_example"]["farm_id"] == farm_id
        assert "packets" in d["payload_example"]
        state["gw"] = d["gateway_key"]

    def test_gateway_key_idempotent(self, hdr, farm_id):
        r = requests.post(f"{BASE_URL}/api/elevage/farms/{farm_id}/gateway", headers=hdr, timeout=30)
        assert r.status_code == 200
        assert r.json()["gateway_key"] == state["gw"]

    def test_ingest_bad_key(self, farm_id):
        r = requests.post(f"{BASE_URL}/api/elevage/vitabif/ingest",
                          json={"farm_id": farm_id, "gateway_id": "GW-TEST", "packets": []},
                          headers={"X-Gateway-Key": "vb_wrong_key"}, timeout=30)
        assert r.status_code == 401, f"{r.status_code} {r.text[:200]}"

    def test_ingest_no_key(self, farm_id):
        r = requests.post(f"{BASE_URL}/api/elevage/vitabif/ingest",
                          json={"farm_id": farm_id, "gateway_id": "GW-TEST", "packets": []}, timeout=30)
        assert r.status_code == 401

    def test_ingest_valid_creates_alerts(self, farm_id):
        payload = {
            "farm_id": farm_id, "gateway_id": "GW-TEST-01",
            "packets": [{"device_id": "TEST_VB-900", "animal_tag": "TEST_BV-900",
                         "heart_rate_bpm": 72, "body_temp_c": 40.5, "activity": "rumination",
                         "perimeter_status": "outside", "battery_pct": 77}],
            "probe": {"water_ph": 6.8, "water_turbidity": 12.5, "feed_humidity_pct": 14.2},
        }
        r = requests.post(f"{BASE_URL}/api/elevage/vitabif/ingest", json=payload,
                          headers={"X-Gateway-Key": state["gw"]}, timeout=60)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["packets_received"] == 1
        assert d["anomalies_detected"] >= 2, d  # fièvre + hors périmètre
        assert d["alerts_created"] == d["anomalies_detected"]

    def test_readings_persisted(self, hdr, farm_id):
        r = requests.get(f"{BASE_URL}/api/elevage/vitabif/readings?farm_id={farm_id}", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        readings = r.json()["readings"]
        assert readings, "no readings persisted"
        assert any(x.get("device_id") == "TEST_VB-900" and x.get("body_temp_c") == 40.5 for x in readings), readings[:3]
        assert all("_id" not in x for x in readings)


# === Épidémiologie régionale ===
class TestEpidemiology:
    def test_scan(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/epidemiology/scan", headers=hdr, timeout=60)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["success"] is True
        assert isinstance(d["clusters_found"], int)
        assert isinstance(d["new_alerts"], list)

    def test_alerts_list(self, hdr):
        r = requests.get(f"{BASE_URL}/api/elevage/epidemiology/alerts", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        alerts = r.json()["alerts"]
        assert alerts, "expected at least one epidemio alert"
        a = alerts[0]
        for k in ("species", "symptom", "farms_affected", "cases", "status", "recipient"):
            assert k in a, a
        assert any(x["status"] == "transmise_aux_autorites" for x in alerts)
        assert any(x["species"] == "bovin" for x in alerts)
        assert all(x["farms_affected"] >= 3 for x in alerts)


# === Alertes WhatsApp multilingues ===
class TestMultilingual:
    @pytest.mark.parametrize("lang,marker", [("pidgin", "ALARM"), ("fulfulde", "TINNDINOL")])
    def test_language_alert(self, hdr, lang, marker):
        r = requests.post(f"{BASE_URL}/api/elevage/settings", json={"alert_language": lang},
                          headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["alert_language"] == lang
        g = requests.get(f"{BASE_URL}/api/elevage/settings", headers=hdr, timeout=30)
        assert g.status_code == 200 and g.json()["alert_language"] == lang
        s = requests.post(f"{BASE_URL}/api/elevage/simulate", headers=hdr, timeout=60)
        assert s.status_code == 200, s.text[:300]
        alert = s.json()["alert"]
        assert alert.get("language") == lang, alert
        assert marker in alert.get("whatsapp_preview", ""), alert.get("whatsapp_preview")

    def test_invalid_language_rejected(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/settings", json={"alert_language": "klingon"},
                          headers=hdr, timeout=30)
        assert r.status_code == 422, r.status_code

    def test_reset_to_fr(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/settings", json={"alert_language": "fr"},
                          headers=hdr, timeout=30)
        assert r.status_code == 200 and r.json()["alert_language"] == "fr"


# === Surveillance continue ===
class TestMonitoring:
    def test_get_default(self, hdr):
        r = requests.get(f"{BASE_URL}/api/elevage/cameras/monitoring", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert "enabled" in d and "interval_minutes" in d
        assert "_id" not in d

    def test_enable(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/cameras/monitoring",
                          json={"enabled": True, "interval_minutes": 5}, headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["success"] is True and d["enabled"] is True and d["interval_minutes"] == 5
        g = requests.get(f"{BASE_URL}/api/elevage/cameras/monitoring", headers=hdr, timeout=30).json()
        assert g["enabled"] is True and g["interval_minutes"] == 5

    def test_invalid_interval(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/cameras/monitoring",
                          json={"enabled": True, "interval_minutes": 1}, headers=hdr, timeout=30)
        assert r.status_code == 422, r.status_code

    def test_disable_final(self, hdr):
        r = requests.post(f"{BASE_URL}/api/elevage/cameras/monitoring",
                          json={"enabled": False, "interval_minutes": 15}, headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        assert r.json()["enabled"] is False
        g = requests.get(f"{BASE_URL}/api/elevage/cameras/monitoring", headers=hdr, timeout=30).json()
        assert g["enabled"] is False


# === Dataset YOLO ===
class TestDataset:
    def test_add_photo(self, hdr, bus_b64):
        before = requests.get(f"{BASE_URL}/api/elevage/vision/dataset/stats", headers=hdr, timeout=30).json()["photos"]["porcin"]
        r = requests.post(f"{BASE_URL}/api/elevage/vision/dataset",
                          json={"image_base64": bus_b64, "species": "porcin", "note": "TEST_iteration41"},
                          headers=hdr, timeout=60)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["success"] is True and d["species"] == "porcin"
        assert d["total_photos_species"] == before + 1

    def test_invalid_species(self, hdr, bus_b64):
        r = requests.post(f"{BASE_URL}/api/elevage/vision/dataset",
                          json={"image_base64": bus_b64, "species": "dragon"}, headers=hdr, timeout=30)
        assert r.status_code == 422

    def test_stats(self, hdr):
        r = requests.get(f"{BASE_URL}/api/elevage/vision/dataset/stats", headers=hdr, timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert set(d["photos"]) == {"bovin", "porcin", "ovin", "volaille"}
        assert d["target_per_species"] == 300
        assert isinstance(d["custom_model_installed"], bool)


# === Auth guard ===
class TestAuthGuard:
    @pytest.mark.parametrize("path", ["/api/elevage/vision/engine", "/api/elevage/cameras",
                                      "/api/elevage/vision/dataset/stats", "/api/elevage/cameras/monitoring"])
    def test_requires_auth(self, path):
        r = requests.get(f"{BASE_URL}{path}", timeout=30)
        assert r.status_code in (401, 403), f"{path} -> {r.status_code}"
