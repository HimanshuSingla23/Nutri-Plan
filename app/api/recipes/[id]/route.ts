import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipe ID format" },
        { status: 400 }
      );
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recipe,
    });
  } catch (error: any) {
    console.error(`GET /api/recipes/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch recipe" },
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
        { success: false, error: "Invalid recipe ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recipe updated successfully!",
      data: updatedRecipe,
    });
  } catch (error: any) {
    console.error(`PUT /api/recipes/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update recipe" },
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
        { success: false, error: "Invalid recipe ID format" },
        { status: 400 }
      );
    }

    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully!",
    });
  } catch (error: any) {
    console.error(`DELETE /api/recipes/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
