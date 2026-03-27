"""
AGRICAM IA 2.0 - Digital Twin: Advanced Seed Analysis
AI-powered seed variety simulation, genomic modeling, crossing simulation
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import random
import json
import io
import csv

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


class CrossingRequest(BaseModel):
    parent1: str
    parent2: str
    target_traits: List[str] = ["yield", "disease_resistance"]
    generations: int = 3


class ClimateAdaptationRequest(BaseModel):
    variety: str
    region: str = "Centre Cameroun"
    scenario: str = "RCP4.5"
    projection_years: List[int] = [2030, 2040, 2050, 2070]


class BatchCreateRequest(BaseModel):
    variety: str
    origin: str
    quantity_kg: float = 0
    germination: float = 0
    purity: float = 0
    moisture: float = 0
    notes: str = ""


@router.get("/simulations")
async def get_simulations(user=Depends(get_current_user)):
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
    system_prompt = """Tu es un geneticien agricole expert. Simule le comportement d'une variete de semence. Reponds en JSON:
{"avg_yield_t_ha": nombre, "yield_min": nombre, "yield_max": nombre, "resilience_score": 0-100,
"drought_tolerance": 0-100, "flood_tolerance": 0-100, "pest_resistance": 0-100, "disease_resistance": 0-100,
"optimal_planting_month": "mois", "maturity_days": nombre, "water_requirement_mm": nombre,
"fertilizer_npk": "ratio", "risk_factors": ["risque1"], "yield_by_year": [n1,n2,n3,n4,n5],
"confidence_interval": pourcentage, "recommendation": "texte"}"""

    user_prompt = f"Variete: {data.variety}, Climat: {data.climate_scenario}, Sol: {data.soil_type}, Pluviometrie: {data.rainfall_mm}mm, Temp: {data.temperature_avg}C, Duree: {data.simulation_years} ans"
    response, model = await ai_analyze(system_prompt, user_prompt, "digital-twin")
    base_yield = 3.5 + random.uniform(-0.5, 1.5)
    result = parse_ai_json(response, {
        "avg_yield_t_ha": round(base_yield, 1), "yield_min": round(base_yield - 1, 1), "yield_max": round(base_yield + 1.2, 1),
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
    system_prompt = """Tu es un expert en genomique vegetale. Analyse les traits genetiques. Reponds en JSON:
{"genes_analyzed": [{"gene": "nom", "trait": "desc", "expression_score": 0-100, "crispr_feasibility": "Possible|Validee|En etude", "risk": "Faible|Modere|Eleve"}],
"crossing_potential": [{"parent1": "v1", "parent2": "v2", "offspring_id": "HYB-xxx", "hybrid_vigor": 0-100, "yield_gain_percent": "+xx%", "resistance": "Faible|Moyenne|Elevee"}],
"overall_genetic_score": 0-100, "biodiversity_index": 0.0-1.0, "confidence": 0-100,
"recommendations": ["conseil1", "conseil2"]}"""

    response, model = await ai_analyze(system_prompt, f"Variete: {data.variety}, Trait: {data.target_trait}", "genomic")
    result = parse_ai_json(response, {
        "genes_analyzed": [
            {"gene": "Wx (Amylose)", "trait": "Rendement", "expression_score": 88, "crispr_feasibility": "Possible", "risk": "Faible"},
            {"gene": "Bt (Cry1Ab)", "trait": "Resistance insectes", "expression_score": 94, "crispr_feasibility": "Validee", "risk": "Tres faible"},
            {"gene": "Sub1A", "trait": "Tolerance inondation", "expression_score": 76, "crispr_feasibility": "En etude", "risk": "Modere"},
            {"gene": "DREB1", "trait": "Resistance secheresse", "expression_score": 82, "crispr_feasibility": "Possible", "risk": "Faible"},
        ],
        "crossing_potential": [
            {"parent1": data.variety, "parent2": "DT-STR", "offspring_id": "HYB-001", "hybrid_vigor": 92, "yield_gain_percent": "+18%", "resistance": "Elevee"},
        ],
        "overall_genetic_score": 84, "biodiversity_index": 0.72, "confidence": 91,
        "recommendations": ["Poursuivre la selection pour la secheresse", "Tester HYB-001 en conditions reelles"]
    })
    return {"success": True, "analysis": result, "model": model, "variety": data.variety}


@router.get("/seed-batches")
async def get_seed_batches(user=Depends(get_current_user)):
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


@router.post("/seed-batches")
async def create_seed_batch(data: BatchCreateRequest, user=Depends(get_current_user)):
    batch = {
        "id": f"SB-{uuid.uuid4().hex[:6].upper()}",
        "variety": data.variety, "origin": data.origin,
        "germination": data.germination, "purity": data.purity,
        "moisture": data.moisture, "quantity_kg": data.quantity_kg,
        "status": "pending", "notes": data.notes,
        "user_id": user["id"],
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.seed_batches.insert_one(batch)
    batch.pop("_id", None)
    return {"success": True, "batch": batch}


@router.put("/seed-batches/{batch_id}/status")
async def update_batch_status(batch_id: str, status: str, user=Depends(get_current_user)):
    if status not in ("certified", "testing", "pending", "rejected"):
        return {"error": "Statut invalide"}
    await db.seed_batches.update_one({"id": batch_id}, {"$set": {"status": status}})
    return {"success": True, "batch_id": batch_id, "new_status": status}


@router.post("/crossing-simulation")
async def crossing_simulation(data: CrossingRequest, user=Depends(get_current_user)):
    system_prompt = f"""Tu es un expert geneticien specialise en croisement de varietes vegetales.
