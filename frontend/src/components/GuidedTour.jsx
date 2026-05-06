import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

const getTourSteps = (t) => [
  { 
    target: '[data-testid="nav-dashboard"]', 
    title: t("tour.dashboard") || "Dashboard", 
    desc: t("tour.dashboardDesc") || "Vue d'ensemble de votre exploitation avec statistiques en temps reel.",
    position: "right" 
  },
  { 
    target: '[data-testid="nav-parcelles"]', 
    title: t("tour.parcelles") || "Parcelles", 
    desc: t("tour.parcellesDesc") || "Gerez vos parcelles agricoles, ajoutez des cultures et suivez leur evolution.",
    position: "right" 
  },
  { 
    target: '[data-testid="nav-agribot-ia"]', 
    title: t("tour.agribot") || "AGRI GENIUS", 
    desc: t("tour.agribotDesc") || "Assistant IA intelligent avec commande vocale. Posez des questions, envoyez des images pour analyse.",
    position: "right" 
  },
  { 
    target: '[data-testid="nav-capteurs"]', 
    title: t("tour.capteurs") || "Capteurs IoT", 
    desc: t("tour.capteursDesc") || "Surveillez vos capteurs de temperature, humidite et qualite du sol en temps reel.",
    position: "right" 
  },
  { 
    target: '[data-testid="nav-formation"]', 
    title: t("tour.formation") || "Formation", 
    desc: t("tour.formationDesc") || "Accedez aux cours, videos et ebooks pour ameliorer vos techniques agricoles.",
    position: "right" 
  },
  { 
    target: '[data-testid="notification-bell"]', 
    title: t("tour.alerts") || "Alertes", 
    desc: t("tour.alertsDesc") || "Recevez des alertes climatiques en temps reel pour proteger vos cultures.",
    position: "bottom" 
  },
  { 
    target: '[data-testid="user-menu-btn"]', 
    title: t("tour.profile") || "Profil", 
    desc: t("tour.profileDesc") || "Gerez votre profil, changez de theme et personnalisez votre experience.",
    position: "bottom" 
  },
];

const GuidedTour = ({ onComplete }) => {
  const { t } = useLanguage();
  // Memoize steps so its identity is stable across renders (was the source of the infinite loop)
  const steps = useMemo(() => getTourSteps(t), [t]);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [visible, setVisible] = useState(true);
  const skipCountRef = useRef(0);

  const finish = useCallback(() => {
    setVisible(false);
    localStorage.setItem("agricam_tour_done", "true");
    onComplete?.();
  }, [onComplete]);

  const updatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      skipCountRef.current = 0;
      const rect = el.getBoundingClientRect();
      // Only update if rect actually changed — avoids unnecessary re-renders
      setTargetRect(prev => {
        if (prev && prev.top === rect.top && prev.left === rect.left && prev.width === rect.width && prev.height === rect.height) {
          return prev;
        }
        return rect;
      });
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      // Guard against runaway skip cascades when many targets are missing (e.g. nav inside collapsed groups)
      skipCountRef.current += 1;
      if (skipCountRef.current > steps.length) {
        finish();
        return;
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        finish();
      }
    }
  }, [currentStep, steps, finish]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [updatePosition]);

  const next = () => { if (currentStep < steps.length - 1) setCurrentStep(s => s + 1); else finish(); };
  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  if (!visible || !targetRect) return null;

  const step = steps[currentStep];
  
  // Smart positioning that stays within viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipW = Math.min(320, vw - 32);
  
  let top, left;
  if (step.position === "right" && targetRect.right + tooltipW + 20 < vw) {
    top = Math.max(16, Math.min(targetRect.top, vh - 200));
    left = targetRect.right + 16;
  } else if (step.position === "bottom" || targetRect.right + tooltipW + 20 >= vw) {
    top = Math.min(targetRect.bottom + 12, vh - 200);
    left = Math.max(16, Math.min(targetRect.left, vw - tooltipW - 16));
  } else {
    top = Math.max(16, Math.min(targetRect.top, vh - 200));
    left = Math.max(16, targetRect.left - tooltipW - 16);
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[90]" data-testid="tour-overlay" />
      
      {/* Spotlight */}
      <div className="fixed z-[91] ring-4 ring-emerald-400/50 rounded-lg transition-all duration-300 pointer-events-none"
        style={{ top: targetRect.top - 4, left: targetRect.left - 4, width: targetRect.width + 8, height: targetRect.height + 8 }} />
      
      {/* Tooltip */}
      <div className="fixed z-[92] bg-[#111827] border border-emerald-500/30 rounded-xl shadow-2xl p-4 transition-all duration-300"
        style={{ top, left, width: tooltipW }} data-testid="tour-tooltip">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">{step.title}</span>
          </div>
          <button onClick={finish} className="text-slate-500 hover:text-white" data-testid="tour-close"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-slate-300 mb-4">{step.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{currentStep + 1} / {steps.length}</span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="ghost" onClick={prev} className="text-slate-400 h-8 px-3">
                <ArrowLeft className="h-3 w-3 mr-1" /> {t("tour.back") || "Retour"}
              </Button>
            )}
            <Button size="sm" onClick={next} className="bg-emerald-600 hover:bg-emerald-500 h-8 px-3" data-testid="tour-next">
              {currentStep === steps.length - 1 ? (t("tour.finish") || "Terminer") : (t("tour.next") || "Suivant")} 
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
