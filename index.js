// // import express from "express";  
// // import db from "./db/db.js";
// // const app = express();
// // import errorHandler from "./middleware/errorMiddleware.js";

// // import productsRoutes from "./routes/products.routes.js";
// // import userRoutes from "./routes/user.routes.js";
// // import authRoutes from './routes/auth.routes.js'
// // import categoriesRoutes from './routes/categories.routes.js'
// // import emailRoutes from './routes/email.routes.js'
// // import paymentsRoutes from './routes/payments.routes.js'
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));


// // app.use("/api/v1/products", productsRoutes);
// // app.use("/api/v1/users", userRoutes);
// // app.use('/api/v1/auth', authRoutes)
// // app.use('/api/v1/category', categoriesRoutes)
// // app.use('/api/v1/email', emailRoutes)
// // app.use('/api/v1/payments', paymentsRoutes)
// // // 404 handler
// // app.use((req, res) => {
// //     res.status(404).json({ message: 'Route not found' });
// //   });
  
// //   // error middleware (MUST BE LAST)
// // app.use(errorHandler);

// // app.listen(3000, () => {
// //     console.log("Server is running on port 3000");
// // });

// import express from "express";  
// import cors from "cors";
// import db from "./db/db.js";
// const app = express();
// import errorHandler from "./middleware/errorMiddleware.js";

// import productsRoutes from "./routes/products.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import authRoutes from './routes/auth.routes.js'
// import categoriesRoutes from './routes/categories.routes.js'
// import emailRoutes from './routes/email.routes.js'
// import paymentsRoutes from './routes/payments.routes.js'
// import checkoutRoutes from './routes/checkout.routes.js'
// // import montonioRoutes from './routes/montonio.routes.js'

// console.log("MONGO_URI:", process.env.MONGODB_CONNECTION_STRING);

// // CORS configuration
// app.use(cors({
//     origin: ['http://localhost:5173', 'https://ultimate-store.netlify.app'], // Add your frontend URLs
//     credentials: true,
//     methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));


// app.use(express.json());

// // Custom middleware to conditionally parse JSON
// app.use((req, res, next) => {
//     // Skip JSON parsing for webhook endpoint
//     if (req.originalUrl === '/api/v1/checkout/webhook') {
//         return next();
//     }
//     express.json()(req, res, next);
// });


// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/v1/products", productsRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/category', categoriesRoutes)
// app.use('/api/v1/email', emailRoutes)
// app.use('/api/v1/checkout', checkoutRoutes)
// app.use('/api/v1/payments', paymentsRoutes)
// // app.use('/api/v1/montonio', montonioRoutes)

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({ message: 'Route not found' });
// });
  
// // error middleware (MUST BE LAST)
// app.use(errorHandler);

// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });


import express from "express";  
import cors from "cors";
import db from "./db/db.js";
import errorHandler from "./middleware/errorMiddleware.js";

import productsRoutes from "./routes/products.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from './routes/auth.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import emailRoutes from './routes/email.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import checkoutRoutes from './routes/checkout.routes.js'
import orderRoutes from './routes/order.routes.js'
import { stripeWebhook } from "./controller/checkout.controller.js";
import { startOrderCleanup } from "./utils/cleanupPendingOrders.js";

const app = express();
startOrderCleanup();

app.use(cors({
    origin: ['http://localhost:5173', 'https://ultimate-store.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ⚠️ Webhook MUST be registered before express.json() — needs raw buffer
app.post('/api/v1/checkout/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/users", userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoriesRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/orders', orderRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});