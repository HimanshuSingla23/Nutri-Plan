"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowLeft, Home, Calendar, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full text-center space-y-6 bg-white/95 rounded-3xl border border-stone-200/80 p-8 shadow-soft">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <UtensilsCrossed className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-100/70 px-2.5 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
            Recipe Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            The page you are looking for might have been moved, removed, or doesn&apos;t exist in your kitchen.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-soft transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/planner"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-semibold transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Meal Planner</span>
          </Link>

          <Link
            href="/recipes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Recipes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
