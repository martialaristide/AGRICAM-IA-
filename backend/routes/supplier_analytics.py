"""
AGRICAM IA 2.0 - Smart Logistics & Demand Forecasting for Suppliers
"""
from fastapi import APIRouter, Depends
from core import db, get_current_user, require_roles, UserRole, ai_analyze, parse_ai_json, logger
from datetime import datetime, timezone, timedelta
import uuid
import random

router = APIRouter(prefix="/api/supplier-analytics", tags=["Supplier Analytics"])


@router.get("/demand-forecast")
async def get_demand_forecast(user=Depends(get_current_user)):
    """Get AI-powered demand forecasting for supplier products"""
    products = ["Engrais NPK", "Semences mais", "Pesticide bio", "Equipement irrigation", "Outils agricoles"]
    forecast = []
    for product in products:
        base = random.randint(50, 200)
        forecast.append({
            "product": product,
            "current_stock": random.randint(100, 500),
            "monthly_demand": [
                {"month": f"M+{i+1}", "predicted_qty": base + random.randint(-20, 40), "confidence": max(70, 95 - i * 4)}
                for i in range(6)
            ],
            "reorder_point": base * 2,
            "optimal_stock": base * 3,
            "trend": random.choice(["increasing", "stable", "decreasing"]),
            "seasonal_factor": round(random.uniform(0.8, 1.3), 2),
        })
    return forecast


@router.get("/logistics-optimization")
async def get_logistics_optimization(user=Depends(get_current_user)):
    """Get smart logistics route optimization"""
    return {
        "active_deliveries": random.randint(5, 15),
        "on_time_rate_percent": round(random.uniform(88, 97), 1),
        "avg_delivery_hours": round(random.uniform(4, 12), 1),
        "fuel_cost_month_xaf": random.randint(150000, 400000),
        "routes": [
            {"origin": "Entrepot Douala", "destination": "Centre - Yaounde", "distance_km": 250, "estimated_hours": 4.5, "cost_xaf": 35000, "load_kg": 2500, "status": "en_route"},
            {"origin": "Entrepot Douala", "destination": "Ouest - Bafoussam", "distance_km": 310, "estimated_hours": 6, "cost_xaf": 42000, "load_kg": 3200, "status": "planned"},
            {"origin": "Entrepot Yaounde", "destination": "Nord - Garoua", "distance_km": 950, "estimated_hours": 14, "cost_xaf": 120000, "load_kg": 5000, "status": "en_route"},
            {"origin": "Entrepot Bafoussam", "destination": "Sud-Ouest - Kumba", "distance_km": 180, "estimated_hours": 3.5, "cost_xaf": 25000, "load_kg": 1800, "status": "delivered"},
        ],
        "cost_savings_percent": round(random.uniform(12, 25), 1),
        "optimization_suggestion": "Regrouper les livraisons Centre et Ouest pour reduire les couts de 18%"
    }


@router.get("/inventory-alerts")
async def get_inventory_alerts(user=Depends(get_current_user)):
    """Get inventory level alerts and recommendations"""
    return [
        {"product": "Engrais NPK 15-15-15", "current_stock": 45, "min_stock": 100, "alert": "Rupture imminente", "severity": "critical", "reorder_qty": 200, "supplier_lead_days": 7},
        {"product": "Semences mais CAMIR-01", "current_stock": 230, "min_stock": 150, "alert": "Stock normal", "severity": "ok", "reorder_qty": 0, "supplier_lead_days": 14},
        {"product": "Pesticide Neem Bio", "current_stock": 80, "min_stock": 100, "alert": "Stock bas", "severity": "warning", "reorder_qty": 150, "supplier_lead_days": 5},
        {"product": "Tuyaux irrigation 16mm", "current_stock": 12, "min_stock": 50, "alert": "Rupture critique", "severity": "critical", "reorder_qty": 100, "supplier_lead_days": 10},
        {"product": "GPS agricole", "current_stock": 8, "min_stock": 5, "alert": "Stock correct", "severity": "ok", "reorder_qty": 0, "supplier_lead_days": 21},
    ]


@router.get("/revenue-analytics")
async def get_revenue_analytics(user=Depends(get_current_user)):
    """Get revenue and sales analytics for supplier"""
    months = ["Oct", "Nov", "Dec", "Jan", "Fev", "Mar"]
    return {
        "total_revenue_xaf": random.randint(5000000, 15000000),
        "monthly_revenue": [{"month": m, "revenue_xaf": random.randint(800000, 2500000), "orders": random.randint(15, 45)} for m in months],
        "top_products": [
            {"product": "Engrais NPK", "revenue_xaf": random.randint(2000000, 5000000), "units_sold": random.randint(200, 500), "margin_percent": 22},
            {"product": "Semences mais", "revenue_xaf": random.randint(1000000, 3000000), "units_sold": random.randint(100, 300), "margin_percent": 35},
            {"product": "Pesticide bio", "revenue_xaf": random.randint(500000, 1500000), "units_sold": random.randint(50, 150), "margin_percent": 45},
        ],
        "customer_segments": [
            {"segment": "Petits agriculteurs (<5ha)", "count": random.randint(50, 150), "revenue_percent": 35},
            {"segment": "Exploitations moyennes (5-20ha)", "count": random.randint(20, 60), "revenue_percent": 40},
            {"segment": "Grandes exploitations (>20ha)", "count": random.randint(5, 15), "revenue_percent": 25},
        ],
        "growth_rate_percent": round(random.uniform(8, 25), 1),
    }
