"""
AGRICAM IA 2.0 - AgriScore: Dynamic Credit Scoring for Banks
Uses AI to calculate real-time agricultural credit scores
"""
from fastapi import APIRouter, Depends
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/agriscore", tags=["AgriScore"])


class AgriScoreRequest(BaseModel):
    farmer_id: Optional[str] = None
    farmer_name: Optional[str] = None
    region: Optional[str] = "Cameroun"
    crop_type: Optional[str] = "Mais"
    area_ha: Optional[float] = 5.0
    years_experience: Optional[int] = 3
    previous_yield: Optional[float] = 3.5
    loan_amount: Optional[float] = 500000
    loan_duration_months: Optional[int] = 12


@router.get("/scores")
async def get_all_agri_scores(user=Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))):
    """Get all computed AgriScores"""
    scores = await db.agri_scores.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    if not scores:
        # Return demo data if no scores computed yet
        return [
            {"id": "demo-1", "farmer_name": "Jean Dupont", "region": "Centre", "crop": "Mais", "score": 87, "risk_level": "low", "max_loan": 2000000, "rate_suggestion": 7.5, "yield_score": 88, "sustainability_score": 92, "market_score": 78, "climate_risk": 15},
            {"id": "demo-2", "farmer_name": "Marie Nkolo", "region": "Ouest", "crop": "Cacao", "score": 74, "risk_level": "medium", "max_loan": 1500000, "rate_suggestion": 9.0, "yield_score": 72, "sustainability_score": 68, "market_score": 85, "climate_risk": 28},
            {"id": "demo-3", "farmer_name": "Paul Tagne", "region": "Extreme-Nord", "crop": "Sorgho", "score": 61, "risk_level": "medium", "max_loan": 800000, "rate_suggestion": 11.5, "yield_score": 65, "sustainability_score": 55, "market_score": 62, "climate_risk": 42},
            {"id": "demo-4", "farmer_name": "Awa Sow", "region": "Sud-Ouest", "crop": "Banane", "score": 93, "risk_level": "low", "max_loan": 3000000, "rate_suggestion": 6.5, "yield_score": 95, "sustainability_score": 95, "market_score": 91, "climate_risk": 8},
        ]
    return scores


@router.post("/compute")
async def compute_agri_score(data: AgriScoreRequest, user=Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))):
    """Compute dynamic AgriScore using AI analysis"""
    system_prompt = """Tu es un analyste de credit agricole expert. Calcule un score de credit agricole (AgriScore) 
base sur les donnees fournies. Reponds en JSON:
{
  "score": 0-100,
  "risk_level": "low|medium|high|critical",
  "max_loan_recommended": montant_en_xaf,
  "interest_rate_suggestion": pourcentage,
  "yield_score": 0-100,
  "sustainability_score": 0-100,
  "market_score": 0-100,
  "climate_risk": 0-100,
  "strengths": ["force1", "force2"],
  "risks": ["risque1", "risque2"],
  "recommendations": ["conseil1", "conseil2"],
  "repayment_capacity": "excellent|bon|moyen|faible",
  "insurance_recommendation": "description"
}"""

    user_prompt = f"""Agriculteur: {data.farmer_name or 'Inconnu'}
Region: {data.region}, Culture: {data.crop_type}, Surface: {data.area_ha} ha
Experience: {data.years_experience} ans, Rendement precedent: {data.previous_yield} t/ha
Pret demande: {data.loan_amount} XAF sur {data.loan_duration_months} mois"""

    response, model = await ai_analyze(system_prompt, user_prompt, "agriscore")
    result = parse_ai_json(response, {
        "score": 72, "risk_level": "medium", "max_loan_recommended": data.loan_amount * 0.8,
        "interest_rate_suggestion": 9.5, "yield_score": 70, "sustainability_score": 65,
        "market_score": 68, "climate_risk": 30, "strengths": ["Experience agricole"],
        "risks": ["Zone climatique a risque"], "recommendations": ["Diversifier les cultures"],
        "repayment_capacity": "bon", "insurance_recommendation": "Assurance recolte recommandee"
    })

    doc = {
        "id": str(uuid.uuid4()),
        "farmer_id": data.farmer_id,
        "farmer_name": data.farmer_name or "Inconnu",
        "region": data.region,
        "crop": data.crop_type,
        "area_ha": data.area_ha,
        "loan_requested": data.loan_amount,
        **result,
        "model": model,
        "computed_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.agri_scores.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "agriscore": doc}


@router.get("/risk-zones")
async def get_risk_zones(user=Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))):
    """Get regional risk assessment for agricultural lending"""
    return [
        {"zone": "Extreme-Nord", "risk_level": "high", "exposure_percent": 15, "risk_type": "Secheresse severe", "total_exposure_xaf": 45000000, "farmers_count": 234, "default_rate": 8.2},
        {"zone": "Sud-Ouest", "risk_level": "medium", "exposure_percent": 8, "risk_type": "Inondation moderee", "total_exposure_xaf": 24000000, "farmers_count": 156, "default_rate": 4.1},
        {"zone": "Centre", "risk_level": "low", "exposure_percent": 22, "risk_type": "Normal", "total_exposure_xaf": 66000000, "farmers_count": 412, "default_rate": 2.3},
        {"zone": "Ouest", "risk_level": "low", "exposure_percent": 18, "risk_type": "Faible", "total_exposure_xaf": 54000000, "farmers_count": 378, "default_rate": 1.8},
        {"zone": "Littoral", "risk_level": "medium", "exposure_percent": 12, "risk_type": "Erosion cotiere", "total_exposure_xaf": 36000000, "farmers_count": 189, "default_rate": 5.5},
        {"zone": "Nord", "risk_level": "high", "exposure_percent": 10, "risk_type": "Desertification", "total_exposure_xaf": 30000000, "farmers_count": 145, "default_rate": 9.1},
    ]


@router.post("/insurance-simulate")
async def simulate_parametric_insurance(data: AgriScoreRequest, user=Depends(require_roles([UserRole.FINANCIAL, UserRole.ADMIN]))):
    """Simulate parametric insurance for a farmer"""
    import random
    premium_rate = max(2.5, min(12, 15 - (data.previous_yield or 3) * 2))
    premium = round(data.loan_amount * premium_rate / 100)
    coverage = round(data.loan_amount * 0.85)

    scenarios = []
    for name, prob, payout_pct in [("Secheresse moderee", 18, 40), ("Secheresse severe", 8, 80), ("Inondation", 5, 70), ("Ravageurs massifs", 12, 50), ("Aucun sinistre", 57, 0)]:
        scenarios.append({"scenario": name, "probability_percent": prob, "payout_percent": payout_pct, "payout_amount": round(coverage * payout_pct / 100)})

    return {
        "farmer_name": data.farmer_name or "Agriculteur",
        "crop": data.crop_type,
        "insured_amount": data.loan_amount,
        "premium_annual": premium,
        "premium_rate_percent": round(premium_rate, 1),
        "coverage_amount": coverage,
        "coverage_percent": 85,
        "scenarios": scenarios,
        "recommendation": "Couverture parametrique recommandee" if premium_rate < 8 else "Risque eleve - prime ajustee"
    }
