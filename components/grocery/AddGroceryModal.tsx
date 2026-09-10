"use client";

import React, { useState } from "react";
import { X, ShoppingCart, Plus } from "lucide-react";
import { addGroceryItem } from "@/services/groceryService";
import { categorizeIngredient } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface AddGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat & Protein",
  "Pantry Staples",
  "Spices & Seasonings",
  "Bakery",
  "Beverages",
  "Frozen",
  "Other",
];

export default function AddGroceryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddGroceryModalProps) {
  const { success, error } = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState("piece");
  const [category, setCategory] = useState("Produce");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length > 2) {
      const suggested = categorizeIngredient(val);
      if (suggested) setCategory(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error("Name required", "Please enter an item name.");
      return;
    }

    try {
      setSubmitting(true);
      await addGroceryItem({
        name: name.trim(),
        amount: amount.trim() || "1",
        unit: unit.trim() || "piece",
        category,
        source: "custom",
      });

      success("Item Added!", `"${name}" added to your grocery list.`);
      setName("");
      setAmount("1");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error("Error", err.message || "Failed to add grocery item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-200" />
            <h2 className="font-display font-bold text-base text-white">
              Add Custom Grocery Item
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Olive Oil, Sourdough Bread..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2, 500"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none text-center font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. bottle, g, pcs"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Department / Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:border-brand-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-soft hover:shadow-soft-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
