import React, { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const TOUR_STEPS = [
  { target: '[data-testid="nav-dashboard"]', title: "Dashboard", desc: "Vue d'ensemble de votre exploitation avec statistiques en temps reel.", position: "right" },
  { target: '[data-testid="nav-parcelles"]', title: "Parcelles", desc: "Gerez vos parcelles agricoles, ajoutez des cultures et suivez leur evolution.", position: "right" },
  { target: '[data-testid="nav-agribot-ia"]', title: "AGRI GENIUS", desc: "Votre assistant IA intelligent. Posez des questions, envoyez des images pour analyse, et utilisez la commande vocale.", position: "right" },
  { target: '[data-testid="nav-capteurs"]', title: "Capteurs IoT", desc: "Surveillez vos capteurs de temperature, humidite et qualite du sol en temps reel.", position: "right" },
  { target: '[data-testid="nav-formation"]', title: "Formation", desc: "Accedez aux cours, videos et ebooks pour ameliorer vos techniques agricoles.", position: "right" },
  { target: '[data-testid="notification-bell"]', title: "Alertes Meteo", desc: "Recevez des alertes climatiques en temps reel pour proteger vos cultures.", position: "bottom" },
  { target: '[data-testid="user-menu-btn"]', title: "Profil", desc: "Gerez votre profil, changez de theme et personnalisez votre experience.", position: "bottom" },
];

const GuidedTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(true);

  const updatePosition = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentStep]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const next = () => { if (currentStep < TOUR_STEPS.length - 1) setCurrentStep(s => s + 1); else finish(); };
  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const finish = () => { setVisible(false); localStorage.setItem("agricam_tour_done", "true"); onComplete?.(); };

  if (!visible || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];
  const tooltipStyle = {};
  if (step.position === "right") { tooltipStyle.top = targetRect.top; tooltipStyle.left = targetRect.right + 16; }
  else if (step.position === "bottom") { tooltipStyle.top = targetRect.bottom + 12; tooltipStyle.left = Math.max(16, targetRect.left - 100); }
  else { tooltipStyle.top = targetRect.top; tooltipStyle.left = targetRect.left - 320; }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[90]" data-testid="tour-overlay" />
      
      {/* Spotlight */}
      <div className="fixed z-[91] ring-4 ring-emerald-400/50 rounded-lg transition-all duration-300 pointer-events-none"
        style={{ top: targetRect.top - 4, left: targetRect.left - 4, width: targetRect.width + 8, height: targetRect.height + 8 }} />
      
      {/* Tooltip */}
      <div className="fixed z-[92] w-72 sm:w-80 bg-[#111827] border border-emerald-500/30 rounded-xl shadow-2xl p-4 transition-all duration-300"
        style={tooltipStyle} data-testid="tour-tooltip">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">{step.title}</span>
          </div>
          <button onClick={finish} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-slate-300 mb-4">{step.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{currentStep + 1} / {TOUR_STEPS.length}</span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="ghost" onClick={prev} className="text-slate-400 h-8 px-3"><ArrowLeft className="h-3 w-3 mr-1" /> Retour</Button>
            )}
            <Button size="sm" onClick={next} className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3" data-testid="tour-next">
              {currentStep === TOUR_STEPS.length - 1 ? "Terminer" : "Suivant"} <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }} />
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
