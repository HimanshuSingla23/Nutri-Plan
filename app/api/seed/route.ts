import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import PantryItem from "@/models/PantryItem";
import MealPlan from "@/models/MealPlan";
import { SAMPLE_RECIPES, SAMPLE_PANTRY } from "@/lib/sampleData";

export async function POST() {
  try {
    await connectToDatabase();

    // Clear existing data for fresh seed if requested
    await Recipe.deleteMany({ isCustom: true });
    await PantryItem.deleteMany({});
    await MealPlan.deleteMany({});

    // 1. Insert 5 Custom Recipes
    const createdRecipes = await Recipe.insertMany(SAMPLE_RECIPES);

    // 2. Insert Sample Pantry Items
    const createdPantry = await PantryItem.insertMany(SAMPLE_PANTRY);

    // 3. Create initial weekly meal plan items connecting Recipe to MealPlan
    const paneerRecipe = createdRecipes.find((r) => r.title && r.title.includes("Paneer"));
    const pastaRecipe = createdRecipes.find((r) => r.title && r.title.includes("Pasta"));
    const oatsRecipe = createdRecipes.find((r) => r.title && r.title.includes("Oats"));

    const samplePlans = [];
    if (oatsRecipe) {
      samplePlans.push({
        dayOfWeek: "Monday",
        mealType: "breakfast",
        recipeId: oatsRecipe._id,
        notes: "Prepare mason jar the night before",
      });
    }
    if (paneerRecipe) {
      samplePlans.push({
        dayOfWeek: "Monday",
        mealType: "dinner",
        recipeId: paneerRecipe._id,
        notes: "Serve with warm basmati rice and fresh cilantro",
      });
    }
    if (pastaRecipe) {
      samplePlans.push({
        dayOfWeek: "Wednesday",
        mealType: "lunch",
        recipeId: pastaRecipe._id,
        notes: "Garnish with fresh parmesan",
      });
    }

    if (samplePlans.length > 0) {
      await MealPlan.insertMany(samplePlans);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with custom recipes, pantry inventory, and sample meal plan!",
      data: {
        recipesCount: createdRecipes.length,
        pantryCount: createdPantry.length,
        mealPlanCount: samplePlans.length,
      },
    });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
