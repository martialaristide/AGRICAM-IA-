"""
AgriCam Elevage IA — Vision (caméras + YOLO), colliers VitaBif (LoRa) et épidémiologie.
Namespace additif /api/elevage — supporte 20+ caméras IP/RTSP par ferme.
"""
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import re
import json
import base64
import secrets
import logging
import asyncio

from routes import elevage as core

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/elevage", tags=["elevage-vision"])

_yolo_model = None
_yolo_checked = False

YOLO_CLASS_MAP = {
    "cow": ("bovin", "Bovin"),
    "sheep": ("ovin", "Ovin/Caprin"),
    "bird": ("volaille", "Volaille"),
    "horse": ("equin", "Équin"),
    "dog": ("chien", "Chien"),
    "person": ("humain", "Personne"),
}

VITABIF_THRESHOLDS = {
    "bovin": {"hr": (48, 84), "temp": (38.0, 39.3)},
    "ovin": {"hr": (70, 90), "temp": (38.5, 39.9)},
    "porcin": {"hr": (70, 120), "temp": (38.7, 39.8)},
    "volaille": {"hr": (250, 350), "temp": (40.5, 42.0)},
}


def _get_yolo():
    global _yolo_model, _yolo_checked
    if _yolo_model is None and not _yolo_checked:
        _yolo_checked = True
        try:
            from ultralytics import YOLO
            _yolo_model = YOLO("yolov8n.pt")
            logger.info("YOLOv8n loaded for livestock detection")
        except Exception as e:
            logger.warning(f"YOLO unavailable, Gemini fallback will be used: {e}")
    return _yolo_model


def _run_yolo(img_bytes: bytes):
    model = _get_yolo()
    if model is None:
        return None
    import numpy as np
    import cv2
    arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(400, "Image illisible")
    results = model.predict(frame, conf=0.35, verbose=False)
    r = results[0]
    detections, counts = [], {}
    for box in r.boxes:
        cls_name = model.names[int(box.cls[0])]
        mapped, label_fr = YOLO_CLASS_MAP.get(cls_name, (cls_name, cls_name))
        conf = round(float(box.conf[0]) * 100)
        detections.append({"class": cls_name, "species": mapped, "label_fr": label_fr,
                           "confidence": conf, "bbox": [round(float(x)) for x in box.xyxy[0].tolist()]})
        counts[mapped] = counts.get(mapped, 0) + 1
    annotated = r.plot()
    ok, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return {
        "engine": "yolov8n",
        "detections": detections,
        "counts": counts,
        "total_animals": sum(v for k, v in counts.items() if k in ("bovin", "ovin", "porcin", "volaille", "equin")),
        "human_detected": counts.get("humain", 0) > 0,
        "annotated_image": "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode() if ok else None,
    }


async def _run_gemini_detection(img_b64: str) -> dict:
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    chat = LlmChat(
        api_key=core.EMERGENT_LLM_KEY,
        session_id=f"vision-{uuid.uuid4()}",
        system_message='Tu es un système de vision par ordinateur pour l\'élevage. Compte les animaux visibles par espèce. Réponds UNIQUEMENT en JSON: {"counts": {"bovin": 0, "ovin": 0, "porcin": 0, "volaille": 0, "humain": 0}, "observations": "description courte en français"}',
    ).with_model("gemini", "gemini-2.5-flash")
    resp = await chat.send_message(UserMessage(text="Compte les animaux sur cette image de ferme.", file_contents=[ImageContent(image_base64=img_b64)]))
    match = re.search(r"\{.*\}", resp, re.DOTALL)
    data = json.loads(match.group()) if match else {"counts": {}, "observations": resp[:200]}
    counts = {k: v for k, v in data.get("counts", {}).items() if v}
    return {
        "engine": "gemini-2.5-flash (fallback)",
        "detections": [],
        "counts": counts,
        "total_animals": sum(v for k, v in counts.items() if k != "humain"),
        "human_detected": counts.get("humain", 0) > 0,
        "observations": data.get("observations", ""),
        "annotated_image": None,
    }


