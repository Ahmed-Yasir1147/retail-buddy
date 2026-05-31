import { createError } from "../helpers/helpers.js";
import { product } from "../models/products.js";
import { sales } from "../models/sales.js";

// Create sale record
export const insertSale = async (req, res, next) => {
    // Structure of products   {{"id": "", "quantity": "", "name": ""}, ...}
    const products = req.body.products;
    const ids = products.map((product) => product.id);
    if (products != null) {
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
        return next(createError("Getting sales failed", 500))
    }
}

// Fetch sales
// Either lifetime, yearwise, monthwise or daywise
export const getSales = async (req, res, next) => {
    try {
        let result;
        const query = req.query;
        const year = parseInt(query.year);
        const month = parseInt(query.month);
        const day = parseInt(query.day);
        // If all year, month and day are present user want all records of that specific day
        // If only year and month, all days of that month
        // If only year, all months of that year
        // If none, all years of lifetime
        // We return two things: raw sales + summary (total sales and profit)

        // condition checks for nan and not null cause of parsing
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
            result = (await sales.aggregate([
                {
                    // Adding a new field: dateParts: {year: , month: , day: , ...}
                    $addFields: { dateParts: { $dateToParts: { date: "$createdAt" } } }
                },
                {
                    $match:
                        { "dateParts.year": year, "dateParts.month": month, "dateParts.day": day }
                },
                {
                    // we need raw sales + summary so two set of operations are required
                    $facet: {
                        sales: [],
                        summary: [
                            { $group: { _id: null, totalPrice: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }
                        ]
                    }
                }
            ]))[0];
        } else if (!Number.isNaN(year) && !Number.isNaN(month)) {
            result = (await sales.aggregate([
                { $addFields: { dateParts: { $dateToParts: { date: "$createdAt" } } } },
                { $match: { "dateParts.year": year, "dateParts.month": month } },
                { $group: { _id: "$dateParts.day", price: { $sum: "$price" }, profit: { $sum: "$profit" } } },
                // renaming _id to day
                { $project: { _id: 0, price: 1, profit: 1, day: "$_id" } },
                {
                    $facet: {
                        sales: [],
                        summary: [{ $group: { _id: null, totalPrice: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }
                        ]
                    }
                },
            ]))[0];
            // The days which don't have data are not present. So we are creating new sales 
            // with 0 profit and sales for missing days
            const s = [];
            const days = result.sales.map((sale) => sale.day);
            for (let i = 1; i <= getDays(month, year); i++) {
                if (days.includes(i)) {
                    s.push(result.sales.find((sale) => sale.day == i));
                } else {
                    s.push({ day: i, price: 0, profit: 0 });
                }
            }
            result.sales = s;
        } else if (!Number.isNaN(year)) {
            result = (await sales.aggregate([
                { $addFields: { dateParts: { $dateToParts: { date: "$createdAt" } } } },
                { $match: { "dateParts.year": year } },
                { $group: { _id: "$dateParts.month", price: { $sum: "$price" }, profit: { $sum: "$profit" } } },
                { $project: { _id: 0, price: 1, profit: 1, month: "$_id" } },
                {
                    $facet: {
                        sales: [],
                        summary: [{ $group: { _id: null, totalPrice: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }
                        ]
                    }
                },
            ]))[0];
            // The months which don't have data are not present. So we are creating new sales 
            // with 0 profit and sales for missing months
            // Also mapping month number to month name
            const s = [];
            const months = result.sales.map((sale) => sale.month);
            for (let i = 1; i <= 12; i++) {
                if (months.includes(i)) {
                    const sale = result.sales.find((sale) => sale.month == i);
                    s.push({ month: getMonthName(sale.month), price: sale.price, profit: sale.profit });
                } else {
                    s.push({ month: getMonthName(i), price: 0, profit: 0 });
                }
            }
            result.sales = s;
        } else {
            result = (await sales.aggregate([
                { $addFields: { dateParts: { $dateToParts: { date: "$createdAt" } } } },
                { $group: { _id: "$dateParts.year", price: { $sum: "$price" }, profit: { $sum: "$profit" } } },
                { $project: { _id: 0, price: 1, profit: 1, year: "$_id" } },
                {
                    $facet: {
                        sales: [],
                        summary: [{ $group: { _id: null, totalPrice: { $sum: "$price" }, totalProfit: { $sum: "$profit" } } }
                        ]
                    }
                },
            ]))[0];
        }
        // when there is no data, summary is empty
        result.summary = result.summary[0] || {
            totalPrice: 0,
            totalProfit: 0
        };
        res.status(200).json(result);
    } catch (error) {
        return next(createError(error, 500))
    }
}

// Fetch years 
export const getYears = async (req, res, next) => {
    try {
        const result = await sales.aggregate([
            { $addFields: { dateParts: { $dateToParts: { date: "$createdAt" } } } },
            { $group: { _id: "$dateParts.year", year: { $first: "$dateParts.year" } } },
        ]);
        res.status(200).json(result);
    } catch (error) {
        return next(createError("Getting years failed", 500))
    }
}


function getDays(month, year) {
    let days = 31;
    switch (month) {
        case 2:
            // checking for leap year for February
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
                days = 29;
            } else {
                days = 28;
            }
            break;
        case 4:
        case 6:
        case 9:
        case 11:
            days = 30;
    }
    return days;
}

function getMonthName(month) {
    const months = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return months[month];
}