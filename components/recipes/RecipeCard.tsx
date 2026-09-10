"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Utensils, Calendar, ShoppingCart, Eye, Sparkles } from "lucide-react";
import { IRecipe } from "@/types";
import { addRecipeIngredientsToGrocery } from "@/services/groceryService";
import { useToast } from "@/components/ui/Toast";

interface RecipeCardProps {
  recipe: IRecipe;
  onView?: (recipe: IRecipe) => void;
  onAddToPlanner?: (recipe: IRecipe) => void;
}

export default function RecipeCard({ recipe, onView, onAddToPlanner }: RecipeCardProps) {
  const { success, error } = useToast();
  const [addingGrocery, setAddingGrocery] = useState(false);

  const handleQuickGrocery = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      error("No ingredients", "This recipe does not have listed ingredients.");
      return;
    }

    try {
      setAddingGrocery(true);
      await addRecipeIngredientsToGrocery(recipe.title, recipe.ingredients);
      success("Added to Grocery!", `Ingredients for "${recipe.title}" added to list.`);
    } catch (err: any) {
      error("Error", err.message || "Failed to add ingredients.");
    } finally {
      setAddingGrocery(false);
    }
  };

  const recipeId = recipe._id || recipe.id || "";
  const imageUrl =
    recipe.image ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

  return (
    <div
      onClick={() => (onView ? onView(recipe) : null)}
      className="group relative bg-white/90 rounded-3xl border border-stone-200/80 shadow-soft hover:shadow-soft-lg hover:border-brand-300/80 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md rounded-xl border border-white/20">
            {recipe.category || "Meal"}
          </span>
          {recipe.isCustom && (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-950 bg-amber-300/90 backdrop-blur-md rounded-xl shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-800" />
              <span>Custom</span>
            </span>
          )}
        </div>

        {/* Bottom image overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="px-2 py-0.5 rounded-lg bg-black/30 backdrop-blur-sm">
            {recipe.cuisine || "International"}
          </span>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-lg">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{recipe.prepTime || 20}m</span>
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-display font-bold text-base text-stone-900 line-clamp-1 group-hover:text-brand-700 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
            {recipe.description || "Fresh, flavorful, and balanced recipe ready for your table."}
          </p>
        </div>

        {/* Ingredients Count and Meta */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-brand-600" />
            <span>{recipe.ingredients?.length || 0} ingredients</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onAddToPlanner && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPlanner(recipe);
                }}
                title="Add to Weekly Meal Plan"
                className="p-1.5 rounded-xl text-stone-600 hover:text-brand-700 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickGrocery}
              disabled={addingGrocery}
              title="Add ingredients to Grocery List"
              className="p-1.5 rounded-xl text-stone-600 hover:text-brand-700 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all disabled:opacity-50"
            >
              <ShoppingCart className={`w-4 h-4 ${addingGrocery ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(recipe);
              }}
              title="View full recipe details"
              className="p-1.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
