import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GroceryItem from "@/models/GroceryItem";
import MealPlan from "@/models/MealPlan";
import PantryItem from "@/models/PantryItem";
import Recipe from "@/models/Recipe";
import { categorizeIngredient } from "@/lib/utils";

/**
 * Intelligent helper to parse amount strings (e.g. "500", "1/2", "2.5", "1")
 */
function parseNumericAmount(amountStr: string): number {
  if (!amountStr) return 1;
  const str = amountStr.trim();
  if (str.includes("/")) {
    const parts = str.split("/");
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }
  const parsed = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
}

export async function GET() {
  try {
    await connectToDatabase();
    if (!Recipe) {
      // ensure model registration
    }

    // 1. Fetch all planned meals with populated recipes
    const mealPlans = await MealPlan.find({}).populate("recipeId");
    
    // 2. Fetch current pantry inventory
    const pantryItems = await PantryItem.find({});

    // 3. Fetch custom/saved grocery items from DB
    const savedGroceryItems = await GroceryItem.find({});

    // 4. Aggregate ingredients from meal plans
    const aggregatedMap = new Map<string, {
      name: string;
      totalAmount: number;
      unit: string;
      category: string;
      sourceMeals: string[];
      isPurchased: boolean;
      dbId?: string;
    }>();

    for (const plan of mealPlans) {
      const populatedRecipe = plan.recipeId as any;
      const mealTitle = populatedRecipe?.title || plan.externalMeal?.title || "Planned Meal";
      const sourceLabel = `${plan.dayOfWeek} ${plan.mealType.charAt(0).toUpperCase() + plan.mealType.slice(1)} (${mealTitle})`;

      let ingredientsList: any[] = [];
      if (populatedRecipe && Array.isArray(populatedRecipe.ingredients)) {
        ingredientsList = populatedRecipe.ingredients;
      } else if (plan.externalMeal && Array.isArray(plan.externalMeal.ingredients)) {
        ingredientsList = plan.externalMeal.ingredients;
      }

      for (const ing of ingredientsList) {
        if (!ing.name || !ing.name.trim()) continue;
        const normalizedName = ing.name.trim().toLowerCase();
        const unit = (ing.unit || "piece").trim().toLowerCase();
        const key = `${normalizedName}__${unit}`;
        const numAmount = parseNumericAmount(ing.amount);

        if (aggregatedMap.has(key)) {
          const existing = aggregatedMap.get(key)!;
          existing.totalAmount += numAmount;
          if (!existing.sourceMeals.includes(sourceLabel)) {
            existing.sourceMeals.push(sourceLabel);
          }
        } else {
          aggregatedMap.set(key, {
            name: ing.name.trim(),
            totalAmount: numAmount,
            unit: ing.unit || "piece",
            category: categorizeIngredient(ing.name),
            sourceMeals: [sourceLabel],
            isPurchased: false,
          });
        }
      }
    }

    // 5. Convert aggregated map into grocery item objects and cross-reference with pantry & saved purchase state
    const generatedItems = Array.from(aggregatedMap.values()).map((agg) => {
      // Find if user previously marked this generated item as purchased in GroceryItem collection
      const matchedSaved = savedGroceryItems.find(
        (s) => s.name.toLowerCase() === agg.name.toLowerCase() && s.source === "planner"
      );

      // Cross reference with Pantry
      const pantryMatch = pantryItems.find((p) => {
        const pName = p.name.toLowerCase();
        const gName = agg.name.toLowerCase();
        return pName === gName || pName.includes(gName) || gName.includes(pName);
      });

      let inPantryQty = 0;
      let inPantryUnit = "";
      let neededQty = agg.totalAmount;

      if (pantryMatch) {
        inPantryQty = pantryMatch.quantity;
        inPantryUnit = pantryMatch.unit;
        // If units are comparable
        if (
          !pantryMatch.unit ||
          !agg.unit ||
          pantryMatch.unit.toLowerCase() === agg.unit.toLowerCase()
        ) {
          neededQty = Math.max(0, agg.totalAmount - inPantryQty);
        }
      }

      // Format display amount cleanly (e.g. integer or rounded decimal)
      const displayAmount = Number.isInteger(agg.totalAmount)
        ? agg.totalAmount.toString()
        : agg.totalAmount.toFixed(1);

      return {
        _id: matchedSaved?._id?.toString() || `gen_${agg.name}_${agg.unit}`,
        id: matchedSaved?._id?.toString() || `gen_${agg.name}_${agg.unit}`,
        name: agg.name,
        amount: displayAmount,
        unit: agg.unit,
        category: agg.category,
        isPurchased: matchedSaved ? matchedSaved.isPurchased : false,
        source: "planner" as const,
        sourceMeals: agg.sourceMeals,
        inPantryQuantity: inPantryQty,
        inPantryUnit: inPantryUnit || agg.unit,
        neededQuantity: neededQty,
      };
    });

    // 6. Include custom grocery items created manually by user (not from planner)
    const customItems = savedGroceryItems
      .filter((s) => s.source === "custom" || s.source === "recipe")
      .map((item) => {
        const pantryMatch = pantryItems.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          _id: item._id.toString(),
          id: item._id.toString(),
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          category: item.category || categorizeIngredient(item.name),
          isPurchased: item.isPurchased,
          source: item.source,
          sourceMeals: item.sourceMeals || [],
          inPantryQuantity: pantryMatch ? pantryMatch.quantity : 0,
          inPantryUnit: pantryMatch ? pantryMatch.unit : item.unit,
          neededQuantity: parseNumericAmount(item.amount),
        };
      });

    const allItems = [...generatedItems, ...customItems];

    return NextResponse.json({
      success: true,
      count: allItems.length,
      data: allItems,
      plannerMealCount: mealPlans.length,
    });
  } catch (error: any) {
    console.error("GET /api/grocery error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate grocery list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Check if batch insert (e.g. "Add all recipe ingredients to grocery list")
    if (Array.isArray(body.items)) {
      const itemsToInsert = body.items.map((it: any) => ({
        name: it.name.trim(),
        amount: it.amount || "1",
        unit: it.unit || "piece",
        category: it.category || categorizeIngredient(it.name),
        source: it.source || "recipe",
        sourceMeals: it.sourceMeals || [it.recipeTitle || "Custom Recipe"],
        isPurchased: false,
      }));

      const inserted = await GroceryItem.insertMany(itemsToInsert);
      return NextResponse.json(
        {
          success: true,
          message: `Added ${inserted.length} ingredients to grocery list!`,
          data: inserted,
        },
        { status: 201 }
      );
    }

    const { name, amount, unit, category, source, sourceMeals } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Grocery item name is required" },
        { status: 400 }
      );
    }

    const newItem = await GroceryItem.create({
      name: name.trim(),
      amount: amount ? amount.trim() : "1",
      unit: unit ? unit.trim() : "piece",
      category: category || categorizeIngredient(name),
      source: source || "custom",
      sourceMeals: sourceMeals || [],
      isPurchased: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: `${newItem.name} added to grocery list!`,
        data: newItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/grocery error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to add grocery item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const completedOnly = searchParams.get("completedOnly") === "true";

    if (completedOnly) {
      await GroceryItem.deleteMany({ isPurchased: true });
      return NextResponse.json({
        success: true,
        message: "Completed grocery items cleared!",
      });
    }

    await GroceryItem.deleteMany({});
    return NextResponse.json({
      success: true,
      message: "Grocery list cleared!",
    });
  } catch (error: any) {
    console.error("DELETE /api/grocery error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to clear grocery items" },
      { status: 500 }
    );
  }
}
