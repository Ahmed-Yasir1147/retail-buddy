import express from 'express';
import { getSales, insertSale } from '../controllers/sales_controller.js';

export const salesRouter = express.Router();

salesRouter.post("/", insertSale);

salesRouter.get("/", getSales);

