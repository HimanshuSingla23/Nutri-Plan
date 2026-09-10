import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import GroceryItem from "@/models/GroceryItem";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await GroceryItem.findByIdAndUpdate(
        id,
        { ...body, updatedAt: new Date() },
        { new: true }
      );
      if (updated) {
        return NextResponse.json({
          success: true,
          message: "Grocery item updated",
          data: updated,
        });
      }
    }

    // If ID is synthetic (e.g. gen_name_unit) or not in DB yet, create or upsert by name
    const { name, amount, unit, category, isPurchased, source, sourceMeals } = body;
    const upserted = await GroceryItem.findOneAndUpdate(
      { name: (name || id).trim(), source: source || "planner" },
      {
        name: (name || id).trim(),
        amount: amount || "1",
        unit: unit || "piece",
        category: category || "Produce",
        isPurchased: Boolean(isPurchased),
        source: source || "planner",
        sourceMeals: sourceMeals || [],
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Status updated!",
      data: upserted,
    });
  } catch (error: any) {
    console.error(`PUT /api/grocery/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update grocery item" },
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

    if (mongoose.Types.ObjectId.isValid(id)) {
      await GroceryItem.findByIdAndDelete(id);
    } else {
      // If synthetic ID, delete by name
      const cleanName = id.replace(/^gen_/, "").split("_")[0];
      await GroceryItem.deleteMany({ name: new RegExp(`^${cleanName}$`, "i") });
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from grocery list",
    });
  } catch (error: any) {
    console.error(`DELETE /api/grocery/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete grocery item" },
      { status: 500 }
    );
  }
}
