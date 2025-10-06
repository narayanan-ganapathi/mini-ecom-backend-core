import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import redis from "../config/redis.js";
import { invalidateProductCache, updateProductCache } from "../utils/cacheUtils.js";

export const resolvers = {
  Query: {
    products: async () => {
      // Try to get products from Redis cache
      const cachedProducts = await redis.get("products:all");
      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }
      // If not cached, fetch from DB
      const products = await Product.find();
      // Cache the result in Redis for 5 minutes
      await redis.set("products:all", JSON.stringify(products), "EX", 300);
      return products;
    },
    product: async (_, { id }) => Product.findById(id),

    cart: async (_, { userId }) => {
      let cart = await Cart.findOne({ userId }).populate("items.productId");
      if (!cart) {
        cart = new Cart({ userId, items: [] });
        await cart.save();
        await cart.populate("items.productId");
      }
      const cartObj = cart.toObject();
      return {
        id: cartObj._id.toString(),
        userId: cartObj.userId,
        items: cart.items.map(item => ({
          productId: item.productId._id ? item.productId._id.toString() : item.productId.toString(),
          quantity: item.quantity,
          product: item.productId._id ? item.productId : null
        })),
        createdAt: cartObj.createdAt,
        updatedAt: cartObj.updatedAt
      };
    },

    order: async (_, { id }) => {
      const order = await Order.findById(id).populate("items.productId");
      if (!order) return null;
      return {
        ...order.toObject(),
        items: order.items.map(item => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          product: item.productId._id ? item.productId : null
        }))
      };
    },

    orders: async (_, { userId }) => {
      const orders = await Order.find({ userId }).populate("items.productId");
      return orders.map(order => ({
        ...order.toObject(),
        items: order.items.map(item => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          product: item.productId._id ? item.productId : null
        }))
      }));
    },
  },
  Mutation: {
    addProduct: async (_, { input }) => {
      const product = new Product(input);
      await product.save();
      // Invalidate products cache after adding new product
      await redis.del("products:all");
      await invalidateProductCache(product._id);
      return product;
    },
    updateProduct: async (_, { id, input }) => {
      const product = await Product.findByIdAndUpdate(id, input, { new: true });
      // Invalidate products cache after updating product
      await redis.del("products:all");
      await invalidateProductCache(id);
      await updateProductCache(product);
      return product;
    },
    deleteProduct: async (_, { id }) => {
      const result = await Product.findByIdAndDelete(id);
      // Invalidate products cache after deleting product
      await redis.del("products:all");
      await invalidateProductCache(id);
      return result ? true : false;
    },

    addToCart: async (_, { userId, productId, quantity }) => {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [{ productId, quantity }] });
      } else {
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += quantity;
        } else {
          cart.items.push({ productId, quantity });
        }
      }
      await cart.save();
      await cart.populate("items.productId");
      const cartObj = cart.toObject();
      return {
        id: cartObj._id.toString(),
        userId: cartObj.userId,
        items: cart.items.map(item => ({
          productId: item.productId._id ? item.productId._id.toString() : item.productId.toString(),
          quantity: item.quantity,
          product: item.productId._id ? item.productId : null
        })),
        createdAt: cartObj.createdAt,
        updatedAt: cartObj.updatedAt
      };
    },

    placeOrder: async (_, { userId, items, totalPrice }) => {
      const order = new Order({ userId, items, totalPrice });
      await order.save();
      await order.populate("items.productId");
      // Optionally, clear the user's cart after placing order
      await Cart.findOneAndDelete({ userId });
      return {
        ...order.toObject(),
        items: order.items.map(item => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          product: item.productId._id ? item.productId : null
        }))
      };
    },
  },
};
