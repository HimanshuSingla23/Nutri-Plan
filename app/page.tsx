"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Utensils,
  PackageCheck,
  ShoppingCart,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChefHat,
  RefreshCw,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  IMealPlan,
  IRecipe,
  IPantryItem,
  IGroceryItem,
  DayOfWeek,
  MealType,
} from "@/types";
import { fetchMealPlans, deleteMealPlanSlot } from "@/services/mealPlanService";
import { fetchCustomRecipes } from "@/services/recipeService";
import { fetchPantryItems, adjustPantryQuantity } from "@/services/pantryService";
import { fetchGroceryList, toggleGroceryPurchased } from "@/services/groceryService";
import { searchMealsByName } from "@/lib/themealdb";
import { formatRelativeDays, getExpirationStatus } from "@/lib/utils";
import RecipeCard from "@/components/recipes/RecipeCard";
import RecipeModal from "@/components/recipes/RecipeModal";
import RecipeFormModal from "@/components/recipes/RecipeFormModal";
import MealSlotModal from "@/components/planner/MealSlotModal";
import PantryItemModal from "@/components/pantry/PantryItemModal";
import AddGroceryModal from "@/components/grocery/AddGroceryModal";
import QuickSeedButton from "@/components/QuickSeedButton";
import { useToast } from "@/components/ui/Toast";
import { useVegPreference } from "@/context/VegPreferenceContext";
import VegToggle from "@/components/VegToggle";
import { Leaf } from "lucide-react";


