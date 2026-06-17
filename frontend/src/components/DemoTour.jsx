/**
 * DemoTour — Auto-piloted presentation mode for investor/minister demos
 * Navigates through 4 key modules (Voice AI → Drone → Seed → Marketplace)
 * with a countdown overlay. Pitch-friendly: ~2 minutes total.
 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, Bot, Plane, Microscope, ShoppingBag } from "lucide-react";

const DEMO_STEPS = [
  {
    id: "voice-ai",
    path: "/agribot-ia",
    title: "AGRI GENIUS",
    subtitle: "Assistant vocal IA agricole",
    description: "Posez une question vocale. L'IA comprend le français et 14 langues africaines. Réponses contextualisees pour le climat camerounais.",
    icon: Bot,
    color: "from-emerald-500 to-teal-600",
    duration: 30,
  },
  {
    id: "drone",
    path: "/flotte-drones",
    title: "Flotte de Drones DJI",
    subtitle: "Surveillance aerienne autonome",
    description: "Telemetrie en temps reel. Detection NDVI, cartographie de stress hydrique, missions automatisees. Connectes a 873 parcelles.",
    icon: Plane,
    color: "from-blue-500 to-cyan-600",
    duration: 30,
  },
  {
    id: "seed",
    path: "/analyse-semences",
    title: "Analyse de Semences IA",
    subtitle: "Detection qualite par vision",
    description: "Photographiez une semence : l'IA Gemini detecte les defauts, maladies, taux de germination estime, et conseille la meilleure variete.",
    icon: Microscope,
    color: "from-amber-500 to-orange-600",
    duration: 30,
  },
  {
    id: "marketplace",
    path: "/marketplace",
    title: "Marketplace Securisee",
    subtitle: "Achat-vente avec Mobile Money",
    description: "Connectez producteurs et acheteurs. Paiement integre MTN/Orange Money, confirmation 2-clics, tracabilite blockchain.",
    icon: ShoppingBag,
    color: "from-lime-500 to-amber-500",
    duration: 30,
  },
];

const DemoTour = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(DEMO_STEPS[0].duration);
  const [paused, setPaused] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const step = DEMO_STEPS[stepIdx];

  // Navigate when step changes
  useEffect(() => {
    if (!open) return;
    navigate(step.path);
    setRemaining(step.duration);
  }, [stepIdx, open, navigate, step.path, step.duration]);

  // Countdown
  useEffect(() => {
    if (!open || paused) return;
    if (remaining <= 0) {
      if (stepIdx < DEMO_STEPS.length - 1) {
        setStepIdx((i) => i + 1);
      } else {
        onClose?.();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [open, paused, remaining, stepIdx, onClose]);

  const next = useCallback(() => {
    if (stepIdx < DEMO_STEPS.length - 1) setStepIdx((i) => i + 1);
    else onClose?.();
  }, [stepIdx, onClose]);

  const prev = useCallback(() => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }, [stepIdx]);

  if (!open) return null;

  const Icon = step.icon;
  const progress = ((step.duration - remaining) / step.duration) * 100;
  const totalProgress = ((stepIdx + (step.duration - remaining) / step.duration) / DEMO_STEPS.length) * 100;

  // Minimized pill (allow user to interact with the page)
  if (minimized) {
    return (
      <div
        className="fixed bottom-4 right-4 z-[9999] cursor-pointer"
        onClick={() => setMinimized(false)}
        data-testid="demo-tour-minimized"
      >
        <div className={`bg-gradient-to-r ${step.color} text-white rounded-full shadow-2xl px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform`}>
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold">{step.title}</span>
          <span className="text-xs opacity-80">· {remaining}s</span>
          <span className="text-xs opacity-60">({stepIdx + 1}/{DEMO_STEPS.length})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none" data-testid="demo-tour-overlay">
      {/* Top progress bar — global */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 pointer-events-auto">
        <div
          className={`h-full bg-gradient-to-r ${step.color} transition-all duration-500`}
          style={{ width: `${totalProgress}%` }}
        />
      </div>

      {/* Floating control card — bottom-right */}
      <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-w-md p-4 bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl pointer-events-auto" data-testid="demo-tour-card">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400 flex-shrink-0" />
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Mode Demo Pitch</span>
              </div>
              <h3 className="text-base font-bold text-white truncate" data-testid="demo-step-title">{step.title}</h3>
              <p className="text-xs text-slate-400 truncate">{step.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={() => setMinimized(true)}
              className="h-6 w-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
              title="Reduire"
              data-testid="demo-minimize-btn"
            >
              –
            </button>
            <button
              onClick={onClose}
              className="h-6 w-6 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 flex items-center justify-center"
              title="Quitter le mode demo"
              data-testid="demo-close-btn"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">{step.description}</p>

        {/* Step progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Etape {stepIdx + 1} / {DEMO_STEPS.length}</span>
            <span className="font-mono font-bold text-white">{remaining}s</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${step.color} transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={prev}
            disabled={stepIdx === 0}
            className="flex-1 text-slate-300 hover:text-white hover:bg-slate-800 h-8"
            data-testid="demo-prev-btn"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={() => setPaused((p) => !p)}
            className={`flex-1 h-8 ${paused ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"} text-white`}
            data-testid="demo-pause-btn"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={next}
            className="flex-1 text-slate-300 hover:text-white hover:bg-slate-800 h-8"
            data-testid="demo-next-btn"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Stepper dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-800">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStepIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === stepIdx
                  ? `w-6 bg-gradient-to-r ${s.color}`
                  : i < stepIdx
                  ? "w-2 bg-emerald-500/60"
                  : "w-2 bg-slate-700"
              }`}
              title={s.title}
              data-testid={`demo-step-dot-${i}`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DemoTour;
