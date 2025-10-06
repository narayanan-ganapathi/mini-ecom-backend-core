import express from "express";
import Product from "../models/Product.js";
import redis from "../config/redis.js";
import { invalidateProductCache, updateProductCache } from "../utils/cacheUtils.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    // Try to get products from Redis cache
    const cachedProducts = await redis.get("products:all");
    if (cachedProducts) {
      return res.json(JSON.parse(cachedProducts));
    }
    // If not cached, fetch from DB
    const products = await Product.find();
    // Cache the result in Redis for 5 minutes
    await redis.set("products:all", JSON.stringify(products), "EX", 300);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new product
router.post("/", async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const product = new Product({ name, description, price, stock, category });
    await product.save();
    // Invalidate products cache after adding new product
    await redis.del("products:all");
    await invalidateProductCache(product._id);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await updateProductCache(product);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await invalidateProductCache(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
