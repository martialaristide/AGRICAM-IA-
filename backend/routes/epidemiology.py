"""
AGRICAM IA 2.0 - Epidemiological Modeling for Agronomists
AI-powered disease spread prediction and intervention planning
"""
from fastapi import APIRouter, Depends
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import random

router = APIRouter(prefix="/api/epidemiology", tags=["Epidemiology"])


class DiseaseAnalysisRequest(BaseModel):
    disease_name: str = "Rouille du mais"
    region: str = "Centre"
    crop_type: str = "Mais"
    affected_area_ha: float = 10
    severity: str = "medium"
    weather_conditions: Optional[str] = "Humide, 28C"


class InterventionRequest(BaseModel):
    disease_name: str
    region: str
    crop_type: str
    budget_xaf: Optional[float] = 500000


@router.get("/alerts")
async def get_disease_alerts(user=Depends(get_current_user)):
    """Get current disease outbreak alerts"""
    alerts = await db.disease_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(20)
    if not alerts:
        return [
            {"id": "da-1", "disease": "Rouille du mais", "zone": "Centre", "risk_percent": 78, "spread_rate": "Haute",
             "affected_farms": 12, "affected_area_ha": 45, "action": "Traitement fongicide urgent",
             "trend": "increasing", "first_detected": "2026-02-28", "predicted_peak": "2026-03-20"},
            {"id": "da-2", "disease": "Pyriculariose du riz", "zone": "Extreme-Nord", "risk_percent": 65, "spread_rate": "Moyenne",
             "affected_farms": 8, "affected_area_ha": 28, "action": "Surveillance renforcee",
             "trend": "stable", "first_detected": "2026-03-05", "predicted_peak": "2026-04-01"},
            {"id": "da-3", "disease": "Pourriture brune cacao", "zone": "Sud-Ouest", "risk_percent": 42, "spread_rate": "Faible",
             "affected_farms": 3, "affected_area_ha": 12, "action": "Prevention recommandee",
             "trend": "decreasing", "first_detected": "2026-02-20", "predicted_peak": "2026-03-10"},
            {"id": "da-4", "disease": "Chenille legionnaire", "zone": "Nord", "risk_percent": 85, "spread_rate": "Tres haute",
             "affected_farms": 25, "affected_area_ha": 120, "action": "Intervention d'urgence biologique",
             "trend": "increasing", "first_detected": "2026-03-01", "predicted_peak": "2026-03-25"},
        ]
    return alerts


