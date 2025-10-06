import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Place Order
router.post("/", async (req, res) => {
  try {
    const { userId, items, totalPrice } = req.body;
    const order = new Order({ userId, items, totalPrice });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Orders by User
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate("items.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
