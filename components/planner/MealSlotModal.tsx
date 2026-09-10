"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Search,
  Calendar,
  Clock,
  Utensils,
  Sparkles,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { DayOfWeek, MealType, IRecipe, IMealPlan } from "@/types";
import { saveMealPlanSlot, deleteMealPlanSlot } from "@/services/mealPlanService";
import { fetchCustomRecipes } from "@/services/recipeService";
import { searchMealsByName } from "@/lib/themealdb";
import { useToast } from "@/components/ui/Toast";
import { useVegPreference } from "@/context/VegPreferenceContext";
import VegToggle from "@/components/VegToggle";

interface MealSlotModalProps {
  isOpen: boolean;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  currentPlan?: IMealPlan | null;
  initialRecipe?: IRecipe | null;
  onClose: () => void;
  onSaved?: () => void;
}

export default function MealSlotModal({
  isOpen,
  dayOfWeek,
  mealType,
  currentPlan,
  initialRecipe,
  onClose,
  onSaved,
}: MealSlotModalProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "custom" | "api">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customRecipes, setCustomRecipes] = useState<IRecipe[]>([]);
  const [apiRecipes, setApiRecipes] = useState<IRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<IRecipe | null>(initialRecipe || null);
  const [notes, setNotes] = useState(currentPlan?.notes || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load custom recipes on open
  useEffect(() => {
    if (!isOpen) return;

    if (initialRecipe) {
      setSelectedRecipe(initialRecipe);
    } else if (currentPlan) {
      if (typeof currentPlan.recipeId === "object" && currentPlan.recipeId) {
        setSelectedRecipe(currentPlan.recipeId as IRecipe);
      } else if (currentPlan.externalMeal) {
        setSelectedRecipe({
          id: currentPlan.externalMeal.id,
          _id: currentPlan.externalMeal.id,
          title: currentPlan.externalMeal.title,
          image: currentPlan.externalMeal.image,
          category: currentPlan.externalMeal.category,
          cuisine: currentPlan.externalMeal.cuisine,
          instructions: [],
          ingredients: currentPlan.externalMeal.ingredients || [],
          prepTime: 25,
          isCustom: false,
        });
      }
      setNotes(currentPlan.notes || "");
    } else {
      setSelectedRecipe(null);
      setNotes("");
    }

    async function loadData() {
      setLoading(true);
      try {
        const [customs, defaults] = await Promise.all([
          fetchCustomRecipes(),
          searchMealsByName("salad"),
        ]);
        setCustomRecipes(customs);
        setApiRecipes(defaults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen, initialRecipe, currentPlan]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [customs, apis] = await Promise.all([
        fetchCustomRecipes({ search: searchQuery }),
        searchMealsByName(searchQuery),
      ]);
      setCustomRecipes(customs);
      setApiRecipes(apis);
    } catch (err: any) {
      error("Search error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlot = async (recipeToSave?: IRecipe) => {
    const target = recipeToSave || selectedRecipe;
    if (!target) {
      error("Selection required", "Please select a recipe for this meal slot.");
      return;
    }

    try {
      setSaving(true);
      const isCustomDbRecipe = target.isCustom && target._id && !target._id.startsWith("52");

      if (isCustomDbRecipe) {
        await saveMealPlanSlot({
          dayOfWeek,
          mealType,
          recipeId: target._id,
          notes: notes.trim(),
        });
      } else {
        await saveMealPlanSlot({
          dayOfWeek,
          mealType,
          externalMeal: {
            id: target.id || target._id || "",
            title: target.title,
            image:
              target.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            category: target.category || "Meal",
            cuisine: target.cuisine || "International",
            ingredients: target.ingredients || [],
          },
          notes: notes.trim(),
        });
      }

      success(
        "Meal Scheduled!",
        `Assigned "${target.title}" to ${dayOfWeek} ${mealType.toUpperCase()}`
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      error("Save error", err.message || "Failed to schedule meal.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearSlot = async () => {
    if (!currentPlan?._id) return;
    try {
      setSaving(true);
      await deleteMealPlanSlot(currentPlan._id);
      success("Slot cleared", `Cleared ${dayOfWeek} ${mealType}`);
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      error("Delete error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const { isVegOnly, filterRecipes } = useVegPreference();

  if (!isOpen) return null;

  const rawList =
    activeTab === "custom"
      ? customRecipes
      : activeTab === "api"
      ? apiRecipes
      : [...customRecipes, ...apiRecipes];

  const displayList = filterRecipes(rawList);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-brand-200" />
            <div>
              <h2 className="font-display font-bold text-base text-white leading-tight">
                Plan Meal: <span className="text-brand-100">{dayOfWeek}</span> •{" "}
                <span className="capitalize">{mealType}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="p-4 sm:p-6 border-b border-stone-200 space-y-3 bg-stone-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search recipe or ingredient (e.g., Pasta, Paneer, Chicken)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-600 font-medium">Source:</span>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-brand-600 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                All ({displayList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === "custom"
                    ? "bg-amber-500 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                ★ Custom
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("api")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === "api"
                    ? "bg-brand-600 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                TheMealDB Discovery
              </button>
            </div>
            <VegToggle variant="compact" />
          </div>
        </div>

        {/* Scrollable Recipe Picker */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-600">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">Searching recipes...</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-12 text-stone-600">
              <Utensils className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">No recipes found</p>
              <p className="text-xs mt-1">Try a different search term or add a custom recipe.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayList.map((recipe, idx) => {
                const isSelected =
                  selectedRecipe?.title === recipe.title ||
                  (selectedRecipe?._id && selectedRecipe._id === recipe._id);

                return (
                  <div
                    key={recipe._id || recipe.id || idx}
                    onClick={() => setSelectedRecipe(recipe)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none text-left relative ${
                      isSelected
                        ? "bg-brand-50/80 border-brand-500 shadow-soft"
                        : "bg-white hover:bg-stone-50 border-stone-200 shadow-sm"
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                      <Image
                        src={
                          recipe.image ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-1.5 py-0.5 rounded">
                          {recipe.category || "Meal"}
                        </span>
                        {recipe.isCustom && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            ★ Custom
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-[11px] text-stone-600 flex items-center gap-2 mt-0.5">
                        <span>{recipe.cuisine}</span>
                        <span>•</span>
                        <span>{recipe.prepTime || 20}m prep</span>
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional Meal Notes */}
          <div className="pt-3 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Optional Note / Reminder
            </label>
            <input
              type="text"
              placeholder="e.g. Prep ingredients Sunday evening, serve with warm pita..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-sm flex-shrink-0">
          <div>
            {currentPlan && (
              <button
                type="button"
                onClick={handleClearSlot}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Slot</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveSlot()}
              disabled={!selectedRecipe || saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-soft-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Scheduling..." : "Confirm Meal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
