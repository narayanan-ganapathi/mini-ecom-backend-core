// Product controller
import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

export const addProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  const product = new Product({ name, price, stock });
  await product.save();
  res.status(201).json(product);
};
