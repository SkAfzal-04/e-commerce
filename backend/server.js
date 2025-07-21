import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Routes
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/ReviewRoute.js";
import { updateRouter } from "./routes/updateRoute.js";
import { chatbotRouter } from "./routes/chatbotRoute.js";
// import migrateRefundField from "./config/migrateRefundField.js";

// App configuration
const app = express();
const port = process.env.PORT || 4000;

// Connect to services
connectDB();
connectCloudinary();

// Optional: run a migration script
// migrateRefundField();

// Middleware
app.use(express.json());

// Proper CORS setup
const allowedOrigins = ["https://e-commerce-psi-nine-50.vercel.app/" || "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Optional: log CORS origin for debugging
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// Handle preflight requests
app.options("*", cors());

// API Routes
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

// Start server
app.listen(port, () => {
  console.log(`✅ Server started on PORT: ${port}`);
});
