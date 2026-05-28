import { createError } from "../helpers/helpers.js";
import { product } from "../models/products.js";
import { sales } from "../models/sales.js";

// Create sale record
export const insertSale = async (req, res, next) => {
    // Structure of products   {{"id": "", "quantity": "", "name": ""}, ...}
    const products = req.body.products;
    const ids = products.map((product) => product.id);
    if (products) {
        try {
            // We first fetch the products because we need price and profit
            const fetchedProducts = await product.find({ _id: { $in: ids } });
            let totalPrice = 0;
            let totalProfit = 0;
            // Triverse through fetch products, and match corrresponding sale product 
            for (const fetchedProduct of fetchedProducts) {
                const p = products.find((p) => p.id == fetchedProduct.id);
                // quantity can't be greater than stock
                if (p.quantity <= fetchedProduct.stock) {
                    totalPrice += fetchedProduct.price * p.quantity;
                    const profit = fetchedProduct.price - fetchedProduct.cost;
                    totalProfit += profit * p.quantity;
                    // product stock has to be udpated 
                    fetchedProduct.stock -= p.quantity;
                    await fetchedProduct.save();
                } else {
                    return next(createError(`${fetchedProduct.name} stock not available`, 400));
                }
            }

            const sale = await sales.create({ products: products, price: totalPrice, profit: totalProfit });
            res.status(201).json(sale);
        } catch (error) {
            return next(createError("Sale creation failed", 500))
        }
    } else {
        return next(createError(`Missing parameters`, 400));
    }
}

// Fetch today sale record from newest to oldest
export const getTodaySales = async (req, res, next) => {
    try {
        const today = new Date();
        // we just need today's date not current hour, min or seconds
        today.setHours(0, 0, 0, 0);
        const now = new Date();
        const result = await sales.find({ createdAt: { $gte: today, $lte: now } }).lean();
        const summary = await sales.aggregate([
            { $match: { createdAt: { $gte: today, $lte: now } } }, 
            { $group: { _id: null, totalPrice: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }]);
        res.status(200).json({ sales: result, summary: summary[0] });
    } catch (error) {
        console.log(error);
        return next(createError("Getting sales failed", 500))
    }
}