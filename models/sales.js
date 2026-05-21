import mongoose from "mongoose";


const salesSchema = new Schema({
    products: {type: mongoose.Schema.Types.Mixed},
    price: {type: Number, min: 0},
    profit: {type: Number, min: 0},
    time: {type: Date}
});

export const sales = new mongoose.model("Sales", salesSchema);