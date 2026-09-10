import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPantryItemDocument extends Document {
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: Date;
  category: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PantryItemSchema = new Schema<IPantryItemDocument>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 1,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      default: "piece",
    },
    expirationDate: {
      type: Date,
      required: false,
    },
    category: {
      type: String,
      trim: true,
      default: "Produce",
      enum: [
        "Produce",
        "Dairy",
        "Meat & Protein",
        "Pantry Staples",
        "Spices & Seasonings",
        "Bakery",
        "Beverages",
        "Frozen",
        "Other",
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

PantryItemSchema.index({ name: 1, category: 1 });
PantryItemSchema.index({ expirationDate: 1 });

const PantryItem: Model<IPantryItemDocument> =
  mongoose.models.PantryItem ||
  mongoose.model<IPantryItemDocument>("PantryItem", PantryItemSchema);

export default PantryItem;
