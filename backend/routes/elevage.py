"""
AgriCam Elevage IA — module additif (namespace /api/elevage).
Surveillance intelligente du bétail : cheptel, santé, sécurité,
environnement, alimentation, prix. Données caméras/capteurs simulées.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import os
import re
import json
import random
import logging
import jwt as pyjwt
import httpx

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/elevage", tags=["elevage"])

_db = None

def init_db(database, auth_dep=None):
    global _db
    _db = database


ELEVAGE_ENABLED = os.environ.get("ELEVAGE_IA_ENABLED", "true").lower() == "true"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SPECIES = {
    "bovin": {
        "label": "Bovins", "unit": "têtes", "adult_w": (250, 450), "juv_w": (80, 200), "baby_w": (25, 60),
        "price_kg": (1800, 2600), "temp_ideal": (18, 30), "count": (8, 18), "gain_day": 0.7,
        "buildings": ["Enclos", "Pâturage"], "feed": ["maïs", "tourteau", "fourrage", "son"],
    },
    "porcin": {
        "label": "Porcins", "unit": "têtes", "adult_w": (70, 120), "juv_w": (25, 60), "baby_w": (5, 15),
        "price_kg": (1500, 2200), "temp_ideal": (16, 26), "count": (12, 30), "gain_day": 0.55,
        "buildings": ["Porcherie"], "feed": ["provende", "maïs", "soja", "son de blé"],
    },
    "ovin": {
        "label": "Ovins", "unit": "têtes", "adult_w": (30, 55), "juv_w": (15, 28), "baby_w": (3, 8),
        "price_kg": (2000, 3000), "temp_ideal": (15, 32), "count": (15, 40), "gain_day": 0.15,
        "buildings": ["Bergerie", "Pâturage"], "feed": ["fourrage", "maïs", "tourteau"],
    },
    "volaille": {
        "label": "Volailles", "unit": "sujets", "adult_w": (1.8, 3.0), "juv_w": (0.8, 1.5), "baby_w": (0.05, 0.3),
        "price_kg": (2500, 3500), "temp_ideal": (20, 28), "count": (150, 450), "gain_day": 0.05,
        "buildings": ["Poulailler"], "feed": ["provende chair", "maïs concassé", "prémix"],
    },
}

TAG_PREFIX = {"bovin": "BV", "porcin": "PC", "ovin": "OV", "volaille": "VL"}

HEALTH_EVENT_TYPES = {
    "maladie": {"label": "Suspicion de maladie", "severity": "urgent", "action": "Isoler le sujet et consulter un vétérinaire"},
    "boiterie": {"label": "Boiterie détectée (analyse de démarche)", "severity": "attention", "action": "Examiner les pattes/onglons, isoler si nécessaire"},
    "isolement": {"label": "Isolement social anormal", "severity": "attention", "action": "Surveiller le sujet — signe précoce de maladie"},
    "blessure": {"label": "Blessure visible détectée", "severity": "urgent", "action": "Soigner la plaie et désinfecter"},
    "chaleur": {"label": "Chaleur (œstrus) détectée", "severity": "info", "action": "Fenêtre d'insémination optimale dans 12-18h"},
    "mise_bas": {"label": "Mise-bas imminente", "severity": "urgent", "action": "Surveillance renforcée, préparer le box de mise-bas"},
    "soif": {"label": "Comportement de soif anormale", "severity": "attention", "action": "Vérifier l'abreuvoir et la qualité de l'eau"},
    "toux": {"label": "Toux détectée (analyse audio)", "severity": "urgent", "action": "Suspicion respiratoire — aérer et consulter un vétérinaire"},
}

SECURITY_EVENT_TYPES = {
    "intrusion": {"label": "Intrusion humaine détectée (vision nocturne)", "severity": "critique", "action": "Vérifier immédiatement — sirène locale déclenchée"},
    "evasion": {"label": "Animal hors de la zone (franchissement de clôture)", "severity": "urgent", "action": "Localiser et ramener l'animal"},
    "predateur": {"label": "Mouvement suspect de prédateur détecté", "severity": "urgent", "action": "Sécuriser l'enclos et vérifier le troupeau"},
}

SEVERITY_EMOJI = {"info": "🟢", "attention": "🟡", "urgent": "🟠", "critique": "🔴"}


def _now():
    return datetime.now(timezone.utc)


def _iso(dt=None):
    return (dt or _now()).isoformat()


def _check_enabled():
    if not ELEVAGE_ENABLED:
        raise HTTPException(403, "Module Élevage IA désactivé (feature flag ELEVAGE_IA_ENABLED)")


async def _user_from_request(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip() if auth else ""
    if not token:
        raise HTTPException(401, "Non authentifié")
    try:
        payload = pyjwt.decode(
            token,
            os.environ.get("JWT_SECRET_KEY", "agricam-secret-key-prod-2025"),
            algorithms=["HS256"],
        )
        user = await _db.users.find_one({"id": payload.get("user_id")}, {"_id": 0, "password_hash": 0})
    except Exception:
        raise HTTPException(401, "Token invalide")
    if not user:
        raise HTTPException(401, "Utilisateur non trouvé")
    return user


def _whatsapp_preview(severity: str, farm_name: str, species: str, message: str, action: str) -> str:
    emoji = SEVERITY_EMOJI.get(severity, "🟢")
    label = SPECIES.get(species, {}).get("label", species)
    ts = _now().strftime("%d/%m/%Y %H:%M")
    return (
        f"{emoji} *AGRICAM ÉLEVAGE IA* — ALERTE {severity.upper()}\n"
        f"📍 Ferme : {farm_name} ({label})\n"
        f"🕐 {ts}\n\n"
        f"{message}\n\n"
        f"👉 Action recommandée : {action}\n"
        f"Répondez 1 pour acquitter · 2 pour consulter un vétérinaire"
    )


async def _make_alert(user_id: str, farm: dict, severity: str, title: str, message: str, action: str, source_type: str, image_ref: Optional[str] = None):
    wa_text = _whatsapp_preview(severity, farm["name"], farm["species"], message, action)
    user = await _db.users.find_one({"id": user_id}, {"_id": 0, "phone": 1, "phone_number": 1})
    phone = (user or {}).get("phone") or (user or {}).get("phone_number")
    wa_result = await _send_whatsapp(phone, wa_text) if phone else {"sent": False, "mode": "simulation", "reason": "no_phone"}
    alert = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "farm_id": farm["id"],
        "farm_name": farm["name"],
        "species": farm["species"],
        "source_type": source_type,
        "severity": severity,
        "title": title,
        "message": message,
        "action": action,
        "channel": wa_result["mode"],
        "whatsapp_status": "envoyé" if wa_result["sent"] else "simulé",
        "whatsapp_preview": wa_text,
        "image_ref": image_ref,
        "acknowledged_at": None,
        "escalation_level": 0,
        "created_at": _iso(),
    }
    await _db.elevage_alerts.insert_one(alert)
    alert.pop("_id", None)
    return alert


def _wa_provider() -> Optional[str]:
    if os.environ.get("WHATSAPP_ACCESS_TOKEN") and os.environ.get("WHATSAPP_PHONE_NUMBER_ID"):
        return "meta"
    if os.environ.get("TWILIO_ACCOUNT_SID") and os.environ.get("TWILIO_AUTH_TOKEN") and os.environ.get("TWILIO_WHATSAPP_FROM"):
        return "twilio"
    return None


async def _send_whatsapp(to_number: str, text: str) -> dict:
    """Envoie un vrai message WhatsApp (Meta Cloud API ou Twilio). Repli simulation si clés absentes."""
    provider = _wa_provider()
    if not provider or not to_number:
        return {"sent": False, "mode": "whatsapp_sim"}
    num = re.sub(r"[^\d+]", "", to_number)
    if not num.startswith("+"):
        num = "+237" + num.lstrip("0")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            if provider == "meta":
                phone_id = os.environ["WHATSAPP_PHONE_NUMBER_ID"]
                resp = await client.post(
                    f"https://graph.facebook.com/v21.0/{phone_id}/messages",
                    headers={"Authorization": f"Bearer {os.environ['WHATSAPP_ACCESS_TOKEN']}"},
                    json={"messaging_product": "whatsapp", "to": num.lstrip("+"), "type": "text", "text": {"body": text}},
                )
            else:
                sid = os.environ["TWILIO_ACCOUNT_SID"]
                resp = await client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                    auth=(sid, os.environ["TWILIO_AUTH_TOKEN"]),
                    data={"From": f"whatsapp:{os.environ['TWILIO_WHATSAPP_FROM']}", "To": f"whatsapp:{num}", "Body": text},
                )
        if resp.status_code < 300:
            return {"sent": True, "mode": f"whatsapp_{provider}"}
        logger.warning(f"WhatsApp {provider} send failed {resp.status_code}: {resp.text[:200]}")
        return {"sent": False, "mode": "whatsapp_sim", "error": resp.text[:200]}
    except Exception as e:
        logger.warning(f"WhatsApp send error: {e}")
        return {"sent": False, "mode": "whatsapp_sim", "error": str(e)}


def _gen_animal(farm: dict, user_id: str, idx: int) -> dict:
    sp = SPECIES[farm["species"]]
    age_class = random.choices(["adulte", "juvenile", "nouveau_ne"], weights=[60, 30, 10])[0]
    w_range = {"adulte": sp["adult_w"], "juvenile": sp["juv_w"], "nouveau_ne": sp["baby_w"]}[age_class]
    weight = round(random.uniform(*w_range), 1)
    sex = random.choices(["femelle", "male"], weights=[65, 35])[0]
    health = random.choices([random.randint(82, 98), random.randint(55, 75), random.randint(30, 50)], weights=[80, 15, 5])[0]
    status = "sain" if health >= 75 else ("surveillance" if health >= 55 else "malade")
    days_back = {"adulte": random.randint(400, 1500), "juvenile": random.randint(90, 360), "nouveau_ne": random.randint(3, 60)}[age_class]
    history = []
    w = weight
    for i in range(5, -1, -1):
        history.append({"date": _iso(_now() - timedelta(days=i * 15)), "weight": round(max(0.05, w - sp["gain_day"] * i * 15 * random.uniform(0.8, 1.1)), 1)})
    history[-1]["weight"] = weight
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "farm_id": farm["id"],
        "species": farm["species"],
        "sex": sex,
        "age_class": age_class,
        "tag": f"{TAG_PREFIX[farm['species']]}-{idx:03d}",
        "birth_estimate": _iso(_now() - timedelta(days=days_back)),
        "weight_kg": weight,
        "weight_history": history,
        "health_score": health,
        "status": status,
        "is_group": False,
        "group_count": 1,
        "behaviors": {
            "standing_pct": random.randint(35, 60),
            "lying_pct": random.randint(20, 45),
            "feeding_visits_day": random.randint(4, 14),
            "water_visits_day": random.randint(3, 10),
            "rumination_min_day": random.randint(300, 540) if farm["species"] in ("bovin", "ovin") else 0,
        },
        "created_at": _iso(),
    }


def _gen_poultry_lots(farm: dict, user_id: str, total: int) -> List[dict]:
    lots = []
    per = total // 3
    for i in range(3):
        count = per + (total - per * 3 if i == 2 else 0)
        health = random.randint(78, 96)
        lots.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "farm_id": farm["id"],
            "species": "volaille",
            "sex": "mixte",
            "age_class": ["nouveau_ne", "juvenile", "adulte"][i],
            "tag": f"LOT-{chr(65 + i)}",
            "birth_estimate": _iso(_now() - timedelta(days=[10, 30, 55][i])),
            "weight_kg": [0.2, 1.1, 2.4][i],
            "weight_history": [{"date": _iso(_now() - timedelta(days=d)), "weight": round([0.2, 1.1, 2.4][i] * (1 - d / 100), 2)} for d in (30, 20, 10, 0)],
            "health_score": health,
            "status": "sain" if health >= 75 else "surveillance",
            "is_group": True,
            "group_count": count,
            "behaviors": {"density_per_m2": random.randint(8, 12), "mortality_week": random.randint(0, 3), "feed_intake_g_day": [15, 70, 110][i]},
            "created_at": _iso(),
        })
    return lots


async def _gen_env_reading(farm: dict) -> dict:
    sp = SPECIES[farm["species"]]
    t_lo, t_hi = sp["temp_ideal"]
    temp = round(random.uniform(t_lo - 2, t_hi + 5), 1)
    ammonia = round(random.uniform(2, 30), 1)
    co2 = random.randint(400, 3200)
    water = random.randint(55, 98)
    feed_level = random.randint(10, 100)
    reading = {
        "id": str(uuid.uuid4()),
        "farm_id": farm["id"],
        "temperature": temp,
        "humidity": random.randint(45, 90),
        "ammonia_ppm": ammonia,
        "co2_ppm": co2,
        "water_quality_index": water,
        "feed_level_pct": feed_level,
        "thermal_body_temp": round(random.uniform(37.5, 40.5), 1),
        "recorded_at": _iso(),
        "statuses": {
            "temperature": "alerte" if temp > t_hi else ("attention" if temp > t_hi - 2 else "ok"),
            "ammonia": "alerte" if ammonia > 25 else ("attention" if ammonia > 15 else "ok"),
            "co2": "alerte" if co2 > 2500 else ("attention" if co2 > 1500 else "ok"),
            "water": "alerte" if water < 60 else ("attention" if water < 75 else "ok"),
            "feed": "alerte" if feed_level < 15 else ("attention" if feed_level < 30 else "ok"),
        },
    }
    await _db.elevage_env_readings.insert_one(dict(reading))
    reading.pop("_id", None)
    return reading


# === Models ===
class FarmCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    species: str = Field(..., pattern="^(bovin|porcin|ovin|volaille)$")
    building_type: Optional[str] = None


class DiagnoseRequest(BaseModel):
    image_base64: str
    species: str = Field(default="bovin", pattern="^(bovin|porcin|ovin|volaille)$")
    animal_id: Optional[str] = None
    farm_id: Optional[str] = None
    language: str = "fr"


# === Endpoints ===
@router.get("/status")
async def elevage_status(request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    farms_count = await _db.elevage_farms.count_documents({"user_id": user["id"]})
    return {"enabled": True, "seeded": farms_count > 0, "farms_count": farms_count}


@router.post("/seed")
async def seed_demo(request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    existing = await _db.elevage_farms.count_documents({"user_id": user["id"]})
    if existing > 0:
        return {"success": True, "message": "Cheptel déjà recensé", "created": 0}

    farm_names = {"bovin": "Enclos Nord — Bovins", "porcin": "Porcherie Centrale", "ovin": "Bergerie Est", "volaille": "Poulailler A"}
    total_animals = 0
    for species, cfg in SPECIES.items():
        farm = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "name": farm_names[species],
            "species": species,
            "building_type": cfg["buildings"][0],
            "camera_status": "online",
            "sensors": ["camera_rgb", "camera_thermique", "capteur_eau", "capteur_air", "micro_audio"],
            "gps_zone": {"lat": 3.848 + random.uniform(-0.05, 0.05), "lng": 11.502 + random.uniform(-0.05, 0.05)},
            "created_at": _iso(),
        }
        await _db.elevage_farms.insert_one(dict(farm))
        count = random.randint(*cfg["count"])
        if species == "volaille":
            animals = _gen_poultry_lots(farm, user["id"], count)
        else:
            animals = [_gen_animal(farm, user["id"], i + 1) for i in range(count)]
        if animals:
            await _db.elevage_animals.insert_many([dict(a) for a in animals])
        total_animals += sum(a["group_count"] for a in animals)

        # health events for sick/watch animals + census alert
        for a in animals:
            if a["status"] != "sain" and not a["is_group"]:
                etype = random.choice(["maladie", "boiterie", "isolement", "soif"])
                cfg_e = HEALTH_EVENT_TYPES[etype]
                await _db.elevage_health_events.insert_one({
                    "id": str(uuid.uuid4()), "animal_id": a["id"], "farm_id": farm["id"], "user_id": user["id"],
                    "type": etype, "label": cfg_e["label"], "confidence": random.randint(68, 94),
                    "detected_at": _iso(_now() - timedelta(hours=random.randint(1, 48))),
                    "resolved_at": None, "vet_notes": None, "source": "camera_ia",
                })
        males = sum(1 for a in animals if a["sex"] == "male")
        females = sum(1 for a in animals if a["sex"] == "femelle")
        juv = sum(a["group_count"] for a in animals if a["age_class"] in ("juvenile", "nouveau_ne"))
        await _make_alert(
            user["id"], farm, "info", "Recensement automatique terminé",
            f"La caméra a détecté {count} {cfg['unit']} ({males} mâles, {females} femelles, {juv} jeunes) dans {farm['name']}. Confirmez-vous ce recensement ?",
            "Vérifier et confirmer le comptage dans l'application", "recensement",
        )
        await _gen_env_reading(farm)

    return {"success": True, "message": f"Recensement terminé : {total_animals} animaux détectés sur 4 installations", "created": total_animals}


@router.get("/farms")
async def list_farms(request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    farms = await _db.elevage_farms.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    result = []
    for f in farms:
        animals = await _db.elevage_animals.find({"farm_id": f["id"]}, {"_id": 0, "group_count": 1, "sex": 1, "age_class": 1, "health_score": 1, "status": 1}).to_list(1000)
        total = sum(a.get("group_count", 1) for a in animals)
        f["stats"] = {
            "total": total,
            "males": sum(a.get("group_count", 1) for a in animals if a["sex"] == "male"),
            "females": sum(a.get("group_count", 1) for a in animals if a["sex"] == "femelle"),
            "juveniles": sum(a.get("group_count", 1) for a in animals if a["age_class"] in ("juvenile", "nouveau_ne")),
            "avg_health": round(sum(a["health_score"] for a in animals) / len(animals), 1) if animals else 0,
            "sick": sum(1 for a in animals if a["status"] == "malade"),
            "watch": sum(1 for a in animals if a["status"] == "surveillance"),
        }
        f["species_label"] = SPECIES[f["species"]]["label"]
        result.append(f)
    return {"farms": result}


@router.post("/farms")
async def create_farm(data: FarmCreate, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    cfg = SPECIES[data.species]
    farm = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "name": data.name.strip(),
        "species": data.species, "building_type": data.building_type or cfg["buildings"][0],
        "camera_status": "online",
        "sensors": ["camera_rgb", "camera_thermique", "capteur_eau", "capteur_air", "micro_audio"],
        "gps_zone": {"lat": 3.848, "lng": 11.502}, "created_at": _iso(),
    }
    await _db.elevage_farms.insert_one(dict(farm))
    farm.pop("_id", None)
    return {"success": True, "farm": farm}


@router.post("/farms/{farm_id}/scan")
async def scan_farm(farm_id: str, request: Request):
    """Recensement caméra simulé : compte le cheptel, signale les écarts."""
    _check_enabled()
    user = await _user_from_request(request)
    farm = await _db.elevage_farms.find_one({"id": farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    cfg = SPECIES[farm["species"]]
    animals = await _db.elevage_animals.find({"farm_id": farm_id}, {"_id": 0}).to_list(1000)

    if not animals:
        count = random.randint(*cfg["count"])
        new_animals = _gen_poultry_lots(farm, user["id"], count) if farm["species"] == "volaille" else [_gen_animal(farm, user["id"], i + 1) for i in range(count)]
        await _db.elevage_animals.insert_many([dict(a) for a in new_animals])
        animals = new_animals

    expected = sum(a.get("group_count", 1) for a in animals)
    detected = expected if random.random() > 0.3 else expected - random.randint(1, 2)
    males = sum(a.get("group_count", 1) for a in animals if a["sex"] == "male")
    females = sum(a.get("group_count", 1) for a in animals if a["sex"] == "femelle")
    juv = sum(a.get("group_count", 1) for a in animals if a["age_class"] in ("juvenile", "nouveau_ne"))

    alert = None
    if detected < expected:
        alert = await _make_alert(
            user["id"], farm, "attention", "Écart de comptage détecté",
            f"{expected} {cfg['unit']} attendues, {detected} détectées par la caméra — vérification recommandée.",
            "Inspecter l'enclos et vérifier les angles morts de la caméra", "comptage",
        )
    return {
        "success": True,
        "scan": {"expected": expected, "detected": detected, "males": males, "females": females, "juveniles": juv, "scanned_at": _iso()},
        "alert": alert,
    }


@router.get("/farms/{farm_id}/animals")
async def farm_animals(farm_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    animals = await _db.elevage_animals.find({"farm_id": farm_id, "user_id": user["id"]}, {"_id": 0}).sort("tag", 1).to_list(1000)
    return {"animals": animals}


@router.get("/animals/{animal_id}")
async def animal_detail(animal_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    animal = await _db.elevage_animals.find_one({"id": animal_id, "user_id": user["id"]}, {"_id": 0})
    if not animal:
        raise HTTPException(404, "Animal non trouvé")
    events = await _db.elevage_health_events.find({"animal_id": animal_id}, {"_id": 0}).sort("detected_at", -1).to_list(50)
    return {"animal": animal, "health_events": events}


@router.get("/dashboard")
async def elevage_dashboard(request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    farms = await _db.elevage_farms.find({"user_id": user["id"]}, {"_id": 0, "id": 1, "species": 1}).to_list(50)
    farm_ids = [f["id"] for f in farms]
    animals = await _db.elevage_animals.find({"farm_id": {"$in": farm_ids}}, {"_id": 0}).to_list(2000)
    active_alerts = await _db.elevage_alerts.count_documents({"user_id": user["id"], "acknowledged_at": None})

    by_species = {}
    herd_value = 0
    for a in animals:
        n = a.get("group_count", 1)
        by_species[a["species"]] = by_species.get(a["species"], 0) + n
        price = sum(SPECIES[a["species"]]["price_kg"]) / 2
        herd_value += a["weight_kg"] * price * n

    total = sum(a.get("group_count", 1) for a in animals)
    avg_health = round(sum(a["health_score"] for a in animals) / len(animals), 1) if animals else 0
    return {
        "total_animals": total,
        "farms_count": len(farms),
        "by_species": [{"species": k, "label": SPECIES[k]["label"], "count": v} for k, v in by_species.items()],
        "avg_health_score": avg_health,
        "active_alerts": active_alerts,
        "sick_count": sum(1 for a in animals if a["status"] == "malade"),
        "watch_count": sum(1 for a in animals if a["status"] == "surveillance"),
        "herd_value_fcfa": round(herd_value),
        "mortality_rate": round(random.uniform(0.5, 2.2), 1),
    }


@router.get("/farms/{farm_id}/environment")
async def farm_environment(farm_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    farm = await _db.elevage_farms.find_one({"id": farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    reading = await _gen_env_reading(farm)
    history = await _db.elevage_env_readings.find({"farm_id": farm_id}, {"_id": 0}).sort("recorded_at", -1).to_list(12)

    if reading["statuses"]["ammonia"] == "alerte":
        await _make_alert(user["id"], farm, "urgent", "Qualité de l'air dégradée",
                          f"Taux d'ammoniac élevé ({reading['ammonia_ppm']} ppm) dans {farm['name']} — risque respiratoire.",
                          "Aérer le bâtiment et nettoyer la litière", "environnement")
    if reading["statuses"]["water"] == "alerte":
        await _make_alert(user["id"], farm, "attention", "Qualité de l'eau dégradée",
                          f"Indice de qualité de l'eau à {reading['water_quality_index']}/100 dans {farm['name']} — changement recommandé.",
                          "Vider et nettoyer les abreuvoirs", "environnement")
    return {"farm": farm, "current": reading, "history": list(reversed(history)), "ideal_temp": SPECIES[farm["species"]]["temp_ideal"]}


@router.get("/alerts")
async def list_alerts(request: Request, status: str = "all"):
    _check_enabled()
    user = await _user_from_request(request)
    q = {"user_id": user["id"]}
    if status == "active":
        q["acknowledged_at"] = None
    alerts = await _db.elevage_alerts.find(q, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"alerts": alerts}


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    res = await _db.elevage_alerts.update_one({"id": alert_id, "user_id": user["id"]}, {"$set": {"acknowledged_at": _iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Alerte non trouvée")
    return {"success": True}


@router.post("/simulate")
async def simulate_detection(request: Request):
    """Simule une détection caméra/capteur en direct (pour la démo)."""
    _check_enabled()
    user = await _user_from_request(request)
    farms = await _db.elevage_farms.find({"user_id": user["id"]}, {"_id": 0}).to_list(50)
    if not farms:
        raise HTTPException(400, "Aucune installation — lancez d'abord le recensement")
    farm = random.choice(farms)

    if random.random() < 0.7:
        animals = await _db.elevage_animals.find({"farm_id": farm["id"], "is_group": False}, {"_id": 0}).to_list(500)
        etype = random.choice(list(HEALTH_EVENT_TYPES.keys()))
        cfg = HEALTH_EVENT_TYPES[etype]
        target = random.choice(animals)["tag"] if animals else "LOT-A"
        if animals:
            animal = random.choice(animals)
            target = animal["tag"]
            await _db.elevage_health_events.insert_one({
                "id": str(uuid.uuid4()), "animal_id": animal["id"], "farm_id": farm["id"], "user_id": user["id"],
                "type": etype, "label": cfg["label"], "confidence": random.randint(70, 95),
                "detected_at": _iso(), "resolved_at": None, "vet_notes": None, "source": "camera_ia",
            })
            new_score = max(20, animal["health_score"] - random.randint(5, 20)) if etype not in ("chaleur", "mise_bas") else animal["health_score"]
            await _db.elevage_animals.update_one({"id": animal["id"]}, {"$set": {"health_score": new_score, "status": "sain" if new_score >= 75 else ("surveillance" if new_score >= 55 else "malade")}})
        conf = random.randint(70, 95)
        alert = await _make_alert(user["id"], farm, cfg["severity"], cfg["label"],
                                  f"Sujet {target} — {cfg['label'].lower()}, confiance {conf}%.",
                                  cfg["action"], "sante")
    else:
        etype = random.choice(list(SECURITY_EVENT_TYPES.keys()))
        cfg = SECURITY_EVENT_TYPES[etype]
        await _db.elevage_security_events.insert_one({
            "id": str(uuid.uuid4()), "farm_id": farm["id"], "user_id": user["id"], "type": etype,
            "severity": cfg["severity"], "detected_at": _iso(), "acknowledged_at": None, "source": "camera_ir",
        })
        alert = await _make_alert(user["id"], farm, cfg["severity"], cfg["label"],
                                  f"{cfg['label']} dans {farm['name']} à l'instant.", cfg["action"], "securite")
    return {"success": True, "alert": alert}


@router.get("/animals/{animal_id}/feed-recommendation")
async def feed_recommendation(animal_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    animal = await _db.elevage_animals.find_one({"id": animal_id, "user_id": user["id"]}, {"_id": 0})
    if not animal:
        raise HTTPException(404, "Animal non trouvé")
    sp = SPECIES[animal["species"]]
    target_weight = round(sp["adult_w"][1] * 0.85, 1)
    gap = max(0, target_weight - animal["weight_kg"])
    days = max(7, round(gap / sp["gain_day"])) if gap > 0 else 0
    daily_ration = round(animal["weight_kg"] * (0.03 if animal["species"] != "volaille" else 0.05), 2)

    feed_terms = "|".join(sp["feed"])
    products = await _db.marketplace_products.find(
        {"$or": [{"title": {"$regex": feed_terms, "$options": "i"}}, {"name": {"$regex": feed_terms, "$options": "i"}}, {"category": {"$regex": "aliment|intrant|semence", "$options": "i"}}]},
        {"_id": 0, "id": 1, "title": 1, "name": 1, "price": 1, "price_per_unit": 1, "unit": 1, "category": 1},
    ).to_list(3)
    if not products:
        products = await _db.products.find({}, {"_id": 0, "id": 1, "name": 1, "title": 1, "price": 1, "unit": 1, "category": 1}).to_list(3)

    recommendation = {
        "animal_tag": animal["tag"],
        "current_weight": animal["weight_kg"],
        "target_weight": target_weight,
        "days_to_target": days,
        "daily_ration_kg": daily_ration,
        "ingredients": sp["feed"],
        "advice": (
            f"Pour atteindre {target_weight} kg d'ici {days} jours, servez {daily_ration} kg/jour "
            f"de ration à base de {sp['feed'][0]} enrichie en {sp['feed'][1]}. "
            f"Augmentez de 10-15% en période de croissance rapide."
            if gap > 0 else
            f"Poids cible atteint ({animal['weight_kg']} kg) — ration d'entretien de {daily_ration} kg/jour recommandée. Moment favorable pour la vente."
        ),
        "marketplace_products": products,
    }
    await _db.elevage_feed_recommendations.insert_one(dict(recommendation) | {"id": str(uuid.uuid4()), "animal_id": animal_id, "user_id": user["id"], "created_at": _iso()})
    return recommendation


@router.get("/farms/{farm_id}/price-prediction")
async def price_prediction(farm_id: str, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    farm = await _db.elevage_farms.find_one({"id": farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    sp = SPECIES[farm["species"]]
    animals = await _db.elevage_animals.find({"farm_id": farm_id}, {"_id": 0}).to_list(1000)

    base_price = sum(sp["price_kg"]) / 2
    month = _now().month
    seasonal = 1.15 if month in (11, 12, 1) else (0.95 if month in (6, 7, 8) else 1.0)
    current_price = round(base_price * seasonal)
    forecast = []
    p = current_price
    for i in range(1, 7):
        p = round(p * random.uniform(0.98, 1.05))
        forecast.append({"month": (_now() + timedelta(days=30 * i)).strftime("%b %Y"), "price_kg": p})

    best = max(forecast, key=lambda x: x["price_kg"])
    herd_value = round(sum(a["weight_kg"] * current_price * a.get("group_count", 1) for a in animals))
    return {
        "farm": {"id": farm["id"], "name": farm["name"], "species": farm["species"], "species_label": sp["label"]},
        "current_price_kg": current_price,
        "seasonal_factor": seasonal,
        "region": "Centre (Yaoundé)",
        "forecast": forecast,
        "optimal_sale": {"month": best["month"], "price_kg": best["price_kg"], "gain_pct": round((best["price_kg"] / current_price - 1) * 100, 1)},
        "herd_value_fcfa": herd_value,
        "advice": f"Prix actuel : {current_price} FCFA/kg. Vente optimale estimée en {best['month']} ({best['price_kg']} FCFA/kg, +{round((best['price_kg']/current_price-1)*100,1)}%). La demande monte en fin d'année (fêtes).",
    }


@router.get("/whatsapp/config")
async def whatsapp_config(request: Request):
    _check_enabled()
    await _user_from_request(request)
    provider = _wa_provider()
    return {
        "configured": provider is not None,
        "provider": provider or "simulation",
        "required_keys": {
            "meta": ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
            "twilio": ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"],
        },
    }


GEOFENCE_RADIUS_M = 300


@router.get("/farms/{farm_id}/collars")
async def farm_collars(farm_id: str, request: Request):
    """Colliers GPS simulés : positions du troupeau + géo-clôture, alerte si évasion."""
    _check_enabled()
    user = await _user_from_request(request)
    farm = await _db.elevage_farms.find_one({"id": farm_id, "user_id": user["id"]}, {"_id": 0})
    if not farm:
        raise HTTPException(404, "Installation non trouvée")
    animals = await _db.elevage_animals.find({"farm_id": farm_id, "is_group": False}, {"_id": 0, "id": 1, "tag": 1, "species": 1, "health_score": 1}).to_list(200)
    center = farm.get("gps_zone", {"lat": 3.848, "lng": 11.502})
    deg_radius = GEOFENCE_RADIUS_M / 111000.0

    collars, escaped = [], []
    for i, a in enumerate(animals):
        outside = random.random() < 0.06
        r = deg_radius * (random.uniform(1.1, 1.6) if outside else random.uniform(0.05, 0.9))
        angle = random.uniform(0, 6.283)
        import math
        lat = center["lat"] + r * math.cos(angle)
        lng = center["lng"] + r * math.sin(angle)
        collar = {
            "device_id": f"COL-{a['tag']}",
            "animal_id": a["id"],
            "animal_tag": a["tag"],
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "battery_level": random.randint(35, 100),
            "inside_fence": not outside,
            "activity": random.choice(["pâturage", "repos", "déplacement", "rumination"]),
            "last_sync": _iso(),
            "health_score": a["health_score"],
        }
        collars.append(collar)
        if outside:
            escaped.append(collar)
        await _db.elevage_collars.update_one({"animal_id": a["id"]}, {"$set": dict(collar)}, upsert=True)

    alert = None
    if escaped:
        tags = ", ".join(c["animal_tag"] for c in escaped)
        alert = await _make_alert(user["id"], farm, "urgent", "Géo-clôture franchie",
                                  f"Collier GPS : {tags} détecté(s) hors de la zone autorisée ({GEOFENCE_RADIUS_M}m) de {farm['name']}.",
                                  "Localiser sur la carte et ramener l'animal", "geofence")
    return {"farm": {"id": farm["id"], "name": farm["name"], "species": farm["species"]},
            "center": center, "geofence_radius_m": GEOFENCE_RADIUS_M, "collars": collars,
            "escaped_count": len(escaped), "alert": alert}


@router.get("/cooperative/dashboard")
async def cooperative_dashboard(request: Request):
    """Vue agrégée multi-fermes pour coopératives/admins."""
    _check_enabled()
    user = await _user_from_request(request)
    if user.get("role") not in ("admin", "agronomist", "cooperative", "financial", "farmer"):
        raise HTTPException(403, "Accès réservé aux coopératives et administrateurs")

    farms = await _db.elevage_farms.find({}, {"_id": 0}).to_list(500)
    farm_ids = [f["id"] for f in farms]
    animals = await _db.elevage_animals.find({"farm_id": {"$in": farm_ids}}, {"_id": 0, "farm_id": 1, "species": 1, "group_count": 1, "health_score": 1, "status": 1, "weight_kg": 1}).to_list(5000)
    owner_ids = list({f["user_id"] for f in farms})
    owners = await _db.users.find({"id": {"$in": owner_ids}}, {"_id": 0, "id": 1, "full_name": 1, "email": 1}).to_list(200)
    owner_map = {o["id"]: o.get("full_name") or o.get("email", "Éleveur") for o in owners}

    by_farm = {}
    for a in animals:
        d = by_farm.setdefault(a["farm_id"], {"count": 0, "health_sum": 0, "n": 0, "sick": 0})
        d["count"] += a.get("group_count", 1)
        d["health_sum"] += a["health_score"]
        d["n"] += 1
        if a["status"] == "malade":
            d["sick"] += 1

    farms_out = []
    for f in farms:
        d = by_farm.get(f["id"], {"count": 0, "health_sum": 0, "n": 0, "sick": 0})
        active = await _db.elevage_alerts.count_documents({"farm_id": f["id"], "acknowledged_at": None})
        farms_out.append({
            "id": f["id"], "name": f["name"], "species": f["species"],
            "species_label": SPECIES[f["species"]]["label"],
            "owner": owner_map.get(f["user_id"], "Éleveur"),
            "total": d["count"],
            "avg_health": round(d["health_sum"] / d["n"], 1) if d["n"] else 0,
            "sick": d["sick"], "active_alerts": active,
        })
    farms_out.sort(key=lambda x: x["active_alerts"], reverse=True)

    by_species = {}
    for a in animals:
        by_species[a["species"]] = by_species.get(a["species"], 0) + a.get("group_count", 1)
    return {
        "total_farms": len(farms),
        "total_members": len(owner_ids),
        "total_animals": sum(a.get("group_count", 1) for a in animals),
        "by_species": [{"species": k, "label": SPECIES[k]["label"], "count": v} for k, v in by_species.items()],
        "avg_health": round(sum(a["health_score"] for a in animals) / len(animals), 1) if animals else 0,
        "total_active_alerts": sum(f["active_alerts"] for f in farms_out),
        "mortality_rate": round(random.uniform(0.5, 2.0), 1),
        "farms": farms_out[:50],
    }


DIAGNOSE_PROMPT = """Tu es un vétérinaire expert en élevage africain (bovins, porcins, ovins, volailles) pour AGRICAM Élevage IA au Cameroun.
Analyse la photo de l'animal fournie et réponds UNIQUEMENT en JSON strict :
{
  "diagnosis": "diagnostic probable en français simple",
  "health_status": "sain|surveillance|malade|critique",
  "confidence": 0-100,
  "symptoms": ["symptôme visible 1", "symptôme 2"],
  "recommendations": ["action concrète 1", "action 2", "action 3"],
  "consult_vet": true/false,
  "severity": "info|attention|urgent|critique"
}
Sois concret, adapté au contexte rural camerounais (traitements accessibles localement). Si l'image ne montre pas un animal, indique-le dans diagnosis avec health_status "sain" et confidence faible."""


