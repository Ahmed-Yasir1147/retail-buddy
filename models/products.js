import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: { type: String },
        price: { type: Number, min: 0 },
        cost: { type: Number, min: 0 },
        quantity: { type: Number, min: 0 },
    }
);

export const product = new mongoose.model("Products", productSchema);