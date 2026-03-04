import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Gift, X, Sparkles, ArrowRight, Clock } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

const ExitIntentModal = ({ isOpen, onClose }) => {
  const [offers, setOffers] = useState([]);
  const [claiming, setClaiming] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.get("/campaigns/exit-offers").then(res => {
        setOffers(res.data?.offers || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const claimOffer = async (offerId) => {
    setClaiming(offerId);
    try {
      await api.post("/campaigns/claim-offer", { offer_id: offerId });
      toast.success("Offre activee ! Profitez-en !");
      onClose();
    } catch {
      toast.error("Erreur lors de l'activation");
    }
    setClaiming("");
  };

  if (!isOpen || offers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" data-testid="exit-intent-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide opacity-80">Offre Exclusive</span>
          </div>
          <h2 className="text-xl font-bold">Avant de partir...</h2>
          <p className="text-sm opacity-90 mt-1">Nous avons une offre speciale pour vous !</p>
        </div>
        
        {/* Offers */}
        <div className="p-6 space-y-3">
          {offers.map((offer) => (
            <div key={offer.id} className="group p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-400 transition-all cursor-pointer bg-emerald-50/50 hover:bg-emerald-50" data-testid={`offer-${offer.id}`}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {offer.type === "free_trial" ? <Clock className="h-5 w-5 text-emerald-600" /> : 
                   offer.type === "discount" ? <Sparkles className="h-5 w-5 text-amber-600" /> :
                   <ArrowRight className="h-5 w-5 text-violet-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800">{offer.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{offer.description}</p>
                  {offer.original_price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs line-through text-slate-400">{offer.original_price} FCFA</span>
                      <span className="text-sm font-bold text-emerald-600">{offer.offer_price} FCFA</span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-xs"
                onClick={() => claimOffer(offer.id)}
                disabled={!!claiming}
                data-testid={`claim-${offer.id}`}
              >
                {claiming === offer.id ? "Activation..." : offer.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="px-6 pb-4">
          <button onClick={onClose} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2" data-testid="exit-no-thanks">
            Non merci, je continue ma visite
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentModal;
