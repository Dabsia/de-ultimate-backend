import express from "express";  
import db from "./db/db.js";
const app = express();
import errorHandler from "./middleware/errorMiddleware.js";

import productsRoutes from "./routes/products.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from './routes/auth.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import emailRoutes from './routes/email.routes.js'
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/users", userRoutes);
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/category', categoriesRoutes)
app.use('/api/v1/email', emailRoutes)
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  // error middleware (MUST BE LAST)
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});