import express from 'express';
import { deleteProduct, getProducts, insertProduct } from '../controllers/product_controller.js';

export const productsRouter = express.Router();

productsRouter.post("/", insertProduct);

productsRouter.get("/", getProducts);

productsRouter.delete("/:id", deleteProduct);