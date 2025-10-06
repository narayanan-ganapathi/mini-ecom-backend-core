import redis from "../config/redis.js";

export async function invalidateProductCache(productId) {
  const key = `product:${productId}`;
  await redis.del(key);
  console.log(`🗑️ Cache invalidated for ${key}`);
}

export async function updateProductCache(product) {
  const key = `product:${product._id}`;
  await redis.set(key, JSON.stringify(product), "EX", 60);
  console.log(`✅ Cache updated for ${key}`);
}
