const DataLoader = require('dataloader');
const Product = require('../models/Product');
const redis = require('../../config/redis.js');

/**
 * Batch function to load products by IDs.
 * @param {Array} productIds
 * @returns {Promise<Array>}
 */

async function batchProducts(productIds) {
    // Try to get products from Redis cache first
    const redisKeys = productIds.map(id => `product:${id}`);
    const cachedProducts = await redis.mget(redisKeys);

    // Parse cached products and collect missing IDs
    const productsFromCache = [];
    const missingIds = [];
    productIds.forEach((id, idx) => {
        const cached = cachedProducts[idx];
        if (cached) {
            productsFromCache.push(JSON.parse(cached));
        } else {
            productsFromCache.push(null);
            missingIds.push(id);
        }
    });

    // Fetch missing products from DB
    let productsFromDB = [];
    if (missingIds.length > 0) {
        productsFromDB = await Product.find({ _id: { $in: missingIds } });
        // Cache them in Redis
        await Promise.all(productsFromDB.map(product =>
            redis.set(`product:${product._id}`, JSON.stringify(product), 'EX', 300)
        ));
    }
    // Map DB products by ID
    const dbMap = productsFromDB.reduce((acc, product) => {
        acc[product._id] = product;
        return acc;
    }, {});

    // Merge cache and DB results in order
    return productIds.map((id, idx) => productsFromCache[idx] || dbMap[id] || null);
}

const productLoader = new DataLoader(batchProducts);
module.exports = productLoader;