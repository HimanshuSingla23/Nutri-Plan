import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import Recipe from "@/models/Recipe";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    if (!mongoose.models.Recipe) {
      const _ = Recipe;
    }
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const mealPlan = await MealPlan.findById(id).populate("recipeId");
    if (!mealPlan) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mealPlan });
  } catch (error: any) {
    console.error(`GET /api/meal-plan/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await MealPlan.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("recipeId");

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Meal plan updated!",
      data: updated,
    });
  } catch (error: any) {
    console.error(`PUT /api/meal-plan/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update meal plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deleted = await MealPlan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Meal removed from planner!",
    });
  } catch (error: any) {
    console.error(`DELETE /api/meal-plan/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}
