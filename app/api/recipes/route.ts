import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { SAMPLE_RECIPES } from "@/lib/sampleData";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const cuisine = searchParams.get("cuisine");
    const isCustom = searchParams.get("isCustom");

    // Auto-seed sample custom recipes if database has no custom recipes yet
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(SAMPLE_RECIPES);
    }

    const query: any = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
        { cuisine: { $regex: search.trim(), $options: "i" } },
        { "ingredients.name": { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (cuisine && cuisine !== "All") {
      query.cuisine = { $regex: new RegExp(`^${cuisine}$`, "i") };
    }

    if (isCustom !== null && isCustom !== undefined && isCustom !== "") {
      query.isCustom = isCustom === "true";
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error: any) {
    console.error("GET /api/recipes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch recipes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { title, category, cuisine, prepTime, instructions, ingredients } = body;

    // Server-side validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Recipe title is required." },
        { status: 400 }
      );
    }

    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, error: "Category is required." },
        { status: 400 }
      );
    }

    if (!cuisine || !cuisine.trim()) {
      return NextResponse.json(
        { success: false, error: "Cuisine is required." },
        { status: 400 }
      );
    }

    if (!prepTime || Number(prepTime) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid preparation time (in minutes) is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one ingredient is required." },
        { status: 400 }
      );
    }

    // Validate ingredient elements
    for (const ing of ingredients) {
      if (!ing.name || !ing.name.trim() || !ing.amount || !ing.amount.trim()) {
        return NextResponse.json(
          { success: false, error: "All ingredients must have a valid name and amount." },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one instruction step is required." },
        { status: 400 }
      );
    }

    const newRecipe = await Recipe.create({
      ...body,
      prepTime: Number(prepTime),
      servings: Number(body.servings || 2),
      isCustom: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Recipe created successfully!",
        data: newRecipe,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/recipes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create recipe",
      },
      { status: 500 }
    );
  }
}