@router.post("/diagnose")
async def diagnose_animal(data: DiagnoseRequest, request: Request):
    _check_enabled()
    user = await _user_from_request(request)
    sp_label = SPECIES[data.species]["label"]
    models = [("gemini", "gemini-2.5-flash"), ("openai", "gpt-4o-mini"), ("gemini", "gemini-2.0-flash")]
    last_err = None
    for provider, model_name in models:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"elevage-diag-{user['id']}-{uuid.uuid4()}",
                system_message=DIAGNOSE_PROMPT,
            ).with_model(provider, model_name)
            b64 = data.image_base64.split(",", 1)[1] if data.image_base64.startswith("data:") else data.image_base64
            response = await chat.send_message(UserMessage(
                text=f"Espèce déclarée : {sp_label}. Analyse cette photo d'animal et donne ton diagnostic vétérinaire.",
                file_contents=[ImageContent(image_base64=b64)],
            ))
            try:
                match = re.search(r"\{.*\}", response, re.DOTALL)
                result = json.loads(match.group()) if match else {"diagnosis": response, "health_status": "surveillance", "confidence": 60, "symptoms": [], "recommendations": [response], "consult_vet": False, "severity": "info"}
            except Exception:
                result = {"diagnosis": response, "health_status": "surveillance", "confidence": 60, "symptoms": [], "recommendations": [response], "consult_vet": False, "severity": "info"}

            event = {
                "id": str(uuid.uuid4()), "animal_id": data.animal_id, "farm_id": data.farm_id, "user_id": user["id"],
                "type": "diagnostic_photo", "label": result.get("diagnosis", "Diagnostic photo"),
                "confidence": result.get("confidence", 60), "detected_at": _iso(),
                "resolved_at": None, "vet_notes": None, "source": "diagnostic_ia",
                "result": result,
            }
            await _db.elevage_health_events.insert_one(dict(event))

            if result.get("severity") in ("urgent", "critique") and data.farm_id:
                farm = await _db.elevage_farms.find_one({"id": data.farm_id, "user_id": user["id"]}, {"_id": 0})
                if farm:
                    await _make_alert(user["id"], farm, result["severity"], "Diagnostic IA : intervention requise",
                                      f"{result.get('diagnosis', '')} (confiance {result.get('confidence', 0)}%).",
                                      result.get("recommendations", ["Consulter un vétérinaire"])[0], "diagnostic")
            return {"success": True, "result": result, "model": f"{provider}/{model_name}"}
        except Exception as e:
            last_err = str(e)
            logger.warning(f"Elevage diagnose {provider}/{model_name} failed: {e}")
            continue
    raise HTTPException(503, f"Analyse IA indisponible : {last_err}")
