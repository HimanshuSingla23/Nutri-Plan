"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { IRecipe } from "@/types";

const NON_VEG_KEYWORDS = [
  "chicken",
  "beef",
  "pork",
  "fish",
  "salmon",
  "tuna",
  "meat",
  "lamb",
  "mutton",
  "turkey",
  "duck",
  "veal",
  "bacon",
  "ham",
  "sausage",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "anchovy",
  "clam",
  "oyster",
  "squid",
  "octopus",
  "prosciutto",
  "pepperoni",
  "salami",
];

export function isVegetarianRecipe(recipe: Partial<IRecipe>): boolean {
  if (!recipe) return false;

  const cat = (recipe.category || "").toLowerCase();
  if (cat.includes("vegetarian") || cat.includes("vegan")) {
    return true;
  }
  if (
    cat.includes("beef") ||
    cat.includes("chicken") ||
    cat.includes("pork") ||
    cat.includes("lamb") ||
    cat.includes("seafood") ||
    cat.includes("goat")
  ) {
    return false;
  }

  const title = (recipe.title || "").toLowerCase();
  for (const kw of NON_VEG_KEYWORDS) {
    if (title.includes(kw)) return false;
  }

  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    for (const ing of recipe.ingredients) {
      const name = (ing.name || "").toLowerCase();
      for (const kw of NON_VEG_KEYWORDS) {
        if (name.includes(kw)) return false;
      }
    }
  }

  const desc = (recipe.description || "").toLowerCase();
  for (const kw of ["chicken breast", "ground beef", "pork chop", "salmon fillet", "beef steak"]) {
    if (desc.includes(kw)) return false;
  }

  return true;
}

interface VegPreferenceContextType {
  isVegOnly: boolean;
  setIsVegOnly: (value: boolean) => void;
  toggleVegOnly: () => void;
  filterRecipes: (recipes: IRecipe[]) => IRecipe[];
}

const VegPreferenceContext = createContext<VegPreferenceContextType | undefined>(undefined);

export function VegPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("nutriplan_veg_only");
    if (saved !== null) {
      setIsVegOnly(saved === "true");
    }
  }, []);

  const handleSetVegOnly = (val: boolean) => {
    setIsVegOnly(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("nutriplan_veg_only", String(val));
    }
  };

  const toggleVegOnly = () => {
    handleSetVegOnly(!isVegOnly);
  };

  const filterRecipes = (recipes: IRecipe[]): IRecipe[] => {
    if (!isVegOnly) return recipes;
    return recipes.filter(isVegetarianRecipe);
  };

  return (
    <VegPreferenceContext.Provider
      value={{
        isVegOnly,
        setIsVegOnly: handleSetVegOnly,
        toggleVegOnly,
        filterRecipes,
      }}
    >
      {children}
    </VegPreferenceContext.Provider>
  );
}

export function useVegPreference() {
  const context = useContext(VegPreferenceContext);
  if (!context) {
    throw new Error("useVegPreference must be used within a VegPreferenceProvider");
  }
  return context;
}
