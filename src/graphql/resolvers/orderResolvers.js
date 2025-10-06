const DataLoader = require('dataloader');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

// DataLoader for batching product fetches
const productLoader = new DataLoader(async (productIds) => {
    const products = await Product.find({ _id: { $in: productIds } });
    // Map products by id for quick lookup
    const productMap = {};
    products.forEach(product => {
        productMap[product._id.toString()] = product;
    });
    // Return products in the same order as productIds
    return productIds.map(id => productMap[id.toString()]);
});

const orderResolvers = {
    Query: {
        orders: async () => {
            return await Order.find();
        },
        order: async (_, { id }) => {
            return await Order.findById(id);
        },
    },
    Order: {
        products: async (order) => {
            // order.products is assumed to be an array of product IDs
            return productLoader.loadMany(order.products);
        },
    },
};

module.exports = orderResolvers;