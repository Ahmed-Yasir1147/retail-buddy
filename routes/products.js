import express from 'express';
import { getProducts, insertProduct } from '../controllers/product_controller.js';

export const productsRouter = express.Router();

productsRouter.post("/", insertProduct);

productsRouter.get("/", getProducts);