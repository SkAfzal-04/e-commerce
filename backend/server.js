import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// Initialize the app
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database and cloud services
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());

// Configure CORS with specific origin
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174', // Change to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// API Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('API is working!');
});

// Handle undefined routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An error occurred', error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`😎 Server is running on http://localhost:${PORT}`);
});
