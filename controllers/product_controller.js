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
        const products = await product.find({}).lean().sort({name: 1}).collation({ locale: 'en', strength: 2 });
        res.status(200).json(products);
    } catch(error) {
        next(createError("Getting prodcuts failed", 500))
    }
}

// DELETE: Delete the given product
export const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (id) {
            const deleted = await product.deleteOne({_id: id});
            // 204 means we don't sending any response body
            res.sendStatus(204);
        } else {
            next(createError("Missing id", 400));
        }
    } catch(error) {
        next(createError("Deletion failed", 500));
    }
}