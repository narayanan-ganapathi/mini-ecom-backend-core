import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedProducts = [
  { name: "Laptop", description: "14-inch business laptop", price: 75000, stock: 10, category: "Electronics" },
  { name: "Headphones", description: "Noise-cancelling headphones", price: 3500, stock: 50, category: "Electronics" },
  { name: "Coffee Mug", description: "Ceramic mug", price: 250, stock: 100, category: "Kitchen" },
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany(); // clear old
    await Product.insertMany(seedProducts);
    console.log("✅ Test products inserted!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
