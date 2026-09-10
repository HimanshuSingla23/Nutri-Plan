"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  PackageCheck,
  Calendar,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { IGroceryItem } from "@/types";
import {
  fetchGroceryList,
  toggleGroceryPurchased,
  deleteGroceryItem,
  clearCompletedGrocery,
} from "@/services/groceryService";
import AddGroceryModal from "@/components/grocery/AddGroceryModal";
import QuickSeedButton from "@/components/QuickSeedButton";
import { useToast } from "@/components/ui/Toast";


export default function GroceryPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<IGroceryItem[]>([]);
  const [plannerMealCount, setPlannerMealCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadGrocery = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGroceryList();
      setItems(data.items);
      setPlannerMealCount(data.plannerMealCount);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrocery();
  }, [loadGrocery]);

  const handleToggle = async (item: IGroceryItem) => {
    try {
      const willBePurchased = !item.isPurchased;
      await toggleGroceryPurchased(item);

      // Check if all items are purchased for celebration confetti
      const nextPurchasedCount =
        items.filter((i) => i.isPurchased).length + (willBePurchased ? 1 : -1);

      if (nextPurchasedCount === items.length && items.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        success("All Items Checked Off!", "Your grocery shopping is 100% complete! 🎉");
      }

      loadGrocery();
    } catch (err: any) {
      error("Update error", err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteGroceryItem(id);
      success("Removed", `"${name}" removed from shopping list.`);
      loadGrocery();
    } catch (err: any) {
      error("Delete error", err.message);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await clearCompletedGrocery();
      success("Cleaned Up!", "All completed grocery items cleared.");
      loadGrocery();
    } catch (err: any) {
      error("Error", err.message);
    }
  };

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category || "Other")));

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const progressPercent = items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-soft">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
              Smart Grocery Shopping List
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Auto-aggregated from your weekly meal plan and cross-referenced with your pantry stock.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span>Print Checklist</span>
          </button>

          {purchasedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Completed ({purchasedCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Item</span>
          </button>

          <QuickSeedButton onSuccess={loadGrocery} variant="compact" />
        </div>
      </div>

      {/* Progress & Planner Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-soft md:col-span-2 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Shopping Progress</span>
            <span className="font-bold text-brand-700">
              {purchasedCount} of {items.length} items purchased ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-brand-600" />
            <div>
              <p className="text-xs font-bold text-brand-950">Planner Synchronized</p>
              <p className="text-[11px] text-brand-700">{plannerMealCount} meals scheduled</p>
            </div>
          </div>
          <Link
            href="/planner"
            className="text-xs font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2"
          >
            Edit Meals
          </Link>
        </div>
      </div>

      {/* Grouped Grocery List by Department */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white/60 rounded-3xl border border-dashed border-stone-300">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          <h3 className="font-display font-bold text-lg text-stone-800">Your grocery list is empty</h3>
          <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
            Schedule meals in the Weekly Planner to auto-populate ingredients, or add manual shopping items.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/planner"
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-soft"
            >
              Go to Weekly Planner
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
            >
              + Add Custom Item
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((i) => (i.category || "Other") === category);

            return (
              <div
                key={category}
                className="bg-white/95 rounded-3xl border border-stone-200 p-5 shadow-soft space-y-3"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-600" />
                    <h3 className="font-display font-bold text-base text-stone-900">{category}</h3>
                    <span className="text-xs text-stone-600 font-medium">
                      ({categoryItems.length} items)
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categoryItems.map((item) => {
                    const hasPantryStock =
                      item.inPantryQuantity !== undefined && item.inPantryQuantity > 0;

                    return (
                      <div
                        key={item._id || item.id}
                        onClick={() => handleToggle(item)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          item.isPurchased
                            ? "bg-stone-50 border-stone-200 text-stone-600 line-through opacity-70"
                            : "bg-stone-50/70 hover:bg-white border-stone-200/80 text-stone-900 shadow-sm hover:border-brand-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                              item.isPurchased
                                ? "bg-brand-600 border-brand-600 text-white"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {item.isPurchased && <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">
                              {item.name}
                            </p>

                            {/* Source & Pantry Note */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-stone-600">
                              {hasPantryStock && (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                                  Pantry: {item.inPantryQuantity} {item.inPantryUnit}
                                </span>
                              )}
                              {item.sourceMeals && item.sourceMeals.length > 0 && (
                                <span className="truncate max-w-[180px]" title={item.sourceMeals.join(", ")}>
                                  {item.sourceMeals[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <span className="text-xs font-bold text-brand-700 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-sm">
                            {item.amount} {item.unit}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item._id) handleDelete(item._id, item.name);
                            }}
                            className="p-1 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors no-print"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AddGroceryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadGrocery}
      />
    </div>
  );
}
