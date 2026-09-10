import { IGroceryItem, ApiResponse } from "@/types";

export async function fetchGroceryList(): Promise<{
  items: IGroceryItem[];
  plannerMealCount: number;
}> {
  try {
    const res = await fetch("/api/grocery", { cache: "no-store" });
    const data: ApiResponse<IGroceryItem[]> & { plannerMealCount?: number } = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch grocery list");
    return {
      items: data.data || [],
      plannerMealCount: data.plannerMealCount || 0,
    };
  } catch (err) {
    console.error("fetchGroceryList error:", err);
    return { items: [], plannerMealCount: 0 };
  }
}

export async function addGroceryItem(itemData: Partial<IGroceryItem>): Promise<IGroceryItem> {
  const res = await fetch("/api/grocery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemData),
  });
  const data: ApiResponse<IGroceryItem> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to add grocery item");
  return data.data!;
}

export async function addRecipeIngredientsToGrocery(
  recipeTitle: string,
  ingredients: { name: string; amount: string; unit: string }[]
): Promise<IGroceryItem[]> {
  const items = ingredients.map((ing) => ({
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    source: "recipe" as const,
    sourceMeals: [recipeTitle],
  }));

  const res = await fetch("/api/grocery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data: ApiResponse<IGroceryItem[]> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to add ingredients to grocery list");
  return data.data || [];
}

export async function toggleGroceryPurchased(item: IGroceryItem): Promise<boolean> {
  const res = await fetch(`/api/grocery/${item._id || item.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...item,
      isPurchased: !item.isPurchased,
    }),
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update item");
  return true;
}

export async function deleteGroceryItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/grocery/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to delete item");
  return true;
}

export async function clearCompletedGrocery(): Promise<boolean> {
  const res = await fetch("/api/grocery?completedOnly=true", {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to clear completed items");
  return true;
}
