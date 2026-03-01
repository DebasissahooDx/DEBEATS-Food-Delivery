import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// --- App Config ---
const app = express();
const port = process.env.PORT || 8080;

// --- Database Connection ---
connectDB();

// --- Middleware ---

// 1. JSON Parser
app.use(express.json());

// 2. Cookie Parser (Must be before routes to read Refresh Tokens)
app.use(cookieParser());

// 3. CORS Configuration (Fixed for withCredentials)
// This explicitly allows your Vite frontend and permits cookie sharing.
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // No trailing slash, no wildcard '*'
    credentials: true,               // Allows frontend to send/receive cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token", "Authorization"] // Allow your custom 'token' header
}));

// --- API Endpoints ---

// Static folder for images
app.use("/images", express.static("uploads"));

// Route Handlers
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter); // Handles register, verify-otp, login, refresh
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health Check
app.get("/", (req, res) => {
    res.send("API Working");
});

// --- Server Startup ---
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});