@router.post("/predict-spread")
async def predict_disease_spread(data: DiseaseAnalysisRequest, user=Depends(get_current_user)):
    """AI-powered disease spread prediction"""
    system_prompt = """Tu es un epidemiologiste vegetal expert en Afrique. Previs la propagation d'une maladie des cultures.
Reponds en JSON:
{
  "current_risk_percent": 0-100,
  "predicted_spread_km2_per_week": nombre,
  "peak_date": "YYYY-MM-DD",
  "total_area_at_risk_ha": nombre,
  "farms_at_risk": nombre,
  "spread_factors": ["facteur1", "facteur2"],
  "containment_probability_percent": 0-100,
  "economic_impact_xaf": nombre,
  "weekly_progression": [
    {"week": 1, "area_ha": nombre, "risk": nombre},
    {"week": 2, "area_ha": nombre, "risk": nombre},
    {"week": 3, "area_ha": nombre, "risk": nombre},
    {"week": 4, "area_ha": nombre, "risk": nombre}
  ],
  "recommended_interventions": [
    {"action": "description", "priority": "immediate|urgent|planifie", "cost_xaf": nombre, "efficacy_percent": nombre}
  ],
  "summary": "resume"
}"""

    user_prompt = f"""Maladie: {data.disease_name}, Region: {data.region}, Culture: {data.crop_type}
Surface touchee: {data.affected_area_ha} ha, Severite: {data.severity}
Conditions meteo: {data.weather_conditions}"""

    response, model = await ai_analyze(system_prompt, user_prompt, "epidemiology")
    result = parse_ai_json(response, {
        "current_risk_percent": 72, "predicted_spread_km2_per_week": 3.5,
        "peak_date": "2026-04-15", "total_area_at_risk_ha": data.affected_area_ha * 4,
        "farms_at_risk": max(5, int(data.affected_area_ha / 3)),
        "spread_factors": ["Humidite elevee", "Vents dominants", "Varietes sensibles"],
        "containment_probability_percent": 65,
        "economic_impact_xaf": int(data.affected_area_ha * 250000),
        "weekly_progression": [
            {"week": i+1, "area_ha": round(data.affected_area_ha * (1.3 ** (i+1)), 1), "risk": min(95, 50 + i * 12)}
            for i in range(4)
        ],
        "recommended_interventions": [
            {"action": "Application fongicide systémique", "priority": "immediate", "cost_xaf": 150000, "efficacy_percent": 85},
            {"action": "Destruction des plants infectes", "priority": "urgent", "cost_xaf": 50000, "efficacy_percent": 70},
        ],
        "summary": f"Risque eleve de propagation de {data.disease_name} dans la region {data.region}"
    })

    # Save prediction
    doc = {
        "id": str(uuid.uuid4()), "user_id": user["id"],
        "disease": data.disease_name, "region": data.region,
        "result": result, "model": model,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.disease_predictions.insert_one(doc)
    doc.pop("_id", None)

    return {"success": True, "prediction": result, "model": model}


@router.post("/intervention-plan")
async def generate_intervention_plan(data: InterventionRequest, user=Depends(get_current_user)):
    """Generate an optimal intervention plan for a disease outbreak"""
    system_prompt = """Tu es un agronome expert en lutte integree. Genere un plan d'intervention optimal.
Reponds en JSON:
{
  "plan_name": "nom",
  "total_cost_xaf": nombre,
  "duration_days": nombre,
  "phases": [
    {"phase": 1, "name": "nom", "actions": ["action1"], "duration_days": nombre, "cost_xaf": nombre, "resources": ["ressource1"]}
  ],
  "expected_efficacy_percent": nombre,
  "alternative_organic": {"description": "alternative bio", "cost_xaf": nombre, "efficacy_percent": nombre},
  "monitoring_protocol": "description du suivi"
}"""

    response, model = await ai_analyze(system_prompt,
        f"Maladie: {data.disease_name}, Region: {data.region}, Culture: {data.crop_type}, Budget: {data.budget_xaf} XAF",
        "intervention")

    result = parse_ai_json(response, {
        "plan_name": f"Plan d'intervention - {data.disease_name}",
        "total_cost_xaf": data.budget_xaf,
        "duration_days": 21,
        "phases": [
            {"phase": 1, "name": "Evaluation et diagnostic", "actions": ["Cartographie des zones touchees", "Prelevement d'echantillons"], "duration_days": 3, "cost_xaf": int(data.budget_xaf * 0.1), "resources": ["Equipe terrain", "Kit de prelevement"]},
            {"phase": 2, "name": "Traitement primaire", "actions": ["Application de fongicide", "Elimination des plants infectes"], "duration_days": 7, "cost_xaf": int(data.budget_xaf * 0.5), "resources": ["Fongicide", "Pulverisateur", "Main d'oeuvre"]},
            {"phase": 3, "name": "Suivi et prevention", "actions": ["Surveillance hebdomadaire", "Application preventive"], "duration_days": 11, "cost_xaf": int(data.budget_xaf * 0.4), "resources": ["Equipe de suivi", "Produits preventifs"]},
        ],
        "expected_efficacy_percent": 82,
        "alternative_organic": {"description": "Traitement a base de neem et trichoderma", "cost_xaf": int(data.budget_xaf * 0.7), "efficacy_percent": 68},
        "monitoring_protocol": "Visites terrain bi-hebdomadaires avec analyse photographique IA"
    })

    return {"success": True, "plan": result, "model": model}


@router.get("/carbon-tracking")
async def get_carbon_tracking(user=Depends(get_current_user)):
    """Get carbon sequestration and sustainability metrics"""
    return {
        "sequestration_tco2_ha_yr": 2.4,
        "biodiversity_index": 0.72,
        "soil_organic_matter_percent": 3.8,
        "carbon_credits_earned": 45,
        "certification_status": "En cours",
        "practices": [
            {"name": "Couverture vegetale", "impact": "+0.8 tCO2/ha/an", "adoption_percent": 67, "area_ha": 120},
            {"name": "Agroforesterie", "impact": "+1.2 tCO2/ha/an", "adoption_percent": 34, "area_ha": 65},
            {"name": "Semis direct", "impact": "+0.5 tCO2/ha/an", "adoption_percent": 52, "area_ha": 95},
            {"name": "Rotation diversifiee", "impact": "+0.3 tCO2/ha/an", "adoption_percent": 78, "area_ha": 140},
        ],
        "total_area_managed_ha": 420,
        "annual_target_tco2": 100,
        "current_progress_percent": 72,
    }