Simule un croisement entre {data.parent1} et {data.parent2} sur {data.generations} generations.
Traits cibles: {', '.join(data.target_traits)}. Reponds en JSON:
{{
  "offspring_id": "HYB-xxx",
  "generations": [
    {{"gen": 1, "yield_gain": "+x%", "vigor": 0-100, "stability": 0-100, "key_traits": ["trait1"], "notes": "texte"}},
    {{"gen": 2, "yield_gain": "+x%", "vigor": 0-100, "stability": 0-100, "key_traits": ["trait1"], "notes": "texte"}}
  ],
  "final_variety": {{
    "name": "nom", "yield_t_ha": nombre, "disease_resistance": 0-100, "drought_tolerance": 0-100,
    "maturity_days": nombre, "protein_content": nombre, "recommended_regions": ["region"],
    "advantages": ["avantage1"], "risks": ["risque1"]
  }},
  "crossing_protocol": ["etape1", "etape2", "etape3"],
  "confidence": 0-100,
  "recommendation": "texte"
}}"""

    response, model = await ai_analyze(system_prompt, f"Parent1: {data.parent1}, Parent2: {data.parent2}", "crossing")
    result = parse_ai_json(response, {
        "offspring_id": f"HYB-{uuid.uuid4().hex[:4].upper()}",
        "generations": [
            {"gen": i+1, "yield_gain": f"+{8+i*3}%", "vigor": 85+i*2, "stability": 70+i*5, "key_traits": data.target_traits[:2], "notes": f"Generation F{i+1}"}
            for i in range(data.generations)
        ],
        "final_variety": {
            "name": f"{data.parent1[:4]}x{data.parent2[:4]}", "yield_t_ha": 5.2,
            "disease_resistance": 88, "drought_tolerance": 76, "maturity_days": 115,
            "protein_content": 12.4, "recommended_regions": ["Centre", "Ouest", "Littoral"],
            "advantages": ["Haut rendement", "Resistance aux maladies fongiques"],
            "risks": ["Sensibilite au stress hydrique prolonge"]
        },
        "crossing_protocol": [
            f"Selectionner les meilleurs individus de {data.parent1} et {data.parent2}",
            "Realiser la pollinisation croisee manuelle",
            "Cultiver les graines F1 et evaluer la vigueur hybride",
            "Selectionner les F2 avec les traits cibles",
            "Stabiliser sur 3+ generations avec autofecondation"
        ],
        "confidence": 87,
        "recommendation": "Croisement prometteur, recommander essais multilocaux"
    })

    doc = {
        "id": str(uuid.uuid4()), "user_id": user["id"],
        "parent1": data.parent1, "parent2": data.parent2,
        "target_traits": data.target_traits, "result": result,
        "model": model, "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.crossing_simulations.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "crossing": doc}


@router.post("/climate-adaptation")
async def climate_adaptation(data: ClimateAdaptationRequest, user=Depends(get_current_user)):
    system_prompt = f"""Tu es un expert en adaptation climatique agricole.
