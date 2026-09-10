import React from "react";
import { UtensilsCrossed } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-soft">
          <UtensilsCrossed className="w-7 h-7 animate-pulse text-brand-600" />
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-display font-bold text-sm text-stone-800">
          Preparing NutriPlan...
        </p>
        <p className="text-xs text-stone-600">Gathering fresh ingredients and meal data</p>
      </div>
    </div>
  );
}