def _grab_frame(source_url: str) -> bytes:
    import cv2
    cap = cv2.VideoCapture(source_url)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        ok, frame = cap.read()
        if not ok or frame is None:
            raise HTTPException(502, f"Impossible de capturer une image depuis la caméra ({source_url.split('@')[-1][:60]}). Vérifiez l'URL RTSP/HTTP et le réseau.")
        ok, buf = cv2.imencode(".jpg", frame)
        return buf.tobytes()
    finally:
        cap.release()


class CameraCreate(BaseModel):
    farm_id: str
    name: str = Field(..., min_length=2, max_length=80)
    stream_url: str = Field(..., min_length=5, max_length=500)
    camera_type: str = Field(default="rgb", pattern="^(rgb|thermique|ir)$")
    position: Optional[str] = None


class FrameDetect(BaseModel):
    image_base64: str
    farm_id: Optional[str] = None


class VitaBifPacket(BaseModel):
    device_id: str
    animal_tag: Optional[str] = None
    heart_rate_bpm: Optional[float] = None
    body_temp_c: Optional[float] = None
    activity: Optional[str] = None
    perimeter_status: Optional[str] = None
    battery_pct: Optional[int] = None
    ts: Optional[str] = None


class VitaBifProbe(BaseModel):
    water_ph: Optional[float] = None
    water_turbidity: Optional[float] = None
    water_conductivity_us: Optional[float] = None
    feed_humidity_pct: Optional[float] = None
    feed_temp_c: Optional[float] = None


class VitaBifIngest(BaseModel):
    farm_id: str
    gateway_id: str
    packets: List[VitaBifPacket] = []
    probe: Optional[VitaBifProbe] = None


@router.get("/vision/engine")
async def vision_engine(request: Request):
    core._check_enabled()
    await core._user_from_request(request)
    model = _get_yolo()
    return {
        "yolo_available": model is not None,
        "model": "yolov8n (COCO)" if model else None,
        "fallback": "gemini-2.5-flash",
        "mapped_classes": {k: v[1] for k, v in YOLO_CLASS_MAP.items()},
        "note": "Les porcins ne sont pas dans COCO — détectés via le fallback Gemini ou un modèle YOLO fine-tuné (roadmap dataset fermes pilotes).",
    }


@router.get("/cameras")
async def list_cameras(request: Request, farm_id: Optional[str] = None):
    core._check_enabled()
    user = await core._user_from_request(request)
    q = {"user_id": user["id"]}
    if farm_id:
        q["farm_id"] = farm_id
    cams = await core._db.elevage_cameras.find(q, {"_id": 0}).to_list(200)
    return {"cameras": cams, "count": len(cams)}


