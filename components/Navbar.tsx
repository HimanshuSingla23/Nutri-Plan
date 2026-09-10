"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  Calendar,
  BookOpen,
  PackageCheck,
  ShoppingCart,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import QuickSeedButton from "./QuickSeedButton";
import VegToggle from "./VegToggle";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: UtensilsCrossed },
    { href: "/planner", label: "Meal Planner", icon: Calendar },
    { href: "/recipes", label: "Recipes", icon: BookOpen },
    { href: "/pantry", label: "Pantry Tracker", icon: PackageCheck },
    { href: "/grocery", label: "Grocery List", icon: ShoppingCart },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FDFBF7]/90 border-b border-stone-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="NutriPlan Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 group-hover:shadow-glow transition-all duration-300">
              <UtensilsCrossed className="w-5 h-5 transition-transform group-hover:rotate-12" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xl tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors">
                  Nutri<span className="text-brand-600">Plan</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-brand-700 bg-brand-100 rounded-md">
                  Pro
                </span>
              </div>
              <span className="text-[11px] text-stone-600 font-medium hidden sm:inline-block -mt-0.5">
                Smart Meal Planning & Pantry
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-600 text-white shadow-sm font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-brand-100" : "text-stone-600"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2.5">
            <VegToggle variant="navbar" />
            <QuickSeedButton variant="compact" />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <VegToggle variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-stone-200/80 bg-[#FDFBF7]/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-600 text-white font-semibold"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-stone-600"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 pb-1 border-t border-stone-200/80 mt-2">
            <VegToggle variant="filter" className="w-full justify-between" />
          </div>
        </div>
      )}
    </header>
  );
}
