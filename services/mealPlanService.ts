import { IMealPlan, ApiResponse, DayOfWeek, MealType } from "@/types";

export async function fetchMealPlans(day?: string): Promise<IMealPlan[]> {
  try {
    const url = new URL("/api/meal-plan", window.location.origin);
    if (day) url.searchParams.set("day", day);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data: ApiResponse<IMealPlan[]> = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch meal plans");
    return data.data || [];
  } catch (err) {
    console.error("fetchMealPlans error:", err);
    return [];
  }
}

export async function saveMealPlanSlot(slotData: {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId?: string;
  externalMeal?: any;
  notes?: string;
}): Promise<IMealPlan> {
  const res = await fetch("/api/meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slotData),
  });
  const data: ApiResponse<IMealPlan> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to save meal plan slot");
  return data.data!;
}

export async function updateMealPlanSlot(id: string, updateData: Partial<IMealPlan>): Promise<IMealPlan> {
  const res = await fetch(`/api/meal-plan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  const data: ApiResponse<IMealPlan> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to update meal plan slot");
  return data.data!;
}

export async function deleteMealPlanSlot(id: string): Promise<boolean> {
  const res = await fetch(`/api/meal-plan/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to delete meal plan slot");
  return true;
}

export async function clearWeeklyMealPlan(): Promise<boolean> {
  const res = await fetch("/api/meal-plan", {
    method: "DELETE",
  });
  const data: ApiResponse = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to clear meal plan");
  return true;
}
