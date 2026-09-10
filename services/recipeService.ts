import { IRecipe, ApiResponse } from "@/types";

export async function fetchCustomRecipes(params?: {
  search?: string;
  category?: string;
  cuisine?: string;
}): Promise<IRecipe[]> {
  try {
    const url = new URL("/api/recipes", window.location.origin);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category && params.category !== "All") url.searchParams.set("category", params.category);
    if (params?.cuisine && params.cuisine !== "All") url.searchParams.set("cuisine", params.cuisine);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data: ApiResponse<IRecipe[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch custom recipes");
    return data.data || [];
  } catch (err) {
    console.error("fetchCustomRecipes error:", err);
    return [];
  }
}

export async function fetchRecipeById(id: string): Promise<IRecipe | null> {
  try {
    const res = await fetch(`/api/recipes/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data: ApiResponse<IRecipe> = await res.json();
    return data.success ? data.data || null : null;
  } catch (err) {
    console.error("fetchRecipeById error:", err);
    return null;
  }
}

export async function createRecipe(recipeData: Partial<IRecipe>): Promise<IRecipe> {
  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipeData),
  });
  const data: ApiResponse<IRecipe> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to create recipe");
  return data.data!;
}

export async function updateRecipe(id: string, recipeData: Partial<IRecipe>): Promise<IRecipe> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipeData),
  });
  const data: ApiResponse<IRecipe> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update recipe");
  return data.data!;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to delete recipe");
  return true;
}
