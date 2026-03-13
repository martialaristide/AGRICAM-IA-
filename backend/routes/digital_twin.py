"""
AGRICAM IA 2.0 - Digital Twin: Seed Simulation for Seed Analysts
AI-powered seed variety simulation and genomic modeling
"""
from fastapi import APIRouter, Depends
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import random

router = APIRouter(prefix="/api/digital-twin", tags=["Digital Twin"])


class SimulationRequest(BaseModel):
    variety: str = "Mais CAMIR-01"
    climate_scenario: str = "tropical_humide"
    soil_type: str = "ferralitique"
    rainfall_mm: float = 1200
    temperature_avg: float = 26
    simulation_years: int = 5
    num_scenarios: int = 1000


class GenomicAnalysisRequest(BaseModel):
    variety: str = "Mais CAMIR-01"
    target_trait: str = "yield"
    parent1: Optional[str] = None
    parent2: Optional[str] = None


@router.get("/simulations")
async def get_simulations(user=Depends(get_current_user)):
    """Get all digital twin simulation results"""
    sims = await db.digital_twin_sims.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    if not sims:
        return [
            {"id": "sim-1", "variety": "Mais CAMIR-01", "scenarios_run": 10000, "avg_yield": 4.5, "yield_range": "3.8 - 5.2", "resilience_score": 87, "best_climate": "Tropical humide", "worst_climate": "Sahel aride", "created_at": "2026-03-01T10:00:00Z"},
            {"id": "sim-2", "variety": "Riz Nerica-L19", "scenarios_run": 8500, "avg_yield": 3.5, "yield_range": "2.9 - 4.1", "resilience_score": 79, "best_climate": "Equatorial", "worst_climate": "Semi-aride", "created_at": "2026-02-28T14:30:00Z"},
            {"id": "sim-3", "variety": "Sorgho S35", "scenarios_run": 12000, "avg_yield": 2.6, "yield_range": "1.8 - 3.5", "resilience_score": 93, "best_climate": "Soudano-sahelien", "worst_climate": "Equatorial humide", "created_at": "2026-02-25T09:15:00Z"},
        ]
    return sims


@router.post("/simulate")
async def run_simulation(data: SimulationRequest, user=Depends(get_current_user)):
    """Run a digital twin simulation using AI"""
    system_prompt = """Tu es un geneticien agricole expert en modelisation. Simule le comportement d'une variete 
de semence dans les conditions donnees. Reponds en JSON:
{
  "avg_yield_t_ha": nombre,
  "yield_min": nombre,
  "yield_max": nombre,
  "resilience_score": 0-100,
  "drought_tolerance": 0-100,
  "flood_tolerance": 0-100,
  "pest_resistance": 0-100,
  "disease_resistance": 0-100,
  "optimal_planting_month": "mois",
  "maturity_days": nombre,
  "water_requirement_mm": nombre,
  "fertilizer_npk": "ratio",
  "risk_factors": ["risque1", "risque2"],
  "yield_by_year": [nombre1, nombre2, nombre3, nombre4, nombre5],
  "confidence_interval": pourcentage,
  "recommendation": "texte"
}"""

    user_prompt = f"""Variete: {data.variety}
Climat: {data.climate_scenario}, Sol: {data.soil_type}
Pluviometrie: {data.rainfall_mm}mm/an, Temperature moyenne: {data.temperature_avg}C
Duree simulation: {data.simulation_years} ans, Scenarios: {data.num_scenarios}"""

    response, model = await ai_analyze(system_prompt, user_prompt, "digital-twin")
    base_yield = 3.5 + random.uniform(-0.5, 1.5)
    result = parse_ai_json(response, {
        "avg_yield_t_ha": round(base_yield, 1),
        "yield_min": round(base_yield - 1, 1), "yield_max": round(base_yield + 1.2, 1),
        "resilience_score": random.randint(65, 95), "drought_tolerance": random.randint(50, 90),
        "flood_tolerance": random.randint(40, 85), "pest_resistance": random.randint(60, 95),
        "disease_resistance": random.randint(55, 90), "optimal_planting_month": "Mars",
        "maturity_days": random.randint(90, 150), "water_requirement_mm": round(data.rainfall_mm * 0.8),
        "fertilizer_npk": "120-60-40", "risk_factors": ["Variabilite climatique", "Pression parasitaire"],
        "yield_by_year": [round(base_yield + random.uniform(-0.3, 0.5), 1) for _ in range(data.simulation_years)],
        "confidence_interval": 85, "recommendation": "Variete adaptee aux conditions specifiees"
    })

    doc = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "variety": data.variety,
        "climate": data.climate_scenario, "soil": data.soil_type,
        "scenarios_run": data.num_scenarios, "result": result, "model": model,
        "avg_yield": result.get("avg_yield_t_ha", base_yield),
        "yield_range": f"{result.get('yield_min', base_yield-1)} - {result.get('yield_max', base_yield+1)}",
        "resilience_score": result.get("resilience_score", 75),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.digital_twin_sims.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "simulation": doc}


