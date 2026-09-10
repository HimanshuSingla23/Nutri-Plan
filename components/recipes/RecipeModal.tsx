"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
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
  Share2,
} from "lucide-react";
import { IRecipe } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { addRecipeIngredientsToGrocery } from "@/services/groceryService";

interface RecipeModalProps {
  recipe: IRecipe | null;
  onClose: () => void;
  onAddToPlanner?: (recipe: IRecipe) => void;
}

export default function RecipeModal({ recipe, onClose, onAddToPlanner }: RecipeModalProps) {
  const { success, error } = useToast();
  const [servings, setServings] = useState<number>(recipe?.servings || 2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isAddingGrocery, setIsAddingGrocery] = useState(false);

  if (!recipe) return null;

  const baseServings = recipe.servings || 2;
  const ratio = servings / baseServings;

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAddToGrocery = async () => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      error("No ingredients", "This recipe doesn't have ingredients listed.");
      return;
    }

    try {
      setIsAddingGrocery(true);
      await addRecipeIngredientsToGrocery(recipe.title, recipe.ingredients);
      success(
        "Added to Grocery List!",
        `Ingredients for "${recipe.title}" have been added to your shopping list.`
      );
    } catch (err: any) {
      error("Failed to add", err.message || "Could not add ingredients to grocery list.");
    } finally {
      setIsAddingGrocery(false);
    }
  };

  const scaleAmount = (amountStr: string) => {
    if (!amountStr) return "";
    const num = parseFloat(amountStr);
    if (!isNaN(num)) {
      const scaled = num * ratio;
      return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
    }
    return amountStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative h-64 sm:h-72 w-full flex-shrink-0 bg-stone-100">
          <Image
            src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-md focus:outline-none"
            aria-label="Close recipe modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & tags overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/90 backdrop-blur-sm text-white shadow-sm">
                {recipe.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {recipe.cuisine}
              </span>
              {recipe.isCustom && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/90 text-white shadow-sm">
                  ★ Custom Recipe
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium text-stone-700">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{recipe.prepTime} mins</span>
            </div>

            {/* Servings Adjuster */}
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-sm">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-semibold text-stone-700">{servings} servings</span>
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="p-1 rounded-md hover:bg-stone-100 text-stone-600"
                  aria-label="Decrease servings"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setServings((s) => s + 1)}
                  className="p-1 rounded-md hover:bg-stone-100 text-stone-600"
                  aria-label="Increase servings"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Watch Video</span>
              </a>
            )}

            <button
              onClick={handleAddToGrocery}
              disabled={isAddingGrocery}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-brand-600" />
              <span>{isAddingGrocery ? "Adding..." : "Add to Grocery"}</span>
            </button>

            {onAddToPlanner && (
              <button
                onClick={() => {
                  onAddToPlanner(recipe);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Plan Meal</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {recipe.description && (
            <p className="text-sm text-stone-600 italic bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/50 leading-relaxed">
              &ldquo;{recipe.description}&rdquo;
            </p>
          )}

          {/* Ingredients Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-stone-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-600" />
                <span>Ingredients</span>
                <span className="text-xs font-normal text-stone-600">({recipe.ingredients?.length || 0} items)</span>
              </h3>
              <span className="text-xs text-stone-600">Click to check off as you cook</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients?.map((ing, idx) => {
                const isChecked = checkedIngredients[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-emerald-50/80 border-emerald-300/80 text-stone-600 line-through"
                        : "bg-stone-50 hover:bg-white border-stone-200 text-stone-800 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
                    <span className="text-xs font-semibold text-brand-700 ml-2 whitespace-nowrap bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                      {scaleAmount(ing.amount)} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step by step instructions */}
          <div>
            <h3 className="font-display font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-brand-600" />
              <span>Instructions</span>
            </h3>

            <div className="space-y-3">
              {recipe.instructions?.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/70 hover:bg-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {recipe.notes && (
            <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600">
              <strong className="text-stone-800">Chef&apos;s Note:</strong> {recipe.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
