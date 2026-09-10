import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import PantryItem from "@/models/PantryItem";

export async function GET(
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

    const item = await PantryItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Pantry item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error(`GET /api/pantry/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch pantry item" },
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
    const updateData: any = { ...body, updatedAt: new Date() };
    if (body.quantity !== undefined) {
      updateData.quantity = Math.max(0, Number(body.quantity));
    }
    if (body.expirationDate) {
      updateData.expirationDate = new Date(body.expirationDate);
    }

    const updated = await PantryItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Pantry item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pantry item updated!",
      data: updated,
    });
  } catch (error: any) {
    console.error(`PUT /api/pantry/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update pantry item" },
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

    const deleted = await PantryItem.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Pantry item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${deleted.name} removed from pantry!`,
    });
  } catch (error: any) {
    console.error(`DELETE /api/pantry/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete pantry item" },
      { status: 500 }
    );
  }
}
