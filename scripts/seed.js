/* eslint-disable @typescript-eslint/no-var-requires */
const dns = require("dns");
const mongoose = require("mongoose");

// Resolve querySrv EREFUSED issues on networks/ISPs that fail to resolve SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Graceful fallback if custom DNS servers cannot be set
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nutriplan";

const SAMPLE_RECIPES = [
  {
    title: "Paneer Rice Bowl",
    category: "Vegetarian",
    cuisine: "Indian",
    description: "A nourishing, protein-packed bowl featuring golden spiced paneer cubes, fragrant basmati rice, sautéed bell peppers, and fresh cilantro mint chutney.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    prepTime: 25,
    servings: 2,
    isCustom: true,
    ingredients: [
      { name: "Paneer", amount: "200", unit: "g" },
      { name: "Basmati Rice", amount: "1", unit: "cup" },
      { name: "Bell Pepper", amount: "1", unit: "piece" },
      { name: "Onion", amount: "1", unit: "piece" },
      { name: "Olive Oil", amount: "1", unit: "tbsp" },
      { name: "Garam Masala", amount: "1", unit: "tsp" },
      { name: "Turmeric Powder", amount: "0.5", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" },
    ],
    instructions: [
      "Rinse basmati rice thoroughly and cook with 2 cups of water and a pinch of salt until fluffy.",
      "Cut paneer into bite-sized cubes. Toss with turmeric, garam masala, and salt.",
      "Heat olive oil in a skillet over medium heat and pan-fry paneer cubes until golden brown on all sides (approx 4-5 mins).",
      "In the same skillet, sauté sliced onions and bell peppers for 3-4 minutes until crisp-tender.",
      "Assemble bowls with a base of warm rice, topped with spiced paneer, sautéed veggies, and a garnish of fresh herbs.",
    ],
    notes: "Can be served with Greek yogurt or mint chutney for extra zest.",
  },
  {
    title: "Creamy Garlic Chicken Pasta",
    category: "Pasta",
    cuisine: "Italian",
    description: "Tender seasoned chicken breast tossed with al dente penne pasta in a silky garlic parmesan cream sauce.",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281050?auto=format&fit=crop&w=800&q=80",
    prepTime: 30,
    servings: 3,
    isCustom: true,
    ingredients: [
      { name: "Chicken Breast", amount: "400", unit: "g" },
      { name: "Penne Pasta", amount: "250", unit: "g" },
      { name: "Heavy Cream", amount: "1", unit: "cup" },
      { name: "Garlic", amount: "4", unit: "cloves" },
      { name: "Parmesan Cheese", amount: "50", unit: "g" },
      { name: "Olive Oil", amount: "2", unit: "tbsp" },
      { name: "Italian Herbs", amount: "1", unit: "tsp" },
      { name: "Black Pepper", amount: "0.5", unit: "tsp" },
    ],
    instructions: [
      "Bring a large pot of salted water to a boil and cook penne pasta according to package instructions until al dente.",
      "Slice chicken breast into strips, season with salt, black pepper, and Italian herbs.",
      "Heat olive oil in a pan over medium-high heat. Sear chicken strips for 6-8 minutes until cooked through and golden, then set aside.",
      "In the same pan, lower heat and sauté minced garlic for 1 minute until fragrant. Pour in heavy cream and simmer gently.",
      "Stir in grated parmesan cheese until melted and smooth. Toss in drained pasta and cooked chicken until well coated.",
    ],
    notes: "Garnish with freshly chopped parsley and chili flakes if desired.",
  },
  {
    title: "Fresh Garden Vegetable Sandwich",
    category: "Vegetarian",
    cuisine: "American",
    description: "A crunchy, crisp, multi-layered sandwich filled with fresh cucumber, ripe tomatoes, creamy avocado, crisp lettuce, and a light herb spread on toasted multigrain bread.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    prepTime: 12,
    servings: 1,
    isCustom: true,
    ingredients: [
      { name: "Multigrain Bread", amount: "2", unit: "slices" },
      { name: "Avocado", amount: "0.5", unit: "piece" },
      { name: "Cucumber", amount: "0.5", unit: "piece" },
      { name: "Tomato", amount: "1", unit: "piece" },
      { name: "Lettuce", amount: "2", unit: "leaves" },
      { name: "Cheddar Cheese", amount: "1", unit: "slice" },
      { name: "Dijon Mustard", amount: "1", unit: "tsp" },
      { name: "Black Pepper", amount: "1", unit: "pinch" },
    ],
    instructions: [
      "Lightly toast the multigrain bread slices to desired crispness.",
      "Mash avocado with a pinch of salt and pepper, then spread evenly on one slice of bread. Spread Dijon mustard on the other.",
      "Layer cheddar cheese, crisp lettuce leaves, sliced tomatoes, and cucumber rounds.",
      "Close the sandwich, slice diagonally, and serve immediately.",
    ],
    notes: "Add pickled red onions or sprouts for an extra gourmet touch.",
  },
  {
    title: "Fluffy Masala Omelette",
    category: "Breakfast",
    cuisine: "Indian",
    description: "Classic street-style Indian masala omelette loaded with finely chopped red onions, green chilies, cilantro, and warm aromatic spices.",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
    prepTime: 10,
    servings: 1,
    isCustom: true,
    ingredients: [
      { name: "Eggs", amount: "3", unit: "pieces" },
      { name: "Onion", amount: "0.5", unit: "piece" },
      { name: "Tomato", amount: "0.5", unit: "piece" },
      { name: "Green Chili", amount: "1", unit: "piece" },
      { name: "Fresh Cilantro", amount: "2", unit: "tbsp" },
      { name: "Butter", amount: "1", unit: "tbsp" },
      { name: "Turmeric Powder", amount: "0.25", unit: "tsp" },
      { name: "Salt", amount: "0.5", unit: "tsp" },
    ],
    instructions: [
      "Finely chop the onion, tomato, green chili, and fresh cilantro.",
      "In a mixing bowl, crack the eggs. Add chopped veggies, turmeric powder, and salt. Whisk vigorously for 1 minute until frothy.",
      "Melt butter in a non-stick pan over medium heat.",
      "Pour the egg mixture evenly into the skillet. Cook for 2-3 minutes until the base sets, then carefully flip and cook the other side for 1-2 minutes.",
      "Serve hot with toasted bread or pav.",
    ],
    notes: "Adjust green chilies according to your spice preference.",
  },
  {
    title: "Berry Chia Overnight Oats",
    category: "Breakfast",
    cuisine: "International",
    description: "A creamy make-ahead breakfast combining rolled oats, chia seeds, almond milk, Greek yogurt, and layered fresh berries with a drizzle of honey.",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    prepTime: 8,
    servings: 1,
    isCustom: true,
    ingredients: [
      { name: "Rolled Oats", amount: "0.5", unit: "cup" },
      { name: "Almond Milk", amount: "0.75", unit: "cup" },
      { name: "Chia Seeds", amount: "1", unit: "tbsp" },
      { name: "Greek Yogurt", amount: "2", unit: "tbsp" },
      { name: "Honey", amount: "1", unit: "tbsp" },
      { name: "Fresh Berries", amount: "0.5", unit: "cup" },
    ],
    instructions: [
      "In a mason jar or glass bowl, combine rolled oats, chia seeds, almond milk, Greek yogurt, and honey.",
      "Stir well until all ingredients are thoroughly combined and seeds are distributed.",
      "Seal the jar with a lid and refrigerate overnight (or for at least 4 hours).",
      "In the morning, top with fresh strawberries, blueberries, and a dash of cinnamon before enjoying cold.",
    ],
    notes: "Keeps fresh in the refrigerator for up to 4 days.",
  },
];

async function seed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    const db = mongoose.connection.db;
    
    // Clear and insert recipes
    const recipesColl = db.collection("recipes");
    await recipesColl.deleteMany({ isCustom: true });
    const res = await recipesColl.insertMany(SAMPLE_RECIPES);
    console.log(`✓ Inserted ${res.insertedCount} sample custom recipes.`);

    console.log("✓ Database seeding complete!");
  } catch (err) {
    console.error("Seed script error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
