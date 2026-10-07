const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const { connectDB } = require("../src/config/db");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Settings = require("../src/models/Settings");
const OrderCounter = require("../src/models/OrderCounter");
const { DEFAULT_SETTINGS } = require("../src/services/settingsService");

const CATEGORIES = [
  { name: "Biryani", slug: "main", sortOrder: 1, description: "Signature dum biryanis" },
  { name: "Combos", slug: "combo", sortOrder: 2, description: "Biryani with a drink" },
  { name: "Add-ons", slug: "addon", sortOrder: 3, description: "Extras for your handi" },
  { name: "Desserts", slug: "sweet", sortOrder: 4, description: "Sweet endings" },
  { name: "Drinks", slug: "drink", sortOrder: 5, description: "Chilled drinks" },
];

const COMMON_ADDONS_NONVEG = [
  { name: "Raita", price: 20, isAvailable: true, diet: "veg" },
  { name: "Salan", price: 20, isAvailable: true, diet: "veg" },
  { name: "Extra Chicken Piece", price: 50, isAvailable: true, diet: "non-veg" },
];

const COMMON_ADDONS_VEG = [
  { name: "Raita", price: 20, isAvailable: true, diet: "veg" },
  { name: "Salan", price: 20, isAvailable: true, diet: "veg" },
  { name: "Extra Paneer Piece", price: 40, isAvailable: true, diet: "veg" },
];

function productsFor(categories) {
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
  return [
    {
      name: "Chicken Dum Biryani",
      slug: "chicken-dum-biryani",
      category: bySlug.main,
      price: 149,
      foodType: "non-veg",
      spiceLevel: "medium",
      description: "Fragrant basmati rice layered with tender chicken and aromatic spices, slow-cooked to perfection.",
      image: "chicken-dum",
      isFeatured: true,
      badge: "Bestseller",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 1,
      trackStock: true,
      dailyStock: 50,
      soldQuantity: 0,
    },
    {
      name: "Veg Dum Biryani",
      slug: "veg-dum-biryani",
      category: bySlug.main,
      price: 129,
      foodType: "veg",
      spiceLevel: "mild",
      description: "Saffron basmati layered with mixed vegetables, fried onion and mint, dum-cooked in small batches.",
      image: "veg-biryani",
      badge: "Veg",
      allowAddOns: true,
      addOns: COMMON_ADDONS_VEG,
      sortOrder: 2,
    },
    {
      name: "Chicken Tikka Biryani",
      slug: "chicken-tikka-biryani",
      category: bySlug.main,
      price: 179,
      foodType: "non-veg",
      spiceLevel: "spicy",
      description: "Charred tikka folded into saffron basmati, with fried onion and mint.",
      image: "chicken-tikka",
      badge: "Brothers Pick",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 3,
    },
    {
      name: "Egg Biryani",
      slug: "egg-biryani",
      category: bySlug.main,
      price: 99,
      foodType: "egg",
      spiceLevel: "medium",
      description: "Spiced basmati with boiled eggs, dum-cooked so the rice stays separate and fragrant.",
      image: "egg-biryani",
      allowAddOns: true,
      addOns: COMMON_ADDONS_VEG,
      sortOrder: 4,
    },
    {
      name: "Hyderabad Biryani",
      slug: "hyderabad-biryani",
      category: bySlug.main,
      price: 189,
      foodType: "non-veg",
      spiceLevel: "spicy",
      description: "A richer dum biryani with saffron rice, fried onions and a deeper spice layer.",
      image: "hyderabad-biryani",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 5,
    },
    {
      name: "Dum Biryani",
      slug: "dum-biryani",
      category: bySlug.main,
      price: 169,
      foodType: "non-veg",
      spiceLevel: "medium",
      description: "Classic dum-style biryani, sealed and slow-cooked so the rice drinks in the masala.",
      image: "dum-biryani",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 6,
    },
    {
      name: "Chicken Biryani + Coke",
      slug: "chicken-biryani-coke",
      category: bySlug.combo,
      price: 199,
      foodType: "non-veg",
      description: "Chicken Dum Biryani with a chilled Coke.",
      image: "chicken-dum",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 10,
    },
    {
      name: "Veg Biryani + Coke",
      slug: "veg-biryani-coke",
      category: bySlug.combo,
      price: 179,
      foodType: "veg",
      description: "Veg Dum Biryani with a chilled Coke.",
      image: "veg-biryani",
      allowAddOns: true,
      addOns: COMMON_ADDONS_VEG,
      sortOrder: 11,
    },
    {
      name: "Chicken Tikka Biryani + Coke",
      slug: "chicken-tikka-biryani-coke",
      category: bySlug.combo,
      price: 229,
      foodType: "non-veg",
      description: "Chicken Tikka Biryani with a chilled Coke.",
      image: "chicken-tikka",
      allowAddOns: true,
      addOns: COMMON_ADDONS_NONVEG,
      sortOrder: 12,
    },
    {
      name: "Extra Chicken Piece",
      slug: "extra-chicken",
      category: bySlug.addon,
      price: 50,
      foodType: "non-veg",
      description: "One more piece of chicken, cooked with the same masala.",
      image: "extra-chicken",
      allowAddOns: false,
      sortOrder: 20,
    },
    {
      name: "Extra Paneer Piece",
      slug: "extra-paneer",
      category: bySlug.addon,
      price: 40,
      foodType: "veg",
      description: "Soft paneer cubes, cooked with the same biryani masala.",
      image: "veg-biryani",
      allowAddOns: false,
      sortOrder: 21,
    },
    {
      name: "Raita",
      slug: "raita",
      category: bySlug.addon,
      price: 20,
      foodType: "veg",
      description: "Cool yoghurt raita to sit beside the biryani.",
      image: "raita",
      allowAddOns: false,
      sortOrder: 22,
    },
    {
      name: "Salan",
      slug: "salan",
      category: bySlug.addon,
      price: 20,
      foodType: "veg",
      description: "A small portion of salan for spooning over the rice.",
      image: "salan",
      allowAddOns: false,
      sortOrder: 23,
    },
    {
      name: "Gulab Jamun",
      slug: "gulab-jamun",
      category: bySlug.sweet,
      price: 49,
      foodType: "veg",
      description: "Warm gulab jamun, soaked in light sugar syrup.",
      image: "gulab-jamun",
      allowAddOns: false,
      sortOrder: 30,
    },
    {
      name: "Coke",
      slug: "coke",
      category: bySlug.drink,
      price: 40,
      foodType: "veg",
      description: "A chilled Coke to go with the biryani.",
      image: "coke",
      allowAddOns: false,
      sortOrder: 40,
    },
  ];
}

async function seed() {
  await connectDB();

  await OrderCounter.findOneAndUpdate(
    { key: "order" },
    { $setOnInsert: { seq: 1000 } },
    { upsert: true }
  );

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
    console.log("Settings created");
  } else {
    console.log("Settings already exist");
  }

  for (const cat of CATEGORIES) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  const categories = await Category.find();
  console.log(`Categories: ${categories.length}`);

  const products = productsFor(categories);
  for (const product of products) {
    await Product.findOneAndUpdate({ slug: product.slug }, product, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log(`Products upserted: ${products.length}`);
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
