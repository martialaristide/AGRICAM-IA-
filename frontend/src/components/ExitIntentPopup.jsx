import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Gift, X, Sparkles, ArrowRight, Clock, 
  Percent, CheckCircle, Leaf
} from "lucide-react";
import { toast } from "sonner";

const ExitIntentPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }
    
    // Store the offer claim
    localStorage.setItem("agricam_exit_offer_claimed", "true");
    localStorage.setItem("agricam_exit_offer_email", email);
    
    setSubmitted(true);
    toast.success("Offre envoyée à votre email !");
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center p-8">
          <div className="p-4 bg-emerald-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Merci !</h2>
          <p className="text-slate-600">
            Votre code de réduction a été envoyé à <strong>{email}</strong>
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Attention-grabbing header */}
        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full animate-bounce">
              <Gift className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">ATTENDEZ !</h2>
              <p className="text-orange-100">Ne partez pas les mains vides</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Offer */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold mb-4">
              <Percent className="h-5 w-5" />
              <span className="text-2xl">20%</span>
              <span>de réduction</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              Sur votre premier abonnement AGRICAM IA
            </h3>
            <p className="text-slate-600">
              Offre exclusive valable pendant les prochaines 24 heures
            </p>
          </div>
          
          {/* Timer (visual only) */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Clock className="h-5 w-5 text-red-500" />
            <div className="flex gap-2 text-center">
              <div className="bg-slate-900 text-white px-3 py-2 rounded font-mono font-bold">
                23
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-slate-900 text-white px-3 py-2 rounded font-mono font-bold">
                59
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-slate-900 text-white px-3 py-2 rounded font-mono font-bold">
                59
              </div>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="space-y-2 mb-6">
            {[
              "Analyse IA illimitée de vos parcelles",
              "Pilotage de drones et robots",
              "Rapports professionnels",
              "Support prioritaire 24/7"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              className="text-center"
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-lg py-6"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Obtenir mon code -20%
            </Button>
          </form>
          
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 mt-4 py-2"
          >
            Non merci, je préfère payer plein tarif
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
