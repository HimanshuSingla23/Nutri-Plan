"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Utensils,
  Clock,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { RecipeIngredient } from "@/types";
import { createRecipe } from "@/services/recipeService";
import { useToast } from "@/components/ui/Toast";

const CATEGORY_OPTIONS = [
  "Breakfast",
  "Vegetarian",
  "Pasta",
  "Chicken",
  "Beef",
  "Seafood",
  "Dessert",
  "Salad",
  "Soup",
  "Snack",
  "Main Course",
  "Other",
];

const CUISINE_OPTIONS = [
  "American",
  "British",
  "Chinese",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Mediterranean",
  "Thai",
  "International",
];

export default function NewRecipePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vegetarian");
  const [cuisine, setCuisine] = useState("Italian");
  const [prepTime, setPrepTime] = useState(25);
  const [servings, setServings] = useState(2);
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: "", amount: "1", unit: "cup" },
    { name: "", amount: "1", unit: "tbsp" },
    { name: "", amount: "1", unit: "pinch" },
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    "Prep all fresh vegetables and measure dry ingredients.",
    "Cook on medium heat until fragrant and thoroughly prepared.",
    "Garnish and serve warm.",
  ]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "1", unit: "piece" }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (
    idx: number,
    field: keyof RecipeIngredient,
    value: string
  ) => {
    const next = [...ingredients];
    next[idx] = { ...next[idx], [field]: value };
    setIngredients(next);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (idx: number) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleInstructionChange = (idx: number, value: string) => {
    const next = [...instructions];
    next[idx] = value;
    setInstructions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error("Missing Title", "Please provide a recipe title.");
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim().length > 0 && ing.amount.trim().length > 0
    );
    if (validIngredients.length === 0) {
      error("Missing Ingredients", "Please add at least one valid ingredient.");
      return;
    }

    const validInstructions = instructions
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (validInstructions.length === 0) {
      error("Missing Instructions", "Please provide step-by-step instructions.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await createRecipe({
        title: title.trim(),
        category,
        cuisine,
        prepTime: Number(prepTime),
        servings: Number(servings),
        image:
          image.trim() ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        videoUrl: videoUrl.trim() || undefined,
        description: description.trim(),
        ingredients: validIngredients,
        instructions: validInstructions,
        notes: notes.trim(),
        isCustom: true,
      });

      success("Recipe Saved!", `"${created.title}" added to your custom cookbook.`);
      router.push("/recipes");
    } catch (err: any) {
      error("Save Error", err.message || "Failed to create recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recipes</span>
      </Link>

      <div className="bg-white/95 rounded-3xl border border-stone-200 shadow-soft overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Create Custom Recipe
              </h1>
              <p className="text-xs sm:text-sm text-brand-100 mt-0.5">
                Add your family favorites, nutritional meal-preps, or secret house specials.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-sm">
          {/* Title */}
          <div>
            <label className="block font-semibold text-stone-900 mb-1.5">
              Recipe Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lemon Herb Roasted Chicken & Asparagus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Grid Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-brand-500 outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Cuisine</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-brand-500 outline-none"
              >
                {CUISINE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Preparation Time (minutes)</span>
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Servings Count</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none font-semibold"
              />
            </div>
          </div>

          {/* Media & Details */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Image URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              YouTube / Video URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Description / Flavor Notes
            </label>
            <textarea
              rows={2}
              placeholder="Crisp, comforting, and packed with aromatic garden herbs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-brand-500 outline-none resize-none"
            />
          </div>

          {/* Dynamic Ingredients */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-stone-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-600" />
                <span>Ingredients List</span>
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient name (e.g. Greek Yogurt)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-sm focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. 200)"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl border border-stone-300 text-sm focus:border-brand-500 outline-none text-center"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. g, cup)"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl border border-stone-300 text-sm focus:border-brand-500 outline-none text-center"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-2 text-stone-600 hover:text-rose-500 rounded-xl hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Instructions */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-stone-900 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-brand-600" />
                <span>Instruction Steps</span>
              </label>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700 flex-shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    placeholder={`Step ${idx + 1} instructions...`}
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:border-brand-500 outline-none resize-none"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="p-2 text-stone-600 hover:text-rose-500 rounded-xl hover:bg-rose-50 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Chef&apos;s Notes &amp; Serving Tips
            </label>
            <input
              type="text"
              placeholder="e.g. Best served immediately with extra virgin olive oil and crusty bread."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-end gap-3">
            <Link
              href="/recipes"
              className="px-5 py-2.5 text-stone-600 hover:text-stone-800 font-semibold text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-soft hover:shadow-soft-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Saving Recipe..." : "Save Recipe to Cookbook"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
