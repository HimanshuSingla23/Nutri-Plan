import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PantryItem from "@/models/PantryItem";
import { SAMPLE_PANTRY } from "@/lib/sampleData";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Auto-seed sample pantry items if empty
    const count = await PantryItem.countDocuments();
    if (count === 0) {
      await PantryItem.insertMany(SAMPLE_PANTRY);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "expirationDate";
    const sortOrder = searchParams.get("order") === "desc" ? -1 : 1;

    const query: any = {};

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
        { notes: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    const sortOptions: any = {};
    if (sortBy === "name") {
      sortOptions.name = sortOrder;
    } else if (sortBy === "quantity") {
      sortOptions.quantity = sortOrder;
    } else {
      // Default sort by expiration date (items expiring sooner first)
      sortOptions.expirationDate = sortOrder;
    }

    const items = await PantryItem.find(query).sort(sortOptions);

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("GET /api/pantry error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch pantry items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, quantity, unit, expirationDate, category, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Pantry item name is required" },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null || Number(quantity) < 0) {
      return NextResponse.json(
        { success: false, error: "Valid positive quantity is required" },
        { status: 400 }
      );
    }

    const newItem = await PantryItem.create({
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : "piece",
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      category: category || "Produce",
      notes: notes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: `${newItem.name} added to pantry!`,
        data: newItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/pantry error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to add pantry item" },
      { status: 500 }
    );
  }
}
