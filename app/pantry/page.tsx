"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PackageCheck,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Sparkles,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { IPantryItem, ExpirationStatus } from "@/types";
import {
  fetchPantryItems,
  adjustPantryQuantity,
  deletePantryItem,
} from "@/services/pantryService";
import { getExpirationStatus, formatRelativeDays } from "@/lib/utils";
import PantryItemModal from "@/components/pantry/PantryItemModal";
import QuickSeedButton from "@/components/QuickSeedButton";
import { useToast } from "@/components/ui/Toast";


const CATEGORIES = [
  "All",
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

export default function PantryPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<IPantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "expiring_soon" | "expired" | "fresh">("all");
  const [sortBy, setSortBy] = useState("expirationDate");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPantryItem | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPantryItems({
        search: searchQuery,
        category: selectedCategory,
        sortBy,
      });
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from pantry?`)) return;
    try {
      await deletePantryItem(id);
      success("Item Removed", `"${name}" removed from pantry.`);
      loadItems();
    } catch (err: any) {
      error("Delete error", err.message || "Failed to remove item.");
    }
  };

  const handleAdjustQty = async (item: IPantryItem, delta: number) => {
    if (!item._id) return;
    try {
      await adjustPantryQuantity(item._id, item.quantity, delta);
      loadItems();
    } catch (err: any) {
      error("Error", err.message);
    }
  };

  // Filter items client-side by expiration status
  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true;
    if (!item.expirationDate) return statusFilter === "fresh";
    const stat = getExpirationStatus(item.expirationDate);
    return stat.status === statusFilter;
  });

  const expiredCount = items.filter(
    (i) => i.expirationDate && getExpirationStatus(i.expirationDate).status === "expired"
  ).length;

  const expiringSoonCount = items.filter(
    (i) => i.expirationDate && getExpirationStatus(i.expirationDate).status === "expiring_soon"
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-brand-600 text-white shadow-soft">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 tracking-tight">
              Pantry Inventory & Zero Waste
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Keep track of stock, monitor shelf lives, and get expiration warnings before food spoils.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pantry Item</span>
          </button>
          <QuickSeedButton onSuccess={loadItems} variant="compact" />
        </div>
      </div>

      {/* Expiration Alert Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-stone-900 text-white border-stone-900 shadow-soft"
              : "bg-white border-stone-200 hover:bg-stone-50 text-stone-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Total Stock</span>
            <PackageCheck className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-display font-bold mt-1">{items.length} items</p>
        </div>

        <div
          onClick={() => setStatusFilter("expiring_soon")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "expiring_soon"
              ? "bg-amber-600 text-white border-amber-600 shadow-soft"
              : "bg-amber-50/80 border-amber-200/80 hover:bg-amber-100 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Expiring Soon (&le; 3 days)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-bold mt-1">{expiringSoonCount} items</p>
        </div>

        <div
          onClick={() => setStatusFilter("expired")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "expired"
              ? "bg-rose-700 text-white border-rose-700 shadow-soft"
              : "bg-rose-50/80 border-rose-200/80 hover:bg-rose-100 text-rose-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Expired Stock</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-display font-bold mt-1">{expiredCount} items</p>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white/95 rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search pantry items by name, category, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-300 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-700 outline-none"
            >
              <option value="expirationDate">Sort by: Expiration Date</option>
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="quantity">Sort by: Quantity</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-soft"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Inventory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white/60 rounded-3xl border border-dashed border-stone-300">
          <PackageCheck className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          <h3 className="font-display font-bold text-lg text-stone-800">
            No pantry items match your criteria
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Try resetting your search query or add new items to your pantry stock.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-soft"
          >
            + Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const exp = getExpirationStatus(item.expirationDate);

            return (
              <div
                key={item._id || item.id}
                className="bg-white/95 rounded-3xl border border-stone-200/80 p-5 shadow-soft hover:shadow-soft-lg hover:border-brand-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                        {item.category}
                      </span>
                      <h3 className="font-display font-bold text-base text-stone-900 mt-1.5 leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    {/* Expiration status badge */}
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                        exp.status === "expired"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : exp.status === "expiring_soon"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {exp.status === "expired" && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {exp.status === "expiring_soon" && <Clock className="w-3 h-3 text-amber-600" />}
                      {exp.status === "fresh" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span>{exp.label}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2 rounded-xl italic">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bottom row: Quantity controls and action buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
                    <button
                      onClick={() => handleAdjustQty(item, -1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-stone-800 min-w-[3rem] text-center">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(item, 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-brand-600 hover:bg-stone-100 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => item._id && handleDelete(item._id, item.name)}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete from Pantry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <PantryItemModal
        isOpen={isModalOpen}
        itemToEdit={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={loadItems}
      />
    </div>
  );
}
