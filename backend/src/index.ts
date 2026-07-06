import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import deleteMusicRoutes from "./routes/deleteMusicRoutes";
import deleteAccountRoutes from "./routes/deleteAccountRoutes";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "https://spotify-clone-iota-drab.vercel.app",
];

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Routes
app.use("/api", deleteMusicRoutes);
app.use("/api", deleteAccountRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
