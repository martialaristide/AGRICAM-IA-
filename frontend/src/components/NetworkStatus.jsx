import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "../lib/utils";

const NetworkStatus = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const goOnline = () => { setOnline(true); setShowBanner(true); setTimeout(() => setShowBanner(false), 3000); };
    const goOffline = () => { setOnline(false); setShowBanner(true); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  if (!showBanner && online) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all duration-500",
      online ? "bg-emerald-600 text-white animate-slide-down" : "bg-red-600 text-white"
    )} data-testid="network-status">
      {online ? <><Wifi className="h-4 w-4" /> Connexion retablie</> : <><WifiOff className="h-4 w-4" /> Mode hors ligne - Donnees limitees</>}
    </div>
  );
};

export default NetworkStatus;
