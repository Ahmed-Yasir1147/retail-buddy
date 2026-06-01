import { createError } from "../helpers/helpers.js";
import { product } from "../models/products.js"
import { sales } from "../models/sales.js";

// Fetch dashboard summary
// Products: Total products, Best product, Stock status
// Sales: Lifetime, last 365 days, last 30 days, today
export const getDashboardProducts = async (req, res, next) => {
    try {
        const totalProducts = await product.find().lean();
        const totalProductsCount = totalProducts.length;
        const stockOutProducts = totalProducts.filter((product) => product.stock == 0);
        const stockOutProductsCount = stockOutProducts.length;
        const stockActiveProductsCount = totalProductsCount - stockOutProductsCount;
        const products = await sales.aggregate([
            // products is present inside array of sales 
            { $unwind: "$products" },
            { $group: { 
                _id: "$products.id", 
                profit: { $sum: { $multiply: ["$products.profit", "$products.quantity"] } }, 
                name: {$first: "$products.name"} 
            }},
            { $sort: {"profit": -1}}
        ]);

        res.status(200).json({
            totalProductsCount: totalProductsCount,
            stockActiveProductsCount: stockActiveProductsCount,
            stockOutProductsCount: stockOutProductsCount,
            bestProduct: {name: products[0].name, profit: products[0].profit},
            products: products 
        })
    } catch (error) {
        return next(createError(new Error(error, 500)));
    };
}

export const getDashboardSales = async (req, res, next) => {
    try {
        const totalAgg = (await sales.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }
        ]))[0];
        const now = new Date();
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear - 1);
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const yearAgg = (await sales.aggregate([
            { $match: { createdAt: { $gte: yearAgo, $lte: now } } },
            { $group: { _id: null, yearSales: { $sum: "$price" }, yearProfit: { $sum: "$profit" } } }
        ]))[0];
        const monthAgg = (await sales.aggregate([
            { $match: { createdAt: { $gte: monthAgo, $lte: now } } },
            { $group: { _id: null, monthSales: { $sum: "$price" }, monthProfit: { $sum: "$profit" } } }
        ]))[0];
        const dayAgg = (await sales.aggregate([
            { $match: { createdAt: { $gte: todayStart, $lte: now } } },
            { $group: { _id: null, daySales: { $sum: "$price" }, dayProfit: { $sum: "$profit" } } }
        ]))[0];
        // here null aware operator and optional 0 is necessary cause the agg's could be null
        res.status(200).json({
            totalSales: totalAgg?.totalSales || 0,
            totalProfit: totalAgg?.totalProfit || 0,
            yearSales: yearAgg?.yearSales || 0,
            yearProfit: yearAgg?.yearProfit || 0,
            monthSales: monthAgg?.monthSales || 0,
            monthProfit: monthAgg?.monthProfit || 0,
            daySales: dayAgg?.daySales || 0,
            dayProfit: dayAgg?.dayProfit || 0,
        });
    } catch (error) {
        return next(createError(new Error(error, 500)));
    }
}