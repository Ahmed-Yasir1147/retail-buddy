import { createError } from "../helpers/helpers.js";
import { product } from "../models/products.js"

// POST : Insert a product
export const insertProduct = async (req, res, next) => {
    const name = req.body.name;
    const price = req.body.price;
    const cost = req.body.cost;
    const quantity = req.body.quantity;
    if (name && price && cost && quantity) {
        try {
           const newProduct = await product.create({ name: req.body.name, price: req.body.price, cost: req.body.cost, quantity: req.body.quantity });
           res.status(201).json(newProduct);
        } catch(error) {
            next(createError("Creation failed", 500));
        }
    } else {
        next(createError("Missing parameters", 400));
    }
}

// GET: Fetches all products
export const getProducts = async (req, res, next) => {
    try {
        const products = await product.find({}).lean();
        res.status(200).json(products);
    } catch(error) {
        next(createError("Getting prodcuts failed", 500))
    }
}