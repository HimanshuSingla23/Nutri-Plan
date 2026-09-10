"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Utensils,
  Globe,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  Video,
  Check,
  Tag,
  ChefHat,
  Sparkles,
} from "lucide-react";
import { IRecipe } from "@/types";
import { fetchRecipeById } from "@/services/recipeService";
import { getMealById } from "@/lib/themealdb";
import { addRecipeIngredientsToGrocery } from "@/services/groceryService";
import MealSlotModal from "@/components/planner/MealSlotModal";
import { useToast } from "@/components/ui/Toast";

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { success, error } = useToast();

  const [recipe, setRecipe] = useState<IRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isAddingGrocery, setIsAddingGrocery] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        // Try custom Mongo recipe first
        let found = await fetchRecipeById(id);
        // Fallback to TheMealDB
        if (!found) {
          found = await getMealById(id);
        }
        setRecipe(found);
        if (found?.servings) setServings(found.servings);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-stone-600">Loading recipe details...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Utensils className="w-12 h-12 mx-auto text-stone-300" />
        <h2 className="text-xl font-bold text-stone-800">Recipe Not Found</h2>
        <p className="text-xs text-stone-600">The requested recipe could not be retrieved.</p>
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipes</span>
        </Link>
      </div>
    );
  }

  const baseServings = recipe.servings || 2;
  const ratio = servings / baseServings;

  const scaleAmount = (amountStr: string) => {
    if (!amountStr) return "";
    const num = parseFloat(amountStr);
    if (!isNaN(num)) {
      const scaled = num * ratio;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    }
    return amountStr;
  };

  const handleAddToGrocery = async () => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      error("No ingredients", "This recipe has no ingredients listed.");
      return;
    }
    try {
      setIsAddingGrocery(true);
      await addRecipeIngredientsToGrocery(recipe.title, recipe.ingredients);
      success("Added to Grocery!", `Ingredients for "${recipe.title}" added.`);
    } catch (err: any) {
      error("Error", err.message || "Failed to add ingredients.");
    } finally {
      setIsAddingGrocery(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Navigation link */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recipe Discovery</span>
      </Link>

      <div className="bg-white/95 rounded-3xl border border-stone-200 shadow-soft overflow-hidden">
        {/* Banner image */}
        <div className="relative h-72 sm:h-96 w-full bg-stone-100">
          <Image
            src={
              recipe.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
            }
            alt={recipe.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

          {/* Banner Badges */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/90 backdrop-blur-sm text-white shadow-sm">
                {recipe.category}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {recipe.cuisine}
              </span>
              {recipe.isCustom && (
                <span className="px-3 py-1 text-xs font-bold rounded-xl bg-amber-400 text-stone-950 shadow-sm">
                  ★ Custom Kitchen
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Action ribbon */}
        <div className="px-6 sm:px-8 py-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-medium text-stone-700">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{recipe.prepTime} minutes</span>
            </div>

            {/* Servings scaler */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-semibold text-stone-700">{servings} servings</span>
              <div className="flex items-center gap-1 ml-1.5">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="p-1 rounded-md hover:bg-stone-100 text-stone-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setServings((s) => s + 1)}
                  className="p-1 rounded-md hover:bg-stone-100 text-stone-600"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Watch Video</span>
              </a>
            )}

            <button
              onClick={handleAddToGrocery}
              disabled={isAddingGrocery}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <span>{isAddingGrocery ? "Adding..." : "Add to Grocery"}</span>
            </button>

            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-soft active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Add to Meal Plan</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {recipe.description && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-stone-700 text-sm italic leading-relaxed">
              &ldquo;{recipe.description}&rdquo;
            </div>
          )}

          {/* Ingredients list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-stone-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-brand-600" />
                <span>Ingredients</span>
                <span className="text-xs font-normal text-stone-600">
                  ({recipe.ingredients?.length || 0} items)
                </span>
              </h3>
              <span className="text-xs text-stone-600">Check off as you cook</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipe.ingredients?.map((ing, idx) => {
                const isChecked = checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() =>
                      setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300 text-stone-600 line-through"
                        : "bg-stone-50 hover:bg-white border-stone-200 text-stone-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium truncate">{ing.name}</span>
                    </div>

                    <span className="text-xs font-bold text-brand-700 ml-2 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-sm">
                      {scaleAmount(ing.amount)} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div>
            <h3 className="font-display font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-brand-600" />
              <span>Instructions</span>
            </h3>

            <div className="space-y-3.5">
              {recipe.instructions?.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:bg-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {recipe.notes && (
            <div className="p-4 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs text-stone-600">
              <strong className="text-stone-800 font-semibold">Chef&apos;s Notes:</strong> {recipe.notes}
            </div>
          )}
        </div>
      </div>

      {/* Meal slot modal */}
      <MealSlotModal
        isOpen={isSlotModalOpen}
        dayOfWeek="Monday"
        mealType="dinner"
        initialRecipe={recipe}
        onClose={() => setIsSlotModalOpen(false)}
      />
    </div>
  );
}