const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export default function HomePage() {
  const { success, error } = useToast();
  const { isVegOnly, filterRecipes } = useVegPreference();

  // Core Data States
  const [mealPlans, setMealPlans] = useState<IMealPlan[]>([]);
  const [customRecipes, setCustomRecipes] = useState<IRecipe[]>([]);
  const [pantryItems, setPantryItems] = useState<IPantryItem[]>([]);
  const [groceryItems, setGroceryItems] = useState<IGroceryItem[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<IRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Category Filter for featured recipes
  const [activeCategory, setActiveCategory] = useState("All");

  // Modals
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<IRecipe | null>(null);
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);

  // Meal slot modal state
  const [slotModalState, setSlotModalState] = useState<{
    isOpen: boolean;
    day: DayOfWeek;
    mealType: MealType;
    currentPlan: IMealPlan | null;
    recipeToSchedule?: IRecipe | null;
  }>({
    isOpen: false,
    day: "Monday",
    mealType: "dinner",
    currentPlan: null,
  });

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const defaultQuery = isVegOnly ? "pasta" : "chicken";
      const [plans, customs, pantry, grocery, featured] = await Promise.all([
        fetchMealPlans(),
        fetchCustomRecipes(),
        fetchPantryItems(),
        fetchGroceryList(),
        searchMealsByName(defaultQuery),
      ]);

      setMealPlans(plans);
      setCustomRecipes(customs);
      setPantryItems(pantry);
      setGroceryItems(grocery.items);
      setFeaturedRecipes(featured.slice(0, 8));
    } catch (err: any) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [isVegOnly]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle category filtering
  const handleCategoryFilter = async (category: string) => {
    setActiveCategory(category);
    try {
      if (category === "All") {
        const defaultQuery = isVegOnly ? "pasta" : "chicken";
        const meals = await searchMealsByName(defaultQuery);
        setFeaturedRecipes(meals.slice(0, 8));
      } else if (category === "Custom") {
        const customs = await fetchCustomRecipes();
        setFeaturedRecipes(customs);
      } else {
        const meals = await searchMealsByName(category);
        setFeaturedRecipes(meals.slice(0, 8));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Plan handler triggered from a recipe card
  const handleScheduleRecipe = (recipe: IRecipe) => {
    setSlotModalState({
      isOpen: true,
      day: "Monday",
      mealType: "dinner",
      currentPlan: null,
      recipeToSchedule: recipe,
    });
  };

  // Helper to find a planned meal for a specific day and meal type
  const getSlotPlan = (day: DayOfWeek, mealType: MealType) => {
    return mealPlans.find((p) => p.dayOfWeek === day && p.mealType === mealType) || null;
  };

  // Calculate statistics
  const plannedMealCount = mealPlans.length;
  const expiringPantryItems = pantryItems.filter((item) => {
    if (!item.expirationDate) return false;
    const stat = getExpirationStatus(item.expirationDate);
    return stat.status === "expired" || stat.status === "expiring_soon";
  });
  const unpurchasedGroceryCount = groceryItems.filter((g) => !g.isPurchased).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Hero Section & Stats */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-stone-900 to-brand-950 text-white p-6 sm:p-10 shadow-2xl border border-brand-800/40">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Smart Nutrition & Zero Food Waste</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
            Plan Better. <span className="text-brand-400">Eat Fresher.</span> Waste Less.
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-normal">
            Effortlessly organize your weekly dining schedule, discover chef-crafted meals from TheMealDB, monitor pantry expiration dates, and auto-sync ingredients directly to your shopping list.
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-stone-950 font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Weekly Meal Planner</span>
            </Link>

            <button
              onClick={() => setIsRecipeFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all active:scale-95"
            >
              <ChefHat className="w-4 h-4 text-brand-300" />
              <span>Create Custom Recipe</span>
            </button>

            <QuickSeedButton
              onSuccess={loadAllData}
              variant="primary"
              className="border border-brand-400/30 text-xs py-3"
            />
          </div>
        </div>

        {/* Floating Quick Stat Cards */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <Link
            href="/planner"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all group"
          >
            <div className="flex items-center justify-between text-brand-300 mb-1">
              <span className="text-xs font-semibold">Planned Meals</span>
              <Calendar className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display">{plannedMealCount}</span>
              <span className="text-xs text-stone-400">/ 21 slots</span>
            </div>
          </Link>

          <Link
            href="/pantry"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all group"
          >
            <div className="flex items-center justify-between text-amber-300 mb-1">
              <span className="text-xs font-semibold">Expiring Soon</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display">
                {expiringPantryItems.length}
              </span>
              <span className="text-xs text-stone-400">items alert</span>
            </div>
          </Link>

          <Link
            href="/grocery"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all group"
          >
            <div className="flex items-center justify-between text-emerald-300 mb-1">
              <span className="text-xs font-semibold">Grocery Items</span>
              <ShoppingCart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display">
                {unpurchasedGroceryCount}
              </span>
              <span className="text-xs text-stone-400">to buy</span>
            </div>
          </Link>

          <Link
            href="/recipes"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all group"
          >
            <div className="flex items-center justify-between text-sky-300 mb-1">
              <span className="text-xs font-semibold">Custom Recipes</span>
              <Utensils className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display">{customRecipes.length}</span>
              <span className="text-xs text-stone-400">crafted</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 2. Expiring Soon Pantry Warning Banner (if any) */}
      {expiringPantryItems.length > 0 && (
        <section className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Food Expiration Alert: {expiringPantryItems.length} pantry items need attention!
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {expiringPantryItems
                  .map((i) => `${i.name} (${formatRelativeDays(i.expirationDate)})`)
                  .join(" • ")}
              </p>
            </div>
          </div>
          <Link
            href="/pantry"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
          >
            <span>Review Pantry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}

      {/* 3. Weekly Meal Planner Spotlight */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-extrabold text-2xl text-stone-900">
                Weekly Meal Planner
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Click any slot to schedule recipes from TheMealDB or your custom kitchen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm transition-all"
            >
              <span>Full Planner & Print View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 7-Day Quick Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayPlans = mealPlans.filter((p) => p.dayOfWeek === day);

            return (
              <div
                key={day}
                className="bg-white/90 rounded-2xl border border-stone-200/80 p-3 shadow-soft flex flex-col justify-between space-y-2.5 hover:border-brand-300 transition-all"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                  <span className="font-display font-bold text-xs text-stone-900 uppercase tracking-wide">
                    {day.substring(0, 3)}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-md">
                    {dayPlans.length}/3
                  </span>
                </div>

                {/* 3 Meal Rows */}
                <div className="space-y-1.5">
                  {MEAL_TYPES.map((type) => {
                    const plan = getSlotPlan(day, type);
                    const recipeTitle =
                      (typeof plan?.recipeId === "object" && plan.recipeId?.title) ||
                      plan?.externalMeal?.title ||
                      "";

                    return (
                      <div
                        key={type}
                        onClick={() =>
                          setSlotModalState({
                            isOpen: true,
                            day,
                            mealType: type,
                            currentPlan: plan,
                          })
                        }
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          plan
                            ? "bg-brand-50/70 border-brand-200 hover:bg-brand-100/70"
                            : "bg-stone-50/60 border-dashed border-stone-200 hover:bg-white hover:border-stone-300 text-stone-600"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5">
                          <span
                            className={
                              type === "breakfast"
                                ? "text-amber-700"
                                : type === "lunch"
                                ? "text-sky-700"
                                : "text-emerald-700"
                            }
                          >
                            {type.substring(0, 1).toUpperCase()} • {type}
                          </span>
                        </div>

                        {plan ? (
                          <p className="text-xs font-semibold text-stone-800 line-clamp-1">
                            {recipeTitle}
                          </p>
                        ) : (
                          <p className="text-[11px] text-stone-600 flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>Add meal</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recipe Discovery & Inspiration Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-extrabold text-2xl text-stone-900">
                Recipe Inspiration
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Explore global culinary delights or cook from your custom recipe creations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <VegToggle variant="filter" />
            <button
              onClick={() => setIsRecipeFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-soft transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Recipe</span>
            </button>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm transition-all"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Veg Mode Active Banner on Dashboard */}
        {isVegOnly && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-600 flex-shrink-0" />
              <span>
                <strong>Vegetarian Mode Active:</strong> Showing vegetarian and plant-forward meals only.
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-normal hidden sm:inline">
              Toggle ON/OFF in header or above
            </span>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {["All", "Custom", "Pasta", "Curry", "Salad", "Seafood", "Breakfast"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-brand-600 text-white shadow-soft"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80"
              }`}
            >
              {cat === "Custom" ? "★ Custom Recipes" : cat}
            </button>
          ))}
        </div>

        {/* Recipe Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-stone-200/60 animate-pulse" />
            ))}
          </div>
        ) : (() => {
          const displayedRecipes = filterRecipes(featuredRecipes);
          if (displayedRecipes.length === 0) {
            return (
              <div className="py-12 text-center bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-base font-bold text-stone-800">
                  No vegetarian recipes match &quot;{activeCategory}&quot;
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  {isVegOnly
                    ? "Veg Only filter is currently ON. Select Pasta, Salad, or Custom, or toggle off Veg Only at the top."
                    : "Try selecting another category or create your own custom recipe."}
                </p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id || recipe.id}
                  recipe={recipe}
                  onView={(r) => setSelectedRecipeModal(r)}
                  onAddToPlanner={handleScheduleRecipe}
                />
              ))}
            </div>
          );
        })()}
      </section>

      {/* 5. Pantry Tracker Snapshot & Smart Grocery Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pantry Quick Widget */}
        <div className="bg-white/90 rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-brand-600" />
                <h3 className="font-display font-bold text-lg text-stone-900">
                  Pantry Inventory & Shelf Life
                </h3>
              </div>
              <button
                onClick={() => setIsPantryModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-2.5 py-1.5 rounded-xl border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {pantryItems.length === 0 ? (
                <div className="py-8 text-center text-stone-600 text-xs">
                  <PackageCheck className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p>No pantry items yet.</p>
                  <p className="mt-1">Use &ldquo;Load Demo Data&rdquo; or add custom pantry items.</p>
                </div>
              ) : (
                pantryItems.slice(0, 5).map((item) => {
                  const exp = getExpirationStatus(item.expirationDate);

                  return (
                    <div
                      key={item._id || item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/80 border border-stone-200/60 hover:bg-white transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-stone-900 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-stone-600 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          {item.quantity} {item.unit} •{" "}
                          <span
                            className={
                              exp.status === "expired"
                                ? "text-rose-600 font-bold"
                                : exp.status === "expiring_soon"
                                ? "text-amber-600 font-semibold"
                                : "text-emerald-600"
                            }
                          >
                            {exp.label}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 ml-3">
                        <button
                          onClick={async () => {
                            if (!item._id) return;
                            await adjustPantryQuantity(item._id, item.quantity, -1);
                            loadAllData();
                          }}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={async () => {
                            if (!item._id) return;
                            await adjustPantryQuantity(item._id, item.quantity, 1);
                            loadAllData();
                          }}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-600">{pantryItems.length} total pantry items tracked</span>
            <Link
              href="/pantry"
              className="font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Manage Full Pantry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Grocery List Quick Widget */}
        <div className="bg-white/90 rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-600" />
                <h3 className="font-display font-bold text-lg text-stone-900">
                  Smart Grocery Checklist
                </h3>
              </div>
              <button
                onClick={() => setIsGroceryModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-2.5 py-1.5 rounded-xl border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {groceryItems.length === 0 ? (
                <div className="py-8 text-center text-stone-600 text-xs">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p>Grocery list is empty.</p>
                  <p className="mt-1">Add meals to your weekly planner to auto-generate ingredients.</p>
                </div>
              ) : (
                groceryItems.slice(0, 5).map((item) => (
                  <div
                    key={item._id || item.id}
                    onClick={async () => {
                      await toggleGroceryPurchased(item);
                      loadAllData();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      item.isPurchased
                        ? "bg-stone-50 border-stone-200 text-stone-600 line-through opacity-70"
                        : "bg-white border-stone-200/80 text-stone-800 shadow-sm hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          item.isPurchased
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {item.isPurchased && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{item.name}</p>
                        <p className="text-[10px] text-stone-600">
                          {item.source === "planner" ? "Weekly Planner" : "Custom Add"}
                          {item.inPantryQuantity && item.inPantryQuantity > 0 ? (
                            <span className="text-emerald-600 font-medium ml-1">
                              ({item.inPantryQuantity} in pantry)
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
                      {item.amount} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-600">
              {groceryItems.filter((i) => i.isPurchased).length} / {groceryItems.length} purchased
            </span>
            <Link
              href="/grocery"
              className="font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View Full Grocery List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* MODALS */}
      {/* 1. Recipe Details Modal */}
      <RecipeModal
        recipe={selectedRecipeModal}
        onClose={() => setSelectedRecipeModal(null)}
        onAddToPlanner={handleScheduleRecipe}
      />

      {/* 2. Custom Recipe Creator Modal */}
      <RecipeFormModal
        isOpen={isRecipeFormOpen}
        onClose={() => setIsRecipeFormOpen(false)}
        onSuccess={() => loadAllData()}
      />

      {/* 3. Meal Slot Planner Modal */}
      <MealSlotModal
        isOpen={slotModalState.isOpen}
        dayOfWeek={slotModalState.day}
        mealType={slotModalState.mealType}
        currentPlan={slotModalState.currentPlan}
        initialRecipe={slotModalState.recipeToSchedule}
        onClose={() =>
          setSlotModalState((prev) => ({ ...prev, isOpen: false, recipeToSchedule: null }))
        }
        onSaved={() => loadAllData()}
      />

      {/* 4. Pantry Add/Edit Modal */}
      <PantryItemModal
        isOpen={isPantryModalOpen}
        onClose={() => setIsPantryModalOpen(false)}
        onSuccess={() => loadAllData()}
      />

      {/* 5. Custom Grocery Item Modal */}
      <AddGroceryModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        onSuccess={() => loadAllData()}
      />
    </div>
  );
}
