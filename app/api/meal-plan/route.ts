import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import Recipe from "@/models/Recipe";

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const VALID_MEALS = ["breakfast", "lunch", "dinner"];

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    // Ensure Recipe model is registered with mongoose before populate
    if (!mongoose.models.Recipe) {
      // trigger import
      const _ = Recipe;
    }

    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");

    const query: any = {};
    if (day && VALID_DAYS.includes(day)) {
      query.dayOfWeek = day;
    }

    const mealPlans = await MealPlan.find(query)
      .populate("recipeId")
      .sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      count: mealPlans.length,
      data: mealPlans,
    });
  } catch (error: any) {
    console.error("GET /api/meal-plan error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { dayOfWeek, mealType, recipeId, externalMeal, notes } = body;

    // Validation
    if (!dayOfWeek || !VALID_DAYS.includes(dayOfWeek)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid day of week. Must be one of: ${VALID_DAYS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!mealType || !VALID_MEALS.includes(mealType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid meal type. Must be one of: ${VALID_MEALS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!recipeId && !externalMeal) {
      return NextResponse.json(
        {
          success: false,
          error: "Either recipeId or externalMeal data is required to schedule a meal.",
        },
        { status: 400 }
      );
    }

    let validRecipeObjectId = undefined;
    if (recipeId && mongoose.Types.ObjectId.isValid(recipeId)) {
      validRecipeObjectId = new mongoose.Types.ObjectId(recipeId);
    }

    // Upsert meal plan slot (replace or create for the day + mealType)
    const updatedPlan = await MealPlan.findOneAndUpdate(
      { dayOfWeek, mealType },
      {
        dayOfWeek,
        mealType,
        recipeId: validRecipeObjectId,
        externalMeal: externalMeal || undefined,
        notes: notes || "",
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("recipeId");

    return NextResponse.json(
      {
        success: true,
        message: `Saved ${mealType} for ${dayOfWeek}!`,
        data: updatedPlan,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/meal-plan error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save meal plan" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    await MealPlan.deleteMany({});
    return NextResponse.json({
      success: true,
      message: "Weekly meal plan cleared successfully!",
    });
  } catch (error: any) {
    console.error("DELETE /api/meal-plan error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to clear meal plans" },
      { status: 500 }
    );
  }
}
