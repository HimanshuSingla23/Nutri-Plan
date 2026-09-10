"use client";

import React from "react";
import { useVegPreference } from "@/context/VegPreferenceContext";
import { Leaf } from "lucide-react";

interface VegToggleProps {
  className?: string;
  variant?: "navbar" | "filter" | "compact";
}

export default function VegToggle({ className = "", variant = "navbar" }: VegToggleProps) {
  const { isVegOnly, toggleVegOnly } = useVegPreference();

  if (variant === "compact") {
    return (
      <button
        onClick={toggleVegOnly}
        type="button"
        role="switch"
        aria-checked={isVegOnly}
        title={isVegOnly ? "Vegetarian Only Mode Active (Click to show all meals)" : "Click to show only vegetarian meals"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
          isVegOnly
            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
            : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
        } ${className}`}
      >
        <Leaf className={`w-3.5 h-3.5 ${isVegOnly ? "text-emerald-100 fill-emerald-100" : "text-stone-400"}`} />
        <span>Veg Only</span>
      </button>
    );
  }

  if (variant === "filter") {
    return (
      <div className={`inline-flex items-center gap-3 p-1.5 px-3 rounded-2xl border transition-all ${
        isVegOnly 
          ? "bg-emerald-50/90 border-emerald-300 shadow-sm" 
          : "bg-white border-stone-200 hover:border-stone-300"
      } ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl transition-colors ${isVegOnly ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500"}`}>
            <Leaf className={`w-4 h-4 ${isVegOnly ? "fill-white" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-900 leading-none">
              Vegetarian Meals
            </span>
            <span className={`text-[10px] font-medium leading-tight ${isVegOnly ? "text-emerald-700" : "text-stone-600"}`}>
              {isVegOnly ? "Showing veg meals only" : "All meals shown"}
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={toggleVegOnly}
          type="button"
          role="switch"
          aria-checked={isVegOnly}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isVegOnly ? "bg-emerald-600" : "bg-stone-300"
          }`}
        >
          <span className="sr-only">Toggle Vegetarian Meals Only</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isVegOnly ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  }

  // Default navbar variant
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all ${
      isVegOnly
        ? "bg-emerald-50 border-emerald-300 shadow-sm"
        : "bg-white/80 border-stone-200/80 hover:bg-stone-50"
    } ${className}`}>
      <div className="flex items-center gap-1.5">
        <Leaf className={`w-3.5 h-3.5 transition-colors ${
          isVegOnly ? "text-emerald-600 fill-emerald-600" : "text-stone-400"
        }`} />
        <span className={`text-xs font-semibold transition-colors ${
          isVegOnly ? "text-emerald-900 font-bold" : "text-stone-600"
        }`}>
          Veg Only
        </span>
      </div>

      <button
        onClick={toggleVegOnly}
        type="button"
        role="switch"
        aria-checked={isVegOnly}
        title={isVegOnly ? "Veg Only is ON (click to turn off)" : "Veg Only is OFF (click to turn on)"}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isVegOnly ? "bg-emerald-600" : "bg-stone-300"
        }`}
      >
        <span className="sr-only">Toggle Vegetarian Only</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isVegOnly ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
