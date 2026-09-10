import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGroceryItemDocument extends Document {
  name: string;
  amount: string;
  unit: string;
  category: string;
  isPurchased: boolean;
  source: "planner" | "custom" | "recipe";
  sourceMeals: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GroceryItemSchema = new Schema<IGroceryItemDocument>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    amount: {
      type: String,
      trim: true,
      default: "1",
    },
    unit: {
      type: String,
      trim: true,
      default: "piece",
    },
    category: {
      type: String,
      trim: true,
      default: "Produce",
    },
    isPurchased: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ["planner", "custom", "recipe"],
      default: "custom",
    },
    sourceMeals: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

GroceryItemSchema.index({ isPurchased: 1, category: 1 });

const GroceryItem: Model<IGroceryItemDocument> =
  mongoose.models.GroceryItem ||
  mongoose.model<IGroceryItemDocument>("GroceryItem", GroceryItemSchema);

export default GroceryItem;
