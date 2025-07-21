import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/ReviewRoute.js";
import { updateRouter } from "./routes/updateRoute.js";
import { chatbotRouter } from "./routes/chatbotRoute.js";

// App setup
const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

// CORS configuration
const allowedOrigins = [
  "https://e-commerce-psi-nine-50.vercel.app",  // your deployed frontend
  "http://localhost:3000"                       // local frontend (dev)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());

// API routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/productUpdate", updateRouter);
app.use("/api/chatbot", chatbotRouter);

// Root route
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Server start
app.listen(port, () => {
  console.log(`✅ Server started on PORT: ${port}`);
});
