import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Heart, Sparkles, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200/70 bg-white/70 backdrop-blur-md no-print py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-soft">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-stone-900">
                Nutri<span className="text-brand-600">Plan</span>
              </span>
            </div>
            <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
              Your all-in-one culinary companion. Discover thousands of delicious recipes, plan your weekly meals effortlessly, track pantry expiration dates to reduce food waste, and generate smart grocery lists automatically.
            </p>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/planner" className="hover:text-brand-600 transition-colors">
                  Weekly Meal Planner
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-brand-600 transition-colors">
                  Recipe Discovery
                </Link>
              </li>
              <li>
                <Link href="/recipes/new" className="hover:text-brand-600 transition-colors">
                  Custom Recipe Creator
                </Link>
              </li>
              <li>
                <Link href="/pantry" className="hover:text-brand-600 transition-colors">
                  Pantry & Expiration Alerts
                </Link>
              </li>
              <li>
                <Link href="/grocery" className="hover:text-brand-600 transition-colors">
                  Smart Grocery List
                </Link>
              </li>
            </ul>
          </div>

          {/* Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
              Highlights
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Zero Food Waste Tracker</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>TheMealDB API Integration</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Pantry Cross-Referencing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span>Print & Export Ready</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 gap-3">
          <p>© {new Date().getFullYear()} NutriPlan. Designed for healthy living and effortless meal management.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for culinary lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
