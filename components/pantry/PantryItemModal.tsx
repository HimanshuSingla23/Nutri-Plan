"use client";

import React, { useState, useEffect } from "react";
import { X, PackageCheck, Sparkles, Calendar, Tag } from "lucide-react";
import { IPantryItem } from "@/types";
import { addPantryItem, updatePantryItem } from "@/services/pantryService";
import { categorizeIngredient } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface PantryItemModalProps {
  isOpen: boolean;
  itemToEdit?: IPantryItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PANTRY_CATEGORIES = [
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

const UNIT_OPTIONS = ["piece", "pieces", "g", "kg", "ml", "liter", "cup", "tbsp", "tsp", "pack", "box", "can", "bunch"];

export default function PantryItemModal({
  isOpen,
  itemToEdit,
  onClose,
  onSuccess,
}: PantryItemModalProps) {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("pieces");
  const [category, setCategory] = useState("Produce");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || "");
      setQuantity(itemToEdit.quantity || 1);
      setUnit(itemToEdit.unit || "pieces");
      setCategory(itemToEdit.category || "Produce");
      if (itemToEdit.expirationDate) {
        const d = new Date(itemToEdit.expirationDate);
        setExpirationDate(!isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "");
      } else {
        setExpirationDate("");
      }
      setNotes(itemToEdit.notes || "");
    } else {
      setName("");
      setQuantity(1);
      setUnit("pieces");
      setCategory("Produce");
      // Default expiration date: 7 days from now
      const defaultExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setExpirationDate(defaultExp);
      setNotes("");
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto detect category if adding new item
    if (!itemToEdit && val.trim().length > 2) {
      const suggested = categorizeIngredient(val);
      if (suggested && PANTRY_CATEGORIES.includes(suggested)) {
        setCategory(suggested);
      }
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
      const payload: Partial<IPantryItem> = {
        name: name.trim(),
        quantity: Number(quantity),
        unit: unit.trim() || "piece",
        category,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        notes: notes.trim(),
      };

      if (itemToEdit?._id) {
        await updatePantryItem(itemToEdit._id, payload);
        success("Pantry Updated!", `Updated "${name}" in your pantry.`);
      } else {
        await addPantryItem(payload);
        success("Item Added!", `Added "${name}" to your pantry.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error("Error saving item", err.message || "Failed to update pantry.");
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
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-200" />
            <h2 className="font-display font-bold text-base text-white">
              {itemToEdit ? "Edit Pantry Item" : "Add to Pantry"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Greek Yogurt, Eggs, Spinach..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none text-center font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:border-brand-500 outline-none"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:border-brand-500 outline-none"
            >
              {PANTRY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Expiration Date</span>
              </label>
              <span className="text-[11px] text-stone-600">Helps reduce food waste</span>
            </div>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Notes / Location</label>
            <input
              type="text"
              placeholder="e.g. Top fridge shelf, opened on Monday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-brand-500 outline-none text-xs"
            />
          </div>

          {/* Footer Submit */}
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
              {submitting ? "Saving..." : itemToEdit ? "Update Item" : "Add to Pantry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
