import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { productsRouter } from './routes/products.js';
import { errorHandler } from './middleware/error_handler.js';
import { notFoundErrorHanlder } from './middleware/not_found_handler.js';
import { logger } from './middleware/logger.js';
import { main } from './config/database.js';
import { error } from 'console';
import { salesRouter } from './routes/sales.js';
import { dashboardRouter } from './routes/dashboard.js';

const app = express();

const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// So express can read JSON and HTML
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger);


app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/dashboard", dashboardRouter);


app.get("/test", (req, res) => {
  res.send("working");
});

app.use(notFoundErrorHanlder);
app.use(errorHandler);

main().then(() => {
    console.log("Database connected");
    app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
});
}).catch((error) => {
    console.log(`Database error: ${error}`)
});





