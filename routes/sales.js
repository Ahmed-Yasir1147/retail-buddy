import express from 'express';
import {  getTodaySales, insertSale } from '../controllers/sales_controller.js';

export const salesRouter = express.Router();

salesRouter.post("/", insertSale);

salesRouter.get("/", getTodaySales);

