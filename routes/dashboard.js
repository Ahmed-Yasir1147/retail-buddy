import express from "express";
import { getDashboardProducts, getDashboardSales } from "../controllers/dashboard_controller.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/products", getDashboardProducts);

dashboardRouter.get("/sales", getDashboardSales);