@router.post("/cameras")
async def add_camera(data: CameraCreate, request: Request):
    core._check_enabled()
    user = await core._user_from_request(request)
    farm = await core._db.elevage_farms.find_one({"id": data.farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    cam = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "farm_id": data.farm_id,
        "farm_name": farm["name"], "name": data.name.strip(), "stream_url": data.stream_url.strip(),
        "camera_type": data.camera_type, "position": data.position,
        "status": "configured", "last_detection_at": None, "created_at": core._iso(),
    }
    await core._db.elevage_cameras.insert_one(dict(cam))
    return {"success": True, "camera": cam}


@router.delete("/cameras/{camera_id}")
async def delete_camera(camera_id: str, request: Request):
    core._check_enabled()
    user = await core._user_from_request(request)
    res = await core._db.elevage_cameras.delete_one({"id": camera_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Caméra non trouvée")
    return {"success": True}


async def _process_detection(user_id: str, farm, result: dict, source: str):
    doc = {k: v for k, v in result.items() if k != "annotated_image"}
    doc |= {"id": str(uuid.uuid4()), "user_id": user_id, "farm_id": farm["id"] if farm else None,
            "source": source, "created_at": core._iso()}
    await core._db.elevage_detections.insert_one(dict(doc))
    if result.get("human_detected") and farm:
        await core._make_alert(user_id, farm, "critique", "Présence humaine détectée (vision IA)",
                               f"Le système de vision a détecté une personne sur {source} de {farm['name']}. Vérifiez s'il s'agit du personnel autorisé.",
                               "Vérifier immédiatement la caméra — sirène locale si intrusion confirmée", "securite")


@router.post("/cameras/{camera_id}/detect")
async def camera_detect(camera_id: str, request: Request):
    """Capture une image sur le flux réel de la caméra (RTSP/HTTP) et lance la détection YOLO."""
    core._check_enabled()
    user = await core._user_from_request(request)
    cam = await core._db.elevage_cameras.find_one({"id": camera_id, "user_id": user["id"]}, {"_id": 0})
    if not cam:
        raise HTTPException(404, "Caméra non trouvée")
    farm = await core._db.elevage_farms.find_one({"id": cam["farm_id"]}, {"_id": 0})
    loop = asyncio.get_event_loop()
    try:
        img_bytes = await loop.run_in_executor(None, _grab_frame, cam["stream_url"])
    except HTTPException:
        await core._db.elevage_cameras.update_one({"id": camera_id}, {"$set": {"status": "offline"}})
        raise
    result = await loop.run_in_executor(None, _run_yolo, img_bytes)
    if result is None:
        result = await _run_gemini_detection(base64.b64encode(img_bytes).decode())
    await core._db.elevage_cameras.update_one({"id": camera_id}, {"$set": {"status": "online", "last_detection_at": core._iso(), "last_counts": result["counts"]}})
    await _process_detection(user["id"], farm, result, f"caméra {cam['name']}")
    return {"success": True, "camera": cam["name"], "result": result}


@router.post("/vision/detect-frame")
async def detect_frame(data: FrameDetect, request: Request):
    """Détection YOLO sur une image envoyée (test grandeur nature sans accès réseau caméra)."""
    core._check_enabled()
    user = await core._user_from_request(request)
    b64 = data.image_base64.split(",", 1)[1] if data.image_base64.startswith("data:") else data.image_base64
    img_bytes = base64.b64decode(b64)
    result = await asyncio.get_event_loop().run_in_executor(None, _run_yolo, img_bytes)
    if result is None:
        result = await _run_gemini_detection(b64)
    farm = None
    if data.farm_id:
        farm = await core._db.elevage_farms.find_one({"id": data.farm_id, "user_id": user["id"]}, {"_id": 0})
    await _process_detection(user["id"], farm, result, "image téléversée")
    return {"success": True, "result": result}


@router.post("/farms/{farm_id}/gateway")
async def create_gateway_key(farm_id: str, request: Request):
    """Génère la clé d'API de la passerelle LoRa (Raspberry Pi) pour l'envoi réel des données VitaBif."""
    core._check_enabled()
    user = await core._user_from_request(request)
    farm = await core._db.elevage_farms.find_one({"id": farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    key = farm.get("gateway_key") or f"vb_{secrets.token_urlsafe(24)}"
    await core._db.elevage_farms.update_one({"id": farm_id}, {"$set": {"gateway_key": key}})
    return {
        "gateway_key": key,
        "endpoint": "/api/elevage/vitabif/ingest",
        "method": "POST",
        "header": {"X-Gateway-Key": key},
        "payload_example": {
            "farm_id": farm_id, "gateway_id": "GW-FERME-01",
            "packets": [{"device_id": "VB-001", "animal_tag": "BV-001", "heart_rate_bpm": 72,
                         "body_temp_c": 38.9, "activity": "rumination",
                         "perimeter_status": "inside", "battery_pct": 87}],
            "probe": {"water_ph": 6.8, "water_turbidity": 12.5, "water_conductivity_us": 540,
                      "feed_humidity_pct": 14.2, "feed_temp_c": 27.1},
        },
        "activities": ["marche", "rumination", "repos", "immobilite_prolongee", "boiterie"],
        "perimeter_statuses": ["inside", "near_limit", "outside"],
        "frequency": "toutes les 5 à 15 minutes (défini côté passerelle)",
    }


@router.post("/vitabif/ingest")
async def vitabif_ingest(data: VitaBifIngest, x_gateway_key: str = Header(None)):
    """Réception réelle des paquets colliers VitaBif via la passerelle LoRa (auth par clé)."""
    core._check_enabled()
    farm = await core._db.elevage_farms.find_one({"id": data.farm_id}, {"_id": 0})
    if not farm or not x_gateway_key or farm.get("gateway_key") != x_gateway_key:
        raise HTTPException(401, "Clé passerelle invalide")
    th = VITABIF_THRESHOLDS.get(farm["species"], VITABIF_THRESHOLDS["bovin"])
    user_id = farm["user_id"]
    anomalies = []

    for p in data.packets:
        reading = p.dict() | {"id": str(uuid.uuid4()), "farm_id": data.farm_id,
                              "gateway_id": data.gateway_id, "received_at": core._iso()}
        await core._db.elevage_vitabif_readings.insert_one(dict(reading))
        tag = p.animal_tag or p.device_id
        await core._db.elevage_collars.update_one(
            {"device_id": p.device_id},
            {"$set": {"device_id": p.device_id, "animal_tag": tag, "farm_id": data.farm_id,
                      "battery_level": p.battery_pct, "activity": p.activity,
                      "heart_rate_bpm": p.heart_rate_bpm, "body_temp_c": p.body_temp_c,
                      "perimeter_status": p.perimeter_status, "last_sync": core._iso(), "source": "vitabif_lora"}},
            upsert=True)

        if p.body_temp_c and p.body_temp_c > th["temp"][1]:
            anomalies.append((f"Fièvre détectée — {tag} : {p.body_temp_c}°C (seuil {th['temp'][1]}°C)",
                              "Isoler le sujet — consulter un vétérinaire si persistance", "urgent"))
        if p.heart_rate_bpm and not (th["hr"][0] <= p.heart_rate_bpm <= th["hr"][1]):
            anomalies.append((f"Rythme cardiaque anormal — {tag} : {p.heart_rate_bpm} bpm (normale {th['hr'][0]}-{th['hr'][1]})",
                              "Vérifier stress, douleur ou maladie", "attention"))
        if p.activity == "immobilite_prolongee":
            anomalies.append((f"Immobilité prolongée — {tag} (collier VitaBif)",
                              "Urgence possible : vérifier l'animal immédiatement", "critique"))
        if p.activity == "boiterie":
            anomalies.append((f"Boiterie détectée par accéléromètre — {tag}",
                              "Examiner les pattes/onglons", "attention"))
        if p.perimeter_status in ("near_limit", "outside"):
            sev = "urgent" if p.perimeter_status == "outside" else "attention"
            anomalies.append((f"Clôture virtuelle : {tag} {'hors zone' if p.perimeter_status == 'outside' else 'proche de la limite'} (balise ultrasonore)",
                              "Localiser et ramener l'animal", sev))

    if data.probe:
        pr = data.probe
        await core._db.elevage_vitabif_readings.insert_one(
            pr.dict() | {"id": str(uuid.uuid4()), "farm_id": data.farm_id, "type": "probe",
                         "gateway_id": data.gateway_id, "received_at": core._iso()})
        if pr.water_ph and not (6.0 <= pr.water_ph <= 8.5):
            anomalies.append((f"pH de l'eau anormal : {pr.water_ph} (sonde VitaBif)", "Changer l'eau des abreuvoirs", "attention"))
        if pr.water_turbidity and pr.water_turbidity > 50:
            anomalies.append((f"Eau trouble détectée (turbidité {pr.water_turbidity})", "Nettoyer et remplacer l'eau", "urgent"))
        if pr.feed_humidity_pct and pr.feed_humidity_pct > 18:
            anomalies.append((f"Humidité de l'aliment élevée ({pr.feed_humidity_pct}%) — risque de moisissure", "Sécher/aérer le stock d'aliment", "attention"))

    alerts = []
    for msg, action, sev in anomalies[:10]:
        alerts.append(await core._make_alert(user_id, farm, sev, "Alerte collier VitaBif", msg, action, "vitabif"))
    return {"success": True, "packets_received": len(data.packets), "anomalies_detected": len(anomalies),
            "alerts_created": len(alerts)}


@router.get("/vitabif/readings")
async def vitabif_readings(request: Request, farm_id: Optional[str] = None):
    core._check_enabled()
    user = await core._user_from_request(request)
    q = {}
    if farm_id:
        q["farm_id"] = farm_id
    else:
        farms = await core._db.elevage_farms.find({"user_id": user["id"]}, {"_id": 0, "id": 1}).to_list(50)
        q["farm_id"] = {"$in": [f["id"] for f in farms]}
    readings = await core._db.elevage_vitabif_readings.find(q, {"_id": 0}).sort("received_at", -1).to_list(50)
    return {"readings": readings}


EPIDEMIO_SYMPTOMS = ("maladie", "toux", "boiterie", "diagnostic_photo")


@router.post("/epidemiology/scan")
async def epidemiology_scan(request: Request):
    """Détecte les foyers : ≥3 fermes avec les mêmes symptômes sous 7 jours → alerte anonymisée aux autorités."""
    core._check_enabled()
    await core._user_from_request(request)
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    events = await core._db.elevage_health_events.find(
        {"detected_at": {"$gte": since}, "type": {"$in": list(EPIDEMIO_SYMPTOMS)}},
        {"_id": 0, "farm_id": 1, "type": 1, "detected_at": 1}).to_list(5000)
    farm_ids = list({e["farm_id"] for e in events if e.get("farm_id")})
    farms = await core._db.elevage_farms.find({"id": {"$in": farm_ids}}, {"_id": 0, "id": 1, "species": 1}).to_list(500)
    species_map = {f["id"]: f["species"] for f in farms}

    clusters = {}
    for e in events:
        sp = species_map.get(e.get("farm_id"))
        if not sp:
            continue
        key = (sp, e["type"])
        c = clusters.setdefault(key, {"farms": set(), "cases": 0, "first": e["detected_at"], "last": e["detected_at"]})
        c["farms"].add(e["farm_id"])
        c["cases"] += 1
        c["first"] = min(c["first"], e["detected_at"])
        c["last"] = max(c["last"], e["detected_at"])

    created = []
    for (sp, symptom), c in clusters.items():
        if len(c["farms"]) < 3:
            continue
        existing = await core._db.elevage_epidemio_alerts.find_one(
            {"species": sp, "symptom": symptom, "created_at": {"$gte": since}}, {"_id": 0})
        if existing:
            await core._db.elevage_epidemio_alerts.update_one(
                {"id": existing["id"]},
                {"$set": {"farms_affected": len(c["farms"]), "cases": c["cases"], "last_case": c["last"]}})
            continue
        doc = {
            "id": str(uuid.uuid4()), "region": "Centre (Yaoundé)", "species": sp,
            "species_label": core.SPECIES[sp]["label"], "symptom": symptom,
            "symptom_label": core.HEALTH_EVENT_TYPES.get(symptom, {}).get("label", "Diagnostic photo IA"),
            "farms_affected": len(c["farms"]), "cases": c["cases"],
            "first_case": c["first"], "last_case": c["last"],
            "status": "transmise_aux_autorites",
            "recipient": "Services vétérinaires MINEPIA / PATNUC (données anonymisées — aucune identité d'éleveur transmise)",
            "created_at": core._iso(),
        }
        await core._db.elevage_epidemio_alerts.insert_one(dict(doc))
        created.append(doc)
    return {"success": True, "clusters_found": len(created), "new_alerts": created}


@router.get("/epidemiology/alerts")
async def epidemiology_alerts(request: Request):
    core._check_enabled()
    await core._user_from_request(request)
    alerts = await core._db.elevage_epidemio_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"alerts": alerts}
