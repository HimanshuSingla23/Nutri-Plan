import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ExpirationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return "No date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDays(date: string | Date | undefined): string {
  if (!date) return "No expiration set";
  const target = new Date(date);
  if (isNaN(target.getTime())) return "Invalid date";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return `Expired ${abs} day${abs === 1 ? "" : "s"} ago`;
  }
  if (diffDays === 0) return "Expires today";
  if (diffDays === 1) return "Expires tomorrow";
  if (diffDays <= 3) return `Expires in ${diffDays} days`;
  if (diffDays <= 30) return `Expires in ${diffDays} days`;
  return `Expires in ${diffDays} days`;
}

export function getExpirationStatus(date: string | Date | undefined): {
  status: ExpirationStatus;
  days: number | null;
  label: string;
} {
  if (!date) {
    return { status: "unknown", days: null, label: "No Date" };
  }
  const target = new Date(date);
  if (isNaN(target.getTime())) {
    return { status: "unknown", days: null, label: "Invalid" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "expired",
      days: diffDays,
      label: `Expired (${Math.abs(diffDays)}d ago)`,
    };
  }
  if (diffDays <= 3) {
    return {
      status: "expiring_soon",
      days: diffDays,
      label: diffDays === 0 ? "Expires Today" : diffDays === 1 ? "Expires Tomorrow" : `Expiring (${diffDays}d)`,
    };
  }
  return {
    status: "fresh",
    days: diffDays,
    label: `Fresh (${diffDays}d left)`,
  };
}

/**
 * Standardize and parse ingredient measure/amount strings
 */
export function parseAmountAndUnit(measureStr: string): { amount: string; unit: string } {
  if (!measureStr || !measureStr.trim()) {
    return { amount: "1", unit: "item" };
  }

  const clean = measureStr.trim();
  // Regex to match e.g. "1/2 cup", "2.5 kg", "500 g", "3 tbsp", "1", "a pinch"
  const match = clean.match(/^([\d\s\/\.\-]+)\s*(.*)$/);
  if (match) {
    const amountPart = match[1].trim();
    const unitPart = match[2].trim() || "piece";
    return {
      amount: amountPart,
      unit: unitPart,
    };
  }

  return {
    amount: "1",
    unit: clean,
  };
}

/**
 * Categorize ingredient by name heuristic
 */
export function categorizeIngredient(name: string): string {
  const n = name.toLowerCase();
  if (
    n.includes("tomato") ||
    n.includes("onion") ||
    n.includes("garlic") ||
    n.includes("pepper") ||
    n.includes("spinach") ||
    n.includes("potato") ||
    n.includes("carrot") ||
    n.includes("lettuce") ||
    n.includes("cucumber") ||
    n.includes("ginger") ||
    n.includes("lemon") ||
    n.includes("avocado") ||
    n.includes("cilantro") ||
    n.includes("herb") ||
    n.includes("broccoli") ||
    n.includes("mushroom") ||
    n.includes("apple") ||
    n.includes("banana")
  ) {
    return "Produce";
  }

  if (
    n.includes("milk") ||
    n.includes("cheese") ||
    n.includes("butter") ||
    n.includes("yogurt") ||
    n.includes("cream") ||
    n.includes("paneer") ||
    n.includes("curd") ||
    n.includes("ghee")
  ) {
    return "Dairy";
  }

  if (
    n.includes("chicken") ||
    n.includes("beef") ||
    n.includes("pork") ||
    n.includes("fish") ||
    n.includes("salmon") ||
    n.includes("shrimp") ||
    n.includes("bacon") ||
    n.includes("egg") ||
    n.includes("mutton") ||
    n.includes("turkey")
  ) {
    return "Meat & Protein";
  }

  if (
    n.includes("salt") ||
    n.includes("pepper") ||
    n.includes("cumin") ||
    n.includes("turmeric") ||
    n.includes("coriander") ||
    n.includes("paprika") ||
    n.includes("cinnamon") ||
    n.includes("oregano") ||
    n.includes("chili") ||
    n.includes("masala") ||
    n.includes("cardamom")
  ) {
    return "Spices & Seasonings";
  }

  if (
    n.includes("bread") ||
    n.includes("bun") ||
    n.includes("tortilla") ||
    n.includes("pita") ||
    n.includes("bagel")
  ) {
    return "Bakery";
  }

  if (
    n.includes("rice") ||
    n.includes("pasta") ||
    n.includes("flour") ||
    n.includes("sugar") ||
    n.includes("oil") ||
    n.includes("olive oil") ||
    n.includes("sauce") ||
    n.includes("vinegar") ||
    n.includes("soy sauce") ||
    n.includes("honey") ||
    n.includes("oats") ||
    n.includes("lentil") ||
    n.includes("beans")
  ) {
    return "Pantry Staples";
  }

  return "Other";
}
