"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, ChefHat, Sparkles, Image as ImageIcon } from "lucide-react";
import { RecipeIngredient, IRecipe } from "@/types";
import { createRecipe } from "@/services/recipeService";
import { useToast } from "@/components/ui/Toast";

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newRecipe: IRecipe) => void;
}

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

export default function RecipeFormModal({
  isOpen,
  onClose,
  onSuccess,
}: RecipeFormModalProps) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Vegetarian");
  const [cuisine, setCuisine] = useState("Italian");
  const [prepTime, setPrepTime] = useState(25);
  const [servings, setServings] = useState(2);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: "", amount: "1", unit: "cup" },
    { name: "", amount: "1", unit: "tbsp" },
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    "Prepare and chop all fresh ingredients.",
    "Cook in skillet over medium heat until golden and fragrant.",
  ]);

  if (!isOpen) return null;

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
      error("Missing Title", "Please enter a recipe title.");
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
      error("Missing Instructions", "Please add at least one instruction step.");
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
        description: description.trim(),
        ingredients: validIngredients,
        instructions: validInstructions,
        notes: notes.trim(),
        isCustom: true,
      });

      success("Recipe Created!", `"${created.title}" has been saved to your recipes.`);
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err: any) {
      error("Save Error", err.message || "Could not save custom recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-brand-200" />
            <h2 className="font-display font-bold text-lg text-white">
              Create Custom Recipe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* Title */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Recipe Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grandma's Spiced Tomato Soup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>

          {/* Category & Cuisine & Times */}
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
              <label className="block font-semibold text-stone-700 mb-1.5">Cuisine / Origin</label>
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
              <label className="block font-semibold text-stone-700 mb-1.5">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Servings</label>
              <input
                type="number"
                min="1"
                max="50"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Image URL & Description */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Image URL (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Short Description / Summary
            </label>
            <textarea
              rows={2}
              placeholder="What makes this dish special?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none resize-none"
            />
          </div>

          {/* Dynamic Ingredients */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-900">
                Ingredients <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
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
                    placeholder="Ingredient (e.g. Tomatoes)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, "name", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amt (e.g. 2)"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, "amount", e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:border-brand-500 outline-none text-center"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g. pcs, cup)"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, "unit", e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:border-brand-500 outline-none text-center"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1.5 text-stone-600 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Instructions */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-stone-900">
                Instruction Steps <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  <textarea
                    rows={2}
                    placeholder={`Step ${idx + 1} instructions...`}
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:border-brand-500 outline-none resize-none"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(idx)}
                      className="p-1.5 text-stone-600 hover:text-rose-500 rounded-lg hover:bg-rose-50 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Saving Recipe..." : "Save Recipe"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