@router.post("/genomic-analysis")
async def genomic_analysis(data: GenomicAnalysisRequest, user=Depends(get_current_user)):
    """AI-powered genomic trait analysis"""
    system_prompt = """Tu es un expert en genomique vegetale. Analyse les traits genetiques d'une variete.
Reponds en JSON:
{
  "genes_analyzed": [
    {"gene": "nom", "trait": "description", "expression_score": 0-100, "crispr_feasibility": "Possible|Validee|En etude", "risk": "Faible|Modere|Eleve"}
  ],
  "crossing_potential": [
    {"parent1": "var1", "parent2": "var2", "offspring_id": "HYB-xxx", "hybrid_vigor": 0-100, "yield_gain_percent": "+xx%", "resistance": "Faible|Moyenne|Elevee"}
  ],
  "overall_genetic_score": 0-100,
  "biodiversity_index": 0.0-1.0,
  "recommendations": ["conseil1", "conseil2"]
}"""

    response, model = await ai_analyze(system_prompt, f"Variete: {data.variety}, Trait cible: {data.target_trait}", "genomic")
    result = parse_ai_json(response, {
        "genes_analyzed": [
            {"gene": "Wx (Amylose)", "trait": "Potentiel de rendement", "expression_score": 88, "crispr_feasibility": "Possible", "risk": "Faible"},
            {"gene": "Bt (Cry1Ab)", "trait": "Resistance insectes", "expression_score": 94, "crispr_feasibility": "Validee", "risk": "Tres faible"},
            {"gene": "Sub1A", "trait": "Tolerance inondation", "expression_score": 76, "crispr_feasibility": "En etude", "risk": "Modere"},
            {"gene": "DREB1", "trait": "Resistance secheresse", "expression_score": 82, "crispr_feasibility": "Possible", "risk": "Faible"},
        ],
        "crossing_potential": [
            {"parent1": data.variety, "parent2": "DT-STR", "offspring_id": "HYB-001", "hybrid_vigor": 92, "yield_gain_percent": "+18%", "resistance": "Elevee"},
        ],
        "overall_genetic_score": 84,
        "biodiversity_index": 0.72,
        "recommendations": ["Poursuivre la selection pour la resistance a la secheresse", "Tester le croisement HYB-001 en conditions reelles"]
    })

    return {"success": True, "analysis": result, "model": model, "variety": data.variety}


@router.get("/seed-batches")
async def get_seed_batches(user=Depends(get_current_user)):
    """Get seed batch inventory with quality metrics"""
    batches = await db.seed_batches.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    if not batches:
        return [
            {"id": "SB-001", "variety": "Mais CAMIR-01", "origin": "IRAD Nkolbisson", "germination": 94, "purity": 98.5, "moisture": 11.2, "status": "certified", "quantity_kg": 500, "date": "2026-01-15"},
            {"id": "SB-002", "variety": "Riz Nerica-L19", "origin": "IRAD Wakwa", "germination": 88, "purity": 97.8, "moisture": 12.1, "status": "pending", "quantity_kg": 300, "date": "2026-02-01"},
            {"id": "SB-003", "variety": "Sorgho S35", "origin": "Import Nigeria", "germination": 72, "purity": 95.2, "moisture": 13.5, "status": "rejected", "quantity_kg": 200, "date": "2026-02-10"},
            {"id": "SB-004", "variety": "Arachide RMP-12", "origin": "IRAD Maroua", "germination": 91, "purity": 99.1, "moisture": 8.4, "status": "certified", "quantity_kg": 450, "date": "2026-01-28"},
            {"id": "SB-005", "variety": "Haricot MAC-44", "origin": "Local Bafoussam", "germination": 85, "purity": 96.7, "moisture": 10.8, "status": "testing", "quantity_kg": 150, "date": "2026-02-20"},
        ]
    return batches
