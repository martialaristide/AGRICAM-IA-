"""
AGRICAM IA - Service d'Analyse de Zone (Style Agremo)
Analyse NDVI, stress, maladies, humidité des parcelles
"""

import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
import math

class ZoneAnalysisService:
    def __init__(self):
        self.analyses_history = []
    
    def calculate_ndvi(self, red_band: float, nir_band: float) -> float:
        """Calcul de l'indice NDVI"""
        if (nir_band + red_band) == 0:
            return 0
        return (nir_band - red_band) / (nir_band + red_band)
    
    def generate_zone_analysis(self, zone_id: str, zone_coords: List[Dict], analysis_types: List[str]) -> Dict:
        """Générer une analyse complète d'une zone"""
        
        # Calculate zone area (simplified)
        area_ha = self._calculate_polygon_area(zone_coords)
        
        results = {
            "zone_id": zone_id,
            "analysis_date": datetime.now(timezone.utc).isoformat(),
            "area_hectares": round(area_ha, 2),
            "coordinates": zone_coords,
            "analyses": {}
        }
        
        if "ndvi" in analysis_types:
            results["analyses"]["ndvi"] = self._generate_ndvi_analysis(area_ha)
        
        if "stress" in analysis_types:
            results["analyses"]["stress"] = self._generate_stress_analysis(area_ha)
        
        if "disease" in analysis_types:
            results["analyses"]["disease"] = self._generate_disease_analysis()
        
        if "humidity" in analysis_types:
            results["analyses"]["humidity"] = self._generate_humidity_analysis()
        
        if "thermal" in analysis_types:
            results["analyses"]["thermal"] = self._generate_thermal_analysis()
        
        if "crop_health" in analysis_types:
            results["analyses"]["crop_health"] = self._generate_crop_health_analysis()
        
        # Generate overall score
        results["overall_score"] = self._calculate_overall_score(results["analyses"])
        results["recommendations"] = self._generate_recommendations(results["analyses"])
        
        # Store in history
        self.analyses_history.append(results)
        
        return results
    
    def _calculate_polygon_area(self, coords: List[Dict]) -> float:
        """Calculate approximate area of polygon in hectares"""
        if len(coords) < 3:
            return 1.0
        
        # Simplified Shoelace formula
        n = len(coords)
        area = 0
        for i in range(n):
            j = (i + 1) % n
            lat1, lon1 = coords[i].get("lat", 0), coords[i].get("lng", 0)
            lat2, lon2 = coords[j].get("lat", 0), coords[j].get("lng", 0)
            area += lat1 * lon2
            area -= lat2 * lon1
        
        area = abs(area) / 2
        # Convert to hectares (rough approximation for small areas)
        area_ha = area * 111000 * 111000 / 10000  # degrees to meters to hectares
        return max(0.1, min(area_ha, 1000))  # Limit to reasonable range
    
    def _generate_ndvi_analysis(self, area_ha: float) -> Dict:
        """Generate NDVI analysis data"""
        base_ndvi = random.uniform(0.4, 0.8)
        
        # Generate grid of NDVI values
        grid_size = min(10, max(3, int(area_ha)))
        ndvi_grid = []
        zones = {"excellent": 0, "good": 0, "moderate": 0, "poor": 0, "very_poor": 0}
        
        for i in range(grid_size):
            row = []
            for j in range(grid_size):
                # Add some variation
                variation = random.uniform(-0.3, 0.2)
                ndvi = max(0, min(1, base_ndvi + variation))
                row.append(round(ndvi, 3))
                
                # Classify
                if ndvi >= 0.7:
                    zones["excellent"] += 1
                elif ndvi >= 0.5:
                    zones["good"] += 1
                elif ndvi >= 0.3:
                    zones["moderate"] += 1
                elif ndvi >= 0.1:
                    zones["poor"] += 1
                else:
                    zones["very_poor"] += 1
            ndvi_grid.append(row)
        
        total_cells = grid_size * grid_size
        
        return {
            "mean_ndvi": round(base_ndvi, 3),
            "min_ndvi": round(min(min(row) for row in ndvi_grid), 3),
            "max_ndvi": round(max(max(row) for row in ndvi_grid), 3),
            "std_deviation": round(random.uniform(0.05, 0.15), 3),
            "grid": ndvi_grid,
            "zones_distribution": {
                "excellent": round(zones["excellent"] / total_cells * 100, 1),
                "good": round(zones["good"] / total_cells * 100, 1),
                "moderate": round(zones["moderate"] / total_cells * 100, 1),
                "poor": round(zones["poor"] / total_cells * 100, 1),
                "very_poor": round(zones["very_poor"] / total_cells * 100, 1)
            },
            "vegetation_index": "healthy" if base_ndvi > 0.6 else "moderate" if base_ndvi > 0.4 else "stressed",
            "color_scale": ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#1a9850"]
        }
    
    def _generate_stress_analysis(self, area_ha: float) -> Dict:
        """Generate stress zone analysis"""
        stress_level = random.uniform(10, 40)
        
        stress_zones = []
        num_zones = random.randint(1, 5)
        
        for i in range(num_zones):
            stress_zones.append({
                "zone_id": f"stress_{i+1}",
                "type": random.choice(["hydrique", "thermique", "nutritif", "mécanique"]),
                "severity": random.choice(["faible", "modéré", "élevé"]),
                "area_percentage": round(random.uniform(2, 15), 1),
                "coordinates": {
                    "lat": 5.9631 + random.uniform(-0.01, 0.01),
                    "lng": 10.1591 + random.uniform(-0.01, 0.01)
                },
                "radius_m": random.randint(10, 50)
            })
        
        return {
            "overall_stress_level": round(stress_level, 1),
            "stress_index": "low" if stress_level < 20 else "medium" if stress_level < 35 else "high",
            "affected_area_percentage": round(sum(z["area_percentage"] for z in stress_zones), 1),
            "stress_zones": stress_zones,
            "primary_stress_type": random.choice(["Stress hydrique", "Stress thermique", "Carence nutritive"]),
            "trend": random.choice(["improving", "stable", "worsening"])
        }
    
    def _generate_disease_analysis(self) -> Dict:
        """Generate disease detection analysis"""
        diseases = [
            {"name": "Mildiou", "risk": random.uniform(0, 50), "affected_area": random.uniform(0, 10)},
            {"name": "Rouille", "risk": random.uniform(0, 40), "affected_area": random.uniform(0, 8)},
            {"name": "Oïdium", "risk": random.uniform(0, 35), "affected_area": random.uniform(0, 5)},
            {"name": "Septoriose", "risk": random.uniform(0, 30), "affected_area": random.uniform(0, 6)},
            {"name": "Anthracnose", "risk": random.uniform(0, 25), "affected_area": random.uniform(0, 4)}
        ]
        
        # Filter only significant detections
        detected = [d for d in diseases if d["risk"] > 15]
        
        return {
            "diseases_detected": len(detected),
            "overall_health_risk": round(sum(d["risk"] for d in detected) / max(len(detected), 1), 1),
            "detections": [
                {
                    "name": d["name"],
                    "risk_level": round(d["risk"], 1),
                    "affected_area_percent": round(d["affected_area"], 2),
                    "severity": "high" if d["risk"] > 35 else "medium" if d["risk"] > 20 else "low",
                    "treatment_urgency": "immediate" if d["risk"] > 40 else "soon" if d["risk"] > 25 else "monitor"
                }
                for d in detected
            ],
            "pest_activity": random.choice(["none", "low", "moderate", "high"]),
            "recommended_treatments": [
                "Traitement fongicide préventif",
                "Surveillance accrue des zones affectées",
                "Amélioration de la circulation d'air"
            ] if detected else ["Aucun traitement nécessaire"]
        }
    
    def _generate_humidity_analysis(self) -> Dict:
        """Generate soil humidity analysis"""
        base_humidity = random.uniform(40, 80)
        
        return {
            "mean_humidity": round(base_humidity, 1),
            "min_humidity": round(base_humidity - random.uniform(5, 15), 1),
            "max_humidity": round(base_humidity + random.uniform(5, 15), 1),
            "optimal_range": {"min": 50, "max": 70},
            "status": "optimal" if 50 <= base_humidity <= 70 else "too_dry" if base_humidity < 50 else "too_wet",
            "irrigation_needed": base_humidity < 45,
            "drainage_needed": base_humidity > 80,
            "zones": {
                "dry": round(random.uniform(5, 25), 1),
                "optimal": round(random.uniform(40, 70), 1),
                "wet": round(random.uniform(5, 20), 1)
            },
            "depth_analysis": {
                "surface_0_10cm": round(base_humidity - random.uniform(0, 10), 1),
                "mid_10_30cm": round(base_humidity, 1),
                "deep_30_60cm": round(base_humidity + random.uniform(0, 10), 1)
            }
        }
    
    def _generate_thermal_analysis(self) -> Dict:
        """Generate thermal/temperature analysis"""
        base_temp = random.uniform(22, 35)
        
        hot_spots = []
        num_hot_spots = random.randint(0, 4)
        for i in range(num_hot_spots):
            hot_spots.append({
                "id": f"hot_{i+1}",
                "temperature": round(base_temp + random.uniform(3, 8), 1),
                "coordinates": {
                    "lat": 5.9631 + random.uniform(-0.01, 0.01),
                    "lng": 10.1591 + random.uniform(-0.01, 0.01)
                },
                "area_m2": random.randint(50, 500)
            })
        
        return {
            "mean_temperature": round(base_temp, 1),
            "min_temperature": round(base_temp - random.uniform(2, 5), 1),
            "max_temperature": round(base_temp + random.uniform(3, 8), 1),
            "thermal_variation": round(random.uniform(3, 10), 1),
            "hot_spots": hot_spots,
            "cold_spots": [],
            "optimal_range": {"min": 20, "max": 30},
            "heat_stress_risk": "high" if base_temp > 32 else "medium" if base_temp > 28 else "low",
            "evapotranspiration_estimate": round(random.uniform(3, 7), 1)  # mm/day
        }
    
    def _generate_crop_health_analysis(self) -> Dict:
        """Generate overall crop health analysis"""
        health_score = random.uniform(60, 95)
        
        return {
            "overall_health_score": round(health_score, 1),
            "health_status": "excellent" if health_score > 85 else "good" if health_score > 70 else "moderate" if health_score > 55 else "poor",
            "growth_stage": random.choice(["germination", "vegetative", "flowering", "fruiting", "maturation"]),
            "estimated_yield_percentage": round(health_score * random.uniform(0.9, 1.1), 1),
            "chlorophyll_index": round(random.uniform(35, 55), 1),
            "leaf_area_index": round(random.uniform(2, 5), 2),
            "biomass_estimate_kg_ha": round(random.uniform(3000, 8000), 0),
            "uniformity_score": round(random.uniform(70, 95), 1),
            "issues_detected": random.sample([
                "Légère carence en azote",
                "Stress hydrique localisé",
                "Densité de plantation inégale",
                "Présence de mauvaises herbes",
                "Compaction du sol détectée"
            ], k=random.randint(0, 3))
        }
    
    def _calculate_overall_score(self, analyses: Dict) -> float:
        """Calculate overall zone health score"""
        scores = []
        
        if "ndvi" in analyses:
            scores.append(analyses["ndvi"]["mean_ndvi"] * 100)
        if "stress" in analyses:
            scores.append(100 - analyses["stress"]["overall_stress_level"])
        if "disease" in analyses:
            scores.append(100 - analyses["disease"]["overall_health_risk"])
        if "crop_health" in analyses:
            scores.append(analyses["crop_health"]["overall_health_score"])
        
        return round(sum(scores) / max(len(scores), 1), 1)
    
    def _generate_recommendations(self, analyses: Dict) -> List[Dict]:
        """Generate actionable recommendations based on analyses"""
        recommendations = []
        
        if "ndvi" in analyses:
            if analyses["ndvi"]["mean_ndvi"] < 0.4:
                recommendations.append({
                    "priority": "high",
                    "category": "vegetation",
                    "action": "Appliquer un fertilisant azoté pour améliorer la vigueur végétale",
                    "expected_impact": "Augmentation de 15-20% du NDVI en 2 semaines"
                })
        
        if "stress" in analyses:
            if analyses["stress"]["overall_stress_level"] > 30:
                recommendations.append({
                    "priority": "high",
                    "category": "irrigation",
                    "action": "Augmenter la fréquence d'irrigation dans les zones de stress",
                    "expected_impact": "Réduction du stress de 40% en 1 semaine"
                })
        
        if "disease" in analyses:
            if analyses["disease"]["diseases_detected"] > 0:
                recommendations.append({
                    "priority": "urgent",
                    "category": "phytosanitaire",
                    "action": "Appliquer un traitement fongicide préventif",
                    "expected_impact": "Contrôle de la propagation sous 48h"
                })
        
        if "humidity" in analyses:
            if analyses["humidity"]["irrigation_needed"]:
                recommendations.append({
                    "priority": "medium",
                    "category": "irrigation",
                    "action": "Planifier une session d'irrigation de 25mm",
                    "expected_impact": "Retour à l'humidité optimale"
                })
        
        # Default recommendation if none
        if not recommendations:
            recommendations.append({
                "priority": "low",
                "category": "monitoring",
                "action": "Continuer la surveillance régulière",
                "expected_impact": "Maintien de la bonne santé des cultures"
            })
        
        return recommendations
    
    def generate_report(self, analysis_results: Dict, format: str = "summary") -> Dict:
        """Generate a formatted report from analysis results"""
        return {
            "report_id": f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "zone_id": analysis_results.get("zone_id"),
            "area_hectares": analysis_results.get("area_hectares"),
            "overall_score": analysis_results.get("overall_score"),
            "summary": {
                "health_status": "Bon" if analysis_results.get("overall_score", 0) > 70 else "Attention requise",
                "main_issues": len(analysis_results.get("recommendations", [])),
                "urgent_actions": len([r for r in analysis_results.get("recommendations", []) if r["priority"] == "urgent"])
            },
            "analyses": analysis_results.get("analyses", {}),
            "recommendations": analysis_results.get("recommendations", []),
            "next_analysis_recommended": "Dans 7 jours"
        }

zone_analysis_service = ZoneAnalysisService()
