import mongoose, { Schema } from "mongoose";


const salesSchema = new Schema(
    {
        products: { type: mongoose.Schema.Types.Mixed },
        price: { type: Number, min: 0 },
        profit: { type: Number, min: 0 },
    },
    // enabling time stamps will automatically saves "createAt" & "updatedAt" times
    { timestamps: true });

export const sales = new mongoose.model("Sales", salesSchema);