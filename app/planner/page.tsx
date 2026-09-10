"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Utensils,
  Plus,
  Trash2,
  Printer,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { IMealPlan, IRecipe, DayOfWeek, MealType } from "@/types";
import { fetchMealPlans, clearWeeklyMealPlan, deleteMealPlanSlot } from "@/services/mealPlanService";
import MealSlotModal from "@/components/planner/MealSlotModal";
import RecipeModal from "@/components/recipes/RecipeModal";
import QuickSeedButton from "@/components/QuickSeedButton";
import VegToggle from "@/components/VegToggle";
import { useToast } from "@/components/ui/Toast";


const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export default function PlannerPage() {
  const { success, error } = useToast();
  const [mealPlans, setMealPlans] = useState<IMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRecipeModal, setViewRecipeModal] = useState<IRecipe | null>(null);

  const [slotModalState, setSlotModalState] = useState<{
    isOpen: boolean;
    day: DayOfWeek;
    mealType: MealType;
    currentPlan: IMealPlan | null;
  }>({
    isOpen: false,
    day: "Monday",
    mealType: "breakfast",
    currentPlan: null,
  });

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMealPlans();
      setMealPlans(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire weekly meal plan?")) {
      return;
    }
    try {
      await clearWeeklyMealPlan();
      success("Planner Cleared", "All weekly meal plan slots have been reset.");
      loadPlans();
    } catch (err: any) {
      error("Error", err.message || "Failed to clear planner.");
    }
  };

  const getPlanForSlot = (day: DayOfWeek, mealType: MealType) => {
    return mealPlans.find((p) => p.dayOfWeek === day && p.mealType === mealType) || null;
  };

  const totalPlanned = mealPlans.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-soft">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
                Weekly Meal Planner
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Schedule your culinary week. Ingredients automatically sync with your grocery list!
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <VegToggle variant="compact" />

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print Week</span>
          </button>

          <Link
            href="/grocery"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-soft transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Grocery List</span>
          </Link>

          {totalPlanned > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Week</span>
            </button>
          )}

          <QuickSeedButton onSuccess={loadPlans} variant="compact" />
        </div>
      </div>

      {/* Progress & Stat Pill */}
      <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-900 no-print">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>
            Weekly Plan Coverage: <strong>{totalPlanned} of 21 slots planned</strong> (
            {Math.round((totalPlanned / 21) * 100)}%)
          </span>
        </div>
        <div className="w-full sm:w-48 bg-brand-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${(totalPlanned / 21) * 100}%` }}
          />
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS.map((day) => {
          const dayPlans = mealPlans.filter((p) => p.dayOfWeek === day);

          return (
            <div
              key={day}
              className="bg-white/95 rounded-3xl border border-stone-200 shadow-soft p-4 flex flex-col justify-between space-y-3 print:shadow-none print:border-stone-300"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div>
                  <h3 className="font-display font-bold text-sm text-stone-900">{day}</h3>
                  <span className="text-[10px] text-stone-600">{dayPlans.length} planned</span>
                </div>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    dayPlans.length === 3
                      ? "bg-brand-600 text-white"
                      : dayPlans.length > 0
                      ? "bg-brand-100 text-brand-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {dayPlans.length}
                </span>
              </div>

              {/* 3 Meal Slots */}
              <div className="space-y-2.5 flex-1">
                {MEAL_TYPES.map((type) => {
                  const plan = getPlanForSlot(day, type);
                  const recipe =
                    (typeof plan?.recipeId === "object" && plan.recipeId)
                      ? (plan.recipeId as IRecipe)
                      : null;
                  const external = plan?.externalMeal;

                  const title = recipe?.title || external?.title || "";
                  const image =
                    recipe?.image ||
                    external?.image ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                  const category = recipe?.category || external?.category || "";
                  const cuisine = recipe?.cuisine || external?.cuisine || "";

                  return (
                    <div
                      key={type}
                      className={`group relative rounded-2xl border transition-all p-3 flex flex-col justify-between ${
                        plan
                          ? "bg-gradient-to-b from-stone-50 to-white border-stone-200/90 shadow-sm hover:border-brand-300"
                          : "bg-stone-50/60 border-dashed border-stone-200 hover:bg-white hover:border-brand-300 text-stone-600 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!plan) {
                          setSlotModalState({
                            isOpen: true,
                            day,
                            mealType: type,
                            currentPlan: null,
                          });
                        }
                      }}
                    >
                      {/* Slot Label */}
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        <span
                          className={
                            type === "breakfast"
                              ? "text-amber-600"
                              : type === "lunch"
                              ? "text-sky-600"
                              : "text-emerald-600"
                          }
                        >
                          {type}
                        </span>

                        {plan && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (recipe) {
                                  setViewRecipeModal(recipe);
                                } else if (external) {
                                  setViewRecipeModal({
                                    id: external.id,
                                    _id: external.id,
                                    title: external.title,
                                    image: external.image,
                                    category: external.category,
                                    cuisine: external.cuisine,
                                    instructions: [],
                                    ingredients: external.ingredients || [],
                                    prepTime: 25,
                                    isCustom: false,
                                  });
                                }
                              }}
                              title="View Recipe Details"
                              className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSlotModalState({
                                  isOpen: true,
                                  day,
                                  mealType: type,
                                  currentPlan: plan,
                                });
                              }}
                              title="Change Meal"
                              className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-brand-600"
                            >
                              <Utensils className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (plan._id) {
                                  await deleteMealPlanSlot(plan._id);
                                  success("Removed", `Cleared ${day} ${type}`);
                                  loadPlans();
                                }
                              }}
                              title="Delete from plan"
                              className="p-1 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      {plan ? (
                        <div className="space-y-2">
                          <div className="relative h-20 w-full rounded-xl overflow-hidden bg-stone-100">
                            <Image
                              src={image}
                              alt={title}
                              fill
                              sizes="(max-width: 768px) 100vw, 200px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                              {category || "Meal"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1 leading-snug">
                              {title}
                            </h4>
                            {cuisine && (
                              <p className="text-[10px] text-stone-600">{cuisine}</p>
                            )}
                          </div>

                          {plan.notes && (
                            <p className="text-[10px] text-stone-600 bg-stone-100/80 p-1.5 rounded-lg line-clamp-2 italic">
                              &ldquo;{plan.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-5 text-center flex flex-col items-center justify-center space-y-1">
                          <div className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 group-hover:text-brand-600 group-hover:border-brand-300 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-medium text-stone-600 group-hover:text-stone-700">
                            Plan {type}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <MealSlotModal
        isOpen={slotModalState.isOpen}
        dayOfWeek={slotModalState.day}
        mealType={slotModalState.mealType}
        currentPlan={slotModalState.currentPlan}
        onClose={() => setSlotModalState((prev) => ({ ...prev, isOpen: false }))}
        onSaved={loadPlans}
      />

      <RecipeModal
        recipe={viewRecipeModal}
        onClose={() => setViewRecipeModal(null)}
      />
    </div>
  );
}
