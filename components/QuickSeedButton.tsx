"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface QuickSeedButtonProps {
  onSuccess?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "compact";
}

export default function QuickSeedButton({
  onSuccess,
  className = "",
  variant = "secondary",
}: QuickSeedButtonProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSeed = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        success(
          "Sample Data Loaded!",
          "Custom recipes, pantry items, and weekly meal plan have been populated."
        );
        if (onSuccess) onSuccess();
      } else {
        error("Seed Failed", data.error || "Could not seed sample data.");
      }
    } catch (err: any) {
      error("Seed Error", err.message || "Failed to connect to database.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleSeed}
        disabled={loading}
        title="Seed sample recipes, pantry items, and weekly plan"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/80 rounded-xl hover:bg-brand-100/80 hover:text-brand-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 ${className}`}
      >
        <Sparkles className={`w-3.5 h-3.5 text-brand-600 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Seeding..." : "Load Demo Data"}</span>
      </button>
    );
  }

  if (variant === "primary") {
    return (
      <button
        onClick={handleSeed}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-98 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-brand-200" />
        )}
        <span>{loading ? "Seeding Database..." : "Seed Demo Data"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white/90 hover:bg-stone-50 border border-stone-200/80 rounded-xl shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
      )}
      <span>{loading ? "Seeding..." : "Load Sample Data"}</span>
    </button>
  );
}
