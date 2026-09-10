import { IRecipe, RecipeIngredient, MealDBCategory, MealDBArea, MealDBSummary } from "@/types";
import { parseAmountAndUnit } from "./utils";

const THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/**
 * Cleanly transforms raw TheMealDB object into our standardized IRecipe interface
 */
export function normalizeTheMealDBRecipe(meal: any): IRecipe {
  const ingredients: RecipeIngredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredientName = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredientName && ingredientName.trim()) {
      const cleanName = ingredientName.trim();
      const { amount, unit } = parseAmountAndUnit(measure || "1 piece");

      ingredients.push({
        name: cleanName,
        amount: amount || "1",
        unit: unit || "piece",
      });
    }
  }

  // Parse instructions into individual readable steps
  const rawInstructions = meal.strInstructions || "";
  const instructionSteps = rawInstructions
    .split(/\r?\n+/)
    .map((step: string) => step.replace(/^STEP\s*\d+[:.]?\s*/i, "").replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((step: string) => step.length > 5);

  // Fallback if instruction string was a single dense paragraph
  const finalInstructions = instructionSteps.length > 0
    ? instructionSteps
    : rawInstructions.split(".").map((s: string) => s.trim()).filter((s: string) => s.length > 8);

  // Estimate realistic prep time based on ingredient/step count
  const estimatedTime = Math.min(
    60,
    Math.max(15, (ingredients.length * 2) + (finalInstructions.length * 3))
  );

  return {
    id: meal.idMeal,
    _id: meal.idMeal,
    title: meal.strMeal || "Untitled Recipe",
    category: meal.strCategory || "Main Course",
    cuisine: meal.strArea || "International",
    description: meal.strTags ? `Tags: ${meal.strTags.split(",").join(", ")}` : `Delicious ${meal.strArea || ""} ${meal.strCategory || ""} dish.`,
    image: meal.strMealThumb || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    instructions: finalInstructions.length > 0 ? finalInstructions : ["Follow traditional preparation instructions."],
    ingredients,
    prepTime: estimatedTime,
    servings: 4,
    isCustom: false,
    videoUrl: meal.strYoutube || "",
    notes: meal.strSource ? `Source: ${meal.strSource}` : undefined,
  };
}

/**
 * Search meals by name / keyword
 */
export async function searchMealsByName(name: string): Promise<IRecipe[]> {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      // Default to common search term if empty query
      return await searchMealsByName("chicken");
    }
    const res = await fetch(`${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(trimmed)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch meals from TheMealDB");
    const data = await res.json();
    if (!data.meals) return [];
    return data.meals.map(normalizeTheMealDBRecipe);
  } catch (error) {
    console.error("TheMealDB search error:", error);
    return [];
  }
}

/**
 * Search meals by main ingredient
 */
export async function searchMealsByIngredient(ingredient: string): Promise<IRecipe[]> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient.trim())}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to filter meals by ingredient");
    const data = await res.json();
    if (!data.meals) return [];
    
    // The filter endpoint returns summary meals (idMeal, strMeal, strMealThumb).
    // Map them to IRecipe objects
    return data.meals.map((m: any) => ({
      id: m.idMeal,
      _id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb,
      category: "General",
      cuisine: "International",
      instructions: ["View full recipe for step-by-step instructions."],
      ingredients: [{ name: ingredient, amount: "1", unit: "portion" }],
      prepTime: 25,
      isCustom: false,
    }));
  } catch (error) {
    console.error("TheMealDB ingredient search error:", error);
    return [];
  }
}

/**
 * Filter meals by category (e.g. Seafood, Beef, Vegetarian, Pasta, etc.)
 */
export async function filterMealsByCategory(category: string): Promise<IRecipe[]> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(category.trim())}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to filter meals by category");
    const data = await res.json();
    if (!data.meals) return [];

    return data.meals.map((m: any) => ({
      id: m.idMeal,
      _id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb,
      category: category,
      cuisine: "Various",
      instructions: ["View full recipe for step-by-step instructions."],
      ingredients: [],
      prepTime: 30,
      isCustom: false,
    }));
  } catch (error) {
    console.error("TheMealDB category filter error:", error);
    return [];
  }
}

/**
 * Filter meals by cuisine / area (e.g. Italian, Indian, Mexican, Japanese, etc.)
 */
export async function filterMealsByCuisine(area: string): Promise<IRecipe[]> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(area.trim())}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to filter meals by area");
    const data = await res.json();
    if (!data.meals) return [];

    return data.meals.map((m: any) => ({
      id: m.idMeal,
      _id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb,
      category: "Various",
      cuisine: area,
      instructions: ["View full recipe for step-by-step instructions."],
      ingredients: [],
      prepTime: 30,
      isCustom: false,
    }));
  } catch (error) {
    console.error("TheMealDB area filter error:", error);
    return [];
  }
}

/**
 * Get detailed meal by ID from TheMealDB
 */
export async function getMealById(id: string): Promise<IRecipe | null> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to lookup meal by ID");
    const data = await res.json();
    if (!data.meals || data.meals.length === 0) return null;
    return normalizeTheMealDBRecipe(data.meals[0]);
  } catch (error) {
    console.error("TheMealDB lookup error:", error);
    return null;
  }
}

/**
 * Get all available recipe categories
 */
export async function getCategories(): Promise<MealDBCategory[]> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/categories.php`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("TheMealDB categories error:", error);
    return [
      { idCategory: "1", strCategory: "Beef", strCategoryThumb: "", strCategoryDescription: "" },
      { idCategory: "2", strCategory: "Chicken", strCategoryThumb: "", strCategoryDescription: "" },
      { idCategory: "3", strCategory: "Dessert", strCategoryThumb: "", strCategoryDescription: "" },
      { idCategory: "4", strCategory: "Pasta", strCategoryThumb: "", strCategoryDescription: "" },
      { idCategory: "5", strCategory: "Seafood", strCategoryThumb: "", strCategoryDescription: "" },
      { idCategory: "6", strCategory: "Vegetarian", strCategoryThumb: "", strCategoryDescription: "" },
    ];
  }
}

/**
 * Get all available cuisine areas
 */
export async function getAreas(): Promise<string[]> {
  try {
    const res = await fetch(`${THEMEALDB_BASE_URL}/list.php?a=list`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch areas");
    const data = await res.json();
    if (!data.meals) return [];
    return data.meals.map((item: MealDBArea) => item.strArea).filter(Boolean);
  } catch (error) {
    console.error("TheMealDB areas error:", error);
    return ["American", "British", "Chinese", "French", "Indian", "Italian", "Japanese", "Mexican", "Mediterranean"];
  }
}

/**
 * Get popular/featured recipes for home page inspiration
 */
export async function getFeaturedMeals(): Promise<IRecipe[]> {
  try {
    // Fetch a curated list of delicious popular meal searches
    const [curry, pasta, salad, salmon] = await Promise.all([
      searchMealsByName("Curry"),
      searchMealsByName("Pasta"),
      searchMealsByName("Salad"),
      searchMealsByName("Salmon"),
    ]);

    const combined = [
      ...(curry.slice(0, 2)),
      ...(pasta.slice(0, 2)),
      ...(salmon.slice(0, 2)),
      ...(salad.slice(0, 2)),
    ];

    return combined.slice(0, 8);
  } catch (error) {
    console.error("Error fetching featured meals:", error);
    return [];
  }
}
