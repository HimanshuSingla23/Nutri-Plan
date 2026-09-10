"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Sparkles,
  Globe,
  Utensils,
  ChevronDown,
  ChefHat,
} from "lucide-react";
import { IRecipe } from "@/types";
import { fetchCustomRecipes } from "@/services/recipeService";
import {
  searchMealsByName,
  filterMealsByCategory,
  filterMealsByCuisine,
  getCategories,
  getAreas,
} from "@/lib/themealdb";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeModal from "@/components/recipes/RecipeModal";
import RecipeFormModal from "@/components/recipes/RecipeFormModal";
import MealSlotModal from "@/components/planner/MealSlotModal";
import QuickSeedButton from "@/components/QuickSeedButton";
import { useToast } from "@/components/ui/Toast";
import { useVegPreference } from "@/context/VegPreferenceContext";
import VegToggle from "@/components/VegToggle";

export default function RecipesPage() {
  const { error } = useToast();

  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [customRecipes, setCustomRecipes] = useState<IRecipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArea, setSelectedArea] = useState("All");
  const [sourceTab, setSourceTab] = useState<"all" | "custom" | "themealdb">("all");

  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<IRecipe | null>(null);
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [slotModalState, setSlotModalState] = useState<{
    isOpen: boolean;
    recipeToSchedule: IRecipe | null;
  }>({
    isOpen: false,
    recipeToSchedule: null,
  });

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [cats, arList, customs, defaults] = await Promise.all([
          getCategories(),
          getAreas(),
          fetchCustomRecipes(),
          searchMealsByName("chicken"),
        ]);

        setCategories(["All", ...cats.map((c) => c.strCategory)]);
        setAreas(["All", ...arList]);
        setCustomRecipes(customs);
        setRecipes(defaults);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (sourceTab === "custom") {
        const customs = await fetchCustomRecipes({
          search: searchQuery,
          category: selectedCategory,
          cuisine: selectedArea,
        });
        setCustomRecipes(customs);
      } else {
        let results: IRecipe[] = [];
        if (selectedCategory !== "All") {
          results = await filterMealsByCategory(selectedCategory);
        } else if (selectedArea !== "All") {
          results = await filterMealsByCuisine(selectedArea);
        } else {
          results = await searchMealsByName(searchQuery || "chicken");
        }

        const customs = await fetchCustomRecipes({
          search: searchQuery,
          category: selectedCategory,
          cuisine: selectedArea,
        });
        setCustomRecipes(customs);
        setRecipes(results);
      }
    } catch (err: any) {
      error("Search error", err.message || "Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  };

  const { isVegOnly, filterRecipes } = useVegPreference();

  const allDisplayRecipes =
    sourceTab === "custom"
      ? customRecipes
      : sourceTab === "themealdb"
      ? recipes
      : [...customRecipes, ...recipes];

  const finalRecipes = filterRecipes(allDisplayRecipes);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-soft">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
              Recipe Discovery & Custom Kitchen
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Explore thousands of verified meals from TheMealDB API or craft your own personalized dishes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <VegToggle variant="filter" />
          <button
            onClick={() => setIsRecipeFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Recipe</span>
          </button>
          <QuickSeedButton
            onSuccess={async () => {
              const customs = await fetchCustomRecipes();
              setCustomRecipes(customs);
            }}
            variant="compact"
          />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/90 rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-soft space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-600 absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search recipes by name, ingredient, or keyword (e.g., Pasta, Curry, Salmon, Paneer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 text-sm rounded-2xl border border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-2xl shadow-soft transition-all"
          >
            Search Recipes
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
          {/* Tabs: All / Custom / TheMealDB */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600">Source:</span>
            <div className="inline-flex p-1 bg-stone-100 rounded-xl">
              <button
                onClick={() => setSourceTab("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sourceTab === "all"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setSourceTab("custom")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sourceTab === "custom"
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                ★ Custom ({customRecipes.length})
              </button>
              <button
                onClick={() => setSourceTab("themealdb")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sourceTab === "themealdb"
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                TheMealDB Verified
              </button>
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-stone-600" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedArea("All");
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-600" />
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelectedCategory("All");
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 outline-none"
              >
                {areas.map((a) => (
                  <option key={a} value={a}>
                    Cuisine: {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Veg Only Banner indicator if active */}
      {isVegOnly && (
        <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Showing Vegetarian Meals Only ({finalRecipes.length} found)</span>
          </div>
          <span className="text-[11px] text-emerald-700">Filter active from top toggle</span>
        </div>
      )}

      {/* Recipe Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : finalRecipes.length === 0 ? (
        <div className="py-16 text-center bg-white/60 rounded-3xl border border-dashed border-stone-300">
          <Utensils className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          <h3 className="font-display font-bold text-lg text-stone-800">
            {isVegOnly ? "No vegetarian recipes found" : "No recipes matched your search"}
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
            {isVegOnly
              ? "Try turning off 'Veg Only' at the top or search for other vegetarian ingredients like paneer, pasta, salad, or lentil."
              : "Try adjusting your search keywords, clear category filters, or create a brand new custom recipe."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedArea("All");
              setSourceTab("all");
              handleSearch();
            }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {finalRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id || recipe.id}
              recipe={recipe}
              onView={(r) => setSelectedRecipeModal(r)}
              onAddToPlanner={(r) =>
                setSlotModalState({
                  isOpen: true,
                  recipeToSchedule: r,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RecipeModal
        recipe={selectedRecipeModal}
        onClose={() => setSelectedRecipeModal(null)}
        onAddToPlanner={(r) =>
          setSlotModalState({
            isOpen: true,
            recipeToSchedule: r,
          })
        }
      />

      <RecipeFormModal
        isOpen={isRecipeFormOpen}
        onClose={() => setIsRecipeFormOpen(false)}
        onSuccess={async () => {
          const customs = await fetchCustomRecipes();
          setCustomRecipes(customs);
        }}
      />

      <MealSlotModal
        isOpen={slotModalState.isOpen}
        dayOfWeek="Monday"
        mealType="dinner"
        initialRecipe={slotModalState.recipeToSchedule}
        onClose={() => setSlotModalState({ isOpen: false, recipeToSchedule: null })}
      />
    </div>
  );
}
