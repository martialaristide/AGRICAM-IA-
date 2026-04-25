"""
AGRICAM IA - Drone Management Module
API for fleet management, mission planning, telemetry, and photo analysis.
Supports DJI Mini 3 Pro via companion app bridge or manual upload.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/drone-manager", tags=["Drones"])

# ============================================================
# MODELS
# ============================================================
class DroneRegister(BaseModel):
    name: str
    model: str = "DJI Mini 3 Pro"
    serial_number: Optional[str] = None
    controller_type: str = "DJI RC"

class MissionCreate(BaseModel):
    name: str
    drone_id: str
    mission_type: str = "survey"  # survey, inspection, spray, mapping
    waypoints: List[dict] = []  # [{lat, lng, alt, action}]
    altitude_m: float = 50.0
    speed_ms: float = 5.0
    overlap_percent: float = 75.0
    camera_angle: float = -90.0
    auto_return: bool = True
    notes: Optional[str] = None

class TelemetryData(BaseModel):
    drone_id: str
    latitude: float
    longitude: float
    altitude: float
    battery_percent: float
    speed: float = 0.0
    heading: float = 0.0
    gps_signal: int = 5
    status: str = "flying"
    wind_speed: Optional[float] = None
    temperature: Optional[float] = None

class PhotoUpload(BaseModel):
    drone_id: str
    mission_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    analysis_type: str = "general"  # general, ndvi, disease, count

# ============================================================
# ENDPOINTS
# ============================================================

def get_db():
    from server import db
    return db

@router.get("/fleet")
async def get_fleet():
    """Get all registered drones"""
    db = get_db()
    drones = await db.drones.find({}, {"_id": 0}).to_list(100)
    if not drones:
        # Return demo data
        drones = [
            {
                "id": "drone-001", "name": "Mini 3 Pro - Alpha", "model": "DJI Mini 3 Pro",
                "serial_number": "3NZDL4R001G5RW", "controller_type": "DJI RC",
                "status": "ready", "battery": 98, "flights_count": 47,
                "total_flight_time_min": 312, "total_area_ha": 156.4,
                "last_maintenance": "2026-04-10", "firmware": "v01.00.0700",
                "registered_at": "2026-01-15T10:00:00Z"
            },
            {
                "id": "drone-002", "name": "Mini 3 Pro - Beta", "model": "DJI Mini 3 Pro",
                "serial_number": "3NZDL4R001H8QP", "controller_type": "DJI RC",
                "status": "maintenance", "battery": 42, "flights_count": 23,
                "total_flight_time_min": 148, "total_area_ha": 78.2,
                "last_maintenance": "2026-03-28", "firmware": "v01.00.0650",
                "registered_at": "2026-02-20T14:30:00Z"
            }
        ]
    return {"drones": drones, "total": len(drones)}

@router.post("/fleet")
async def register_drone(data: DroneRegister):
    """Register a new drone"""
    db = get_db()
    drone = {
        "id": f"drone-{uuid.uuid4().hex[:8]}",
        "name": data.name, "model": data.model,
        "serial_number": data.serial_number or f"SN-{uuid.uuid4().hex[:10].upper()}",
        "controller_type": data.controller_type,
        "status": "ready", "battery": 100, "flights_count": 0,
        "total_flight_time_min": 0, "total_area_ha": 0,
        "last_maintenance": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "firmware": "v01.00.0700",
        "registered_at": datetime.now(timezone.utc).isoformat()
    }
    await db.drones.insert_one(drone)
    drone.pop("_id", None)
    return {"drone": drone}

@router.delete("/fleet/{drone_id}")
async def remove_drone(drone_id: str):
    """Remove a drone from fleet"""
    db = get_db()
    await db.drones.delete_one({"id": drone_id})
    return {"message": "Drone supprime"}

@router.get("/missions")
async def get_missions():
    """Get all missions"""
    db = get_db()
    missions = await db.drone_missions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    if not missions:
        missions = [
            {
                "id": "mission-001", "name": "Surveillance Parcelle Nord", "drone_id": "drone-001",
                "mission_type": "survey", "status": "completed", "altitude_m": 50,
                "speed_ms": 5.0, "overlap_percent": 75, "camera_angle": -90,
                "waypoints": [
                    {"lat": 4.0510, "lng": 9.6960, "alt": 50, "action": "photo"},
                    {"lat": 4.0520, "lng": 9.6970, "alt": 50, "action": "photo"},
                    {"lat": 4.0530, "lng": 9.6980, "alt": 50, "action": "photo"},
                    {"lat": 4.0520, "lng": 9.6990, "alt": 50, "action": "photo"},
                ],
                "area_covered_ha": 12.5, "photos_taken": 48,
                "duration_min": 22, "distance_km": 3.2,
                "created_at": "2026-04-20T08:30:00Z", "completed_at": "2026-04-20T08:52:00Z"
            },
            {
                "id": "mission-002", "name": "Inspection Cacao Zone Est", "drone_id": "drone-001",
                "mission_type": "inspection", "status": "planned", "altitude_m": 30,
                "speed_ms": 3.0, "overlap_percent": 80, "camera_angle": -45,
                "waypoints": [
                    {"lat": 4.0550, "lng": 9.7010, "alt": 30, "action": "video"},
                    {"lat": 4.0560, "lng": 9.7020, "alt": 30, "action": "video"},
                ],
                "area_covered_ha": 0, "photos_taken": 0,
                "duration_min": 0, "distance_km": 0,
                "created_at": "2026-04-22T14:00:00Z", "completed_at": None
            }
        ]
    return {"missions": missions, "total": len(missions)}

@router.post("/missions")
async def create_mission(data: MissionCreate):
    """Create a new drone mission"""
    db = get_db()
    mission = {
        "id": f"mission-{uuid.uuid4().hex[:8]}",
        "name": data.name, "drone_id": data.drone_id,
        "mission_type": data.mission_type, "status": "planned",
        "altitude_m": data.altitude_m, "speed_ms": data.speed_ms,
        "overlap_percent": data.overlap_percent, "camera_angle": data.camera_angle,
        "auto_return": data.auto_return, "notes": data.notes,
        "waypoints": data.waypoints,
        "area_covered_ha": 0, "photos_taken": 0,
        "duration_min": 0, "distance_km": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    await db.drone_missions.insert_one(mission)
    mission.pop("_id", None)
    return {"mission": mission}

@router.put("/missions/{mission_id}/status")
async def update_mission_status(mission_id: str, status: str = "in_progress"):
    """Update mission status: planned, in_progress, completed, aborted"""
    db = get_db()
    update_data = {"status": status}
    if status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    await db.drone_missions.update_one({"id": mission_id}, {"$set": update_data})
    return {"message": f"Mission {status}"}

@router.post("/telemetry")
async def receive_telemetry(data: TelemetryData):
    """Receive telemetry from drone companion app"""
    db = get_db()
    telemetry = {
        "id": f"telem-{uuid.uuid4().hex[:8]}",
        "drone_id": data.drone_id,
        "latitude": data.latitude, "longitude": data.longitude,
        "altitude": data.altitude, "battery_percent": data.battery_percent,
        "speed": data.speed, "heading": data.heading,
        "gps_signal": data.gps_signal, "status": data.status,
        "wind_speed": data.wind_speed, "temperature": data.temperature,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.drone_telemetry.insert_one(telemetry)
    # Update drone status
    await db.drones.update_one(
        {"id": data.drone_id}, 
        {"$set": {"battery": data.battery_percent, "status": data.status, "last_position": {"lat": data.latitude, "lng": data.longitude}}}
    )
    telemetry.pop("_id", None)
    return {"received": True, "telemetry_id": telemetry["id"]}

@router.get("/telemetry/{drone_id}")
async def get_telemetry(drone_id: str, limit: int = 50):
    """Get recent telemetry for a drone"""
    db = get_db()
    data = await db.drone_telemetry.find({"drone_id": drone_id}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    return {"telemetry": data}

@router.get("/photos")
async def get_drone_photos(mission_id: Optional[str] = None):
    """Get drone photos, optionally filtered by mission"""
    db = get_db()
    query = {}
    if mission_id:
        query["mission_id"] = mission_id
    photos = await db.drone_photos.find(query, {"_id": 0}).sort("captured_at", -1).to_list(100)
    if not photos:
        # Demo photos
        photos = [
            {
                "id": "photo-001", "drone_id": "drone-001", "mission_id": "mission-001",
                "filename": "parcelle_nord_001.jpg",
                "url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
                "latitude": 4.0510, "longitude": 9.6960, "altitude": 50,
                "analysis": {"ndvi": 0.72, "health": "Bon", "disease_detected": False, "crop_type": "Mais", "growth_stage": "Floraison"},
                "captured_at": "2026-04-20T08:35:00Z"
            },
            {
                "id": "photo-002", "drone_id": "drone-001", "mission_id": "mission-001",
                "filename": "parcelle_nord_002.jpg",
                "url": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
                "latitude": 4.0520, "longitude": 9.6970, "altitude": 50,
                "analysis": {"ndvi": 0.45, "health": "Stress hydrique", "disease_detected": True, "crop_type": "Mais", "disease": "Mildiou - stade initial", "recommendation": "Traitement fongicide recommande"},
                "captured_at": "2026-04-20T08:38:00Z"
            },
            {
                "id": "photo-003", "drone_id": "drone-001", "mission_id": "mission-001",
                "filename": "parcelle_nord_003.jpg",
                "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                "latitude": 4.0530, "longitude": 9.6980, "altitude": 50,
                "analysis": {"ndvi": 0.85, "health": "Excellent", "disease_detected": False, "crop_type": "Mais", "growth_stage": "Maturation"},
                "captured_at": "2026-04-20T08:42:00Z"
            }
        ]
    return {"photos": photos, "total": len(photos)}

@router.get("/simulation/telemetry")
async def simulate_telemetry():
    """Generate simulated drone telemetry for testing without hardware"""
    import random, math
    base_lat, base_lng = 4.0510, 9.6960
    t = datetime.now(timezone.utc).timestamp()
    
    # Simulate circular flight pattern
    angle = (t % 120) / 120 * 2 * math.pi
    radius = 0.005
    
    return {
        "drone_id": "drone-001",
        "latitude": base_lat + radius * math.cos(angle),
        "longitude": base_lng + radius * math.sin(angle),
        "altitude": 50 + 5 * math.sin(angle * 2),
        "battery_percent": max(20, 100 - (t % 1800) / 18),
        "speed": 4.5 + random.uniform(-1, 1),
        "heading": (angle * 180 / math.pi) % 360,
        "gps_signal": random.choice([4, 5, 5, 5]),
        "status": "flying",
        "wind_speed": round(random.uniform(2, 8), 1),
        "temperature": round(random.uniform(24, 32), 1),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/stats")
async def get_drone_stats():
    """Get aggregated drone statistics"""
    db = get_db()
    total_drones = await db.drones.count_documents({})
    total_missions = await db.drone_missions.count_documents({})
    completed_missions = await db.drone_missions.count_documents({"status": "completed"})
    total_photos = await db.drone_photos.count_documents({})
    
    return {
        "total_drones": max(total_drones, 2),
        "total_missions": max(total_missions, 2),
        "completed_missions": max(completed_missions, 1),
        "total_photos": max(total_photos, 3),
        "total_flight_time_hours": 7.7,
        "total_area_surveyed_ha": 234.6,
        "avg_battery_usage": 65,
        "success_rate": 96.5
    }
