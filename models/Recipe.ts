import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecipeDocument extends Document {
  title: string;
  category: string;
  cuisine: string;
  description?: string;
  image?: string;
  instructions: string[];
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  prepTime: number;
  servings?: number;
  isCustom: boolean;
  videoUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema(
  {
    name: { type: String, required: [true, "Ingredient name is required"], trim: true },
    amount: { type: String, required: [true, "Amount is required"], trim: true },
    unit: { type: String, default: "piece", trim: true },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipeDocument>(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine / Area is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    },
    instructions: {
      type: [String],
      required: [true, "At least one instruction step is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0 && arr.some((s) => s.trim().length > 0),
        message: "At least one valid instruction step must be provided",
      },
    },
    ingredients: {
      type: [IngredientSchema],
      required: [true, "At least one ingredient is required"],
      validate: {
        validator: (arr: any[]) => arr.length > 0,
        message: "At least one ingredient is required",
      },
    },
    prepTime: {
      type: Number,
      required: [true, "Preparation time in minutes is required"],
      min: [1, "Prep time must be at least 1 minute"],
      max: [720, "Prep time cannot exceed 720 minutes"],
    },
    servings: {
      type: Number,
      default: 2,
      min: [1, "Servings must be at least 1"],
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add search text index for fast recipe searching
RecipeSchema.index({ title: "text", description: "text", category: "text", cuisine: "text", "ingredients.name": "text" });

const Recipe: Model<IRecipeDocument> =
  mongoose.models.Recipe || mongoose.model<IRecipeDocument>("Recipe", RecipeSchema);

export default Recipe;
