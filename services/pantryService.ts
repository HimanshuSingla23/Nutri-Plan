import { IPantryItem, ApiResponse } from "@/types";

export async function fetchPantryItems(params?: {
  search?: string;
  category?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}): Promise<IPantryItem[]> {
  try {
    const url = new URL("/api/pantry", window.location.origin);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category && params.category !== "All") url.searchParams.set("category", params.category);
    if (params?.sortBy) url.searchParams.set("sortBy", params.sortBy);
    if (params?.order) url.searchParams.set("order", params.order);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data: ApiResponse<IPantryItem[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch pantry items");
    return data.data || [];
  } catch (err) {
    console.error("fetchPantryItems error:", err);
    return [];
  }
}

export async function addPantryItem(itemData: Partial<IPantryItem>): Promise<IPantryItem> {
  const res = await fetch("/api/pantry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });
  const data: ApiResponse<IPantryItem> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to add pantry item");
  return data.data!;
}

export async function updatePantryItem(id: string, updateData: Partial<IPantryItem>): Promise<IPantryItem> {
  const res = await fetch(`/api/pantry/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  const data: ApiResponse<IPantryItem> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update pantry item");
  return data.data!;
}

export async function adjustPantryQuantity(id: string, currentQty: number, delta: number): Promise<IPantryItem> {
  const newQty = Math.max(0, currentQty + delta);
  return updatePantryItem(id, { quantity: newQty });
}

export async function deletePantryItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/pantry/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to delete pantry item");
  return true;
}