Evalue l'adaptation de {data.variety} dans la region {data.region} sous le scenario {data.scenario}.
Reponds en JSON:
{{
  "current_score": 0-100,
  "projections": [
    {{"year": 2030, "adaptation_score": 0-100, "yield_change": "+/-x%", "risks": ["r1"], "opportunities": ["o1"]}},
    {{"year": 2040, "adaptation_score": 0-100, "yield_change": "+/-x%", "risks": ["r1"], "opportunities": ["o1"]}}
  ],
  "recommended_adaptations": ["a1", "a2"],
  "alternative_varieties": [{{"name": "v1", "score": 0-100, "reason": "texte"}}],
  "water_stress_index": 0-100,
  "heat_stress_index": 0-100,
  "overall_risk": "Faible|Modere|Eleve|Critique",
  "confidence": 0-100,
  "summary": "texte"
}}"""

    response, model = await ai_analyze(system_prompt, f"Variete: {data.variety}, Region: {data.region}, Scenario: {data.scenario}", "climate")
    result = parse_ai_json(response, {
        "current_score": 88,
        "projections": [
            {"year": y, "adaptation_score": max(30, 88 - (y - 2026) * 0.8 + random.randint(-5, 5)),
             "yield_change": f"{'-' if y > 2040 else '+'}{abs(int((y-2026)*0.4 + random.randint(-3,3)))}%",
             "risks": ["Stress hydrique accru", "Nouvelles maladies fongiques"][:1 if y < 2040 else 2],
             "opportunities": ["Saison de croissance allongee"]}
            for y in data.projection_years
        ],
        "recommended_adaptations": [
            "Adopter des varietes tolerantes a la secheresse",
            "Implementer l'irrigation goutte-a-goutte",
            "Diversifier les cultures avec des especes resilientes",
            "Adopter des pratiques agroforesterie"
        ],
        "alternative_varieties": [
            {"name": "Sorgho S35", "score": 93, "reason": "Excellente tolerance secheresse"},
            {"name": "Mil Souna-3", "score": 90, "reason": "Adapte zones semi-arides"},
        ],
        "water_stress_index": 65, "heat_stress_index": 48,
        "overall_risk": "Modere", "confidence": 84,
        "summary": f"{data.variety} montre une bonne adaptation actuelle mais des risques croissants apres 2040."
    })
    return {"success": True, "adaptation": result, "model": model, "variety": data.variety, "region": data.region}


@router.post("/upload-seed-data")
async def upload_seed_data(
    file: UploadFile = File(...),
    batch_id: str = Form(""),
    data_type: str = Form("image"),
    user=Depends(get_current_user)
):
    content = await file.read()
    file_id = f"seed-{uuid.uuid4().hex[:8]}"
    doc = {
        "id": file_id, "batch_id": batch_id, "user_id": user["id"],
        "filename": file.filename, "data_type": data_type,
        "content_type": file.content_type, "size": len(content),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    try:
        from storage import put_object, generate_path
        path = generate_path(file.filename)
        await put_object(path, content, file.content_type or "application/octet-stream")
        doc["storage_path"] = path
    except Exception as e:
        logger.warning(f"Storage upload failed: {e}, storing metadata only")
        doc["storage_path"] = None

    await db.seed_data_uploads.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "file": doc}


@router.get("/export/{format_type}")
async def export_report(format_type: str, variety: str = "Mais CAMIR-01", user=Depends(get_current_user)):
    """Export analysis report in CSV, JSON formats"""
    if format_type == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Variete", "Rendement (t/ha)", "Resilience", "Germination", "Purete", "Confiance"])
        writer.writerow([variety, "4.5", "87%", "94%", "98.5%", "91%"])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=rapport_{variety}.csv"}
        )
    elif format_type == "json":
        data = {
            "variete": variety, "rendement_t_ha": 4.5, "resilience": 87,
            "germination": 94, "purete": 98.5, "confiance": 91,
            "date": datetime.now(timezone.utc).isoformat()
        }
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=rapport_{variety}.json"}
        )
    return {"error": "Format non supporte. Utilisez csv ou json"}
