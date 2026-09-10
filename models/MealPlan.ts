import mongoose, { Schema, Document, Model } from "mongoose";
import { DayOfWeek, MealType } from "@/types";

export interface IMealPlanDocument extends Document {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId?: mongoose.Types.ObjectId;
  externalMeal?: {
    id: string;
    title: string;
    image: string;
    category: string;
    cuisine: string;
    ingredients?: {
      name: string;
      amount: string;
      unit: string;
    }[];
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlanDocument>(
  {
    dayOfWeek: {
      type: String,
      required: [true, "Day of week is required"],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      enum: ["breakfast", "lunch", "dinner"],
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: false,
    },
    externalMeal: {
      id: { type: String },
      title: { type: String },
      image: { type: String },
      category: { type: String },
      cuisine: { type: String },
      ingredients: [
        {
          name: { type: String },
          amount: { type: String },
          unit: { type: String },
        },
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on dayOfWeek + mealType so each slot can only have one recipe at a time
MealPlanSchema.index({ dayOfWeek: 1, mealType: 1 }, { unique: true });

const MealPlan: Model<IMealPlanDocument> =
  mongoose.models.MealPlan ||
  mongoose.model<IMealPlanDocument>("MealPlan", MealPlanSchema);

export default MealPlan;
