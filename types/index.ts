export type DayOfWeek = 
  | "Monday" 
  | "Tuesday" 
  | "Wednesday" 
  | "Thursday" 
  | "Friday" 
  | "Saturday" 
  | "Sunday";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface IRecipe {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  cuisine: string;
  description?: string;
  image?: string;
  instructions: string[];
  ingredients: RecipeIngredient[];
  prepTime: number; // in minutes
  servings?: number;
  isCustom: boolean;
  videoUrl?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMealPlan {
  _id?: string;
  id?: string;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId?: string | IRecipe; // Ref to Recipe model (populated or id)
  externalMeal?: {
    id: string;
    title: string;
    image: string;
    category: string;
    cuisine: string;
    ingredients?: RecipeIngredient[];
  };
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type ExpirationStatus = 'expired' | 'expiring_soon' | 'fresh' | 'unknown';

export interface IPantryItem {
  _id?: string;
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: string | Date;
  category: string; // 'Produce' | 'Dairy' | 'Meat' | 'Pantry' | 'Spices' | 'Bakery' | 'Beverages' | 'Other'
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Computed client-side / enriched
  expirationStatus?: ExpirationStatus;
  daysUntilExpiration?: number;
}

export interface IGroceryItem {
  _id?: string;
  id?: string;
  name: string;
  amount: string;
  unit: string;
  category: string;
  isPurchased: boolean;
  source: 'planner' | 'custom' | 'recipe';
  sourceMeals?: string[]; // e.g. ["Monday Dinner: Chicken Pasta"]
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Cross-reference data with pantry
  inPantryQuantity?: number;
  inPantryUnit?: string;
  neededQuantity?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
}

export interface MealDBSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBArea {
  strArea: string;
}

export interface MealDBIngredient {
  idIngredient: string;
  strIngredient: string;
  strDescription: string;
  strType: string | null;
}
